"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  isPaidProduct,
  type PaidProduct,
} from "@/lib/stripe/checkout";
import { ownsProduct } from "@/lib/auth/entitlements";

/**
 * Derive the origin for links and Stripe return URLs. Prefers the real
 * request origin (so a Preview deployment points back at the Preview,
 * never Production), then the configured site URL, then localhost.
 */
async function getOrigin(): Promise<string> {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export type Intent = PaidProduct | "account";

export type AuthResult = {
  error?: string;
  message?: string;
  /** This email already has an account — the form should flip to login mode. */
  exists?: boolean;
};

function readIntent(formData: FormData): Intent {
  const raw = String(formData.get("intent") ?? "account");
  return isPaidProduct(raw) ? raw : "account";
}

const PRODUCT_PAGE: Record<PaidProduct, string> = {
  course: "/learn/course",
  premium: "/premium",
};
/**
 * After a successful signup/login: paid intents go straight to Stripe
 * Checkout; plain account creation goes to the account page.
 * If the user ALREADY owns what they came to buy (premium includes the
 * course), skip Stripe entirely and land them on the course, unlocked —
 * this also prevents a premium member from starting a duplicate
 * subscription. If Stripe can't start (misconfig/outage), fall back to
 * the product page — the user is logged in there, so its buy button is
 * a one-click retry.
 * NOTE: redirect() throws internally, so it must stay OUTSIDE try/catch.
 */
async function continueByIntent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  intent: Intent,
  userId: string,
  email: string | null,
): Promise<never> {
  if (intent === "course" || intent === "premium") {
    const { data } = await supabase
      .from("entitlements")
      .select("product")
      .eq("status", "active");
    const owned = (data ?? []).map((r) => r.product as string);

    if (ownsProduct(intent, owned)) {
      redirect("/learn/course");
    }

    let url: string | null = null;
    try {
      url = await createCheckoutSession({
        userId,
        email,
        product: intent,
        origin: await getOrigin(),
      });
    } catch (err) {
      console.error("Checkout after auth failed:", err);
    }
    redirect(url ?? `${PRODUCT_PAGE[intent]}?checkout=error`);
  }
  redirect("/account");
}

export async function register(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const intent = readIntent(formData);

  if (!email || !password) return { error: "Email and password are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That doesn't look like a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Only used if "Confirm email" is still ON in Supabase (degraded mode).
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered")
    ) {
      return { exists: true };
    }
    return { error: error.message };
  }

  // With enumeration protection + confirm ON, Supabase signals "existing
  // user" without an error: a user object with an empty identities array.
  // Treat that as exists too, so the form flips to login either way.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { exists: true };
  }

  // With "Confirm email" OFF, signUp returns a live session. If it's
  // missing, the Supabase toggle hasn't been flipped yet — degrade
  // gracefully to the old confirm-first flow instead of erroring.
  if (!data.session || !data.user) {
    return {
      message:
        "Account created. Please confirm your email from your inbox, then log in.",
    };
  }

  revalidatePath("/", "layout");
  return continueByIntent(
    supabase,
    intent,
    data.user.id,
    data.user.email ?? email,
  );
}

export async function login(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = readIntent(formData);

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return continueByIntent(
    supabase,
    intent,
    data.user.id,
    data.user.email ?? email,
  );
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Step 1 of password reset: email the user a recovery link. The link lands
 * on /auth/confirm (which exchanges the recovery token for a session), then
 * forwards to /unretire/reset-password where they set a new password.
 * Always returns a generic success message — we never reveal whether an
 * email is registered (enumeration protection).
 */
export async function requestPasswordReset(
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/unretire/reset-password`,
  });

  // Don't leak whether the address exists; show the same message either way.
  if (error) console.error("Password reset request failed:", error);

  return {
    message:
      "If an account exists for that email, a reset link is on its way. Check your inbox.",
  };
}

/**
 * Step 2 of password reset: the user arrives here already signed in via the
 * recovery session (set by /auth/confirm). Set the new password, then send
 * them to their account page.
 * NOTE: redirect() throws internally, so it stays OUTSIDE any try/catch.
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  // Must have an active (recovery) session to change the password.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Your reset link has expired or is invalid. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/account?password=updated");
}
