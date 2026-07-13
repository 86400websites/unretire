import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses the SECRET key and bypasses Row Level
 * Security. This is the ONLY trusted server path allowed to WRITE
 * entitlements. Import it ONLY in the Stripe webhook. Never import it
 * into anything that runs from user input or the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
