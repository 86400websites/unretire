"use client";

import { useState } from "react";

/**
 * Where this form posts.
 *
 * Set NEXT_PUBLIC_FORMSPREE_ENDPOINT (Vercel + .env.local) to the endpoint
 * of a form created at https://formspree.io that delivers to
 * unretire86400@gmail.com — e.g. https://formspree.io/f/abcdwxyz
 *
 * Until that is set the form does NOT pretend the visitor typed something
 * wrong: it tells them the form is unavailable and gives them the address
 * to email instead, so a real lead is never silently dropped.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";
const CONTACT_EMAIL = "unretire86400@gmail.com";

// A placeholder like ".../YOUR_FORM_ID" must not count as configured.
const isConfigured = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(ENDPOINT);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State = "idle" | "sending" | "done" | "invalid" | "failed";

export default function DiscoveryForm() {
  const [state, setState] = useState<State>("idle");
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();

    // Validation failure — the visitor can fix this.
    if (!name || !EMAIL_RE.test(email)) {
      setState("invalid");
      return;
    }

    // Delivery failure — nothing the visitor can fix.
    if (!isConfigured) {
      setState("failed");
      return;
    }

    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          name,
          email,
          _subject: `Discovery Call request — ${form.company.trim() || name}`,
        }),
      });
      setState(res.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "done") {
    return (
      <div className="card p-8 sm:p-10 text-center">
        <p className="eyebrow mb-3">Thank you</p>
        <h3 className="text-2xl text-[#14110D] mb-3">Your request is in.</h3>
        <p className="prose-body text-[15px] leading-[1.7]">
          We&apos;ll be in touch shortly to map a program to your team.
        </p>
      </div>
    );
  }

  const field =
    "w-full px-4 py-3 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";
  const label = "block text-[13px] font-semibold text-[#4A443B] mb-2";

  return (
    <div className="card p-7 sm:p-8">
      <div className="space-y-4">
        <div>
          <label className={label} htmlFor="discovery-name">Name *</label>
          <input id="discovery-name" className={field} value={form.name} onChange={set("name")} type="text" autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor="discovery-email">Email address *</label>
          <input id="discovery-email" className={field} value={form.email} onChange={set("email")} type="email" autoComplete="email" />
        </div>
        <div>
          <label className={label} htmlFor="discovery-company">Company name</label>
          <input id="discovery-company" className={field} value={form.company} onChange={set("company")} type="text" autoComplete="organization" />
        </div>
        <div>
          <label className={label} htmlFor="discovery-phone">Contact phone number</label>
          <input id="discovery-phone" className={field} value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" />
        </div>
        <button onClick={submit} disabled={state === "sending"} className="btn btn-crimson w-full">
          {state === "sending" ? "Sending…" : "Book a Discovery Call →"}
        </button>

        {state === "invalid" && (
          <p className="text-[13px] text-[#8B1A1A] leading-[1.5]" role="alert">
            Please add your name and a valid email address.
          </p>
        )}

        {state === "failed" && (
          <p className="text-[13px] text-[#8B1A1A] leading-[1.5]" role="alert">
            Sorry — we couldn&apos;t send that just now. Please email us directly at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-semibold">
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll pick it up from there.
          </p>
        )}
      </div>
    </div>
  );
}
