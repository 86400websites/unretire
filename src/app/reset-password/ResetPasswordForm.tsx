"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/auth/actions";
import PasswordField from "../PasswordField";

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    // updatePassword() redirects on success; it only returns on error.
    const res = await updatePassword(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordField
        label="New password"
        autoComplete="new-password"
        minLength={8}
      />
      <p className="text-[12px] text-[#9A9080]">At least 8 characters.</p>

      {error && (
        <p className="text-[13px] text-[#8B1A1A] leading-[1.5]">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-crimson w-full"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>

      <p className="text-[14px] text-[#666666] text-center pt-2">
        <Link
          href="/login"
          className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]"
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}
