import Link from "next/link";

export default function ComingSoon({
  title,
  blurb = "We're putting this part of the (Un)Retire experience together. Check back soon — or explore what's already here.",
}: {
  title: string;
  blurb?: string;
}) {
  return (
    <section className="bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
        <div className="relative">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-full h-[260px] bg-[radial-gradient(ellipse,rgba(139,26,26,0.08),transparent_70%)]"
            aria-hidden="true"
          />
          <p className="eyebrow mb-6">Coming Soon</p>
          <h1 className="relative text-4xl sm:text-5xl lg:text-6xl leading-[1.08] capitalize">
            {title}
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[46ch] mx-auto mb-9">{blurb}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/unretire/practice" className="btn btn-crimson">
              Explore the Practice
            </Link>
            <Link href="/unretire" className="btn btn-outline">
              ← Back to UnRetire
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
