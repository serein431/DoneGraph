# DoneGraph · The Memory Layer for AI-Built Work

[![CI](https://img.shields.io/badge/CI-test%20%7C%20typecheck%20%7C%20build-brightgreen)](https://github.com/serein431/DoneGraph/actions)
[![Tests](https://img.shields.io/badge/tests-29%2F29%20passed-brightgreen)](https://github.com/serein431/DoneGraph/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-7-purple)](#multi-platform-installation)
[![UCWS 2026](https://img.shields.io/badge/UCWS%20Singapore-2026-orange)](https://evol.epicconnector.ai/events/ucws-singapore-hackathon---2026-cxgy/project-wall)

> 🏆 **UCWS Singapore Hackathon 2026 — Skill Track**  
> [→ Judge Evaluation Sheet](./EVALUATION.md) | [→ Architecture Overview](./ARCHITECTURE.md)

DoneGraph is the trust layer for AI work. It turns an agent session into a safe, shareable work trail: what the user asked for, what changed, what was verified, what is still open, and where the next session should continue.

Works as a local plugin for Codex, Claude Code, Cursor, VS Code Copilot, and shell-based AI workflows.

[English](./README.md) | [简体中文](./READMEs/README.zh-CN.md)

**Live product:** https://donegraph.space  
**Upload space:** https://donegraph.space/share  
**Agent skill:** https://donegraph.space/skill.md

---

**You have been building with an AI agent for three hours. It edited files, ran tests, changed direction twice, and left a long chat behind. What is actually done?**

DoneGraph turns goals, actions, decisions, artifacts, evidence, blockers, and next steps into a clean work record the user can inspect. It generates a replay dashboard, proof summary, recap letter, Agent Radio debrief, and safe snapshot. Users can also create an upload space at `donegraph.space/share`, give the generated instruction to their agent, and receive future safe snapshots automatically.

> **The point is simple: progress should feel earned, inspectable, and easy to resume.**

---

## Features

### Capture The Current Context

Run `/donegraph-capture` when you join an existing task. DoneGraph reads local context such as changed files, file names, `package.json` scripts, and an optional goal, then turns that into starting collaboration events.

### Track Human-AI Progress

Record meaningful checkpoints as the task moves forward: implementation work, design decisions, generated artifacts, verification results, blockers, and completion milestones.

### Show Evidence, Not Just Activity

Progress is tied to proof. A passing command, manual check, failing test, unknown verification state, or blocker becomes part of the graph instead of disappearing into chat history.

### Generate A Local Dashboard

Open `.donegraph/dashboard.html` to see what was completed, which evidence supports it, how the records connect, and where the next session should pick up.

### Publish A Safe Snapshot

Generate `.donegraph/safe-snapshot.json` when you want to share one AI run without exposing the raw chat, file contents, local paths, or secret-looking values. The hosted share page can import snapshots in the browser, while the cloud API stores safe snapshots through Vercel Blob or Supabase.

### Auto Upload From Agents

Open `https://donegraph.space/share`, create an upload space, and copy the generated Agent instruction. The agent can then publish future safe snapshots with `DONEGRAPH_UPLOAD_TOKEN` at stable stopping points.

### Resume Large Tasks Cleanly

DoneGraph writes `achievement-log.md` and `next-steps.md` so the next AI session can continue from the real task state instead of asking you to reconstruct the story.

### Stay Clean-Room

DoneGraph does not import external code graphs, third-party graph schemas, or `.understand-anything` artifacts. Its graph models one thing only: collaboration progress between a person and AI.

---

## Quick Start

### 1. Install The Plugin

From a local checkout:

```bash
./install.sh codex
```

After installation, restart your CLI or IDE. The installer links the DoneGraph skills for the selected platform and creates a universal local plugin entry:

```text
~/.donegraph-plugin
```

From GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/serein431/DoneGraph/main/install.sh | bash -s codex
```

Native plugin package shape:

```text
.agents/plugins/marketplace.json
plugins/donegraph/.codex-plugin/plugin.json
plugins/donegraph/skills/
plugins/donegraph/scripts/donegraph
```

The marketplace entry points at `./plugins/donegraph`, which is the validated plugin root. Skills call the plugin-owned wrapper by relative path, so the package can run as a self-contained plugin.

### 2. Start A Session

```bash
/donegraph-start Ship a hackathon demo that shows AI progress clearly
```

If you are joining an existing task, capture local context first:

```bash
/donegraph-capture --goal "Ship a standalone clean-room DoneGraph demo"
```

### 3. Record Progress

```bash
/donegraph-checkpoint Implemented the command-first DoneGraph CLI --command "npm test"
/donegraph-proof Tests passed --pass --command "npm test"
/donegraph-done The demo can show completed work, evidence, and the next handoff
```

### 4. Open The Dashboard

```bash
/donegraph-dashboard
```

DoneGraph writes:

```text
.donegraph/session.jsonl
.donegraph/task-graph.json
.donegraph/achievement-log.md
.donegraph/next-steps.md
.donegraph/dashboard.html
.donegraph/safe-snapshot.json
.donegraph/safe-snapshot.md
```

The dashboard includes a real-run replay, a guided walkthrough, a copyable plain-language summary, and a daily recap letter written by the AI for the user.

For the hosted product experience, open `https://donegraph.space`. For local review, open `landing.html` after `npm run demo`; it gives the product landing page first, with the real dashboard embedded inside the page.

---

## Commands

Plugin commands:

```bash
/donegraph-start <goal>
/donegraph-capture [--goal <goal>] [--platform codex|claude|cursor|generic]
/donegraph-checkpoint <what changed> [--command <cmd>] [--path <file>]
/donegraph-proof <proof text> --pass|--fail|--blocked|--unknown [--command <cmd>]
/donegraph-done <completion summary>
/donegraph-dashboard [--no-open]
/donegraph-summary
/donegraph snapshot
/donegraph publish --target https://donegraph.space
```

Terminal fallback:

```bash
donegraph start "Ship the hackathon demo" --platform codex
donegraph capture --goal "Ship the hackathon demo" --platform codex
donegraph checkpoint "Implemented CLI" --command "npm test"
donegraph proof "Tests passed" --pass --command "npm test"
donegraph done "Demo ready"
donegraph dashboard
donegraph snapshot
donegraph publish --target https://donegraph.space
```

Development fallback inside this repo:

```bash
npm run cli -- start "Build DoneGraph" --platform generic
npm run cli -- capture --goal "Build DoneGraph" --platform generic
npm run cli -- checkpoint "Added installer and plugin skills"
npm run cli -- proof "Typecheck passed" --pass --command "npm run typecheck"
npm run cli -- dashboard --no-open
```

---

## Multi-Platform Installation

### Claude Code

```bash
/plugin marketplace add serein431/DoneGraph
/plugin install donegraph
```

### Codex / Cursor / VS Code / Gemini / OpenCode / Generic Agents

macOS / Linux:

```bash
./install.sh
./install.sh codex
./install.sh claude
./install.sh cursor
./install.sh --update
./install.sh --uninstall codex
```

Supported local installer targets:

```text
codex, claude, cursor, vscode, gemini, opencode, generic
```

Cursor and VS Code can also discover metadata from:

```text
.cursor-plugin/plugin.json
.copilot-plugin/plugin.json
```

---

## Share The Graph With Your Team

The graph is just local artifacts. Commit or attach the files when they are useful for reviews, handoffs, demos, and async collaboration.

Good candidates:

```text
landing.html
.donegraph/task-graph.json
.donegraph/achievement-log.md
.donegraph/next-steps.md
.donegraph/dashboard.html
.donegraph/safe-snapshot.json
```

Keep `session.jsonl` private if the raw event stream contains sensitive task notes.

For automatic cloud upload, create an upload space at `https://donegraph.space/share`, copy the generated Agent instruction, then let the agent publish at stable stopping points:

```bash
DONEGRAPH_UPLOAD_TOKEN=<token> donegraph publish --target https://donegraph.space
```

If cloud upload is not configured yet, `donegraph publish` still writes `.donegraph/safe-snapshot.json` locally so the user can import it on `/share`.

The Vercel deployment can use Vercel Blob directly:

```text
BLOB_READ_WRITE_TOKEN
DONEGRAPH_PUBLIC_URL=https://donegraph.space
```

Supabase is still supported as an alternative database-backed storage path:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DONEGRAPH_SNAPSHOT_TABLE=donegraph_snapshots
DONEGRAPH_SPACE_TABLE=donegraph_upload_spaces
```

Minimal Supabase tables, if you choose Supabase:

```sql
create extension if not exists pgcrypto;

create table donegraph_upload_spaces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  upload_token_hash text not null unique
);

create table donegraph_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  space_id uuid references donegraph_upload_spaces(id) on delete set null,
  generated_at timestamptz,
  goal text,
  privacy_mode text,
  summary jsonb,
  snapshot jsonb not null
);
```

---

## Under The Hood

### Clean-Room Collaboration Schema

DoneGraph is not a code dependency graph. Its nodes are collaboration facts:

```text
goal, task, decision, artifact, evidence, blocker, achievement, next_step
```

Its edges describe how work moves:

```text
belongs_to_goal, continues_as, produced, verified_by,
blocked_by, decided_by, needs_followup, supersedes
```

The `capture` command only reads local context such as git status, file names, `package.json` scripts, and the optional user goal. It does not consume `.understand-anything`, external graph files, or third-party schemas.

### Local Artifact Pipeline

```text
AI platform command
        |
        v
DoneGraph plugin skill
        |
        v
donegraph CLI
        |
        v
.donegraph/session.jsonl
        |
        v
task-graph.json + achievement-log.md + next-steps.md + dashboard.html
        |
        v
safe-snapshot.json for one-run sharing
```

Adapters stay thin. The graph logic lives in `packages/core`; the CLI and storage layer live in `apps/cli`; each platform wrapper only maps a user command to the same CLI.

---

## 3 Minute Hackathon Demo

For the shortest live operator script, see [DEMO.md](./DEMO.md). For the judging path, pitch script, MVP boundary, and fallback plan, see [HACKATHON.md](./HACKATHON.md).

```bash
npm install
npm run build

npm run cli -- start "Ship a hackathon demo that shows AI progress clearly" --platform codex
npm run cli -- capture --goal "Ship a standalone clean-room DoneGraph demo" --platform codex
npm run cli -- checkpoint "Implemented the command-first DoneGraph CLI" --command "npm test"
npm run cli -- checkpoint "Generated a static dashboard" --path ".donegraph/dashboard.html"
npm test
npm run cli -- proof "Tests passed" --pass --command "npm test"
npm run typecheck
npm run cli -- proof "Typecheck passed" --pass --command "npm run typecheck"
npm run build
npm run cli -- proof "Build passed" --pass --command "npm run build"
npm run cli -- checkpoint "The dashboard can replay the real work run" --path ".donegraph/dashboard.html"
npm run cli -- checkpoint "The dashboard can write a daily recap letter from the work record" --path ".donegraph/dashboard.html"
npm run cli -- done "The demo can now show completed work, evidence, and the next handoff"
npm run cli -- dashboard
open landing.html
```

Use `--no-open` if you only want to generate the HTML.

---

## Repository Shape

```text
apps/cli                  DoneGraph CLI and local artifact storage
packages/core             Pure graph, summary, Markdown, and dashboard rendering
plugins/donegraph         Codex plugin root, skills, and wrapper script
platforms/*               Thin integration notes for other AI environments
install.sh                Multi-platform local installer
scripts/demo-donegraph.sh 3-minute product demo path
landing.html              Product landing page that embeds the generated dashboard
```

## Verify

```bash
npm test
npm run typecheck
npm run build
```

Optional Codex plugin package validation, when the local Codex system skill is available:

```bash
python3 "$HOME/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/donegraph
```

---

Stop losing the thread. Start seeing what you and AI actually finished.
