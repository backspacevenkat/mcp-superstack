/**
 * Supabase MCP Server Wrapper
 *
 * PostgreSQL database operations via Supabase.
 *
 * @example
 * ```typescript
 * import { supabase } from 'mcp-superstack';
 *
 * await supabase.initialize();
 *
 * const users = await supabase.executeSQL('SELECT * FROM users LIMIT 10');
 * const tables = await supabase.listTables();
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'supabase';

/**
 * Initialize the Supabase server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Execute a SQL query
 */
export async function executeSQL(query: string, params?: unknown[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'execute_sql', {
    query,
    params,
  });
}

/**
 * List all tables in the database
 */
export async function listTables(schema?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_tables', {
    schema: schema || 'public',
  });
}

/**
 * Apply a database migration
 */
export async function applyMigration(name: string, sql: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'apply_migration', {
    name,
    sql,
  });
}

/**
 * List migrations
 */
export async function listMigrations(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_migrations', {});
}

/**
 * Get project information
 */
export async function getProject(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_project', {});
}

/**
 * List database extensions
 */
export async function listExtensions(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_extensions', {});
}

/**
 * Generate TypeScript types from schema
 */
export async function generateTypes(schemas?: string[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'generate_typescript_types', {
    schemas: schemas || ['public'],
  });
}

/**
 * Get logs
 */
export async function getLogs(type?: string, limit?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_logs', {
    type: type || 'api',
    limit: limit || 100,
  });
}
