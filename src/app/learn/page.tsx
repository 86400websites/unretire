import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Learn",
  description:
    "Three ways into the next chapter: the (Un)Retire course, the podcast, and short essays on living fully.",
};

const formats = [
  {
    label: "Online Course",
    img: "course",
    title: "The (Un)Retire Course",
    desc: "The book's companion course. Ten guided modules across the five mindsets and seven practices — each lesson with a short video, a downloadable companion guide, and a plan you build as you go. Not a lecture. A walk through your own next chapter, one step at a time.",
    cta: "Start the Course →",
    href: "/learn/course",
  },
  {
    label: "Podcast",
    img: "podcast",
    title: "Reboot, Don't Mute — the Podcast",
    desc: "Conversations with people who refused to fade. Retirees who started over, experts on purpose and longevity, and honest talk about the questions no one warns you about. Real stories, no clich\u00e9s about \u201Cslowing down.\u201D",
    cta: "Tune In →",
    href: "/podcast",
  },
  {
    label: "Blog",
    img: "articles",
    title: "Short Notes on Living Fully",
    desc: "Brief, practical essays you can read in five minutes and use the same day. One idea, one story, one small move — drawn from the framework and from life. No fluff, no hustle.",
    cta: "Read Now →",
    href: "/blog",
  },
];

export default function LearnPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Learn</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            Three ways into the next chapter.
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[60ch] mx-auto">
            The book gives you the framework. This is where you go deeper. A
            guided course to walk you through it, honest conversations to keep
            you company, and short essays to read with your morning coffee. Pick
            the format that fits how you like to learn — and how you like to
            live.
          </p>
        </div>
      </section>

      {/* ── FORMAT CARDS ─────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {formats.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="card card-hover overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-white border-b border-[#ECECEC]">
                  <Image
                    src={`/assets/unretire/images/learn/${f.img}.png`}
                    alt={f.title}
                    fill
                    sizes="(min-width: 768px) 360px, 100vw"
                    className="object-contain p-8"
                  />
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <p className="eyebrow mb-3">{f.label}</p>
                  <h2 className="text-[1.35rem] leading-snug mb-4">
                    {f.title}
                  </h2>
                  <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">
                    {f.desc}
                  </p>
                  <span className="pill-link">{f.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── A WORD ON HOW TO USE THIS ────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">How to use this</p>
          <span className="rule mx-auto mb-8" aria-hidden="true" />
          <p className="text-2xl sm:text-[1.75rem] leading-[1.5] text-[#232F3F] mb-6">
            You don&apos;t have to do all three.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            Some people want the structure of a course. Some want a voice in
            their ear on a morning walk. Some just want a short read that makes
            them think. There&apos;s no right order, and no falling behind.
          </p>
          <p className="text-[1.2rem] italic text-[#D05D11] leading-[1.6]">
            Start where you are. That&apos;s always been the whole idea.
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl text-white leading-tight mb-3">
            The best chapter of your life hasn&apos;t been written yet.
          </h2>
          <p className="text-white/70 text-[17px] italic leading-[1.6] mb-9">
            Pick a page and begin.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/learn/course" className="btn btn-crimson">
              Start the Course
            </Link>
            <Link
              href="/start"
              className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]"
            >
              Get the Free Starter Plan
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand />
    </>
  );
}
