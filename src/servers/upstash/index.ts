/**
 * Upstash MCP Server Wrapper
 *
 * Redis cache operations via Upstash.
 *
 * @example
 * ```typescript
 * import { upstash } from 'mcp-superstack';
 *
 * await upstash.initialize();
 *
 * await upstash.set('my-db', 'key', 'value');
 * const value = await upstash.get('my-db', 'key');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'upstash';

/**
 * Initialize the Upstash server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Get a value from Redis
 */
export async function get(database: string, key: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'redis_get', {
    database,
    key,
  });
}

/**
 * Set a value in Redis
 */
export async function set(database: string, key: string, value: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'redis_set', {
    database,
    key,
    value,
  });
}

/**
 * Run a Redis command
 */
export async function command(database: string, cmd: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'redis_command', {
    database,
    command: cmd,
  });
}

/**
 * List databases
 */
export async function listDatabases(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_databases', {});
}
