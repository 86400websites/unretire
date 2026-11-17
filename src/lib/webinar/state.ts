import type { WebinarEnvValues } from "./env";

/**
 * Which state the webinar funnel is in — Sprint S6.1.
 *
 * Pure, and `now` is ALWAYS a parameter. The state follows the clock, not the
 * build: the same deployment is "open" at 15:59 and "closed" at 16:00. A
 * function that read the clock itself could only be tested by waiting, and
 * three of the states this file describes (closed, replay pending, offer
 * ended) cannot be reached at all on a Preview whose test date is fixed years
 * ahead. Taking `now` as an argument is what lets
 * tests/e2e/webinar/state.spec.ts walk every one of them.
 *
 * Every route and page under /conversation asks this file, so they cannot
 * disagree with each other about whether registration is open.
 */

/**
 * dormant — no usable start is configured. Nothing under /conversation exists:
 *           every route answers 404. This is Production until go-live.
 * open    — before the start instant. Both forms are shown.
 * closed  — from the start instant onward. The forms are replaced by the
 *           closed text.
 */
export type FunnelState = "dormant" | "open" | "closed";

/** pending — no replay address yet. available — one is set. */
export type ReplayState = "pending" | "available";

/**
 * none  — no offer deadline is configured, so no offer is shown.
 * open  — before the deadline.
 * ended — from the deadline onward.
 */
export type OfferState = "none" | "open" | "ended";

export type WebinarState = {
  funnel: FunnelState;
  replay: ReplayState;
  offer: OfferState;
};

export function webinarState(
  webinar: WebinarEnvValues,
  now: Date,
): WebinarState {
  const at = now.getTime();

  let funnel: FunnelState = "dormant";
  if (webinar.startsAt) {
    // "From the start instant": the instant itself is already closed.
    funnel = at < webinar.startsAt.getTime() ? "open" : "closed";
  }

  let offer: OfferState = "none";
  if (webinar.offerEndsAt) {
    offer = at < webinar.offerEndsAt.getTime() ? "open" : "ended";
  }

  return {
    funnel,
    replay: webinar.replayUrl ? "available" : "pending",
    offer,
  };
}

/**
 * What POST /api/conversation may do in a given state.
 *
 *   404       — dormant. The route does not exist as far as a caller can tell,
 *               and it is refused before the rate limiter runs and before the
 *               body is read: a switched-off route does no work.
 *   409       — the webinar has started. The request is understood and is
 *               refused with the approved "registration has closed" text.
 *   "proceed" — open. The only state in which anything reaches Mailchimp.
 */
export type WriteDecision = 404 | 409 | "proceed";

export function decideWrite(state: WebinarState): WriteDecision {
  if (state.funnel === "dormant") return 404;
  if (state.funnel === "closed") return 409;
  return "proceed";
}
