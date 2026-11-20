-- 0005_campaign_report.sql — the webinar report (/report): counted visits to the
-- sign-up page, one row per person who signed up, and the two numbers the owner
-- types in. Sprint S6.2.
--
-- Classification: ADDITIVE and REVERSIBLE. Three new tables and two new
-- functions; no existing object is touched and no data is migrated. Applied to
-- unretire-test first, by the build agent, on the owner's YES of 2026-11-20;
-- applied to unretire-prod by the owner, by hand, before the merge.
--
-- WHAT IS STORED, AND WHAT IS NOT. A campaign id (for example "conv1"), a
-- source key (for example "linkedin"), timestamps, the two numbers the owner
-- types into /report, and — for each person who signed up — a keyed one-way
-- code made on the server from their email address (HMAC-SHA256 with the
-- server-only REPORT_SECRET; src/lib/webinar/report-store.ts). Never an email
-- address, a name, an IP address, a user agent, a referrer or a URL. The code
-- exists so a person who signs up twice is counted once, and so the place that
-- first brought them keeps the credit.
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
  'S6.2 webinar report: campaign_report counts one campaign''s visits from the owner''s "Counting from" day.';

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

-- The two numbers the owner types into /report, per campaign.
create table if not exists public.campaign_report_inputs (
  campaign    text        primary key check (campaign ~ '^[a-z0-9-]{1,32}$'),
  -- Count from 00:00 Africa/Johannesburg on this day; null = from the beginning.
  count_from  date,
  -- The attendance number from Zoom; null = not added yet.
  showed_up   integer     check (showed_up between 0 and 100000),
  updated_at  timestamptz not null default now()
);

alter table public.campaign_report_inputs enable row level security;

comment on table public.campaign_report_inputs is
  'S6.2 webinar report: the "Counting from" date and the "Showed up" number the owner types into /report. Service-role only: RLS on with no policy.';

revoke all on table public.campaign_visits from anon, authenticated;
revoke all on table public.campaign_people from anon, authenticated;
revoke all on table public.campaign_report_inputs from anon, authenticated;

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

-- Every number on /report, aggregated HERE. A plain select through the API is
-- capped at the project's "Max rows" setting (1000 by default), so counting
-- rows in the app would silently stop at the cap.
--
-- One row per source that has visits, registrations or both, counted from
-- 00:00 Africa/Johannesburg on the campaign's count_from day (all rows when
-- it is null). A visit counts by when it happened; a registration by when the
-- person registered.
create or replace function public.campaign_report(p_campaign text)
returns table (source text, visits bigint, registered bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with since as (
    select coalesce(
      (select (i.count_from::timestamp at time zone 'Africa/Johannesburg')
         from public.campaign_report_inputs i
        where i.campaign = p_campaign),
      '-infinity'::timestamptz
    ) as t
  ),
  v as (
    select cv.source, count(*) as n
      from public.campaign_visits cv
      cross join since
     where cv.campaign = p_campaign
       and cv.created_at >= since.t
     group by cv.source
  ),
  r as (
    select cpe.source, count(*) as n
      from public.campaign_people cpe
      cross join since
     where cpe.campaign = p_campaign
       and cpe.registered_at is not null
       and cpe.registered_at >= since.t
     group by cpe.source
  )
  select coalesce(v.source, r.source),
         coalesce(v.n, 0)::bigint,
         coalesce(r.n, 0)::bigint
    from v
    full outer join r on r.source = v.source
   order by 1;
$$;

-- SECURITY INVOKER (stated explicitly) is deliberate, as in 0004: the caller
-- is the service-role client, which already has the rights it needs; a
-- SECURITY DEFINER function would be a new privilege boundary reachable by
-- anyone who can call RPC. Execute is then held by service_role alone, so a
-- browser — signed in or not — can neither write a sign-up nor read the totals.
revoke all on function public.record_campaign_person(text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.record_campaign_person(text, text, text, boolean)
  to service_role;

revoke all on function public.campaign_report(text)
  from public, anon, authenticated;
grant execute on function public.campaign_report(text)
  to service_role;

comment on function public.record_campaign_person(text, text, text, boolean) is
  'S6.2: records one accepted webinar sign-up in one statement; the first source stays and registered_at is set once. service_role only.';
comment on function public.campaign_report(text) is
  'S6.2: the totals behind /report — visits and registrations per source from the campaign''s count_from day (00:00 Africa/Johannesburg). service_role only.';
