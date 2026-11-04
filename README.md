# Claude Dev Workflow

A portable, seven-stage development workflow for Claude Code: 29 skills plus a CLAUDE.md template that wires them together. Drop it into any project and get the same pipeline: interrogate the idea, write the PRD, slice it into vertical issues, build with enforced gates, prove it in a real browser, review with fresh eyes, ship.

Tuned for Claude Opus 5, which verifies and corrects its own work as it goes. The workflow therefore never instructs a re-check — it defines what finished looks like and reviews only where fresh information exists. See [Design principles](#design-principles-why-it-works).

## The pipeline

| Stage | Skills | What happens |
|---|---|---|
| 1. Shape | `grill-me`, `grill-with-docs` | One-question-at-a-time interview until no fuzzy decisions remain |
| 2. Explore (optional) | `frontend-design`, `scroll-craft`, `prototype`, `visual-spec` | Establish the visual direction for new UI (`scroll-craft` for a landing page or marketing site); throwaway experiments |
| 3. PRD | `to-prd` | Synthesize the session into one requirements doc; no re-interviewing |
| 4. Slice | `to-issues` | Vertical-slice (tracer bullet) issues in a local markdown tracker |
| 5. Build | `implement`, `tdd`, `new-migration` | One orchestrator per issue enforces gate order; review diffs from the recorded issue base; UI slices without an approved visual spec route through `visual-spec` first; loop-safe for unattended backlog runs |
| 6. Prove | `verify-feature` | Real browser, real role, driven end-to-end. Not done until it's been run |
| 7. Ship gate | `finish-branch`, `watch-ci`, `sharpen`, `drawio` | The deep code review and a `/security-review` of the whole branch, ordered merge, CI babysitting, retro — sharpen's fixes are committed, never left dirty on the default branch |

Not every task runs the whole pipeline. CLAUDE.md routes work by **lane**, picked on observable predicates rather than size feelings: feature work enters at stage 1; advisory passes (`improve`, `improve-codebase-architecture`) are read-only and gateless, and their plans enter at stage 4 — `to-issues` slices the plan directly, no re-grilling; behavior-preserving quick fixes skip the tracker entirely (fix → verify → review → commit); visual polish and debugging have their own on-ramps. Lanes scale ceremony, never honesty — verification, permissions, and the branch guard bind in every lane, and work that touches schema or adds behavior takes the feature lane however small it feels.

Always on: `caveman` (compressed responses, ~75% fewer output tokens) and `track` (compaction-proof checklist, auto-fires on 5+ step plans, gates "done").

Off-pipeline: `qa-sweep`, `mobile-view` (quality passes), `compact-checkpoint`, `handoff` (session continuity), `improve`, `improve-codebase-architecture` (codebase health), `better-sqlite3-rebuild`, `youtube-transcript`, `playwright-cli` (toolbox). Launch and operations: `shipping-and-launch` (called by `finish-branch` for a go-live), `performance-optimization` (measure first, then fix), `observability-and-instrumentation` (logging, metrics and alerts written with the feature). Skill authoring uses the prerequisite `skill-creator` (below).

## Install into a project

1. Copy the skills and agents into the project (or into `~/.claude/` once, to get them in every project on the machine):

   ```sh
   cp -r skills/* <project>/.claude/skills/
   cp -r agents/* <project>/.claude/agents/
   ```

   The `agents/` definitions back the fresh-context, model-pinned subagents that a few skills dispatch (`spec-reviewer` for `/implement` spec review, `ui-prototyper` for the `/prototype` UI branch). Skip this copy and those skills fall back to an unpinned in-session review.

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

### Browser automation: playwright-cli, not Playwright MCP

The browser-driving skills use Microsoft's [`playwright-cli`](https://github.com/microsoft/playwright-cli) through Bash rather than the Playwright MCP server. It keeps tool schemas and accessibility trees out of context, gives each Claude session its own named browser (`-s=<task>`) so parallel sessions stop colliding, and writes screenshots anywhere, scratchpad included. Install once per machine:

```sh
npm install -g @playwright/cli@latest
```

The vendored `skills/playwright-cli` is the CLI's own command reference (from `playwright-cli install --skills`); refresh it the same way after upgrading. Allow `Bash(playwright-cli *)` in the project's settings so drives do not prompt. If a project still has a `playwright` entry in `.mcp.json`, remove it.

### Prerequisite skills

Two official Anthropic skills are referenced by the pipeline but not vendored here — they ship and auto-update via [`anthropics/skills`](https://github.com/anthropics/skills). Install them once into `~/.claude/skills/` so they resolve in every project:

| Skill | Role in the workflow |
|---|---|
| `frontend-design` | Establishes a distinctive, production-grade visual direction. Called first for any new UI (pipeline stage 2), before `visual-spec` locks per-section decisions against it. |
| `skill-creator` | Anthropic's skill-authoring system — replaces the former vendored `write-a-skill`. `sharpen` dispatches to it when a repeat-friction pattern earns a new skill. |

Install: clone `anthropics/skills` and copy the `frontend-design` and `skill-creator` folders into `~/.claude/skills/`.

## Pocketed, not installed

Vetted and parked until a project needs them. Install from the source when it does.

| Tool | Install | Pick it up when |
|---|---|---|
| Expo skills (`expo/skills`) | `claude plugin install expo@claude-plugins-official` | A project ships a React Native or Expo mobile app |
| Stripe best practices (`stripe/ai`) | `claude plugin install stripe@claude-plugins-official` | A project starts building billing on Stripe |

## Stack assumptions, per skill

Most skills are stack-agnostic. The exceptions:

| Skill | Assumes | If your stack differs |
|---|---|---|
| `new-migration` | Supabase (MCP server, RLS, SQL migrations). Optional companion: Supabase's own skills, `npx skills add supabase/agent-skills` | Rewrite steps 3-4 for your migration tool; keep the gates (numbered files as source of truth, no hand-edited prod schema) |
| `verify-feature`, `mobile-view`, `qa-sweep` | Web app + `playwright-cli` on PATH | Any browsable app works; install the CLI (below) |
| `watch-ci`, `finish-branch` | GitHub Actions + `gh` CLI | Swap the `gh run` commands for your CI's CLI |
| `visual-spec` | A design system you record in its fill-in tables | Fill the tables the first time you use it |
| `better-sqlite3-rebuild` | Node + better-sqlite3 | Delete if unused |
| `scroll-craft` | Static HTML landing pages; optional kie.ai key for generated assets (paid) | Delete for app-only projects |

`mobile-view` and `visual-spec` also contain fill-in tables meant to accumulate project-specific rules over time; they start empty here.

## Design principles (why it works)

- **CLAUDE.md is a router, not a manual.** Every line is either a rule the model can't derive from the code or a pointer that saves a search. One hop maximum. Skills self-describe via frontmatter, so CLAUDE.md only records their order and which gates are mandatory.
- **Gates are a mechanism, not a memory.** `implement` chains build → prove → review in code, so verification can't be skipped by forgetting.
- **Evidence before claims.** No "done", "fixed", or "passing" without having run the proving command this turn and read its output. A subagent's success report is a claim to verify against the diff, not proof.
- **Fresh eyes can't be fooled.** Spec review runs in a subagent with zero session history reading the diff from the issue's recorded base commit; it reads what the issue says, not what the implementer meant, and never gets told what not to flag.
- **Proof means running it.** A feature is done when a real browser, driven as the right role against real data, shows it working — that catches the dead route, the missing env var, the permission rule denying the role, and the empty screen, none of which a test run or a code read will mention. The screenshot is how the agent looks; it isn't the deliverable.
- **Check once, at the right altitude.** Current models self-correct as they write, so the workflow doesn't ask them to re-read their own work. It states what finished looks like, then spends its review budget where a second pair of eyes actually sees something new: a cold read against the spec per issue, and one deep quality pass per branch.
- **Delete on completion.** Finished issues and plans leave the working tree; git history is the archive. The live tree only describes the present.
- **Lanes scale ceremony, never honesty.** Work enters the spine at the stage its class calls for; the universal gates (evidence, permissions, branch guard) bind in every lane.
- **The system grows itself, slowly.** `sharpen` fixes workflow friction with the cheapest change that prevents recurrence; new skills need the same friction logged three times.

## Credits

Several skills started from or were shaped by community skills (`tdd`, `grill-me`, `improve`, `improve-codebase-architecture`, `drawio`, `better-sqlite3-rebuild`, `to-prd`/`to-issues` lineage) and were adapted; `scroll-craft` (nateherkai/scroll-craft), `playwright-cli` (microsoft/playwright-cli) and the three launch and operations skills (addyosmani/agent-skills) are vendored with local rules on top; the rest were purpose-built for this workflow.
