---
name: verify-feature
description: >
  Prove a feature works end-to-end: seed data if needed, drive the live app
  with Playwright as the right role, screenshot the result, return the file
  path as proof. Use after implementing any feature or fix, before declaring
  it done. Triggers: "verify", "prove it works", "show me it working", or
  completion of any user-visible change.
---

# Verify Feature

No feature is done until there is a screenshot proving it. Verbal "it should work now" does not count.

## When NOT to run this

**Pure style/CSS changes do not get Playwright verification.** Color changes, spacing, fonts, sizing, alignment, and layout tweaks with no logic change — the user can physically see these and does not need a screenshot. Do not start a browser for them.

Only verify **behavior**: does a feature work, does an interaction fire correctly, do any errors show up when the feature is exercised. If a change touches both style and logic, verify only the logic path (and skip the pure-visual part).

## Steps

### 1. Pick the role

Feature is visible to which role? Roles are listed in CLAUDE.md's Project Profile; test credentials live in a memory file (never in the repo). Single-role apps skip this step.

### 2. Seed data if the feature needs it

Empty states prove nothing. If the feature renders data, make sure data exists for the test account. Use the project's DB access (MCP SQL tool, seed script, or fixtures). Prefer reusing existing rows over inserting new ones; if you insert, note the row IDs so cleanup is possible.

### 3. Drive the live app

**Default to the local dev server** (command and URL per CLAUDE.md's Project Profile). Any change made in this working tree is only live there. The production URL is the deployed build and does NOT contain uncommitted local changes — only navigate there when the explicit goal is to verify what is already in production.

```js
mcp__playwright__browser_resize({ width: 1280, height: 800 })  // or 390x844 for mobile checks
mcp__playwright__browser_navigate({ url: DEV_SERVER_URL })
// log in as the chosen role — selectors are project-specific; record them in CLAUDE.md if nonstandard
mcp__playwright__browser_type({ target: 'input[type="email"]', text: EMAIL })
mcp__playwright__browser_click({ target: 'button:has-text("Sign in")' })
mcp__playwright__browser_wait_for({ time: 2 })
```

If the dev server reports the port in use, use the actual port it prints (Vite, for example, bumps to the next free port).

Navigate to the feature. On a mobile viewport, navigation may hide behind a hamburger — see the `mobile-view` skill for the open-menu → click-link pattern.

### 4. Screenshot

```js
mcp__playwright__browser_take_screenshot({ type: "png", filename: "screenshots/verify-<feature-slug>.png" })
```

Screenshots go to the project's screenshots directory (default `screenshots/` at repo root) — never a temp folder or the scratchpad. Read the file back with the Read tool and confirm the feature actually shows what it should. A screenshot of the wrong state is not proof.

### 5. Report

Return the screenshot file path in the final message. If the feature spans roles (e.g. one role submits, another approves), repeat steps 1-4 per role and return all paths.

## Failure handling

If the screenshot shows the feature broken or missing: that is a finding, not a verification. Say so plainly, keep the screenshot as evidence, fix, re-verify.
