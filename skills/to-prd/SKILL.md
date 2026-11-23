---
name: to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context, or when a grill/planning session has resolved all open decisions and is ready to become a PRD.
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT re-interview the user — the grill already resolved the decisions; synthesize what you know. **This skill asks the user nothing.** Anything genuinely unresolved is carried to the Go gate (CLAUDE.md) with a recommendation, along with whatever `/to-issues` could not resolve, so the branch stops once rather than three times.

**Issue tracker = local markdown files in the issues directory named in CLAUDE.md's Project Profile** (e.g. `issues/`). PRDs are named `prd-<slug>.md`. Completed files get deleted from the working tree, so check git history for prior art: `git log --diff-filter=A --name-only -- <issues-dir>`.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Decide the module boundaries and which of them get tests, and record both in the PRD's Implementation and Testing Decisions. Module shape is a judgment call the codebase answers better than the user can, and "which modules do you want tested" has one right answer often enough that asking it was theatre. Carry it to the Go gate only when two boundaries are genuinely defensible and cost materially different amounts, and then with a recommendation.

3. Write the PRD using the template below, then save it to `<issues-dir>/prd-<slug>.md` with `status: ready-for-agent` in a frontmatter block. No further triage needed.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A numbered list of user stories, one per distinct actor and flow the feature touches. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>


## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
