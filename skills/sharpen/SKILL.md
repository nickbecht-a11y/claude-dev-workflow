---
name: sharpen
description: >
  Post-work retrospective on the session itself, not the code. Scans for
  friction, applies the cheapest fix that prevents it recurring, and logs
  breadcrumbs so repeated friction can earn a new skill. Runs as the final
  step of /finish-branch; also use when the user says "sharpen", "retro",
  "that felt rough", or asks what could have gone smoother.
---

# Sharpen

Sharpen the saw: the session is the test run, and the tools come out sharper.

Reviews how the work went, not what was built. The most common correct outcome is **nothing**. A sharpen pass that always produces a proposal is broken; suggesting something must never be the default just because it looks helpful.

## 1. Scan the session for friction

Concrete signals only. No philosophizing:

- User corrected or redirected mid-task
- A command was retried or a fix was redone
- A permission denial changed the approach
- Context had to be hunted for that CLAUDE.md should have routed in one hop
- A gate was forgotten until late (verify, review, diagram, migration skill)
- A skill that should have fired didn't, or fired when it shouldn't
- A skill fired and its instructions were incomplete, wrongly ordered, or stale (didn't match how the work actually had to go)
- A stale file, path, or rule misled the work
- The user re-prompted the same action repeatedly, or work sat waiting on external state until the user poked it: loop-shaped friction. The fix is usually a batch/loop-safe mode on an existing skill (see implement's Batch mode) or a note that the workflow is `/loop`-able, not a new skill.

No signals: say "clean run, nothing to codify" and stop.

## 2. Fix at the cheapest level that prevents recurrence

Strict order. Take the first level that fully prevents the friction, never a higher one:

1. **Nothing.** One-off, external cause, or already fixed in passing.
2. **One line.** Add/fix a CLAUDE.md rule or pointer, or a memory file. Apply immediately.
3. **Edit an existing skill.** Sharpen a trigger phrase, add a missed step, reorder steps to match reality, fix a stale path. This is how existing skills self-improve: the sharpen pass folds what actually happened back into the skill. Apply immediately.
4. **New skill.** Only with repeat evidence (below), and only ever proposed to the user, never auto-created. If approved, `/write-a-skill` does the writing.

## 3. Breadcrumbs and the rule of three

The log is `.claude/sharpen-log.md`, append-only, one line per friction event:

```
- 2026-07-15 | <kebab-slug> | <one-line description of the friction>
```

For each friction that level 2 or 3 could not fully prevent (it's procedural, multi-step, would need its own instructions):

- Grep the log for the same or a near-matching slug.
- **Fewer than 3 occurrences**: append a breadcrumb and move on. One occurrence is an anecdote.
- **3 or more**: it's a procedure. Propose the new skill to the user with the log lines as evidence.

When a proposed skill ships, delete its breadcrumb lines from the log.

## 4. Report

A few lines, plain English: friction found (or "clean run"), fixes applied at which level, breadcrumbs appended, any skill proposal with its evidence. Never pad this.
