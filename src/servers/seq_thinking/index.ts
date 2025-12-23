/**
 * Sequential Thinking MCP Server Wrapper
 *
 * Step-by-step reasoning and analysis.
 *
 * @example
 * ```typescript
 * import { seqThinking } from 'mcp-superstack';
 *
 * await seqThinking.initialize();
 *
 * const analysis = await seqThinking.analyze('How should I structure this API?', 5);
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'seq_thinking';

/**
 * Initialize the Sequential Thinking server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Perform sequential thinking analysis
 */
export async function analyze(problem: string, steps?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'sequentialthinking', {
    problem,
    steps: steps || 5,
  });
}

/**
 * Alias for analyze
 */
export const think = analyze;
