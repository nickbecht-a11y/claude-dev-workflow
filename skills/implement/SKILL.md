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
- Issue designs or redesigns a page section with no visual spec: `/visual-spec` before any markup/CSS. The spec still gets written, because it is what stops the JSX drifting; what it no longer does is stop and wait. Anything it cannot resolve from the design system went to the Go gate before the branch started, so by here every decision is made.
- Rhythm: lint and the touched test files as you go; the full suite once, at the end.

## 3. Prove

- Behavior change: `/verify-feature`. Seed, drive as the right role on the dev server, and confirm what the app actually renders. Driving it is the proof; the capture is how you look.
- Pure style change: skip browser verification, flag for user eyeball (standing rule).
- **No write-up.** UI proof is reported in the step 5 report, not filed. Only schema (`<NN>-<slug>.verify.sql`) and deployed edge function behaviour (`qa-report/<NN>-<slug>.md`) earn a file, because neither can be re-derived from the repo later. See CLAUDE.md's Verification section.

## 3b. Bugs found along the way

A bug you trip over while building this issue gets **fixed in this issue's commit**. Do not file it, do not report it and move on. It appears in the report under **Bugs**, as fixed.

The one exception is a fix that needs a product decision (which of two behaviours is correct, what a user should see). That goes to the report's **Questions** with the proposed fix attached, named plainly, never left as a bare observation.

If the fix is large enough to be its own issue, still fix it if it blocks this issue; otherwise put it in **Suggestions** with what you found and where.

## 4. Review with fresh eyes

**Two passes.** They ask different questions, and the second one is the point:

1. **The cold spec read**, below. Were the issue's requirements met?
2. **An adversarial read of the issue's own diff.** Assume it is broken and go looking. This is not a second spec read: a spec read asks whether the criteria are met, and passes code that meets them while being wrong. Run the `review` skill's Standards axis against the step-1 issue base SHA, or do it inline and say so in the report. `/code-review` is the user's to type and is not reachable from an unattended run.

If three consecutive branches run pass 2 and it surfaces nothing the other gates would have caught, log `per-issue-review-no-yield` to `.claude/sharpen-log.md` and cut it again.

**Spec compliance — the cold read.** Dispatch the `spec-reviewer` subagent (defined in `.claude/agents/spec-reviewer.md`, pinned with fresh context). Its entire input is the issue file path, the PRD path if any, the issue base SHA from step 1, and instructions to run the diff and `git status --porcelain` itself (from the app repo in a nested layout). Prompt shape:

> Spec-compliance review only, not code quality. Read `<issue path>` (and `<prd path>`). Inspect the diff from `<issue base SHA>` (`git diff <sha>`) and any untracked files. For each requirement and acceptance criterion in the issue, report DELIVERED, PARTIAL, or MISSING with file:line evidence. Also flag anything implemented that the issue never asked for. Deliver the report through your handback when done.

The subagent must not receive your summary of the work. This is not a re-check of what you just did — it is the one read nobody has done yet. You remember the issue as whatever you built from it; a reader handed no story cannot make that mistake. That asymmetry is the whole value, so protect it. Do not pre-judge its findings either: never tell the reviewer what to downrate or skip ("don't flag the X we discussed", "treat Y as minor"). A finding you expect to be a false positive still surfaces, and you adjudicate it in the fix loop — pre-judging defeats the fresh eyes. The diff base is always the step-1 issue base: never `HEAD~1` (drops all but the last mid-issue commit) and never the branch merge-base (drags prior issues' work into this issue's review).

**Fix loop.** Fix Critical/Important findings. If a fix changes behavior, the step-3 proof no longer describes reality — drive it again. Cosmetic findings may be skipped with a one-line reason in the report.

## 5. Close

- Full test suite green (test command per CLAUDE.md's Project Profile).
- Tick the acceptance criteria in the issue file one by one, then delete it (git history is the archive). A criterion about what a user *receives* is ticked against the surface, not the diff.
- **Carry the ticked list into the commit body.** "git history is the archive" is only true of what git actually holds, and the ticks usually are not: the file is committed unticked when `/to-issues` publishes it, ticked in the working tree here, then deleted, so the ticked version never becomes a commit and history shows added-unticked then deleted-unticked. A later reviewer reading that history rightly treats the work as unverified. Paste the ticked list with its per-criterion evidence under the commit's prose.
- Commit to the current feature branch; reference the issue number in the message.
- **The report**, in CLAUDE.md's five-heading format. All five headings print, "none" where empty:

```
## Issue <NN>: <title>

**Done** - plain English, what the user can now do; what was driven in the browser and what it showed
**Still needs work** - none, or each item with why
**Bugs** - found and fixed here; anything not fixed, with why
**Suggestions** - out-of-scope ideas this issue surfaced
**Questions** - decisions needed from the user
```

**Suggestions** is the only place an out-of-scope discovery lands. The user does not read issue files, so writing it to one instead does not count; writing it to one *as well* is fine.

Never declare done with an unchecked track box, a failing test, or an unfixed Critical finding.

## Batch mode: `/loop /implement`

Looping this skill turns it into a backlog worker: each iteration takes the next unblocked issue through every gate above, unattended. Rules that only apply under the loop:

- **Skip, don't stall.** An issue that turns out blocked, ambiguous, or needing a user decision gets skipped with a one-line note; take the next unblocked issue. The reason goes to the batch report's **Questions**, phrased as the decision needed, not as a status.
- **Terminate cleanly.** No workable issues left (folder empty, or everything remaining is skipped/blocked): end the loop (stop the wakeups), then post one batch report in the same five-heading format, covering the run rather than a single issue.
- **Gates never relax.** Unattended means the same verify and review, not less. If a gate can't be satisfied without the user, that's a skip, not a shortcut.
- Still no merging or pushing; the batch ends where `/finish-branch` begins.
