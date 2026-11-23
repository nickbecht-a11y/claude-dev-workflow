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

## Step 4 — Delete

When all items are checked, delete the tracker. Git history is the archive.

Do not move it to an archive folder: its whole purpose ends when the task does. If the tracker was ever committed, `git log --diff-filter=A --name-only -- .claude/tasks/` still finds it.

A tracker is a document under CLAUDE.md's Permissions carve-out, so deleting it needs no confirmation, provided it is tracked. If it never got committed (`git log --all -- <path>` returns nothing) it has no history to recover from, and the carve-out does not apply: delete it only with a go-ahead.

**Do not commit the tracker on every tick.** Ticking a box is not a commit-worthy event; the file exists to survive compaction, not to be versioned. Commit it once at branch end if at all, together with the work.

## Rules

- **File is source of truth, not context.** Even if you remember the steps, re-read the file before declaring done.
- **Multiple sessions**: if a new `/track` is invoked while `active.md` already exists, start a new file anyway — rename the old one to `active-previous.md` first, or append a timestamp suffix. Do not block or refuse.
- **Context compression**: the file persists on disk. After compaction, re-read `.claude/tasks/active.md` at the start of the next turn to restore task state.
- **Never leave a finished tracker on disk.** A stale tracker actively misleads: a later session plans from a claim about the world that is no longer true.
