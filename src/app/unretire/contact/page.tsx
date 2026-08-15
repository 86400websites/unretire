import Link from "next/link";
import ContactForm from "./ContactForm";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Contact",
  description: "Questions about the book, a speaking inquiry, or a story to share — get in touch with the (Un)Retire team.",
};

const reach = [
  { title: "General questions", desc: "About the book, the framework, or finding your way in." },
  { title: "Speaking & events", desc: "Invite Maher to speak.", href: "/unretire/speaking", cta: "Speaking →" },
  { title: "Share your story", desc: "Tell us how you rebooted instead of muting.", href: "/unretire/stories", cta: "Stories →" },
  { title: "Media & press", desc: "Interviews, excerpts, and review copies." },
];

const faqs = [
  {
    q: "Is (Un)Retire only for people who've already retired?",
    a: "No. It's for anyone sensing the question \u201CIs this it?\u201D — whether retirement is decades away, on the horizon, or already here. The framework is about designing a fuller life at any age.",
  },
  {
    q: "What's the difference between the book and the course?",
    a: "The book gives you the whole framework to read at your own pace. The course walks you through it, one guided lesson at a time, with reflections and a plan you build as you go. Start with whichever fits how you like to learn.",
  },
  {
    q: "I'm not retiring soon. Is this still for me?",
    a: "Yes. The earlier you start asking where you've gone quiet, the more intentional your next chapters become. Nothing here requires an empty calendar.",
  },
  {
    q: "How do I share my story?",
    a: "Use the form on this page and choose \u201CShare my story,\u201D or head to the Stories page. We feature new journeys regularly.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Contact</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">Let&apos;s talk.</h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[58ch] mx-auto">
            A question about the book, a speaking inquiry, or a story to share — we read everything.
            Drop a note and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {/* ── FORM + REASONS ───────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-5">What you can reach out about</p>
              <h2 className="text-2xl sm:text-3xl leading-tight mb-7">However we can help.</h2>
              <ul className="space-y-5">
                {reach.map((r) => (
                  <li key={r.title} className="flex items-start gap-3">
                    <span className="text-[#D05D11] font-bold mt-1 flex-shrink-0" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-[16px] font-bold text-[#232F3F] leading-snug">{r.title}</span>
                      <span className="block prose-body text-[14px] text-[#666666] leading-[1.6]">
                        {r.desc}
                        {r.href && (
                          <>
                            {" "}
                            <Link href={r.href} className="text-[#D05D11] font-bold whitespace-nowrap">
                              {r.cta}
                            </Link>
                          </>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center mb-12">
            <p className="eyebrow mb-5">FAQ</p>
            <h2 className="text-3xl sm:text-4xl">Questions, answered.</h2>
            <span className="rule mt-6 mb-0 mx-auto" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card group p-0 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-6 text-[1.1rem] font-bold text-[#232F3F]">
                  {f.q}
                  <span className="text-[#D05D11] flex-shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="prose-body text-[15px] text-[#444444] leading-[1.8] px-6 pb-6 -mt-1">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand />
    </>
  );
}
