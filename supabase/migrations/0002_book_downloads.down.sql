-- 0002_book_downloads.down.sql — reverses the SCHEMA created by 0002_book_downloads.sql. Schema only.
--
-- It drops the two policies and the table. It does NOT and CANNOT restore any download record — down-SQL is
-- not a backup (docs/templates/SUPABASE-CHANGE-TEMPLATE.md). It is never run against unretire-prod: 0002 is
-- the production baseline. Run only on unretire-test, only on an explicit owner instruction.

drop policy if exists "own downloads insertable" on public.book_downloads;
drop policy if exists "own downloads readable" on public.book_downloads;
drop table if exists public.book_downloads;
