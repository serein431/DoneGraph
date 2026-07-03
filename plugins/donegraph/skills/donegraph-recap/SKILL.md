---
name: donegraph-recap
description: One-click session recap. AI-analyzes git history, runs checks, and generates a visual dashboard with narrative story, insights, and risks.
argument-hint: "[--last <n>] [--since <time>] [--lang en|zh]"
---

# /donegraph-recap

Generate an AI-powered visual recap of the current working session.

## Step 1: Gather context

Run these commands and read the output:

```bash
git log --oneline -20
git diff --stat HEAD~5 2>/dev/null || git diff --stat
```

## Step 2: Analyze and write analysis JSON

Based on the git output, write your analysis to `.donegraph/analysis.json` in this exact format:

```json
{
  "version": "1",
  "summary": "One-sentence summary of what this session accomplished",
  "story": "A 2-3 sentence narrative telling the story of this work session — what problem was tackled, how it was approached, and what the outcome was. Write like a thoughtful colleague summarizing the day, not like a changelog.",
  "items": [
    {
      "title": "Short title of what was done",
      "detail": "Why this matters or what it achieved",
      "type": "goal|decision|action|artifact|verification|completion",
      "status": "pass|fail|unknown"
    }
  ],
  "risks": ["Any risks or concerns spotted in the changes"],
  "insights": ["Non-obvious observations about the work pattern or code quality"],
  "next_steps": ["What should happen next based on this session"]
}
```

Guidelines for writing the analysis:
- `items` should be 5-10 meaningful events, NOT one per commit — group related commits into logical steps
- `story` should be warm and human, not mechanical — tell what happened and why it matters
- `risks` should flag real concerns (missing tests, breaking changes, security implications), not generic warnings
- `insights` should be genuinely useful observations (patterns, architecture decisions, quality trends)
- Use `type: "goal"` for the first item, `type: "completion"` for the last, and appropriate types in between

## Step 3: Run recap with analysis

```bash
../../scripts/donegraph recap --analysis .donegraph/analysis.json --lang en $ARGUMENTS
```

This will:
1. Run project checks (test, typecheck, build) automatically
2. Use your AI analysis for the narrative and events
3. Generate a visual dashboard with your story, insights, and risks
4. Open it in the browser

## When to use

Use this when the user says any of:
- "summarize what we did" / "recap" / "what did we accomplish"
- "wrap up" / "show me what changed"
- Or at any natural stopping point
