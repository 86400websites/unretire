import { readFileSync } from "node:fs";
import path from "node:path";
import type { APIRequestContext, Locator, Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import { COPY } from "../../../src/app/conversation/copy";
import { HONEYPOT_FIELD } from "../../../src/lib/webinar/registration-payload";

/**
 * Sprint S6.1 — /conversation and /conversation/replay in a real browser.
 * FEATURE-LIST lines PG-012, PG-013, PG-014, PG-015, FM-011, FM-012, IN-008.
 *
 * STATE-AWARE, AND NEVER RED BECAUSE OF THE STATE IT FINDS. The funnel is
 * dormant, open or closed depending on the values of the deployment under
 * test and on the clock:
 *
 *   dormant — no start configured. Production, and a Preview before the owner
 *             adds the four test values. Every route must answer 404.
 *   open    — a start in the future. Every Preview once the values are in.
 *   closed  — a start in the past. Only ever seen on a local server; the
 *             Preview's date is fixed years ahead on purpose.
 *
 * Each test reads the state first and SKIPS, visibly, when it is written for
 * another one. A skip is not a pass: the run that counts as evidence is the
 * one whose report shows the OPEN tests ran.
 *
 * NOTHING HERE REACHES MAILCHIMP. One live audience serves Production, Preview
 * and local (D-22), and a tag on a contact starts a real email flow. So every
 * form submission is answered IN THE BROWSER: only `/api/conversation` is
 * intercepted, by exact pathname, and it is always fulfilled — never passed
 * on. The single real POST in this file is the dormant branch's empty body
 * `{}`, which the route refuses with 404 before it reads anything and which
 * could not pass validation in any state.
 */

type Funnel = "dormant" | "open" | "closed";

type FunnelState = {
  funnel: Funnel;
  /** UTC ISO instant from the page root; empty when dormant. */
  startsAt: string;
  /** "available" | "pending"; empty when dormant. */
  replay: string;
};

function attribute(html: string, name: string): string {
  return html.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "";
}

/**
 * Which state is this deployment in? Asked over HTTP with the bypass-bearing
 * `api` fixture, so a protected Preview answers as the app and not as Vercel.
 * Anything other than the app's own 200 or 404 is reported as what it is — a
 * 401 here means the bypass did not arrive — and never mistaken for "dormant".
 */
async function readState(api: APIRequestContext): Promise<FunnelState> {
  const response = await api.get("/conversation", { failOnStatusCode: false });
  const status = response.status();
  if (status === 404) return { funnel: "dormant", startsAt: "", replay: "" };
  expect(
    status,
    "/conversation answered neither 200 nor 404 — on a protected Preview a 401 " +
      "means the bypass header did not reach the deployment, so nothing can be read",
  ).toBe(200);

  const html = await response.text();
  const funnel = attribute(html, "data-conv-state");
  expect(
    ["open", "closed"],
    "a 200 page must say whether registration is open or closed",
  ).toContain(funnel);
  return {
    funnel: funnel as Funnel,
    startsAt: attribute(html, "data-conv-starts-at"),
    replay: attribute(html, "data-conv-replay"),
  };
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * {weekday}, {date} and {time} for an instant, worked out HERE and not with
 * the app's own formatter: South African Standard Time is UTC+2 all year, so
 * the wall clock is the UTC clock two hours on. If the page ever showed the
 * server's zone, the visitor's zone or a typed date, this would disagree.
 */
function inSast(iso: string) {
  const local = new Date(new Date(iso).getTime() + 2 * 60 * 60 * 1000);
  const two = (value: number) => String(value).padStart(2, "0");
  return {
    weekday: WEEKDAYS[local.getUTCDay()]!,
    date: `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]!}`,
    time: `${two(local.getUTCHours())}:${two(local.getUTCMinutes())}`,
  };
}

/** 20291213T140000Z — the form the calendar file and Google's link use. */
function utcStamp(instant: Date): string {
  return instant
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/**
 * Browser errors, minus what is not this page's. The one named exception is
 * the Vercel Analytics DEBUG script: outside a Vercel deployment the analytics
 * component (added to the root layout in PR #41) asks for it from
 * va.vercel-scripts.com and the site's own CSP refuses it, on every page of a
 * local server. A deployment serves the script from its own origin instead.
 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  const ignored = (text: string) => text.includes("va.vercel-scripts.com");
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    if (ignored(msg.text()) || ignored(msg.location().url)) return;
    errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

/**
 * Wait until React has hydrated the form — observed, not assumed. See
 * tests/e2e/forms/form-proxy.spec.ts for the three false failures that taught
 * this: before hydration there is no onSubmit handler, and a click performs
 * the form's native submission instead.
 */
async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith("__reactFiber$"))
    );
  }, selector);
}

