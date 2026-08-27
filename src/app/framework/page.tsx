import Link from "next/link";

const mindsets = [
  {
    num: "01",
    title: "Freedom",
    quote: "I now have the freedom to shape life on my terms.",
    desc: "For decades, calendars dictated rhythm, titles defined identity, and deadlines created urgency. Freedom at this stage is not withdrawal — it is authorship.",
  },
  {
    num: "02",
    title: "Evolution",
    quote: "My identity is evolving — not ending.",
    desc: "Instead of asking \u201CWho was I?\u201D begin asking \u201CWho am I becoming?\u201D Evolution is not dramatic reinvention. Your experience is foundation — not ceiling.",
  },
  {
    num: "03",
    title: "Balance",
    quote: "I design my days with intention and harmony.",
    desc: "Balance is not about equal time on everything. It's about conscious attention to all seven dimensions of life — not just the ones that shout loudest.",
  },
  {
    num: "04",
    title: "Relevance",
    quote: "I don't have an expiry date.",
    desc: "You are not less relevant because you are no longer busy. Relevance in this chapter is about contribution — not title, position, or pace.",
  },
  {
    num: "05",
    title: "Joy",
    quote: "Curiosity and play are essential, not optional.",
    desc: "Joy is not a reward for completing your obligations. It is a practice — as serious and as necessary as any other dimension of a well-lived life.",
  },
];

const practices = [
  {
    title: "Ignite",
    desc: "Reignite your curiosity, creativity, and sense of aliveness.",
    href: "/framework/practice-ignite",
  },
  {
    title: "Move",
    desc: "Build a body that supports the life you want to live.",
    href: "/framework/practice-move",
  },
  {
    title: "Connect",
    desc: "Deepen the relationships that truly matter.",
    href: "/framework/practice-connect",
  },
  {
    title: "Contribute",
    desc: "Find your way of giving back with lasting impact.",
    href: "/framework/practice-contribute",
  },
  {
    title: "Explore",
    desc: "Embrace discovery — inward and outward.",
    href: "/framework/practice-explore",
  },
  {
    title: "Grow",
    desc: "Keep learning, stretching, and becoming.",
    href: "/framework/practice-grow",
  },
  {
    title: "Optimise",
    desc: "Design your days, energy, and environment intentionally.",
    href: "/framework/practice-optimize",
  },
];

export default function FrameworkPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6">The (Un)Retire Framework</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
              Mindset <span className="text-[#D05D11]">&times;</span> Practice
            </h1>
            <span className="rule mt-7 mb-7" aria-hidden="true" />
            <p className="lede max-w-[60ch]">
              Living fully is like building a bridge: your mindset is the
              foundation, and your daily practices are the bricks that hold it
              up. Without both, the structure doesn&apos;t stand.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW THE FRAMEWORK WORKS ──────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="eyebrow mb-5">The Model</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                How the Framework Works
              </h2>
              <span className="rule mt-6 mb-7" aria-hidden="true" />
              <p className="prose-body leading-[1.85] mb-4">
                When Maher stepped away from his corporate roles, he realised
                something important: retirement doesn&apos;t magically become
                meaningful. You have to create meaning through both mindset and
                action.
              </p>
              <p className="prose-body leading-[1.85]">
                Over decades of experience, he developed a simple but
                life-changing formula:{" "}
                <strong className="text-[#232F3F] font-bold">
                  (Un)Retire = Empowered Mindset &times; Intentional Practice.
                </strong>{" "}
                The real shift happens when the two move together.
              </p>
            </div>

            {/* Core equation */}
            <div className="card relative overflow-hidden p-10 sm:p-12 text-center before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#D05D11]">
              <p className="eyebrow mb-7">The Core Equation</p>
              <p className="text-5xl sm:text-6xl font-bold text-[#232F3F] leading-none">
                Mindset
              </p>
              <p className="text-3xl text-[#D05D11] font-bold my-3">&times;</p>
              <p className="text-5xl sm:text-6xl font-bold text-[#232F3F] leading-none">
                Practice
              </p>
              <p className="prose-body text-[15px] leading-[1.8] mt-7 max-w-sm mx-auto">
                Neither works alone. The multiplication means each amplifies the
                other — raising the quality of your entire life design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FIVE MINDSETS ────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Five Mindsets</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">
              The Five (Un)Retire Mindsets
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="lede">
              These aren&apos;t motivational slogans. They are transformational
              belief shifts that unlock your ability to live fully in this new
              chapter.
            </p>
          </div>

          <div className="space-y-4">
            {mindsets.map((m) => (
              <div
                key={m.num}
                className="card card-hover p-7 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center"
              >
                <div className="md:col-span-2 text-5xl font-bold text-[#ECECEC] leading-none">
                  {m.num}
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl mb-2">{m.title}</h3>
                  <p className="text-[15px] italic text-[#D05D11] leading-snug">
                    &ldquo;{m.quote}&rdquo;
                  </p>
                </div>
                <p className="md:col-span-6 prose-body text-[15px] leading-[1.8]">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEVEN PRACTICES ──────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Seven Practices</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] text-white">
              The Seven Daily Practices
            </h2>
            <span
              className="block w-12 h-[3px] bg-[#D05D11] rounded-full mx-auto mt-6"
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {practices.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="group rounded-2xl bg-white/[0.04] border border-white/10 p-7 block transition-colors hover:border-[#D05D11] hover:bg-white/[0.07]"
              >
                <h3 className="text-xl text-white mb-2">{p.title}</h3>
                <p className="text-[13px] text-white/55 leading-[1.7] mb-4">
                  {p.desc}
                </p>
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#E8A77E] group-hover:text-white transition-colors">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
