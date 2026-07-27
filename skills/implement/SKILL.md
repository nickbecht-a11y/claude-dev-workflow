---
name: implement
description: >
  Take one issue file from the project issue tracker to a reviewed commit on
  the feature branch, through the skill's mandatory gates. Use when asked to
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

- Record the issue base before any changes: `git rev-parse HEAD`. Both review stages diff from this SHA, so mid-issue commits stay in scope.
- Read the issue file and its PRD (`prd-<slug>.md`) if one exists.
- Read whatever architecture docs CLAUDE.md routes to for the areas the issue touches, if the project keeps any.
- 5+ implementation steps: `/track` fires (standing rule). The track checklist is the ledger for this run; check off as you go.

## 2. Build

- Schema change needed: the project's migration skill (`/new-migration` on Supabase stacks). Never inline SQL against prod.
- Complex logic or a new module: `/tdd` at the seams the issue names.
- Issue designs or redesigns a page section with no approved visual spec: `/visual-spec` before any markup/CSS. The design stage being optional doesn't skip the lock; visual-spec's own rule is no HTML/CSS until the spec is approved.
- Rhythm: lint and the touched test files as you go; the full suite once, at the end.

## 3. Prove

- Behavior change: `/verify-feature`. Seed, drive as the right role on the dev server, and confirm what the app actually renders. Driving it is the proof; the capture is how you look.
- Pure style change: skip browser verification, flag for user eyeball (standing rule).

## 4. Review with fresh eyes

**Spec compliance — the cold read.** Dispatch the `spec-reviewer` subagent (defined in `.claude/agents/spec-reviewer.md`, pinned with fresh context). Its entire input is the issue file path, the PRD path if any, the issue base SHA from step 1, and instructions to run the diff and `git status --porcelain` itself (from the app repo in a nested layout). Prompt shape:

> Spec-compliance review only, not code quality. Read `<issue path>` (and `<prd path>`). Inspect the diff from `<issue base SHA>` (`git diff <sha>`) and any untracked files. For each requirement and acceptance criterion in the issue, report DELIVERED, PARTIAL, or MISSING with file:line evidence. Also flag anything implemented that the issue never asked for.

The subagent must not receive your summary of the work. This is not a re-check of what you just did — it is the one read nobody has done yet. You remember the issue as whatever you built from it; a reader handed no story cannot make that mistake. That asymmetry is the whole value, so protect it. Do not pre-judge its findings either: never tell the reviewer what to downrate or skip ("don't flag the X we discussed", "treat Y as minor"). A finding you expect to be a false positive still surfaces, and you adjudicate it in the fix loop — pre-judging defeats the fresh eyes. The diff base is always the step-1 issue base: never `HEAD~1` (drops all but the last mid-issue commit) and never the branch merge-base (drags prior issues' work into this issue's review).

**Code quality — quick pass.** Run `/code-review` on the working diff — from the same issue base if commits happened mid-issue, so the whole issue is reviewed, not just the uncommitted remainder. Keep this one quick and deliberately shallow. The thorough quality pass runs once per branch in `/finish-branch`, against the full branch diff, where it can see how the issues interact — which a one-issue-at-a-time read structurally cannot.

**Fix loop.** Fix Critical/Important findings. If a fix changes behavior, the step-3 proof no longer describes reality — drive it again. Cosmetic findings may be skipped with a one-line reason in the final report.

## 5. Close

- Full test suite green (test command per CLAUDE.md's Project Profile).
- Delete the completed issue file (tracker rule: git history is the archive).
- Commit to the current feature branch; reference the issue number in the message.
- Report: what shipped in plain English, what was exercised in the browser and what it showed, findings fixed and skipped.

Never declare done with an unchecked track box, a failing test, or an unfixed Critical finding.

## Batch mode: `/loop /implement`

Looping this skill turns it into a backlog worker: each iteration takes the next unblocked issue through every gate above, unattended. Rules that only apply under the loop:

- **Skip, don't stall.** An issue that turns out blocked, ambiguous, or needing a user decision gets skipped with a one-line note; take the next unblocked issue.
- **Terminate cleanly.** No workable issues left (folder empty, or everything remaining is skipped/blocked): end the loop (stop the wakeups), then report the batch: issues shipped and what proved each one, issues skipped with reasons.
- **Gates never relax.** Unattended means the same verify and review, not less. If a gate can't be satisfied without the user, that's a skip, not a shortcut.
- Still no merging or pushing; the batch ends where `/finish-branch` begins.