/** Open a page and say plainly if the document itself did not arrive. */
async function open(page: Page, route: string): Promise<void> {
  const response = await page.goto(route, { waitUntil: "load" });
  expect(
    response?.status(),
    `${route} did not load — on a protected Preview a 401 here means the ` +
      "bypass header did not reach the document, so nothing below can work",
  ).toBe(200);
}

type Reply = {
  status: number;
  body: unknown;
  /** Resolve this to let the answer go; until then the button stays busy. */
  hold?: Promise<void>;
};

/**
 * Answer every POST to /api/conversation in the browser.
 *
 * ONLY that pathname is intercepted — never a catch-all, which on a protected
 * Preview takes the document away from the fixture that adds the bypass — and
 * the request is ALWAYS fulfilled, never continued. A submission the test did
 * not script is answered with a 500 the form cannot mistake for success, and
 * is counted so the test fails on it.
 */
async function interceptSignups(page: Page) {
  const posts: Record<string, unknown>[] = [];
  const replies: Reply[] = [];
  const unscripted = { count: 0 };

  await page.route(
    (url) => url.pathname === "/api/conversation",
    async (route) => {
      posts.push(route.request().postDataJSON() as Record<string, unknown>);
      const reply = replies.shift();
      if (!reply) {
        unscripted.count += 1;
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "unscripted" }),
        });
        return;
      }
      if (reply.hold) await reply.hold;
      await route.fulfill({
        status: reply.status,
        contentType: "application/json",
        body: JSON.stringify(reply.body),
      });
    },
  );

  return {
    posts,
    unscripted,
    next: (reply: Reply) => {
      replies.push(reply);
    },
  };
}

/** The address convention of tests/e2e/forms/validation.spec.ts: reserved, undeliverable. */
const PROBE_EMAIL = "s61-probe@example.test";
const PROBE_NAME = "E2E";

function formParts(page: Page, form: "register" | "toolkit") {
  const root = page.locator(`#conv-${form}-form`);
  return {
    root,
    firstName: page.locator(`#conv-${form}-first`),
    email: page.locator(`#conv-${form}-email`),
    emailError: page.locator(`#conv-${form}-email-error`),
    formError: page.locator(`#conv-${form}-error`),
    submit: root.locator('button[type="submit"]'),
  };
}

test.describe("S6.1 copy — the page's strings are the approved strings", () => {
  test("every string in copy.ts is a whole cell of the approved copy file", () => {
    // The copy file is the source; copy.ts must follow it character for
    // character, curly quotes included. Read as text, with no server.
    const sheet = readFileSync(
      path.join(process.cwd(), "docs/content/page-copy/conversation.md"),
      "utf8",
    );
    const cells = new Set<string>();
    for (const line of sheet.split(/\r?\n/)) {
      if (!line.startsWith("|")) continue;
      for (const cell of line.split("|")) cells.add(cell.trim());
    }

    const strings: string[] = [];
    (function walk(value: unknown) {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") {
        Object.values(value).forEach(walk);
      }
    })(COPY);

    expect(strings.length, "copy.ts held no strings").toBeGreaterThan(50);
    expect(
      strings.filter((text) => !cells.has(text)),
      "these strings are not in docs/content/page-copy/conversation.md as written",
    ).toEqual([]);
  });

  test("nothing per-webinar is typed: dates, times and the code are tokens", () => {
    const text = JSON.stringify(COPY);
    for (const name of [...WEEKDAYS, ...MONTHS]) {
      expect(text, `copy.ts names "${name}"`).not.toMatch(
        new RegExp(`\\b${name}\\b`),
      );
    }
    expect(text, "copy.ts carries a clock time").not.toMatch(
      /\b\d{1,2}:\d{2}\b/,
    );
    expect(text, "copy.ts carries an address").not.toMatch(/https?:\/\//);
  });
});

test.describe("PG-014 — with no start date, nothing under /conversation exists", () => {
  test("PG-014 every /conversation route answers 404, and the write is refused", async ({
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "dormant",
      `this deployment's funnel is ${state.funnel}; the dormant checks do not apply`,
    );

    // /conversation/join is the one that proves the guard: Production holds a
    // Zoom address from the day this ships. It is never followed.
    for (const route of [
      "/conversation",
      "/conversation/replay",
      "/conversation/join",
      "/conversation/calendar.ics",
    ]) {
      const response = await api.get(route, {
        failOnStatusCode: false,
        maxRedirects: 0,
      });
      expect(response.status(), `${route} must not exist while dormant`).toBe(
        404,
      );
    }

    // THE ONE REAL POST IN THIS FILE. An empty body cannot reach Mailchimp in
    // any state: dormant refuses it here with 404 before the body is read,
    // and the validator would refuse it with 400 anywhere else.
    const write = await api.post("/api/conversation", {
      data: {},
      failOnStatusCode: false,
    });
    expect(write.status(), "the write route must not exist while dormant").toBe(
      404,
    );
    expect(await write.text(), "a 404 says nothing at all").toBe("");

    // The second developer's page is a different funnel and is untouched.
    const webinar = await api.get("/webinar", { failOnStatusCode: false });
    expect(webinar.status(), "/webinar must render as before").toBe(200);
  });
});

