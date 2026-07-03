---
name: donegraph
description: AI Accountability Infrastructure. Use /donegraph-recap to auto-summarize what this session accomplished with a visual dashboard, or use sub-commands to track progress step by step.
argument-hint: "recap|capture|start <goal>|checkpoint <text>|proof <text>|done <text>|dashboard|summary"
---

# /donegraph

DoneGraph is AI Accountability Infrastructure — it turns your AI coding session into a visual, evidence-backed work record.

## Quickest path: one-click recap

When the user is done working, or asks to see what was accomplished:

```bash
../../scripts/donegraph recap --lang en
```

This automatically scans git history, runs project checks, scores the session on 6 accountability dimensions, and opens a visual dashboard. No manual tracking needed.

## Step-by-step tracking (optional)

For more granular control during a session:

```bash
../../scripts/donegraph start "<goal>" --platform codex
../../scripts/donegraph checkpoint "<what changed>" --command "<command>"
../../scripts/donegraph proof "<what was verified>" --pass --command "<command>"
../../scripts/donegraph done "<stable stopping point>"
../../scripts/donegraph dashboard --lang en
```

## When to auto-trigger recap

Run `recap` automatically when the user says:
- "summarize what we did" / "recap" / "what did we accomplish"
- "wrap up" / "let's see the results" / "show me what changed"
- Or at any natural stopping point in the session

## Command Routing

- If `$ARGUMENTS` begins with `recap`, `capture`, `start`, `checkpoint`, `proof`, `verify`, `block`, `done`, `build`, `dashboard`, `summary`, or `snapshot`, pass the arguments directly to `../../scripts/donegraph`.
- If the user gives a plain goal with no subcommand, run `recap --lang en`.
- If the wrapper is missing, ask the user to run `./install.sh codex` from the DoneGraph checkout and restart the CLI.

## Output Contract

The CLI writes to `.donegraph/`:

- `session.jsonl` — append-only event ledger
- `task-graph.json` — structured accountability graph
- `dashboard.html` — visual recap with page-turn animations
- `achievement-log.md` — completed work summary
- `next-steps.md` — handoff for the next session
- `safe-snapshot.json` — privacy-safe shareable format
