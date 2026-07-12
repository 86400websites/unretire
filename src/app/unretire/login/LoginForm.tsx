"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState<string | undefined>(initialError);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    // login() redirects to /unretire/account on success; it only returns
    // here when there's an error to display.
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
      <div>
        <label className={label} htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <label className={label} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
      </div>

      {error && (
        <p className="text-[13px] text-[#8B1A1A] leading-[1.5]">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-crimson w-full">
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-[14px] text-[#666666] text-center pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/unretire/signup" className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
          Create one
        </Link>
      </p>
    </form>
  );
}
