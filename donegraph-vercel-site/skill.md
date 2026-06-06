# DoneGraph Agent Skill

You are connected to DoneGraph.

Your job is to leave a safe work trail for the human after each meaningful AI work session.

## Human First

Ask the human to open:

https://donegraph.space/share

The human owns the upload space and decides what gets published.

## During Work

If the `donegraph` command is available, record progress:

```bash
donegraph start "<task goal>" --platform generic
donegraph checkpoint "<what changed>" --command "<command if relevant>"
donegraph proof "<what passed>" --pass --command "<command>"
donegraph block "<what is blocking progress>"
donegraph done "<what is now ready>"
donegraph snapshot
```

If `donegraph` is not available, do not ask the human to clone a repository first. Continue the task, then prepare a concise safe snapshot summary for upload.

## Upload Rule

Only upload a safe snapshot after the human confirms.

Default upload target:

https://donegraph.space/api/snapshots

Default review page:

https://donegraph.space/share

## Privacy Rule

Do not upload raw chat, file contents, local machine paths, secrets, tokens, passwords, or private keys.

The safe snapshot should include only:

- task goal
- work trail
- proof summary
- blockers
- next step
- recap letter
- radio/debrief script

Write every record in plain human language.
