"use client";

import { useState } from "react";

export default function EmailCaptureForm({ tag = "starter-plan" }: { tag?: string }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, tag }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="text-white text-[15px]" role="status">
        ✓ You&apos;re in — check your inbox for your free resource!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <label htmlFor="ur-ec-first" className="sr-only">First name</label>
      <input
        id="ur-ec-first"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        className="flex-1 min-w-0 bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none focus:ring-2 focus:ring-white/60"
      />
      <label htmlFor="ur-ec-email" className="sr-only">Email address</label>
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
        disabled={status === "loading"}
        className="bg-[#232F3F] text-white font-bold text-[13px] tracking-[0.04em] px-7 py-3 rounded-full hover:bg-[#1A2430] transition-colors whitespace-nowrap disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-white/90 text-[13px] mt-2 w-full text-center">{errorMsg}</p>
      )}
    </form>
  );
}
