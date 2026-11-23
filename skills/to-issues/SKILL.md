---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

**Issue tracker = local markdown files in the issues directory named in CLAUDE.md's Project Profile** (e.g. `issues/`), named `<NN>-<slug>.md`. Completed files get deleted from the working tree, so find the next number from git history: `git log --diff-filter=A --name-only -- <issues-dir>` (highest number ever used + 1).

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue reference (issue number, URL, or path) as an argument, fetch it from the issue tracker and read its full body and comments.

If the user passes a plan path (e.g. `plans/<slug>.md`, or a plan produced by `/improve`), read it as the source material: the plan plays the PRD's role. Do not re-interview the user or re-derive its decisions — slice it.

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

**What a finished cut looks like.** This is the bar the first cut has to clear, not an audit to run afterwards. A slice is not done being cut while any of these holds:

- Its title or scope names a layer ("schema", "API", "the UI", "backend") instead of a capability someone can use.
- Finishing it alone produces nothing a user action or a test can exercise end-to-end.
- Its acceptance criteria are all internal structure, not observable behavior.
- Nothing works until several of these slices land together.

To clear it: take the thinnest single user-observable behavior and drive THAT through every layer, instead of one layer across every behavior. Prefer a slice that does one real thing end-to-end — even hardcoded or ugly — over a "foundation" slice that does nothing observable.

Example — the same feature, sliced two ways:

- Horizontal (wrong): (1) create all tables, (2) build all API routes, (3) build the dashboard UI.
- Vertical (right): (1) dashboard shows one real metric from a real row end-to-end, (2) add a second metric, (3) user can filter by date.

### 4. Self-quiz, then publish

**Do not present the slice list to the user.** The rules in step 3 are the rules the user would apply, and re-confirming a cut the skill already made to spec is ceremony. The branch stops once, at the Go gate (CLAUDE.md), and the slice list is explicitly not part of it.

Run the five questions against your own breakdown instead, and re-cut where the answer is unsatisfying:

- Does the granularity feel right, or is a slice too coarse or too fine?
- Is any slice still horizontal, a layer rather than a usable behavior?
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked HITL and AFK?

What *does* go to the Go gate is anything you cannot resolve this way: a genuine product choice inside a slice, two defensible scopes with different costs, an HITL slice whose human step needs defining. Carry it there with a recommendation. If nothing is open, contribute nothing.

### 5. Publish the issues

For each slice, write a file `<issues-dir>/<NN>-<slug>.md` using the issue body template below, with `status: ready-for-agent` in a frontmatter block unless instructed otherwise.

Write issues in dependency order (blockers first) so you can reference real issue numbers in the "Blocked by" field.

Issue files are read by agents, not by the user. Write them for that reader: plain-English framing does not apply here. What must **not** live only here is an out-of-scope discovery or a suggestion, since the user never opens these files. Those go to the chat report's **Suggestions** section.

**Commit the issue files, and the PRD if this run produced one, before implementation starts.** They are untracked until then, and an untracked file has no history: `/implement` deletes each issue file as it closes, so on the first issue that deletion is permanent and no commit can honestly record it. One `docs(...)` commit for the planning artifacts, then the implementation commits delete them one by one, which is what makes `git log --diff-filter=A -- <issues-dir>` the archive the numbering step depends on.

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
