# Database change 0005 — the webinar report (`campaign_visits`, `campaign_people`)

Filled from `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`. Sprint **S6.2** (`docs/sprint-prompts/S6.2-webinar-report.md`, step 4).

## Change

| Field | Value |
|---|---|
| Change name | Webinar report — counted visits, one row per person who signed up, and a reset for a new webinar |
| Migration number | `0005` |
| Sprint / PR | S6.2 / #[PR_NUMBER — set when the PR opens] |
| Supabase project(s) | `unretire-test` (`dtdadtggahjsrmevwvbu`, TEST) · `unretire-prod` (`hcjivvlwxltyiycfbttc`, PROD) — refs only, never keys |
| Change class | **Additive and reversible (schema).** Two new tables and three new functions; no existing object is touched and no data is migrated. |
| Data impact | None at apply time (the tables start empty). Afterwards the tables hold report data only — see "What is stored". The owner's reset (`reset_campaign_report`) deletes one campaign's rows of the two new tables, for good. |
| Recovery source | Not needed to apply. A rollback that drops the tables deletes the counted data; nothing restores it (see "Recovery limits"). |

## What and why

The owner asked for a report of each webinar: visits to the sign-up page, people registered, people who showed up, and where they came from (his words are quoted in the sprint record). At Gate B on 2026-11-20 he made it simpler: no "Showed up" number and no "Counting from" date; a conversion percentage instead, and a reset, after the report password is typed again, for each new webinar (`docs/PROJECT-STATUS.md` D-65, which quotes him). Counting has to happen somewhere every server instance shares, and the project already has one database, so the counts live there:

- `public.campaign_visits` — one row per counted visit to `/conversation` (once per browser tab): campaign id, source key, time.
- `public.campaign_people` — one row per person who signed up, per campaign: a keyed one-way code (`person`), the source of their **first** accepted sign-up, when they registered (null for a Toolkit-only sign-up), when the row was made.
- `public.record_campaign_person(text, text, text, boolean)` — records one accepted sign-up in **one statement**: the first source stays for good and `registered_at` is set once, so two racing submissions cannot both win.
- `public.campaign_report(text)` — every count on `/report`, aggregated in the database: visits and registered people per source, for the whole campaign (no date window). A plain select through the Data API is capped by the project's "Max rows" setting, so counting rows in the app would silently stop at the cap.
- `public.reset_campaign_report(text)` — "Start again for a new webinar": deletes every `campaign_visits` row and every `campaign_people` row of one campaign in **one statement** (both deletes commit together or not at all) and returns how many of each went (`visits`, `people`). Only `POST /report/reset` calls it, through `resetReport()`, after a valid session, this site's own Origin, the rate limit and the report password typed again.

No `DROP`, `DELETE` or type change on any existing object. (The two `delete` statements inside `reset_campaign_report` touch only the two new tables, and run only when the owner resets the report.)

### What is stored

A campaign id, a source key, timestamps and — per person — `person`, the base64url form of HMAC-SHA256(`REPORT_SECRET`, `"conv-person:v1:"` + the trimmed, lower-cased email address). `REPORT_SECRET` is server-only and is not in the database, so nothing stored here can be turned back into an address by anyone without it; with it, the code for any known address can be made again, which is how a returning person is recognised. **Never** stored: an email address, a name, an IP address, a user agent, a referrer or a URL. Check constraints hold the shapes: campaign and source match `^[a-z0-9-]{1,32}$`; `person` is exactly 43 base64url characters. There is deliberately no list of sources in the schema, so a new platform never needs a migration.

## Files

- Up-SQL: `supabase/migrations/0005_campaign_report.sql`
- Down-SQL: `supabase/migrations/0005_campaign_report.down.sql` — drops the three functions and the two tables (schema only; it deletes the counted data and restores nothing).
- Access policy changes included in the same PR: RLS **enabled with no policy** on both tables (the 0003 pattern); table privileges of `anon` and `authenticated` **revoked**; execute on all three functions revoked from `public`, `anon` and `authenticated` and granted to `service_role` only (the 0004 pattern).

## Security check

- [x] Default-deny preserved: both tables have RLS enabled with no policy; `anon` and `authenticated` hold no table privilege at all.
- [x] Writes are server-only: only the service-role client (`src/lib/webinar/report-store.ts`) reads, writes or deletes these tables' rows. There is no per-user row; nothing is owner-scoped because no browser role can reach the tables.
- [x] No anonymous read/write path: the public visit endpoint writes through the server, never through the Data API.
- [x] The one delete path needs the password typed again: `reset_campaign_report` runs only from `POST /report/reset`, after a valid session, this site's own Origin, the rate limit (5 per 600 s, failing closed) and the report password. A session alone cannot reset, and a refused request deletes nothing.
- [x] Privileged functions: all three `SECURITY INVOKER`, `search_path` pinned to `''`, schema-qualified names throughout, execute held by `service_role` only, minimal returns (`void`; three columns of counts; two counts).
- [x] No secret, key or connection string in the SQL, the PR or this record.

## Applied and verified

