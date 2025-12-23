/**
 * Git MCP Server Wrapper
 *
 * Local git operations.
 *
 * @example
 * ```typescript
 * import { git } from 'mcp-superstack';
 *
 * await git.initialize();
 *
 * const status = await git.status('/path/to/repo');
 * await git.commit('/path/to/repo', 'feat: add new feature');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'git';

/**
 * Initialize the Git server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Get repository status
 */
export async function status(path?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_status', {
    path,
  });
}

/**
 * Create a commit
 */
export async function commit(path: string, message: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_commit', {
    path,
    message,
  });
}

/**
 * Get diff
 */
export async function diff(path?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_diff', {
    path,
  });
}

/**
 * Get commit log
 */
export async function log(path?: string, maxCount?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_log', {
    path,
    maxCount: maxCount || 10,
  });
}

/**
 * List branches
 */
export async function branch(path?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_branch', {
    path,
  });
}

/**
 * Checkout a branch or commit
 */
export async function checkout(ref: string, path?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_checkout', {
    ref,
    path,
  });
}

/**
 * Stage files
 */
export async function add(files: string[], path?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_add', {
    files,
    path,
  });
}

/**
 * Reset staged files
 */
export async function reset(path?: string, hard?: boolean): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'git_reset', {
    path,
    hard,
  });
}
