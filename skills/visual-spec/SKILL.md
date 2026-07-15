---
name: visual-spec
description: Pre-flight visual design interview for a page section. Resolves the decisions that vary per section, auto-applies the project's design system for everything fixed, then outputs a written spec for user approval before writing any HTML/CSS. Use when designing or redesigning any page section.
---

# Visual Spec

Lock every visual decision before writing code. No HTML or CSS until the spec is approved.

## Which surface? Branch first

If the project has more than one design surface (marketing site, app portals, admin panel), name the design source of truth for each in the table below and branch on it before interviewing. Only ask about decisions that surface's source of truth doesn't already answer.

| Surface | Design source of truth |
|---|---|
| _(fill in per project: e.g. app portal → existing shell components + CSS variables; marketing site → the rules below)_ | |

## Auto-resolved rules — never ask about these

Record the project's fixed design-system rules here once; after that, they are applied silently, never re-asked. Typical rows (replace with the project's real values):

| Rule | Value |
|---|---|
| Text on dark background | _(e.g. always white)_ |
| Text on light background | _(e.g. headings primary color, body neutral gray)_ |
| Buttons | _(the one CTA color; which colors are forbidden on buttons)_ |
| Accent color usage | _(icons, borders, tags, hover states only)_ |
| Section padding | _(standard and hero values)_ |
| Heading font | _(family, weight, letter-spacing)_ |
| Animation | _(e.g. fade-in + IntersectionObserver on non-hero sections)_ |

## Interview

Ask one question at a time. Give a recommended answer for each based on the project's existing patterns.

1. **Section name & purpose** — what is this section called and what does it communicate to the visitor?

2. **Background** — which of the design system's background tokens (dark, mid, light, white)?

3. **Layout** — centered single column, left-aligned block, split-column (text + image side by side), or card grid?

4. **Image** — yes or no?
   - If yes: background-image behind the section or `<img>` tag alongside content?
   - Which file from the project's image directory? (scan filenames, match to section emotion)
   - Focal position: `center 30%`? `center 40%`? `center 60%`? other?

5. **Heading size** — large, medium, or small (use the project's clamp scale)?

6. **Body text size** — standard or secondary?

7. **Cards** — skip if layout is not a card grid.
   - Columns: 2 or 3?
   - Style: dark semi-transparent (on dark bg), light bordered (on light bg), or elevated?
   - Hover accent: top bar, bottom bar, or left border?

8. **Accent elements** — tag labels? icon boxes? numbered labels? or plain text only?

## Spec output

After all 8 answers, output this block — then stop and wait:

```
SECTION SPEC: [name]
─────────────────────
Background:   [variable + hex]
Layout:       [type]
Image:        [file, bg-image or img tag, focal position — or "none"]
Heading:      [clamp or fixed size], [color], weight
Body:         [size], [color], weight
Cards:        [columns], [style], [hover accent] — or "none"
Accents:      [tags / icon boxes / numbered / none]
Animation:    [fade-in / hero-reveal / stagger delays]
```

**"Approve this spec or correct any line — I won't write code until you confirm."**
