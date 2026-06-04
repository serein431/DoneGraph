#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(pwd)"

rm -rf "$WORKSPACE_ROOT/.donegraph"

npm run cli -- start "做一个能看见 AI 协作进度的黑客松演示" --platform codex --workspace "$WORKSPACE_ROOT"
npm run cli -- capture --goal "交付独立、洁净室重写的 DoneGraph 演示" --platform codex --workspace "$WORKSPACE_ROOT"
npm run cli -- checkpoint "完成命令优先的 DoneGraph CLI" --command "npm test" --workspace "$WORKSPACE_ROOT"
npm run cli -- checkpoint "生成可静态打开的进度手账首页" --path ".donegraph/dashboard.html" --workspace "$WORKSPACE_ROOT"
npm run cli -- proof "测试已经通过" --pass --command "npm test" --workspace "$WORKSPACE_ROOT"
npm run cli -- done "演示现在能展示完成进度、验证证据和下一步交接" --workspace "$WORKSPACE_ROOT"
npm run cli -- dashboard --no-open --workspace "$WORKSPACE_ROOT"
