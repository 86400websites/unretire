"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default function SignupForm() {
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    const res = await signup(formData);
    setPending(false);
    if (res?.error) setError(res.error);
    else if (res?.message) setDone(res.message);
  }

  // Success state: confirm-email is ON, so tell them to check their inbox.
  if (done) {
    return (
      <div className="text-center">
        <p className="eyebrow mb-3">Almost there</p>
        <h2 className="text-xl text-[#14110D] mb-3">Check your email</h2>
        <p className="prose-body text-[15px] leading-[1.7] mb-6">{done}</p>
        <Link href="/unretire/login" className="btn btn-outline">
          Go to log in
        </Link>
      </div>
    );
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
        <input id="password" name="password" type="password" autoComplete="new-password" required className={field} />
        <p className="text-[12px] text-[#9A9080] mt-2">At least 8 characters.</p>
      </div>

      {error && (
        <p className="text-[13px] text-[#8B1A1A] leading-[1.5]">{error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-crimson w-full">
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-[14px] text-[#666666] text-center pt-2">
        Already have an account?{" "}
        <Link href="/unretire/login" className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
          Log in
        </Link>
      </p>
    </form>
  );
}
