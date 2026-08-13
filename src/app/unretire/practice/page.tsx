import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Practice",
  description: "The 5 Mindsets and 7 Practices of the (Un)Retire framework — plus the tools to begin this week.",
};

const mindsets = [
  { n: "01", icon: "freedom", title: "Freedom", sub: "Living Life on My Terms", quote: "I now have the freedom to shape life on my terms.", line: "Trade the rails of obligation for a life you direct." },
  { n: "02", icon: "evolution", title: "Evolution", sub: "Honor the Past, But Move Forward", quote: "My identity is evolving — not ending.", line: "Stop asking \u201CWho was I?\u201D Start asking \u201CWho am I becoming?\u201D" },
  { n: "03", icon: "balance", title: "Balance", sub: "A Whole and Fulfilled Life", quote: "A thriving life touches all areas — body, mind, relationships, spirit.", line: "The health, friendships, and reflection you kept postponing? Later has arrived." },
  { n: "04", icon: "relevance", title: "Relevance", sub: "I Don't Have an Expiry Date", quote: "I still have so much to contribute.", line: "The fear no retiree says out loud isn't money or health. It's disappearing. You don't have to." },
  { n: "05", icon: "joy", title: "Joy", sub: "Meaningful Moments By Design", quote: "I create joy by aligning time with what matters.", line: "Joy was always the reward you postponed. Now it becomes the practice." },
];

const practices = [
  { n: "01", icon: "ignite", title: "Ignite", sub: "Fuel Passion & Purpose", quote: "My purpose still matters — and now I have time for it.", line: "For decades, purpose was assigned. Now you choose it." },
  { n: "02", icon: "move", title: "Move", sub: "Reclaim Vitality at Any Age", quote: "Age doesn't limit vitality. Habits do.", line: "The body doesn't shout. It whispers. Answer before it has to." },
  { n: "03", icon: "connect", title: "Connect", sub: "Build a Circle That Lifts You", quote: "Connection isn't optional. It's essential.", line: "Work ends and the circle thins fast. Rebuild it on purpose, before the quiet sets in." },
  { n: "04", icon: "contribute", title: "Contribute", sub: "Offer Wisdom Without the Lecture", quote: "I still have something worth giving.", line: "Decades of hard-won experience don't expire. Pass them on." },
  { n: "05", icon: "explore", title: "Explore", sub: "Use the Power of Novelty and Play", quote: "Curiosity keeps life vivid.", line: "Too much predictability shrinks you. Curiosity keeps you loose." },
  { n: "06", icon: "grow", title: "Grow", sub: "Grow Wisdom and Inner Alignment", quote: "I keep growing into who I'm becoming.", line: "You haven't finished learning who you are. The best of it is still ahead." },
  { n: "07", icon: "optimize", title: "Optimize", sub: "Manage Your Resources by Your Design", quote: "My time, space and money should serve the life I want.", line: "Unstructured time is a gift that needs a design. Build one." },
];

const tools = [
  { img: "starter-plan", title: "The 14-Day Starter Plan", desc: "Two weeks, one small move a day. Feel the framework work before you finish the book.", cta: "Download free →", href: "/unretire/start" },
  { img: "toolkit", title: "The Practice Toolkit", desc: "A menu of small experiments. Once a week, pick one and try it. No pressure, just motion.", cta: "Explore →", href: "/unretire/tools" },
  { img: "wheel-of-life", title: "The 2-Minute Check", desc: "A quick, honest read across every part of a full life. See which parts have gone quiet.", cta: "Spend 2 minutes well →", href: "/unretire/assess" },
];

function Card({ item }: { item: (typeof mindsets)[number] }) {
  return (
    <div className="card card-hover relative p-7">
      <span className="absolute top-6 right-7 text-3xl font-bold text-[#EFE2D7] leading-none select-none" aria-hidden="true">
        {item.n}
      </span>
      <span className="relative block h-14 w-16 mb-5" aria-hidden="true">
        <Image src={`/assets/unretire/icons/${item.icon}.png`} alt="" fill sizes="64px" className="object-contain object-left" />
      </span>
      <h3 className="text-xl mb-1">{item.title}</h3>
      <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#D05D11] mb-4">{item.sub}</p>
      <p className="text-[15px] italic text-[#232F3F] leading-[1.5] mb-3">&ldquo;{item.quote}&rdquo;</p>
      <p className="prose-body text-[14px] text-[#666666] leading-[1.7]">{item.line}</p>
    </div>
  );
}

