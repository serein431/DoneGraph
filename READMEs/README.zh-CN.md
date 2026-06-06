# DoneGraph

把你和 AI 的协作过程变成可见的任务成就图谱：目标是什么、做了什么、证据在哪里、哪里卡住了、下一轮从哪继续。

支持 Codex、Claude Code、Cursor、VS Code Copilot，以及 shell 形态的 AI 工作流。

[English](../README.md) | [简体中文](./README.zh-CN.md)

---

**你和 AI 已经一起做了三个小时。它改了文件、跑了测试、中途换了两次方向，最后留下了一长串聊天记录。可是，到底完成了什么？**

DoneGraph 是一个本地 AI 协作插件。它会把目标、动作、决策、产物、验证、阻塞和下一步写入 `.donegraph/`，再生成静态 dashboard 和交接文件。团队、评委或下一轮 AI 打开之后，可以直接看到这轮工作的真实状态。

> **目标很简单：让进展有成就感、能检查、能接力。**

---

## 核心功能

### 捕获当前上下文

接手一个已经进行中的任务时，运行 `/donegraph-capture`。DoneGraph 会读取本地改动文件、文件名、`package.json` scripts 和可选目标，生成一组协作进度起点。

### 记录人和 AI 的推进过程

把关键节点记录下来：实现动作、设计决策、生成产物、验证结果、阻塞项和阶段完成。

### 用证据说明进度

进度不只是“做了很多”。测试通过、人工检查、失败验证、未知状态、阻塞原因都可以成为图谱里的证据节点。

### 生成本地 Dashboard

打开 `.donegraph/dashboard.html`，可以看到做成了什么、哪些证据能支撑、记录之间怎么连起来，以及下一轮应该从哪接上。

### 发布安全快照

需要共享某一次 AI 工作时，生成 `.donegraph/safe-snapshot.json`。它只保留工作摘要、进度、复盘信和电台脚本，不包含原始聊天、文件内容、本机路径和疑似密钥。线上 `share.html` 可以在浏览器里导入这份快照；配置 Supabase 后，`/api/snapshots` 可以把它保存成一次性分享链接。

### 让大任务容易继续

DoneGraph 会写出 `achievement-log.md` 和 `next-steps.md`。下一轮 AI 可以直接从真实任务状态继续，而不是让你重新讲一遍前情提要。

### 保持 Clean-Room

DoneGraph 不导入外部代码图谱、不读取第三方 graph schema，也不消费 `.understand-anything` 产物。它只建模一件事：人和 AI 一起推进任务时留下的协作进度。

---

## 快速开始

### 1. 安装插件

从本地 checkout 安装：

```bash
./install.sh codex
```

安装后重启 CLI 或 IDE。脚本会为所选平台链接 DoneGraph skills，并创建通用本地插件入口：

```text
~/.donegraph-plugin
```

从 GitHub 安装：

```bash
curl -fsSL https://raw.githubusercontent.com/serein431/DoneGraph/main/install.sh | bash -s codex
```

插件包结构：

```text
.agents/plugins/marketplace.json
plugins/donegraph/.codex-plugin/plugin.json
plugins/donegraph/skills/
plugins/donegraph/scripts/donegraph
```

其中 marketplace 指向 `./plugins/donegraph`，这是通过验证的插件根目录。`skills/` 里的命令通过相对路径调用插件自带脚本，不依赖 `~/.donegraph-plugin` 才能运行。

### 2. 开始一次协作

```bash
/donegraph-start Ship a hackathon demo that shows AI progress clearly
```

如果是在接手已有任务，先捕获上下文：

```bash
/donegraph-capture --goal "Ship a standalone clean-room DoneGraph demo"
```

### 3. 记录进展

```bash
/donegraph-checkpoint Implemented the command-first DoneGraph CLI --command "npm test"
/donegraph-proof Tests passed --pass --command "npm test"
/donegraph-done The demo can show completed work, evidence, and the next handoff
```

### 4. 打开 Dashboard

```bash
/donegraph-dashboard
```

DoneGraph 会写出：

```text
.donegraph/session.jsonl
.donegraph/task-graph.json
.donegraph/achievement-log.md
.donegraph/next-steps.md
.donegraph/dashboard.html
.donegraph/safe-snapshot.json
.donegraph/safe-snapshot.md
```

Dashboard 里有真实任务回放、一步一步的演示、能复制的人话摘要，也能让 AI 把今天干过的活写成一封给你的复盘信。

黑客松展示时，先打开 `landing.html`。它是给评委看的产品落地页，页面里直接嵌入真实 dashboard。

---

## 常用命令

```bash
/donegraph-start <goal>
/donegraph-capture [--goal <goal>] [--platform codex|claude|cursor|generic]
/donegraph-checkpoint <what changed> [--command <cmd>] [--path <file>]
/donegraph-proof <proof text> --pass|--fail|--blocked|--unknown [--command <cmd>]
/donegraph-done <completion summary>
/donegraph-dashboard [--no-open]
/donegraph-summary
/donegraph snapshot
/donegraph publish --target https://donegraph.space
```

终端 fallback：

```bash
donegraph start "Ship the hackathon demo" --platform codex
donegraph capture --goal "Ship the hackathon demo" --platform codex
donegraph checkpoint "Implemented CLI" --command "npm test"
donegraph proof "Tests passed" --pass --command "npm test"
donegraph done "Demo ready"
donegraph dashboard
donegraph snapshot
donegraph publish --target https://donegraph.space
```

