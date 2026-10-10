import Image from "next/image";
import WebinarForm from "./WebinarForm";

/* ────────────────────────────────────────────────────────────────
   Event facts — single source of truth for this campaign.
   Taken from the approved ad. ONE session only.
   ──────────────────────────────────────────────────────────────── */
const EVENT = {
  title: "What’s still ahead… when work is behind you?",
  kicker: "A live conversation",
  host: "Maher Kaddoura",
  dateLabel: "Wednesday 4 November 2026",
  timeLabel: "19:00 SAST",
  meta: ["Free", "Online", "60 minutes", "One live session"],
  // Ad artwork — drop the approved image here in /public and it appears
  // both on the page and as the social share image.
  artwork: "/assets/unretire/images/webinar/unretire-webinar.png",
};

export const metadata = {
  title: "Free Live Webinar",
  description: `${EVENT.title} A free live conversation with ${EVENT.host} — ${EVENT.dateLabel}, ${EVENT.timeLabel}. Reserve your seat.`,
  alternates: { canonical: "/webinar" },
  openGraph: {
    title: `${EVENT.title} · Free Live Webinar`,
    description: `A free live conversation with ${EVENT.host} — ${EVENT.dateLabel}, ${EVENT.timeLabel}.`,
    url: "/webinar",
    siteName: "(Un)Retire",
    type: "website",
    images: [{ url: EVENT.artwork }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.title} · Free Live Webinar`,
    description: `A free live conversation with ${EVENT.host} — ${EVENT.dateLabel}, ${EVENT.timeLabel}.`,
    images: [EVENT.artwork],
  },
};

// What to expect — ADAPTED placeholder copy, pending Heather's final words.
const expect = [
  "An honest conversation about the question nobody prepares you for: what comes after the title and the calendar.",
  "The idea behind (Un)Retire — rebooting into a fuller next chapter instead of quietly fading.",
  "Time for your own questions, live with Maher.",
];

export default function WebinarPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Free Live Webinar</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
            {EVENT.title}
          </h1>
          <p className="prose-body text-[15px] tracking-[0.02em] text-[#666666] mt-4 italic">
            {EVENT.kicker}
          </p>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="font-bold text-xl sm:text-2xl text-[#232F3F] leading-snug">
            With {EVENT.host}
          </p>
          <p className="lede mt-2">
            {EVENT.dateLabel} &middot; {EVENT.timeLabel}
          </p>

          {/* meta pills */}
          <ul className="flex flex-wrap items-center justify-center gap-2.5 mt-7">
            {EVENT.meta.map((m) => (
              <li
                key={m}
                className="rounded-full border border-[#ECECEC] bg-[#FBF5F2] px-4 py-1.5 text-[12px] font-bold tracking-[0.08em] uppercase text-[#232F3F]"
              >
                {m}
              </li>
            ))}
          </ul>
          <p className="prose-body text-[14px] text-[#666666] mt-6 max-w-[48ch] mx-auto leading-[1.7]">
            Your joining link will be emailed closer to the day.
          </p>
        </div>
      </section>

      {/* ── ARTWORK + REGISTRATION FORM ──────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left — ad artwork + what to expect */}
            <div className="lg:col-span-6">
              <div className="relative w-full max-w-[520px] mx-auto lg:mx-0 aspect-[4/5] rounded-2xl overflow-hidden border border-[#ECECEC] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
                <Image
                  src={EVENT.artwork}
                  alt={`${EVENT.title} — a free live webinar with ${EVENT.host}`}
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>

              <ul className="space-y-4 mt-8 max-w-[520px] mx-auto lg:mx-0">
                {expect.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="text-[#D05D11] mt-1 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="prose-body text-[15px] text-[#444444] leading-[1.7]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — the form */}
            <div className="lg:col-span-6">
              <p className="eyebrow mb-5">Reserve your seat</p>
              <h2 className="text-2xl sm:text-3xl leading-tight mb-7">
                Save your spot — it&apos;s free.
              </h2>
              <WebinarForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
