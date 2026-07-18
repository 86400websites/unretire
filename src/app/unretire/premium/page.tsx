import CheckoutButton from "./CheckoutButton";
import { getAccess } from "@/lib/auth/entitlements";

export const metadata = {
  title: "Premium",
  description:
    "UnRetire Premium — the course, an electronic copy of the book and workbook, a monthly letter from Maher, and a growing toolkit. $199/year.",
};

const features = [
  {
    n: "1",
    title: "The Full (Un)Retire Course",
    tagline: "Included — a $99 value on its own.",
    body: "All ten modules. Five Mindsets. Seven Practices. Yours to keep and revisit whenever a new season of life calls for it.",
  },
  {
    n: "2",
    title: "Electronic Version of The Book",
    tagline: "The heart of Premium.",
    body: "An electronic version of the book you can keep on your phone or tablet — to reference any time and find inspiration for the challenges of retirement.",
  },
  {
    n: "3",
    title: "Electronic Version of the Workbook",
    tagline: "Make UnRetire part of your lifestyle.",
    body: "An electronic workbook makes the practice portable and easy to reach. Take it with you when you travel — and redo your evaluations every three months to check your progress.",
  },
  {
    n: "4",
    title: "The Premium Letter",
    tagline: "A note from me, once a month.",
    body: "Not a newsletter. A letter. One idea, one story, one small action you can take this week — some from my travels, some from the book, some from a reader who found something worth passing on. Short enough to read with your coffee. Deep enough to stay with you.",
  },
  {
    n: "5",
    title: "The Practice Toolkit — Always Growing",
    tagline: "The exercises, digitized. And added to.",
    body: "The Permission Letter. The Career Timeline. The Ideal Week. The Direction Exercise. The Wheel of Life. Every worksheet from the framework, ready to use — with new tools added through the year. Your library gets richer the longer you stay.",
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
            You already know how to work. What comes next is harder — and nobody hands you a map for
            it. Premium walks the road with you. Every month. Every season. Your UnRetire mentor.
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
              Everything you need to design your next chapter. In one place. Starting today.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY PREMIUM ──────────────────────────────────────── */}
      <section className="bg-[#FAF5F0] border-y border-[#ECE5DB]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            Most people leave the office with a plan for their money and no plan for their life.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            The first months feel like a holiday. Then the calendar empties. The phone goes quiet. The
            old routines creep back — smaller, slower, safer.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            That&apos;s not a knowledge problem. It&apos;s a design problem.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            Change is hard to do alone. It&apos;s far easier when someone walks beside you — with a
            rhythm to follow, a room of people doing the same work, and a way to see how far
            you&apos;ve come.
          </p>
          <p className="text-2xl sm:text-[1.75rem] leading-[1.5] text-[#14110D] mt-9 mb-4">
            That&apos;s what Premium is.
          </p>
          <p className="text-[1.2rem] italic text-[#8B1A1A] leading-[1.6]">
            Not more content to consume. A place to keep evolving.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What&apos;s inside</p>
            <h2 className="text-3xl sm:text-4xl">Everything you need to UnRetire.</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="lede">
              Five elements to design your next chapter.
            </p>
          </div>

          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.n} className="card p-7 sm:p-8">
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F6EDE6] text-[#8B1A1A] text-[1rem] font-bold flex items-center justify-center">
                    {f.n}
                  </span>
                  <h3 className="text-[1.3rem] text-[#14110D] leading-snug">{f.title}</h3>
                </div>
                <p className="text-[15px] italic text-[#8B1A1A] leading-[1.5] mb-3">{f.tagline}</p>
                <p className="prose-body text-[15px] text-[#4A443B] leading-[1.75]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING / PRICING (crimson band) ─────────────────── */}
      <section className="bg-[#D05D11]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            Knowing what to do is easy. Doing it — for a year, then another — is the whole game.
            Premium is how you stay in it.
          </p>
          <p className="text-white/70 text-[17px] leading-[1.7] mb-8">
            A yearly membership — the course, the book, the workbook, the monthly letter, and a toolkit
            that keeps growing.
          </p>
          <p className="text-5xl sm:text-6xl font-bold text-white leading-none mb-2">$199</p>
          <p className="text-white/70 text-[15px] mb-8">per year</p>
          <CheckoutButton
            product="premium"
            loggedIn={loggedIn}
            owned={hasPremium}
            label="Join Premium"
            className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]"
          />
          <p className="mt-6 text-[15px] italic text-white/70 leading-[1.6]">
            Aging is inevitable. Diminishing is optional. Choose.
          </p>
        </div>
      </section>
    </>
  );
}
