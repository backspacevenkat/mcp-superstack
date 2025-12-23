/**
 * Perplexity MCP Server Wrapper
 *
 * AI-powered search via Perplexity.
 *
 * @example
 * ```typescript
 * import { perplexity } from 'mcp-superstack';
 *
 * await perplexity.initialize();
 *
 * const result = await perplexity.search('Latest developments in AI');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'perplexity';

/**
 * Initialize the Perplexity server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Search with Perplexity AI
 */
export async function search(query: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'perplexity_search', {
    query,
  });
}
