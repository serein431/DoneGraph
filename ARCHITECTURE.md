# DoneGraph Architecture

> For UCWS Singapore Hackathon 2026 — AI Evaluation & Judge Review

## System Overview

DoneGraph is AI Accountability Infrastructure — a local-first, multi-platform plugin that makes human-AI collaboration auditable, resumable, and trustworthy. It sits **above** the AI coding tool layer: not replacing any agent, but giving every agent an accountability layer where "done" requires proof and every decision is traceable.

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

## Five Axioms of AI Accountability

### 1. Earned Progress
"Done" without evidence is not done. Activity is not progress. The Accountability Score hard gate enforces this: any completion event without passing evidence results in an UNACCOUNTED verdict, regardless of the composite score.

### 2. Transparent Handoff
Every session ends with a clear state for the next human or AI to continue from. `achievement-log.md` and `next-steps.md` are always generated. The Handoff Quality dimension scores how actionable the handoff is.

### 3. Privacy by Default
Raw sessions never leave the machine. Sharing requires explicit redaction through the safe snapshot pipeline. Three privacy tiers formalize the boundary: `local_only` (nothing leaves), `redacted_share` (safe snapshot with full redaction), `full_disclosure` (explicit opt-in).

### 4. Clean-Room Fidelity
The graph models collaboration facts, not code structure. No external code graphs, AST parsers, or third-party schemas. Seven node types, eight edge types — all describe what happened between a human and AI:

| Node Type | Example |
|-----------|---------|
| `goal` | "Ship the hackathon demo" |
| `task` | "Implemented CLI checkpoint command" |
| `decision` | "Chose journal-island design system" |
| `artifact` | `.donegraph/dashboard.html` |
| `evidence` | "npm test: 29/29 passed" |
| `blocker` | "Need to handle large file uploads" |
| `next_step` | "Add team collaboration features" |

### 5. Immutable Trail
Events are append-only. `session.jsonl` is a ledger, not a draft. No event is ever modified or deleted. This makes the work trail auditable and tamper-evident.

## Accountability Score

Every session is scored on six dimensions to produce a composite Accountability Score (0–100):

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Evidence Coverage | 25 | % of checkpoints with linked evidence |
| Completion Integrity | 25 | Whether "done" claims are backed by passing evidence |
| Decision Traceability | 15 | Whether decisions have context and downstream tasks |
| Handoff Quality | 15 | Whether next steps exist and unknowns are resolved |
| Privacy Safety | 10 | Whether sensitive content has been redacted |
| Graph Coherence | 10 | Whether all nodes are connected in the graph |

Three verdicts: **ACCOUNTABLE** (≥80, no hard gate failures), **PARTIAL** (50–80), **UNACCOUNTED** (<50 or hard gate failure).

Hard gate: Completion Integrity fails when a completion event exists but no evidence has status `pass`. This single gate enforces Axiom 1 (Earned Progress) at the scoring layer.

## Multi-Platform, Single Core
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
