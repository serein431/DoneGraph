---
name: donegraph
description: Use when the user wants to track AI collaboration progress, auto-capture local context, record completed work, create an achievement graph, summarize handoff state, or open the DoneGraph dashboard.
argument-hint: ["capture|start <goal>|checkpoint <text>|proof <text>|done <text>|dashboard|summary"]
---

# /donegraph

DoneGraph turns the current AI collaboration into local artifacts under `.donegraph/`.

Prefer the user-friendly commands:

```bash
$HOME/.donegraph-plugin/scripts/donegraph start "<goal>" --platform codex
$HOME/.donegraph-plugin/scripts/donegraph capture --goal "<goal>" --platform codex
$HOME/.donegraph-plugin/scripts/donegraph checkpoint "<what changed>" --command "<command>"
$HOME/.donegraph-plugin/scripts/donegraph proof "<what was verified>" --pass --command "<command>"
$HOME/.donegraph-plugin/scripts/donegraph block "<what is blocked>"
$HOME/.donegraph-plugin/scripts/donegraph done "<stable stopping point>"
$HOME/.donegraph-plugin/scripts/donegraph dashboard
```

## When To Record

- At the beginning of a meaningful task, run `start`.
- When joining an existing or mid-flight project, run `capture` to infer initial progress from local context.
- After important work, record an `action`.
- When files or outputs matter, record an `artifact`.
- When a command, test, or human check proves something, record a `verification`.
- When work cannot proceed cleanly, record a `blocker`.
- At a stable stopping point, record a `completion`, then run `build` or `dashboard`.

## Command Routing

- If `$ARGUMENTS` begins with `capture`, `start`, `checkpoint`, `proof`, `verify`, `block`, `done`, `build`, `dashboard`, or `summary`, pass the arguments directly to `$HOME/.donegraph-plugin/scripts/donegraph`.
- If the user gives a plain goal with no subcommand, run `start "$ARGUMENTS" --platform codex`.
- If the wrapper is missing, ask the user to run `./install.sh codex` from the DoneGraph checkout and restart the CLI.

## Output Contract

The CLI writes:

- `.donegraph/session.jsonl`
- `.donegraph/task-graph.json`
- `.donegraph/achievement-log.md`
- `.donegraph/next-steps.md`
- `.donegraph/dashboard.html`

Use these files as the handoff state for the next AI session.
