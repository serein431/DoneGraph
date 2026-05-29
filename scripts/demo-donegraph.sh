#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(pwd)"

npm run cli -- start "Ship a hackathon demo that shows AI progress clearly" --platform codex --workspace "$WORKSPACE_ROOT"
npm run cli -- capture --goal "Ship a standalone clean-room DoneGraph demo" --platform codex --workspace "$WORKSPACE_ROOT"
npm run cli -- checkpoint "Implemented the command-first DoneGraph CLI" --command "npm test" --workspace "$WORKSPACE_ROOT"
npm run cli -- checkpoint "Generated a static dashboard" --path ".donegraph/dashboard.html" --workspace "$WORKSPACE_ROOT"
npm run cli -- proof "Tests passed" --pass --command "npm test" --workspace "$WORKSPACE_ROOT"
npm run cli -- done "The demo can now show completed work, evidence, and the next handoff" --workspace "$WORKSPACE_ROOT"
npm run cli -- dashboard --no-open --workspace "$WORKSPACE_ROOT"
