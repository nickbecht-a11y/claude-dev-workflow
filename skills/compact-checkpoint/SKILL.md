---
name: compact-checkpoint
description: Save current task state to memory then compact the conversation. Use at natural task boundaries when the session is getting long. Never call mid-implementation.
---

# Compact Checkpoint

Preserves context across a compaction boundary. Always two steps: save first, then compact.

## When to use

- After completing a feature, fix, or audit pass
- Before starting a new unrelated task
- When explicitly asked to compact
- **Never** mid-task (finish the current implementation first, or note the stopping point explicitly in memory)

## Step 1 — Write a project memory file

Write (or update) a memory file in the auto-memory directory covering:

| What to capture | Example |
|---|---|
| Task just completed | "Removed GoalsCard from BaselinesSection.jsx" |
| Files edited and what changed | "ClientReports.css: centered card-type, card-period; full-width download btn on mobile" |
| Patterns established this session | "All client page cards: centered titles, centered section headings" |
| Pending / next items | "Baseline sync investigation still open" |
| Active branch / issue numbers | "branch: master, no open issue yet" |

Use memory type `project`. Be specific with file paths and class names — vague summaries don't survive future sessions.

## Step 2 — Run `/compact` with project focus

After saving memory, run:

```
/compact Preserve: active file paths and what changed, pending tasks, patterns established (mobile CSS breakpoints, centering conventions, button styles, RLS rules), any open bugs or questions. Do not discard specific class names or file paths.
```

## After compaction

Read relevant memory files to restore context before continuing work.

## Rules

- **Task boundary only** — if mid-implementation, finish or explicitly document the stopping point in memory first
- Memory is the continuity layer — anything not in memory is at risk after compaction
- Auto-compaction (via `PreCompact` hook) runs Haiku to snapshot state automatically, but manual checkpoints are higher quality
