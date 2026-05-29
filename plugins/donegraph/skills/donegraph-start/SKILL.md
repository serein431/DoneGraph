---
name: donegraph-start
description: Start a DoneGraph collaboration session for the current project.
argument-hint: ["<goal> [--platform codex|claude|cursor|generic]"]
---

# /donegraph-start

Start a DoneGraph session in the current project.

Run:

```bash
$HOME/.donegraph-plugin/scripts/donegraph start $ARGUMENTS --platform codex
```

If `$ARGUMENTS` already includes `--platform`, preserve that platform and do not add a second one. If the wrapper is missing, ask the user to run `./install.sh codex` from the DoneGraph checkout and restart the CLI.
