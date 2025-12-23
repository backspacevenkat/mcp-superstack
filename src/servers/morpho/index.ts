/**
 * Morpho MCP Server Wrapper
 *
 * Fast code editing (10k+ tokens/sec) and semantic code search.
 *
 * @example
 * ```typescript
 * import { morpho } from 'mcp-superstack';
 *
 * await morpho.initialize();
 *
 * // Fast code editing
 * await morpho.editFile('/path/to/file.ts', 'old code', 'new code');
 *
 * // Semantic code search
 * const results = await morpho.search('authentication middleware');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'morpho';

/**
 * Initialize the Morpho server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Edit a file with fast code transformation
 */
export async function editFile(
  targetFile: string,
  oldCode: string,
  newCode: string,
  instructions?: string
): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'edit_file', {
    target_file: targetFile,
    code_edit: `${oldCode} → ${newCode}`,
    instructions,
  });
}

/**
 * Search code semantically
 */
export async function search(query: string, directory?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'warpgrep_codebase_search', {
    query,
    directory,
  });
}

/**
 * Alias for search
 */
export const codeSearch = search;
