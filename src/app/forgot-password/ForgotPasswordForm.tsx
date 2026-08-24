"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    setMessage(undefined);
    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);
    if (res?.error) setError(res.error);
    if (res?.message) setMessage(res.message);
    setPending(false);
  }

  const field =
    "w-full px-4 py-3 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";
  const label = "block text-[13px] font-semibold text-[#4A443B] mb-2";

  if (message) {
    return (
      <div className="text-center">
        <p className="prose-body leading-[1.7] mb-6">{message}</p>
        <Link href="/login" className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={label} htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>

      {error && <p className="text-[13px] text-[#8B1A1A] leading-[1.5]">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-crimson w-full">
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-[14px] text-[#666666] text-center pt-2">
        Remembered it?{" "}
        <Link href="/login" className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
