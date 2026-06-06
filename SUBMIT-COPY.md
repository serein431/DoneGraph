# DoneGraph Submit Copy

Use this file as the paste-ready pack for the UCWS submission form.

## Project Name

DoneGraph

## Tagline

Your AI finally shows its work.

## Short Description

DoneGraph makes AI work trustworthy after the run. It captures what the agent changed, which commands passed, what shipped, what stayed unresolved, and where the next session should begin. Instead of forcing a user, teammate, or future AI to dig through a long chat, DoneGraph turns the session into a replayable work trail, attached proof, an AI-written recap letter, Agent Radio, and automatic safe snapshot upload.

## Long Description

After a long vibe-coding session, the hard part is often not writing more code. It is knowing what actually happened, what can be trusted, and where to continue.

The AI edited files, ran commands, changed direction, fixed some things, maybe left a few loose ends. A few hours later, the user is left with a long chat and one uncomfortable question: what is really done?

DoneGraph turns that moment into a product surface.

It is an AI work-trail product for Codex, Claude Code, Cursor, Copilot-style tools, and shell-based agent workflows. During a session, the AI records goals, actions, artifacts, proof, blockers, and next steps into `.donegraph/`. At the end, DoneGraph generates a dashboard that can replay the run: the original request, files touched, commands passed, delivered artifacts, and the suggested next step.

The live product is available at `https://donegraph.space`. A user can create an upload space, copy one Agent instruction, and let the agent upload safe snapshots automatically. The cloud upload uses a private Vercel Blob-backed API, while the safe snapshot excludes raw chat, file contents, local machine paths, and secrets.

For this hackathon demo, the product also includes a daily recap letter written from the AI to the user. The letter says, in plain language, what the AI worked on today, what it verified, and where tomorrow should start. It keeps the emotional value without losing evidence.

The demo is intentionally local and inspectable. `npm run demo` starts a session, captures project context, records checkpoints, runs `npm test`, `npm run typecheck`, and `npm run build`, attaches the proof, and generates both `landing.html` and `.donegraph/dashboard.html`.

DoneGraph is not trying to understand every line of code. It models the collaboration layer people keep losing: what we asked the AI to do, what it actually did, how we know, and how to continue.

## Demo URL

Best option:

```text
https://donegraph.space
```

Agent onboarding:

```text
https://donegraph.space/share
```

## Repository URL

```text
https://github.com/serein431/DoneGraph
```

## Track

Skill

## Tech Stack

TypeScript, Node.js, npm workspaces, Vitest, static HTML/CSS dashboard, Vercel, Vercel Blob, local JSONL event pipeline, Codex/Claude/Cursor-compatible plugin skills.

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

## What Reviewers Should Notice

- The dashboard is generated from real local events, not a fake mock screen.
- Proof is attached to progress: `npm test`, `npm run typecheck`, and `npm run build`.
- The AI writes a daily recap letter to the user, so a normal vibe-coding user can understand what happened without reading the full chat.
- The product is local-first and easy to carry across agent workflows.

## One-Minute Pitch

DoneGraph answers the scariest question after an AI run: what did it actually do, and can I trust it?

It records the work while it happens, then turns the session into a replayable dashboard with files, commands, artifacts, proof, next steps, and a daily recap letter from the AI to the user. A reviewer can inspect it. A teammate can continue from it. The next AI session can start from it.
