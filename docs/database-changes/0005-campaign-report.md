# Database change 0005 — the webinar report (`campaign_visits`, `campaign_people`, `campaign_report_inputs`)

Filled from `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`. Sprint **S6.2** (`docs/sprint-prompts/S6.2-webinar-report.md`, step 4).

## Change

| Field | Value |
|---|---|
| Change name | Webinar report — counted visits, one row per person who signed up, the owner's two typed numbers |
| Migration number | `0005` |
| Sprint / PR | S6.2 / #[PR_NUMBER — set when the PR opens] |
| Supabase project(s) | `unretire-test` (`dtdadtggahjsrmevwvbu`, TEST) · `unretire-prod` (`hcjivvlwxltyiycfbttc`, PROD) — refs only, never keys |
| Change class | **Additive and reversible (schema).** Three new tables and two new functions; no existing object is touched and no data is migrated. |
| Data impact | None at apply time (the tables start empty). Afterwards the tables hold report data only — see "What is stored". |
| Recovery source | Not needed to apply. A rollback that drops the tables deletes the counted data; nothing restores it (see "Recovery limits"). |

## What and why

The owner asked for a report of each webinar: visits to the sign-up page, people registered, people who showed up, and where they came from (his words are quoted in the sprint record). Counting has to happen somewhere every server instance shares, and the project already has one database, so the counts live there:

- `public.campaign_visits` — one row per counted visit to `/conversation` (once per browser tab): campaign id, source key, time.
- `public.campaign_people` — one row per person who signed up, per campaign: a keyed one-way code (`person`), the source of their **first** accepted sign-up, when they registered (null for a Toolkit-only sign-up), when the row was made.
- `public.campaign_report_inputs` — per campaign, the two numbers the owner types into `/report`: the "Counting from" date and the "Showed up" number.
- `public.record_campaign_person(text, text, text, boolean)` — records one accepted sign-up in **one statement**: the first source stays for good and `registered_at` is set once, so two racing submissions cannot both win.
- `public.campaign_report(text)` — every number on `/report`, aggregated in the database (visits and registrations per source, from 00:00 Africa/Johannesburg on the `count_from` day). A plain select through the Data API is capped by the project's "Max rows" setting, so counting rows in the app would silently stop at the cap.

No `DROP`, `DELETE` or type change on any existing object.

### What is stored

A campaign id, a source key, timestamps, the two typed numbers and — per person — `person`, the base64url form of HMAC-SHA256(`REPORT_SECRET`, `"conv-person:v1:"` + the trimmed, lower-cased email address). `REPORT_SECRET` is server-only and is not in the database, so nothing stored here can be turned back into an address by anyone without it; with it, the code for any known address can be made again, which is how a returning person is recognised. **Never** stored: an email address, a name, an IP address, a user agent, a referrer or a URL. Check constraints hold the shapes: campaign and source match `^[a-z0-9-]{1,32}$`; `person` is exactly 43 base64url characters; `showed_up` is 0 to 100000. There is deliberately no list of sources in the schema, so a new platform never needs a migration.

## Files

- Up-SQL: `supabase/migrations/0005_campaign_report.sql`
- Down-SQL: `supabase/migrations/0005_campaign_report.down.sql` — drops the two functions and the three tables (schema only; it deletes the counted data and restores nothing).
- Access policy changes included in the same PR: RLS **enabled with no policy** on all three tables (the 0003 pattern); table privileges of `anon` and `authenticated` **revoked**; execute on both functions revoked from `public`, `anon` and `authenticated` and granted to `service_role` only (the 0004 pattern).

## Security check

- [x] Default-deny preserved: all three tables have RLS enabled with no policy; `anon` and `authenticated` hold no table privilege at all.
- [x] Writes are server-only: only the service-role client (`src/lib/webinar/report-store.ts`) reads or writes these tables. There is no per-user row; nothing is owner-scoped because no browser role can reach the tables.
- [x] No anonymous read/write path: the public visit endpoint writes through the server, never through the Data API.
- [x] Privileged functions: both `SECURITY INVOKER`, `search_path` pinned to `''`, schema-qualified names throughout, execute held by `service_role` only, minimal returns (`void`; three columns of counts).
- [x] No secret, key or connection string in the SQL, the PR or this record.

