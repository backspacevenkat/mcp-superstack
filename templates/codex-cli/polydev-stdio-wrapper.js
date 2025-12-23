#!/usr/bin/env node
/**
 * Polydev Stdio Wrapper for Codex CLI
 *
 * This wrapper solves Codex CLI's short MCP handshake timeout by:
 * 1. Returning tools/list INSTANTLY (no network call)
 * 2. Forwarding actual tool calls to the remote Polydev API
 *
 * Copy this file to ~/.codex/polydev-stdio-wrapper.js
 *
 * Usage in ~/.codex/config.toml:
 *   [mcp_servers.polydev]
 *   command = "/opt/homebrew/bin/node"
 *   args = ["/Users/YOUR_USERNAME/.codex/polydev-stdio-wrapper.js"]
 *   env = { POLYDEV_USER_TOKEN = "your_token_here" }
 */
'use strict';

const SERVER_URL = process.env.POLYDEV_MCP_URL || 'https://www.polydev.ai/api/mcp';
const TOKEN = process.env.POLYDEV_USER_TOKEN;

// Ensure stdout stays JSON-RPC only (redirect console to stderr)
console.log = console.error;
console.info = console.error;
console.warn = console.error;
console.debug = console.error;

if (!TOKEN) {
  console.error('POLYDEV_USER_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Forward request to remote Polydev API
 */
async function forward(request) {
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
      'User-Agent': 'polydev-stdio-wrapper/1.0.0'
    },
    body: JSON.stringify(request)
  });

  const text = await response.text();
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
}

/**
 * Write response to stdout
 */
function respond(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
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
 * Handle incoming MCP requests
 */
async function handle(request) {
  const { method, id } = request || {};

  // Handle initialize locally (instant)
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'polydev-stdio', version: '1.0.0' }
      }
    };
  }

  // Handle tools/list locally (instant) - KEY FIX for Codex timeout
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    };
  }

  // Forward all other methods (tools/call, etc.) to remote server
  if (method) {
    return await forward(request);
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found' }
  };
}

// ============================================
// Async Exit Handling
// ============================================
// Node.js exits when stdin closes, but we need to wait for pending async operations.
// Track pending requests and only exit when all are complete.

let pendingRequests = 0;
let stdinEnded = false;

function checkExit() {
  if (stdinEnded && pendingRequests === 0) {
    process.exit(0);
  }
}

// ============================================
// Stdio Processing
// ============================================

process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;

    pendingRequests++;
    try {
      const request = JSON.parse(line);
      const response = await handle(request);
      respond(response);
    } catch (err) {
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
});

process.stdin.on('end', () => {
  stdinEnded = true;
  checkExit();
});