test.describe("PG-012 — while registration is open, the page is there to read", () => {
  test("PG-012 one h1, the date from the configured start, no placeholder, no errors", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const errors = collectErrors(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-register-first");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(COPY.hero.title);
    await expect(page).toHaveTitle(`${COPY.meta.title} · ${COPY.brand}`);

    // The page root: three facts, as UTC instants. Never the code, never an address.
    const root = page.locator("[data-conv-state]");
    await expect(root).toHaveCount(1);
    await expect(root).toHaveAttribute("data-conv-state", "open");
    const startsAt = (await root.getAttribute("data-conv-starts-at")) ?? "";
    expect(startsAt, "the start must be a UTC ISO instant").toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(new Date(startsAt).getTime()).toBeGreaterThan(Date.now());
    const offerEndsAt = await root.getAttribute("data-conv-offer-ends-at");
    if (offerEndsAt) {
      expect(offerEndsAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    }

    // The date and time are RENDERED from that instant, in SAST.
    const when = inSast(startsAt);
    const main = page.locator("main");
    await expect(main).toContainText(
      `${when.weekday} ${when.date} · ${when.time} ${COPY.timeZoneLabel} · 60 minutes, plus 10 optional minutes of questions`,
    );
    await expect(main).toContainText(
      `${when.weekday} ${when.date} · ${when.time} ${COPY.timeZoneLabel} · free · 60 minutes`,
    );
    await expect(main).toContainText(
      `Registration closes when we go live on ${when.weekday}.`,
    );

    // What they will leave with.
    for (const item of COPY.leaveWith.items) {
      await expect(main).toContainText(item);
    }

    // No unfilled token and no bracketed blank reaches the visitor.
    const text = await main.innerText();
    expect(text, "an unfilled {token} reached the page").not.toMatch(
      /\{[a-z ]+\}/,
    );
    expect(text, "a [placeholder] reached the page").not.toMatch(/\[[^\]]*\]/);

    // The Zoom address is on no page: everything points at /conversation/join.
    expect(await page.content(), "the Zoom address is in the page").not.toMatch(
      /zoom\.us/i,
    );

    // Both forms, with ids of their own.
    for (const id of [
      "conv-register-form",
      "conv-register-first",
      "conv-register-email",
      "conv-toolkit-form",
      "conv-toolkit-first",
      "conv-toolkit-email",
    ]) {
      await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
    }

    // Each field has a visible label that names it.
    for (const form of ["register", "toolkit"] as const) {
      const { root: formRoot } = formParts(page, form);
      await expect(
        formRoot.getByLabel(COPY.form.firstName, { exact: true }),
      ).toBeVisible();
      await expect(
        formRoot.getByLabel(COPY.form.email, { exact: true }),
      ).toBeVisible();
      await expect(
        formRoot.locator(`label[for="conv-${form}-email"]`),
      ).toBeVisible();
      await expect(formRoot).toContainText(COPY.form.consent);

      // The anti-spam field: out of the tab order, hidden from assistive
      // technology, and under a name no browser recognises. It must be a
      // CHECKBOX: as a hidden text box it was filled by a real visitor's
      // browser autofill (2026-11-14) and that visitor was refused.
      const trap = formRoot.locator(`input[name="${HONEYPOT_FIELD}"]`);
      await expect(trap).toHaveCount(1);
      await expect(trap).toHaveAttribute("type", "checkbox");
      await expect(trap).not.toBeChecked();
      await expect(formRoot.locator('input[type="text"]')).toHaveCount(1);
      await expect(trap).toHaveAttribute("tabindex", "-1");
      await expect(trap).toHaveAttribute("autocomplete", "off");
      await expect(trap).toHaveAttribute("aria-hidden", "true");
      await expect(trap).not.toBeInViewport();
    }

    expect(errors, "/conversation logged browser errors").toEqual([]);
  });

  test("PG-012 no horizontal scroll at 320px, and the controls are big enough to tap", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    await page.setViewportSize({ width: 320, height: 720 });
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-register-first");

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflows, "/conversation scrolls sideways at 320px").toBe(false);

    const controls: Locator[] = [
      page.getByRole("link", { name: COPY.hero.button, exact: true }).first(),
    ];
    for (const form of ["register", "toolkit"] as const) {
      const parts = formParts(page, form);
      controls.push(parts.firstName, parts.email, parts.submit);
    }
    for (const control of controls) {
      const box = await control.boundingBox();
      expect(box, "a control has no box").not.toBeNull();
      expect(
        box!.height,
        "a tap target is under 44px tall",
      ).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width, "a control runs off the screen").toBeLessThan(
        321,
      );
    }

    // Inputs are 16px, so iOS does not zoom the page on focus.
    const size = await formParts(page, "register").email.evaluate(
      (el) => getComputedStyle(el).fontSize,
    );
    expect(size).toBe("16px");
  });
});

