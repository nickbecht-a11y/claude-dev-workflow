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

1. **Next number** — highest existing file number + 1: check `<migrations-dir>/*.sql`.
2. **Write the file** — `<migrations-dir>/<NN>-<slug>.sql`.
3. **Apply** — `mcp__supabase__apply_migration` with the file contents.
4. **Verify** — `mcp__supabase__list_migrations` or a probe query via `mcp__supabase__execute_sql`.

## Hard rules

- **Never hardcode role names in RLS policies.** Route role checks through a SECURITY DEFINER helper (e.g. `public.is_admin()`) so adding a role later is a one-function change, not a policy audit. Hardcoded role lists silently lock out users when a new role is added.
- **Reuse the project's existing SECURITY DEFINER helpers for cross-table lookups** instead of inline subqueries that RLS would block. Check what helpers exist before writing new ones.
- **New role added?** Audit every policy: `SELECT tablename, policyname FROM pg_policies;`
- **Every new table gets RLS enabled** plus explicit policies. A table without policies is invisible to everyone but postgres, which reads as "data vanished" later.
- **Client code touching the new schema must destructure `error`** from Supabase queries: `const { data, error } = await query`. Bare `{ data }` silently swallows RLS failures.

## Diagnosis reminders

- Data vanished → check row counts as postgres first; rows exist = RLS problem.
- Simulate a user: `SELECT set_config('request.jwt.claims', '{"sub":"<uuid>"}', true);` then run the helper you're testing.

## After applying

- New table / storage bucket = structurally significant → update the project's architecture docs/diagrams, if it keeps any.
- If the migration supports a user-visible feature, finish with `/verify-feature`.
