import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import { getAccess } from "@/lib/auth/entitlements";
import BookDownloadModal from "./BookDownloadModal";

export const metadata = {
  title: "Premium",
  description:
    "UnRetire Premium — the course, an electronic copy of the book and workbook, a monthly letter from Maher, and a growing toolkit. $199/year.",
};

const features = [
  {
    n: "1",
    title: "The full course",
    tagline: "$99 on its own — included here.",
    body: "All ten modules, the five mindsets and seven practices. Yours to keep and to revisit whenever a new season calls for it.",
  },
  {
    n: "2",
    title: "The book, digital",
    tagline: "On your phone, on your tablet, always with you.",
    body: "The whole of (Un)Retire, ready to reach for on the hard mornings and the flat afternoons — wherever you happen to be standing.",
  },
  {
    n: "3",
    title: "The workbook, digital",
    tagline: "The practice, made portable.",
    body: "Take it travelling. Redo your evaluations every three months and watch, in your own handwriting, how far the year has moved you.",
  },
  {
    n: "4",
    title: "The Premium Letter",
    tagline: "Not a newsletter. A letter. Once a month.",
    body: "One idea, one story, one small thing to try this week — short enough for your coffee break. It stays with you longer than that.",
  },
  {
    n: "5",
    title: "The toolkit — and it grows",
    tagline: "Every worksheet, digitised. New ones through the year.",
    body: "The Permission Letter, the Career Timeline, the Ideal Week, the Direction Exercise, the Wheel of Life — all of it, ready to use. And it gets richer the longer you stay.",
  },
];

export default async function PremiumPage() {
  const { userId, products } = await getAccess();
  const loggedIn = !!userId;
  const hasPremium = products.includes("premium");

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">UnRetire Premium</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            You didn&apos;t retire to stand still.
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[56ch] mx-auto">
            You already know how to work. Nobody ever taught you how to do this.
            Premium is the whole framework, in one place, with a note from Maher
            every month — so you keep going after the first burst of motivation
            fades.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4">
            <CheckoutButton
              product="premium"
              loggedIn={loggedIn}
              owned={hasPremium}
              label="Join Premium — $199/year"
              className="btn btn-crimson"
            />
            <p className="text-[15px] text-[#666666] leading-[1.6] max-w-[46ch]">
              Includes the full $99 course. Cancel any time — and keep the
              course if you do.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY PREMIUM ──────────────────────────────────────── */}
      <section className="bg-[#FAF5F0] border-y border-[#ECE5DB]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight mb-7">
            Knowing what to do was never the hard part.
          </h2>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            You left with a plan for your money and none for your life. The
            first months feel like a holiday. Then the calendar empties, the
            phone goes quiet, and the old routines creep back — smaller, slower,
            safer.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            That isn&apos;t a knowledge problem. It&apos;s a design problem —
            and design is hard to hold on your own.
          </p>
          <p className="prose-body text-[17px] leading-[1.85]">
            Premium gives it a rhythm: the framework in one place, a room of
            people doing the same work, and a way to see how far you&apos;ve
            come. Not more to read. A place to keep going.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What&apos;s inside</p>
            <h2 className="text-3xl sm:text-4xl">
              Five things. One of them is the $99 course.
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="lede">
              Everything you need to design the next chapter, in one place.
            </p>
          </div>

          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.n} className="card p-7 sm:p-8">
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F6EDE6] text-[#8B1A1A] text-[1rem] font-bold flex items-center justify-center">
                    {f.n}
                  </span>
                  <h3 className="text-[1.3rem] text-[#14110D] leading-snug">
                    {f.title}
                  </h3>
                </div>
                <p className="text-[15px] italic text-[#8B1A1A] leading-[1.5] mb-3">
                  {f.tagline}
                </p>
                <p className="prose-body text-[15px] text-[#4A443B] leading-[1.75]">
                  {f.body}
                </p>
                {f.n === "2" && hasPremium && <BookDownloadModal />}
                {f.n === "3" && hasPremium && (
                  <BookDownloadModal
                    type="workbook"
                    buttonLabel="Download the workbook"
                    heading="Download your workbook"
                    intro="Enter your name below and we’ll prepare your personal copy of the (Un)Retire Workbook."
                    copyright="The (Un)Retire Workbook is protected by copyright."
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DO THE MATHS ─────────────────────────────────────── */}
      <section className="bg-[#FAF5F0] border-y border-[#ECE5DB]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight mb-7">
            Do the maths. We&apos;ll help.
          </h2>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            The course inside Premium is $99 on its own. So the book, the
            workbook, twelve monthly letters and the whole growing toolkit come
            to about $100 for the year.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            That&apos;s under nine dollars a month. Less than one dinner out,
            for a year of staying in it.
          </p>
          <p className="prose-body text-[17px] leading-[1.85]">
            You can check that arithmetic yourself — there&apos;s no bundle
            discount to untangle and no introductory rate that jumps later. One
            price. One year. Everything in.
          </p>
        </div>
      </section>

      {/* ── CLOSING / PRICING (crimson band) ─────────────────── */}
      <section className="bg-[#D05D11]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            One year. Everything in. $199.
          </p>
          <p className="text-white/70 text-[17px] leading-[1.7] mb-8">
            The course, the book, the workbook, a letter every month, and a
            toolkit that keeps growing for as long as you&apos;re a member.
          </p>
          <p className="text-5xl sm:text-6xl font-bold text-white leading-none mb-2">
            $199
          </p>
          <p className="text-white/70 text-[15px] mb-8">per year</p>
          <CheckoutButton
            product="premium"
            loggedIn={loggedIn}
            owned={hasPremium}
            label="Join Premium"
            className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]"
          />
          <p className="mt-6 text-[15px] text-white/80 leading-[1.6]">
            Cancel any time. If you cancel, you keep the course. Prefer just the
            course?{" "}
            <Link
              href="/learn/course"
              className="font-bold underline underline-offset-2 hover:text-white"
            >
              Get it for $99 →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