test.describe("FM-011 — a visitor can save a seat", () => {
  test("FM-011 a missing or malformed email shows a message and sends nothing", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const signups = await interceptSignups(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-register-first");
    const form = formParts(page, "register");

    // Empty.
    await form.submit.click();
    await expect(form.emailError).toBeVisible();
    await expect(form.emailError).toHaveText(COPY.errors.invalidEmail);
    await expect(form.email).toHaveAttribute("aria-invalid", "true");
    await expect(form.email).toBeFocused();

    // Not an address. The first name that was typed is still there.
    await form.firstName.fill(PROBE_NAME);
    await form.email.fill("not-an-email");
    await form.email.press("Enter");
    await expect(form.emailError).toHaveText(COPY.errors.invalidEmail);
    await expect(form.firstName).toHaveValue(PROBE_NAME);
    await expect(form.email).toHaveValue("not-an-email");
    await expect(page.locator('[data-conv-done="register"]')).toHaveCount(0);

    expect(signups.posts, "an invalid form was sent to the server").toEqual([]);
  });

  test("FM-011 sending disables the button; a failure is honest; success shows the join and calendar links", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const signups = await interceptSignups(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-register-first");
    const form = formParts(page, "register");

    await form.firstName.fill(PROBE_NAME);
    await form.email.fill(PROBE_EMAIL);

    // 1. While the request is out, the button is disabled and says so.
    let release!: () => void;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    signups.next({
      status: 502,
      body: { error: COPY.errors.signUpFailed },
      hold,
    });
    await form.submit.click();
    await expect(form.submit).toBeDisabled();
    await expect(form.submit).toHaveText(COPY.form.sending);

    // 2. A failed sign-up is reported as one — never as a success — and the
    //    fields keep what was typed, so trying again is one click.
    release();
    await expect(form.formError).toBeVisible();
    await expect(form.formError).toHaveText(COPY.errors.signUpFailed);
    await expect(form.formError).toHaveAttribute("role", "alert");
    await expect(form.submit).toBeEnabled();
    await expect(form.submit).toHaveText(COPY.register.button);
    await expect(form.firstName).toHaveValue(PROBE_NAME);
    await expect(form.email).toHaveValue(PROBE_EMAIL);
    await expect(page.locator('[data-conv-done="register"]')).toHaveCount(0);

    // 3. A reply this app did not write is never shown to the visitor.
    signups.next({
      status: 502,
      body: { error: "Mailchimp says: member exists in list 0000" },
    });
    await form.submit.click();
    await expect(form.formError).toHaveText(COPY.errors.noAnswer);

    // 4. Success.
    signups.next({ status: 200, body: { ok: true, emailable: true } });
    await form.submit.click();

    const done = page.locator('[data-conv-done="register"]');
    await expect(done).toBeVisible();
    await expect(form.root).toHaveCount(0);
    await expect(
      done.getByRole("heading", { name: COPY.thankYou.heading }),
    ).toBeFocused();
    await expect(done).toContainText(COPY.thankYou.title);
    const when = inSast(state.startsAt);
    await expect(done).toContainText(
      `${when.weekday} ${when.date} · ${when.time} ${COPY.timeZoneLabel}`,
    );
    await expect(done).toContainText(COPY.thankYou.saveNow);
    await expect(done).toContainText(COPY.thankYou.inbox);
    await expect(done).not.toContainText(COPY.thankYou.notEmailable);

    // The join link is the site's own route. The Zoom address is not here.
    const join = done.getByRole("link", { name: COPY.thankYou.join });
    await expect(join).toHaveAttribute("href", "/conversation/join");
    await expect(
      done.getByRole("link", { name: COPY.thankYou.calendarFile, exact: true }),
    ).toHaveAttribute("href", "/conversation/calendar.ics");

    const google = done.getByRole("link", {
      name: COPY.thankYou.calendarGoogle,
    });
    const googleUrl = new URL((await google.getAttribute("href")) ?? "");
    expect(googleUrl.origin).toBe("https://calendar.google.com");
    expect(googleUrl.pathname).toBe("/calendar/render");
    expect(googleUrl.searchParams.get("text")).toBe(COPY.calendar.summary);
    const start = new Date(state.startsAt);
    expect(googleUrl.searchParams.get("dates")).toBe(
      `${utcStamp(start)}/${utcStamp(new Date(start.getTime() + 60 * 60_000))}`,
    );
    expect(googleUrl.searchParams.get("location")).toMatch(
      /\/conversation\/join$/,
    );
    await expect(google).toHaveAttribute("rel", /noopener/);
    expect(
      await done.innerHTML(),
      "the Zoom address is on the page",
    ).not.toMatch(/zoom\.us/i);

    // What the browser sent, each time: the FORM, never a tag.
    expect(signups.posts).toHaveLength(3);
    for (const post of signups.posts) {
      expect(post).toEqual({
        form: "register",
        firstName: PROBE_NAME,
        email: PROBE_EMAIL,
        [HONEYPOT_FIELD]: "",
      });
    }
    expect(signups.unscripted.count).toBe(0);
  });

  test("FM-011 an address that cannot be emailed is told so, with the links and no inbox line", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const signups = await interceptSignups(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-register-first");
    const form = formParts(page, "register");

    await form.email.fill(PROBE_EMAIL);
    signups.next({ status: 200, body: { ok: true, emailable: false } });
    await form.submit.click();

    const done = page.locator('[data-conv-done="register"]');
    await expect(done).toBeVisible();
    await expect(done).toContainText(COPY.thankYou.heading);
    await expect(done).toContainText(COPY.thankYou.notEmailable);
    await expect(done).not.toContainText(COPY.thankYou.inbox);
    await expect(done).not.toContainText(COPY.thankYou.saveNow);
    await expect(
      done.getByRole("link", { name: COPY.thankYou.join }),
    ).toHaveAttribute("href", "/conversation/join");
    await expect(
      done.getByRole("link", { name: COPY.thankYou.calendarFile, exact: true }),
    ).toBeVisible();
    await expect(
      done.getByRole("link", { name: COPY.thankYou.calendarGoogle }),
    ).toBeVisible();

    // The first name is optional: an empty one is sent as empty.
    expect(signups.posts).toEqual([
      {
        form: "register",
        firstName: "",
        email: PROBE_EMAIL,
        [HONEYPOT_FIELD]: "",
      },
    ]);
  });

  test("FM-011 the server's own refusals are shown word for word", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const signups = await interceptSignups(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-register-first");
    const form = formParts(page, "register");
    await form.email.fill(PROBE_EMAIL);

    const refusals: [number, string][] = [
      [400, COPY.errors.checkEmail],
      [429, COPY.errors.tooManyRequests],
      [503, COPY.errors.signUpFailed],
      [409, COPY.closed.text],
    ];
    for (const [status, message] of refusals) {
      signups.next({ status, body: { error: message } });
      await form.submit.click();
      await expect(form.formError, `HTTP ${status}`).toHaveText(message);
      await expect(form.submit).toBeEnabled();
    }

    // A 200 that is not the success shape is not a success either.
    signups.next({ status: 200, body: { success: true } });
    await form.submit.click();
    await expect(form.formError).toHaveText(COPY.errors.noAnswer);
    await expect(page.locator('[data-conv-done="register"]')).toHaveCount(0);
    await expect(form.email).toHaveValue(PROBE_EMAIL);
  });
});

