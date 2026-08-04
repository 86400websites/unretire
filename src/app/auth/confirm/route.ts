import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email callback for BOTH sign-up confirmation and password recovery.
 * Supabase may send either flow:
 *   • PKCE flow  → arrives with `?code=...`; exchange via exchangeCodeForSession.
 *   • OTP flow   → arrives with `?token_hash=...&type=...`; verify via verifyOtp.
 * Recovery links (type=recovery) use PKCE, which is why the code path is needed.
 * After a session is established, redirect onward (default: account page).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Only allow same-origin relative redirects, and default somewhere safe.
  const nextParam = searchParams.get("next") ?? "/unretire/account";
  const next = nextParam.startsWith("/") ? nextParam : "/unretire/account";

  const supabase = await createClient();

  // PKCE flow (used by recovery links): exchange the code for a session.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // OTP flow (used by older confirm links): verify the token hash.
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Token missing/expired/invalid → send to login with a flag we can show.
  return NextResponse.redirect(
    new URL("/unretire/login?error=confirmation_failed", request.url),
  );
}
