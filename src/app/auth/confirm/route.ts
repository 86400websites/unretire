import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email-confirmation callback. This is where the link in the Supabase
 * confirmation email lands. It exchanges the one-time token for a real
 * session (cookies set via the server client), then redirects the user
 * onward. Required because Confirm-email is ON.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Only allow same-origin relative redirects, and default somewhere safe.
  const nextParam = searchParams.get("next") ?? "/unretire/account";
  const next = nextParam.startsWith("/") ? nextParam : "/unretire/account";

  if (token_hash && type) {
    const supabase = await createClient();
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
