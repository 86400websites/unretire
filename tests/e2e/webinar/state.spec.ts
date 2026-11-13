import { test, expect } from "../fixtures";
import type { WebinarEnvValues } from "../../../src/lib/webinar/env";
import {
  decideWrite,
  webinarState,
  type WebinarState,
} from "../../../src/lib/webinar/state";

/**
 * Sprint S6.1 — which state the webinar funnel is in, and what a write may do.
 *
 * This is the only place three of the funnel's states can be exercised at all.
 * The Preview's test date is fixed years ahead on purpose (so the suite cannot
 * go red by calendar), which means a deployed page is always "open": closed,
 * replay-pending-after-the-event and offer-ended never occur there. Because
 * `now` is a parameter, every one of them is walked here, to the millisecond.
 */

const START = new Date("2029-12-13T14:00:00.000Z");
const OFFER_END = new Date("2029-12-20T21:59:00.000Z");
const MS = 1;
const DAY = 24 * 60 * 60 * 1000;

function webinar(overrides: Partial<WebinarEnvValues> = {}): WebinarEnvValues {
  return {
    startsAt: START,
    offerEndsAt: OFFER_END,
    offerCode: "TESTCODE",
    zoomUrl: "https://zoom.us/j/0000000000",
    replayUrl: null,
    ...overrides,
  };
}

function at(instant: Date, offsetMs: number): Date {
  return new Date(instant.getTime() + offsetMs);
}

test.describe("S6.1 state — dormant, open, closed", () => {
  test("no start configured is dormant, whatever else is set and whenever it is asked", () => {
    const dormant = webinar({ startsAt: null });
    for (const now of [
      new Date("2020-01-01T00:00:00Z"),
      START,
      at(OFFER_END, DAY),
    ]) {
      expect(webinarState(dormant, now).funnel).toBe("dormant");
    }
    // Production today: only the Zoom address is set.
    expect(
      webinarState(
        {
          startsAt: null,
          offerEndsAt: null,
          offerCode: null,
          zoomUrl: "https://zoom.us/j/0000000000",
          replayUrl: null,
        },
        new Date("2026-11-13T12:00:00Z"),
      ),
    ).toEqual({ funnel: "dormant", replay: "pending", offer: "none" });
  });

  test("open until the start instant, closed FROM it", () => {
    expect(webinarState(webinar(), at(START, -365 * DAY)).funnel).toBe("open");
    expect(webinarState(webinar(), at(START, -MS)).funnel).toBe("open");
    // The boundary itself: registration closes when the webinar goes live.
    expect(webinarState(webinar(), START).funnel).toBe("closed");
    expect(webinarState(webinar(), at(START, MS)).funnel).toBe("closed");
    expect(webinarState(webinar(), at(START, 365 * DAY)).funnel).toBe("closed");
  });
});

test.describe("S6.1 state — replay and offer", () => {
  test("the replay is pending until an address is set, then available", () => {
    const later = at(START, DAY);
    expect(webinarState(webinar(), later).replay).toBe("pending");
    expect(
      webinarState(
        webinar({ replayUrl: "https://www.youtube.com/watch?v=00000000000" }),
        later,
      ).replay,
    ).toBe("available");
  });

  test("no deadline means no offer at all", () => {
    for (const now of [at(START, -DAY), START, at(OFFER_END, DAY)]) {
      expect(webinarState(webinar({ offerEndsAt: null }), now).offer).toBe(
        "none",
      );
    }
  });

  test("the offer is open until its deadline, ended FROM it", () => {
    expect(webinarState(webinar(), at(START, DAY)).offer).toBe("open");
    expect(webinarState(webinar(), at(OFFER_END, -MS)).offer).toBe("open");
    expect(webinarState(webinar(), OFFER_END).offer).toBe("ended");
    expect(webinarState(webinar(), at(OFFER_END, MS)).offer).toBe("ended");
  });

  test("the three answers are independent of each other", () => {
    // After the event, replay published, offer still running — the state the
    // replay page spends most of its life in.
    expect(
      webinarState(
        webinar({ replayUrl: "https://www.youtube.com/watch?v=00000000000" }),
        at(START, DAY),
      ),
    ).toEqual({ funnel: "closed", replay: "available", offer: "open" });
    // After everything.
    expect(webinarState(webinar(), at(OFFER_END, DAY))).toEqual({
      funnel: "closed",
      replay: "pending",
      offer: "ended",
    });
  });

  test("the function does not change what it is given", () => {
    const input = webinar();
    const before = JSON.stringify(input);
    const now = new Date(START);
    webinarState(input, now);
    expect(JSON.stringify(input)).toBe(before);
    expect(now.getTime()).toBe(START.getTime());
  });
});

test.describe("S6.1 state — what POST /api/conversation may do", () => {
  function state(funnel: WebinarState["funnel"]): WebinarState {
    return { funnel, replay: "pending", offer: "none" };
  }

  test("dormant is 404, closed is 409, and only open proceeds", () => {
    expect(decideWrite(state("dormant"))).toBe(404);
    expect(decideWrite(state("closed"))).toBe(409);
    expect(decideWrite(state("open"))).toBe("proceed");
  });

  test("the replay and the offer never open or close registration", () => {
    for (const replay of ["pending", "available"] as const) {
      for (const offer of ["none", "open", "ended"] as const) {
        expect(decideWrite({ funnel: "open", replay, offer })).toBe("proceed");
        expect(decideWrite({ funnel: "closed", replay, offer })).toBe(409);
        expect(decideWrite({ funnel: "dormant", replay, offer })).toBe(404);
      }
    }
  });

  test("end to end: the same configuration, three moments, three answers", () => {
    expect(decideWrite(webinarState(webinar(), at(START, -MS)))).toBe(
      "proceed",
    );
    expect(decideWrite(webinarState(webinar(), START))).toBe(409);
    expect(
      decideWrite(webinarState(webinar({ startsAt: null }), at(START, -MS))),
    ).toBe(404);
  });
});
