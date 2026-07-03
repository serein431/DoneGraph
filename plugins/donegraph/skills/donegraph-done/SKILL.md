---
name: donegraph-done
description: Record a DoneGraph completion milestone and regenerate handoff artifacts.
argument-hint: "<completion summary>"
---

# /donegraph-done

Record a stable stopping point as a `completion` event.

Run:

```bash
../../scripts/donegraph done $ARGUMENTS
```

After recording completion, run `/donegraph-summary` or `/donegraph-dashboard` so the user can see what was completed and where the next session should continue.
