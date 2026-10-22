import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "./EmailCaptureBand";

const whoFor = [
  "Your job title disappeared. You didn't.",
  "You still feel useful. You just don't know how.",
  "The freedom was wonderful for about a month.",
  "Money's tighter than expected.",
  "You're tired of being told to take it easy.",
];

const paths = [
  {
    title: "Assess",
    desc: "Eight questions, two minutes, no signup. See which parts have gone quiet.",
    href: "/assess",
    cta: "Start the check →",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D05D11"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9.5" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </svg>
    ),
  },
  {
    title: "Learn",
    desc: "The book, the ten-module course, and honest conversations about life after work.",
    href: "/learn",
    cta: "See the course →",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D05D11"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4 2 9l10 5 10-5-10-5Zm-6 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4M22 9v6" />
      </svg>
    ),
  },
  {
    title: "Practice",
    desc: "The 5 Mindsets, the 7 Practices, the 14-Day Starter Plan.",
    href: "/practice",
    cta: "Get the free plan →",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D05D11"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 3.5v17l14-8.5-14-8.5Z" />
      </svg>
    ),
  },
  {
    title: "Stories",
    desc: "People who refused to fade.",
    href: "/stories",
    cta: "Read them →",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D05D11"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 20c0-3 2.7-5 6-5s6 2 6 5M16 14c2.5 0 5 1.6 5 4.5" />
      </svg>
    ),
  },
];

