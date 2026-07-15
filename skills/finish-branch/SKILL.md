---
name: finish-branch
description: >
  Close out the current feature branch: CI trio green, pre-merge sweep,
  merge in the right order, then cleanup. Use when asked to finish, wrap up,
  land, or merge the branch, or to close out the feature.
---

# Finish Branch

Repo layout comes from CLAUDE.md's Project Profile:

- **Single repo** (the common case): the feature branch merges into the default branch.
- **Nested repos** (inner app repo tracked as a pointer/submodule by an outer repo): strict order — the inner repo merges first, then the outer repo commits a pointer bump to the merged SHA. Reversing the order leaves the pointer aimed at an unmerged branch commit.

## 1. Verify. Cannot proceed until green.

Run the project's build, test, and lint commands (per CLAUDE.md's Project Profile) — the same trio CI runs. Any red stops the skill; fix before continuing.

## 2. Pre-merge sweep

- Completed issue files deleted from the issues directory? (`/implement` does this per issue; catch stragglers.)
- Structurally significant change on this branch (new role, major UI section, table, storage bucket, service, integration)? Update the project's architecture docs/diagrams, if it keeps any.
- `.claude/tasks/active.md` complete? Archive to `.claude/tasks/archive/`.
- Uncommitted work: commit it now on the feature branch (in both repos if nested). Nothing merges dirty.

## 3. Present options. Ask, don't assume.

1. Merge and push (the usual)
2. Merge locally, push later
3. Keep the branch as-is, stop here
4. Discard the branch. Never offer this unprompted; only on explicit user request, with confirmation.

## 4. Execute (options 1 and 2)

- Merge the feature branch into the default branch, then re-run the test suite on the merged result. Red merged result: stop and report.
- Nested layout only: after the inner repo is merged and green, stage the pointer plus any docs/plans/skills changes in the outer repo, commit `chore: bump <inner> pointer (<one-line summary>)`, then merge the outer feature branch.

Push only for option 1. Pushing always goes through user confirmation (permission rule, never bypass).

After pushing, offer `/watch-ci`: babysit the Actions runs until green, fixing failures. Offered, never started silently.

## 5. Clean up

Delete the merged feature branch (confirm first, permission rule; both repos if nested). Final report: merged SHAs, what was pushed, anything deferred to the user.

## 6. Sharpen

Run `/sharpen` on the whole branch's sessions while the context is still loaded. Its findings (or "clean run") append to the final report. This is the one moment with maximum evidence about how the workflow actually performed; don't skip it.
