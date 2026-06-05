# DoneGraph Hackathon Runbook

## Track Judgment

DoneGraph fits an AI tools / developer productivity / agent workflow track. For judges, the simplest framing is: a local progress graph for human-AI work. It records goals, actions, artifacts, verification, blockers, and next steps, then turns them into a static dashboard.

## Target User

The first user is a developer, builder, or hackathon team using AI agents for multi-hour work. The pain arrives after the edits: many prompts, partial fixes, failed checks, and handoffs later, the team loses the thread.

## One-Line Value

Make AI progress inspectable.

## MVP Scope

Demo-critical:

- Start a local DoneGraph session.
- Capture current repository context.
- Record checkpoints, proof, and completion.
- Generate `.donegraph/task-graph.json`, `.donegraph/achievement-log.md`, `.donegraph/next-steps.md`, and `.donegraph/dashboard.html`.
- Show a judge-friendly dashboard with completion, evidence, blockers, and next-session handoff.
- Use `landing.html` as the product landing page, with the generated dashboard embedded as the real demo surface.

Judge-critical:

- One command demo path: `npm run demo`.
- First URL for judges: `landing.html`, then `打开真实任务回放`.
- Explicit verification evidence for `npm test`, `npm run typecheck`, and `npm run build`.
- A visible demo path in plain vibe coding language: `播放这次任务`, `一分钟看懂我的账`, `带我看懂`, `写复盘信`, `带我看一遍`, URL hash recovery, and keyboard paging.
- README commands that match the runnable demo path.
- Installer smoke check in an isolated `HOME`, so a judge can install without mutating the real machine during verification.

Do not do during the hackathon:

- Remote sync, hosted accounts, team permissions, billing, or analytics.
- Real external writes from Demo Mode.
- Broad platform rewrites beyond the existing thin plugin wrappers.

## Demo Mode Story

1. A team starts a DoneGraph session for a hackathon demo.
2. DoneGraph captures repository context and suggested verification.
3. The team records implementation checkpoints and generated artifacts.
4. Tests, typecheck, and build become pass evidence.
5. The dashboard opens as a self-contained handoff board.
6. The judge first clicks `播放这次任务` to feel one real AI work run, then uses `一分钟看懂我的账` for a guided walkthrough and `写复盘信` for the AI-to-user daily recap.

## Run It

For the shortest live operator script, use [DEMO.md](./DEMO.md).

```bash
npm install
npm run demo
```

Manual verification path:

```bash
npm test
npm run typecheck
npm run build
```

Open the product landing page:

```bash
open landing.html
```

Fallback, open the generated dashboard directly:

```bash
open .donegraph/dashboard.html
```

## 3 Minute Pitch

You have been building with an AI agent for hours. It edited files, ran commands, changed direction, and left a long chat behind. DoneGraph answers the question everyone asks at handoff time: what is actually done?

This demo starts a local session, captures the current repository, records checkpoints, attaches proof, and generates a static dashboard. The important detail is evidence: a passing test, typecheck, build, blocker, or unknown state becomes part of the graph instead of disappearing into chat history.

For a hackathon team, that means reviewers can inspect progress without rereading the whole conversation. For a developer team, it means the next AI session starts from a real task state: goal, artifacts, proof, blockers, and next steps.

The product stays local-first and clean-room. It does not claim to understand all code. It models collaboration progress, the part teams keep losing.

## Current Verification

- `npm test`: pass, 2 test files and 14 tests.
- `npm run typecheck`: pass.
- `npm run build`: pass.
- `python3 "$HOME/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/donegraph`: pass.
- `HOME="$(mktemp -d)" ./install.sh codex`: pass, links skills and `.donegraph-plugin` without requiring a GitHub pull from the local checkout.
- `plugins/donegraph/scripts/donegraph ...` from a temporary workspace: pass, writes `.donegraph/` into the caller workspace.
- `npm run demo`: pass, generated `.donegraph/dashboard.html` and recorded test/typecheck/build proof.
- Static landing page check: pass for product headline, embedded dashboard, demo buttons, copyable submission summary, and dashboard links.
- Static dashboard check: pass for Demo Mode button, hash paging, keyboard paging strings, 100% progress, proof text, and the daily recap letter panel.

## Fallback Plan

If plugin installation fails, run the CLI from the repository with `npm run cli -- ...`.

If opening the landing page or dashboard fails in a browser, attach `.donegraph/achievement-log.md`, `.donegraph/next-steps.md`, and `.donegraph/task-graph.json` as the text fallback.

If a verification command fails near submission, record it with `donegraph proof ... --fail` or `--blocked` instead of hiding the result. The graph is strongest when it reports the real state.
