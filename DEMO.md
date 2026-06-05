# DoneGraph Live Demo

## Open

```bash
npm install
npm run demo
open landing.html
```

Fallback, if you want to skip the product landing page:

```bash
open .donegraph/dashboard.html
```

## Talk Track

1. Start with the moment every vibe coder recognizes: AI helped for hours, and now you want it to tell you plainly what it touched, what it ran, and what to do next.
2. Run `npm run demo` or show that it just ran. It starts a DoneGraph session, lets the AI keep its own small ledger, runs test/typecheck/build, and generates the dashboard.
3. Open `landing.html`. Lead with the product promise: AI 不只回答你，它也能把自己这轮干过的活交代清楚.
4. Click `打开真实任务回放`. The dashboard opens with the plain promise: 这是 AI 自己的“小账本”：我动过哪些文件、我跑过哪些命令、我建议下次先做哪步.
5. Click `播放这次任务`. The page replays the real run: the user request, files touched, commands passed, and final handoff.
6. In `一分钟看懂我的账`, click `带我看懂`, advance with `下一步`, jump to any numbered step, then use `复制一句人话` if the submission form needs a short note.
7. Click `拆开这封信`. The AI has already written the recap; the user only opens it and reads what happened today.
8. Click `带我看一遍` when you want the AI ledger to talk itself through, ending with the opened daily recap letter.
9. Open `.donegraph/achievement-log.md` and `.donegraph/next-steps.md` when the judge wants the plain-text handoff.

## Judge Checklist

- The demo is local-first and does not need accounts or external writes.
- Evidence is explicit: `npm test`, `npm run typecheck`, and `npm run build`.
- `landing.html` gives the judge a product landing page first, then sends them into the real dashboard.
- The dashboard first screen uses plain vibe coding language plus an obvious interactive demo path, with a real-run replay, manual steps, automatic replay, and a copyable daily recap letter.
- The fallback files work even if the browser presentation fails.

## Backup Commands

```bash
npm test
npm run typecheck
npm run build
npm run cli -- dashboard --no-open
```
