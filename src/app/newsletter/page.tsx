import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Newsletter",
  description:
    "A weekly note on living fully — one idea, one small move, every Monday morning. Practical, never preachy, a five-minute read.",
};

const points = [
  { title: "One idea, every Monday", desc: "A single thought on mindset, purpose, or practice — drawn from the framework and from real life." },
  { title: "Practical, never preachy", desc: "No hustle, no clichés about slowing down. Just one small move you can make the same day." },
  { title: "A five-minute read", desc: "Short enough to read with your morning coffee, useful enough to change the afternoon." },
];

export default function NewsletterPage() {
  return (
    <>
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">The Newsletter</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            A weekly note on living fully.
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[56ch] mx-auto">
            Every Monday morning, a short letter on designing the life you were made for — at any age.
            No noise, no selling. Just one idea worth carrying into the week.
          </p>
        </div>
      </section>

      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">What lands in your inbox</p>
            <h2 className="text-3xl sm:text-4xl">What to expect</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {points.map((p, i) => (
              <div key={p.title} className="card p-7 text-center">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[1.1rem] font-bold mb-5">
                  {i + 1}
                </span>
                <h3 className="text-xl mb-3">{p.title}</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.75]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EmailCaptureBand heading="Begin Your Next Chapter" blurb="Join the (Un)Retire newsletter. One idea, every Monday — plus the free 14-Day Starter Plan when you sign up." />
    </>
  );
}
