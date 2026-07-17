---
name: implement
description: >
  Execute one issue file from the project issue tracker end to end: build,
  prove, two-stage review, commit on the feature branch. Use when asked to
  implement, build, do, or grab an issue ("implement issue 40", "do the next
  issue"), or when issues exist from /to-issues and the user says to start.
---

# Implement

Takes one issue from `<issues-dir>/<NN>-<slug>.md` (issues directory per CLAUDE.md's Project Profile) to a reviewed commit on the current feature branch. Merging and pushing are `/finish-branch`, not this skill.

"Next issue" = lowest-numbered file in the issues directory whose declared dependencies are all complete.

## 0. Guards

- Never build on the default branch (in a nested layout, neither repo's default branch). If on one, create `feat/<slug>` first.
- If the issue names a dependency that is still an open file, stop and say so.

## 1. Context

- Read the issue file and its PRD (`prd-<slug>.md`) if one exists.
- Read whatever architecture docs CLAUDE.md routes to for the areas the issue touches, if the project keeps any.
- 5+ implementation steps: `/track` fires (standing rule). The track checklist is the ledger for this run; check off as you go.

## 2. Build

- Schema change needed: the project's migration skill (`/new-migration` on Supabase stacks). Never inline SQL against prod.
- Complex logic or a new module: `/tdd` at the seams the issue names.
- Rhythm: lint and the touched test files as you go; the full suite once, at the end.

## 3. Prove

- Behavior change: `/verify-feature`. Seed, drive as the right role on the dev server, screenshot path is the proof.
- Pure style change: skip browser verification, flag for user eyeball (standing rule).

## 4. Review, two stages, fresh eyes

**Stage A, spec compliance.** Dispatch the `spec-reviewer` subagent (defined in `.claude/agents/spec-reviewer.md`, pinned to a high-effort model with fresh context). Its entire input is the issue file path and the PRD path if any; it runs `git diff` and `git status --porcelain` itself (from the app repo in a nested layout). Prompt shape:

> Spec-compliance review only, not code quality. Read `<issue path>` (and `<prd path>`). Inspect the diff and any untracked files. For each requirement and acceptance criterion in the issue, report DELIVERED, PARTIAL, or MISSING with file:line evidence. Also flag anything implemented that the issue never asked for.

The subagent must not receive your summary of the work. Fresh eyes are the point: it reads what the issue says, not what you meant.

**Stage B, code quality.** Run `/code-review` on the working diff.

**Fix loop.** Fix Critical/Important findings from both stages. A fix that changes behavior re-runs step 3. Cosmetic findings may be skipped with a one-line reason in the final report.

## 5. Close

- Full test suite green (test command per CLAUDE.md's Project Profile).
- Delete the completed issue file (tracker rule: git history is the archive).
- Commit to the current feature branch; reference the issue number in the message.
- Report: what shipped in plain English, proof screenshot path, findings fixed and skipped.

Never declare done with an unchecked track box, a failing test, or an unfixed Critical finding.

## Batch mode: `/loop /implement`

Looping this skill turns it into a backlog worker: each iteration takes the next unblocked issue through every gate above, unattended. Rules that only apply under the loop:

- **Skip, don't stall.** An issue that turns out blocked, ambiguous, or needing a user decision gets skipped with a one-line note; take the next unblocked issue.
- **Terminate cleanly.** No workable issues left (folder empty, or everything remaining is skipped/blocked): end the loop (stop the wakeups), then report the batch: issues shipped with proof paths, issues skipped with reasons.
- **Gates never relax.** Unattended means the same verify and review, not less. If a gate can't be satisfied without the user, that's a skip, not a shortcut.
- Still no merging or pushing; the batch ends where `/finish-branch` begins.
