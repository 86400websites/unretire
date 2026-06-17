import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "The Book",
  description: "UnRetire by Maher Kaddoura — the framework of 5 mindsets and 7 practices to design a next chapter with meaning, balance, and adventure.",
};

const mindsets = [
  { icon: "freedom", title: "Freedom", line: "Living life on your own terms" },
  { icon: "evolution", title: "Evolution", line: "Honor the past, but move forward" },
  { icon: "balance", title: "Balance", line: "A whole and fulfilled life" },
  { icon: "relevance", title: "Relevance", line: "You don't have an expiry date" },
  { icon: "joy", title: "Joy", line: "Meaningful moments, by design" },
];

const practices = [
  { icon: "ignite", title: "Ignite", line: "Fuel passion and purpose" },
  { icon: "move", title: "Move", line: "Reclaim vitality at any age" },
  { icon: "connect", title: "Connect", line: "Build a circle that lifts you" },
  { icon: "contribute", title: "Contribute", line: "Offer wisdom without the lecture" },
  { icon: "explore", title: "Explore", line: "Use the power of novelty and play" },
  { icon: "grow", title: "Grow", line: "Deepen wisdom and inner alignment" },
  { icon: "optimize", title: "Optimize", line: "Manage your resources, by your design" },
];

const testimonials = [
  { quote: "I retired with a full bank account and an empty calendar. This book gave me back the second thing — a reason to get up.", who: "Reader name, former executive" },
  { quote: "I expected another \u201Cstay busy\u201D lecture. Instead it gave me permission to begin again, without pretending to be younger.", who: "Reader name, recently retired" },
  { quote: "Honest, warm, and practical. The 14-day plan got me moving in a week — not someday.", who: "Reader name, retired educator" },
  { quote: "It named the quiet crisis I couldn't put into words. Then it handed me a way out.", who: "Reader name" },
];

function IconTile({ name, title }: { name: string; title: string }) {
  return (
    <span className="relative block h-16 w-full mb-4" aria-hidden="true">
      <Image
        src={`/assets/unretire/icons/${name}.png`}
        alt=""
        fill
        sizes="80px"
        className="object-contain object-left"
      />
      <span className="sr-only">{title}</span>
    </span>
  );
}

export default function BookPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
              <p className="eyebrow mb-6">The Book</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
                Not another book about slowing down.
              </h1>
              <span className="rule mt-7 mb-7 mx-auto lg:mx-0" aria-hidden="true" />
              <p className="lede max-w-[52ch] mx-auto lg:mx-0 mb-9">
                Most retirement books prepare your finances and forget your life. UnRetire does the
                opposite. It hands you a framework — five mindsets and seven practices — to design a
                next chapter with meaning, balance, and adventure. Not advice on how to take it easy. A
                blueprint for living fully, at any age.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" className="btn btn-crimson">
                  Buy Now
                </a>
                <Link href="/unretire/start" className="btn btn-outline">
                  Download the Free First Chapter
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px]">
                <div className="absolute -inset-8 bg-[radial-gradient(ellipse,rgba(208,93,17,0.12),transparent_70%)]" aria-hidden="true" />
                <Image
                  src="/assets/images/1.png"
                  alt="UnRetire by Maher Kaddoura — book cover"
                  width={320}
                  height={442}
                  priority
                  className="relative w-full h-auto drop-shadow-[0_28px_56px_rgba(27,27,27,0.28)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROMISE ──────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">The Promise</p>
          <span className="rule mx-auto mb-8" aria-hidden="true" />
          <p className="text-[1.35rem] sm:text-[1.5rem] leading-[1.55] text-[#232F3F] mb-6">
            They tell you retirement is freedom. They tell you it&apos;s rest. They tell you
            you&apos;ve earned it.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            What they don&apos;t tell you is this: retirement, done wrong, doesn&apos;t feel like
            freedom. It feels like drift. This book is the invitation to flip the script — to see
            retirement not as a finish line, but as a threshold. A moment when experience finally meets
            freedom.
          </p>
          <p className="text-[1.35rem] sm:text-[1.5rem] italic leading-[1.5] text-[#D05D11]">
            Because the most dangerous thing about retirement isn&apos;t stopping work. It&apos;s
            stopping yourself.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What&apos;s Inside</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">One equation. A whole new chapter.</h2>
            <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
            <p className="lede">
              Everything in UnRetire flows from a single idea —{" "}
              <strong className="text-[#1B1B1B] font-bold">Mindset &times; Practice</strong>. How you
              think, multiplied by what you do.
            </p>
          </div>

          {/* The 5 Mindsets */}
          <div className="mb-12 sm:mb-14">
            <div className="flex items-center gap-4 mb-7">
              <h3 className="text-2xl whitespace-nowrap">The 5 Mindsets</h3>
              <span className="text-[12px] font-bold tracking-[0.12em] uppercase text-[#666666]">How you think</span>
              <span className="flex-1 h-px bg-[#ECECEC]" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {mindsets.map((m) => (
                <div key={m.title} className="card card-hover p-6">
                  <IconTile name={m.icon} title={m.title} />
                  <h4 className="text-[1.15rem] mb-1.5">{m.title}</h4>
                  <p className="text-[13px] text-[#666666] leading-snug">{m.line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The 7 Practices */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-7">
              <h3 className="text-2xl whitespace-nowrap">The 7 Practices</h3>
              <span className="text-[12px] font-bold tracking-[0.12em] uppercase text-[#666666]">What you do</span>
              <span className="flex-1 h-px bg-[#ECECEC]" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {practices.map((p) => (
                <div key={p.title} className="card card-hover p-6">
                  <IconTile name={p.icon} title={p.title} />
                  <h4 className="text-[1.15rem] mb-1.5">{p.title}</h4>
                  <p className="text-[13px] text-[#666666] leading-snug">{p.line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools strip */}
          <div className="rounded-2xl bg-[#FBF5F2] border border-[#ECECEC] p-7 sm:p-8 text-center">
            <p className="prose-body text-[16px] leading-[1.8] max-w-[60ch] mx-auto">
              And to put it to work from day one — the{" "}
              <strong className="text-[#1B1B1B] font-bold">14-Day (Un)Retire Starter Plan</strong>, the{" "}
              <strong className="text-[#1B1B1B] font-bold">Practice Toolkit</strong>, and the{" "}
              <strong className="text-[#1B1B1B] font-bold">Wheel of Life — (Un)Retirement Edition</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What Readers Say</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">Don&apos;t just take our word for it.</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <figure key={t.who} className="card p-8 flex flex-col">
                <span className="text-[#D05D11] text-4xl leading-none font-bold mb-3" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote className="text-[1.05rem] italic text-[#232F3F] leading-[1.6] mb-5 flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="text-[13px] text-[#666666] italic">— {t.who}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-center text-[13px] text-[#888888] italic mt-8 max-w-[60ch] mx-auto">
            Placeholders written in the book&apos;s voice — swap in real endorsements when available.
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight mb-8">
            The best chapter of your life hasn&apos;t been written yet.
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" className="btn btn-crimson">
              Buy the Book
            </a>
            <Link href="/unretire/start" className="btn btn-outline">
              Download the Free First Chapter
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand showFaq />
    </>
  );
}
