"use client";

import { useState } from "react";

export default function EmailCaptureForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-white text-[15px]" role="status">
        ✓ You&apos;re in. Your 14-Day Starter Plan is on its way.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setSubmitted(true);
      }}
      className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
    >
      <label htmlFor="ur-ec-first" className="sr-only">
        First name
      </label>
      <input
        id="ur-ec-first"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        className="flex-1 min-w-0 bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none focus:ring-2 focus:ring-white/60"
      />
      <label htmlFor="ur-ec-email" className="sr-only">
        Email address
      </label>
      <input
        id="ur-ec-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="flex-1 min-w-0 bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none focus:ring-2 focus:ring-white/60"
      />
      <button
        type="submit"
        className="bg-[#232F3F] text-white font-bold text-[13px] tracking-[0.04em] px-7 py-3 rounded-full hover:bg-[#1A2430] transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
