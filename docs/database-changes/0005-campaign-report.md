# Database change 0005 — the webinar report (`campaign_visits`, `campaign_people`)

Filled from `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`. Sprint **S6.2** (`docs/sprint-prompts/S6.2-webinar-report.md`, step 4).

## Change

| Field | Value |
|---|---|
| Change name | Webinar report — counted visits, one row per person who signed up, and a reset for a new webinar |
| Migration number | `0005` |
| Sprint / PR | S6.2 / #[PR_NUMBER — set when the PR opens] |
| Supabase project(s) | `unretire-test` (`dtdadtggahjsrmevwvbu`, TEST) · `unretire-prod` (`hcjivvlwxltyiycfbttc`, PROD) — refs only, never keys |
| Change class | **Additive and reversible (schema).** Two new tables and three new functions; no existing object is touched and no data is migrated. The file is re-runnable: before it creates its two report functions it drops this migration's own earlier shapes of them ("What and why", below). |
| Data impact | None at apply time (the tables start empty). Afterwards the tables hold report data only — see "What is stored". The owner's reset (`reset_campaign_report`) deletes one campaign's rows of the two new tables, for good. |
| Recovery source | Not needed to apply. A rollback that drops the tables deletes the counted data; nothing restores it (see "Recovery limits"). |

## What and why

The owner asked for a report of each webinar: visits to the sign-up page, people registered, people who showed up, and where they came from (his words are quoted in the sprint record). At Gate B on 2026-11-20 he made it simpler: no "Showed up" number and no "Counting from" date; a conversion percentage instead, and a reset, after the report password is typed again, for each new webinar (`docs/PROJECT-STATUS.md` D-65, which quotes him). Counting has to happen somewhere every server instance shares, and the project already has one database, so the counts live there:

- `public.campaign_visits` — one row per counted visit to `/conversation` (once per browser tab): campaign id, source key, time.
- `public.campaign_people` — one row per person who signed up, per campaign: a keyed one-way code (`person`), the source of their **first** accepted sign-up, when they registered (null for a Toolkit-only sign-up), when the row was made.
- `public.record_campaign_person(text, text, text, boolean)` — records one accepted sign-up in **one statement**: the first source stays for good and `registered_at` is set once, so two racing submissions cannot both win.
- `public.campaign_report(text)` — every count on `/report`, aggregated in the database: visits and registered people per source, for the whole campaign (no date window), and on every row `since`: when the campaign's first row was stored — the earliest `created_at` among all its rows, people who only asked for the Toolkit included; null only when the campaign holds no row. When no source has a visit or a registered person it returns one row with no source and zeros, so `since` still reaches the page. A plain select through the Data API is capped by the project's "Max rows" setting, so counting rows in the app would silently stop at the cap.
- `public.reset_campaign_report(text, timestamptz)` — "Start again for a new webinar": deletes every `campaign_visits` row and every `campaign_people` row of one campaign in **one statement** (both deletes commit together or not at all), **only if** the campaign's `since` is still the one the page was given (`p_since`) and never for a null one, and returns whether it did and how many of each went (`reset`, `visits`, `people`). The `since` check came with the independent review (round 1, Finding 1; round 2, Finding 3). Only `POST /report/reset` calls it, through `resetReport()`, after a valid session, this site's own Origin, the rate limit and the report password typed again.

~~No `DROP`, `DELETE` or type change on any existing object.~~ No `DROP`, `DELETE` or type change on any object outside this migration. Since the independent review the file drops two of its OWN earlier function shapes before it creates the current ones: `campaign_report(text)` — its result gained `since`, and a function's result columns cannot be changed in place — and the one-argument `reset_campaign_report(text)`, which had no `since` check and must not survive beside the new one. Both drops do nothing on a database that never had those shapes, Production among them. (The two `delete` statements inside `reset_campaign_report` touch only the two new tables, and run only when the owner resets the report.)

### What is stored

A campaign id, a source key, timestamps and — per person — `person`, the base64url form of HMAC-SHA256(`REPORT_SECRET`, `"conv-person:v1:"` + the trimmed, lower-cased email address). `REPORT_SECRET` is server-only and is not in the database, so nothing stored here can be turned back into an address by anyone without it; with it, the code for any known address can be made again, which is how a returning person is recognised. **Never** stored: an email address, a name, an IP address, a user agent, a referrer or a URL. Check constraints hold the shapes: campaign and source match `^[a-z0-9-]{1,32}$`; `person` is exactly 43 base64url characters. There is deliberately no list of sources in the schema, so a new platform never needs a migration.

## Files

- Up-SQL: `supabase/migrations/0005_campaign_report.sql`
- Down-SQL: `supabase/migrations/0005_campaign_report.down.sql` — drops the three functions — the reset in both its shapes, the one-argument one from before the review wherever it still is — and the two tables (schema only; it deletes the counted data and restores nothing).
- Access policy changes included in the same PR: RLS **enabled with no policy** on both tables (the 0003 pattern); table privileges of `anon` and `authenticated` **revoked**; execute on all three functions revoked from `public`, `anon` and `authenticated` and granted to `service_role` only (the 0004 pattern).

