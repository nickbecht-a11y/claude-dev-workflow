---
name: visual-spec
description: Pre-flight visual design pass for a page section. Resolves the decisions that vary per section, auto-applies the project's design system for everything fixed, and emits a written spec that pins the visuals before any HTML/CSS is written. Use when designing or redesigning any page section.
---

# Visual Spec

Lock every visual decision before writing code. The spec is what stops the markup drifting from the design, so it is still written every time.

**This skill does not stop and wait.** Approval belongs to the single Go gate (CLAUDE.md). Resolve every decision you can from the design system, the surface's source of truth, and the existing patterns. Carry to the Go gate only the lines you genuinely cannot settle, with a recommendation for each. A decision the design system already answers is not a question.

## The project's design system lives in CLAUDE.md

Read CLAUDE.md's **Design System** section first. It holds, per project:

- **Surfaces**: each design surface (marketing site, app portals, admin panel) and its source of truth (existing shell components, CSS variables, a design handoff folder). Branch on the surface before deciding anything, and only decide what that source of truth leaves open.
- **Auto-resolved rules**: text colour on dark and light backgrounds, the CTA colour and colours forbidden on buttons, accent colour usage, section padding, heading font, animation. Applied silently, never re-asked.
- **Scales**: the background tokens, heading and body size scales, card styles, accent formats, and the image directory the decisions below pick from.

Keeping these in CLAUDE.md, not here, is what lets this file stay identical across projects. If the section is missing, the first run creates it from the existing code and records what it established, so later sections inherit it. A new landing page or full-site build starts with `/scroll-craft` for the page grammar and visitor journey; this skill then locks each section inside it.

## The eight decisions

Answer these yourself from the existing patterns and the surface's source of truth. Each one you can answer is settled, not asked. Only a decision with two genuinely defensible answers that look materially different travels to the Go gate, and it travels with your recommendation attached.

1. **Section name & purpose**: what is this section called and what does it communicate to the visitor?

2. **Background**: which of the design system's background tokens?

3. **Layout**: centered single column, left-aligned block, split-column (text + image side by side), or card grid?

4. **Image**: yes or no?
   - If yes: background-image behind the section or `<img>` tag alongside content?
   - Which file from the project's image directory? (scan filenames, match to section emotion)
   - Focal position: `center 30%`? `center 40%`? `center 60%`? other?

5. **Heading size**: which step of the heading scale?

6. **Body text size**: standard or secondary?

7. **Cards**: skip if layout is not a card grid.
   - Columns: 2 or 3?
   - Style: which of the design system's card styles?
   - Hover accent: top bar, bottom bar, or left border?

8. **Accent elements**: which of the design system's accent formats, or plain text only?

## Spec output

Once the eight are resolved, write the spec block. It is the record the markup gets checked against, so it is produced whether or not anything went to the Go gate:

```
SECTION SPEC: [name]
─────────────────────
Background:   [variable + hex]
Layout:       [type]
Image:        [file, bg-image or img tag, focal position, or "none"]
Heading:      [clamp or fixed size], [color], weight
Body:         [size], [color], weight
Cards:        [columns], [style], [hover accent], or "none"
Accents:      [tags / icon boxes / numbered / none]
Animation:    [fade-in / hero-reveal / stagger delays]
```

Then build. If a line of the spec went to the Go gate unresolved, it is not settled until the go comes back; everything else proceeds.
