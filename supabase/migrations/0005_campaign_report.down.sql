-- 0005_campaign_report.down.sql — reverses the SCHEMA created by
-- 0005_campaign_report.sql.
--
-- Schema only, and it is not a backup (docs/templates/SUPABASE-CHANGE-TEMPLATE.md).
-- DROPPING THESE TABLES DELETES EVERY COUNTED VISIT, EVERY SIGN-UP CODE AND THE
-- TWO NUMBERS THE OWNER TYPED IN — nothing here can bring them back. With the
-- tables gone /report shows its error line, the visit endpoint answers 503 and
-- sign-ups carry on unaffected (the counting never blocks a sign-up). Run only
-- on unretire-test, only on an explicit owner instruction.

drop function if exists public.campaign_report(text);
drop function if exists public.record_campaign_person(text, text, text, boolean);
drop table if exists public.campaign_report_inputs;
drop table if exists public.campaign_people;
drop table if exists public.campaign_visits;
