---
name: mobile-view
description: Take mobile screenshots and edit mobile CSS for the project's web app via playwright-cli. Use when user asks to check, fix, or edit the mobile view, mobile layout, or mobile styling of any page.
---

# Mobile View & Editing

Drive the browser with `playwright-cli` through Bash, always with a named session (`-s=mobile`) so a parallel Claude session keeps its own browser. No Puppeteer, no ad-hoc scripts.

## Setup

**Default to the local dev server** (command and URL per CLAUDE.md's Project Profile). It is the only place uncommitted local changes appear. Use the production URL only when the goal is to inspect the deployed build. If the port is taken, use the actual port the dev server prints.

```bash
# 1. Sign in with the Login command from CLAUDE.md's Project Profile (same origin you will open)
<login command> <role> "<scratchpad>/state-<role>.json"

# 2. Open at a 390px mobile viewport, load the session, go to the page
playwright-cli -s=mobile open DEV_SERVER_URL
playwright-cli -s=mobile state-load "<scratchpad>/state-<role>.json"
playwright-cli -s=mobile resize 390 844
playwright-cli -s=mobile goto DEV_SERVER_URL/<route>
```

Never type a password with `playwright-cli fill`: it echoes the value into the transcript. See `verify-feature` for the login command. When touch behavior matters (tap targets, hover-only UI), open with `--device "iPhone 15"` instead of resizing.

## Navigating on mobile

Sidebars usually hide behind a hamburger on mobile. Click it by selector (text-less buttons need one; CLAUDE.md's Mobile Layout section names it), then the nav link:

```bash
playwright-cli -s=mobile click 'button.hamburger-selector'
playwright-cli -s=mobile click 'a[href="/target-page"]'
```

Or open menu → click → open menu → click for each page in sequence.

**Routing gotcha:** direct `goto` to a protected deep link often redirects to the app root if auth state is cleared. Navigate via the open-menu → click-link pattern; if the session expires, re-login first.

## Taking screenshots

```bash
# Viewport only (what the user sees)
playwright-cli -s=mobile screenshot --filename="<abs path>/screenshots/page.png"

# Full page scroll
playwright-cli -s=mobile screenshot --full-page --filename="<abs path>/screenshots/page-full.png"
```

Screenshots go to the project's screenshots directory (default `screenshots/` at repo root); always pass an absolute path. Read the file back with the Read tool to view it visually. Run `playwright-cli -s=mobile close` when finished.

## Project mobile layout rules

They live in CLAUDE.md's **Mobile Layout** section, not here, so this file stays identical across projects. Read it before editing, and record each non-obvious constraint there the first time it bites: fixed-element clearance ("all page containers need `padding-top` ≥ 72px to clear the hamburger"), the breakpoints actually in use per page, sticky-header offsets.

## Common CSS patterns

**Single-column grid:**
```css
.grid { grid-template-columns: 1fr; }
```

**Full-width CTA button:**
```css
.btn { width: 100%; max-width: 320px; align-self: center; }
```

**Hide on mobile:**
```css
.element { display: none; }
```

**Override inline style:**
```css
.element { margin-top: 0.5rem !important; }
```

## Workflow

1. **Screenshot first** — always see current state before editing
2. **Find the mobile block** — `Grep "@media.*768" <file> -n`
3. **Edit** — add rules inside the existing block, never duplicate it
4. **Screenshot again** — confirm fix, check for regressions

## Gotchas

- `overflow: hidden` on a parent clips child `box-shadow` — remove it
- `text-align: center` on parent doesn't center flex children — also set `align-items: center`
- Inline `style=""` attributes require `!important` to override from CSS
- Fixed elements (hamburger) appear only once in full-page screenshots — take viewport screenshots to verify overlap
