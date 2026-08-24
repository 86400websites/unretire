"use client";

import { useState } from "react";

export default function BookDownload() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  async function handleDownload() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name first.");
      return;
    }
    setBusy(true);
    setError(undefined);
    setDone(false);
    try {
      const res = await fetch("/api/book-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      // Turn the streamed PDF into a download.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `UnRetire-${trimmed.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full px-4 py-3 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";

  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#4A443B] mb-2" htmlFor="wm-name">
        Your name (printed on every page of your copy)
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="wm-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          maxLength={60}
          className={field}
        />
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="btn btn-crimson whitespace-nowrap"
        >
          {busy ? "Preparing…" : "Download my copy"}
        </button>
      </div>
      {error && <p className="text-[13px] text-[#8B1A1A] leading-[1.5] mt-3">{error}</p>}
      {done && (
        <p className="text-[13px] text-[#4A443B] leading-[1.5] mt-3">
          Your personalised copy has downloaded. It&apos;s watermarked with your name — please keep
          it to yourself.
        </p>
      )}
    </div>
  );
}
