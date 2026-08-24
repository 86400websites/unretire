"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import PasswordField from "../PasswordField";

type Intent = "course" | "premium" | "account";

export default function LoginForm({
  initialError,
  intent = "account",
}: {
  initialError?: string;
  intent?: Intent;
}) {
  const [error, setError] = useState<string | undefined>(initialError);
  const [pending, setPending] = useState(false);

  const paid = intent === "course" || intent === "premium";
  const signupHref =
    intent === "account" ? "/signup" : `/signup?intent=${intent}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    // login() redirects on success (to checkout for paid intents, otherwise
    // the account page); it only returns here when there's an error to show.
    const res = await login(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  const field =
    "w-full px-4 py-3 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";
  const label = "block text-[13px] font-semibold text-[#4A443B] mb-2";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="intent" value={intent} />

      <div>
        <label className={label} htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <PasswordField autoComplete="current-password" />
        <p className="text-right mt-2">
          <Link
            href="/forgot-password"
            className="text-[13px] text-[#D05D11] font-semibold hover:text-[#8B1A1A]"
          >
            Forgot password?
          </Link>
        </p>
      </div>

      {error && (
        <p className="text-[13px] text-[#8B1A1A] leading-[1.5]">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-crimson w-full">
        {pending
          ? "Logging in…"
          : paid ? "Log in & continue to checkout" : "Log in"}
      </button>

      <p className="text-[14px] text-[#666666] text-center pt-2">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
          Create one
        </Link>
      </p>
    </form>
  );
}