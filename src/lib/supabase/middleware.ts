import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on each request and keeps the
 * session cookies in sync between the request and the response.
 * Call this from the root middleware.ts.
 *
 * FAIL-OPEN, AND THAT IS THE RIGHT CHOICE HERE — reviewed in Sprint S4.4,
 * Known issue 14, decision D-30. Recorded because "fail-open auth middleware"
 * sounds alarming and the reasoning is worth not having to reconstruct.
 *
 * This middleware is NOT an access control. All it does is refresh the Supabase
 * session cookie. Nothing is authorised here, and no route relies on it for
 * protection: /account, /api/book-download, /api/checkout,
 * /api/course-worksheet and /learn/course/[module] each call getAccess() or
 * hasAccess() themselves and deny on their own (verified route by route,
 * S4.4). So when this passes a request through unrefreshed, the gate further in
 * still runs — and an expired token makes getUser() return null there, which
 * denies. The system fails CLOSED at the point that decides access.
 *
 * Making this fail closed would mean every route on the site — including the
 * public marketing pages — returning 500 whenever Supabase has a hiccup, in
 * exchange for no security gain, since the real checks would have denied anyway.
 *
 * If a future route is ever gated by middleware rather than by its own check,
 * this reasoning stops holding and the decision must be revisited.
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
