import Link from "next/link";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Start Your Next Chapter",
  description: "You don't need a five-year plan — you need a first step. The free 14-Day Starter Plan, the 2-minute check, and the book.",
};

const steps = [
  {
    title: "Take the 2-minute check",
    desc: "The Wheel of Life shows you, honestly, where you've started muting yourself — and where to begin.",
    href: "/unretire/assess",
    cta: "Start the check →",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D05D11" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M12 12V3M12 12l6 4" />
      </svg>
    ),
  },
  {
    title: "Read the first chapter free",
    desc: "Meet the idea behind UnRetire in Maher's own voice — no purchase required.",
    href: "/unretire/book",
    cta: "Open the book →",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D05D11" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5.5C5 4 8 4 10 5.5v13C8 17 5 17 3 18.5v-13ZM21 5.5C19 4 16 4 14 5.5v13c2-1.5 5-1.5 7 0v-13ZM12 6v13" />
      </svg>
    ),
  },
  {
    title: "Explore the framework",
    desc: "The 5 Mindsets and 7 Practices — how you think, multiplied by what you do.",
    href: "/unretire/practice",
    cta: "See the practice →",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D05D11" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3.5v17l14-8.5-14-8.5Z" />
      </svg>
    ),
  },
];

export default function StartPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Start Your Next Chapter</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            You don&apos;t need a five-year plan. You need a first step.
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[58ch] mx-auto">
            Grab the free 14-Day Starter Plan, take the two-minute check, or open the book — whatever
            feels like the smallest honest move from where you are right now. There&apos;s no right
            order, and no falling behind.
          </p>
        </div>
      </section>

      {/* ── THREE WAYS TO BEGIN ──────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Pick a first move</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">Three small ways to begin</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="card card-hover relative p-7 flex flex-col before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#D05D11] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:rounded-t-2xl"
              >
                <span className="icon-block mb-5">{s.icon}</span>
                <h3 className="text-xl mb-3">{s.title}</h3>
                <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">{s.desc}</p>
                <span className="pill-link">{s.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STARTER PLAN CAPTURE ─────────────────────────────── */}
      <EmailCaptureBand
        showFaq
        blurb="The 14-Day (Un)Retire Starter Plan: two weeks, one small move a day. Drop your email and we'll send it over, plus a weekly note on living fully — at any age."
      />

      {/* ── CLOSING BAND ─────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white leading-[1.4] mb-3">
            The best chapter of your life hasn&apos;t been written yet.
          </p>
          <p className="text-white/60 text-[16px] italic leading-[1.7]">
            You don&apos;t need the answers yet. Just the courage to begin.
          </p>
        </div>
      </section>
    </>
  );
}
