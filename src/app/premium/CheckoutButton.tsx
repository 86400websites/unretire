"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Auth-aware purchase button.
 *  - owned      → already has access, link them to the course instead.
 *  - !loggedIn  → send to signup first (checkout requires a session).
 *  - loggedIn   → call /api/checkout and redirect to Stripe.
 */
export default function CheckoutButton({
  product,
  label,
  className,
  loggedIn,
  owned = false,
}: {
  product: "premium" | "course";
  label: string;
  className: string;
  loggedIn: boolean;
  owned?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (owned) {
    return (
      <button onClick={() => router.push("/learn/course")} className={className}>
        Go to your course →
      </button>
    );
  }

  async function go() {
    if (!loggedIn) {
      router.push(`/signup?intent=${product}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        alert(data?.error ?? "Could not start checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Could not start checkout. Please try again.");
    }
  }

  return (
    <button onClick={go} disabled={loading} className={className}>
      {loading ? "Redirecting…" : label}
    </button>
  );
}
