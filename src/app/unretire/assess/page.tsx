import WheelOfLife from "./WheelOfLife";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "The Wheel of Life",
  description: "A two-minute, no-signup check across the eight dimensions of a full life. See where you've started muting yourself.",
};

export default function AssessPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Assess · The Wheel of Life</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            Where have you started muting yourself?
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[60ch] mx-auto">
            The Wheel of Life — (Un)Retirement Edition. A quick, honest check across the eight
            dimensions of a full life. It takes two minutes, and there&apos;s nothing to sign up for.
            Just rate where you are today, and see your next chapter more clearly.
          </p>
        </div>
      </section>

      {/* ── THE WHEEL (client island) ────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <WheelOfLife />
        </div>
      </section>

      {/* ── HOW TO READ IT ───────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">What it means</p>
          <span className="rule mx-auto mb-8" aria-hidden="true" />
          <p className="text-2xl sm:text-[1.75rem] leading-[1.5] text-[#232F3F] mb-6">
            A full life isn&apos;t a high score. It&apos;s a round wheel.
          </p>
          <p className="prose-body text-[17px] leading-[1.85]">
            A wheel with one flat spoke doesn&apos;t roll well — and neither does a life. The point
            isn&apos;t to max out every dimension. It&apos;s to notice which spokes have gone quiet, and
            to give them a little attention. That noticing is the whole beginning of the practice.
          </p>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────── */}
      <EmailCaptureBand
        showFaq
        blurb="Want the worksheet version to revisit each month? Get the free 14-Day Starter Plan and a weekly note on living fully — at any age."
      />
    </>
  );
}
