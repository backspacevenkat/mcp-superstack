# MCP Superstack

> Unified MCP execution layer for AI coding assistants. One codebase to rule them all.

**MCP Superstack** provides a single, consistent interface to 20+ MCP (Model Context Protocol) servers for use with Claude Code, Codex CLI, and any MCP-compatible AI assistant.

## Features

- **20+ MCP Servers**: Exa, GitHub, Supabase, Vercel, Stripe, Memory, and more
- **Unified API**: Same interface for all servers - `await server.method()`
- **Dual Transport**: Supports both stdio and HTTP MCP servers
- **Ready-to-Use Templates**: CLAUDE.md files for auto-invocation
- **Codex CLI Support**: Pre-configured with timeout fixes
- **TypeScript**: Full type definitions included

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/mcp-superstack.git
cd mcp-superstack

# Install dependencies
npm install

# Run setup wizard
npm run setup

# Build
npm run build
```

## Usage

### In Claude Code / Any Node.js Environment

```typescript
import { exa, polydev, supabase } from 'mcp-superstack';

// Initialize servers (only needed once)
await Promise.all([
  exa.initialize(),
  polydev.initialize(),
  supabase.initialize()
]);

// Web search
const results = await exa.search('MCP best practices', { numResults: 5 });

// Multi-model AI perspectives
const perspectives = await polydev.getPerspectives(
  'Should I use Redis or PostgreSQL for session storage?'
);

// Database queries
const users = await supabase.executeSQL('SELECT * FROM users LIMIT 10');
```

### For Codex CLI

```bash
# Run Codex setup
npm run setup:codex

# This will:
# 1. Create ~/.codex/config.toml with all MCP servers
# 2. Install polydev-stdio-wrapper.js (fixes timeout issues)
# 3. Configure authentication for all services
```

## Available Servers

### Research & Search

| Server | Description | Key Methods |
|--------|-------------|-------------|
| **exa** | Semantic web search | `search()`, `getCodeContext()`, `findSimilar()` |
| **github** | Repository management | `searchRepositories()`, `createIssue()`, `createPullRequest()` |
| **deepwiki** | Wikipedia search | `search()` |
| **context7** | Library documentation | `resolveLibraryId()`, `getLibraryDocs()` |
| **perplexity** | AI-powered search | `search()` |

### Data & Storage

| Server | Description | Key Methods |
|--------|-------------|-------------|
| **supabase** | PostgreSQL database | `executeSQL()`, `listTables()`, `applyMigration()` |
| **memory** | Knowledge graph | `createEntities()`, `createRelations()`, `searchNodes()` |
| **upstash** | Redis cache | `get()`, `set()`, `command()` |

### Files & Code

| Server | Description | Key Methods |
|--------|-------------|-------------|
| **filesystem** | File operations | `readFile()`, `writeFile()`, `listDirectory()` |
| **git** | Git operations | `status()`, `commit()`, `diff()`, `log()` |
| **morpho** | Fast code editing | `editFile()`, `search()` |

### AI & Communication

| Server | Description | Key Methods |
|--------|-------------|-------------|
| **polydev** | Multi-model AI | `getPerspectives()`, `listModels()` |
| **resend** | Email sending | `sendEmail()` |

### Infrastructure

| Server | Description | Key Methods |
|--------|-------------|-------------|
| **vercel** | Deployment | `deploy()`, `listDeployments()` |
| **stripe** | Payments | `createPaymentIntent()`, `listCustomers()` |

### Reasoning

| Server | Description | Key Methods |
|--------|-------------|-------------|
| **seqThinking** | Step-by-step analysis | `analyze()` |

## Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Required variables depend on which servers you want to use:

```bash
# Essential
POLYDEV_USER_TOKEN=your_token
EXA_API_KEY=your_key
GITHUB_TOKEN=your_token

# Database (optional)
SUPABASE_ACCESS_TOKEN=...
SUPABASE_PROJECT_REF=...

