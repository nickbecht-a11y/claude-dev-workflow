---
name: new-migration
description: >
  Create and apply a new Supabase migration with the project's numbering,
  RLS, and safety rules enforced. Supabase stacks only; adapt the same gates
  for other databases. Use whenever a task needs a schema change, new table,
  new column, RLS policy, or SECURITY DEFINER function. Triggers: "add a
  migration", "new table", "schema change", "RLS policy".
---

# New Migration

Migrations live in the migrations directory named in CLAUDE.md's Project Profile (e.g. `supabase/`) as numbered SQL files (`<NN>-<slug>.sql`). Files are the source of truth: never hand-edit prod schema without capturing it in a migration file.

## Steps

1. **Next number** — highest existing file number + 1. Sort numerically, not lexicographically, and check every ref, not just the working tree: two sessions on different branches can otherwise claim the same number. `git log --all --name-only -- <migrations-dir>` is the check that sees them all.
2. **Write the file** — `<migrations-dir>/<NN>-<slug>.sql`. Load the `supabase-postgres-best-practices` skill first (Supabase's own skills: `npx skills add supabase/agent-skills`), and the `supabase` skill's security checklist when the change touches RLS, views, functions, triggers or storage.
3. **Apply** — `mcp__supabase__apply_migration` with the file contents.
4. **Advisors** — run `get_advisors` (security, then performance) and fix anything the migration introduced, in a follow-up numbered file.
5. **Verify, into a file** — `<migrations-dir>/<NN>-<slug>.verify.sql`, beside the migration, with the measured numbers written in as comments *after* the run.

   This is one of only two kinds of evidence that earns a file under CLAUDE.md's evidence rule (the other is deployed edge function behaviour). The reason is specific: once a migration is applied, the before-state cannot be recaptured, so a probe run only in chat can never be repeated. The file re-runs months later when someone wonders whether the grants crept back.

   What goes in it: the probe queries themselves, and beside each the number it actually returned. Pair every absence assertion with a presence assertion in the same file, or the absence half passes trivially against a query that matched nothing. Assert the fixture exists before using it and print what it was: a `limit 1` that came back NULL makes every following statement match zero rows, and matching zero rows is not an error, so the check reports a pass having tested nothing.

## Hard rules

- **This skill owns the process; the Supabase skills are reference.** Where they disagree, this file and CLAUDE.md win. Specifically: ignore their `execute_sql`-then-`supabase db pull --local` workflow (numbered files are the source of truth, not a pulled local schema), and their advice to keep SECURITY DEFINER functions out of `public`. The helpers here live in `public` by design and are safe because of the `revoke all ... from public` plus a single named grant in CLAUDE.md. Their RLS, indexing and query rules apply as written.

- **Never hardcode role names in RLS policies.** Route role checks through a SECURITY DEFINER helper (e.g. `public.is_admin()`) so adding a role later is a one-function change, not a policy audit. Hardcoded role lists silently lock out users when a new role is added.
- **Reuse the project's existing SECURITY DEFINER helpers for cross-table lookups** instead of inline subqueries that RLS would block. Check what helpers exist before writing new ones.
- **New role added?** Audit every policy: `SELECT tablename, policyname FROM pg_policies;`
- **Every new table gets RLS enabled** plus explicit policies. A table without policies is invisible to everyone but postgres, which reads as "data vanished" later.
- **Every new table also gets the project-wide restrictive policies** CLAUDE.md's Database section lists (a two-factor gate, a tenant guard). An earlier migration applied them to the tables that existed then; nothing applies them to later ones.
- **Client code touching the new schema must destructure `error`** from Supabase queries: `const { data, error } = await query`. Bare `{ data }` silently swallows RLS failures.

## Diagnosis reminders

- Data vanished → check row counts as postgres first; rows exist = RLS problem.
- Simulate a user: `set local role authenticated;` then `select set_config('request.jwt.claims', '{"sub":"<uuid>"}', true);`, run the queries under test, then `reset role;`. The claim alone changes `auth.uid()` while the MCP's postgres role still bypasses RLS (CLAUDE.md, Database).

## After applying

- New table / storage bucket = structurally significant → update the project's architecture docs/diagrams, if it keeps any.
- If the migration supports a user-visible feature, finish with `/verify-feature`.