test.describe("FM-012 — a visitor can ask for the Toolkit on the same page", () => {
  test("FM-012 validation, an honest failure, then the toolkit-sent state", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const signups = await interceptSignups(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-toolkit-first");
    const form = formParts(page, "toolkit");
    const register = formParts(page, "register");

    await expect(page.locator("main")).toContainText(COPY.toolkit.heading);
    await expect(page.locator("main")).toContainText(COPY.toolkit.blurb);

    // Client validation, on THIS form only.
    await form.email.fill("not-an-email");
    await form.submit.click();
    await expect(form.emailError).toHaveText(COPY.errors.invalidEmail);
    await expect(register.emailError).toHaveCount(0);
    expect(signups.posts).toEqual([]);

    // A failure is a failure, and the values stay.
    await form.firstName.fill(PROBE_NAME);
    await form.email.fill(PROBE_EMAIL);
    let release!: () => void;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    signups.next({
      status: 502,
      body: { error: COPY.errors.signUpFailed },
      hold,
    });
    await form.submit.click();
    await expect(form.submit).toBeDisabled();
    await expect(form.submit).toHaveText(COPY.form.sending);
    // The other form is not busy: the two do not share state.
    await expect(register.submit).toBeEnabled();
    release();
    await expect(form.formError).toHaveText(COPY.errors.signUpFailed);
    await expect(form.email).toHaveValue(PROBE_EMAIL);
    await expect(page.locator('[data-conv-done="toolkit"]')).toHaveCount(0);

    // Success.
    signups.next({ status: 200, body: { ok: true, emailable: true } });
    await form.submit.click();
    const done = page.locator('[data-conv-done="toolkit"]');
    await expect(done).toBeVisible();
    await expect(done).toContainText(COPY.toolkitSent.eyebrow);
    await expect(
      done.getByRole("heading", { name: COPY.toolkitSent.heading }),
    ).toBeFocused();
    await expect(done).toContainText(COPY.toolkitSent.body);
    await expect(done).toContainText(COPY.toolkitSent.lead);
    await expect(
      done.getByRole("link", { name: COPY.toolkitSent.link }),
    ).toHaveAttribute("href", "#register");

    // The register form is still there to be used.
    await expect(register.root).toBeVisible();

    // The browser named the FORM. It never names a tag.
    expect(signups.posts).toHaveLength(2);
    for (const post of signups.posts) {
      expect(post).toEqual({
        form: "toolkit",
        firstName: PROBE_NAME,
        email: PROBE_EMAIL,
        [HONEYPOT_FIELD]: "",
      });
    }
    expect(signups.unscripted.count).toBe(0);
  });

  test("FM-012 an address that cannot be emailed keeps the form and asks for another", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "open",
      `this deployment's funnel is ${state.funnel}; registration is not open`,
    );

    const signups = await interceptSignups(page);
    await open(page, "/conversation");
    await waitForHydration(page, "#conv-toolkit-first");
    const form = formParts(page, "toolkit");

    await form.email.fill(PROBE_EMAIL);
    signups.next({ status: 200, body: { ok: true, emailable: false } });
    await form.submit.click();

    await expect(form.formError).toHaveText(COPY.toolkitSent.notEmailable);
    await expect(page.locator('[data-conv-done="toolkit"]')).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(COPY.toolkitSent.body);
    await expect(form.root).toBeVisible();
    await expect(form.email).toHaveValue(PROBE_EMAIL);
    await expect(form.submit).toBeEnabled();
  });
});

