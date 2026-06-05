# DoneGraph Submit Copy

Use this file as the paste-ready pack for the UCWS submission form.

## Project Name

DoneGraph

## Tagline

Make AI progress inspectable.

## Short Description

DoneGraph is a local plugin that lets an AI show its work after a coding session. It records what the AI changed, which commands passed, what it delivered, and where the next session should start. Instead of asking a teammate, judge, or future AI to reread a long chat, DoneGraph turns the session into a replayable dashboard, proof log, and a warm daily recap letter from the AI to the user.

## Long Description

After a long vibe-coding session, the hard part is often not writing more code. It is remembering what actually happened.

The AI edited files, ran commands, changed direction, fixed some things, maybe left a few loose ends. A few hours later, the user is left with a long chat and one uncomfortable question: what is really done?

DoneGraph turns that moment into a product surface.

It is a local-first plugin for Codex, Claude Code, Cursor, Copilot-style tools, and shell-based agent workflows. During a session, the AI records goals, actions, artifacts, proof, blockers, and next steps into `.donegraph/`. At the end, DoneGraph generates a static dashboard that can replay the run: the original request, files touched, commands passed, delivered artifacts, and the suggested next step.

For this hackathon demo, the product also includes a daily recap letter written from the AI to the user. The letter says, in plain language, what the AI worked on today, what it verified, and where tomorrow should start. It keeps the emotional value without losing evidence.

The demo is intentionally local and inspectable. `npm run demo` starts a session, captures project context, records checkpoints, runs `npm test`, `npm run typecheck`, and `npm run build`, attaches the proof, and generates both `landing.html` and `.donegraph/dashboard.html`.

DoneGraph is not trying to understand every line of code. It models the collaboration layer people keep losing: what we asked the AI to do, what it actually did, how we know, and how to continue.

## Demo URL

Best option:

```text
Hosted landing.html URL
```

Fallback if no hosted URL is ready:

```text
https://github.com/serein431/DoneGraph#3-minute-hackathon-demo
```

## Repository URL

```text
https://github.com/serein431/DoneGraph
```

## Track

Skill

## Tech Stack

TypeScript, Node.js, npm workspaces, Vitest, static HTML/CSS dashboard, local JSONL event pipeline, Codex/Claude/Cursor-compatible plugin skills.

## How To Demo

```bash
npm install
npm run demo
open landing.html
```

Then click:

```text
打开真实任务回放
播放这次任务
带我看懂
写复盘信
```

## What Judges Should Notice

- The dashboard is generated from real local events, not a fake mock screen.
- Proof is attached to progress: `npm test`, `npm run typecheck`, and `npm run build`.
- The AI writes a daily recap letter to the user, so a normal vibe-coding user can understand what happened without reading the full chat.
- The product is local-first and easy to carry across agent workflows.

## One-Minute Pitch

DoneGraph answers the question every AI-assisted builder hits after a long session: what did the AI actually do?

It records the work while it happens, then turns the session into a replayable dashboard with files, commands, artifacts, proof, next steps, and a daily recap letter from the AI to the user. A judge can inspect it. A teammate can continue from it. The next AI session can start from it.
