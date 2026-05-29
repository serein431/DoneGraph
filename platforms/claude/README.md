# DoneGraph for Claude Code

Native marketplace shape:

```bash
/plugin marketplace add Lum1104/DoneGraph
/plugin install donegraph
```

Local install while developing:

```bash
./install.sh claude
```

Recommended flow:

```bash
/donegraph-start Build the demo handoff graph
/donegraph-capture --goal "Build the demo handoff graph"
/donegraph-checkpoint Implemented dashboard generation --path ".donegraph/dashboard.html"
/donegraph-proof Tests passed --pass --command "npm test"
/donegraph-done Ready for handoff
/donegraph-dashboard
```

Claude should read `.donegraph/next-steps.md` before continuing a large task in a later session.

For an existing workspace, run `/donegraph-capture` before the first checkpoint so the graph starts from local project context instead of an empty session.
