# Contributing to DoneGraph

Thanks for wanting to help. DoneGraph is the memory layer for AI-built work — and the clean-room schema is the core design constraint every contribution must respect.

## Getting Started

```bash
git clone https://github.com/serein431/DoneGraph.git
cd DoneGraph
npm install
npm test
npm run typecheck
```

## Project Structure

```
DoneGraph/
├── packages/core/        # Graph engine + dashboard renderer
├── apps/cli/             # Slash-command CLI
├── platforms/            # Per-platform adapter READMEs
├── plugins/donegraph/    # Agent plugin definitions
└── donegraph-vercel-site/ # donegraph.space frontend + API
```

## Design Constraints

### Clean-Room Schema (non-negotiable)

DoneGraph uses **collaboration edges**, not code-graph relationships:

```
✅ belongs_to_goal, produced, verified_by, continues_as, blocked_by, decided_by
❌ imports, calls, extends, implements, depends_on
```

The graph models **how humans and AI worked together**, not how code is structured. Any contribution that introduces code-graph relationships will be rejected.

### Deterministic Rendering

The dashboard HTML must be deterministic — no `Math.random()`, no `Date.now()`, no `crypto.randomUUID()` in the render path. Two calls with the same input must produce identical output.

### Privacy by Default

The safe snapshot must never include raw commands, local file paths, session logs, or secrets. Every `publish` call must strip these fields.

## Development

```bash
npm run dev       # Run CLI demo
npm test          # Run all tests
npm run test:watch # Watch mode
npm run typecheck # TypeScript strict mode check
npm run build     # Build core + CLI
```

## Pull Requests

1. Add tests for new functionality
2. Run `npm test && npm run typecheck && npm run build` before pushing
3. Keep the changelog up to date
4. Follow the clean-room schema constraint

## License

MIT. See [LICENSE](./LICENSE).
