---
name: verify-feature
description: >
  Prove a feature works end-to-end: seed data if needed, drive the live app
  with Playwright as the right role, look at what it actually renders, and
  report what was exercised. Use after implementing any feature or fix,
  before declaring it done. Triggers: "verify", "prove it works", "show me
  it working", or completion of any user-visible change.
---

# Verify Feature

No feature is done until it has been driven in a real browser, as the role that actually uses it. Verbal "it should work now" does not count.

Driving the live app is the gate; the image file is not. What the drive catches is the class of failure nothing else will tell you about: a route that never mounted, a missing environment variable, a permission rule quietly denying the role, a screen that renders perfectly with nothing in it. No test run and no code read surfaces those. The capture is how *you* see the app — working material, not a report for the user.

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

Drive it with `playwright-cli` through Bash. Give every command a session named after the task (`-s=<slug>`), so a second Claude session on the same machine gets its own browser instead of fighting over one.

```bash
# sign in with the Login command from CLAUDE.md's Project Profile; it saves the session and prints no secret
<login command> <role> "<scratchpad>/state-<role>.json"
playwright-cli -s=verify open DEV_SERVER_URL
playwright-cli -s=verify state-load "<scratchpad>/state-<role>.json"
playwright-cli -s=verify goto DEV_SERVER_URL/<route>
playwright-cli -s=verify resize 1280 800        # or 390 844 for mobile checks
playwright-cli -s=verify snapshot               # element refs (e5, e12, ...) come from here
```

Never type a password with `playwright-cli fill`: it echoes the value into the transcript. The login command reads the credentials file itself. A state file only works for the origin it was made on, and it holds a live session token, so it stays in the scratchpad.

No login command yet? Write one before driving, and record it in the Project Profile: a short Node script that takes a role and an output path, reads the credentials file in memory, signs in with the Playwright library (answering a 2FA challenge if the account has one), and saves `context.storageState()` to the path. It prints the role and where it landed, never a credential.

Refs only last until the page changes. Take a fresh `snapshot` after every navigation or render before using a ref, and use `find "<text>"` instead of reading a whole snapshot when you are looking for one element. Run `close` on the session when you are done. On Windows Git Bash, an argument that starts with `/` is rewritten into a file path (`/foo/i` becomes `C:/Program Files/Git/foo/i`), so a `find --regex "/.../i"` silently matches nothing: prefix the command with `MSYS_NO_PATHCONV=1`.

If the dev server reports the port in use, use the actual port it prints (Vite, for example, bumps to the next free port).

Navigate to the feature. On a mobile viewport, navigation may hide behind a hamburger — see the `mobile-view` skill for the open-menu → click-link pattern.

### 4. Look at it

```bash
playwright-cli -s=verify screenshot --filename="<scratchpad>/verify-<feature-slug>.png"
playwright-cli -s=verify console error          # errors the screen may not show
```

For a question about text or structure ("is the row there", "does the badge say Approved"), `snapshot` or `find` answers it more cheaply than an image. Use the screenshot when what matters is how it renders.

**Read the file back with the Read tool and confirm the app is in the state it should be in.** This is the step that does the work. A capture nobody looked at proves nothing, and a capture of the wrong screen is worse than none.

Routine verification captures are working material, so they go to the session scratchpad, not the deliverable folder. Write to the project's screenshots directory (default `screenshots/` at repo root) only when a person has a reason to open the file: the feature is broken, or you are running `/qa-sweep` or `/mobile-view`, whose output is meant to be read.

### 5. Report

Say what you exercised and what you saw, in plain English: the role you signed in as, the path you drove through the app, and the state it was actually in. A file path appears only when there is a reason to open it (see step 4). If the feature spans roles (e.g. one role submits, another approves), drive each role and report each path through the app.

**This goes in the chat report's Done section. It does not become a file.** UI verification earns no file because the next person can re-run the app. Schema and deployed edge function behaviour still earn a file, because neither can be re-derived from the repo. See CLAUDE.md's Verification section for the routing.

## Failure handling

If the app shows the feature broken or missing: that is a finding, not a verification. Say so plainly and save the capture to the project's screenshots directory so it can be looked at. Once it is fixed, behavior has changed — so what you saw no longer describes the app, and the drive has to happen again.
