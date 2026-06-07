# Security Policy

## Reporting a Vulnerability

DoneGraph handles AI collaboration data — including file paths, command outputs, and project context. If you discover a security issue, please **do not** open a public issue.

Email: security@donegraph.space

We will respond within 48 hours.

## Privacy Model

DoneGraph is designed with a **privacy-first architecture**:

- **Safe Snapshots**: The `snapshot` and `publish` commands strip raw commands, local file paths, and session logs before sharing
- **No telemetry**: DoneGraph does not phone home or collect usage data
- **Local-first**: All graph data lives in `.donegraph/` within your project directory
- **Upload tokens**: The `donegraph.space/share` API requires explicit upload tokens — no anonymous publishing

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ Active support   |

## Scope

This policy applies to:
- The DoneGraph CLI (`apps/cli`)
- The DoneGraph core engine (`packages/core`)
- The `donegraph.space` web frontend and API
- The 7-platform plugin definitions (`plugins/donegraph/`)
