"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-white text-[15px]" role="status">
        ✓ You&apos;re in. See you Monday.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setSubmitted(true);
      }}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <label htmlFor="ur-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="ur-newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 min-w-0 bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#888888] outline-none focus:ring-2 focus:ring-white/60"
      />
      <button
        type="submit"
        className="bg-[#232F3F] text-white font-bold text-[13px] tracking-[0.04em] px-7 py-3 rounded-full hover:bg-black transition-colors whitespace-nowrap"
      >
        Join
      </button>
    </form>
  );
}
