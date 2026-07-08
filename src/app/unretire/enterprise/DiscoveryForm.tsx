"use client";

import { useState } from "react";

// Create a free form at https://formspree.io targeted at unretire86400@gmail.com,
// then paste its endpoint URL here.
const DISCOVERY_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

export default function DiscoveryForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(DISCOVERY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, _subject: `Discovery Call request — ${form.company || form.name}` }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
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
          <label className={label}>Name *</label>
          <input className={field} value={form.name} onChange={set("name")} type="text" />
        </div>
        <div>
          <label className={label}>Email address *</label>
          <input className={field} value={form.email} onChange={set("email")} type="email" />
        </div>
        <div>
          <label className={label}>Company name</label>
          <input className={field} value={form.company} onChange={set("company")} type="text" />
        </div>
        <div>
          <label className={label}>Contact phone number</label>
          <input className={field} value={form.phone} onChange={set("phone")} type="tel" />
        </div>
        <button onClick={submit} disabled={state === "sending"} className="btn btn-crimson w-full">
          {state === "sending" ? "Sending…" : "Book a Discovery Call →"}
        </button>
        {state === "error" && (
          <p className="text-[13px] text-[#8B1A1A]">
            Please add your name and a valid email — or reach us directly at unretire86400@gmail.com.
          </p>
        )}
      </div>
    </div>
  );
}
