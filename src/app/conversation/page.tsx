import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { siteOrigin } from "@/lib/site-url";
import { googleCalendarUrl, joinUrl } from "@/lib/webinar/calendar";
import { CAMPAIGN, formatDisplayParts, getWebinar } from "@/lib/webinar/config";
import { webinarState } from "@/lib/webinar/state";
import { COPY, calendarDescription, fill } from "./copy";
import RegisterForm from "./RegisterForm";
import ToolkitForm from "./ToolkitForm";

/**
 * /conversation — the webinar's landing page. Sprint S6.1.
 *
 * RENDERED PER REQUEST. Which state the page is in follows the clock: the
 * same deployment shows both forms at 15:59 and the closed text at 16:00. A
 * prerendered page would freeze whatever was true at build time.
 *
 * THREE STATES, decided by src/lib/webinar/state.ts and nowhere else:
 *   dormant — no start is configured. The page does not exist: 404, and no
 *             metadata either, so nothing about the webinar leaks.
 *   open    — both forms.
 *   closed  — from the start instant: the forms are replaced by the closed
 *             text and its links, and the hero button is not shown.
 *
 * Nothing per-webinar is typed here or in the copy. The date, the weekday and
 * the time are formatted once, on the server, from WEBINAR_STARTS_AT and
 * handed to the client forms as finished strings.
 */
export const dynamic = "force-dynamic";

/**
 * The site's existing share image (src/app/opengraph-image.png), named
 * explicitly. A page that sets its own `openGraph` replaces the root layout's
 * whole object, and the file-based image goes with it — the page would be
 * shared with a title and no picture. The copy file says this page uses the
 * site's image, so it is put back here.
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

  const { title, description } = COPY.meta;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/conversation",
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

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      className="icon-block mb-5 text-[var(--ur-crimson)]"
      aria-hidden="true"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
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

export default function ConversationPage() {
  const webinar = getWebinar();
  const state = webinarState(webinar, new Date());
  if (state.funnel === "dormant" || !webinar.startsAt) notFound();

  const open = state.funnel === "open";
  const when = formatDisplayParts(webinar.startsAt);
  const site = siteOrigin();

  const googleCalendarHref = googleCalendarUrl({
    start: webinar.startsAt,
    sessionMinutes: CAMPAIGN.sessionMinutes,
    summary: COPY.calendar.summary,
    description: calendarDescription(joinUrl(site)),
    site,
  });

  const runs = [
    {
      text: COPY.howItRuns.pen,
      icon: (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
      ),
    },
    {
      text: COPY.howItRuns.chat,
      icon: (
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
      ),
    },
    {
      text: fill(COPY.howItRuns.closes, when),
      icon: (
        <>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 7v5l3 2" />
        </>
      ),
    },
  ];

  return (
    // UTC instants only. The offer code and every address stay out of these
    // attributes: they are read by tests and by the launch check, and a data
    // attribute is page source like any other.
    <div
      data-conv-state={state.funnel}
      data-conv-starts-at={webinar.startsAt.toISOString()}
      data-conv-offer-ends-at={webinar.offerEndsAt?.toISOString()}
      data-conv-replay={state.replay}
    >
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">{COPY.hero.eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            {COPY.hero.title}
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="font-bold text-xl sm:text-2xl text-[var(--ur-navy)] leading-snug max-w-[38ch] mx-auto">
            {fill(COPY.hero.detail, when)}
          </p>
          {open && (
            <a href="#register" className="btn btn-crimson mt-9">
              {COPY.hero.button}
            </a>
          )}
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────── */}
      <section className="bg-[var(--ur-warm)] border-y border-[var(--ur-border)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                {COPY.problem.heading}
              </h2>
              <span className="rule mt-6" aria-hidden="true" />
            </div>
            <div className="lg:col-span-7">
              {COPY.problem.opening.map((paragraph) => (
                <p key={paragraph} className="lede mb-5">
                  {paragraph}
                </p>
              ))}
              <p className="text-[1.2rem] sm:text-[1.35rem] italic text-[var(--ur-navy)] leading-[1.6] border-l-2 border-[var(--ur-crimson)] pl-5 my-7">
                {COPY.problem.pause}
              </p>
              <p className="lede mb-5">{COPY.problem.closing[0]}</p>
              <p className="lede">{fill(COPY.problem.closing[1], when)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── YOU'LL LEAVE WITH ────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
                {COPY.leaveWith.heading}
              </h2>
              <span className="rule mt-6" aria-hidden="true" />
            </div>
            <div className="lg:col-span-7">
              <ul className="card p-8 sm:p-10 space-y-5">
                {COPY.leaveWith.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check />
                    <span className="lede">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT IS FOR ────────────────────────────────────── */}
      <section className="bg-[var(--ur-navy)]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl text-white">
            {COPY.whoFor.heading}
          </h2>
          <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
          <p className="text-xl sm:text-2xl text-white/85 leading-[1.5]">
            {COPY.whoFor.body}
          </p>
        </div>
      </section>

      {/* ── HOW THE HOUR RUNS ────────────────────────────────── */}
      <section className="bg-[var(--ur-warm)] border-b border-[var(--ur-border)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem]">
              {COPY.howItRuns.heading}
            </h2>
            <span className="rule mt-6 mx-auto" aria-hidden="true" />
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {runs.map((run) => (
              <li key={run.text} className="card p-7">
                <Icon>{run.icon}</Icon>
                <p className="prose-body">{run.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {open ? (
        <>
          {/* ── REGISTER ─────────────────────────────────────── */}
          <section
            id="register"
            className="bg-white scroll-mt-[var(--ur-nav-h)]"
          >
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
              <RegisterForm
                detail={fill(COPY.register.detail, when)}
                eventDetail={fill(COPY.thankYou.detail, when)}
                googleCalendarHref={googleCalendarHref}
              />
            </div>
          </section>

          {/* ── TOOLKIT ──────────────────────────────────────── */}
          <section className="bg-[var(--ur-warm)] border-t border-[var(--ur-border)]">
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
              <ToolkitForm />
            </div>
          </section>
        </>
      ) : (
        /* ── REGISTRATION CLOSED ──────────────────────────────── */
        <section className="bg-white">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl leading-tight">
              {COPY.closed.text}
            </h2>
            <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center">
              <Link href="/tools" className="btn btn-crimson">
                {COPY.closed.toolkitLink}
              </Link>
              {state.replay === "available" && (
                <Link href="/conversation/replay" className="btn btn-outline">
                  {COPY.closed.replayLink}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
