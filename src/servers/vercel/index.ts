/**
 * Vercel MCP Server Wrapper
 *
 * Vercel deployment and project management.
 *
 * @example
 * ```typescript
 * import { vercel } from 'mcp-superstack';
 *
 * await vercel.initialize();
 *
 * const deployments = await vercel.listDeployments();
 * await vercel.deploy('production');
 * ```
 */

import { initializeHTTPServer, callHTTPMCPTool } from '../../http-client.js';

const SERVER_NAME = 'vercel';

/**
 * Initialize the Vercel server
 */
export async function initialize(): Promise<void> {
  await initializeHTTPServer(SERVER_NAME);
}

/**
 * Deploy to Vercel
 */
export async function deploy(target?: 'production' | 'preview', projectId?: string): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'deploy', {
    target: target || 'preview',
    projectId,
  });
}

/**
 * List deployments
 */
export async function listDeployments(projectId?: string, limit?: number): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'list_deployments', {
    projectId,
    limit: limit || 10,
  });
}

/**
 * Get a specific deployment
 */
export async function getDeployment(deploymentId: string): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'get_deployment', {
    deploymentId,
  });
}

/**
 * List projects
 */
export async function listProjects(): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'list_projects', {});
}
