-- ============================================================
-- book_downloads — records that a user has downloaded a document,
-- so the personalized book/workbook can be limited to ONE download
-- per user per document.
--
-- Run this in the Supabase SQL editor.
--
-- NOTE (review with Mohammad): this writes to a new table. The download
-- route inserts a row after a successful generation. RLS is default-deny;
-- the route uses the user's own session, so a user can only ever see/insert
-- their own rows. A unique constraint on (user_id, doc_type) is what actually
-- enforces "once" — a second insert fails, and the route treats that as
-- "already downloaded".
-- ============================================================

create table if not exists public.book_downloads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  doc_type    text not null check (doc_type in ('book', 'workbook')),
  downloaded_at timestamptz not null default now(),
  unique (user_id, doc_type)
);

alter table public.book_downloads enable row level security;

-- A user can see their own download records.
create policy "own downloads readable"
  on public.book_downloads
  for select
  using (auth.uid() = user_id);

-- A user can insert only their own record (one per doc_type via the unique
-- constraint above).
create policy "own downloads insertable"
  on public.book_downloads
  for insert
  with check (auth.uid() = user_id);
