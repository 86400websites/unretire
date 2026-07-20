"use client";

import { useState } from "react";
import { register, login, type AuthResult } from "@/app/auth/actions";

type Intent = "course" | "premium" | "account";

/** Common email-domain typos → the domain the user almost certainly meant. */
const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmal.com": "gmail.com",
  "gnail.com": "gmail.com", "gmaill.com": "gmail.com", "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com", "gmail.con": "gmail.com", "gmail.om": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com", "outloook.com": "outlook.com",
  "outlook.co": "outlook.com", "outlook.con": "outlook.com",
  "iclould.com": "icloud.com", "icoud.com": "icloud.com", "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
};

function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  const fix = DOMAIN_FIXES[domain];
  return fix ? `${email.slice(0, at)}@${fix}` : null;
}

const REGISTER_CTA: Record<Intent, string> = {
  course: "Create account & continue to checkout",
  premium: "Create account & continue to checkout",
  account: "Create account",
};

export default function RegistrationForm({
  intent = "account",
}: {
  intent?: Intent;
}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const suggestion = suggestEmail(email);
  const paid = intent === "course" || intent === "premium";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    // On success these actions redirect (to Stripe or the account page)
    // and never return — we only receive a result on error / exists.
    const res: AuthResult | undefined =
      mode === "register" ? await register(formData) : await login(formData);

    if (res?.exists) {
      setMode("login");
      setNotice("Good news — you already have an account. Enter your password to continue.");
      setPending(false);
      return;
    }
    if (res?.error) {
      setError(res.error);
      setNotice(undefined);
      setPending(false);
      return;
    }
    if (res?.message) {
      setNotice(res.message);
      setError(undefined);
      setPending(false);
    }
  }

  const switchMode = (m: "register" | "login") => {
    setMode(m);
    setError(undefined);
    setNotice(undefined);
  };

  const field =
    "w-full px-4 py-3 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";
  const label = "block text-[13px] font-semibold text-[#4A443B] mb-2";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="intent" value={intent} />

      {notice && (
        <p className="text-[14px] text-[#232F3F] bg-[#FAF5F0] border border-[#E7D9CC] rounded-lg px-4 py-3 leading-[1.6]">
          {notice}
        </p>
      )}

      <div>
        <label className={label} htmlFor="reg-email">Email address</label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        {suggestion && (
          <button
            type="button"
            onClick={() => setEmail(suggestion)}
            className="text-[13px] text-[#D05D11] font-semibold mt-2 hover:text-[#8B1A1A]"
          >
            Did you mean {suggestion}?
          </button>
        )}
        {mode === "register" && (
          <p className="text-[12px] text-[#9A9080] mt-2 leading-[1.5]">
            Double-check your email — it&apos;s how you&apos;ll log in, and where your
            receipt goes.
          </p>
        )}
      </div>

      <div>
        <label className={label} htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          className={field}
        />
        {mode === "register" && (
          <p className="text-[12px] text-[#9A9080] mt-2">At least 8 characters.</p>
        )}
      </div>

      {error && <p className="text-[13px] text-[#8B1A1A] leading-[1.5]">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-crimson w-full">
        {pending
          ? mode === "register" ? "Creating account…" : "Logging in…"
          : mode === "register"
            ? REGISTER_CTA[intent]
            : paid ? "Log in & continue to checkout" : "Log in"}
      </button>

      <p className="text-[14px] text-[#666666] text-center pt-2">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => switchMode("login")}
              className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
              Log in
            </button>
          </>
        ) : (
          <>
            Need an account?{" "}
            <button type="button" onClick={() => switchMode("register")}
              className="text-[#D05D11] font-semibold hover:text-[#8B1A1A]">
              Create one
            </button>
          </>
        )}
      </p>
    </form>
  );
}