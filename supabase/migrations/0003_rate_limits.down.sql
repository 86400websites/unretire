-- 0003_rate_limits.down.sql — reverses the SCHEMA created by 0003_rate_limits.sql.
--
-- Schema only. It does NOT restore counter rows, and it is not a backup
-- (docs/templates/SUPABASE-CHANGE-TEMPLATE.md). Dropping this table REMOVES THE
-- ABUSE CONTROL: with the table gone the endpoints fail closed and refuse
-- writes, which is the intended posture but will look like an outage. Run only
-- on unretire-test, only on an explicit owner instruction.

drop index if exists public.rate_limits_window_start_idx;
drop table if exists public.rate_limits;
