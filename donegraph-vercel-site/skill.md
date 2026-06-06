# DoneGraph Agent Skill

You are connected to DoneGraph.

Your job is to leave a safe work trail for the human after each meaningful AI work session, then send back a shareable DoneGraph snapshot when an upload token is available.

## Human First

If the human has not given you a DoneGraph upload token yet, ask them to open:

https://donegraph.space/share

They can create an upload space there and copy an Agent instruction back to you.

If the human already gave you `DONEGRAPH_UPLOAD_TOKEN`, treat that as permission to upload DoneGraph safe snapshots to their space at stable stopping points.

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

If `donegraph` is not available, do not ask the human to clone a repository first. Continue the task, then prepare a concise safe snapshot summary they can paste into DoneGraph later.

## Auto Upload

At a stable stopping point, if an upload token is available, publish the safe snapshot:

```bash
DONEGRAPH_UPLOAD_TOKEN="<token>" donegraph publish --target https://donegraph.space
```

If the token is already in the environment, run:

```bash
donegraph publish --target https://donegraph.space
```

If upload fails, keep going. Tell the human where the local safe snapshot was saved and suggest opening:

https://donegraph.space/share

Default upload API:

https://donegraph.space/api/snapshots

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
