"use client";

import { useState, type ReactNode } from "react";

type Props = {
  tag: string;
  item: string; // e.g. "14-Day Starter Plan" — used in the success line
  heading: string;
  blurb: string;
  triggerClassName: string;
  triggerContent: ReactNode;
};

export default function DownloadGate({ tag, item, heading, blurb, triggerClassName, triggerContent }: Props) {
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
        body: JSON.stringify({ email, firstName, tag }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else { setErrorMsg(data.error || "Something went wrong. Please try again."); setStatus("error"); }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none border border-[#E5DED4] focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerContent}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
          role="dialog"
          aria-modal="true"
          aria-label={heading}
          onClick={close}
        >
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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
                <h3 className="text-xl sm:text-2xl mb-2">Check your inbox</h3>
               <p className="prose-body text-[15px] text-[#666666] leading-[1.7]">
                  ✓ Your {item}{" "}is on its way to your inbox. If you don&apos;t see it in a few
                  minutes, check your spam or promotions folder.
                </p>
              </div>
            ) : ( 
              <>
                <p className="eyebrow mb-2">Free — sent by email</p>
                <h3 className="text-xl sm:text-2xl mb-2">{heading}</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.7] mb-5">{blurb}</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <label htmlFor={`dl-first-${tag}`} className="sr-only">First name</label>
                  <input id={`dl-first-${tag}`} type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputClass} />
                  <label htmlFor={`dl-email-${tag}`} className="sr-only">Email address</label>
                  <input id={`dl-email-${tag}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputClass} />
                  <button type="submit" disabled={status === "loading"} className="btn btn-crimson w-full disabled:opacity-60">
                    {status === "loading" ? "Sending…" : "Email it to me"}
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
