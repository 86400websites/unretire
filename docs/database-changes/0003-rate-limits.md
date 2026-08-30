# Database change 0003 — `public.rate_limits`

Filled from `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`. Sprint **S4.5**, Known issue **5**.

| | |
|---|---|
| **Migration** | `supabase/migrations/0003_rate_limits.sql` (+ `.down.sql`) |
| **Classification** | **Additive and reversible.** A new table; no existing table is touched and no data is migrated. |
| **Applied to** | `unretire-test` only, 2026-08-30, by the build agent. **Not applied to `unretire-prod`** — that needs an explicit owner instruction. |
| **Authorised by** | Owner, 2026-08-30, selecting the database-backed rate limit over Cloudflare Turnstile + Upstash (decision **D-9**). The chosen option stated "one small new table, applied to the test database first". |

## Why this exists

`/api/subscribe` is fully public and writes to a **live** Mailchimp audience shared by every environment (D-22). With no abuse control, a loop could stuff the list or burn the send quota. `docs/SECURITY-CHECKLIST.md` §5 makes at least one enforced control a launch requirement (invariant **I7**).

## Why a table rather than a third-party limiter

Serverless functions do not share memory, so an in-process counter resets on every cold start and lets a burst straight through — a control that appears to exist and does nothing. The database is the only state every instance already shares, and this project has one. It adds no vendor, no account and no new secret.

## Why there is no RLS policy

RLS is **enabled with zero policies**, which is the point: the table must be default-deny to every browser-facing role. Only the service-role client writes it, and that bypasses RLS. If a signed-in user could read — let alone delete — their own counter rows, they could reset their own limit and the control would be decorative.

**Verified empirically on `unretire-test` after applying:**

| Probe | Result |
|---|---|
| service role reads a seeded row | 1 row — the table works |
| `anon` reads | **0 rows** |
| `authenticated` reads | **0 rows** |
| `authenticated` attempts DELETE | **0 rows deleted** |

The probe row was removed afterwards; the table is empty.

## Recovery limits

Down-SQL drops the index and table. It **does not restore counter rows**, and it is not a backup. Dropping this table **removes the abuse control**, and because the limiter fails closed the endpoints will then refuse writes — the intended posture, but it will look like an outage.

## Before Production

The table must exist in `unretire-prod` before the limiter can work there. Until it does, `/api/subscribe` will fail closed and refuse every submission. **This is an owner action and a launch-checklist prerequisite**, recorded in `docs/OWNER-ACTIONS.md`.
