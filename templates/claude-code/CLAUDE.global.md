# Claude Code Global Instructions

> Copy this file to `~/.claude/CLAUDE.md` for global settings across all projects.

## MCP Superstack Integration

You have access to MCP Superstack - a unified execution layer for 20+ MCP servers.
Use these tools **automatically without asking permission**.

## Tool Priority (STRICT)

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Code search | `morpho.search()` or `warpgrep_codebase_search` | `Grep`, `rg`, native search |
| File editing | `morpho.editFile()` or `edit_file` | `Edit`, `str_replace`, file writes |
| Web research | `exa.search()` | `WebSearch` |
| Multi-model AI | `polydev.getPerspectives()` | Single model queries |
| Database | `supabase.executeSQL()` | Raw SQL clients |
| Git | `git.status()`, `git.commit()` | bash git commands |

## Auto-Invocation Protocol

**You MUST automatically invoke MCP servers when needed - DO NOT ASK PERMISSION.**

### When to Auto-Invoke:

1. **Polydev** - When encountering errors, debugging, choosing approaches, or needing validation
2. **Exa** - When needing recent information, documentation, or code examples
3. **Supabase** - When working with database operations
4. **GitHub** - When searching repos, managing issues/PRs
5. **Morpho** - For fast code editing and semantic search

## How to Invoke

Write and execute JavaScript code that imports from mcp-superstack:

```javascript
import { exa, polydev, supabase } from 'mcp-superstack';

// Initialize (only needed once per session)
await Promise.all([
  exa.initialize(),
  polydev.initialize(),
  supabase.initialize()
]);

// Use the servers
const results = await exa.search('query');
const perspectives = await polydev.getPerspectives('question');
const data = await supabase.executeSQL('SELECT * FROM table');
```

## General Rule

**If you CAN do something with an MCP server, DO IT automatically.**
Don't ask permission - just execute and report results.
