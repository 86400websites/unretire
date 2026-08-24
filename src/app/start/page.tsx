import Link from "next/link";
import EmailCaptureBand from "../EmailCaptureBand";
import DownloadGate from "../DownloadGate";

export const metadata = {
  title: "Start Your Next Chapter",
  description: "Get the free 14-Day (Un)Retire Starter Plan by email, take the 2-minute Wheel of Life check, or open the book — one small step is all it takes.",
};

const STARTER = {
  tag: "starter-plan",
  item: "14-Day Starter Plan",
  heading: "Get the 14-Day Starter Plan",
  blurb:
    "Drop your email and we'll send the 14-Day Starter Plan straight to your inbox — plus a weekly note on living fully, at any age.",
};

const steps = [
  {
    title: "Get the free 14-Day Starter Plan",
    desc: "Fourteen days. One small move a day. Most take under twenty minutes and need no preparation. The simplest way to feel the framework working.",
    href: "",
    cta: "Get it free by email →",
    gate: "starter-plan",
    highlight: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D05D11" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M14 4v5h5M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    title: "Take the 2-minute Wheel of Life check",
    desc: "A quick, honest look across the eight dimensions of a full life — see where you've started muting yourself, and where to begin.",
    href: "/assess",
    cta: "Spend 2 minutes well →",
    gate: "",
    highlight: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D05D11" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" /><path d="M12 12V3M12 12l6 4" />
      </svg>
    ),
  },
  {
    title: "Explore the framework",
    desc: "The 5 Mindsets and 7 Practices — how you think, multiplied by what you do. The full system behind the Starter Plan.",
    href: "/practice",
    cta: "See the practice →",
    gate: "",
    highlight: false,
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
            You don&apos;t need a five-year plan.<br />You need a first step.
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[58ch] mx-auto mb-9">
            Fourteen days. One small move a day. The free 14-Day Starter Plan is the simplest
            way to feel the (Un)Retire framework working — before you even finish the book.
          </p>
          <DownloadGate
            tag={STARTER.tag}
            item={STARTER.item}
            heading={STARTER.heading}
            blurb={STARTER.blurb}
            triggerClassName="btn btn-crimson"
            triggerContent="Get the Free Starter Plan →"
          />
        </div>
      </section>

      {/* ── THREE WAYS ───────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Or choose your entry point</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">Three ways to begin</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s) => {
              const cls = `card card-hover relative p-7 flex flex-col${s.highlight ? " ring-2 ring-[#D05D11]" : ""}`;
              const inner = (
                <>
                  {s.highlight && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold tracking-[0.1em] uppercase bg-[#D05D11] text-white rounded-full px-2 py-0.5">Free</span>
                  )}
                  <span className="icon-block mb-5">{s.icon}</span>
                  <h3 className="text-xl mb-3">{s.title}</h3>
                  <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">{s.desc}</p>
                  <span className="pill-link">{s.cta}</span>
                </>
              );
              if (s.gate) {
                return (
                  <DownloadGate
                    key={s.title}
                    tag={STARTER.tag}
                    item={STARTER.item}
                    heading={STARTER.heading}
                    blurb={STARTER.blurb}
                    triggerClassName={`${cls} text-left w-full`}
                    triggerContent={inner}
                  />
                );
              }
              return (
                <Link key={s.title} href={s.href} className={cls}>{inner}</Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">What&apos;s inside the plan</p>
          <h2 className="text-3xl sm:text-4xl">Two weeks. One move a day.</h2>
          <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left mb-9">
            {[
              { week: "Week 1 — Reawaken", desc: "Notice what&apos;s still alive in you. Ignite, Move, Connect, Explore, Grow — seven small actions that wake things up." },
              { week: "Week 2 — Build", desc: "Turn noticing into motion. Balance, Contribute, Joy, Optimize — seven actions that build real momentum." },
            ].map((w) => (
              <div key={w.week} className="card p-6">
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#D05D11] mb-2">{w.week}</p>
                <p className="prose-body text-[15px] text-[#444444] leading-[1.75]" dangerouslySetInnerHTML={{ __html: w.desc }} />
              </div>
            ))}
          </div>
          <DownloadGate
            tag={STARTER.tag}
            item={STARTER.item}
            heading={STARTER.heading}
            blurb={STARTER.blurb}
            triggerClassName="btn btn-crimson"
            triggerContent="Get it free by email →"
          />
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand
        showFaq
        heading="Begin Your Next Chapter"
        blurb="Want it sent to your inbox? Drop your email and we&apos;ll send the 14-Day Starter Plan over, plus a weekly note on living fully — at any age."
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
