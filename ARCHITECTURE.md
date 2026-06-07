# DoneGraph Architecture

> For UCWS Singapore Hackathon 2026 — AI Evaluation & Judge Review

## System Overview

DoneGraph is a local-first, multi-platform plugin that turns AI agent sessions into inspectable, shareable work trails. It sits **above** the AI coding tool layer — not replacing any agent, but giving every agent a memory layer.

```
┌─────────────────────────────────────────────────────────┐
│                    USER / JUDGE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Dashboard │  │  Recap   │  │  Share Space         │  │
│  │ (HTML)    │  │  Letter  │  │  (donegraph.space)   │  │
│  └─────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└────────┼─────────────┼───────────────────┼──────────────┘
         │             │                   │
┌────────┴─────────────┴───────────────────┴──────────────┐
│                  ARTIFACT LAYER                          │
│  task-graph.json  achievement-log.md  next-steps.md     │
│  dashboard.html   safe-snapshot.json  session.jsonl     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                    CORE ENGINE                           │
│  packages/core/                                          │
│  ├── Graph Builder  → 7 node types, 8 edge types         │
│  ├── Summary Engine → achievement log, recap letter      │
│  ├── Dashboard Gen  → pixel-farm-board static HTML       │
│  └── Snapshot Gen   → privacy-safe sharing format        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                    CLI LAYER                             │
│  apps/cli/                                               │
│  ├── donegraph start/capture/checkpoint/proof/done       │
│  ├── donegraph dashboard/summary/snapshot/publish        │
│  └── Storage: .donegraph/ in workspace root              │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│               PLATFORM ADAPTERS (thin wrappers)          │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │  Codex   │  Claude  │  Cursor  │  VS Code Copilot │  │
│  │  /donegraph-*       │  /donegraph-*                │  │
│  │  plugin.json        │  plugin.json                 │  │
│  └──────────┴──────────┴──────────┴──────────────────┘  │
│  + Shell CLI, Gemini, OpenCode, Generic                  │
└─────────────────────────────────────────────────────────┘
```

## Core Design Principles

### 1. Local-First, Zero Dependency
DoneGraph runs entirely locally. No cloud account required. The graph engine has zero external runtime dependencies beyond Node.js.

### 2. Clean-Room Schema
DoneGraph does NOT import external code graphs, AST parsers, or third-party schemas. It models **collaboration progress** — the facts of what happened between a human and AI:

| Node Type | Example |
|-----------|---------|
| `goal` | "Ship the hackathon demo" |
| `task` | "Implemented CLI checkpoint command" |
| `decision` | "Chose pixel-farm-board design system" |
| `artifact` | `.donegraph/dashboard.html` |
| `evidence` | "npm test: 14/14 passed" |
| `blocker` | "Need to handle large file uploads" |
| `achievement` | "Demo can replay real work run" |
| `next_step` | "Add team collaboration features" |

### 3. Proof-Backed Progress
Every claim in the graph is tied to verifiable evidence:
- `--pass` → commands that succeeded
- `--fail` → commands that failed (transparency)
- `--blocked` → work that couldn't proceed
- `--unknown` → ambiguous verification

### 4. Multi-Platform, Single Core
All 7 platforms (Codex, Claude Code, Cursor, VS Code, Gemini, OpenCode, Shell) route through the same `donegraph` CLI. Platform adapters are thin wrappers (~50 lines each).

## Data Flow

```
AI Agent Session
       │
       ▼
/donegraph-start "Build feature X"
       │
       ▼
/donegraph-capture (reads git status, file names, scripts)
       │
       ▼
┌──────────────────────────────────────┐
│         session.jsonl                │  ← append-only event log
│  {"ts":...,"event":"checkpoint",...} │
│  {"ts":...,"event":"proof",...}      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│         task-graph.json              │  ← computed from events
│  {nodes:[...], edges:[...]}          │
└──────────────┬───────────────────────┘
               │
       ┌───────┼───────────┐
       ▼       ▼           ▼
  dashboard  recap    safe-snapshot
  .html      letter   .json
```

## Technical Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Core Engine | TypeScript (strict mode) | Type safety for graph operations |
| CLI | Node.js + Commander | Cross-platform, single binary experience |
| Frontend | Static HTML5 + CSS3 + Vanilla JS | Zero framework, instant load, no build step for dashboard |
| Testing | Vitest | Fast, TypeScript-native |
| Type Check | tsc --noEmit | Full strict mode |
| Deployment | Vercel (donegraph.space) | Edge CDN, Blob storage |
| Package Manager | npm workspaces | Monorepo structure |

## Engineering Quality

```text
✅ 2 test files, 14 test cases, all passing
✅ Full TypeScript strict mode, zero type errors
✅ Clean-room graph schema (7 node types, 8 edge types)
✅ Multi-platform plugin system (7 platforms)
✅ One-command installer (./install.sh)
✅ Self-contained demo path (npm run demo)
✅ Privacy-safe snapshot format
✅ Bilingual documentation (EN + ZH-CN)
✅ CI-ready verification chain (test → typecheck → build)
```

## Commercial Scalability

DoneGraph addresses a universal problem: **AI agents are doing real work, but their progress disappears inside chat history.** This affects:

- **Individual Developers** — Resume work after context loss
- **Hackathon Teams** — Judges can review actual progress, not just a demo
- **Engineering Teams** — Async handoffs between shifts/timezones
- **Enterprise Compliance** — Audit trail for AI-assisted development

Revenue paths: hosted team spaces (SaaS), enterprise on-prem deployment, open-core model.
