/**
 * Context7 MCP Server Wrapper
 *
 * Library documentation for React, Next.js, and more.
 *
 * @example
 * ```typescript
 * import { context7 } from 'mcp-superstack';
 *
 * await context7.initialize();
 *
 * const libId = await context7.resolveLibraryId('react');
 * const docs = await context7.getLibraryDocs(libId);
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'context7';

/**
 * Initialize the Context7 server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Resolve a library name to its ID
 */
export async function resolveLibraryId(libraryName: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'resolve_library_id', {
    libraryName,
  });
}

/**
 * Get library documentation
 */
export async function getLibraryDocs(libraryId: string, topic?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_library_docs', {
    context7CompatibleLibraryID: libraryId,
    topic,
  });
}
