-- 0004_rate_limit_increment.down.sql — reverses 0004. Schema only.
--
-- Dropping this function BREAKS THE RATE LIMITER: src/lib/rate-limit.ts calls it
-- on every public write, and the limiter fails CLOSED, so the affected endpoints
-- will refuse submissions. That is the intended posture but will look like an
-- outage. Run only on unretire-test, only on an explicit owner instruction.

drop function if exists public.increment_rate_limit(text, timestamptz);