## Security check

- [x] Default-deny preserved: both tables have RLS enabled with no policy; `anon` and `authenticated` hold no table privilege at all.
- [x] Writes are server-only: only the service-role client (`src/lib/webinar/report-store.ts`) reads, writes or deletes these tables' rows. There is no per-user row; nothing is owner-scoped because no browser role can reach the tables.
- [x] No anonymous read/write path: the public visit endpoint writes through the server, never through the Data API.
- [x] The one delete path needs the password typed again: `reset_campaign_report` runs only from `POST /report/reset`, after a valid session, this site's own Origin, the rate limit (5 per 600 s, failing closed) and the report password. A session alone cannot reset, and a refused request deletes nothing.
- [x] Privileged functions: all three `SECURITY INVOKER`, `search_path` pinned to `''`, schema-qualified names throughout, execute held by `service_role` only, minimal returns (`void`; counts and the campaign's `since`; a yes or no and two counts).
- [x] No secret, key or connection string in the SQL, the PR or this record.

## Applied and verified

| Environment | Date | Applied by | Verified how |
|---|---|---|---|
| TEST | 2026-11-20 | builder, via the `supabase-test` MCP `apply_migration` (`0005_campaign_report`, recorded as version `20261120072915`), on the owner's YES of 2026-11-20 (Gate 0 item 1: *"go, yes to all"*). Server confirmed before the call: `supabase-test` → `project_ref=dtdadtggahjsrmevwvbu`. | Catalog and role probes below; functions exercised under the throwaway campaign `zz-s62-check`, then exactly those rows deleted (3 visits, 2 people, 1 inputs row); all three tables then held 0 rows. Security advisors: nothing new — the three tables appear only under the INFO "RLS enabled, no policy" lint, as `rate_limits` does by design; the WARN lines (`increment_rate_limit` and `set_updated_at` search_path, the test-only `rls_auto_enable()` helper, leaked-password protection) all predate this change. |
| TEST — the Gate B delta | 2026-11-20, after Gate B | builder, after the owner's *"go, yes keep orange"* (D-65; the test database under D-59). Not through `apply_migration`: the migration history still has the one `0005_campaign_report` row, version `20261120072915`, so it keeps one row per repository migration. | What changed, from the first file to today's: `campaign_report` replaced (the same signature, without the date window; its comment updated); `reset_campaign_report` created, with execute revoked from `public`, `anon` and `authenticated` and granted to `service_role` only, and its comment; the index comment set to the file's new words; `campaign_report_inputs` dropped — it held only test values. Then the catalog probes in the second table below. |
| TEST — the round-1 review delta | 2026-11-21, after the Codex review's round 1 | the owner, by hand: he pasted the whole file — re-runnable since this change — into the SQL editor of `unretire-test` and ran it; his words: *"ok done from my side"*. The builder's tries through `execute_sql` had been declined by the tool's own confirmation for statements that drop something, three times, and the owner chose the by-hand way (a deviation from `supabase/migrations/README.md`, which names `apply_migration`). The migration history keeps its one 0005 row. | Catalog reads and behaviour probes below ("after the round-1 review delta") |
| TEST — the round-2 review delta | 2026-11-22 (19:08 UTC on 2026-11-21) | builder, through the `supabase-test` MCP `execute_sql`, in ONE call: the file's two `create or replace function` statements (`campaign_report`, `reset_campaign_report`) with their `revoke`/`grant` and `comment` lines, word for word. No `DROP` is needed from the round-1 shape — the signatures and result columns are unchanged — and the tool declines statements that drop. On the owner's YES for the test database (D-59; again on 2026-11-21: *"Yes, update the test database (Recommended)"*). The migration history keeps its one 0005 row. | Catalog reads and behaviour probes below ("after the round-2 review delta") |
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
| `reset_campaign_report` on a throwaway campaign (`zz-s62-check`: 2 visits, 1 person), with `conv1` holding 13 visits and 6 people | answered (2, 1); afterwards `zz-s62-check` held **0** visits and **0** people and `conv1` was **unchanged** (13, 6) — the reset touches one campaign only |
| The reset end to end, through `POST /report/reset` and the page's own form | on the local production build (2026-11-20: `conv1` went to 0 visits and 0 people) and in both "E2E — Preview" runs at `0cd3fc6` (the report spec's FM-013 reset test passed) |

**Verified on `unretire-test`, 2026-11-21, after the round-1 review delta** (catalog reads, then the functions
exercised on throwaway campaigns only — never `conv1`):