test.describe("PG-013 — from the start, the page stops taking sign-ups and says so", () => {
  test("PG-013 the closed text and its links replace both forms", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel !== "closed",
      `this deployment's funnel is ${state.funnel}; registration has not closed`,
    );

    const errors = collectErrors(page);
    await open(page, "/conversation");

    const root = page.locator("[data-conv-state]");
    await expect(root).toHaveAttribute("data-conv-state", "closed");
    expect(
      new Date(
        (await root.getAttribute("data-conv-starts-at")) ?? "",
      ).getTime(),
      "closed means the start instant has passed",
    ).toBeLessThanOrEqual(Date.now());

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(COPY.hero.title);
    await expect(
      page.getByRole("heading", { name: COPY.closed.text }),
    ).toBeVisible();

    // No form, no field, and no button that leads to one.
    await expect(page.locator("main form")).toHaveCount(0);
    await expect(page.locator("main input")).toHaveCount(0);
    await expect(
      page.locator("main").getByText(COPY.hero.button, { exact: true }),
    ).toHaveCount(0);

    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: COPY.closed.toolkitLink }),
    ).toHaveAttribute("href", "/tools");

    // The replay link appears only once a replay address is set.
    const replayLink = main.getByRole("link", {
      name: COPY.closed.replayLink,
    });
    if (state.replay === "available") {
      await expect(replayLink).toHaveAttribute("href", "/conversation/replay");
    } else {
      await expect(replayLink).toHaveCount(0);
    }

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflows, "/conversation scrolls sideways").toBe(false);
    expect(errors, "/conversation logged browser errors").toEqual([]);
  });
});

