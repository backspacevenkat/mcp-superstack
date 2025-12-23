/**
 * Stripe MCP Server Wrapper
 *
 * Payment and subscription management via Stripe.
 *
 * @example
 * ```typescript
 * import { stripe } from 'mcp-superstack';
 *
 * await stripe.initialize();
 *
 * const customers = await stripe.listCustomers();
 * await stripe.createPaymentIntent(1000, 'usd');
 * ```
 */

import { initializeHTTPServer, callHTTPMCPTool } from '../../http-client.js';

const SERVER_NAME = 'stripe';

/**
 * Initialize the Stripe server
 */
export async function initialize(): Promise<void> {
  await initializeHTTPServer(SERVER_NAME);
}

/**
 * Create a payment intent
 */
export async function createPaymentIntent(amount: number, currency: string): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'create_payment_intent', {
    amount,
    currency,
  });
}

/**
 * List customers
 */
export async function listCustomers(limit?: number): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'list_customers', {
    limit: limit || 10,
  });
}

/**
 * Create a customer
 */
export async function createCustomer(email: string, name?: string): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'create_customer', {
    email,
    name,
  });
}

/**
 * Create a subscription
 */
export async function createSubscription(customerId: string, priceId: string): Promise<unknown> {
  return callHTTPMCPTool(SERVER_NAME, 'create_subscription', {
    customer: customerId,
    price: priceId,
  });
}