---

## 多平台安装

### Claude Code

```bash
/plugin marketplace add serein431/DoneGraph
/plugin install donegraph
```

### Codex / Cursor / VS Code / Gemini / OpenCode / Generic Agents

macOS / Linux：

```bash
./install.sh
./install.sh codex
./install.sh claude
./install.sh cursor
./install.sh --update
./install.sh --uninstall codex
```

支持的本地安装目标：

```text
codex, claude, cursor, vscode, gemini, opencode, generic
```

Cursor 和 VS Code 也可以通过这些元数据自动发现：

```text
.cursor-plugin/plugin.json
.copilot-plugin/plugin.json
```

---

## 和团队共享图谱

图谱只是本地产物。需要做 review、交接、演示或异步协作时，可以提交或附上这些文件：

```text
landing.html
.donegraph/task-graph.json
.donegraph/achievement-log.md
.donegraph/next-steps.md
.donegraph/dashboard.html
.donegraph/safe-snapshot.json
```

如果原始事件流里包含敏感任务备注，可以不要共享 `session.jsonl`。

自动云端上传的路径：

```bash
DONEGRAPH_UPLOAD_TOKEN=<token> donegraph publish --target https://donegraph.space
```

用户先打开 `https://donegraph.space/share` 创建上传空间，复制页面生成的 Agent 指令。Agent 拿到 token 后，就能在一个稳定节点自动上传安全快照。

如果云端还没配好，`donegraph publish` 仍会把 `.donegraph/safe-snapshot.json` 留在本地，用户可以去 `/share` 手动导入。

如果要启用云端上传，在部署环境里配置：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DONEGRAPH_PUBLIC_URL=https://donegraph.space
DONEGRAPH_SNAPSHOT_TABLE=donegraph_snapshots
DONEGRAPH_SPACE_TABLE=donegraph_upload_spaces
```

最小 Supabase 表结构：

```sql
create extension if not exists pgcrypto;

create table donegraph_upload_spaces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  upload_token_hash text not null unique
);

create table donegraph_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  space_id uuid references donegraph_upload_spaces(id) on delete set null,
  generated_at timestamptz,
  goal text,
  privacy_mode text,
  summary jsonb,
  snapshot jsonb not null
);
```

---

## 技术原理

### Clean-Room 协作 Schema

DoneGraph 不是代码依赖图。它的节点是协作事实：

```text
goal, task, decision, artifact, evidence, blocker, achievement, next_step
```

它的边描述任务如何推进：

```text
belongs_to_goal, continues_as, produced, verified_by,
blocked_by, decided_by, needs_followup, supersedes
```

`capture` 命令只读取 git 状态、文件名、`package.json` scripts 和可选目标等本地上下文。它不会消费 `.understand-anything`、外部 graph 文件或第三方 schema。

### 本地产物流水线

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
        |
        v
safe-snapshot.json 用来做单次安全分享
```

适配层保持很薄。图谱逻辑在 `packages/core`，CLI 和存储层在 `apps/cli`，各平台 wrapper 只把用户命令映射到同一个 CLI。

---

## 3 分钟黑客松 Demo

最短现场操作单见 [DEMO.md](../DEMO.md)。评审路径、路演稿、MVP 边界和降级方案见 [HACKATHON.md](../HACKATHON.md)。

```bash
npm install
npm run build

npm run cli -- start "Ship a hackathon demo that shows AI progress clearly" --platform codex
npm run cli -- capture --goal "Ship a standalone clean-room DoneGraph demo" --platform codex
npm run cli -- checkpoint "Implemented the command-first DoneGraph CLI" --command "npm test"
npm run cli -- checkpoint "Generated a static dashboard" --path ".donegraph/dashboard.html"
npm test
npm run cli -- proof "Tests passed" --pass --command "npm test"
npm run typecheck
npm run cli -- proof "Typecheck passed" --pass --command "npm run typecheck"
npm run build
npm run cli -- proof "Build passed" --pass --command "npm run build"
npm run cli -- checkpoint "The dashboard can replay the real work run" --path ".donegraph/dashboard.html"
npm run cli -- checkpoint "The dashboard can write a daily recap letter from the work record" --path ".donegraph/dashboard.html"
npm run cli -- done "The demo can now show completed work, evidence, and the next handoff"
npm run cli -- dashboard
open landing.html
```

只想生成 HTML 时使用 `--no-open`。

---

## 仓库结构

```text
apps/cli                  DoneGraph CLI 和本地产物存储
packages/core             图谱、摘要、Markdown、Dashboard 渲染
plugins/donegraph         Codex 插件根目录、skills 和 wrapper
platforms/*               其他 AI 环境的轻量接入说明
install.sh                多平台本地安装脚本
scripts/demo-donegraph.sh 3 分钟黑客松 demo 路径
landing.html              给评委看的产品落地页，内嵌生成后的 dashboard
donegraph-vercel-site/share.html 单次安全快照导入和发布页
```

## 验证

```bash
npm test
npm run typecheck
npm run build
```

如果本机有 Codex 系统 skill，可以额外校验插件包结构：

```bash
python3 "$HOME/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/donegraph
```

---

别再丢失任务线索。开始看见你和 AI 到底一起完成了什么。