export default function UnRetirePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 text-center lg:text-left">
              <p className="eyebrow mb-6">Reboot. Don&apos;t Mute.</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
                The job ended.
                <br />
                You didn&apos;t.
              </h1>
              <span
                className="rule mt-7 mb-7 mx-auto lg:mx-0"
                aria-hidden="true"
              />
              <p className="font-bold text-xl sm:text-2xl text-[#232F3F] leading-snug mb-5 max-w-[42ch] mx-auto lg:mx-0">
                The title goes. The calendar empties. Nobody prepares you for
                that part.
              </p>
              <p className="lede max-w-[52ch] mx-auto lg:mx-0 mb-5">
                Discover a book, a ten-module course, and a framework built for
                this — by Maher Kaddoura, who redefined his own retirement at
                40.
              </p>

              <div className="flex flex-nowrap gap-2.5 justify-center lg:justify-start">
                <Link
                  href="/book"
                  className="btn btn-crimson whitespace-nowrap text-[13px] px-5"
                >
                  Read the Book
                </Link>
                <Link
                  href="/assess"
                  className="btn btn-outline whitespace-nowrap text-[13px] px-5"
                >
                  Take the 2-minute check
                </Link>
                <Link
                  href="/learn/course"
                  className="btn btn-outline whitespace-nowrap text-[13px] px-5"
                >
                  See what&apos;s in the course
                </Link>
              </div>
              <p className="prose-body text-[9px] text-[#837A6E] leading-[1.6] mt-4 max-w-[52ch] mx-auto lg:mx-0">
                Prefer to look around first?{" "}
                <a
                  href="https://youtu.be/6cUHqODZJ28"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D05D11] font-bold hover:underline"
                >
                  Watch the course introduction
                </a>{" "}
                — 3 minutes, no email needed.
              </p>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative w-full max-w-[500px] mx-auto aspect-[3/2]">
                <Image
                  src="/assets/unretire/images/homepage/hero.png"
                  alt="Stepping through retirement toward a new path — reboot, don't mute"
                  fill
                  sizes="(min-width: 1024px) 500px, 100vw"
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGNATURE QUOTE ──────────────────────────────────── */}
      <section className="bg-white border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-16 text-center">
          <span className="rule mx-auto mb-7" aria-hidden="true" />
          <blockquote className="text-[#1B1B1B] text-2xl md:text-3xl italic leading-[1.4]">
            &ldquo;Aging is inevitable. Diminishing is optional.&rdquo;
          </blockquote>
          <cite className="block text-[#D05D11] font-bold text-[12px] tracking-[0.14em] uppercase mt-5 not-italic">
            — Maher Kaddoura
          </cite>
        </div>
      </section>

      {/* ── THE FRAMEWORK ────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-b border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <p className="eyebrow mb-5">What It&apos;s About</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                A Practical Way to Live Fully — at Any Age
              </h2>
              <span className="rule mt-6 mb-7" aria-hidden="true" />
              <p className="prose-body leading-[1.85] mb-4">
                Most books about retirement tell you how to <em>slow down</em>.
                This one shows you how to <em>wake up</em>.
              </p>
              <p className="prose-body leading-[1.85] mb-4">
                The (Un)Retire framework is built on one simple equation:{" "}
                <strong className="text-[#1B1B1B] font-bold">
                  Mindset &times; Practice.
                </strong>
              </p>
              <p className="prose-body leading-[1.85] mb-8">
                Five mindsets to change how you think. Seven practices to change
                what you do. Together they turn the empty calendar into a blank
                canvas — not time to fill, but a life to design.
              </p>
              <Link href="/practice#tools" className="btn btn-crimson">
                Download the Free 14-Day Starter Plan
              </Link>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative w-full max-w-[520px] mx-auto aspect-[1254/980]">
                <Image
                  src="/assets/unretire/diagrams/mindset-practice-loop.png"
                  alt="The Mindset × Practice framework — five mindsets and seven practices"
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-5">Who Is It For</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                Who this is for
              </h2>
              <span className="rule mt-6 mb-7" aria-hidden="true" />
              <p className="prose-body leading-[1.85] mb-6">
                UnRetire isn&apos;t about fading quietly. It&apos;s about what
                you do next. Write your next chapter.
              </p>
              <Link href="/book" className="btn btn-outline">
                Check out the Book
              </Link>
              <div className="relative w-full max-w-[440px] mx-auto lg:mx-0 mt-9 aspect-[2/1]">
                <Image
                  src="/assets/unretire/images/homepage/who-is-it-for.png"
                  alt="People living a fuller next chapter — painting, staying active, connecting"
                  fill
                  sizes="(min-width: 1024px) 440px, 100vw"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <ul className="card p-8 sm:p-10 space-y-5">
                {whoFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="text-[#D05D11] font-bold mt-1 flex-shrink-0"
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
                    <span className="prose-body text-[16px] leading-[1.6]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERE'S WHAT YOU PAY FOR ───────────────────────────── */}
      <section className="bg-[#FBF5F2] border-t border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Simple pricing</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">
              Here&apos;s What You Pay For
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <div className="card p-8 sm:p-10 flex flex-col">
              <h3 className="text-2xl mb-4">The Course — $99, once.</h3>
              <p className="prose-body leading-[1.8] mb-6 flex-1">
                Ten modules. Forty-eight lessons. A short video and a
                downloadable workbook for each module. It moves from an honest
                look at where you are now, through purpose, health,
                relationships, growth, money and contribution, and finishes with
                a written 90-day plan. Work at your own pace. Yours to keep and
                to come back to.
              </p>
              <Link href="/learn/course" className="pill-link">
                See the ten modules →
              </Link>
            </div>

            <div className="card p-8 sm:p-10 flex flex-col">
              <h3 className="text-2xl mb-4">Premium — $199 a year.</h3>
              <p className="prose-body leading-[1.8] mb-6 flex-1">
                Everything in the course, plus the book and the workbook in
                electronic form, a letter from Maher once a month, and the full
                practice toolkit — which keeps growing for as long as
                you&apos;re a member.
              </p>
              <Link href="/premium" className="pill-link">
                What&apos;s in Premium →
              </Link>
            </div>
          </div>

          <p className="prose-body text-center text-[15px] text-[#666666] leading-[1.7] mt-8 max-w-2xl mx-auto">
            Start free. The 2-minute check costs nothing and asks for nothing.
          </p>
        </div>
      </section>

      {/* ── FOUR WAYS TO ENGAGE ──────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Four ways to begin</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">
              Choose where you start
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {paths.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="card card-hover relative p-7 flex flex-col before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[#D05D11] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:rounded-t-2xl"
              >
                <span className="icon-block mb-5">{p.icon}</span>
                <h3 className="text-xl mb-3">{p.title}</h3>
                <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">
                  {p.desc}
                </p>
                <span className="pill-link">{p.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand
        showFaq
        heading="Begin Your Next Chapter"
        blurb="The best chapter of your life hasn't been written yet. Get the free 14-Day Starter Plan and a weekly note on living fully — at any age."
      />

      {/* ── CLOSING BAND ─────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-white/70 text-[16px] leading-[1.7] mb-7">
            Take a moment. Ask yourself, honestly:
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white leading-[1.4] mb-3">
            Where have I started muting myself?
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white leading-[1.4] mb-8">
            What part of me is still awake, asking for more?
          </p>
          <p className="text-white/60 text-[16px] italic leading-[1.7]">
            You don&apos;t need the answers yet. Just the courage to ask.
          </p>
        </div>
      </section>
    </>
  );
}
