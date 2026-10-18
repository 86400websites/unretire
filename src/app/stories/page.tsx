import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";
import StoriesGrid, { type Story } from "./StoriesGrid";

export const metadata = {
  title: "Stories",
  description:
    "Real people who refused to fade — artists, mentors, athletes, and change-makers who rebooted instead of muting.",
};

const stories: Story[] = [
  {
    slug: "murelle-harrison",
    img: "murelle-harrison",
    kind: "Practice",
    tag: "Contribute",
    title: "The Professor Who Became the Support System",
    name: "Murelle Harrison",
    country: "USA",
    closing: "The classroom ended. The contribution didn't.",
    body: [
      "After 40 years as a university professor, 15 of them chairing Southern University's psychology department, she retired in 2011. Instead of stepping back, she became Executive Director of the Gardere Initiative, expanding its work with children and families in Baton Rouge.",
    ],
  },
  {
    slug: "paul-tasner",
    img: "paul-tasner",
    kind: "Practice",
    tag: "Ignite",
    title: "The First-Time Founder at 66",
    name: "Paul Tasner",
    country: "USA",
    closing: "His corporate career ended. His contribution didn't.",
    body: [
      "His 40-year career in supply chain management ended at 64. After two years of consulting, he knew he wanted to build something of his own. At 66 he co-founded PulpWorks, making biodegradable packaging from waste materials to replace disposable plastic.",
    ],
  },
  {
    slug: "jim-ansara",
    img: "jim-ansara",
    kind: "Practice",
    tag: "Contribute",
    title: "The Builder Who Couldn't Stay Retired",
    name: "Jim Ansara",
    country: "USA",
    closing:
      "He retired from building a company. Then he built healthcare instead.",
    body: [
      "He grew Shawmut into one of America's largest design-build companies, then retired and sold it to its employees in 2006. Helping design a hospital in Haiti pulled him back in, and in 2014 he co-founded Build Health International, which has completed more than 200 healthcare projects.",
    ],
  },
  {
    slug: "kevin-kelly",
    img: "kevin-kelly",
    kind: "Practice",
    tag: "Explore",
    title: "The Optimist Imagining the Next Hundred Years",
    name: "Kevin Kelly",
    country: "USA",
    closing:
      "He left the editor's chair. He never stopped asking what comes next.",
    body: [
      "He helped launch WIRED in 1993 and left the editor's chair in 1999, but never left the future behind. He went on to build Cool Tools, help start the Quantified Self movement and work with the Long Now Foundation. At 74, he is imagining a desirable 100-year future.",
    ],
  },
  {
    slug: "nadja-piatka",
    img: "nadja-piatka",
    kind: "Mindset",
    tag: "Relevance",
    title: "The Baker Who Found a New Audience at 75",
    name: "Nadja Piatka",
    country: "Canada",
    closing:
      "At 75, she didn't disappear from view. She found a whole new audience.",
    body: [
      "After losing her job, she started baking with $100 and grew a food business supplying McDonald's, Subway and Tim Hortons. She retired at 75 and soon found she wasn't good at stepping away. She began sharing food, movement and healthy aging online, and hundreds of thousands followed.",
    ],
  },
  {
    slug: "chip-conley",
    img: "chip-conley",
    kind: "Mindset",
    tag: "Evolution",
    title: "The Modern Elder",
    name: "Chip Conley",
    country: "USA",
    closing: "He sold the company. He didn't sell his curiosity.",
    body: [
      "At 52, he sold the boutique hotel company he had run for 24 years. Then Airbnb called, and he joined as Head of Global Hospitality at twice the average age of its staff. Becoming a beginner again led him to co-found Modern Elder Academy in 2018.",
    ],
  },
];

export default function StoriesPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="eyebrow mb-6">Stories</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            Retirement isn&apos;t the end of your story. It&apos;s where the
            plot thickens.
          </h1>
          <span className="rule mt-7 mb-7" aria-hidden="true" />
          <p className="lede max-w-[62ch]">
            It&apos;s one thing to read a framework. It&apos;s another to meet
            someone who lived it. These are real people who refused to fade —
            artists, mentors, athletes, grandparents, and change-makers who
            prove that the most interesting chapter often comes after the title
            disappears.
          </p>
        </div>
      </section>

      {/* ── THE PREMISE ──────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <span className="rule mx-auto mb-8" aria-hidden="true" />
          <p className="text-[1.35rem] sm:text-[1.5rem] leading-[1.55] text-[#232F3F] mb-6">
            Everywhere I look, I see people in their later years who are not{" "}
            <em>finished</em>. They are{" "}
            <strong className="font-bold">unfinished</strong>.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            Unfinished conversations. Unfinished contributions. Unfinished
            curiosity. Unfinished joy. What they lacked was never ability. It
            was permission — and one example of someone who&apos;d already gone
            first.
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
                When Maher lost his son Hikmat, his world stopped. There was a
                version of him that wanted to retreat, to pull back and
                disappear quietly.
              </p>
              <p className="prose-body leading-[1.85] mb-4">
                Instead, he asked a different question:{" "}
                <em>How can I use this pain to do good?</em>
              </p>
              <p className="prose-body leading-[1.85] mb-7">
                That question gave birth to the Hikmat Road Safety Program — a
                project that has saved lives across Jordan. It was acceptance in
                its truest form: not giving up, but saying{" "}
                <em>
                  &ldquo;This is where I am. Now — what can I build from
                  here?&rdquo;
                </em>{" "}
                It&apos;s the same question this book asks of you.
              </p>
              <Link href="/about" className="btn btn-outline">
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
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">
              People who unretired
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="prose-body text-[15px] text-[#666666]">
              Click any story to read it in full.
            </p>
          </div>

          <StoriesGrid stories={stories} />
        </div>
      </section>

      {/* ── SHARE YOURS ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Your Turn</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
            Have you unretired?
          </h2>
          <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
          <p className="prose-body text-[17px] leading-[1.85] mb-4">
            Somewhere, someone is sitting where you once sat — wondering if this
            is really it. Your story might be the permission they&apos;re
            waiting for.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-9">
            Tell us how you rebooted instead of muting. We feature new journeys
            regularly.
          </p>
          <Link href="/contact" className="btn btn-crimson">
            Share Your Story
          </Link>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl text-white leading-tight mb-3">
            Every one of these people started with the same uncomfortable
            question.
          </h2>
          <p className="text-white/70 text-[17px] italic leading-[1.6] mb-9">
            Then they chose to answer it differently.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/start" className="btn btn-crimson">
              Start the 14-Day Plan
            </Link>
            <Link
              href="/book"
              className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]"
            >
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