## Applied and verified

| Environment | Date | Applied by | Verified how |
|---|---|---|---|
| TEST | 2026-11-20 | builder, via the `supabase-test` MCP `apply_migration` (`0005_campaign_report`, recorded as version `20261120072915`), on the owner's YES of 2026-11-20 (Gate 0 item 1: *"go, yes to all"*). Server confirmed before the call: `supabase-test` → `project_ref=dtdadtggahjsrmevwvbu`. | Catalog and role probes below; functions exercised under the throwaway campaign `zz-s62-check`, then exactly those rows deleted (3 visits, 2 people, 1 inputs row); all three tables then held 0 rows. Security advisors: nothing new — the three tables appear only under the INFO "RLS enabled, no policy" lint, as `rate_limits` does by design; the WARN lines (`increment_rate_limit` and `set_updated_at` search_path, the test-only `rls_auto_enable()` helper, leaked-password protection) all predate this change. |
| PROD | [DATE — the owner, Gate 0 item 5] | [the owner, by hand, in the Supabase SQL editor] | [read-only, through `supabase-prod-readonly` after he applies it: tables, RLS, no policy, grants — no rows read] |

**Verified on `unretire-test`, 2026-11-20:**

| Probe | Result |
|---|---|
| RLS on / policies, each of the three tables | RLS **on**, **0** policies |
| `anon` and `authenticated` — select / insert privilege, each table | **none** (`has_table_privilege` false) |
| `service_role` — select / insert, each table | yes |
| `anon` selects from `campaign_visits` | **refused** — `42501 permission denied for table campaign_visits` |
| `authenticated` calls `campaign_report('conv1')` | **refused** — `42501 permission denied for function campaign_report` |
| `authenticated` calls `record_campaign_person(…)` | **refused** — `42501 permission denied for function record_campaign_person` |
| Both functions: security / search_path / execute ACL | `SECURITY INVOKER`; `search_path=""`; ACL `{postgres=X/postgres,service_role=X/postgres}` |
| First touch: Toolkit from `linkedin`, then register from `instagram`, register again from `whatsapp`, Toolkit from `facebook` | source stays **`linkedin`**; `registered_at` set at the first registration and **unchanged** afterwards |
| `campaign_report` with 3 visits (2 linkedin, 1 whatsapp) and 2 registered people (linkedin, other) | `linkedin` 2 / 1 · `other` 0 / 1 · `whatsapp` 1 / 0 — a source with visits only, or registrations only, still returns its row |
| `count_from` = tomorrow (Johannesburg) | **0** rows |
| `count_from` = today (Johannesburg) | the same three rows; the window starts at `2026-11-19 22:00:00+00`, which is 00:00 in Johannesburg |
| A 42-character `person`; source `LinkedIn`; `showed_up` 100001 | each **refused** by its check constraint (`23514`) |
| Index comment (added to the file after the first apply, so that every object has one — S6.2 review of the migration) | set on `unretire-test` with the file's exact `comment on index …` statement through the `supabase-test` MCP `execute_sql` (metadata only; no migration-history row, so the history keeps one row per repository migration); `obj_description` read back the same text. Production gets it with the whole file. |

## Rollback plan

1. Nothing user-facing depends on these tables for anything but the report: sign-ups never wait on them (`src/app/api/conversation/route.ts` records after Mailchimp has answered, in a call that cannot throw).
2. Retreat the dependent code first (revert the PR / promote the previous deploy). The previous code never touches these tables.
3. Prefer keeping the additive schema. If the schema must go, test the down file on `unretire-test` first; a human runs it in Production only after exporting any numbers the owner wants to keep.
4. Dropping the tables deletes every counted visit, every sign-up code and the two typed numbers. Nothing restores them.
5. Verify `/conversation` sign-ups and the home page afterwards.

Order matters: schema deploys before the code that depends on it. If the code is deployed first, `/report` shows its error line, the visit endpoint answers 503 and sign-ups carry on as before.

## Recovery limits

The down file reverses the schema only. It is not a backup and does not restore any row.

## Before Production

The owner applies the up file by hand in the Supabase SQL editor of `unretire-prod`, **before** he merges (sprint record, Gate 0 item 5), then adds the two Production values. The builder then verifies read-only through `supabase-prod-readonly`.