test.describe("PG-015 — the replay page shows the right thing for the moment", () => {
  test("PG-015 coming soon, the replay link, the offer or its end — by state", async ({
    page,
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel === "dormant",
      "this deployment's funnel is dormant; the replay page does not exist",
    );

    const errors = collectErrors(page);
    await open(page, "/conversation/replay");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(COPY.replay.title);
    await expect(page).toHaveTitle(`${COPY.meta.replayTitle} · ${COPY.brand}`);

    const root = page.locator("[data-conv-state]");
    const replay = await root.getAttribute("data-conv-replay");
    const offer = await root.getAttribute("data-conv-offer");
    const offerEndsAt = await root.getAttribute("data-conv-offer-ends-at");
    expect(["pending", "available"]).toContain(replay);
    expect(["none", "open", "ended"]).toContain(offer);

    const main = page.locator("main");
    const recording = main.getByRole("link", {
      name: COPY.replay.available.link,
    });
    const offerHeading = main.getByRole("heading", {
      name: COPY.replay.offer.heading,
    });
    const codeLine = main.getByText(/Use code .+ at checkout\./);

    if (replay === "pending") {
      // Coming soon: no recording link, and no offer to put under it.
      await expect(main).toContainText(COPY.replay.comingSoon.eyebrow);
      await expect(main).toContainText(COPY.replay.comingSoon.body);
      await expect(
        main.getByRole("link", { name: COPY.replay.comingSoon.link }),
      ).toHaveAttribute("href", "/practice");
      await expect(recording).toHaveCount(0);
      await expect(offerHeading).toHaveCount(0);
      expect(offer).toBe("none");
    } else {
      await expect(main).toContainText(COPY.replay.available.intro);
      // A link — never a redirect — to an https address, in a new tab that
      // cannot reach back into this one.
      await expect(recording).toHaveAttribute("href", /^https:\/\//);
      await expect(recording).toHaveAttribute("target", "_blank");
      await expect(recording).toHaveAttribute("rel", /noopener/);
      await expect(recording).toHaveAttribute("rel", /noreferrer/);
    }

    if (offer === "open") {
      await expect(offerHeading).toBeVisible();
      await expect(main).toContainText(COPY.replay.offer.course);
      for (const fact of COPY.replay.offer.facts) {
        await expect(main).toContainText(fact);
      }
      await expect(main).toContainText(COPY.replay.offer.price);

      // The deadline is rendered from the configured instant, in SAST.
      const ends = inSast(offerEndsAt ?? "");
      await expect(main).toContainText(
        `The offer closes ${ends.weekday} ${ends.date} at ${ends.time} ${COPY.timeZoneLabel}.`,
      );
      await expect(
        main.getByRole("link", { name: COPY.replay.offer.button }),
      ).toHaveAttribute("href", "/learn/course");

      // The code line is there exactly when a code is set, and is then whole.
      // The page says only WHETHER one is set (never the code itself), so a
      // missing line cannot pass unnoticed.
      const codeState = await root.getAttribute("data-conv-offer-code");
      expect(["set", "unset"]).toContain(codeState);
      if (codeState === "set") {
        await expect(codeLine).toHaveCount(1);
        await expect(codeLine).toHaveText(
          /^Use code [A-Za-z0-9-]{3,40} at checkout\.$/,
        );
      } else {
        await expect(codeLine).toHaveCount(0);
      }
    } else {
      await expect(offerHeading).toHaveCount(0);
      await expect(codeLine).toHaveCount(0);
      await expect(main).not.toContainText("The offer closes");
    }

    if (offer === "ended") {
      await expect(main).toContainText(COPY.replay.offerEnded.text);
      await expect(
        main.getByRole("link", { name: COPY.replay.offerEnded.link }),
      ).toHaveAttribute("href", "/learn/course");
    } else {
      await expect(main).not.toContainText(COPY.replay.offerEnded.text);
    }

    const text = await main.innerText();
    expect(text, "an unfilled {token} reached the page").not.toMatch(
      /\{[a-z ]+\}/,
    );
    expect(text, "a [placeholder] reached the page").not.toMatch(/\[[^\]]*\]/);
    expect(await page.content(), "the Zoom address is in the page").not.toMatch(
      /zoom\.us/i,
    );

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflows, "/conversation/replay scrolls sideways").toBe(false);
    expect(errors, "/conversation/replay logged browser errors").toEqual([]);
  });
});

