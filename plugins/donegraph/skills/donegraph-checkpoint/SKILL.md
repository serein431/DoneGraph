---
name: donegraph-checkpoint
description: Record a meaningful DoneGraph progress checkpoint for the current AI collaboration.
argument-hint: ["<what changed> [--command <cmd>] [--path <file>]"]
---

# /donegraph-checkpoint

Record meaningful progress as an `action` event.

Run:

```bash
../../scripts/donegraph checkpoint $ARGUMENTS
```

Use this after an implementation step, design decision execution, generated artifact, or important task movement. If the user mentions a file, include `--path`. If the user mentions a command, include `--command`.
