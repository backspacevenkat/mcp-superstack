# MCP Superstack

> Unified MCP execution layer for AI coding assistants. One codebase to rule them all.

**MCP Superstack** provides a single, consistent interface to 20+ MCP (Model Context Protocol) servers for use with Claude Code, Codex CLI, Cline, and any MCP-compatible AI assistant.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Claude Code Setup](#claude-code-setup)
- [Codex CLI Setup](#codex-cli-setup)
- [Available Servers](#available-servers)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Features

- **20+ MCP Servers**: Exa, GitHub, Supabase, Vercel, Stripe, Memory, Polydev, and more
- **Unified API**: Same interface for all servers - `await server.method()`
- **Dual Transport**: Supports both stdio and HTTP MCP servers
- **Ready-to-Use Templates**: CLAUDE.md files for auto-invocation
- **Codex CLI Support**: Pre-configured with initialization timeout fixes
- **TypeScript**: Full type definitions included
- **Interactive Setup**: Wizard-based configuration for all services

## Quick Start

```bash
# Clone the repository
git clone https://github.com/backspacevenkat/mcp-superstack.git
cd mcp-superstack

# Install dependencies
npm install

# Run interactive setup wizard
npm run setup

# Build TypeScript
npm run build

# Test connectivity to all servers
npm test
```

---

## Claude Code Setup

Claude Code has long timeouts and works excellently with all MCP servers including complex Polydev queries.

### Step 1: Configure MCP Servers

Add these to your Claude Code MCP configuration (`~/.claude/settings.json` or via `claude mcp add`):

```bash
# Polydev - Multi-model AI perspectives
claude mcp add polydev -- npx -y @anthropic/mcp-proxy https://www.polydev.ai/api/mcp --header "Authorization: Bearer YOUR_POLYDEV_TOKEN"

# Exa - Semantic web search
claude mcp add exa -- npx -y @anthropic/mcp-proxy "https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_KEY"

# GitHub
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN -- npx -y @modelcontextprotocol/server-github

# Supabase
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_TOKEN --project-ref YOUR_REF

# Memory (knowledge graph)
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

# Sequential Thinking
claude mcp add seq-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking

# Context7 (library docs)
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Filesystem
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir
```

### Step 2: Add Auto-Invocation Instructions

Copy the CLAUDE.md template to enable automatic MCP usage:

```bash
# Global (applies to all projects)
cp templates/claude-code/CLAUDE.global.md ~/.claude/CLAUDE.md

# Per-project (more detailed instructions)
mkdir -p .claude
cp templates/claude-code/CLAUDE.project.md .claude/CLAUDE.md
```

### What CLAUDE.md Does

The CLAUDE.md file instructs Claude Code to:
- **Automatically consult Polydev** when encountering errors, debugging, or making architecture decisions
- **Automatically search with Exa** when needing documentation, examples, or current best practices
- **Use MCP servers without asking permission** - just execute and report results

Example from CLAUDE.md:
```markdown
## When to Auto-Invoke Polydev
**Automatically use Polydev whenever you:**
- Hit an error or unexpected behavior
- Need to debug or troubleshoot
- Are choosing between approaches
- Want validation before implementing
- Face any uncertainty or complexity

**DO NOT ask "should I consult Polydev?" - JUST DO IT automatically.**
```

---

## Codex CLI Setup

Codex CLI (OpenAI's CLI) has strict timeout constraints that require special handling.

### The Challenge

Codex CLI has two timeout issues:
1. **Initialization timeout (~5s)**: Server must respond to `initialize` and `tools/list` within ~5 seconds
2. **Tool call timeout (~10-15s)**: Individual tool calls must complete quickly

### The Solution: Local Stdio Wrapper

We solve the initialization timeout with a local wrapper that:
1. Returns `initialize` and `tools/list` **instantly** (no network call)
2. Forwards actual `tools/call` requests to the remote server

### Setup Instructions

#### Automated Setup

```bash
npm run setup:codex
```

This will:
1. Create `~/.codex/config.toml` with all MCP servers
2. Install `polydev-stdio-wrapper.js` to `~/.codex/`
3. Configure authentication for all services

#### Manual Setup

1. **Copy the wrapper script:**

```bash
cp templates/codex-cli/polydev-stdio-wrapper.js ~/.codex/
chmod +x ~/.codex/polydev-stdio-wrapper.js
```

2. **Add to `~/.codex/config.toml`:**

```toml
# Polydev - uses local wrapper for fast initialization
[mcp_servers.polydev]
command = "/opt/homebrew/bin/node"  # or /usr/local/bin/node on Intel Mac
args = ["/Users/YOUR_USERNAME/.codex/polydev-stdio-wrapper.js"]
env = { POLYDEV_USER_TOKEN = "your_token_here" }

# Exa - uses mcp-proxy for HTTP transport
[mcp_servers.exa]
command = "mcp-proxy"
args = ["https://mcp.exa.ai/mcp?exaApiKey=YOUR_KEY", "--transport", "streamablehttp"]
env = {}

# GitHub
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_PERSONAL_ACCESS_TOKEN = "your_token" }

# Memory
[mcp_servers.memory]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-memory"]
env = {}

# Vercel - with auth header via mcp-proxy
[mcp_servers.vercel]
command = "mcp-proxy"
args = ["https://mcp.vercel.com/TEAM/PROJECT", "--transport", "streamablehttp", "-H", "Authorization", "Bearer YOUR_TOKEN"]
env = {}
```

### Polydev Limitations in Codex CLI

⚠️ **Important**: Even with the wrapper fix, Polydev has limitations in Codex:

| Prompt Type | Typical Time | Codex Status |
|-------------|--------------|--------------|
| Simple ("What is 2+2?") | ~2-3 seconds | ✅ Works |
| Medium (short question) | ~5-10 seconds | ✅ Usually works |
| Complex (architecture) | ~15-30 seconds | ❌ May timeout |

**Recommendations for Codex CLI:**
1. **Use shorter, focused prompts** - Break complex questions into smaller parts
2. **Use Claude Code for complex queries** - It has longer timeouts
3. **Other MCPs work great** - Exa, GitHub, Memory, etc. are fast and reliable

### How the Wrapper Works

```javascript
// polydev-stdio-wrapper.js - Key concepts

// 1. Local tool definitions for INSTANT response
const TOOLS = [
  { name: 'get_perspectives', description: '...' }
];

// 2. Handle requests
async function handle(request) {
  const { method, id } = request;

  // Return initialize INSTANTLY (no network)
  if (method === 'initialize') {
    return { jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', ... } };
  }

  // Return tools/list INSTANTLY (no network)
  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  }

  // Forward actual tool calls to remote server
  return await forward(request);
}

// 3. Async exit handling - wait for pending requests
let pendingRequests = 0;
let stdinEnded = false;
function checkExit() {
  if (stdinEnded && pendingRequests === 0) process.exit(0);
}
```

---

## Available Servers

### Research & Search

| Server | Description | Key Methods | Transport |
|--------|-------------|-------------|-----------|
| **exa** | Semantic web search | `search()`, `getCodeContext()`, `findSimilar()` | HTTP |
| **github** | Repository management | `searchRepositories()`, `createIssue()`, `createPullRequest()` | stdio |
| **deepwiki** | Wikipedia search | `search()` | stdio |
| **context7** | Library documentation | `resolveLibraryId()`, `getLibraryDocs()` | stdio |
| **perplexity** | AI-powered search | `search()` | HTTP |

### Data & Storage

| Server | Description | Key Methods | Transport |
|--------|-------------|-------------|-----------|
| **supabase** | PostgreSQL database | `executeSQL()`, `listTables()`, `describeTable()` | stdio |
| **memory** | Knowledge graph | `createEntities()`, `createRelations()`, `searchNodes()` | stdio |
| **upstash** | Redis cache | `get()`, `set()`, `command()` | stdio |

### Files & Code

| Server | Description | Key Methods | Transport |
|--------|-------------|-------------|-----------|
| **filesystem** | File operations | `readFile()`, `writeFile()`, `listDirectory()` | stdio |
| **git** | Git operations | `status()`, `commit()`, `diff()`, `log()` | stdio |
| **morpho** | Fast code editing (10,500 tok/s) | `editFile()`, `search()` | stdio |

### AI & Communication

| Server | Description | Key Methods | Transport |
|--------|-------------|-------------|-----------|
| **polydev** | Multi-model AI (GPT-4, Claude, Gemini, Grok) | `getPerspectives()`, `listModels()` | HTTP |
| **resend** | Email sending | `sendEmail()` | HTTP |

### Infrastructure

| Server | Description | Key Methods | Transport |
|--------|-------------|-------------|-----------|
| **vercel** | Deployment | `deploy()`, `listDeployments()` | HTTP |
| **stripe** | Payments | `createPaymentIntent()`, `listCustomers()` | HTTP |

### Reasoning

| Server | Description | Key Methods | Transport |
|--------|-------------|-------------|-----------|
| **seqThinking** | Step-by-step analysis | `analyze()` | stdio |

---

## Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

#### Essential Services

```bash
# Polydev - Multi-model AI perspectives
# Get from: https://www.polydev.ai/dashboard/mcp-tokens
POLYDEV_USER_TOKEN=pd_xxxxx

# Exa - Semantic web search
# Get from: https://exa.ai/
EXA_API_KEY=xxx

# GitHub - Repository management
# Get from: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_xxxxx
```

#### Database (Supabase)

```bash
# Get from: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_ACCESS_TOKEN=sbp_xxxxx
SUPABASE_PROJECT_REF=xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

#### Infrastructure

```bash
# Vercel
VERCEL_TOKEN=xxxxx
VERCEL_TEAM=your-team
VERCEL_PROJECT=your-project

# Stripe
STRIPE_API_KEY=sk_xxxxx

# Resend
RESEND_API_KEY=re_xxxxx

# Upstash Redis
UPSTASH_EMAIL=you@example.com
UPSTASH_API_KEY=xxxxx
```

### Where to Get API Keys

| Service | URL | Notes |
|---------|-----|-------|
| Polydev | https://www.polydev.ai/dashboard/mcp-tokens | Free tier: 1000 messages/month |
| Exa | https://exa.ai/ | Developer plan available |
| GitHub | https://github.com/settings/tokens | Fine-grained tokens recommended |
| Supabase | https://supabase.com/dashboard | Free tier available |
| Vercel | https://vercel.com/account/tokens | |
| Stripe | https://dashboard.stripe.com/apikeys | Test mode keys for dev |
| Upstash | https://console.upstash.com/ | Free tier available |

---

## Usage Examples

### Basic Usage (Node.js / Claude Code)

```typescript
import { exa, polydev, supabase } from 'mcp-superstack';

// Initialize servers (only needed once)
await Promise.all([
  exa.initialize(),
  polydev.initialize(),
  supabase.initialize()
]);

// Web search
const results = await exa.search('MCP best practices 2024', {
  numResults: 5,
  type: 'deep'
});

// Multi-model AI perspectives
const perspectives = await polydev.getPerspectives(
  'Should I use Redis or PostgreSQL for session storage?'
);

// Database query
const users = await supabase.executeSQL('SELECT * FROM users LIMIT 10');
```

### Multi-Server Workflow

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
const repos = await github.searchRepositories('task manager typescript stars:>100');

// 4. Store findings in database
await supabase.executeSQL(`
  INSERT INTO research (advice, sources, repos, created_at)
  VALUES ($1, $2, $3, NOW())
`, [JSON.stringify(advice), JSON.stringify(research), JSON.stringify(repos)]);

console.log('Research complete and stored!');
```

### Auto-Invocation in Claude Code

When using CLAUDE.md templates, Claude Code will automatically:

| Situation | Automatic Action |
|-----------|------------------|
| Hit an error | Consult Polydev for debugging advice |
| Architecture decision | Get multi-model perspectives |
| Need documentation | Search Exa + Context7 |
| Database operation | Use Supabase directly |
| File operation | Use filesystem/morpho |
| Research needed | Search Exa automatically |

---

## Architecture

### Project Structure

```
mcp-superstack/
├── src/
│   ├── config.ts              # Server configurations (stdio + HTTP)
│   ├── client.ts              # Stdio MCP client with connection pooling
│   ├── http-client.ts         # HTTP MCP client for REST-based servers
│   ├── index.ts               # Main exports
│   └── servers/               # Server wrappers (16 servers)
│       ├── exa/index.ts
│       ├── github/index.ts
│       ├── supabase/index.ts
│       ├── polydev/index.ts
│       ├── memory/index.ts
│       ├── vercel/index.ts
│       ├── stripe/index.ts
│       └── ... (9 more)
├── templates/
│   ├── claude-code/
│   │   ├── CLAUDE.global.md   # Global auto-invocation instructions
│   │   └── CLAUDE.project.md  # Project-specific instructions
│   └── codex-cli/
│       ├── config.toml        # Complete Codex config template
│       └── polydev-stdio-wrapper.js  # Timeout fix wrapper
├── scripts/
│   ├── setup.js               # Interactive setup wizard
│   ├── setup-codex.js         # Codex CLI configuration
│   └── test-all.js            # Connectivity tests
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

### Transport Types

MCP supports two transport mechanisms:

| Transport | How it Works | Examples |
|-----------|--------------|----------|
| **stdio** | Spawns a local process, communicates via stdin/stdout JSON-RPC | GitHub, Supabase, Memory, Filesystem |
| **HTTP** | REST API calls with JSON-RPC payloads | Polydev, Exa, Vercel |

### Client Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    mcp-superstack                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────────────┐ │
│  │ Server       │              │ StdioClientManager   │ │
│  │ Wrappers     │──────────────│ (connection pooling) │ │
│  │ (exa, github │              └──────────────────────┘ │
│  │  supabase..) │                        │              │
│  └──────────────┘                        ▼              │
│         │                    ┌──────────────────────┐   │
│         │                    │ Child Processes      │   │
│         │                    │ (npx server-xxx)     │   │
│         │                    └──────────────────────┘   │
│         │                                               │
│         │                    ┌──────────────────────┐   │
│         └───────────────────▶│ HTTPClientManager    │   │
│                              │ (REST API calls)     │   │
│                              └──────────────────────┘   │
│                                        │                │
│                                        ▼                │
│                              ┌──────────────────────┐   │
│                              │ Remote MCP Servers   │   │
│                              │ (polydev.ai, exa.ai) │   │
│                              └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Common Issues

#### "Transport closed" in Codex CLI

**Cause**: Codex CLI has short timeouts (~5s init, ~10-15s tool call)

**Solutions**:
1. For Polydev: Use the local wrapper (`polydev-stdio-wrapper.js`)
2. For complex prompts: Use Claude Code instead (longer timeouts)
3. For other HTTP servers: Use `mcp-proxy` with proper transport flags

#### "POLYDEV_USER_TOKEN environment variable is required"

**Cause**: Missing environment variable

**Solution**:
```bash
export POLYDEV_USER_TOKEN=your_token
# Or add to your .env file
```

#### Vercel returns 401 Unauthorized

**Cause**: Missing or incorrect Authorization header

**Solution** (in Codex config.toml):
```toml
[mcp_servers.vercel]
command = "mcp-proxy"
args = ["https://mcp.vercel.com/TEAM/PROJECT", "--transport", "streamablehttp", "-H", "Authorization", "Bearer YOUR_TOKEN"]
```

#### Server not responding

**Debugging steps**:
```bash
# Test stdio server manually
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | npx -y @modelcontextprotocol/server-github

# Test HTTP server
curl -X POST https://www.polydev.ai/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

### Testing Individual Servers

```bash
# Run all tests
npm test

# Test Polydev manually
export POLYDEV_USER_TOKEN=your_token
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_perspectives","arguments":{"prompt":"What is 2+2?"}}}' | node ~/.codex/polydev-stdio-wrapper.js
```

---

## API Reference

### Initialization

```typescript
import { exa, polydev } from 'mcp-superstack';

// Single server
await exa.initialize();

// Multiple servers (parallel)
await Promise.all([
  exa.initialize(),
  polydev.initialize(),
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
  } else if (error.message.includes('timeout')) {
    console.error('Request timed out - try a shorter query');
  }
}
```

### Cleanup

```typescript
import { cleanup } from 'mcp-superstack';

// Close all connections on exit
process.on('exit', () => cleanup());
process.on('SIGINT', () => { cleanup(); process.exit(); });
```

### Server-Specific APIs

#### Exa

```typescript
// Web search
const results = await exa.search('query', {
  numResults: 10,
  type: 'deep' // or 'auto', 'keyword'
});

// Code documentation
const docs = await exa.getCodeContext('React hooks', 5000);

// Find similar content
const similar = await exa.findSimilar('https://example.com/article');
```

#### Polydev

```typescript
// Get multi-model perspectives
const perspectives = await polydev.getPerspectives(
  'Your detailed question here',
  ['gpt-4', 'claude-3'] // optional: specific models
);

// List available models
const models = await polydev.listModels();
```

#### Supabase

```typescript
// Execute SQL
const data = await supabase.executeSQL('SELECT * FROM users WHERE id = $1', [123]);

// List tables
const tables = await supabase.listTables();

// Describe table
const schema = await supabase.describeTable('users');
```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Test
npm test
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Built with the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic.

MCP Servers and tools used:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- [Exa](https://exa.ai) - Semantic web search
- [Supabase](https://supabase.com) - PostgreSQL database
- [Vercel](https://vercel.com) - Deployment platform
- [Polydev](https://polydev.ai) - Multi-model AI platform
- [Stripe](https://stripe.com) - Payment processing
- [Upstash](https://upstash.com) - Serverless Redis
- And many more...

---

## Support

- **Issues**: [GitHub Issues](https://github.com/backspacevenkat/mcp-superstack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/backspacevenkat/mcp-superstack/discussions)
