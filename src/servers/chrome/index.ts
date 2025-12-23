/**
 * Chrome MCP Server Wrapper
 *
 * Chrome DevTools automation.
 *
 * @example
 * ```typescript
 * import { chrome } from 'mcp-superstack';
 *
 * await chrome.initialize();
 *
 * // Browser automation
 * await chrome.navigate('https://example.com');
 * const screenshot = await chrome.screenshot();
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'chrome';

/**
 * Initialize the Chrome server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Navigate to a URL
 */
export async function navigate(url: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'navigate', {
    url,
  });
}

/**
 * Take a screenshot
 */
export async function screenshot(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'screenshot', {});
}

/**
 * Click an element
 */
export async function click(selector: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'click', {
    selector,
  });
}

/**
 * Type text
 */
export async function type(selector: string, text: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'type', {
    selector,
    text,
  });
}

/**
 * Get page content
 */
export async function getContent(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_content', {});
}