export default function PracticePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 text-center lg:text-left">
              <p className="eyebrow mb-6">Practice</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
                Reading is thinking. Practice is living.
              </h1>
              <span className="rule mt-7 mb-7 mx-auto lg:mx-0" aria-hidden="true" />
              <p className="lede max-w-[52ch] mx-auto lg:mx-0 mb-9">
                A framework you only understand is an idea. A framework you <em>use</em> becomes a
                life. This is where UnRetire stops being a book. Five mindsets to change how you
                think. Seven practices to change what you do. And one small thing to start this week.
              </p>
              <Link href="#tools" className="btn btn-crimson">
                Download the Free 14-Day Starter Plan
              </Link>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative w-full max-w-[560px] mx-auto aspect-[3/2]">
                <Image
                  src="/assets/unretire/images/practice/hero.png"
                  alt="Stepping from idea into action — practice is living"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE EQUATION ─────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="eyebrow mb-5">The Framework</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">One simple formula.</h2>
              <span className="rule mt-6 mb-7" aria-hidden="true" />
              <p className="text-2xl sm:text-[1.75rem] font-bold text-[#232F3F] leading-snug mb-2">
                Mindset <span className="text-[#D05D11]">&times;</span> Practice
              </p>
              <p className="text-[1.05rem] italic text-[#D05D11] mb-6">Multiply, don&apos;t add.</p>
              <p className="prose-body leading-[1.85]">
                A new mindset with no practice stays a wish. Hard practice with the old mindset just
                burns you out. Put them together and each one makes the other stronger. That is the
                whole design.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative w-full max-w-[520px] mx-auto aspect-[3/2]">
                <Image
                  src="/assets/unretire/images/homepage/framework.png"
                  alt="Mindset × Practice — two gears that turn together"
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE 5 MINDSETS ───────────────────────────────────── */}
      <section id="mindsets" className="bg-white scroll-mt-[88px]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">How You Think</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">The 5 Mindsets</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="lede">
              For decades your life ran on rails. The calendar set the rhythm. Your title set your
              identity. Then the rails vanish, and we call it freedom — but freedom with no shape can
              feel like floating. These five give the shape back.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mindsets.map((m) => (
              <Card key={m.title} item={m} />
            ))}
             {/* CTA block — Starter Plan (sits beside Joy · 05) */}
            <div className="card relative p-7 flex flex-col justify-center">
              <p className="eyebrow mb-3">Try it free</p>
              <p className="text-[15px] text-[#232F3F] leading-[1.6] mb-5">
                Try the 5 Mindsets in the free 14-Day Starter Plan — a taste of these key components from the book.
              </p>
              <Link href="/unretire/start" className="btn btn-crimson self-start">
                Get the Free 14-Day Starter Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE 7 PRACTICES ──────────────────────────────────── */}
      <section id="practices" className="bg-[#FBF5F2] border-y border-[#ECECEC] scroll-mt-[88px]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What You Do</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">The 7 Practices</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="lede">
              Mindset opens the door. Practice walks you through it. Seven small actions, repeated,
              that turn intention into momentum.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {practices.map((p) => (
              <Card key={p.title} item={p} />
            ))}
             {/* CTA block — Practice Toolkit (sits after Optimize · 07) */}
            <div className="card relative p-7 flex flex-col justify-center">
              <p className="eyebrow mb-3">Try it free</p>
              <p className="text-[15px] text-[#232F3F] leading-[1.6] mb-5">
                Explore a few easy-to-implement practices from our Practice Toolkit — basic lifestyle changes you can make that will change your next chapter.
              </p>
              <Link href="/unretire/tools" className="btn btn-crimson self-start">
                Explore the Practice Toolkit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE TOOLS ────────────────────────────────────────── */}
      <section id="tools" className="bg-white scroll-mt-[88px]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Put It to Work</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">Don&apos;t absorb all twelve. Start with one.</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tools.map((t) => (
              <Link key={t.title} href={t.href} className="card card-hover overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-[#FBF5F2] border-b border-[#ECECEC]">
                  <Image
                    src={`/assets/unretire/images/practice/${t.img}.png`}
                    alt={t.title}
                    fill
                    sizes="(min-width: 768px) 360px, 100vw"
                    className="object-contain p-6"
                  />
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="text-[1.2rem] leading-snug mb-3">{t.title}</h3>
                  <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">{t.desc}</p>
                  <span className="pill-link">{t.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl text-white leading-tight mb-3">
            Where have you gone quiet?
          </h2>
          <p className="text-white/70 text-[17px] italic leading-[1.6] mb-9">
            Two minutes and eight questions will tell you. Nothing to sign up for, nothing to pay.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/unretire/assess" className="btn btn-crimson">
              Spend 2 minutes well
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand />
    </>
  );
}
