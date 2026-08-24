import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "About Maher",
  description: "Maher Kaddoura on why he wrote (Un)Retire — and why usefulness has no expiry date.",
};

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
              <p className="eyebrow mb-6">About</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
                I never believed usefulness had an expiry date.
              </h1>
              <span className="rule mt-7 mb-7 mx-auto lg:mx-0" aria-hidden="true" />
              <p className="lede max-w-[54ch] mx-auto lg:mx-0">
                I&apos;m Maher Kaddoura. Consultant by profession. Entrepreneur by instinct. Seeker of
                meaning by nature. (Un)Retire is the book I wish someone had handed me — and millions of
                others — long before the calendar emptied and the question arrived:{" "}
                <em className="text-[#232F3F]">Is this it?</em>
              </p>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-[360px] aspect-square">
                <div className="absolute -inset-6 bg-[radial-gradient(ellipse,rgba(208,93,17,0.12),transparent_70%)]" aria-hidden="true" />
                <Image
                  src="/assets/images/maher.jpg"
                  alt="Maher Kaddoura"
                  fill
                  sizes="(min-width: 1024px) 360px, 100vw"
                  priority
                  className="relative rounded-2xl object-cover border border-[#ECECEC] shadow-[0_28px_56px_-24px_rgba(27,27,27,0.35)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE LINE THAT SHAPED A LIFE ──────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Where It Starts</p>
          <blockquote className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold italic text-[#232F3F] leading-[1.2]">
            &ldquo;Don&apos;t live half a life.&rdquo;
          </blockquote>
          <span className="rule mx-auto mt-7 mb-8" aria-hidden="true" />
          <p className="prose-body text-[17px] leading-[1.85] mb-4">
            From early in my life, one sentence shaped how I saw the world. My father used to quote
            Khalil Gibran to me: <em>&ldquo;Don&apos;t live half a life.&rdquo;</em> That line lodged
            itself deep inside me. It became a standard. A filter. A quiet refusal to sleepwalk through
            existence.
          </p>
          <p className="prose-body text-[17px] leading-[1.85]">
            Across global consulting, leadership roles, entrepreneurship, and social initiatives, I was
            never motivated by titles alone. I was motivated by usefulness. By impact. By the feeling
            that what I was doing actually mattered.
          </p>
        </div>
      </section>

      {/* ── THE DECISION ─────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="eyebrow mb-5">The Turning Point</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">At 40, I redefined retirement.</h2>
          <span className="rule mt-6 mb-7" aria-hidden="true" />
          <p className="prose-body leading-[1.85] mb-4">
            At an age when most people aren&apos;t even thinking about it, I made a decision: I would
            never retire from life. I would retire only from roles that no longer fit. From routines
            that no longer served. From definitions of success that no longer felt true.
          </p>
          <p className="prose-body leading-[1.85] mb-4">
            That wasn&apos;t rebellion. It was evolution. Over the years I moved from consulting to
            social entrepreneurship. From leading large organizations to mentoring individuals. From
            structured leadership to writing and filmmaking. Each shift felt uncomfortable at first.
            Each required letting go of a familiar identity. And every time, the same question guided me:
          </p>
          <p className="text-[1.3rem] italic text-[#D05D11] leading-[1.5] my-7">
            Am I still growing? Am I still aligned with what excites me and serves others?
          </p>
          <p className="prose-body leading-[1.85]">
            That simple question became my compass. It&apos;s why I now think of this stage not as an
            ending, but as the most liberated chapter of my life.
          </p>
        </div>
      </section>

      {/* ── WHAT LOSS TAUGHT ME ──────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="eyebrow mb-5">What I Learned the Hard Way</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">Acceptance isn&apos;t giving up.</h2>
          <span className="rule mt-6 mb-7" aria-hidden="true" />
          <p className="prose-body leading-[1.85] mb-4">
            I learned about acceptance the hard way. When I lost my son, Hikmat, my world stopped. There
            was a version of me that wanted to retreat, to disappear quietly.
          </p>
          <p className="prose-body leading-[1.85] mb-4">
            Instead, I asked a different question: <em>How can I use this pain to do good?</em>
          </p>
          <p className="prose-body leading-[1.85] mb-7">
            That question gave birth to the Hikmat Road Safety Program — a project that has saved lives
            in my home country of Jordan. It taught me that real acceptance is not about giving up.
            It&apos;s about saying: <em>This is where I am. Now — what can I build from here?</em>
          </p>
          <p className="text-[1.2rem] italic text-[#232F3F] leading-[1.6] border-l-2 border-[#D05D11] pl-5">
            I am not unique in this. The same capacity lives in you. If I can rewrite my story, so can
            you.
          </p>
        </div>
      </section>

      {/* ── WHY I WROTE THIS BOOK ────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="eyebrow mb-5">Why (Un)Retire</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
            Because no one warns you<br />about this part.
          </h2>
          <span className="rule mt-6 mb-7" aria-hidden="true" />
          <p className="prose-body leading-[1.85] mb-4">
            Everywhere I look, I see people in their later years who are not finished. They are
            unfinished — full of unfinished conversations, contributions, curiosity, and joy. What they
            lack is not ability. It&apos;s permission.
          </p>
          <p className="prose-body leading-[1.85] mb-4">
            Permission to begin again without pretending to be younger. To contribute without clinging
            to old roles. To design a life without waiting for instructions.
          </p>
          <p className="prose-body leading-[1.85]">
            I wrote (Un)Retire to hand you that permission — and a practical way to use it. Not platitudes.
            Not reinvention fantasies. A framework, a compass, and a set of practices grounded in real
            life. Because the most dangerous thing about retirement isn&apos;t stopping work. It&apos;s
            stopping yourself.
          </p>
        </div>
      </section>

      {/* ── CLOSING BAND ─────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-white/70 text-[16px] leading-[1.7] mb-7">Take a moment. Ask yourself, honestly:</p>
          <p className="text-2xl sm:text-3xl font-bold text-white leading-[1.4] mb-3">
            Where have I started muting myself?
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white leading-[1.4] mb-8">
            What part of me is still awake, asking for more?
          </p>
          <p className="text-white/60 text-[16px] italic leading-[1.7] mb-9">
            You don&apos;t need the answers yet. Just the courage to ask.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/book" className="btn btn-crimson">
              Read the Book
            </Link>
            <Link href="/start" className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]">
              Start the 14-Day Plan
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand />
    </>
  );
}
