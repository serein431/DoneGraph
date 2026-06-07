# DoneGraph — UCWS Singapore 2026 Evaluation Sheet

> **Track:** Skill | **Team:** Younger (Full-Stack) + Kevin (GTM)
> **Live:** https://donegraph.space | **Repo:** github.com/serein431/DoneGraph

## One Sentence

**DoneGraph is the memory layer for AI-built work** — every agent session becomes a visible, replayable, verifiable work trail.

## The Problem

AI agents edit files, run commands, change direction, and leave answers in chat. But what actually happened? Which files changed? What passed? What's still broken? What should the next person (human or AI) do? **The progress disappears into chat history.**

## Our Solution

A local plugin that installs into any AI coding tool (Codex, Claude Code, Cursor, VS Code, Gemini, OpenCode, Shell). The agent records goals, checkpoints, evidence, and blockers as structured events. DoneGraph generates:

| Artifact | Purpose |
|----------|---------|
| `dashboard.html` | Visual replay of the entire work run |
| `achievement-log.md` | Plain-language summary for handoffs |
| `next-steps.md` | Where the next session should continue |
| `safe-snapshot.json` | Privacy-safe, shareable work record |
| **Recap Letter** | AI-written daily summary for the user |

## Why This Wins (Evaluator Checklist)

### ✅ Product Value (40%)
- **Universal pain point:** Every AI user has lost context between sessions
- **Immediate utility:** One command to install, one command to start
- **No competitor in this space:** Existing tools track code changes (git) or chat history — DoneGraph tracks *collaboration progress* between human and AI

### ✅ Technical Execution (40%)
- TypeScript strict mode, 14 tests passing, zero type errors
- Clean-room graph schema: 7 node types, 8 edge types, no external dependencies
- 7-platform plugin system with a single core engine
- Privacy-safe snapshot format strips secrets before sharing
- Self-contained demo: `npm run demo`

### ✅ Commercial Potential (10%)
- **Individual:** Free, local-first
- **Teams:** Hosted spaces + auto-upload ($/seat)
- **Enterprise:** On-prem deployment + compliance audit trail

### ✅ Global Scalability (10%)
- Language-agnostic (works with any AI, any human language)
- Platform-agnostic (7 AI tools supported, adapter pattern for more)
- Bilingual docs (English + Chinese)
- Vercel global edge deployment

## Live Demo

```bash
# 60-second judge demo
git clone --depth 1 https://github.com/serein431/DoneGraph
cd DoneGraph
npm install
npm run demo       # Records checkpoints + proof
npm run cli -- dashboard
open landing.html  # Product page with embedded dashboard
```

## Evidence of Completeness

```text
npm test        → 14/14 passed
npm run typecheck → zero errors  
npm run build   → succeeds
./install.sh    → installs on all 7 platforms
```

## Comparison to Competitors

| | DoneGraph | re-forge | RealSkill | DeepEdge |
|---|---|---|---|---|
| **What it does** | Memory layer for ANY AI work | AI coding agent | Social copy generator | Stock research |
| **Universal** | ✅ Works with 7 platforms | ❌ Claude Code only | ❌ RED/XHS only | ❌ US stocks only |
| **Skill reusability** | ✅ Any agent, any task | ⚠️ Only coding | ⚠️ Only copywriting | ⚠️ Only investing |
| **No cloud required** | ✅ Fully local | ❌ | ❌ | ❌ |
| **Privacy-safe sharing** | ✅ Strips secrets | ❌ | ❌ | ❌ |
| **Engineering maturity** | Tests + types + CI | Minimal | Streamlit demo | Python scripts |

**DoneGraph is the only pure Skill in this comparison — a reusable tool that makes every other AI agent better.** The others are domain-specific applications.
