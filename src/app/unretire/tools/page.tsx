import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";
import DownloadGate from "../DownloadGate";

export const metadata = {
  title: "Tools",
  description:
    "Small, practical tools to put the (Un)Retire framework to work: the 14-Day Starter Plan, the Practice Toolkit, the Wheel of Life, and the Life Design Workbook.",
};

const tools = [
  { img: "images/practice/starter-plan", title: "The 14-Day Starter Plan", desc: "Two weeks, one small move a day. The simplest way to feel the framework working before you finish the book.", cta: "Get it free by email →", href: "/unretire/start", gate: "starter-plan" },
  { img: "images/practice/toolkit", title: "The Practice Toolkit", desc: "28 small experiments across the seven practices — one a week for half a year. No pressure. Just forward motion.", cta: "Get it free by email →", href: "", gate: "toolkit" },
  { img: "images/practice/wheel-of-life", title: "The Wheel of Life", desc: "A quick, honest check across the eight dimensions of a full life. See where you've started muting yourself.", cta: "Take the 2-minute check →", href: "/unretire/assess", gate: "" },
  { img: "diagrams/ikigai", title: "The Life Design Workbook", desc: "Structured reflection — purpose, passion, contribution — to personalise the framework to your own life.", cta: "Buy on Amazon →", href: "/unretire/book", gate: "" },
];

const gateCopy: Record<string, { item: string; heading: string; blurb: string }> = {
  "starter-plan": {
    item: "14-Day Starter Plan",
    heading: "Get the 14-Day Starter Plan",
    blurb: "Drop your email and we'll send the 14-Day Starter Plan straight to your inbox — plus a weekly note on living fully, at any age.",
  },
  toolkit: {
    item: "Practice Toolkit",
    heading: "Get the Practice Toolkit",
    blurb: "Drop your email and we'll send the Toolkit your way — 28 small experiments across the seven practices, plus a short series to help you put them to work.",
  },
};

export default function ToolsPage() {
  return (
    <>
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Tools</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">Small tools. Real momentum.</h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[58ch] mx-auto">
            You don&apos;t have to absorb the whole framework at once. Each of these is a single, doable
            starting point — designed for real life, not theory. Pick one and begin this week.
          </p>
        </div>
      </section>

      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {tools.map((t) => {
              const inner = (
                <>
                  <div className="relative sm:w-40 sm:flex-shrink-0 aspect-[4/3] sm:aspect-auto bg-white border-b sm:border-b-0 sm:border-r border-[#ECECEC]">
                    <Image
                      src={`/assets/unretire/${t.img}.png`}
                      alt={t.title}
                      fill
                      sizes="(min-width: 640px) 160px, 100vw"
                      className="object-contain p-5"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-[1.25rem] leading-snug mb-2">{t.title}</h2>
                    <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-5 flex-1">{t.desc}</p>
                    <span className="pill-link">{t.cta}</span>
                  </div>
                </>
              );

              if (t.gate) {
                const c = gateCopy[t.gate];
                return (
                  <DownloadGate
                    key={t.title}
                    tag={t.gate}
                    item={c.item}
                    heading={c.heading}
                    blurb={c.blurb}
                    triggerClassName="card card-hover overflow-hidden flex flex-col sm:flex-row text-left w-full"
                    triggerContent={inner}
                  />
                );
              }
              return (
                <Link key={t.title} href={t.href} className="card card-hover overflow-hidden flex flex-col sm:flex-row">{inner}</Link>
              );
            })}
          </div>
        </div>
      </section>

      <EmailCaptureBand showFaq />
    </>
  );
}
