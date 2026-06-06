# DoneGraph UCWS Submission Pack

Event: UCWS Singapore Hackathon -- 2026  
Event page: https://evol.epicconnector.ai/events/ucws-singapore-hackathon---2026-cxgy  
Deadline: 2026-06-05 23:59 SGT / 23:59 China time  
Recommended track: Skill

Paste-ready copy: [SUBMIT-COPY.md](./SUBMIT-COPY.md)

## Project Name

DoneGraph

## Tagline

Make AI progress inspectable.

## Short Description

DoneGraph turns an AI work session into a safe, shareable work trail. It captures goals, files, commands, artifacts, proof, blockers, and next steps, then gives the user a replay dashboard, AI-written recap letter, Agent Radio debrief, and automatic cloud snapshot upload.

## Long Description

DoneGraph is an AI work-trail product for builders using Codex, Claude Code, Cursor, Copilot-style tools, or shell-based agent workflows. In long AI-agent sessions, the hard part often arrives at handoff: what changed, which checks passed, what still hurts, and where should the next session start?

The product records clean-room collaboration events into `.donegraph/session.jsonl`, builds a structured task graph, and writes four reviewable artifacts: `task-graph.json`, `achievement-log.md`, `next-steps.md`, and `dashboard.html`.

The hosted product is live at `https://donegraph.space`. A user can create an upload space at `/share`, copy one Agent instruction, and let their agent upload safe DoneGraph snapshots automatically through a private Vercel Blob-backed API. For the local demo, `npm run demo` plays the full story: it starts a session, captures local project context, records checkpoints, runs test/typecheck/build, attaches proof, and generates the dashboard. The dashboard uses plain vibe coding language: what did AI do, which checks passed, and where should the next session continue? It includes step-by-step review, a copyable plain-language summary, a daily recap letter written by the AI for the user, Agent Radio, and a visible guided walkthrough.

DoneGraph keeps its model deliberately narrow: it records collaboration progress between a person and AI, with evidence attached to each meaningful milestone. That makes it useful for hackathon review, async handoff, project continuation, and AI-agent auditability.

## Demo URL

https://donegraph.space

Upload space / Agent onboarding:
https://donegraph.space/share

Live dashboard:
https://donegraph.space/.donegraph/dashboard.html

## Repository URL

https://github.com/serein431/DoneGraph

## Tech Stack

TypeScript, Node.js, npm workspaces, Vitest, static HTML/CSS dashboard, Vercel, Vercel Blob, Codex/Claude/Cursor-compatible skill wrappers, local JSONL artifact pipeline.

## Track

Skill

## Screenshots

Recommended upload/copy candidates:

- `landing.html` first screen showing the product promise and `打开真实任务回放`.
- `.donegraph/dashboard.html` first screen showing 100% progress.
- Evidence page showing `npm test`, `npm run typecheck`, and `npm run build` proof.
- `SUBMIT-COPY.md` for paste-ready form text.
- `achievement-log.md` and `next-steps.md` as fallback handoff artifacts.

## Demo Script

```bash
npm install
npm run demo
open landing.html
```

Then click `打开真实任务回放`, click `带我看一遍`, and let the page walk through the dashboard.

For manual interaction, click `播放这次任务` first to replay the real work run. Then use `一分钟看懂我的账`: click `带我看懂`, advance with `下一步`, jump to any numbered step, reset the flow with `回到概览`, use `复制一句人话`, or click `拆开这封信` to open the daily recap letter the AI already wrote for the user.

Backup verification:

```bash
npm test
npm run typecheck
npm run build
npm run cli -- dashboard --no-open
```

## Evaluation Fit

- Real product value: tackles the handoff gap that appears after long AI-agent sessions.
- Execution quality: runnable CLI, tests, typecheck, build, installer, plugin wrappers, and generated dashboard.
- Product authenticity: local artifacts come from actual commands and events.
- Global scalability: works across common AI coding environments and team workflows.

## Submission Form Field Mapping

Likely platform fields found from the event frontend:

- `name`: DoneGraph
- `tagline`: Make AI progress inspectable.
- `description`: use Short Description or Long Description depending on field size.
- `demoUrl`: https://donegraph.space
- `repoUrl`: https://github.com/serein431/DoneGraph
- `track`: Skill
- `techStack`: TypeScript, Node.js, npm workspaces, Vitest, static HTML/CSS dashboard, AI plugin skills.
- `screenshotUrls`: hosted screenshot URLs if required.
- `logoUrl`: optional.
- `linkedinUrl`: optional.
- `teamMembers`: optional JSON/list if the form asks.
