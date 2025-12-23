/**
 * GitHub MCP Server Wrapper
 *
 * GitHub API operations for repositories, issues, and pull requests.
 *
 * @example
 * ```typescript
 * import { github } from 'mcp-superstack';
 *
 * await github.initialize();
 *
 * const repos = await github.searchRepositories('MCP typescript');
 * await github.createIssue('owner', 'repo', 'Bug title', 'Bug description');
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'github';

/**
 * Initialize the GitHub server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Search repositories
 */
export async function searchRepositories(query: string, perPage?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'search_repositories', {
    query,
    per_page: perPage || 10,
  });
}

/**
 * Search code
 */
export async function searchCode(query: string, perPage?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'search_code', {
    query,
    per_page: perPage || 10,
  });
}

/**
 * Search issues
 */
export async function searchIssues(query: string, perPage?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'search_issues', {
    query,
    per_page: perPage || 10,
  });
}

/**
 * Get file contents from a repository
 */
export async function getFileContents(owner: string, repo: string, path: string, branch?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_file_contents', {
    owner,
    repo,
    path,
    branch,
  });
}

/**
 * Create a new issue
 */
export async function createIssue(owner: string, repo: string, title: string, body?: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'create_issue', {
    owner,
    repo,
    title,
    body,
  });
}

/**
 * Create a pull request
 */
export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string,
  body?: string
): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'create_pull_request', {
    owner,
    repo,
    title,
    head,
    base,
    body,
  });
}

/**
 * List commits on a branch
 */
export async function listCommits(owner: string, repo: string, sha?: string, perPage?: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'list_commits', {
    owner,
    repo,
    sha,
    per_page: perPage || 10,
  });
}

/**
 * Get a specific issue
 */
export async function getIssue(owner: string, repo: string, issueNumber: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_issue', {
    owner,
    repo,
    issue_number: issueNumber,
  });
}

/**
 * Get a specific pull request
 */
export async function getPullRequest(owner: string, repo: string, prNumber: number): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'get_pull_request', {
    owner,
    repo,
    pull_number: prNumber,
  });
}
