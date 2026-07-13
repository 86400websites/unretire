import { createClient } from "@/lib/supabase/server";

export type Product = "course" | "premium";

/**
 * Returns the current user (or null) plus which products they have active
 * access to. Runs on the server, under the user's own session + RLS, so it
 * can only ever see that user's own entitlement rows.
 */
export async function getAccess(): Promise<{
  userId: string | null;
  email: string | null;
  products: Product[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, email: null, products: [] };
  }

  const { data, error } = await supabase
    .from("entitlements")
    .select("product")
    .eq("status", "active");

  const products = error
    ? []
    : (data ?? []).map((r) => r.product as Product);

  return { userId: user.id, email: user.email ?? null, products };
}

/**
 * Convenience check: does the current user have active access to `product`?
 * Premium includes the course, so a premium member passes the "course" check.
 */
export async function hasAccess(product: Product): Promise<boolean> {
  const { products } = await getAccess();
  if (products.includes(product)) return true;
  if (product === "course" && products.includes("premium")) return true;
  return false;
}
