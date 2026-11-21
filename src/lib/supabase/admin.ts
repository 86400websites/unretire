import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses the SECRET key and bypasses Row Level
 * Security. Server-only: never import it into a client component or anything
 * that can run in the browser.
 *
 * Its callers, each a server-only module that touches only its own tables:
 *   - src/app/api/stripe/webhook/route.ts — the ONLY writer of entitlements
 *     (SECURITY-CHECKLIST invariant I3);
 *   - src/lib/rate-limit.ts — the rate_limits counters (since S4.5);
 *   - src/lib/webinar/report-store.ts — the webinar report's tables from
 *     migration 0005 (S6.2).
 * A new caller is an architecture change: record it in
 * docs/TECH-ARCHITECTURE.md §6 first.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
