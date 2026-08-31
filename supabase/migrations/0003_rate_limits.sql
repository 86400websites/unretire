-- 0003_rate_limits.sql — public.rate_limits: abuse control for the public write
-- endpoints (Known issue 5, SECURITY-CHECKLIST §5, invariant I7).
--
-- Sprint S4.5. Unlike 0001 and 0002 this is NOT a capture of an existing
-- production object: it is a NEW table, designed here, applied to unretire-test
-- first. Classification: ADDITIVE and REVERSIBLE (paired down file drops it).
-- No existing table is touched and no data is migrated.
--
-- WHY A TABLE RATHER THAN A THIRD-PARTY LIMITER. Serverless functions do not
-- share memory, so an in-process counter would reset on every cold start and
-- allow unlimited bursts — a control that looks present and does nothing. The
-- database is the one piece of state every instance already shares, and the
-- project has one. Chosen by the owner over Cloudflare Turnstile + Upstash
-- (decision D-9) because it adds no vendor, no account and no new secret.
--
-- WHY NO RLS POLICY. RLS is enabled and NO policy is created, which is
-- deliberate: this table must be default-deny to every browser-facing role.
-- Only the service-role client writes it, and that bypasses RLS. A signed-in
-- user being able to read — let alone delete — their own rate-limit rows would
-- hand them the bypass.

create table if not exists public.rate_limits (
  -- Who is being limited: a hash of the caller's IP plus the endpoint name.
  -- The raw IP is never stored (see the note in src/lib/rate-limit.ts).
  bucket      text        not null,
  -- Start of the fixed window this row counts.
  window_start timestamptz not null,
  hits        integer     not null default 0,
  primary key (bucket, window_start)
);

alter table public.rate_limits enable row level security;

-- Deliberately NO policies. See the note above.

-- Old windows are dead weight; this index makes the sweep cheap.
create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);

comment on table public.rate_limits is
  'Fixed-window request counters for public write endpoints (S4.5, Known issue 5). Service-role only: RLS is on with no policy, so every browser-facing role is denied by default.';
