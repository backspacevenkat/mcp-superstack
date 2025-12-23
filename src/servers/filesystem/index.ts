/**
 * Filesystem MCP Server Wrapper
 *
 * File system read/write operations (restricted to allowed directories).
 *
 * @example
 * ```typescript
 * import { filesystem } from 'mcp-superstack';
 *
 * await filesystem.initialize();
 *
 * const files = await filesystem.listDirectory('/path/to/dir');
 * const content = await filesystem.readFile('/path/to/file.txt');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'filesystem';

/**
 * Initialize the Filesystem server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * List directory contents
 */
export async function listDirectory(path: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_directory', {
    path,
  });
}

/**
 * Read file contents
 */
export async function readFile(path: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'read_file', {
    path,
  });
}

/**
 * Write file contents
 */
export async function writeFile(path: string, content: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'write_file', {
    path,
    content,
  });
}

/**
 * Create a directory
 */
export async function createDirectory(path: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'create_directory', {
    path,
  });
}

/**
 * Move/rename a file
 */
export async function moveFile(source: string, destination: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'move_file', {
    source,
    destination,
  });
}

/**
 * Get file info
 */
export async function getFileInfo(path: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_file_info', {
    path,
  });
}

/**
 * Search files by pattern
 */
export async function searchFiles(path: string, pattern: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'search_files', {
    path,
    pattern,
  });
}
