#!/usr/bin/env node
/**
 * Polydev Stdio Wrapper v2.1 for Codex CLI
 *
 * This wrapper solves Codex CLI's MCP timeout issues by:
 * 1. Returning tools/list INSTANTLY (no network call)
 * 2. Handling requests CONCURRENTLY (allows keep-alive pings during long tool calls)
 * 3. Properly handling MCP notifications (no response for notifications)
 * 4. Forwarding actual tool calls to the remote Polydev API
 *
 * Copy this file to ~/.codex/polydev-stdio-wrapper.js
 *
 * Usage in ~/.codex/config.toml:
 *   [mcp_servers.polydev]
 *   command = "/opt/homebrew/bin/node"  # or: /Users/YOU/.nvm/versions/node/v22.20.0/bin/node
 *   args = ["/Users/YOUR_USERNAME/.codex/polydev-stdio-wrapper.js"]
 *   env = { POLYDEV_USER_TOKEN = "pd_your_token_here", POLYDEV_DEBUG = "0" }
 *
 *   [mcp_servers.polydev.timeouts]
 *   tool_timeout = 180
 *   session_timeout = 600
 *
 * Set POLYDEV_DEBUG = "1" to enable debug logging to stderr.
 */
'use strict';

const SERVER_URL = process.env.POLYDEV_MCP_URL || 'https://www.polydev.ai/api/mcp';
const TOKEN = process.env.POLYDEV_USER_TOKEN;
const DEBUG = process.env.POLYDEV_DEBUG === '1';

// Redirect console to stderr (stdout is for JSON-RPC only)
const log = DEBUG ? (...args) => console.error('[polydev]', ...args) : () => {};
console.log = console.error;
console.info = console.error;
console.warn = console.error;
console.debug = console.error;

if (!TOKEN) {
  console.error('POLYDEV_USER_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Local tools definition for INSTANT response
 * This bypasses the network call for tools/list which Codex times out on
 */
const TOOLS = [
  {
    name: 'get_perspectives',
    description: 'Get multiple AI perspectives on a prompt using Polydev (GPT-4, Claude, Gemini, Grok)',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The prompt to get perspectives on'
        },
        models: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: specific models to use'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'list_available_models',
    description: 'List all available AI models',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

/**
 * Forward request to remote Polydev API with timeout
 */
async function forward(request) {
  log('Forwarding request:', request.method, request.id);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 min timeout

  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'polydev-stdio-wrapper/2.0.0'
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    const text = await response.text();
    clearTimeout(timeoutId);

    log('Response received, length:', text.length);

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON from server: ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(`Remote MCP error ${response.status}: ${text.slice(0, 200)}`);
    }

    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after 180 seconds');
    }
    throw err;
  }
}

/**
 * Write response to stdout (thread-safe)
 */
function respond(message) {
  const json = JSON.stringify(message);
  log('Sending response, length:', json.length, 'id:', message.id);
  process.stdout.write(json + '\n');
}

/**
 * Handle a single MCP request
 */
async function handle(request) {
  const { method, id, params } = request || {};
  log('Handling:', method, 'id:', id);

  // Initialize - CRITICAL: Protocol version must match what Codex expects
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-06-18',  // Codex CLI v0.77.0+ requires this version
        capabilities: { tools: {} },
        serverInfo: { name: 'polydev-stdio', version: '2.1.0' }
      }
    };
  }

  // Notifications/initialized - no response needed
  if (method === 'notifications/initialized') {
    log('Got initialized notification');
    return null; // Don't send response for notifications
  }

  // Ping/pong for keep-alive
  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  // Return tools/list LOCALLY for instant response
  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  }

  // Forward tools/call to remote server
  if (method === 'tools/call') {
    log('Tool call:', params?.name);
    return await forward(request);
  }

  // Unknown method
  if (method) {
    log('Unknown method:', method);
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
  }

  return { jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid request' } };
}

// ============================================
// Track pending requests for clean exit
// ============================================

let pendingRequests = 0;
let stdinEnded = false;

function checkExit() {
  if (stdinEnded && pendingRequests === 0) {
    log('All requests complete, exiting');
    process.exit(0);
  }
}

/**
 * Process a single line (request) - runs CONCURRENTLY
 */
async function processLine(line) {
  if (!line.trim()) return;

  pendingRequests++;
  try {
    const request = JSON.parse(line);
    const response = await handle(request);
    if (response !== null) { // null means no response needed (notification)
      respond(response);
    }
  } catch (err) {
    log('Error processing request:', err.message);
    respond({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: err.message }
    });
  } finally {
    pendingRequests--;
    checkExit();
  }
}

// ============================================
// Stdio Processing
// ============================================

process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  // Process each line CONCURRENTLY (don't await in loop)
  for (const line of lines) {
    processLine(line); // Fire and forget - don't block on each request
  }
});

process.stdin.on('end', () => {
  log('stdin ended');
  stdinEnded = true;
  checkExit();
});

// Handle errors gracefully
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  // Don't exit - let the request error handling deal with it
});

log('Wrapper started, waiting for requests...');