| Environment | Date | Applied by | Verified how |
|---|---|---|---|
| TEST | 2026-11-20 | builder, via the `supabase-test` MCP `apply_migration` (`0005_campaign_report`, recorded as version `20261120072915`), on the owner's YES of 2026-11-20 (Gate 0 item 1: *"go, yes to all"*). Server confirmed before the call: `supabase-test` → `project_ref=dtdadtggahjsrmevwvbu`. | Catalog and role probes below; functions exercised under the throwaway campaign `zz-s62-check`, then exactly those rows deleted (3 visits, 2 people, 1 inputs row); all three tables then held 0 rows. Security advisors: nothing new — the three tables appear only under the INFO "RLS enabled, no policy" lint, as `rate_limits` does by design; the WARN lines (`increment_rate_limit` and `set_updated_at` search_path, the test-only `rls_auto_enable()` helper, leaked-password protection) all predate this change. |
| TEST — the Gate B delta | 2026-11-20, after Gate B | builder, after the owner's *"go, yes keep orange"* (D-65; the test database under D-59). Not through `apply_migration`: the migration history still has the one `0005_campaign_report` row, version `20261120072915`, so it keeps one row per repository migration. | What changed, from the first file to today's: `campaign_report` replaced (the same signature, without the date window; its comment updated); `reset_campaign_report` created, with execute revoked from `public`, `anon` and `authenticated` and granted to `service_role` only, and its comment; the index comment set to the file's new words; `campaign_report_inputs` dropped — it held only test values. Then the catalog probes in the second table below. |
| PROD | [DATE — the owner, Gate 0 item 5] | [the owner, by hand, in the Supabase SQL editor] | [read-only, through `supabase-prod-readonly` after he applies it: tables, RLS, no policy, grants — no rows read] |

**Verified on `unretire-test`, 2026-11-20, at the first apply** (the file then had three tables and two functions; the probes of what Gate B removed are struck):

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
| ~~`count_from` = tomorrow (Johannesburg)~~ | ~~**0** rows~~ |
| ~~`count_from` = today (Johannesburg)~~ | ~~the same three rows; the window starts at `2026-11-19 22:00:00+00`, which is 00:00 in Johannesburg~~ |
| A 42-character `person`; source `LinkedIn`; ~~`showed_up` 100001~~ | each **refused** by its check constraint (`23514`) |
| Index comment (added to the file after the first apply, so that every object has one — S6.2 review of the migration) | set on `unretire-test` with the file's exact `comment on index …` statement through the `supabase-test` MCP `execute_sql` (metadata only; no migration-history row, so the history keeps one row per repository migration); `obj_description` read back the same text. Production gets it with the whole file. Its words changed again with the Gate B delta (below). |

**Verified on `unretire-test`, 2026-11-20, after the Gate B delta** (catalog reads only; no row read):

| Probe | Result |
|---|---|
| `campaign_report_inputs` | **gone** — no such table in `public` |
| RLS on / policies, `campaign_visits` and `campaign_people` | RLS **on**, **0** policies |
| `anon` and `authenticated` — select / delete privilege, both tables | **none** (`has_table_privilege` false) |
| All three functions: security / search_path / execute ACL | `SECURITY INVOKER`; `search_path=""`; ACL `{postgres=X/postgres,service_role=X/postgres}` |
| `anon` and `authenticated` may execute `reset_campaign_report` | **no** (`has_function_privilege` false); `service_role` yes |
| The bodies of `campaign_report` and `reset_campaign_report` | the file's, word for word — `campaign_report` names neither `count_from` nor `campaign_report_inputs` |
| The comments on the three functions, the two tables and the index | the file's words |
| Migration history | still one row for 0005: `0005_campaign_report`, version `20261120072915` |

## Rollback plan

1. Nothing user-facing depends on these tables for anything but the report: sign-ups never wait on them (`src/app/api/conversation/route.ts` records after Mailchimp has answered, in a call that cannot throw).
2. Retreat the dependent code first (revert the PR / promote the previous deploy). The previous code never touches these tables.
3. Prefer keeping the additive schema. If the schema must go, test the down file on `unretire-test` first; a human runs it in Production only after exporting any numbers the owner wants to keep. The down file drops the three functions (`reset_campaign_report`, `campaign_report`, `record_campaign_person`), then the two tables.
4. Dropping the tables deletes every counted visit and every sign-up code. Nothing restores them.
5. Verify `/conversation` sign-ups and the home page afterwards.

Order matters: schema deploys before the code that depends on it. If the code is deployed first, `/report` shows its error line, the visit endpoint answers 503 and sign-ups carry on as before.

## Recovery limits

The down file reverses the schema only. It is not a backup and does not restore any row. A reset is not reversible either: the rows `reset_campaign_report` deletes are gone for good, which is why the page tells the owner to take a screenshot first.

## Before Production

The owner applies the up file by hand in the Supabase SQL editor of `unretire-prod`, **before** he merges (sprint record, Gate 0 item 5), then adds the two Production values. The builder then verifies read-only through `supabase-prod-readonly`. No version of 0005 has reached Production yet (the PROD row above is still open), so Production gets today's file whole: no `campaign_report_inputs`, and no delta to run.
