"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  img: string;
  title: string;
  desc: string;
  cta: string;
  pdfHref: string;
};

export default function ToolkitGate({ img, title, desc, cta, pdfHref }: Props) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const close = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, tag: "toolkit" }),
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

  return (
    <>
      {/* Card — matches the other tool cards, but opens the gate instead of linking */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card card-hover overflow-hidden flex flex-col sm:flex-row text-left w-full"
      >
        <div className="relative sm:w-40 sm:flex-shrink-0 aspect-[4/3] sm:aspect-auto bg-white border-b sm:border-b-0 sm:border-r border-[#ECECEC]">
          <Image
            src={`/assets/unretire/${img}.png`}
            alt={title}
            fill
            sizes="(min-width: 640px) 160px, 100vw"
            className="object-contain p-5"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h2 className="text-[1.25rem] leading-snug mb-2">{title}</h2>
          <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-5 flex-1">{desc}</p>
          <span className="pill-link">{cta}</span>
        </div>
      </button>

      {/* Modal gate */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
          role="dialog"
          aria-modal="true"
          aria-label="Get the Practice Toolkit"
          onClick={close}
        >
          <div
            className="relative bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 text-[#999999] hover:text-[#232F3F] text-2xl leading-none"
            >
              &times;
            </button>

            {status === "success" ? (
              <div>
                <p className="eyebrow mb-2">You&apos;re in</p>
                <h3 className="text-xl sm:text-2xl mb-2">Your Toolkit is ready</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.7] mb-5">
                  ✓ A copy is on its way to your inbox — and you can grab it instantly right here.
                </p>
                <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="btn btn-crimson w-full">
                  Download the Toolkit (PDF)
                </a>
              </div>
            ) : (
              <>
                <p className="eyebrow mb-2">Free download</p>
                <h3 className="text-xl sm:text-2xl mb-2">Get the Practice Toolkit</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.7] mb-5">
                  Drop your email and we&apos;ll send the Toolkit your way — 28 small experiments across
                  the seven practices, plus a short series to help you put them to work.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label htmlFor="ur-toolkit-first" className="sr-only">First name</label>
                  <input
                    id="ur-toolkit-first"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none border border-[#E5DED4] focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20"
                  />
                  <label htmlFor="ur-toolkit-email" className="sr-only">Email address</label>
                  <input
                    id="ur-toolkit-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none border border-[#E5DED4] focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20"
                  />
                  <button type="submit" disabled={status === "loading"} className="btn btn-crimson w-full disabled:opacity-60">
                    {status === "loading" ? "Sending…" : "Send me the Toolkit"}
                  </button>
                </form>
                {status === "error" && <p className="text-[13px] text-[#B91C1C] mt-2">{errorMsg}</p>}
                <p className="text-[12px] text-[#999999] mt-2">No spam. Unsubscribe anytime.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
