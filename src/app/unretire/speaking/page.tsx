import Link from "next/link";
import Image from "next/image";
import EmailCaptureBand from "../EmailCaptureBand";

export const metadata = {
  title: "Speaking",
  description:
    "Invite Maher Kaddoura to speak. Keynotes and workshops on rebooting identity, purpose, and contribution in the next chapter of life.",
};

const topics = [
  { title: "Reboot, Don't Mute", desc: "The keynote. Why retirement is the most important beginning of your life — and how to design it on purpose." },
  { title: "The 5 Mindsets of an Unretired Life", desc: "Freedom, Evolution, Balance, Relevance, Joy — the belief shifts that separate those who drift from those who design." },
  { title: "Designing Life After the Title", desc: "What happens to identity when the role disappears, and how to build a self that doesn't depend on a business card." },
  { title: "From Loss to Contribution", desc: "A candid talk on acceptance, resilience, and turning pain into purpose — the story behind the Hikmat Road Safety Program." },
];

const formats = [
  { title: "Keynote", desc: "45–60 minutes for conferences, corporate events, and retirement-readiness programs." },
  { title: "Workshop", desc: "Half- or full-day interactive sessions built around the framework and the Wheel of Life." },
  { title: "Fireside / Panel", desc: "Moderated conversation or panel appearance on longevity, purpose, and the new retirement." },
];

export default function SpeakingPage() {
  return (
    <>
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
              <p className="eyebrow mb-6">Speaking</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
                Bring the (Un)Retire message to your stage.
              </h1>
              <span className="rule mt-7 mb-7 mx-auto lg:mx-0" aria-hidden="true" />
              <p className="lede max-w-[52ch] mx-auto lg:mx-0 mb-9">
                Maher Kaddoura speaks to organizations, conferences, and communities about the most
                under-prepared transition of modern life — and how to meet it with intention,
                contribution, and joy. Honest, warm, and practical, with no clichés about slowing down.
              </p>
              <Link href="/unretire/contact" className="btn btn-crimson">
                Invite Maher to speak
              </Link>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-[360px] aspect-square">
                <div className="absolute -inset-6 bg-[radial-gradient(ellipse,rgba(208,93,17,0.12),transparent_70%)]" aria-hidden="true" />
                <Image
                  src="/assets/images/maher.jpg"
                  alt="Maher Kaddoura speaking"
                  fill
                  sizes="(min-width: 1024px) 360px, 100vw"
                  priority
                  className="relative rounded-2xl object-cover border border-[#ECECEC] shadow-[0_28px_56px_-24px_rgba(27,27,27,0.35)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Signature Talks</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">Talks that move a room</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topics.map((t) => (
              <div key={t.title} className="card p-7">
                <h3 className="text-xl mb-3">{t.title}</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.75]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow mb-5">Formats</p>
            <h2 className="text-3xl sm:text-4xl">However your event is shaped</h2>
            <span className="rule mt-6 mb-0 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {formats.map((f) => (
              <div key={f.title} className="text-center px-4">
                <h3 className="text-xl mb-3">{f.title}</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.75]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl text-white leading-tight mb-3">Have a stage that needs this message?</h2>
          <p className="text-white/70 text-[16px] italic leading-[1.6] mb-9">
            Tell us about your event and we&apos;ll be in touch with availability and topics.
          </p>
          <Link href="/unretire/contact" className="btn bg-white text-[#232F3F] hover:bg-[#F5F5F5]">
            Invite Maher to speak →
          </Link>
        </div>
      </section>

      <EmailCaptureBand />
    </>
  );
}