test.describe("IN-008 — the webinar as a calendar file", () => {
  test("IN-008 /conversation/calendar.ics is a valid event that points at the join route", async ({
    api,
  }) => {
    const state = await readState(api);
    test.skip(
      state.funnel === "dormant",
      "this deployment's funnel is dormant; the calendar file does not exist",
    );

    const response = await api.get("/conversation/calendar.ics", {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["content-type"]).toMatch(/^text\/calendar\b/);
    // Every header value is plain ASCII (an em-dash here once answered 500).
    expect(headers["content-disposition"]).toMatch(
      /^attachment; filename="[A-Za-z0-9-]+\.ics"$/,
    );

    const body = await response.text();
    expect(body.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(body.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(body.replace(/\r\n/g, ""), "a bare CR or LF").not.toMatch(/[\r\n]/);

    // Unfold, then read the properties.
    const lines = body.replace(/\r\n /g, "").split("\r\n");
    const value = (name: string) =>
      lines.find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1);
    const start = new Date(state.startsAt);
    expect(value("DTSTART")).toBe(utcStamp(start));
    expect(value("DTEND")).toBe(
      utcStamp(new Date(start.getTime() + 60 * 60_000)),
    );
    expect(value("LOCATION")).toMatch(/\/conversation\/join$/);
    expect(value("URL")).toMatch(/\/conversation\/join$/);
    expect(body, "the Zoom address is in the calendar file").not.toMatch(
      /zoom\.us/i,
    );
  });
});

/**
 * VISUAL EVIDENCE (QA-CHECKLIST Part 2). Saved into the test's own output
 * folder, so on the "E2E — Preview" run the files arrive in the test-results
 * artifact — the only run that can reach a protected Preview.
 *
 * One test per width, in ONE project: each sets its own viewport, so a second
 * profile would only save the same pictures twice.
 *
 * NO EMAIL ADDRESS IS EVER IN A PICTURE. Wherever the email field holds one,
 * the capture draws its characters as dots.
 */
const WIDTHS = [320, 768, 1440] as const;
const HIDE_ADDRESS =
  'input[type="email"] { -webkit-text-security: disc !important; }';

test.describe("S6.1 evidence — screenshots at 320 / 768 / 1440", () => {
  for (const width of WIDTHS) {
    test(`S6.1 evidence at ${width}px — /conversation and /conversation/replay, by state`, async ({
      page,
      api,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "desktop-chromium",
        "each capture sets its own viewport; one project is enough",
      );
      const state = await readState(api);
      test.skip(
        state.funnel === "dormant",
        "this deployment's funnel is dormant; there is no page to capture",
      );

      const file = (pageName: string, name: string) =>
        testInfo.outputPath(`S6.1-${pageName}-${width}-${name}.png`);

      await page.setViewportSize({ width, height: 900 });
      const signups = await interceptSignups(page);
      await open(page, "/conversation");
      await page.evaluate(() => document.fonts.ready);

      if (state.funnel === "closed") {
        await page.screenshot({
          path: file("conversation", "closed"),
          fullPage: true,
        });
      } else {
        await waitForHydration(page, "#conv-register-first");
        const form = formParts(page, "register");
        const section = page.locator("#register");

        // default
        await page.screenshot({
          path: file("conversation", "default"),
          fullPage: true,
        });

        // focus-visible — reached with the keyboard, as a keyboard user would.
        await form.firstName.focus();
        await page.keyboard.press("Tab");
        await expect(form.email).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(form.submit).toBeFocused();
        await section.screenshot({
          path: file("conversation", "focus-visible"),
        });

        // loading — the button is disabled while the request is out.
        await form.firstName.fill(PROBE_NAME);
        await form.email.fill(PROBE_EMAIL);
        let release!: () => void;
        const hold = new Promise<void>((resolve) => {
          release = resolve;
        });
        signups.next({
          status: 502,
          body: { error: COPY.errors.signUpFailed },
          hold,
        });
        await form.submit.click();
        // The pointer is parked off the page after each click, so no capture
        // shows a hover colour that a still picture cannot explain.
        await page.mouse.move(0, 0);
        await expect(form.submit).toBeDisabled();
        await section.screenshot({
          path: file("conversation", "loading"),
          style: HIDE_ADDRESS,
        });

        // error
        release();
        await expect(form.formError).toBeVisible();
        await section.screenshot({
          path: file("conversation", "error"),
          style: HIDE_ADDRESS,
        });

        // thank-you
        signups.next({ status: 200, body: { ok: true, emailable: true } });
        await form.submit.click();
        await page.mouse.move(0, 0);
        await expect(page.locator('[data-conv-done="register"]')).toBeVisible();
        await section.screenshot({ path: file("conversation", "thank-you") });

        // toolkit-sent — the second form's own ending. The whole section is
        // captured, so the sticky header cannot sit over its first line.
        const toolkit = formParts(page, "toolkit");
        await toolkit.email.fill(PROBE_EMAIL);
        signups.next({ status: 200, body: { ok: true, emailable: true } });
        await toolkit.submit.click();
        await page.mouse.move(0, 0);
        const sent = page.locator('[data-conv-done="toolkit"]');
        await expect(sent).toBeVisible();
        await page
          .locator("section", { has: sent })
          .screenshot({ path: file("conversation", "toolkit-sent") });
      }

      // The replay page, named for what it is showing.
      await open(page, "/conversation/replay");
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator("[data-conv-state]");
      const replay = await root.getAttribute("data-conv-replay");
      const offer = await root.getAttribute("data-conv-offer");
      const name =
        replay === "pending"
          ? "coming-soon"
          : offer === "open"
            ? "offer-open"
            : offer === "ended"
              ? "offer-ended"
              : "available";
      await page.screenshot({ path: file("replay", name), fullPage: true });

      expect(signups.unscripted.count).toBe(0);
    });
  }
});
