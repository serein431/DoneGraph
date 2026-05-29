# DoneGraph for Codex

Install:

```bash
./install.sh codex
```

Restart Codex, then use:

```bash
/donegraph-start Ship the hackathon demo
/donegraph-capture --goal "Ship a standalone DoneGraph demo"
/donegraph-checkpoint Implemented the CLI --command "npm test"
/donegraph-proof Tests passed --pass --command "npm test"
/donegraph-dashboard
```

The installed skills call the shared wrapper at:

```bash
$HOME/.donegraph-plugin/scripts/donegraph
```

The wrapper preserves the project you invoked it from, so `.donegraph/` is written into the user workspace rather than the DoneGraph checkout.

Use `/donegraph-capture` when Codex joins a project that is already in progress. It reads local context only, then writes DoneGraph's own collaboration progress graph.
