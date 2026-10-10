# Database Change Record — entitlements baseline capture

> One record per database change. Filled from `docs/templates/SUPABASE-CHANGE-TEMPLATE.md` in Sprint S2.5
> (2026-08-28). Kept with the PR that ships the change.

## Change

| Field | Value |
|---|---|
| Change name | `entitlements` — production baseline, captured |
| Migration number | 0001 (first number in `supabase/migrations/`; never reused) |
| Sprint / PR | S2.5 / #18 |
| Supabase project(s) | `unretire-test` · ref `dtdadtggahjsrmevwvbu` (TEST) · `unretire-prod` · ref `hcjivvlwxltyiycfbttc` (PROD) — names/refs only, never keys |
| Change class | **additive / backwards-compatible — a baseline capture.** On TEST it creates the table, its policy, trigger and function from nothing. On PROD it changes nothing: PROD is the source the file was captured from. |
| Data impact | none — no row is read, transformed or deleted in either project |
| Recovery source | not needed — nothing is destroyed; the down file is schema-only and is never run on PROD |

## What and why

`public.entitlements` — the table that records who has paid for what — existed only inside `unretire-prod`,
created by hand at an unrecorded time (Known issue 21; `docs/ENVIRONMENT-PARITY.md` §5.1 calls it "the single
highest-risk item in the project"). This migration is its **captured** definition: columns, defaults, the three
check/unique constraints, the `auth.users` foreign key with `ON DELETE CASCADE`, RLS enabled, the single
`authenticated` SELECT policy, and the `updated_at` trigger with its `plpgsql` function — read off `pg_catalog` and
`information_schema` through the read-only `supabase-prod-readonly` MCP (D-11) on 2026-08-28, never hand-rebuilt.
Sprint S2.5 needs it so that `unretire-test` becomes a structural twin of Production before any proof or suite runs
against a Preview (§5.1: "Isolation without fidelity is the failure mode"). **No destructive operation.**

**Capture findings, recorded rather than "fixed" (a capture must not improve on its source):**

1. `status` admits **three** values — `'active'`, `'canceled'`, `'expired'` — where `docs/ENVIRONMENT-PARITY.md`
   §5.1 listed two. The code writes only the first two. The docs are corrected in this sprint; the third value stays.
2. **No index on `stripe_subscription_id`** exists in production, although §5.1 expects one ("the lookup key when a
   subscription is cancelled"). The cancellation `update … eq("stripe_subscription_id", …)` therefore scans the table
   — harmless at 15 rows, and a real decision for S4.3 (add one through migration 0003+ after TEST-first
   verification). Not added here.
3. The trigger function `public.set_updated_at()` is `SECURITY INVOKER` with no pinned `search_path` — acceptable
   for a trigger function that touches only `new.updated_at`, noted for S4.3's hardening pass.
4. Table and function grants are Supabase's defaults (`postgres`, `anon`, `authenticated`, `service_role`: all
   privileges, gated by RLS); they come from the project's default privileges and are not restated in the file.

## Files

- Up-SQL: `supabase/migrations/0001_entitlements.sql`
- Down-SQL: `supabase/migrations/0001_entitlements.down.sql` — drops the trigger, the policy, the table and the
  function `public.set_updated_at()`. It reverses schema only; it never recreates deleted rows; it is never run on
  PROD (0001 is PROD's baseline — dropping it there would destroy the live access records).
- Access policy changes (RLS/policies) included in the same PR: yes — `"Users can read their own entitlements"`
  (`SELECT`, `to authenticated`, `using (auth.uid() = user_id)`) — the one and only policy, captured verbatim.

## Security check

- [x] Default-deny preserved: RLS is enabled (`relrowsecurity = true`) and the only policy is an own-row `SELECT`
      for `authenticated`; `anon` has no policy, so every `anon` read returns nothing. No default-allow table shipped.
- [x] Writes are owner-scoped — there is **no user-facing write policy at all**: every write comes from the Stripe
      webhook through the service-role client (`src/lib/supabase/admin.ts`), which bypasses RLS (SECURITY-CHECKLIST
      §9 I3). Checked server-side by signature verification in `src/app/api/stripe/webhook/route.ts`.
- [x] No anonymous read/write path added unintentionally (intentional anon paths: **none**).
- [x] Privileged functions: `public.set_updated_at()` is a trigger function only (no privilege, no data access beyond
      `new.updated_at`); it is `SECURITY INVOKER`; `search_path` is not pinned (finding 3 above, S4.3).
- [x] No secret, key, or connection string in the SQL, the PR, or this record.

## Applied and verified

| Environment | Date | Applied by | Verified how |
|---|---|---|---|
| TEST | 2026-08-28 | builder, via the `supabase-test` MCP `apply_migration` (`0001_entitlements`, recorded as version `20260828162023`), owner-authorised the same day (OWNER-ACTIONS 6.1: "Yes please — but please also verify") | read-only after apply: `list_tables` → `public.entitlements`, `rls_enabled: true`, 0 rows; the seven capture queries re-run on test return **identical** columns, the five constraints (incl. `entitlements_user_id_product_key UNIQUE (user_id, product)`), the two indexes, RLS on / not forced / owner `postgres`, the one policy verbatim, the same table/function ACLs, the trigger and `set_updated_at()` (body identical after CRLF→LF normalisation) — proof **P8** diff empty apart from the test project's platform helper `public.rls_auto_enable()` and its `supabase_migrations` history (neither from this file). **Unauthorised role refused:** `begin; set local role authenticated; insert into public.entitlements (user_id, product) values (gen_random_uuid(), 'course'); rollback;` → `ERROR 42501: new row violates row-level security policy for table "entitlements"`; `anon`/`authenticated` `count(*)` → 0/0 (vacuous while the table is empty — repeated in Step 7 once fixture rows exist) |
| PROD | 2026-08-28 (captured) | — **not applied: PROD is the source.** The definition was captured from it read-only (D-11); no human or agent applied anything to PROD in this sprint | the capture queries themselves (listed in `docs/sprint-prompts/S2.5-environment-parity.md`, Execution record): columns, `pg_constraint`, `pg_indexes`, `pg_policies` + RLS flags, `relacl`, `pg_trigger`, `pg_proc` |

Never do this: never apply to production first, never let an AI agent write to production through any channel, and never apply to PROD before TEST is verified.

## Rollback plan

1. Nothing to roll back on PROD — the baseline already exists there and nothing was applied.
2. On TEST, if the applied definition proves wrong: run `0001_entitlements.down.sql` on `unretire-test` **only**,
   on an explicit owner instruction, then re-apply a corrected numbered migration. The two S2.5 fixture
   entitlement rows would be lost and would be recreated by re-running the sandbox checkouts.
3. Prefer forward-fixing through a new numbered migration over a down file, as the template says.
4. No data was transformed or deleted anywhere, so no backup/PITR step applies.
5. Verify after any TEST rollback: `list_tables`, the policy list, and the parity specs.

Order matters: schema deploys before the code that depends on it; on rollback, code normally retreats
first. **Host rollback does not restore the database, and down-SQL does not restore lost data.**

Never do this: never run a destructive down migration merely because a file exists, and never describe a
rollback as complete until both schema and data impact have been verified.

---

Next step → record the change in `docs/PROJECT-STATUS.md` (migration number + verified dates) in the same branch.
