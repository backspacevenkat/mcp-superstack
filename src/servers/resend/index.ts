/**
 * Resend MCP Server Wrapper
 *
 * Email sending via Resend.
 *
 * @example
 * ```typescript
 * import { resend } from 'mcp-superstack';
 *
 * await resend.initialize();
 *
 * await resend.sendEmail(
 *   'recipient@example.com',
 *   'Hello!',
 *   '<p>This is the email body</p>'
 * );
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'resend';

/**
 * Initialize the Resend server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Send an email
 */
export async function sendEmail(to: string, subject: string, html: string, from?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'send_email', {
    to,
    subject,
    html,
    from,
  });
}
