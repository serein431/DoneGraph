# DoneGraph for Cursor

Cursor can discover plugin metadata from `.cursor-plugin/plugin.json` when the repo is cloned and opened.

For personal skills across projects, install:

```bash
./install.sh cursor
```

Use the same user-facing commands:

```bash
/donegraph-start Ship the Cursor demo
/donegraph-capture --goal "Ship the Cursor demo"
/donegraph-checkpoint Added project rule for DoneGraph
/donegraph-proof Manual smoke check passed --pass
/donegraph-dashboard
```

If a Cursor environment does not expose slash skills, use the wrapper directly:

```bash
$HOME/.donegraph-plugin/scripts/donegraph start "Ship the Cursor demo" --platform cursor
$HOME/.donegraph-plugin/scripts/donegraph capture --goal "Ship the Cursor demo" --platform cursor
$HOME/.donegraph-plugin/scripts/donegraph checkpoint "Added project rule for DoneGraph"
$HOME/.donegraph-plugin/scripts/donegraph dashboard
```
