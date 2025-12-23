/**
 * MCP Server Configurations
 *
 * This file contains all server configurations for both stdio and HTTP-based MCP servers.
 * Credentials are loaded from environment variables via .env file.
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

/**
 * Configuration for stdio-based MCP servers
 */
export interface StdioServerConfig {
  /** Command to run (e.g., 'npx', 'node', 'uvx') */
  command: string;
  /** Command arguments */
  args: string[];
  /** Environment variables to pass to the process */
  env?: Record<string, string>;
  /** Description of what this server does */
  description?: string;
  /** List of tools this server provides */
  tools?: string[];
}

/**
 * Configuration for HTTP-based MCP servers
 */
export interface HTTPServerConfig {
  /** Server URL */
  url: string;
  /** HTTP headers (including auth) */
  headers?: Record<string, string>;
  /** Description of what this server does */
  description?: string;
  /** List of tools this server provides */
  tools?: string[];
}

/**
 * Stdio-based MCP server configurations
 */
export const stdioServers: Record<string, StdioServerConfig> = {
  // ============================================
  // CORE SERVERS
  // ============================================

  memory: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    description: 'Knowledge graph for storing entities and relationships',
    tools: ['create_entities', 'create_relations', 'search_nodes', 'read_graph'],
  },

  seq_thinking: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    description: 'Step-by-step reasoning and analysis',
    tools: ['sequentialthinking'],
  },

  filesystem: {
    command: 'npx',
    args: [
      '-y',
      '@modelcontextprotocol/server-filesystem',
      process.env.FILESYSTEM_ALLOWED_PATH || '/tmp',
    ],
    description: 'File system read/write operations',
    tools: ['read_file', 'write_file', 'list_directory'],
  },

  // ============================================
  // DATABASE & STORAGE
  // ============================================

  supabase: {
    command: 'npx',
    args: [
      '-y',
      '@supabase/mcp-server-supabase@latest',
      '--access-token',
      process.env.SUPABASE_ACCESS_TOKEN || '',
      '--project-ref',
      process.env.SUPABASE_PROJECT_REF || '',
    ],
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    description: 'PostgreSQL database operations via Supabase',
    tools: ['execute_sql', 'list_tables', 'apply_migration'],
  },

  upstash: {
    command: 'npx',
    args: [
      '-y',
      '@upstash/mcp-server',
      'run',
      process.env.UPSTASH_EMAIL || '',
      process.env.UPSTASH_API_KEY || '',
    ],
    description: 'Redis cache operations via Upstash',
    tools: ['redis_get', 'redis_set', 'redis_command'],
  },

  // ============================================
  // VERSION CONTROL
  // ============================================

  github: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '',
    },
    description: 'GitHub API operations (repos, issues, PRs)',
    tools: ['search_repositories', 'create_issue', 'create_pull_request', 'get_file_contents'],
  },

  git: {
    command: 'uvx',
    args: ['mcp-server-git'],
    description: 'Local git operations',
    tools: ['git_status', 'git_commit', 'git_diff', 'git_log'],
  },

  // ============================================
  // AI & MULTI-MODEL
  // ============================================

  polydev: {
    command: 'npx',
    args: ['-y', 'polydev-ai@latest'],
    env: {
      POLYDEV_USER_TOKEN: process.env.POLYDEV_USER_TOKEN || '',
    },
    description: 'Multi-model AI perspectives (GPT-4, Claude, Gemini, Grok)',
    tools: ['get_perspectives', 'list_available_models'],
  },

  // ============================================
  // DOCUMENTATION & RESEARCH
  // ============================================

  context7: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
    description: 'Library documentation (React, Next.js, etc.)',
    tools: ['resolve_library_id', 'get_library_docs'],
  },

  deepwiki: {
    command: 'npx',
    args: ['-y', 'mcp-deepwiki@latest'],
    description: 'Wikipedia search and knowledge',
    tools: ['search_wikipedia'],
  },

  perplexity: {
    command: 'node',
    args: [process.env.PERPLEXITY_MCP_PATH || './custom-servers/perplexity/index.js'],
    env: {
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
    },
    description: 'AI-powered search via Perplexity',
    tools: ['perplexity_search'],
  },

  // ============================================
  // CODE EDITING
  // ============================================

  morpho: {
    command: 'npx',
    args: ['-y', '@morphllm/morphmcp'],
    env: {
      MORPH_API_KEY: process.env.MORPH_API_KEY || '',
      ENABLED_TOOLS: 'edit_file,warpgrep_codebase_search',
      WORKSPACE_MODE: 'true',
    },
    description: 'Fast code editing (10k+ tokens/sec) and semantic search',
    tools: ['edit_file', 'warpgrep_codebase_search'],
  },

  // ============================================
  // COMMUNICATION
  // ============================================

  resend: {
    command: 'node',
    args: [process.env.RESEND_MCP_PATH || './custom-servers/resend/index.js'],
    env: {
      RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    },
    description: 'Email sending via Resend',
    tools: ['send_email'],
  },
};

/**
 * HTTP-based MCP server configurations
 */
export const httpServers: Record<string, HTTPServerConfig> = {
  // ============================================
  // SEARCH & RESEARCH
  // ============================================

  exa: {
    url: `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY || ''}`,
    headers: {
      'Content-Type': 'application/json',
    },
    description: 'Semantic web search and code documentation',
    tools: ['web_search_exa', 'exa-code'],
  },

  // ============================================
  // INFRASTRUCTURE
  // ============================================

  vercel: {
    url: process.env.VERCEL_MCP_URL || 'https://mcp.vercel.com',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN || ''}`,
    },
    description: 'Vercel deployment and project management',
    tools: ['deploy', 'list_deployments', 'get_deployment'],
  },

  stripe: {
    url: 'https://mcp.stripe.com',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.STRIPE_API_KEY || ''}`,
    },
    description: 'Stripe payment and subscription management',
    tools: ['create_payment_intent', 'list_customers', 'create_subscription'],
  },
};

/**
 * Get all server names
 */
export function getAllServerNames(): string[] {
  return [...Object.keys(stdioServers), ...Object.keys(httpServers)];
}

/**
 * Check if a server is HTTP-based
 */
export function isHTTPServer(name: string): boolean {
  return name in httpServers;
}

/**
 * Get server config by name
 */
export function getServerConfig(name: string): StdioServerConfig | HTTPServerConfig | null {
  return stdioServers[name] || httpServers[name] || null;
}
