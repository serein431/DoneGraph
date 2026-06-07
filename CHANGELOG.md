# Changelog

## [0.1.0] - 2026-06-07

### Added
- Core graph engine: builds AI collaboration progress graphs from event streams
- CLI interface: `start`, `checkpoint`, `proof`, `artifact`, `block`, `verify`, `build`, `done`, `snapshot`, `publish`, `capture`, `summary`, `dashboard`, `record`
- Clean-room schema: collaboration edges (belongs_to_goal, produced, verified_by, continues_as) — no code-graph relationships
- Safe snapshot: privacy-first sharing that strips raw commands, local paths, and secrets
- Upload space integration: `donegraph.space/share` for agent-readable project state
- Multi-platform plugin system: Codex, Claude Code, Cursor, VS Code Copilot, and shell-based AI workflows
- Dashboard HTML rendering with deterministic journal scene and motion
- Achievement log and recap letter generation
- Bilingual documentation (English + 简体中文)
- MIT License
- Node.js 20.x and 22.x CI (test + typecheck + build)
