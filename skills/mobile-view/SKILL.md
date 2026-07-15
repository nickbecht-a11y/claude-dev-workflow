---
name: mobile-view
description: Take mobile screenshots and edit mobile CSS for the project's web app via MCP Playwright. Use when user asks to check, fix, or edit the mobile view, mobile layout, or mobile styling of any page.
---

# Mobile View & Editing

Use `mcp__playwright__*` tools directly. No scripts, no Puppeteer.

## Setup

**Default to the local dev server** (command and URL per CLAUDE.md's Project Profile). It is the only place uncommitted local changes appear. Use the production URL only when the goal is to inspect the deployed build. If the port is taken, use the actual port the dev server prints.

```js
// 1. Set 390px mobile viewport
mcp__playwright__browser_resize({ width: 390, height: 844 })

// 2. Navigate and log in (selectors are project-specific; record them in CLAUDE.md if nonstandard)
mcp__playwright__browser_navigate({ url: DEV_SERVER_URL })
mcp__playwright__browser_type({ target: 'input[type="email"]', text: EMAIL })
mcp__playwright__browser_click({ target: 'button:has-text("Sign in")' })
mcp__playwright__browser_wait_for({ time: 2 })
```

Test credentials live in a memory file, never the repo.

## Navigating on mobile

Sidebars usually hide behind a hamburger on mobile. If the button has no text, open it via JS:

```js
mcp__playwright__browser_evaluate({
  function: '() => { document.querySelector("button.hamburger-selector").click(); return "ok"; }'
})
```

Then click the nav link:
```js
mcp__playwright__browser_click({ target: 'a[href="/target-page"]' })
```

Or open menu → click → open menu → click for each page in sequence.

**Routing gotcha:** direct `browser_navigate` to a protected deep link often redirects to the app root if auth state is cleared. Navigate via the open-menu → click-link pattern; if the session expires, re-login first.

## Taking screenshots

```js
// Viewport only (what user sees)
mcp__playwright__browser_take_screenshot({ type: "png", filename: "screenshots/page.png" })

// Full page scroll
mcp__playwright__browser_take_screenshot({ type: "png", filename: "screenshots/page-full.png", fullPage: true })
```

Screenshots go to the project's screenshots directory (default `screenshots/` at repo root). Read the file back with the Read tool to view it visually.

## Project mobile layout rules — fill in as you learn them

Keep a table here (or in CLAUDE.md) of the project's non-obvious mobile constraints, recorded the first time each one bites. Examples of what belongs in it: fixed-element clearance ("all page containers need `padding-top` ≥ 72px to clear the hamburger"), the breakpoints actually in use per page, sticky-header offsets.

| Element | Rule |
|---|---|
| _(none recorded yet)_ | |

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
