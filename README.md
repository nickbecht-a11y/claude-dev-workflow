# Claude Dev Workflow

A portable, seven-stage development workflow for Claude Code: 24 skills plus a CLAUDE.md template that wires them together. Drop it into any project and get the same pipeline: interrogate the idea, write the PRD, slice it into vertical issues, build with enforced gates, prove it in a real browser, review with fresh eyes, ship.

## The pipeline

| Stage | Skills | What happens |
|---|---|---|
| 1. Shape | `grill-me`, `grill-with-docs` | One-question-at-a-time interview until no fuzzy decisions remain |
| 2. Explore (optional) | `frontend-design`, `prototype`, `visual-spec`, `boardroom` | Establish the visual direction for new UI; throwaway experiments; five-seat adversarial review for risky plans |
| 3. PRD | `to-prd` | Synthesize the session into one requirements doc; no re-interviewing |
| 4. Slice | `to-issues` | Vertical-slice (tracer bullet) issues in a local markdown tracker |
| 5. Build | `implement`, `tdd`, `new-migration` | One orchestrator per issue enforces gate order; loop-safe for unattended backlog runs |
| 6. Prove | `verify-feature` | Real browser, real role, screenshot as proof. No screenshot, not done |
| 7. Ship gate | `finish-branch`, `watch-ci`, `sharpen`, `drawio` | Fresh-eyes spec review + code review, ordered merge, CI babysitting, retro |

Always on: `caveman` (compressed responses, ~75% fewer output tokens) and `track` (compaction-proof checklist, auto-fires on 5+ step plans, gates "done").

Off-pipeline: `qa-sweep`, `mobile-view` (quality passes), `compact-checkpoint`, `handoff` (session continuity), `improve`, `improve-codebase-architecture` (codebase health), `better-sqlite3-rebuild` (toolbox). Skill authoring uses the prerequisite `skill-creator` (below).

## Install into a project

1. Copy the skills and agents into the project (or into `~/.claude/` once, to get them in every project on the machine):

   ```sh
   cp -r skills/* <project>/.claude/skills/
   cp -r agents/* <project>/.claude/agents/
   ```

   The `agents/` definitions back the fresh-context, model-pinned subagents that a few skills dispatch (`spec-reviewer` for `/implement` spec review, `boardroom-seat` for `/boardroom`, `ui-prototyper` for the `/prototype` UI branch). Skip this copy and those skills fall back to an unpinned in-session review.

2. Copy `CLAUDE.md.template` to `<project>/.claude/CLAUDE.md` (or merge its sections into an existing CLAUDE.md) and fill in the **Project Profile** table. The skills reference those slots by name (dev server URL, test commands, issues directory, roles, repo layout) instead of hardcoding any one project's values.

3. Optional, per taste: delete the Communication Style section to keep normal verbosity; delete skills you won't use (nothing else references them by anything but slash name).

Why a template and not a ready CLAUDE.md: Claude Code only reads the CLAUDE.md of the project it is running in. A CLAUDE.md sitting in this repo does nothing for your other projects; the workflow wiring has to live in each target project's own CLAUDE.md. The template keeps that wiring identical everywhere while the Project Profile carries the per-project facts.

## MCP servers

Skills are *procedures*; these MCP servers are *capabilities* the agent lacks at runtime. Two are worth wiring in — they close gaps the skills can't, and conflict with nothing in the pipeline.

**Context7** — live, version-correct docs for third-party libraries, pulled into context on demand. Fills the gap `grill-with-docs` leaves: that sharpens plans against *your* docs, nothing else keeps `implement`/`tdd` from hallucinating an external API. Stateless remote service, so install **once per machine** at user scope:

```sh
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
```

**TypeScript LSP (`@mizchi/lsmcp`)** — semantic code intelligence (go-to-definition, find-references, rename, diagnostics) instead of grep/glob guessing. Sharpens `implement` and `improve-codebase-architecture` on any TS/JS project. Requires Node 22+.

Unlike Context7 it is **per-project**: an LSP has to load the target project's own TypeScript, so it only works inside a real TS project (not this markdown repo) and is installed **per project**, not globally:

```sh
npm add -D @mizchi/lsmcp @typescript/native-preview
npx @mizchi/lsmcp init -p tsgo
claude mcp add lsmcp npx -- -y @mizchi/lsmcp -p tsgo
```

Non-TS stack: swap the `tsgo` preset for a language server via `@mizchi/lsmcp --bin=<lsp-command>`, or skip it.

### Prerequisite skills

Two official Anthropic skills are referenced by the pipeline but not vendored here — they ship and auto-update via [`anthropics/skills`](https://github.com/anthropics/skills). Install them once into `~/.claude/skills/` so they resolve in every project:

| Skill | Role in the workflow |
|---|---|
| `frontend-design` | Establishes a distinctive, production-grade visual direction. Called first for any new UI (pipeline stage 2), before `visual-spec` locks per-section decisions against it. |
| `skill-creator` | Anthropic's skill-authoring system — replaces the former vendored `write-a-skill`. `sharpen` dispatches to it when a repeat-friction pattern earns a new skill. |

Install: clone `anthropics/skills` and copy the `frontend-design` and `skill-creator` folders into `~/.claude/skills/`.

## Stack assumptions, per skill

Most skills are stack-agnostic. The exceptions:

| Skill | Assumes | If your stack differs |
|---|---|---|
| `new-migration` | Supabase (MCP server, RLS, SQL migrations) | Rewrite steps 3-4 for your migration tool; keep the gates (numbered files as source of truth, no hand-edited prod schema) |
| `verify-feature`, `mobile-view`, `qa-sweep` | Web app + MCP Playwright server | Any browsable app works; configure a `playwright` MCP server |
| `watch-ci`, `finish-branch` | GitHub Actions + `gh` CLI | Swap the `gh run` commands for your CI's CLI |
| `visual-spec` | A design system you record in its fill-in tables | Fill the tables the first time you use it |
| `better-sqlite3-rebuild` | Node + better-sqlite3 | Delete if unused |

`mobile-view` and `visual-spec` also contain fill-in tables meant to accumulate project-specific rules over time; they start empty here.

## Design principles (why it works)

- **CLAUDE.md is a router, not a manual.** Every line is either a rule the model can't derive from the code or a pointer that saves a search. One hop maximum. Skills self-describe via frontmatter, so CLAUDE.md only records their order and which gates are mandatory.
- **Gates are a mechanism, not a memory.** `implement` chains build → prove → review in code, so verification can't be skipped by forgetting.
- **Fresh eyes can't be fooled.** Spec review runs in a subagent with zero session history; it reads what the issue says, not what the implementer meant.
- **Proof means a screenshot.** A feature is done when a real browser, driven as the right role, shows it working.
- **Delete on completion.** Finished issues, plans, and boardroom briefs leave the working tree; git history is the archive. The live tree only describes the present.
- **The system grows itself, slowly.** `sharpen` fixes workflow friction with the cheapest change that prevents recurrence; new skills need the same friction logged three times.

## Credits

Several skills started from or were shaped by community skills (`tdd`, `grill-me`, `improve`, `improve-codebase-architecture`, `drawio`, `better-sqlite3-rebuild`, `to-prd`/`to-issues` lineage) and were adapted; the rest were purpose-built for this workflow.
