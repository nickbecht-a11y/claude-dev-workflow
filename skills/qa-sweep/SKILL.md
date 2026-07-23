---
name: qa-sweep
description: >
  Full-app QA run over live features, ending in a defect report and
  immediate fixes for everything not blocked on missing code. Use when
  asked to "QA", "test all features",
  "run through the app", or after a large batch of changes lands. Distinct
  from /verify-feature (single feature) and /code-review (diff review).
---

# QA Sweep

Sweep every feature in scope, report every one, fix what's fixable, flag what isn't. The failure mode this skill exists to prevent: features silently passed over, and finished QA reports that stop short of fixing anything.

## Setup

1. `/track` the run — a sweep is always 5+ steps.
2. Report file: `qa-report/QA-REPORT.md` (create or append a dated section). Screenshots: `screenshots/qa-<date>/`.
3. Enumerate scope BEFORE testing: list every feature/page/sub-tab from the router, CLAUDE.md's code map, and nav menus. The list is the contract — each entry must appear in the report.
4. Roles per CLAUDE.md's Project Profile; test credentials in a memory file, never the repo. Local dev servers on one port per role avoids session churn.

## Statuses — every scoped item gets exactly one

| Status | Meaning | Requires |
|---|---|---|
| PASS | Works, proven | Screenshot path in report |
| FAIL | Broken | Defect entry (numbered D1, D2, …) with file:line root cause where known |
| BLOCKED | Needs code/design that doesn't exist | Exact reason: what's missing, what would unblock |
| COVERED-BY-UNIT | Math/logic proven by unit tests | Test file name |

Cross-check UI against the database with the project's DB access (e.g. an MCP SQL tool) — "renders without error" is not PASS if the data shown contradicts the database.

## Fix phase — runs immediately after the sweep, no permission stop

- **Mechanical fixes (fix silently):** wrong query method, missing insert column, CSS overflow, invalid HTML, stale hardcoded values, dead code. Anything where "correct" is objective.
- **Judgment-call fixes (fix, but flag):** display semantics, wording, what a "correct" data value is, live-DB data corrections. Fix them, but mark each distinctly in the report so the call can be vetoed.
- **BLOCKED = decision-only.** New code, new features, unfinished design handoffs: present, never build unprompted.
- Every fix is browser-verified with a `fix-*.png` screenshot, and the project's test + build commands must be green before declaring done.

## The ratchet — judgment calls shrink over time

Every judgment-call flag that gets accepted or vetoed becomes a written rule so that class of question never recurs as a judgment call:

- **Data-validity questions** → a DB constraint via the project's migration path (e.g. `CHECK (attendees <= headcount)`)
- **Value-semantics questions** → convention in the project's CONTEXT.md (e.g. "not measured is NULL, never 0")
- **Behavioral-intent questions** → one acceptance line in the project's CONTEXT.md

Recording the decision is part of the fix, not follow-up work.

## Hygiene

- Log every seeded row (table + id) in a cleanup section of the report; delete and verify zero residue at the end.
- Restore any state mutated during testing (profile fields, preferences).
- Console errors and warnings observed during the walkthrough are findings too — triage them even when the page "looks fine".
