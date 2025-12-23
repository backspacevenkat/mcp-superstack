/**
 * MCP Superstack
 *
 * Unified MCP execution layer for AI coding assistants.
 * Works with Claude Code, Codex CLI, Cline, and more.
 *
 * @example
 * ```typescript
 * import { exa, supabase, polydev } from 'mcp-superstack';
 *
 * // Initialize servers
 * await Promise.all([
 *   exa.initialize(),
 *   supabase.initialize(),
 *   polydev.initialize()
 * ]);
 *
 * // Use Exa for web search
 * const results = await exa.search('React hooks best practices');
 *
 * // Use Supabase for database
 * const users = await supabase.executeSQL('SELECT * FROM users LIMIT 10');
 *
 * // Use Polydev for multi-model AI
 * const perspectives = await polydev.getPerspectives('How should I structure this API?');
 * ```
 */

// ============================================
// CLIENT EXPORTS
// ============================================

// Stdio client management
export {
  getClientManager,
  initializeServer,
  callMCPTool,
  listTools,
  cleanup,
} from './client.js';

// HTTP client management
export {
  getHTTPClientManager,
  initializeHTTPServer,
  callHTTPMCPTool,
  listHTTPTools,
} from './http-client.js';

// ============================================
// CONFIG EXPORTS
// ============================================

export {
  stdioServers,
  httpServers,
  getAllServerNames,
  isHTTPServer,
  getServerConfig,
  type StdioServerConfig,
  type HTTPServerConfig,
} from './config.js';

// ============================================
// SERVER MODULE EXPORTS
// ============================================

// Research & Search
export * as exa from './servers/exa/index.js';
export * as deepwiki from './servers/deepwiki/index.js';
export * as context7 from './servers/context7/index.js';
export * as perplexity from './servers/perplexity/index.js';

// Version Control
export * as github from './servers/github/index.js';
export * as git from './servers/git/index.js';

// Database & Storage
export * as supabase from './servers/supabase/index.js';
export * as memory from './servers/memory/index.js';
export * as upstash from './servers/upstash/index.js';

// AI & Multi-Model
export * as polydev from './servers/polydev/index.js';

// Code Editing
export * as morpho from './servers/morpho/index.js';

// File System
export * as filesystem from './servers/filesystem/index.js';

// Reasoning
export * as seqThinking from './servers/seq_thinking/index.js';
export * as seq_thinking from './servers/seq_thinking/index.js'; // Alias

// Communication
export * as resend from './servers/resend/index.js';

// Infrastructure
export * as vercel from './servers/vercel/index.js';
export * as stripe from './servers/stripe/index.js';

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Initialize multiple servers in parallel
 */
export async function initializeServers(serverNames: string[]): Promise<void> {
  const { isHTTPServer } = await import('./config.js');
  const { initializeServer } = await import('./client.js');
  const { initializeHTTPServer } = await import('./http-client.js');

  await Promise.all(
    serverNames.map((name) =>
      isHTTPServer(name) ? initializeHTTPServer(name) : initializeServer(name)
    )
  );
}

/**
 * Initialize all available servers
 */
export async function initializeAll(): Promise<void> {
  const { getAllServerNames } = await import('./config.js');
  await initializeServers(getAllServerNames());
}

/**
 * Call a tool on any server (auto-detects stdio vs HTTP)
 */
export async function callTool(
  serverName: string,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const { isHTTPServer } = await import('./config.js');

  if (isHTTPServer(serverName)) {
    const { callHTTPMCPTool } = await import('./http-client.js');
    return callHTTPMCPTool(serverName, toolName, args);
  } else {
    const { callMCPTool } = await import('./client.js');
    return callMCPTool(serverName, toolName, args);
  }
}
