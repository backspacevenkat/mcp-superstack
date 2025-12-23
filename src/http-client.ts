/**
 * HTTP MCP Client Manager
 *
 * Manages connections to HTTP-based MCP servers. Handles:
 * - Lazy initialization
 * - Connection management
 * - JSON-RPC over HTTP
 */

import { httpServers, type HTTPServerConfig } from './config.js';

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * HTTP MCP Client
 */
class HTTPMCPClient {
  private config: HTTPServerConfig;
  private requestId = 0;
  private initialized = false;
  private serverInfo: unknown = null;

  constructor(private name: string, config: HTTPServerConfig) {
    this.config = config;
  }

  /**
   * Send a JSON-RPC request
   */
  private async sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params,
    };

    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: {
        ...this.config.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const json: JSONRPCResponse = await response.json();

    if (json.error) {
      throw new Error(`MCP Error ${json.error.code}: ${json.error.message}`);
    }

    return json.result;
  }

  /**
   * Initialize the connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const result = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: `mcp-superstack-${this.name}`,
        version: '1.0.0',
      },
    });

    this.serverInfo = result;
    this.initialized = true;
  }

  /**
   * List available tools
   */
  async listTools(): Promise<unknown> {
    await this.initialize();
    return this.sendRequest('tools/list');
  }

  /**
   * Call a tool
   */
  async callTool(toolName: string, args: Record<string, unknown> = {}): Promise<unknown> {
    await this.initialize();
    const result = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    });

    // Extract content from result
    if (result && typeof result === 'object' && 'content' in result) {
      const content = (result as { content: Array<{ type: string; text: string }> }).content;
      if (Array.isArray(content) && content.length === 1 && content[0].type === 'text') {
        try {
          return JSON.parse(content[0].text);
        } catch {
          return content[0].text;
        }
      }
      return content;
    }

    return result;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get server info
   */
  getServerInfo(): unknown {
    return this.serverInfo;
  }
}

/**
 * HTTP Client Manager
 */
class HTTPClientManager {
  private clients: Map<string, HTTPMCPClient> = new Map();

  /**
   * Get or create a client for a server
   */
  getClient(serverName: string): HTTPMCPClient {
    if (this.clients.has(serverName)) {
      return this.clients.get(serverName)!;
    }

    const config = httpServers[serverName];
    if (!config) {
      throw new Error(`Unknown HTTP server: ${serverName}. Available: ${Object.keys(httpServers).join(', ')}`);
    }

    const client = new HTTPMCPClient(serverName, config);
    this.clients.set(serverName, client);
    return client;
  }

  /**
   * Check if a server is connected
   */
  isConnected(serverName: string): boolean {
    const client = this.clients.get(serverName);
    return client?.isInitialized() || false;
  }

  /**
   * Disconnect a specific server (just removes from cache for HTTP)
   */
  disconnect(serverName: string): void {
    this.clients.delete(serverName);
  }

  /**
   * Disconnect all servers
   */
  disconnectAll(): void {
    this.clients.clear();
  }

  /**
   * Get list of connected servers
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.entries())
      .filter(([_, client]) => client.isInitialized())
      .map(([name]) => name);
  }
}

// Singleton instance
const manager = new HTTPClientManager();

/**
 * Get the HTTP client manager instance
 */
export function getHTTPClientManager(): HTTPClientManager {
  return manager;
}

/**
 * Initialize an HTTP server
 */
export async function initializeHTTPServer(serverName: string): Promise<void> {
  const client = manager.getClient(serverName);
  await client.initialize();
}

/**
 * Call a tool on an HTTP MCP server
 */
export async function callHTTPMCPTool(
  serverName: string,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const client = manager.getClient(serverName);
  return client.callTool(toolName, args);
}

/**
 * List available tools on an HTTP server
 */
export async function listHTTPTools(serverName: string): Promise<unknown> {
  const client = manager.getClient(serverName);
  return client.listTools();
}
