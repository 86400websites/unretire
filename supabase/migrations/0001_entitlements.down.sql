-- 0001_entitlements.down.sql — reverses the SCHEMA created by 0001_entitlements.sql. Schema only.
--
-- It drops the trigger, the policy, the table and the trigger function. It does NOT and CANNOT restore any
-- row that was in public.entitlements — down-SQL is not a backup (docs/templates/SUPABASE-CHANGE-TEMPLATE.md).
-- It is never run against unretire-prod: 0001 is the production baseline, so "rolling it back" there would
-- destroy the live access records. Run only on unretire-test, only on an explicit owner instruction.

drop trigger if exists entitlements_updated_at on public.entitlements;
drop policy if exists "Users can read their own entitlements" on public.entitlements;
drop table if exists public.entitlements;
drop function if exists public.set_updated_at();
