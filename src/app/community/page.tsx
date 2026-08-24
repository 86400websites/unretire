import CommunityJoinForm from "./CommunityJoinForm";

const stats = [
  { num: "340+", label: "Members" },
  { num: "18", label: "Countries" },
  { num: "Monthly", label: "Live Events" },
];

const offerings = [
  { title: "Monthly Discussions", desc: "Guided group conversations on framework themes — purpose, identity, relationships, time, and legacy. Real talk, no performance." },
  { title: "Reading & Reflection Circles", desc: "Small groups working through the book or workbook together — sharing reactions, insights, and honest reflections." },
  { title: "Live Events & Workshops", desc: "Monthly live sessions with Maher and guest contributors. Practical, focused, and built around your real questions." },
];

export default function CommunityPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6">You&apos;re Not Alone in This</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">Community</h1>
            <span className="rule mt-7 mb-7" aria-hidden="true" />
            <p className="lede max-w-[60ch]">
              A growing circle of people designing their retirement with intention — sharing,
              supporting, and learning together.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY COMMUNITY ────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="eyebrow mb-5">Why Community Matters</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                The Practice of Connect, in Action
              </h2>
              <span className="rule mt-6 mb-7" aria-hidden="true" />
              <p className="prose-body leading-[1.85] mb-4">
                The (Un)Retire framework includes Connect as one of its seven core practices — because
                the research is unambiguous: strong relationships are the single greatest predictor of
                a long, healthy, and meaningful life.
              </p>
              <p className="prose-body leading-[1.85] mb-9">
                The Community is where that practice comes to life. A space for people thinking
                intentionally about their next chapter — not to be told what to do, but to think,
                share, and grow alongside others in the same season of life.
              </p>
              <a href="#join-form" className="btn btn-crimson">
                Request to Join
              </a>
            </div>

            {/* Quote + stats */}
            <div className="card p-8 sm:p-10">
              <blockquote className="text-[1.3rem] sm:text-[1.45rem] italic text-[#D05D11] leading-[1.55] mb-5">
                &ldquo;The most powerful conversations I&apos;ve had about retirement haven&apos;t been
                with financial advisers. They&apos;ve been with people living it.&rdquo;
              </blockquote>
              <cite className="not-italic text-[12px] font-bold tracking-[0.1em] uppercase text-[#888888]">
                — Maher Kaddoura, (Un)Retire
              </cite>
              <div className="grid grid-cols-3 gap-4 mt-8 pt-7 border-t border-[#ECECEC]">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-[1.75rem] font-bold text-[#D05D11] leading-none mb-2">
                      {s.num}
                    </div>
                    <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#888888]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFERINGS ────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What&apos;s Inside</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">How We Gather</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {offerings.map((o) => (
              <div key={o.title} className="card card-hover p-7 text-center">
                <h3 className="text-xl mb-3">{o.title}</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.75]">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN FORM (crimson band, client island) ──────────── */}
      <section id="join-form" className="bg-[#D05D11] scroll-mt-[80px]">
        <div className="max-w-xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center mb-9">
            <h2 className="text-3xl sm:text-4xl text-white leading-tight">Request to Join</h2>
            <span className="block w-12 h-[3px] bg-white/80 rounded-full mx-auto mt-6 mb-6" aria-hidden="true" />
            <p className="text-white/80 text-[15px] leading-[1.7] max-w-md mx-auto">
              Tell us a little about where you are in your (Un)Retire journey and we&apos;ll be in
              touch.
            </p>
          </div>
          <CommunityJoinForm />
        </div>
      </section>
    </>
  );
}
