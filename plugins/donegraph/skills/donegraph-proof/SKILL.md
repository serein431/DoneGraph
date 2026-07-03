---
name: donegraph-proof
description: Record verification evidence in DoneGraph, including pass, fail, blocked, or unknown status.
argument-hint: "<proof text> --pass|--fail|--blocked|--unknown [--command <cmd>]"
---

# /donegraph-proof

Record verification evidence for the current DoneGraph.

Run:

```bash
../../scripts/donegraph proof $ARGUMENTS
```

Use `--pass` only when verification actually passed. Use `--fail` for failing tests or review findings, `--blocked` when verification cannot proceed, and `--unknown` when evidence exists but is not conclusive.
