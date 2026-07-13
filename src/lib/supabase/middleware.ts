import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on each request and keeps the
 * session cookies in sync between the request and the response.
 * Call this from the root middleware.ts.
 *
 * FAIL-OPEN: this runs on every route, so it must never be the reason
 * the whole site goes down. If the Supabase env vars aren't present
 * (e.g. a build that predates them) or the auth call throws for any
 * reason, we return the request untouched. The worst case is that the
 * auth session isn't refreshed on that request — not a site-wide 500.
 *
 * IMPORTANT: always return the response object as-is (or copy its
 * cookies onto any new response you create), or the browser and server
 * can fall out of sync and log users out unexpectedly.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Environment not configured — skip refresh instead of crashing.
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "updateSession: Supabase env vars missing; skipping session refresh.",
    );
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Touch the user to trigger a token refresh when needed.
    // Do not run other logic between creating the client and this call.
    await supabase.auth.getUser();

    return supabaseResponse;
  } catch (err) {
    // Never let an auth hiccup take down every route.
    console.error("updateSession failed; passing request through:", err);
    return NextResponse.next({ request });
  }
}
