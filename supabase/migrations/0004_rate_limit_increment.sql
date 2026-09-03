-- 0004_rate_limit_increment.sql — atomic counter for the rate limiter.
-- Pre-launch review Finding 6 (Blocking). Sprint S4.5b.
--
-- Classification: ADDITIVE and REVERSIBLE. Adds one function; no table or data
-- is touched. Applied to unretire-test first.
--
-- WHY. src/lib/rate-limit.ts read the count, added one, and wrote it back. That
-- is three round trips with no lock, so N concurrent requests all read the same
-- value, all pass the limit check, and all write the same incremented number.
-- A hundred simultaneous requests read hits=0, are ALL admitted, and store
-- hits=1. The original code called this "the limit, give or take the
-- concurrency"; the review correctly pointed out the excess is unbounded, which
-- makes the control close to worthless against exactly the scripted flood it
-- exists to stop.
--
-- INSERT ... ON CONFLICT DO UPDATE ... RETURNING is a single statement, so
-- Postgres serialises concurrent callers on the row lock and each one gets a
-- distinct, correct count back.
create or replace function public.increment_rate_limit(
  p_bucket       text,
  p_window_start timestamptz
)
returns integer
language plpgsql
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits (bucket, window_start, hits)
  values (p_bucket, p_window_start, 1)
  on conflict (bucket, window_start)
    do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  return v_hits;
end;
$$;

-- SECURITY INVOKER (the default) is deliberate: the caller is the service-role
-- client, which bypasses RLS anyway, so the function needs no elevated rights.
-- A SECURITY DEFINER version would be a new privilege boundary reachable by
-- anyone who can call RPC.
--
-- Execute is then restricted to service_role. Without this, a signed-in user
-- could call the RPC directly and drive any bucket's counter up — locking other
-- people out — or discover counts. The limiter must be writable only by the
-- server that enforces it.
revoke all on function public.increment_rate_limit(text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.increment_rate_limit(text, timestamptz)
  to service_role;

comment on function public.increment_rate_limit(text, timestamptz) is
  'Atomically increments and returns a fixed-window request counter. service_role only (S4.5b, review Finding 6).';
