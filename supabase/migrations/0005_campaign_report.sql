-- 0005_campaign_report.sql — the webinar report (/report): counted visits to the
-- sign-up page and one row per person who signed up, with the functions that
-- record a sign-up, count the report and reset it for a new webinar. Sprint S6.2.
--
-- Classification: ADDITIVE and REVERSIBLE. Two new tables and three new
-- functions; no object outside this migration is touched and no data is
-- migrated. Applied to unretire-test first, by the build agent, on the owner's
-- YES of 2026-11-20; applied to unretire-prod by the owner, by hand, before
-- the merge.
--
-- RE-RUNNABLE. Every statement can run again on a database that already has
-- this migration, in an earlier shape or this one: the tables and the index
-- are created only if missing, and the two report functions are dropped and
-- created again (their shape changed after the Codex review of S6.2, and a
-- function's result columns cannot be changed in place). Those two drops touch
-- only this migration's own functions, and do nothing where they never were.
--
-- WHAT IS STORED, AND WHAT IS NOT. A campaign id (for example "conv1"), a
-- source key (for example "linkedin"), timestamps and — for each person who
-- signed up — a keyed one-way code made on the server from their email address
-- (HMAC-SHA256 with the server-only REPORT_SECRET;
-- src/lib/webinar/report-store.ts). Never an email address, a name, an IP
-- address, a user agent, a referrer or a URL. The code exists so a person who
-- signs up twice is counted once, and so the place that first brought them
-- keeps the credit.
--
-- WHY NO RLS POLICY. As in 0003: RLS is enabled and NO policy is created, so
-- every browser-facing role is denied by default. The table privileges of anon
-- and authenticated are revoked as well, so a direct API call is refused
-- outright rather than answered with an empty list. Only the server's
-- service-role client reads or writes these tables.

-- One row per counted visit to /conversation (once per browser tab).
create table if not exists public.campaign_visits (
  id          bigint      generated always as identity primary key,
  campaign    text        not null check (campaign ~ '^[a-z0-9-]{1,32}$'),
  source      text        not null check (source ~ '^[a-z0-9-]{1,32}$'),
  created_at  timestamptz not null default now()
);

alter table public.campaign_visits enable row level security;

create index if not exists campaign_visits_campaign_created_at_idx
  on public.campaign_visits (campaign, created_at);

comment on table public.campaign_visits is
  'S6.2 webinar report: one row per counted visit to the sign-up page. Campaign id, source key and time only. Service-role only: RLS on with no policy.';

comment on index public.campaign_visits_campaign_created_at_idx is
  'S6.2 webinar report: campaign_report and reset_campaign_report find one campaign''s visits.';

-- One row per person who signed up (either form), per campaign.
create table if not exists public.campaign_people (
  campaign       text        not null check (campaign ~ '^[a-z0-9-]{1,32}$'),
  -- base64url of HMAC-SHA256(REPORT_SECRET, "conv-person:v1:" + email):
  -- exactly 43 characters. Never the address itself.
  person         text        not null check (person ~ '^[A-Za-z0-9_-]{43}$'),
  -- The source of this person's FIRST accepted sign-up. Never updated.
  source         text        not null check (source ~ '^[a-z0-9-]{1,32}$'),
  -- Null until the person registers for the webinar (the Toolkit form alone
  -- leaves it null). Set once, never moved.
  registered_at  timestamptz,
  created_at     timestamptz not null default now(),
  primary key (campaign, person)
);

alter table public.campaign_people enable row level security;

comment on table public.campaign_people is
  'S6.2 webinar report: one row per person who signed up, keyed by a one-way code made from the email address with a server-only secret (never the address). Service-role only: RLS on with no policy.';

revoke all on table public.campaign_visits from anon, authenticated;
revoke all on table public.campaign_people from anon, authenticated;

-- Record a sign-up in ONE statement, so two submissions racing for the same
-- person cannot both "win": the first source stays for good, and
-- registered_at is set once — the first time the person registers — and never
-- moved. A Toolkit sign-up (p_registered false) after a registration changes
-- nothing.
create or replace function public.record_campaign_person(
  p_campaign   text,
  p_person     text,
  p_source     text,
  p_registered boolean
)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.campaign_people as cp (campaign, person, source, registered_at)
  values (p_campaign, p_person, p_source, case when p_registered then now() end)
  on conflict (campaign, person) do update
    set registered_at = excluded.registered_at
    where cp.registered_at is null
      and excluded.registered_at is not null;
$$;

-- This migration's own earlier shapes (before the Codex review of S6.2): the
-- report without `since`, and a reset with no `since` check, which must not
-- survive beside the new one. A no-op where they never existed.
drop function if exists public.campaign_report(text);
drop function if exists public.reset_campaign_report(text);

-- Every number on /report, aggregated HERE. A plain select through the API is
-- capped at the project's "Max rows" setting (1000 by default), so counting
-- rows in the app would silently stop at the cap.
--
-- One row per source that has visits, registered people or both: every visit
-- of the campaign, and every person of the campaign who has registered.
--
-- Every row also carries `since`: when the counting the report shows began —
-- the earliest counted visit (created_at) or registration (registered_at) of
-- the campaign. A visit is stamped when it is stored and a registration once,
-- so `since` changes when a reset deletes the rows, when an empty campaign
-- gets its first row, and — only in a period's first moments — when a row
-- whose transaction started earlier is stored a moment later (now() is a
-- transaction's start time). The page sends it back with a reset, and
-- reset_campaign_report refuses a reset whose `since` is no longer the
-- campaign's; a refreshed page then sends the new one. No row at all means
-- nothing is counted, and `since` is then null on both sides.
create function public.campaign_report(p_campaign text)
returns table (source text, visits bigint, registered bigint, since timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  with v as (
    select cv.source, count(*) as n
      from public.campaign_visits cv
     where cv.campaign = p_campaign
     group by cv.source
  ),
  r as (
    select cpe.source, count(*) as n
      from public.campaign_people cpe
     where cpe.campaign = p_campaign
       and cpe.registered_at is not null
     group by cpe.source
  ),
  s as (
    select least(
      (select min(cv.created_at)
         from public.campaign_visits cv
        where cv.campaign = p_campaign),
      (select min(cpe.registered_at)
         from public.campaign_people cpe
        where cpe.campaign = p_campaign)
    ) as since
  )
  select coalesce(v.source, r.source),
         coalesce(v.n, 0)::bigint,
         coalesce(r.n, 0)::bigint,
         s.since
    from v
    full outer join r on r.source = v.source
   cross join s
   order by 1;
$$;

-- "Start again for a new webinar" on /report: deletes every counted visit and
-- every counted person of the campaign, in ONE statement (both deletes commit
-- together or not at all), and answers whether it did and how many of each
-- went. The owner types the report password to confirm it
-- (src/app/report/reset/route.ts). The deleted rows cannot be brought back.
--
-- ONLY THE NUMBERS THE PAGE SHOWED. p_since is the `since` campaign_report
-- gave the page (null when it showed nothing). If the campaign's `since` is
-- no longer the same — a reset happened elsewhere after the page was opened,
-- or an empty report got its first row — nothing is deleted and `reset` is
-- false: the page was out of date. The check and the deletes are one
-- statement, so nothing can slip between them. A page that showed nothing
-- (p_since null) deletes nothing either: the only rows such a campaign can
-- hold are people who asked for the Toolkit and have not registered, which no
-- page shows, so they go with the next reset from a page that shows numbers.
drop function if exists public.reset_campaign_report(text, timestamptz);
create function public.reset_campaign_report(
  p_campaign text,
  p_since    timestamptz
)
returns table (reset boolean, visits bigint, people bigint)
language sql
security invoker
set search_path = ''
as $$
  with period as (
    select least(
      (select min(cv.created_at)
         from public.campaign_visits cv
        where cv.campaign = p_campaign),
      (select min(cpe.registered_at)
         from public.campaign_people cpe
        where cpe.campaign = p_campaign)
    ) is not distinct from p_since as unchanged
  ),
  v as (
    delete from public.campaign_visits
     where campaign = p_campaign
       and p_since is not null
       and (select unchanged from period)
    returning 1
  ),
  p as (
    delete from public.campaign_people
     where campaign = p_campaign
       and p_since is not null
       and (select unchanged from period)
    returning 1
  )
  select (select unchanged from period),
         (select count(*) from v)::bigint,
         (select count(*) from p)::bigint;
$$;

-- SECURITY INVOKER (stated explicitly) is deliberate, as in 0004: the caller
-- is the service-role client, which already has the rights it needs; a
-- SECURITY DEFINER function would be a new privilege boundary reachable by
-- anyone who can call RPC. Execute is then held by service_role alone, so a
-- browser — signed in or not — can neither write a sign-up, read the totals
-- nor reset them.
revoke all on function public.record_campaign_person(text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.record_campaign_person(text, text, text, boolean)
  to service_role;

revoke all on function public.campaign_report(text)
  from public, anon, authenticated;
grant execute on function public.campaign_report(text)
  to service_role;

revoke all on function public.reset_campaign_report(text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.reset_campaign_report(text, timestamptz)
  to service_role;

comment on function public.record_campaign_person(text, text, text, boolean) is
  'S6.2: records one accepted webinar sign-up in one statement; the first source stays and registered_at is set once. service_role only.';
comment on function public.campaign_report(text) is
  'S6.2: the totals behind /report — visits and registered people per source for one campaign, and since: when that counting began. service_role only.';
comment on function public.reset_campaign_report(text, timestamptz) is
  'S6.2: deletes one campaign''s visits and people in one statement, for a new webinar — only if its since is still the one the page showed; answers whether it did and how many of each. service_role only.';