# Infrastructure (optional)
VERCEL_TOKEN=...
STRIPE_API_KEY=...
```

### Claude Code Integration

Copy the template to your home directory:

```bash
cp templates/claude-code/CLAUDE.global.md ~/.claude/CLAUDE.md
```

Or for project-specific settings:

```bash
cp templates/claude-code/CLAUDE.project.md .claude/CLAUDE.md
```

This enables **automatic invocation** - Claude Code will use MCP servers without asking permission.

## Architecture

```
mcp-superstack/
├── src/
│   ├── config.ts          # Server configurations
│   ├── client.ts          # Stdio MCP client
│   ├── http-client.ts     # HTTP MCP client
│   ├── index.ts           # Main exports
│   └── servers/           # Server wrappers
│       ├── exa/
│       ├── github/
│       ├── supabase/
│       └── ... (16 more)
├── templates/
│   ├── claude-code/       # CLAUDE.md templates
│   └── codex-cli/         # Codex config + wrapper
├── scripts/
│   ├── setup.js           # Interactive setup
│   ├── setup-codex.js     # Codex CLI setup
│   └── test-all.js        # Connectivity tests
└── docs/
    └── ...                 # Additional documentation
```

## Codex CLI Timeout Fix

Codex CLI has a ~5 second timeout for MCP server initialization. Remote servers like Polydev can exceed this, causing "Transport closed" errors.

**The Solution**: A local stdio wrapper that:
1. Returns `tools/list` instantly (no network call)
2. Forwards actual `tools/call` requests to the remote server

```javascript
// templates/codex-cli/polydev-stdio-wrapper.js

// Local tools definition - returned INSTANTLY
const TOOLS = [
  { name: 'get_perspectives', description: '...' },
  { name: 'list_available_models', description: '...' }
];

async function handle(request) {
  if (method === 'tools/list') {
    return { result: { tools: TOOLS } };  // INSTANT!
  }
  return await forward(request);  // Forward to remote
}
```

## Multi-Server Workflows

Combine multiple servers for complex tasks:

```typescript
import { github, supabase, exa, polydev } from 'mcp-superstack';

// Initialize all at once
await Promise.all([
  github.initialize(),
  supabase.initialize(),
  exa.initialize(),
  polydev.initialize()
]);

// 1. Get expert advice on architecture
const advice = await polydev.getPerspectives(
  'What database schema should I use for a task management app?'
);

// 2. Research existing implementations
const research = await exa.search('task management database schema', {
  numResults: 5,
  type: 'deep'
});

// 3. Search GitHub for examples
const repos = await github.searchRepositories('task manager typescript');

// 4. Store findings in database
await supabase.executeSQL(`
  INSERT INTO research (advice, sources, repos, created_at)
  VALUES ($1, $2, $3, NOW())
`, [JSON.stringify(advice), JSON.stringify(research), JSON.stringify(repos)]);
```

## Auto-Invocation Protocol

When integrated with Claude Code via CLAUDE.md, these servers are invoked **automatically** without permission prompts:

| Situation | Action |
|-----------|--------|
| Hit an error | Consult Polydev + search Exa |
| Architecture decision | Get multi-model perspectives |
| Need documentation | Search Exa + Context7 |
| Database operation | Use Supabase directly |
| File operation | Use filesystem/morpho |

## Testing

Run connectivity tests for all configured servers:

```bash
npm test
```

## API Reference

### Initialization

All servers must be initialized before use:

```typescript
import { exa } from 'mcp-superstack';

// Single server
await exa.initialize();

// Multiple servers (parallel)
await Promise.all([
  exa.initialize(),
  github.initialize(),
  supabase.initialize()
]);

// All servers (convenience)
import { initializeAll } from 'mcp-superstack';
await initializeAll();
```

### Error Handling

```typescript
try {
  const results = await exa.search('query');
} catch (error) {
  if (error.message.includes('not initialized')) {
    await exa.initialize();
    // Retry
  }
}
```

### Cleanup

```typescript
import { cleanup } from 'mcp-superstack';

// Close all connections on exit
process.on('exit', () => cleanup());
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Credits

Built with the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic.

MCP Servers used:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- [Exa](https://exa.ai)
- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)
- [Polydev](https://polydev.ai)
- And many more...
