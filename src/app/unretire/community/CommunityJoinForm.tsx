"use client";

import { useState } from "react";

export default function CommunityJoinForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" role="status">
        <p className="text-[#D05D11] font-bold text-[1.05rem] mb-1">✓ Request received!</p>
        <p className="prose-body text-[15px] text-[#444444]">We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim() && form.email.trim()) setSubmitted(true);
  };

  const label = "block text-[11px] font-bold tracking-[0.1em] uppercase text-[#232F3F] mb-2";
  const field =
    "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[#232F3F] placeholder-[#888888] outline-none focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20 transition-colors";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-7 sm:p-8 space-y-5">
      <div>
        <label htmlFor="ur-join-name" className={label}>
          Your Name
        </label>
        <input
          id="ur-join-name"
          type="text"
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={field}
        />
      </div>
      <div>
        <label htmlFor="ur-join-email" className={label}>
          Email Address
        </label>
        <input
          id="ur-join-email"
          type="email"
          required
          placeholder="your@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={field}
        />
      </div>
      <div>
        <label htmlFor="ur-join-message" className={label}>
          Tell us about yourself
        </label>
        <textarea
          id="ur-join-message"
          placeholder="Where are you in your retirement journey?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${field} min-h-[110px] resize-y`}
        />
      </div>
      <button type="submit" className="btn bg-[#232F3F] text-white hover:bg-black w-full">
        Send Request
      </button>
    </form>
  );
}
