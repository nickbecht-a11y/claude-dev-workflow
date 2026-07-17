---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
disable-model-invocation: true
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

**Issue tracker = local markdown files in the issues directory named in CLAUDE.md's Project Profile** (e.g. `issues/`), named `<NN>-<slug>.md`. Completed files get deleted from the working tree, so find the next number from git history: `git log --diff-filter=A --name-only -- <issues-dir>` (highest number ever used + 1).

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue reference (issue number, URL, or path) as an argument, fetch it from the issue tracker and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- A slice named after a layer (schema, API, UI) is horizontal by definition — re-cut it
</vertical-slice-rules>

### 4. Re-cut for verticality (mandatory self-audit)

Before showing anyone the breakdown, re-read your own draft and re-cut any horizontal slice. A slice is horizontal if any of these holds:

- Its title or scope names a layer ("schema", "API", "the UI", "backend") instead of a capability someone can use.
- Finishing it alone produces nothing a user action or a test can exercise end-to-end.
- Its acceptance criteria are all internal structure, not observable behavior.
- Nothing works until several of these slices land together.

To re-cut: take the thinnest single user-observable behavior and drive THAT through every layer, instead of one layer across every behavior. Prefer a slice that does one real thing end-to-end — even hardcoded or ugly — over a "foundation" slice that does nothing observable.

Example — the same feature, sliced two ways:

- Horizontal (wrong): (1) create all tables, (2) build all API routes, (3) build the dashboard UI.
- Vertical (right): (1) dashboard shows one real metric from a real row end-to-end, (2) add a second metric, (3) user can filter by date.

Only slices that survive this pass go to the quiz.

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Is any slice still horizontal — a layer rather than a usable behavior?
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 6. Publish the issues

For each approved slice, write a file `<issues-dir>/<NN>-<slug>.md` using the issue body template below, with `status: ready-for-agent` in a frontmatter block unless instructed otherwise.

Write issues in dependency order (blockers first) so you can reference real issue numbers in the "Blocked by" field.

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking ticket (if any)

Or "None - can start immediately" if no blockers.

</issue-template>

Do NOT close or modify any parent issue.