| Probe | Result |
|---|---|
| The report functions in `public` | exactly `campaign_report(text)` → `TABLE(source, visits, registered, since)` and `reset_campaign_report(text, timestamptz)` → `TABLE(reset, visits, people)`, beside the unchanged `record_campaign_person(text, text, text, boolean)`; the earlier one-argument `reset_campaign_report(text)` is **gone** |
| All three: security / search_path / execute ACL / comments | `SECURITY INVOKER`; `search_path=""`; ACL `{postgres=X/postgres,service_role=X/postgres}`; the file's comments |
| Both tables: RLS / policies / `anon` and `authenticated` privileges | RLS **on**, **0** policies, **no** privileges |
| Migration history | still one row for 0005 |
| `since` as the page receives it (`zz-s62-r1`, one visit) | `2026-11-21T15:55:30.957191+00:00` — PostgREST's JSON form, which `isPeriodStamp` accepts |
| A reset of that campaign with an old `since`, then with `null` | `reset` **false**, **0** deleted, both times; the visit still there |
| A reset with the `since` the page showed | `reset` **true**, **1** visit deleted; the campaign then empty |
| An empty campaign, `since` null | **0** deleted |
| A Toolkit-only person (`zz-s62-tk`): the report, then a reset from that empty page | **0** report rows; `reset` true, **0** deleted — the row stays (an empty page deletes nothing); once the person registered, a reset with the new `since` deleted it (0 visits, 1 person) |
| `conv1` during the probes | untouched: 0 visits and 0 people before and after |
| Throwaway rows left | **none** (no `zz-s62-` rows in either table) |

**Verified on `unretire-test`, 2026-11-22, after the round-2 review delta** (catalog reads, then the functions
exercised on throwaway campaigns only — never `conv1`). It supersedes the Toolkit-only row of the table above:
a campaign that holds only Toolkit sign-ups now has a `since`, and a reset that is given it deletes them.

| Probe | Result |
|---|---|
| The report functions in `public` | exactly `campaign_report(text)` → `TABLE(source, visits, registered, since)`, `reset_campaign_report(text, timestamptz)` → `TABLE(reset, visits, people)` and `record_campaign_person(text, text, text, boolean)`; all `SECURITY INVOKER`, `search_path=""`, ACL `{postgres=X/postgres,service_role=X/postgres}`, the file's comments |
| The two changed bodies against the file | **identical**: `md5(prosrc)` and the length equal the file's text between its `$$` marks for both (`campaign_report` 997 characters, `reset_campaign_report` 797). `record_campaign_person`, which this delta did not touch, is the file's body with Windows line endings (345 characters against 338 — the owner's paste of round 1): the same words |
| An empty campaign (`zz-s62-r2-empty`) | the report: **one** row — no source, 0 and 0, `since` null. A reset with null: `reset` true, 0 and 0 deleted |
| A Toolkit-only campaign (`zz-s62-r2-tk`: one person from `linkedin`, not registered) | the report: **one** row — no source, 0 and 0, and a `since` (`2026-11-21T19:08:11.399171+00:00`) |
| Its reset with null (a page opened before that sign-up), then with an old `since` | `reset` **false** both times, nothing deleted; the person still there |
| Its reset with the `since` the page was given | `reset` **true**: 0 visits and **1** person deleted |
| The same person then registers from `instagram` | the report credits **instagram** — 0 visits, 1 registered: the scenario of the review's round-2 Finding 3 |
| A counted campaign whose first row is a Toolkit-only person (`zz-s62-r2-mix`: that person from `email`, then a `linkedin` visit and a registered `linkedin` person) | the report: one row, `linkedin` 1 and 1, and no row without a source; its `since` is the Toolkit person's `created_at` (`2026-11-21T19:08:46.354956+00:00`), the first row stored |
| Its reset with the time of the first visit instead | `reset` **false**, nothing deleted (1 visit and 2 people still there) |
| Its reset with the `since` the page was given | `reset` **true**: **1** visit and **2** people deleted |
| `conv1` during the probes | untouched: 0 visits and 0 people before and after |
| Throwaway rows left | **none** (no `zz-s62-` rows in either table) |
| Migration history | still one row for 0005 |

## Rollback plan

1. Nothing user-facing depends on these tables for anything but the report: sign-ups never wait on them (`src/app/api/conversation/route.ts` records after Mailchimp has answered, in a call that cannot throw).
2. Retreat the dependent code first (revert the PR / promote the previous deploy). The previous code never touches these tables.
3. Prefer keeping the additive schema. If the schema must go, test the down file on `unretire-test` first; a human runs it in Production only after exporting any numbers the owner wants to keep. The down file drops the three functions — `reset_campaign_report` in both its shapes (the one-argument one from before the Codex review, wherever it still is), `campaign_report`, `record_campaign_person` — then the two tables.
4. Dropping the tables deletes every counted visit and every sign-up code. Nothing restores them.
5. Verify `/conversation` sign-ups and the home page afterwards.

Order matters: schema deploys before the code that depends on it. If the code is deployed first, `/report` shows its error line, the visit endpoint answers 503 and sign-ups carry on as before.

## Recovery limits

The down file reverses the schema only. It is not a backup and does not restore any row. A reset is not reversible either: the rows `reset_campaign_report` deletes are gone for good, which is why the page tells the owner to take a screenshot first.

## Before Production

The owner applies the up file by hand in the Supabase SQL editor of `unretire-prod`, **before** he merges (sprint record, Gate 0 item 5), then adds the two Production values. The builder then verifies read-only through `supabase-prod-readonly`. No version of 0005 has reached Production yet (the PROD row above is still open), so Production gets today's file whole: no `campaign_report_inputs`, and no delta to run.
