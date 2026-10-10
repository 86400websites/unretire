import Link from "next/link";

const journeys = [
  {
    title: "The Purpose Journey",
    desc: "Rediscover your reason to rise",
    stages: "6 stages · ~8 weeks",
    access: "free",
  },
  {
    title: "The Vitality Journey",
    desc: "Build a body that matches your ambitions",
    stages: "5 stages · ~6 weeks",
    access: "premium",
  },
  {
    title: "The Connection Journey",
    desc: "Deepen the relationships that truly matter",
    stages: "5 stages · ~8 weeks",
    access: "premium",
  },
  {
    title: "The Contribution Journey",
    desc: "Find your way of giving back with impact",
    stages: "5 stages · ~6 weeks",
    access: "premium",
  },
  {
    title: "The Adventure Journey",
    desc: "Embrace exploration in your next chapter",
    stages: "5 stages · ~6 weeks",
    access: "premium",
  },
  {
    title: "The Life Design Journey",
    desc: "Architect the days you actually want to live",
    stages: "6 stages · ~10 weeks",
    access: "premium",
  },
  {
    title: "The Mindset Journey",
    desc: "Rewire the beliefs that hold you back",
    stages: "5 stages · ~8 weeks",
    access: "premium",
  },
];

export default function JourneysPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6">Life Journeys</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
              Guided Journeys for Your Next Chapter
            </h1>
            <span className="rule mt-7 mb-7" aria-hidden="true" />
            <p className="lede max-w-[60ch]">
              Each journey is a structured, self-paced experience designed to
              help you go deeper into one dimension of your (Un)Retire life.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS + CARDS ─────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          {/* How journeys work */}
          <div className="card text-center max-w-3xl mx-auto p-10 sm:p-12 mb-12 sm:mb-16">
            <p className="eyebrow mb-5">How It Works</p>
            <h2 className="text-2xl sm:text-3xl mb-5">How the Journeys Work</h2>
            <p className="prose-body leading-[1.85] max-w-[58ch] mx-auto">
              Each journey is divided into stages — reflection, insight, and
              action. You move at your own pace. There is no right order. The
              best journey is the one that resonates with where you are right
              now.
            </p>
          </div>

          {/* Journey cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journeys.map((j) => (
              <div key={j.title} className="card card-hover p-7 flex flex-col">
                {j.access === "free" ? (
                  <span className="self-start inline-flex items-center bg-[#FAF3EE] text-[#D05D11] text-[10px] font-bold tracking-[0.12em] uppercase rounded-full px-2.5 py-1 mb-4">
                    Free
                  </span>
                ) : (
                  <span className="self-start inline-flex items-center gap-1 bg-[#F2F2F2] text-[#888888] text-[10px] font-bold tracking-[0.12em] uppercase rounded-full px-2.5 py-1 mb-4">
                    ✦ Premium
                  </span>
                )}
                <p className="eyebrow eyebrow-muted mb-2">{j.stages}</p>
                <h3 className="text-xl mb-2">{j.title}</h3>
                <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">
                  {j.desc}
                </p>
                {/*
                  Known issue 4 / decision D-3, resolved by the owner
                  2026-09-01: REMOVE, not complete. The free journey's
                  "Begin Journey" call to action pointed at a journey page that
                  has never existed — a 404 on the only action this page
                  offered. No journey page exists yet, so no card links
                  anywhere; the premium cards already said as much. Restore
                  this branch when the journeys are built.
                */}
                {j.access === "free" ? null : (
                  <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#888888]">
                    🔒 Premium Members Only
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM CTA ──────────────────────────────────────── */}
      <section className="bg-[#D05D11]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] text-white leading-tight">
            Unlock All Journeys
          </h2>
          <span
            className="block w-12 h-[3px] bg-white/80 rounded-full mx-auto mt-6 mb-6"
            aria-hidden="true"
          />
          <p className="text-white/80 text-[16px] leading-[1.7] mb-9 max-w-md mx-auto">
            Get access to all 7 guided journeys plus the full tool library,
            premium articles, and community.
          </p>
          <Link
            href="/community"
            className="btn bg-white text-[#D05D11] hover:bg-[#232F3F] hover:text-white"
          >
            Join Premium →
          </Link>
        </div>
      </section>
    </>
  );
}
