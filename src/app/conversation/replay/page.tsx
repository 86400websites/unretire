import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatOfferDeadline, getWebinar } from "@/lib/webinar/config";
import { webinarState } from "@/lib/webinar/state";
import { COPY, fill, splitAt } from "../copy";

/**
 * /conversation/replay — the recording, and the course offer under it.
 * Sprint S6.1.
 *
 * RENDERED PER REQUEST, for the same reason as /conversation: the offer block
 * closes at an instant, not at a deployment.
 *
 *   dormant            → 404 (and no metadata).
 *   no replay address  → the site's standard coming-soon text. No offer.
 *   replay address set → a link to it, opened in a new tab.
 *     offer open       → the offer block: locked facts, the code when one is
 *                        set, the deadline, and a button to /learn/course.
 *     offer ended      → the offer-ended text. No code, no deadline.
 *     no deadline set  → no offer at all.
 *
 * The replay address is shown as a link and nothing else — it is never a
 * redirect target — which is why it may be on any https host. It opens in a
 * new tab with rel="noopener noreferrer": the page it leads to is not ours.
 */
export const dynamic = "force-dynamic";

/**
 * The site's existing share image, named explicitly — a page that sets its own
 * `openGraph` drops the root layout's file-based one (see ../page.tsx).
 */
const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
};

export function generateMetadata(): Metadata {
  const state = webinarState(getWebinar(), new Date());
  if (state.funnel === "dormant") return {};

  const title = COPY.meta.replayTitle;
  const description = COPY.meta.replayDescription;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/conversation/replay",
      siteName: COPY.brand,
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE],
    },
  };
}

function Check() {
  return (
    <span
      className="text-[var(--ur-crimson)] mt-1 flex-shrink-0"
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

export default function ReplayPage() {
  const webinar = getWebinar();
  const state = webinarState(webinar, new Date());
  if (state.funnel === "dormant" || !webinar.startsAt) notFound();

  const replayUrl = state.replay === "available" ? webinar.replayUrl : null;
  // The offer sits UNDER the replay: with no recording yet there is nothing
  // to put it under, so the coming-soon state never shows one.
  const offer = replayUrl ? state.offer : "none";
  const codeSentence = webinar.offerCode
    ? splitAt(COPY.replay.offer.code, "offer code")
    : null;

  return (
    <div
      data-conv-state={state.funnel}
      data-conv-starts-at={webinar.startsAt.toISOString()}
      data-conv-offer-ends-at={webinar.offerEndsAt?.toISOString()}
      data-conv-replay={state.replay}
      data-conv-offer={offer}
      data-conv-offer-code={webinar.offerCode ? "set" : "unset"}
    >
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          {!replayUrl && (
            <p className="eyebrow mb-6">{COPY.replay.comingSoon.eyebrow}</p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            {COPY.replay.title}
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          {replayUrl ? (
            <>
              <p className="lede max-w-[46ch] mx-auto mb-9">
                {COPY.replay.available.intro}
              </p>
              <a
                href={replayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-crimson"
              >
                {COPY.replay.available.link}
              </a>
            </>
          ) : (
            <>
              <p className="lede max-w-[46ch] mx-auto mb-9">
                {COPY.replay.comingSoon.body}
              </p>
              <Link href="/practice" className="btn btn-crimson">
                {COPY.replay.comingSoon.link}
              </Link>
            </>
          )}
        </div>
      </section>

      {offer === "open" && webinar.offerEndsAt && (
        <section className="bg-[var(--ur-warm)] border-t border-[var(--ur-border)]">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="text-center mb-9">
              <h2 className="text-3xl sm:text-4xl">
                {COPY.replay.offer.heading}
              </h2>
              <span className="rule mt-6 mx-auto" aria-hidden="true" />
            </div>
            <div className="card p-8 sm:p-10">
              <h3 className="text-2xl mb-5">{COPY.replay.offer.course}</h3>
              <ul className="space-y-3 mb-6">
                {COPY.replay.offer.facts.map((fact) => (
                  <li key={fact} className="flex items-start gap-3">
                    <Check />
                    <span className="prose-body">{fact}</span>
                  </li>
                ))}
              </ul>
              <p className="font-bold text-xl text-[var(--ur-navy)] leading-snug mb-6">
                {COPY.replay.offer.price}
              </p>
              {codeSentence && (
                <p className="prose-body mb-2">
                  {codeSentence[0]}
                  <strong className="font-bold text-[var(--ur-ink)]">
                    {webinar.offerCode}
                  </strong>
                  {codeSentence[1]}
                </p>
              )}
              <p className="prose-body mb-7">
                {fill(COPY.replay.offer.deadline, {
                  "offer deadline": formatOfferDeadline(
                    webinar.offerEndsAt,
                    COPY.timeZoneLabel,
                  ),
                })}
              </p>
              <Link href="/learn/course" className="btn btn-crimson">
                {COPY.replay.offer.button}
              </Link>
            </div>
          </div>
        </section>
      )}

      {offer === "ended" && (
        <section className="bg-[var(--ur-warm)] border-t border-[var(--ur-border)]">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
            <p className="font-bold text-xl sm:text-2xl text-[var(--ur-navy)] leading-snug mb-7">
              {COPY.replay.offerEnded.text}
            </p>
            <Link href="/learn/course" className="btn btn-outline">
              {COPY.replay.offerEnded.link}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
