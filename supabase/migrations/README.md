# supabase/migrations — numbered schema and policy changes

Adopted in Sprint S2.5 (2026-08-28) per `docs/ENVIRONMENT-PARITY.md` §5.6 and
`docs/templates/SUPABASE-CHANGE-TEMPLATE.md`. From this date the two Supabase projects diverge **only** through a
file in this folder.

- **Numbering:** `NNNN_snake_name.sql` (up) paired with `NNNN_snake_name.down.sql` (down). Never reuse a number.
  The down file reverses the schema only — it never restores data and is never a backup.
- **Policies ride with the table:** RLS enable + every policy live in the same up file as the table they guard.
- **Order of application:** `unretire-test` (ref `dtdadtggahjsrmevwvbu`) FIRST, through the `supabase-test` MCP
  `apply_migration`, only after the owner has explicitly authorised that application; verified read-only per role;
  then owner approval; then `unretire-prod` (ref `hcjivvlwxltyiycfbttc`) **by a human, by hand** — no agent writes
  to Production through any channel (`docs/SUPABASE-MCP-SAFETY.md` §§4–5).
- **Change record:** one filled `SUPABASE-CHANGE-TEMPLATE.md` per migration under `docs/database-changes/`, with the
  applied/verified dates for both environments; the number and dates are also recorded in `docs/PROJECT-STATUS.md`.
- **0001 and 0002 are the production BASELINE** — captured read-only from `unretire-prod` on 2026-08-28, applied to
  `unretire-test` only. They were never applied to Production because Production is where they came from.
- `src/app/account/_book/book_downloads.sql` predates this folder and is left untouched as history; `0002` is the
  canonical copy from S2.5 on.
