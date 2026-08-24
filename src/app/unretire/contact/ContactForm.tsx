"use client";

import { useState } from "react";

const ENDPOINT = "https://formspree.io/f/mgogyqey";
const reasons = ["General question", "Speaking inquiry", "Share my story", "Media / press"];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", reason: reasons[0], message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");

  if (status === "done") {
    return (
      <div className="card p-8 text-center" role="status">
        <p className="text-[#D05D11] font-bold text-[1.05rem] mb-1">✓ Message sent.</p>
        <p className="prose-body text-[15px] text-[#444444]">Thank you — we read everything, and we&apos;ll be in touch.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          _subject: `Contact — ${form.reason} — ${form.name}`,
        }),
      });
      setStatus(res.ok ? "done" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  const label = "block text-[11px] font-bold tracking-[0.1em] uppercase text-[#232F3F] mb-2";
  const field =
    "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[#232F3F] placeholder-[#9A9080] outline-none focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20 transition-colors";

  return (
    <form onSubmit={onSubmit} className="card p-7 sm:p-8 space-y-5">
      <div>
        <label htmlFor="ct-name" className={label}>Your name</label>
        <input id="ct-name" type="text" required placeholder="Full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
      </div>
      <div>
        <label htmlFor="ct-email" className={label}>Email address</label>
        <input id="ct-email" type="email" required placeholder="your@email.com" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
      </div>
      <div>
        <label htmlFor="ct-reason" className={label}>What&apos;s this about?</label>
        <select id="ct-reason" value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })} className={field}>
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ct-message" className={label}>Your message</label>
        <textarea id="ct-message" required placeholder="Tell us a little more…" value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${field} min-h-[130px] resize-y`} />
      </div>
      <button type="submit" disabled={status === "sending"} className="btn btn-crimson w-full">
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
      {status === "failed" && (
        <p className="text-[13px] text-[#8B1A1A] leading-[1.5]" role="alert">
          Sorry — we couldn&apos;t send that just now. Please email us directly at unretire86400@gmail.com.
        </p>
      )}
    </form>
  );
}