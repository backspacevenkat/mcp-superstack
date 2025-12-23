/**
 * Polydev MCP Server Wrapper
 *
 * Multi-model AI perspectives from GPT-4, Claude, Gemini, and Grok.
 *
 * @example
 * ```typescript
 * import { polydev } from 'mcp-superstack';
 *
 * await polydev.initialize();
 *
 * const perspectives = await polydev.getPerspectives(
 *   'What is the best way to structure a React app?'
 * );
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'polydev';

/**
 * Initialize the Polydev server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Get multiple AI model perspectives on a prompt
 */
export async function getPerspectives(prompt: string, models?: string[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_perspectives', {
    prompt,
    models,
  });
}

/**
 * List available AI models
 */
export async function listModels(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_available_models', {});
}

/**
 * Send a prompt to a specific CLI (Claude, Codex, or Gemini)
 */
export async function sendCLIPrompt(cli: 'claude' | 'codex' | 'gemini', prompt: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'polydev.send_cli_prompt', {
    cli,
    prompt,
  });
}

/**
 * Get CLI status
 */
export async function getCLIStatus(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'polydev.get_cli_status', {});
}
