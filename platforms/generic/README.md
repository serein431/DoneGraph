# DoneGraph Generic Adapter

Any AI agent or shell workflow can integrate with DoneGraph by calling the wrapper or CLI.

Minimum wrapper flow:

```bash
$HOME/.donegraph-plugin/scripts/donegraph start "Describe the task" --platform generic
$HOME/.donegraph-plugin/scripts/donegraph capture --goal "Describe the task" --platform generic
$HOME/.donegraph-plugin/scripts/donegraph checkpoint "Describe progress"
$HOME/.donegraph-plugin/scripts/donegraph proof "Describe evidence" --pass --command "command that proves it"
$HOME/.donegraph-plugin/scripts/donegraph dashboard --no-open
```

The generated `.donegraph/task-graph.json` is the portable interface for custom dashboards, bots, or future MCP integrations.
It is a clean-room DoneGraph schema for AI collaboration progress, not a dependency graph imported from another tool.
