---
name: watch-ci
description: >
  Babysit GitHub Actions after a push until every run is green, diagnosing
  and fixing failures as they land. Use after any push when asked to "watch
  CI", "babysit the pipeline", "make sure CI passes", or when the user
  accepts the /finish-branch watch offer.
---

# Watch CI

Watch every repo that was just pushed. Identify each repo's `--repo` value from `git remote get-url origin` (run it in each repo when the layout is nested). When multiple repos were pushed, watch the app repo first, since that's where app code is exercised.

## 1. Find the run

`gh run list --repo <repo> --branch <branch> --limit 1` and confirm its commit SHA matches what was pushed. Runs can take ~30s to appear; re-check once before concluding the workflow didn't trigger.

## 2. Watch, blocking first

`gh run watch <run-id> --repo <repo> --exit-status`, with a 10-minute timeout.

Deliberately NOT a wakeup loop at first: CI normally finishes in minutes, and a blocking watch stays cache-warm and cheap. Only if the timeout expires, switch to spaced wakeups (~4 minutes apart) until the run concludes. Persistence is the fallback, not the default.

## 3. Green

All watched runs green: report run URLs and stop.

## 4. Red: the fix loop

1. `gh run view <run-id> --repo <repo> --log-failed`
2. Reproduce locally before touching anything: run the failing step from the app directory using the project's build/test/lint commands (per CLAUDE.md's Project Profile). A failure that doesn't reproduce locally is environmental; investigate the workflow context (runtime version, missing env, cache) before blaming the code.
3. Fix the root cause, commit to the same branch, push (confirmation rule, never bypass), watch the new run from step 1.

**Cap: 3 fix rounds.** Still red after that means the diagnosis is wrong somewhere; stop and report everything found rather than thrashing.

## Red lines

- Never edit CI config, skip tests, or weaken lint rules to force a green. A green that doesn't mean anything is worse than a red.
- Never force-push.
- If the failure is in code that wasn't part of this push, report it as a pre-existing break; don't silently absorb unrelated fixes into the branch.
