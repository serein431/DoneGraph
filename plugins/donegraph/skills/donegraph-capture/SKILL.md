---
name: donegraph-capture
description: Automatically capture local project context into a clean-room DoneGraph collaboration graph.
argument-hint: "[--goal <goal>] [--platform codex|claude|cursor|generic]"
---

# /donegraph-capture

Capture the current project context without using any external code graph or third-party schema.

Run:

```bash
../../scripts/donegraph capture $ARGUMENTS
```

Use this when the user wants DoneGraph to infer a starting progress map from local files, package scripts, and git status. If the user gives a goal, pass it as `--goal`.
