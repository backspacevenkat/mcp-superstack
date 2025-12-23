/**
 * Stdio MCP Client Manager
 *
 * Manages connections to stdio-based MCP servers. Handles:
 * - Lazy initialization (only connects when first used)
 * - Connection pooling
 * - Automatic cleanup
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { stdioServers, type StdioServerConfig } from './config.js';

/**
 * Manages multiple MCP client connections
 */
class StdioClientManager {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StdioClientTransport> = new Map();
  private initializing: Map<string, Promise<Client>> = new Map();

  /**
   * Get or create a client for a server
   * Uses singleton pattern with lazy initialization
   */
  async getClient(serverName: string): Promise<Client> {
    // Return existing client if available
    if (this.clients.has(serverName)) {
      return this.clients.get(serverName)!;
    }

    // Return in-progress initialization if one exists
    if (this.initializing.has(serverName)) {
      return this.initializing.get(serverName)!;
    }

    // Start new initialization
    const initPromise = this.createClient(serverName);
    this.initializing.set(serverName, initPromise);

    try {
      const client = await initPromise;
      this.initializing.delete(serverName);
      return client;
    } catch (error) {
      this.initializing.delete(serverName);
      throw error;
    }
  }

  /**
   * Create a new client connection
   */
  private async createClient(serverName: string): Promise<Client> {
    const config = stdioServers[serverName];
    if (!config) {
      throw new Error(`Unknown stdio server: ${serverName}. Available: ${Object.keys(stdioServers).join(', ')}`);
    }

    // Create transport
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: { ...process.env, ...config.env } as Record<string, string>,
    });

    // Create client
    const client = new Client(
      { name: `mcp-superstack-${serverName}`, version: '1.0.0' },
      { capabilities: {} }
    );

    // Connect
    await client.connect(transport);

    // Store references
    this.clients.set(serverName, client);
    this.transports.set(serverName, transport);

    return client;
  }

  /**
   * Check if a server is connected
   */
  isConnected(serverName: string): boolean {
    return this.clients.has(serverName);
  }

  /**
   * Disconnect a specific server
   */
  async disconnect(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error(`Error closing ${serverName}:`, err);
      }
      this.clients.delete(serverName);
      this.transports.delete(serverName);
    }
  }

  /**
   * Disconnect all servers
   */
  async disconnectAll(): Promise<void> {
    const closePromises = Array.from(this.clients.entries()).map(async ([name, client]) => {
      try {
        await client.close();
      } catch (err) {
        console.error(`Error closing ${name}:`, err);
      }
    });

    await Promise.all(closePromises);
    this.clients.clear();
    this.transports.clear();
  }

  /**
   * Get list of connected servers
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }
}

// Singleton instance
const manager = new StdioClientManager();

/**
 * Get the client manager instance
 */
export function getClientManager(): StdioClientManager {
  return manager;
}

/**
 * Initialize a stdio server (connects if not already connected)
 */
export async function initializeServer(serverName: string): Promise<void> {
  await manager.getClient(serverName);
}

/**
 * Call a tool on a stdio MCP server
 */
export async function callMCPTool(
  serverName: string,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const client = await manager.getClient(serverName);
  const result = await client.callTool({ name: toolName, arguments: args });

  // Extract content from result
  if (result.content && Array.isArray(result.content)) {
    if (result.content.length === 1 && result.content[0].type === 'text') {
      try {
        return JSON.parse(result.content[0].text);
      } catch {
        return result.content[0].text;
      }
    }
    return result.content;
  }

  return result;
}

/**
 * List available tools on a server
 */
export async function listTools(serverName: string): Promise<unknown> {
  const client = await manager.getClient(serverName);
  return client.listTools();
}

/**
 * Cleanup all connections (call on process exit)
 */
export async function cleanup(): Promise<void> {
  await manager.disconnectAll();
}

// Handle process exit
process.on('beforeExit', async () => {
  await cleanup();
});
