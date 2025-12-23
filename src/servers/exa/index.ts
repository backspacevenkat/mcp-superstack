/**
 * Exa MCP Server Wrapper
 *
 * Semantic web search and code documentation lookup.
 *
 * @example
 * ```typescript
 * import { exa } from 'mcp-superstack';
 *
 * await exa.initialize();
 *
 * // Web search
 * const results = await exa.search('React hooks best practices', {
 *   numResults: 5,
 *   type: 'deep'
 * });
 *
 * // Code documentation
 * const docs = await exa.getCodeContext('TypeScript generics', 5000);
 * ```
 */

import { initializeHTTPServer, callHTTPMCPTool } from '../../http-client.js';

const SERVER_NAME = 'exa';

/**
 * Initialize the Exa server
 */
export async function initialize(): Promise<void> {
  await initializeHTTPServer(SERVER_NAME);
}

/**
 * Search options
 */
export interface SearchOptions {
  /** Number of results to return (default: 5) */
  numResults?: number;
  /** Search type: 'auto', 'deep', or 'fast' (default: 'auto') */
  type?: 'auto' | 'deep' | 'fast';
  /** Live crawl preference (default: 'preferred') */
  livecrawl?: 'always' | 'preferred' | 'never';
  /** Include text content in results */
  includeText?: boolean;
}

/**
 * Perform a web search
 */
export async function search(query: string, options: SearchOptions = {}): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'web_search_exa', {
    query,
    numResults: options.numResults || 5,
    type: options.type || 'auto',
    livecrawl: options.livecrawl || 'preferred',
    text: options.includeText !== false,
  });
}

/**
 * Get code documentation and examples
 */
export async function getCodeContext(query: string, maxTokens?: number): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'exa-code', {
    query,
    maxTokens: maxTokens || 5000,
  });
}

/**
 * Find similar content to a URL
 */
export async function findSimilar(url: string, numResults?: number): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'find_similar', {
    url,
    numResults: numResults || 5,
  });
}

/**
 * Get contents of specific URLs
 */
export async function getContents(urls: string[]): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'get_contents', {
    urls,
  });
}
