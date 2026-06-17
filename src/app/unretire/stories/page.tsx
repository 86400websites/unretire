import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";

const stories = [
  { img: "mentor", kind: "Practice", tag: "Contribute", title: "The Mentor", desc: "Spent forty years building companies. Now spends mornings building people — one founder, one coffee, one hard question at a time." },
  { img: "artist", kind: "Mindset", tag: "Evolution", title: "The Beginner at 68", desc: "Picked up a paintbrush for the first time the year she retired. Three exhibitions later, she's not slowing down — she's just getting started." },
  { img: "run", kind: "Practice", tag: "Move", title: "The Athlete Who Never Quit", desc: "Everyone told him to take it easy. He ran his first marathon at 71 instead — and proved that age doesn't limit vitality. Habits do." },
  { img: "connect", kind: "Practice", tag: "Connect", title: "The Reconnected", desc: "Retirement shrank his circle to almost nothing. So he rebuilt it — on purpose, one weekly call at a time — and found a community that lifts him." },
  { img: "teach", kind: "Practice", tag: "Contribute", title: "The Grandparent with a Second Act", desc: "She thought her teaching days were over. Now she runs a reading circle for her whole neighbourhood — wisdom shared without the lecture." },
  { img: "travel", kind: "Practice", tag: "Explore", title: "The Late Explorer", desc: "After decades of predictable routines, he said yes to the unfamiliar — a new language, a new city, a new self. Curiosity put him back in charge." },
];

export default function StoriesPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="eyebrow mb-6">Stories</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            Retirement isn&apos;t the end of your story. It&apos;s where the plot thickens.
          </h1>
          <span className="rule mt-7 mb-7" aria-hidden="true" />
          <p className="lede max-w-[62ch]">
            It&apos;s one thing to read a framework. It&apos;s another to meet someone who lived it.
            These are real people who refused to fade — artists, mentors, athletes, grandparents, and
            change-makers who prove that the most interesting chapter often comes after the title
            disappears.
          </p>
        </div>
      </section>

      {/* ── THE PREMISE ──────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <span className="rule mx-auto mb-8" aria-hidden="true" />
          <p className="text-[1.35rem] sm:text-[1.5rem] leading-[1.55] text-[#232F3F] mb-6">
            Everywhere I look, I see people in their later years who are not <em>finished</em>. They are{" "}
            <strong className="font-bold">unfinished</strong>.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            Unfinished conversations. Unfinished contributions. Unfinished curiosity. Unfinished joy.
            What they lacked was never ability. It was permission — and one example of someone who&apos;d
            already gone first.
          </p>
          <p className="text-[1.2rem] italic text-[#D05D11] leading-[1.6]">
            These stories are that permission.
          </p>
        </div>
      </section>

      {/* ── FEATURED STORY ───────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <p className="eyebrow mb-5">Where It Began</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                From Heartbreak to a Road That Saves Lives
              </h2>
              <span className="rule mt-6 mb-7" aria-hidden="true" />
              <p className="prose-body leading-[1.85] mb-4">
                When Maher lost his son Hikmat, his world stopped. There was a version of him that
                wanted to retreat, to pull back and disappear quietly.
              </p>
              <p className="prose-body leading-[1.85] mb-4">
                Instead, he asked a different question: <em>How can I use this pain to do good?</em>
              </p>
              <p className="prose-body leading-[1.85] mb-7">
                That question gave birth to the Hikmat Road Safety Program — a project that has saved
                lives across Jordan. It was acceptance in its truest form: not giving up, but saying{" "}
                <em>&ldquo;This is where I am. Now — what can I build from here?&rdquo;</em> It&apos;s the
                same question this book asks of you.
              </p>
              <Link href="/unretire/about" className="btn btn-outline">
                Read the full story →
              </Link>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border border-[#ECECEC] bg-[#FBF5F2]">
                <Image
                  src="/assets/unretire/images/stories/featured.png"
                  alt="A road winding toward the sunrise — the Hikmat Road Safety Program"
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY GRID ───────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">More Journeys</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">People who unretired</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="text-[14px] text-[#888888] italic">
              Each card links to a full profile. Placeholders below — swap in real, named stories as
              they&apos;re gathered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((s) => (
              <article key={s.title} className="card overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-white border-b border-[#ECECEC]">
                  <Image
                    src={`/assets/unretire/images/stories/${s.img}.png`}
                    alt={s.title}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#D05D11] mb-3">
                    {s.kind} · {s.tag}
                  </p>
                  <h3 className="text-[1.3rem] leading-snug mb-3">{s.title}</h3>
                  <p className="prose-body text-[14px] text-[#666666] leading-[1.7]">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHARE YOURS ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Your Turn</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">Have you unretired?</h2>
          <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
          <p className="prose-body text-[17px] leading-[1.85] mb-4">
            Somewhere, someone is sitting where you once sat — wondering if this is really it. Your
            story might be the permission they&apos;re waiting for.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-9">
            Tell us how you rebooted instead of muting. We feature new journeys regularly.
          </p>
          <Link href="/unretire/contact" className="btn btn-crimson">
            Share Your Story
          </Link>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl text-white leading-tight mb-3">
            Every one of these people started with the same uncomfortable question.
          </h2>
          <p className="text-white/70 text-[17px] italic leading-[1.6] mb-9">
            Then they chose to answer it differently.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/unretire/start" className="btn btn-crimson">
              Start the 14-Day Plan
            </Link>
            <Link href="/unretire/book" className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]">
              Read the Book
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand />
    </>
  );
}
