import Link from "next/link";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Premium",
  description: "Unlock the full UnRetire experience with a Premium subscription.",
};

export default function PremiumPage() {
  return (
    <>
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Premium</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">Go Premium.</h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[54ch] mx-auto">
            A Premium subscription unlocks the full UnRetire experience — the complete course, every
            practice and tool, and members-only journeys. Full details are coming soon.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Link href="/unretire/start" className="btn btn-crimson">Get the Free Starter Plan</Link>
            <Link href="/unretire/learn/course" className="btn btn-outline">Preview the Course</Link>
          </div>
        </div>
      </section>
      <EmailCaptureBand />
    </>
  );
}