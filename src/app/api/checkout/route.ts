import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, isPaidProduct } from "@/lib/stripe/checkout";
import { hasAccess } from "@/lib/auth/entitlements";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 1) Must be logged in. We tie the purchase to the Supabase user.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Validate the product — never trust the client beyond this choice.
  let body: { product?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isPaidProduct(body.product)) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  // 3) Build absolute return URLs from the current origin.
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
// Already own it (premium includes the course)? Skip Stripe — send them
  // to the course instead of letting them pay twice.
  if (await hasAccess(body.product)) {
    return NextResponse.json({ url: `${origin}/unretire/learn/course` });
  }
  try {
    const url = await createCheckoutSession({
      userId: user.id,
      email: user.email ?? null,
      product: body.product,
      origin,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }
}