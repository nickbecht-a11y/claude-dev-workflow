---
name: finish-branch
description: >
  Close out the current feature branch through the skill's ordered gates.
  Use when asked to finish, wrap up,
  land, or merge the branch, or to close out the feature.
---

# Finish Branch

Repo layout comes from CLAUDE.md's Project Profile:

- **Single repo** (the common case): the feature branch merges into the default branch.
- **Nested repos** (inner app repo tracked as a pointer/submodule by an outer repo): strict order — the inner repo merges first, then the outer repo commits a pointer bump to the merged SHA. Reversing the order leaves the pointer aimed at an unmerged branch commit.

## 1. Verify. Cannot proceed until green.

Run the project's build, test, and lint commands (per CLAUDE.md's Project Profile) — the same trio CI runs. Any red stops the skill; fix before continuing.

## 2. Pre-merge sweep

- **Thorough quality review of the whole branch.** Run it against the full branch diff from its merge-base (`git diff $(git merge-base <default> HEAD) HEAD`), with the `review` skill when working unattended. `/implement` already ran a cold spec read and an adversarial diff read per issue; this pass is the only review that sees how the issues interact rather than each in isolation. Fix Critical/Important findings before merging — a fix that touches behavior sends you back through step 1.
- **Tripwire on the per-issue review.** Note in `.claude/sharpen-log.md` whether the per-issue adversarial pass found anything this pass or the cold spec read would not have; `/implement` owns the `per-issue-review-no-yield` count. Say the count in the report.
- **Security review of the whole branch.** Run the built-in `/security-review` on the same merge-base diff, in addition to the quality pass, not instead of it. The quality review reads for correctness; this one reads for exploitable paths: auth and permission checks, injection, secrets, data exposed to the wrong role. Fix High and Medium findings before merging, and treat a fix the same as a quality fix (behavior touched sends you back through step 1). Low findings go in the report under **Suggestions**. Skip it only when the branch changes no executable code or schema (docs, skills, copy), and say that it was skipped.
- **Launch check.** If this branch takes something to production users for the first time (a client go-live, a new portal, a feature behind a flag being turned on), run `/shipping-and-launch` before merging: its pre-launch checklist, the rollback plan, and what gets watched in the first hour. Routine merges skip it.
- Completed issue files deleted from the issues directory? (`/implement` does this per issue; catch stragglers.)
- Structurally significant change on this branch (new role, major UI section, table, storage bucket, service, integration)? Assess against the branch's full diff from its merge-base with the default branch (`git diff $(git merge-base <default> HEAD) HEAD`), never `HEAD~1` — a multi-commit branch is more than its last commit. Update the project's architecture docs/diagrams, if it keeps any.
- Tracker complete? Delete it (git history is the archive). Do not move it to `.claude/tasks/archive/`.
- Uncommitted work: commit it now on the feature branch (in both repos if nested). Nothing merges dirty.

## 3. Merge and push

No options menu. The branch got its one approval at the Go gate before any of this was built; asking again here is the stop that was removed. Merge, push, and report.

Discarding a branch is the exception: never on your own initiative, only on explicit user request, and with confirmation.

## 4. Execute

- Merge the feature branch into the default branch. If the merge fast-forwarded, the tree is identical to the one step 1 already proved green — don't re-run. If it was a real merge (the default branch had moved on), the merged tree is code that has never existed anywhere before: run the test suite on it. Red merged result: stop and report.
- Nested layout only: after the inner repo is merged and green, stage the pointer plus any docs/plans/skills changes in the outer repo, commit `chore: bump <inner> pointer (<one-line summary>)`, then merge the outer feature branch. **One pointer bump per branch, here, not one per issue.**
- **Then check the pointer again, and re-bump it if it lags.** `git ls-tree HEAD <inner>` vs `git -C <inner> rev-parse <default>`. Any pointer staged earlier in the branch records the inner *branch* commit, and the `--no-ff` inner merge moves the inner default branch past it, so the merged outer tree points at a commit that only history reaches. It is the normal case, not an edge case. Same tree either way, so the fix is a one-line commit, but do it before pushing.

Push. Plain `git push` runs unattended, which is what lets the branch reach CI without the user; force-pushing stays blocked (CLAUDE.md, Permissions) and is never the answer here.

Then run `/watch-ci` and babysit the Actions runs until green, fixing failures. A branch that ends red while nobody is watching is what this prevents.

## 5. Clean up

Delete the merged feature branch (confirm first, permission rule; both repos if nested).

## 6. Sharpen

Run `/sharpen` on the whole branch's sessions while the context is still loaded. Its findings (or "clean run") append to the final report. This is the one moment with maximum evidence about how the workflow actually performed; don't skip it.

Sharpen's applied fixes (CLAUDE.md lines, skill edits, log breadcrumbs) are working-tree changes on the now-merged default branch. Commit them before reporting (`chore(sharpen): <summary>`) and push them with the rest. Never end the skill with a dirty default branch — the next feature branch would inherit and mis-attribute it.

## 7. The report

Close with CLAUDE.md's five-heading report, covering the branch rather than one issue. All five headings print, "none" where empty:

```
## Branch <name>

**Done** - plain English, what the user can now do across the whole branch; merged SHAs and what was pushed as a short tail
**Still needs work** - none, or each item with why
**Bugs** - found and fixed during the branch; anything not fixed, with why
**Suggestions** - out-of-scope ideas the branch surfaced, plus sharpen's findings (or "clean run")
**Questions** - decisions needed from the user, including anything an issue was skipped for
```

This is the message the user actually reads, so **Done** is written for a product owner: what they can now do, not which files moved. Everything deferred to them lands in **Questions**, never trailing off the end of another section.
