# Claude Code Project Instructions

> Copy this file to your project's `.claude/CLAUDE.md` directory.

## AUTO-CONSULTATION PROTOCOL

### CRITICAL: Use MCP Servers Automatically

**You MUST automatically invoke MCP servers whenever needed - DO NOT ASK PERMISSION.**

---

## When to Auto-Invoke Polydev (Multi-Model AI)

**Automatically use Polydev whenever you:**
- Hit an error or unexpected behavior
- Need to debug or troubleshoot
- Are choosing between approaches
- Want validation before implementing
- Encounter unfamiliar territory
- Face any uncertainty or complexity
- Need architecture or design decisions

**DO NOT ask "should I consult Polydev?" - JUST DO IT automatically.**

### How to Invoke Polydev:

```javascript
import { polydev } from 'mcp-superstack';

await polydev.initialize();

const perspectives = await polydev.getPerspectives(`
  [Your detailed question with full context here]
`);

console.log('🤖 Expert Perspectives:', perspectives);
```

---

## When to Auto-Invoke Exa (Research)

**Automatically use Exa whenever you:**
- Need recent information or current best practices
- Want to find code examples or documentation
- Are researching a technology or library
- Need to verify information or look up APIs

**DO NOT ask "should I search for this?" - JUST DO IT automatically.**

### How to Invoke Exa:

```javascript
import { exa } from 'mcp-superstack';

await exa.initialize();

// Web search
const results = await exa.search('your search query', {
  numResults: 5,
  type: 'deep'
});

// Code documentation
const docs = await exa.getCodeContext('React hooks examples', 5000);

console.log('🔍 Results:', results);
```

---

## Multi-Server Workflow Example

Combine multiple servers for complex tasks:

```javascript
import { github, supabase, exa, polydev } from 'mcp-superstack';

// Initialize all at once
await Promise.all([
  github.initialize(),
  supabase.initialize(),
  exa.initialize(),
  polydev.initialize()
]);

// 1. Get expert advice
const advice = await polydev.getPerspectives('How should I approach this problem?');

// 2. Research solutions
const research = await exa.search('best practices for this approach');

// 3. Search for existing implementations
const repos = await github.searchRepositories('similar implementation');

// 4. Store findings
await supabase.executeSQL(`
  INSERT INTO research (advice, sources, repos)
  VALUES ($1, $2, $3)
`, [JSON.stringify(advice), JSON.stringify(research), JSON.stringify(repos)]);

console.log('✅ Research complete and stored');
```

---

## Available MCP Servers

### 🔍 Research & Search
- **exa** - `exa.search()`, `exa.getCodeContext()`
- **github** - `github.searchRepositories()`, `github.searchCode()`
- **deepwiki** - `deepwiki.search()`
- **context7** - `context7.getLibraryDocs()`
- **perplexity** - `perplexity.search()`

### 💾 Data & Storage
- **supabase** - `supabase.executeSQL()`, `supabase.listTables()`
- **memory** - `memory.createEntities()`, `memory.searchNodes()`
- **upstash** - `upstash.get()`, `upstash.set()`

### 📁 Files & Code
- **filesystem** - `filesystem.readFile()`, `filesystem.writeFile()`
- **git** - `git.status()`, `git.commit()`, `git.diff()`
- **morpho** - `morpho.editFile()`, `morpho.search()`

### 🤖 AI & Communication
- **polydev** - `polydev.getPerspectives()`, `polydev.listModels()`
- **resend** - `resend.sendEmail()`

### ☁️ Infrastructure
- **vercel** - `vercel.deploy()`, `vercel.listDeployments()`
- **stripe** - `stripe.createPaymentIntent()`, `stripe.listCustomers()`

### 🧠 Reasoning
- **seqThinking** - `seqThinking.analyze()`

---

## Automatic Workflow Integration

**Claude Code will automatically:**

1. **Before implementing** → Consult Polydev + research with Exa
2. **When encountering errors** → Get expert debugging + search for solutions
3. **During architecture decisions** → Get multi-model perspectives
4. **When uncertain** → Validate approach + look up best practices
5. **For unfamiliar tech** → Research with Exa + get expert guidance

---

## General Rule

**If you CAN do something with an MCP server, DO IT automatically.**
Don't ask permission - just execute and report results.
