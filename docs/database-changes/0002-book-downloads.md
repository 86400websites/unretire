# Database Change Record — book_downloads baseline (production-verified)

> One record per database change. Filled from `docs/templates/SUPABASE-CHANGE-TEMPLATE.md` in Sprint S2.5
> (2026-08-28). Kept with the PR that ships the change.

## Change

| Field | Value |
|---|---|
| Change name | `book_downloads` — production baseline, verified against the committed file |
| Migration number | 0002 |
| Sprint / PR | S2.5 / #18 |
| Supabase project(s) | `unretire-test` · ref `dtdadtggahjsrmevwvbu` (TEST) · `unretire-prod` · ref `hcjivvlwxltyiycfbttc` (PROD) — names/refs only, never keys |
| Change class | **additive / backwards-compatible — a baseline.** On TEST it creates the table and its two policies from nothing. On PROD it changes nothing: PROD already holds exactly this definition. |
| Data impact | none |
| Recovery source | not needed — the down file is schema-only and is never run on PROD |

## What and why

`public.book_downloads` records one watermarked download per member per document; its SQL has been committed at
`src/app/account/_book/book_downloads.sql` since the site was built, but that file's own header says "run this in
the Supabase SQL editor", so production could have drifted from it (`docs/ENVIRONMENT-PARITY.md` §5.2). On
2026-08-28 the production definition was read through the read-only `supabase-prod-readonly` MCP (D-11) and
**diffed against the committed file: no drift** — columns and defaults, `doc_type` check, `UNIQUE (user_id,
doc_type)`, the `auth.users` foreign key with `ON DELETE CASCADE`, RLS enabled, exactly two PERMISSIVE policies for
`public` (`"own downloads readable"` SELECT and `"own downloads insertable"` INSERT, both `auth.uid() = user_id`),
and no update or delete policy. Migration 0002 is that verified definition made idempotent, with production's
auto-generated constraint names spelled out, so `unretire-test` is built from a file that is known to equal
production. The original file is left untouched as history. **No destructive operation.**

## Files

- Up-SQL: `supabase/migrations/0002_book_downloads.sql`
- Down-SQL: `supabase/migrations/0002_book_downloads.down.sql` — drops the two policies and the table. Schema only;
  never recreates download records; never run on PROD.
- Access policy changes (RLS/policies) included in the same PR: yes — `"own downloads readable"` (SELECT, own rows)
  and `"own downloads insertable"` (INSERT, own rows), verbatim; deliberately **no** update/delete policy.

## Security check

- [x] Default-deny preserved: RLS enabled; the two policies are own-row only; nothing for `anon` (the policies are
      `for public`, but `auth.uid()` is null for `anon`, so no anonymous row ever matches). No default-allow table.
- [x] Writes are owner-scoped: INSERT only `with check (auth.uid() = user_id)`; the route inserts under the user's
      own session (`src/app/api/book-download/route.ts`), never the service role. No update/delete path exists.
- [x] No anonymous read/write path added unintentionally (intentional anon paths: **none**).
- [x] Privileged functions: none.
- [x] No secret, key, or connection string in the SQL, the PR, or this record.

## Applied and verified

| Environment | Date | Applied by | Verified how |
|---|---|---|---|
| TEST | 2026-08-28 | builder, via the `supabase-test` MCP `apply_migration` (`0002_book_downloads`, recorded as version `20260828162026`), owner-authorised the same day (OWNER-ACTIONS 6.1) | read-only after apply: `list_tables` → `public.book_downloads`, `rls_enabled: true`, 0 rows; the capture queries return the same four columns, four constraints (incl. `book_downloads_user_id_doc_type_key UNIQUE (user_id, doc_type)`), two indexes, RLS on / not forced, the two PERMISSIVE `{public}` policies verbatim and the same ACL as PROD — proof **P8** diff empty for this table. **Unauthorised role refused:** `begin; set local role anon; insert into public.book_downloads (user_id, doc_type) values (gen_random_uuid(), 'book'); rollback;` → `ERROR 42501: new row violates row-level security policy for table "book_downloads"`; `anon`/`authenticated` `count(*)` → 0/0 |
| PROD | 2026-08-28 (verified) | — **not applied: PROD already holds this definition** (verified read-only, D-11); nobody applied anything to PROD in this sprint | the capture queries listed in `docs/sprint-prompts/S2.5-environment-parity.md`, Execution record |

Never do this: never apply to production first, never let an AI agent write to production through any channel, and never apply to PROD before TEST is verified.

## Rollback plan

1. Nothing to roll back on PROD — nothing was applied.
2. On TEST, if needed: `0002_book_downloads.down.sql` on `unretire-test` only, on an explicit owner instruction; no
   S2.5 data lives in this table (fixture 5's download record is S5.1 seed data).
3. Prefer forward-fixing through a new numbered migration.
4. No data was transformed or deleted anywhere.
5. Verify after any TEST rollback: `list_tables` and the policy list.

Order matters: schema deploys before the code that depends on it; on rollback, code normally retreats
first. **Host rollback does not restore the database, and down-SQL does not restore lost data.**

Never do this: never run a destructive down migration merely because a file exists, and never describe a
rollback as complete until both schema and data impact have been verified.

---

Next step → record the change in `docs/PROJECT-STATUS.md` (migration number + verified dates) in the same branch.
