# DoneGraph for Claude Code

## Install

```bash
./install.sh claude
```

## Usage

At the end of any coding session, just say:

> "recap what we did" or type `/donegraph-recap`

DoneGraph will automatically:
1. Scan your recent git commits
2. Run test / typecheck / build
3. Score the session's accountability
4. Open a visual dashboard in the browser

That's it. One command, full recap.

## What you get

`.donegraph/dashboard.html` — a page-turning visual journal showing:
- What was completed, with evidence stamps
- 6-dimension accountability score
- Handoff notes for the next session

## Advanced: step-by-step tracking

For more control during a session:

```bash
/donegraph-start Build the demo handoff graph
/donegraph-checkpoint Implemented dashboard generation
/donegraph-proof Tests passed --pass --command "npm test"
/donegraph-done Ready for handoff
/donegraph-dashboard
```
