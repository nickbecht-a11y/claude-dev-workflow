---
name: boardroom
description: >
  Convene a five-seat adversarial board against a resolved plan, after the
  grill and before /to-prd. Fresh-context subagents attack the plan from
  fixed perspectives; the user rules on every concern and rulings are written
  into the PRD. Use when the user says "boardroom", "convene the board",
  "board review", or accepts the /to-prd sensitive-plan offer.
---

# Boardroom

The grill resolves decisions *with* the user, so it inherits the blind spots the user and the model share. The board attacks the resolved plan from outside. It is ceremony with real cost; most features never need it.

## When to convene

- The user asks, on any plan or existing feature.
- The user accepts the `/to-prd` gate offer (sensitive plans).

Never convene silently. Never for small features.

## Prerequisite: a written brief

The board reads a document, not the conversation. Write the plan summary to `plans/boardroom-<slug>.md`: the problem, the resolved decisions, the data touched, the flows changed. One page. If the plan can't be written in a page, it isn't resolved enough to review; go back to the grill.

## The seats

Five standing seats. Each owns a failure class no other seat catches.

| Seat | Charter |
|---|---|
| **Tenant Security Auditor** | Data breach, both kinds. Cross-tenant: can tenant A ever see tenant B's rows, files, or data (row-level security, storage, API surface). Within-tenant: can a privileged user see individual end-user-identifiable data they shouldn't; what personal data is retained and for how long. |
| **The Business** | Both directions of money. What can be cut from this plan (YAGNI, maintenance cost per feature, does it serve the current goal). And does this help sell or retain a customer. |
| **The Least-Technical User** | Role-dynamic: whoever the least technical person this plan touches is, in their real environment. A customer on their phone, a field user with one bar of signal. Confusion, extra taps, silent abandonment. |
| **The 2am Operator** | Silent runtime failure. Empty states, race conditions, the scheduled job that didn't run, the offline action, the partial write. What breaks with nobody watching, and how would anyone ever find out. |
| **The Six-Month Maintainer** | Future change failure. Can someone with zero context understand it, change it, and roll it back. Migration reversibility, coupling, the interface that will be regretted. |

**The guest chair** (empty by default): one per-session specialist appointed by the user or suggested by the plan's subject, e.g. an email-deliverability expert for a notification feature. Same rules as everyone else.

## Convening

Dispatch all seats as **parallel `boardroom-seat` subagents** (defined in `.claude/agents/boardroom-seat.md`, pinned to a high-effort model with fresh context). Each receives only its charter, the brief path, and permission to explore the codebase read-only to check the plan against reality. No seat receives the session's framing of the plan; fresh eyes are the point (same principle as the spec review in `/implement`).

Per-seat prompt shape:

> You hold one seat on a review board for <project one-liner from CLAUDE.md: what the app is, the stack, who the user roles are>. Your charter: <charter>. Read the brief at `<path>`. You may explore the codebase read-only to verify the plan against what exists. Return at most 3 concerns, ranked most severe first. Each concern must name a concrete failure scenario in THIS plan: which table, flow, or user action breaks, and how, plus the cheapest mitigation. Generic advice that would apply to any software project is forbidden. If the plan is sound from your seat, return "No objections"; that is a valid and welcome answer.

## Anti-theater rules

- Max 3 concerns per seat, ranked. Prioritization is the job.
- Every concern names a concrete failure scenario in this plan and its cheapest mitigation.
- Advice that applies to every project ("add tests", "consider accessibility") is out of order.
- "No objections" is valid and expected. A board that always objects is theater.

## Synthesis and verdict

1. Dedupe concerns across seats. Two seats raising the same issue independently raises its severity.
2. Surface disagreements between seats explicitly; that tension is signal, present it as a decision.
3. Present a ruling table in plain chat (never a modal): seat, concern, severity, proposed mitigation. The user rules each one: **accept**, **reject** (with reason), or **defer**.

## Rulings are written down

- **Accept**: amend the plan brief before `/to-prd` runs.
- **Reject**: goes into the PRD's Out of Scope with the user's reason, so it never comes back as a fresh idea.
- **Defer**: breadcrumb in `.claude/sharpen-log.md`.
- Delete `plans/boardroom-<slug>.md` once its rulings are folded into the PRD (delete-on-completion rule).
