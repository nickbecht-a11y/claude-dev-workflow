---
name: track
description: >
  Persistent task tracker. Creates a checklist file that survives context compression.
  Auto-triggers when a task has 5+ steps. Manual invoke via /track. The only way
  to declare a task done is when every checkbox is checked.
---

# Task Tracker

Solves the problem where long task lists get compacted out of context and Claude declares done prematurely.

## Triggers

**Auto-trigger** — when you lay out a plan with 5 or more distinct steps and the user says to execute it, create the tracking file before starting any work.

**Manual trigger** — user invokes `/track` explicitly on any task, regardless of step count.

## Step 1 — Write the tracking file

Write `.claude/tasks/active.md` immediately, before any implementation begins:

```md
# Active Task: <short task name>
Started: <YYYY-MM-DD>

## Steps
- [ ] Step 1: <description>
- [ ] Step 2: <description>
- [ ] Step 3: <description>
...
```

Tell the user: "Tracking file created at `.claude/tasks/active.md`. Will check off each step as completed."

## Step 2 — Execute with live check-offs

After completing each step, **immediately** edit `.claude/tasks/active.md` to mark it done:

```md
- [x] Step 1: <description>
```

Do this before moving to the next step. Not at the end. Not in a batch. One step done → one box checked → then continue.

If new steps are discovered mid-task (scope expands, a step reveals sub-steps, user adds requirements), append them to the file under a `## Added Steps` section and check them off the same way.

## Step 3 — Completion check

Before declaring the task done, read `.claude/tasks/active.md` and count unchecked items (`- [ ]`).

- **Any unchecked items** → list them, continue working. Do not say "done".
- **All checked** → proceed to Step 4.

This is a hard rule. Never summarize as complete while `- [ ]` items remain in the file.

## Step 4 — Archive

When all items are checked:

1. Move the file to `.claude/tasks/archive/` with a timestamped name: `YYYY-MM-DD-<task-slug>.md`
2. Confirm to the user: "All steps complete. Archived to `.claude/tasks/archive/<filename>`."

Use PowerShell `Move-Item` or `Copy-Item` + delete to archive. Example:
```powershell
Move-Item ".claude/tasks/active.md" ".claude/tasks/archive/2026-06-25-migration-rls-fix.md"
```

## Rules

- **File is source of truth, not context.** Even if you remember the steps, re-read the file before declaring done.
- **Multiple sessions**: if a new `/track` is invoked while `active.md` already exists, start a new file anyway — rename the old one to `active-previous.md` first, or append a timestamp suffix. Do not block or refuse.
- **Context compression**: the file persists on disk. After compaction, re-read `.claude/tasks/active.md` at the start of the next turn to restore task state.
- **Never skip the archive step.** A task without an archive entry is a task that might get reopened.
