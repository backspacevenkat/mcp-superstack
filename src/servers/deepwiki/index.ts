/**
 * DeepWiki MCP Server Wrapper
 *
 * Wikipedia search and knowledge lookup.
 *
 * @example
 * ```typescript
 * import { deepwiki } from 'mcp-superstack';
 *
 * await deepwiki.initialize();
 *
 * const result = await deepwiki.search('quantum computing');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'deepwiki';

/**
 * Initialize the DeepWiki server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Search Wikipedia
 */
export async function search(query: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'search', {
    query,
  });
}

/**
 * Read a Wikipedia page
 */
export async function read(repoPath: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'read_wiki_structure', {
    repoPath,
  });
}
