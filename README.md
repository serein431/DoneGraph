# DoneGraph

**把你和 AI 的协作过程变成可见的任务成就图谱。**

DoneGraph 面向一个很具体的黑客松痛点：大型任务做着做着，聊天记录越来越长，进度感开始消失。它把你和 AI 的目标、动作、决策、产物、验证、阻塞和下一步沉淀到 `.donegraph/`，再生成一个本地 dashboard，让团队马上看清楚：完成了什么，哪些有证据，下一轮接哪里。

DoneGraph 是 clean-room 的独立项目：它不依赖外部代码知识图谱，不读取第三方 graph schema，也不复用其他 dashboard。它只围绕一个对象建模：**人和 AI 一起推进任务时留下的协作进度图谱**。

## Quick Start

### 1. Install

从本地 checkout 安装到 Codex：

```bash
./install.sh codex
```

安装后重启你的 CLI/IDE。脚本会把 DoneGraph skills 链接到平台目录，并创建通用插件入口：

```text
~/.donegraph-plugin
```

发布到 GitHub 后，一行安装会是：

```bash
curl -fsSL https://raw.githubusercontent.com/Lum1104/DoneGraph/main/install.sh | bash -s codex
```

Claude Code marketplace 形态对齐为：

```bash
/plugin marketplace add Lum1104/DoneGraph
/plugin install donegraph
```

### 2. Start A Session

```bash
/donegraph-start Ship a hackathon demo that shows AI progress clearly
```

If you are joining an existing task, capture local context first:

```bash
/donegraph-capture --goal "Ship a standalone clean-room DoneGraph demo"
```

### 3. Record Progress

```bash
/donegraph-checkpoint Implemented the command-first DoneGraph CLI --command "npm test"
/donegraph-proof Tests passed --pass --command "npm test"
/donegraph-done The demo can show completed work, evidence, and the next handoff
```

### 4. Open The Dashboard

```bash
/donegraph-dashboard
```

DoneGraph writes:

```text
.donegraph/session.jsonl
.donegraph/task-graph.json
.donegraph/achievement-log.md
.donegraph/next-steps.md
.donegraph/dashboard.html
```

## Commands

Plugin commands:

```bash
/donegraph-start <goal>
/donegraph-capture [--goal <goal>] [--platform codex|claude|cursor|generic]
/donegraph-checkpoint <what changed> [--command <cmd>] [--path <file>]
/donegraph-proof <proof text> --pass|--fail|--blocked|--unknown [--command <cmd>]
/donegraph-done <completion summary>
/donegraph-dashboard [--no-open]
/donegraph-summary
```

Terminal fallback:

```bash
donegraph start "Ship the hackathon demo" --platform codex
donegraph capture --goal "Ship the hackathon demo" --platform codex
donegraph checkpoint "Implemented CLI" --command "npm test"
donegraph proof "Tests passed" --pass --command "npm test"
donegraph done "Demo ready"
donegraph dashboard
```

Development fallback inside this repo:

```bash
npm run cli -- start "Build DoneGraph" --platform generic
npm run cli -- checkpoint "Added installer and plugin skills"
npm run cli -- proof "Typecheck passed" --pass --command "npm run typecheck"
npm run cli -- dashboard --no-open
```

## Product Shape

```text
AI platform command
        |
        v
DoneGraph plugin skill
        |
        v
donegraph CLI
        |
        v
.donegraph/session.jsonl
        |
        v
task-graph.json + achievement-log.md + next-steps.md + dashboard.html
```

Adapters stay thin. The graph logic lives in `packages/core`; the CLI and storage layer live in `apps/cli`; each platform wrapper only maps a user command to the same CLI.

## Clean-Room Graph Schema

DoneGraph is not a code dependency graph. Its nodes are collaboration facts:

```text
goal, task, decision, artifact, evidence, blocker, achievement, next_step
```

Its edges describe work progress:

```text
belongs_to_goal, continues_as, produced, verified_by,
blocked_by, decided_by, needs_followup, supersedes
```

The `capture` command only reads local context such as git status, file names, `package.json` scripts, and the optional user goal. It does not consume `.understand-anything`, external graph files, or third-party schemas.

## 3 Minute Hackathon Demo

```bash
npm install
npm run build

npm run cli -- start "Ship a hackathon demo that shows AI progress clearly" --platform codex
npm run cli -- capture --goal "Ship a standalone clean-room DoneGraph demo" --platform codex
npm run cli -- checkpoint "Implemented the command-first DoneGraph CLI" --command "npm test"
npm run cli -- checkpoint "Generated a static dashboard" --path ".donegraph/dashboard.html"
npm run cli -- proof "Tests passed" --pass --command "npm test"
npm run cli -- done "The demo can now show completed work, evidence, and the next handoff"
npm run cli -- dashboard
```

Use `--no-open` if you only want to generate the HTML.

## Multi-Platform Installation

macOS / Linux:

```bash
./install.sh
./install.sh codex
./install.sh claude
./install.sh cursor
./install.sh --update
./install.sh --uninstall codex
```

Supported local installer targets:

```text
codex, claude, cursor, vscode, gemini, opencode, generic
```

Cursor and VS Code can also discover metadata from:

```text
.cursor-plugin/plugin.json
.copilot-plugin/plugin.json
```

## Artifact Contract

- `.donegraph/session.jsonl`: append-only event log for AI agents and platform wrappers.
- `.donegraph/task-graph.json`: portable graph data for dashboards and handoff.
- `.donegraph/achievement-log.md`: human-readable completed work and evidence.
- `.donegraph/next-steps.md`: next-session handoff prompt for AI.
- `.donegraph/dashboard.html`: static visual graph, no server required.

## Repository Shape

```text
apps/cli                  DoneGraph CLI and local artifact storage
packages/core             Pure graph, summary, Markdown, and dashboard rendering
plugins/donegraph         Plugin skills and wrapper script
platforms/*               Thin integration notes for other AI environments
install.sh                Multi-platform local installer
scripts/demo-donegraph.sh 3-minute hackathon demo path
```

## Verify

```bash
npm test
npm run typecheck
npm run build
python3 /Users/dgsp/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/donegraph
```
