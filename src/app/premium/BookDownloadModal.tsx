"use client";

import { useState, useEffect } from "react";

export default function BookDownloadModal({
  type = "book",
  buttonLabel = "Download the book",
  heading = "Download your book",
  intro = "Enter your name below and we\u2019ll prepare your personal copy of (Un)Retire.",
  copyright = "(Un)Retire is protected by copyright.",
}: {
  type?: "book" | "workbook";
  buttonLabel?: string;
  heading?: string;
  intro?: string;
  copyright?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Close on Escape, and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleDownload() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name first.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/book-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filePrefix = type === "workbook" ? "UnRetire-Workbook" : "UnRetire";
      a.download = `${filePrefix}-${trimmed.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full px-4 py-3 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setError(undefined); }}
        className="btn btn-crimson mt-4"
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={heading}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-7 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[1.4rem] text-[#14110D] leading-snug mb-3">{heading}</h3>
            <p className="prose-body text-[14px] text-[#4A443B] leading-[1.7] mb-2">{intro}</p>
            <p className="prose-body text-[14px] text-[#4A443B] leading-[1.7] mb-2">
              This copy has been prepared especially for you and is intended for your personal use.
            </p>
            <p className="text-[13px] text-[#837A6E] leading-[1.6] mb-4">{copyright}</p>

            <p className="text-[13px] font-semibold text-[#8B1A1A] leading-[1.6] mb-5">
              You can download this once, so please make sure your name is correct before you continue.
            </p>

            <label className="block text-[13px] font-semibold text-[#4A443B] mb-2" htmlFor="modal-name">
              Your name
            </label>
            <input
              id="modal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              maxLength={60}
              autoFocus
              className={field}
            />
            {error && <p className="text-[13px] text-[#8B1A1A] leading-[1.5] mt-3">{error}</p>}

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={handleDownload}
                disabled={busy}
                className="btn btn-crimson"
              >
                {busy ? "Preparing…" : "Download"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
