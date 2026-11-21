-- 0005_campaign_report.down.sql — reverses the SCHEMA created by
-- 0005_campaign_report.sql.
--
-- Schema only, and it is not a backup (docs/templates/SUPABASE-CHANGE-TEMPLATE.md).
-- DROPPING THESE TABLES DELETES EVERY COUNTED VISIT AND EVERY SIGN-UP CODE —
-- nothing here can bring them back. With the tables gone /report shows its
-- error line, the visit endpoint answers 503 and sign-ups carry on unaffected
-- (the counting never blocks a sign-up). Run only on unretire-test, only on an
-- explicit owner instruction.

drop function if exists public.reset_campaign_report(text, timestamptz);
-- This migration's earlier reset (before the Codex review of S6.2), wherever it
-- still is: its body is text, so dropping the tables would not remove it.
drop function if exists public.reset_campaign_report(text);
drop function if exists public.campaign_report(text);
drop function if exists public.record_campaign_person(text, text, text, boolean);
drop table if exists public.campaign_people;
drop table if exists public.campaign_visits;
