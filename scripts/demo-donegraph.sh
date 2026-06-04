#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(pwd)"

rm -rf "$WORKSPACE_ROOT/.donegraph"

npm run cli -- start "做一个能看见 AI 协作进度的黑客松演示" --platform codex --workspace "$WORKSPACE_ROOT"
npm run cli -- capture --goal "交付独立、洁净室重写的 DoneGraph 演示" --platform codex --verify --workspace "$WORKSPACE_ROOT"
npm run cli -- checkpoint "把 DoneGraph 的核心流程做出来" --command "npm test" --workspace "$WORKSPACE_ROOT"
npm run cli -- checkpoint "生成可以翻看的进度手账首页" --path ".donegraph/dashboard.html" --workspace "$WORKSPACE_ROOT"
npm run cli -- proof "关键流程检查已经通过" --pass --command "npm test" --workspace "$WORKSPACE_ROOT"
npm run cli -- done "演示现在能展示完成进度、验证证据和下一步交接" --workspace "$WORKSPACE_ROOT"
npm run cli -- dashboard --no-open --workspace "$WORKSPACE_ROOT"
