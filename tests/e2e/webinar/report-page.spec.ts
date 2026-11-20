import { randomBytes } from "node:crypto";
import type {
  APIRequestContext,
  APIResponse,
  BrowserContext,
  Page,
} from "@playwright/test";
import { test, expect } from "../fixtures";
import { REPORT_COPY } from "../../../src/app/report/copy";
import { SOURCE_KEYS, type SourceKey } from "../../../src/lib/webinar/sources";
import { guarded } from "./request-guard";

/**
 * Sprint S6.2 — /report, the owner's webinar report, over HTTP and in a real
 * browser. Draft FEATURE-LIST lines (the owner approves them at Gate B):
 * PG-016 (the page and its password gate — off, locked, open), FM-013 (the
 * two boxes — save, validation, refusal from another site), PR-011 (a burst
 * of wrong passwords is refused, failing closed), and the end-to-end halves
 * of PR-010 and IN-009 (one real visit is stored once, under its source; a
 * robot's is not stored at all).
 *
 * DENIED FIRST, AND ALWAYS. Everything a stranger can try — no cookie, a
 * forged cookie, a wrong password, a save with no session — runs on every
 * deployment, with or without the test password. It is state-aware like the
 * webinar specs: a deployment without REPORT_PASSWORD and REPORT_SECRET shows
 * the "not switched on" line, and the locked checks then skip, visibly.
 *
 * ALLOWED ONLY WITH E2E_REPORT_PASSWORD. The signed-in half needs the
 * deployment's test password, which only the "E2E — Preview" workflow holds
 * (a repository secret), or a local shell that sets it for one run. Without
 * it those tests SKIP, visibly. A skip is not a pass: the run that counts as
 * evidence is the one whose report shows they ran. With it, a deployment
 * whose report is switched off is a FAILURE, not a skip — the secret says the
 * report is meant to be on.
 *
 * THE PASSWORD AND THE SESSION ARE NEVER PRINTED.
 *   • Neither reaches an `expect`: each is reduced to true/false first.
 *   • Neither reaches a step title: the browser's password box is filled by a
 *     script, because Playwright titles a `fill` with the text it typed.
 *   • Neither reaches an error. When one of Playwright's own requests fails —
 *     a timeout, a dropped connection, the test running out of time — its
 *     message lists every request and response header, the session cookie
 *     and the deployment's bypass header among them, and that message is
 *     printed and written to error-context.md, which the "E2E — Preview"
 *     workflow uploads. Every request here goes through `guarded()`
 *     (./request-guard.ts), which replaces such an error with its name.
 *     (Found on a local run on 2026-11-20, with a throwaway value; Known
 *     issue 69.)
 *   • No trace is recorded by this file, and a screenshot shows the password
 *     box as dots.
 *
 * SERIAL, AND DESKTOP ONLY. The tests share three rate-limit buckets keyed on
 * the caller's address — the sign-in's (10 in ten minutes), the save's (30 in
 * ten minutes) and the visit counter's (60 a minute) — and a second browser
 * profile would put a second sequence into the same counters, as
 * tests/e2e/abuse/ explains. The pages are captured at three widths by
 * resizing the window, so the second profile would add nothing.
 *
 * WHAT IT WRITES — only with the test password: ONE visit, under "other", and
 * the owner's two boxes, which are put back exactly as they were by a hook
 * that runs even when a test fails or runs out of time. No spec sends a valid
 * sign-up (D-22).
 *
 * FEW PAGE LOADS. A dev server can take seconds for one browser page load
 * (each load is one more chance of a slow one), and a plain request for the
 * same page a fraction of a second. So what needs a browser — the sign-in
 * form, the save form, the cookie as a browser keeps it, layout — is checked
 * in the browser, and what the server rendered is read from its HTML.
 *
 * TIME. Every test here is a short, fixed sequence of requests, and runs in
 * the project's default time. Three get more, each for a stated reason: the
 * one real visit (it may wait out one Retry-After), the boxes (about
 * seventeen requests in a row) and the burst (it may wait for a fresh
 * limiter window). A longer time is never a fix for a slow step
 * (docs/ENVIRONMENT-PARITY.md §6 C4).
 *
 * THE BURST IS LAST. It leaves this caller's sign-in limited until the
 * limiter's ten-minute window ends, so a second run from the same address
 * inside that window is refused (?e=busy) at its first sign-in.
 */

test.describe.configure({ mode: "serial" });

// No trace, ever: a trace records request bodies and cookies, and here those
// hold the test password and the session.
test.use({ trace: "off" });

test.beforeEach(() => {
  test.skip(
    test.info().project.name !== "desktop-chromium",
    "the report spec runs in the desktop project only: it shares the report's rate-limit buckets and sets its own viewports",
  );
});

/** Typed out, not imported: a renamed cookie must turn this file red. */
const COOKIE = "ur_report";
/** Every attribute the session cookie carries, lower-cased and sorted. */
const COOKIE_ATTRIBUTES = [
  "httponly",
  "max-age=2592000", // 30 days
  "path=/report",
  "samesite=lax",
  "secure",
];
/** Obviously not the password, on any deployment. */
const WRONG_PASSWORD = "s62-e2e-not-the-report-password";
/** An ordinary desktop browser: the visit route stores nothing for a robot. */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
/** A link-preview robot: answered 204, stored nowhere. */
const ROBOT_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const FOREIGN_ORIGIN = "https://evil.example";
/** The root layout's title template: "%s · (Un)Retire". */
const BRAND = "(Un)Retire";
const WIDTHS = [320, 768, 1440] as const;

const OFF_SKIP =
  "this deployment's report is switched off (REPORT_PASSWORD or REPORT_SECRET is not set); the locked checks do not apply";
const NO_PASSWORD =
  "E2E_REPORT_PASSWORD is not set, so the signed-in half of the report is not exercised by this run";

function getPage(
  api: APIRequestContext,
  route: string,
  headers: Record<string, string> = {},
): Promise<APIResponse> {
  return guarded(`GET ${route}`, () =>
    api.get(route, { headers, failOnStatusCode: false }),
  );
}

function attribute(html: string, name: string): string {
  return html.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "";
}

/** True when a document carries any of the report's numbers. */
function hasNumbers(html: string): boolean {
  return html.includes("data-report-card") || html.includes("data-report-row");
}

/** Text as React writes it into HTML (an apostrophe becomes &#x27;). */
function asHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * The page root's own markup when it holds no section of its own (the off
 * and locked states) — without the shell around it, and without the router
 * data, which repeats the address's query string.
 */
function lockedRoot(html: string): string {
  return (
    html.match(
      /<section\b[^>]*\bdata-report-state="[^"]*"[^>]*>([\s\S]*?)<\/section>/,
    )?.[1] ?? ""
  );
}

/** The text of every role="alert" paragraph, as HTML. */
function alertsIn(html: string): string[] {
  return [...html.matchAll(/<p\b[^>]*\brole="alert"[^>]*>([^<]*)<\/p>/g)].map(
    (match) => match[1]!,
  );
}

/** A server-rendered input's whole tag. */
function inputTag(html: string, id: string): string {
  const tag = html.match(new RegExp(`<input\\b[^>]*\\bid="${id}"[^>]*>`));
  expect(tag, `#${id} is not on the page`).not.toBeNull();
  return tag![0];
}

/** The value a server-rendered input starts with. */
function inputValue(html: string, id: string): string {
  return inputTag(html, id).match(/\bvalue="([^"]*)"/)?.[1] ?? "";
}

/** The text of the paragraph with this id, as HTML, or null. */
function paragraph(html: string, id: string): string | null {
  return (
    html.match(new RegExp(`<p\\b[^>]*\\bid="${id}"[^>]*>([^<]*)</p>`))?.[1] ??
    null
  );
}

/** What a card shows under its label, as HTML, or null. */
function cardValue(html: string, name: string): string | null {
  const card = html.match(
    new RegExp(
      `<li\\b[^>]*\\bdata-report-card="${name}"[^>]*>([\\s\\S]*?)</li>`,
    ),
  )?.[1];
  if (card === undefined) return null;
  return [...card.matchAll(/<p\b[^>]*>([^<]*)<\/p>/g)][1]?.[1] ?? null;
}

type Redirect = {
  status: number;
  location: string | null;
  setsCookie: boolean;
  cacheControl: string | null;
};

/** A 303 reduced to what may be printed — never a cookie's value. */
function redirectOf(response: APIResponse): Redirect {
  const headers = response.headers();
  return {
    status: response.status(),
    location: headers["location"] ?? null,
    setsCookie: response
      .headersArray()
      .some((header) => header.name.toLowerCase() === "set-cookie"),
    cacheControl: headers["cache-control"] ?? null,
  };
}

/** What every refusal and every save answers: a relative 303, not cached. */
function seeOther(location: string): Redirect {
  return { status: 303, location, setsCookie: false, cacheControl: "no-store" };
}

type ReportState = "off" | "locked";

/**
 * The report's state with no cookie at all — so never "open". Asked over
 * HTTP with the bypass-bearing `api` fixture; a 401 means the bypass did not
 * arrive and is never mistaken for a state.
 */
async function readReportState(api: APIRequestContext): Promise<ReportState> {
  const response = await getPage(api, "/report");
  expect(
    response.status(),
    "/report must answer 200 — on a protected Preview a 401 means the bypass header did not reach the deployment",
  ).toBe(200);
  const state = attribute(await response.text(), "data-report-state");
  expect(
    ["off", "locked"],
    "with no cookie, /report must be off or locked — never open",
  ).toContain(state);
  return state as ReportState;
}

type Funnel = { state: "dormant" | "open" | "closed"; startsAt: string };

/** The webinar funnel's state, as tests/e2e/webinar/conversation-page.spec.ts reads it. */
async function readFunnel(api: APIRequestContext): Promise<Funnel> {
  const response = await getPage(api, "/conversation");
  if (response.status() === 404) return { state: "dormant", startsAt: "" };
  expect(
    response.status(),
    "/conversation answered neither 200 nor 404 — on a protected Preview a 401 means the bypass header did not arrive",
  ).toBe(200);
  const html = await response.text();
  const state = attribute(html, "data-conv-state");
  expect(["open", "closed"]).toContain(state);
  return {
    state: state as "open" | "closed",
    startsAt: attribute(html, "data-conv-starts-at"),
  };
}

/** The test password, or a visible skip. */
function testPassword(): string {
  const value = process.env.E2E_REPORT_PASSWORD ?? "";
  test.skip(value === "", NO_PASSWORD);
  return value;
}

/**
 * The session the sign-in test received, held in memory for the tests after
 * it (serial mode runs them in order, in one worker). Never printed.
 */
let session: string | null = null;

function requireSession(): string {
  if (session === null) {
    throw new Error(
      "No session: the sign-in test must run, and pass, before this one.",
    );
  }
  return session;
}

function sessionCookie(): string {
  return `${COOKIE}=${requireSession()}`;
}

/** Give the browser the session, exactly as the sign-in route sets it. */
async function addSession(
  context: BrowserContext,
  baseURL: string | undefined,
): Promise<void> {
  await context.addCookies([
    {
      name: COOKIE,
      value: requireSession(),
      domain: new URL(baseURL ?? "").hostname,
      path: "/report",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
}

function ownOrigin(baseURL: string | undefined): string {
  return new URL(baseURL ?? "").origin;
}

function signIn(api: APIRequestContext, password: string) {
  return guarded("POST /report/login", () =>
    api.post("/report/login", {
      form: { password },
      maxRedirects: 0,
      failOnStatusCode: false,
    }),
  );
}

type Boxes = { countFrom: string; showedUp: string };

function save(
  api: APIRequestContext,
  boxes: Boxes,
  headers: Record<string, string>,
) {
  return guarded("POST /report/save", () =>
    api.post("/report/save", {
      form: { countFrom: boxes.countFrom, showedUp: boxes.showedUp },
      headers,
      maxRedirects: 0,
      failOnStatusCode: false,
    }),
  );
}

function sendVisit(api: APIRequestContext, userAgent: string) {
  return guarded("POST /api/conversation/arrival", () =>
    api.post("/api/conversation/arrival", {
      data: { source: "other" },
      headers: { "User-Agent": userAgent },
      failOnStatusCode: false,
    }),
  );
}

/** A signed-in page's HTML, which must be the open report. */
async function signedInHtml(
  api: APIRequestContext,
  route: string,
): Promise<string> {
  const response = await getPage(api, route, { cookie: sessionCookie() });
  expect(response.status(), route).toBe(200);
  const html = await response.text();
  expect(attribute(html, "data-report-state"), route).toBe("open");
  return html;
}

/** The two boxes as the server shows them now. */
async function boxesNow(api: APIRequestContext): Promise<Boxes> {
  const html = await signedInHtml(api, "/report");
  return {
    countFrom: inputValue(html, "report-count-from"),
    showedUp: inputValue(html, "report-showed-up"),
  };
}

/**
 * What the boxes must be put back to, while a test has them changed. The hook
 * below puts them back after the test. Playwright runs it even when the test
 * failed or ran out of time, while the request context is still open — which
 * a `finally` inside the test cannot promise: on a timeout, the context is
 * already being closed when the test's own code resumes.
 */
let restoreTo: Boxes | null = null;

test.afterEach(async ({ api, baseURL }) => {
  if (restoreTo === null) return;
  const wanted = restoreTo;
  restoreTo = null;
  const now = await boxesNow(api);
  if (now.countFrom === wanted.countFrom && now.showedUp === wanted.showedUp) {
    return;
  }
  expect(
    redirectOf(
      await save(api, wanted, {
        cookie: sessionCookie(),
        origin: ownOrigin(baseURL),
      }),
    ),
    "the boxes could not be put back",
  ).toEqual(seeOther("/report?saved=1"));
  expect(await boxesNow(api), "the boxes were not put back").toEqual(wanted);
});

/**
 * Open a page and say plainly if the document itself did not arrive.
 *
 * `read` waits for the document only, not for every script and font: enough
 * for what the server rendered, and on a dev server seconds faster per page.
 */
async function open(
  page: Page,
  route: string,
  until: "load" | "read" = "load",
): Promise<void> {
  const response = await page.goto(route, {
    waitUntil: until === "read" ? "domcontentloaded" : "load",
  });
  expect(
    response?.status(),
    `${route} did not load — on a protected Preview a 401 here means the ` +
      "bypass header did not reach the document",
  ).toBe(200);
}

/**
 * Browser errors, minus the one that is not this page's: outside a Vercel
 * deployment the analytics component asks va.vercel-scripts.com for its
 * debug script and the site's own CSP refuses it (see conversation-page.spec.ts).
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

/** Every 303 the browser met on one path, reduced to status and Location. */
function watchRedirects(page: Page, pathname: string) {
  const seen: { status: number; location: string | null }[] = [];
  page.on("response", (response) => {
    if (new URL(response.url()).pathname !== pathname) return;
    seen.push({
      status: response.status(),
      location: response.headers()["location"] ?? null,
    });
  });
  return seen;
}

function reportRoot(page: Page) {
  return page.locator("[data-report-state]");
}

/** The page root carries its state and no other data. */
async function rootData(page: Page): Promise<string[]> {
  return reportRoot(page).evaluate((el) =>
    Object.keys((el as HTMLElement).dataset),
  );
}

/**
 * Let the web fonts finish before a capture, but never wait on them for long:
 * the picture is evidence, not a check. (Seen once on a local dev server:
 * document.fonts.ready had not settled after a minute, and the next run was
 * fine — so it is bounded, not trusted.)
 */
async function settleFonts(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => undefined),
      new Promise<undefined>((resolve) => setTimeout(resolve, 5_000)),
    ]),
  );
}

async function scrollsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
}

async function readBoxes(page: Page): Promise<Boxes> {
  return {
    countFrom: await page.locator("#report-count-from").inputValue(),
    showedUp: await page.locator("#report-showed-up").inputValue(),
  };
}

/** A count as the page prints it: whole, grouped the en-GB way ("1,234"). */
function count(text: string): number {
  const trimmed = text.trim();
  expect(trimmed, "a count must be a whole en-GB number").toMatch(
    /^\d{1,3}(,\d{3})*$/,
  );
  return Number(trimmed.replace(/,/g, ""));
}

type Pair = { visits: number; registered: number };
type Numbers = {
  rows: Record<SourceKey, Pair>;
  total: Pair;
  cards: { visits: number; registered: number; showedUp: string };
};

async function readPair(page: Page, row: string): Promise<Pair> {
  const cells = page.locator(`[data-report-row="${row}"] td`);
  await expect(cells).toHaveCount(2);
  return {
    visits: count(await cells.nth(0).innerText()),
    registered: count(await cells.nth(1).innerText()),
  };
}

/** Every number on the open report: the eight rows, the total, the cards. */
async function readNumbers(page: Page): Promise<Numbers> {
  const rows = {} as Record<SourceKey, Pair>;
  for (const key of SOURCE_KEYS) rows[key] = await readPair(page, key);
  const card = (name: string) =>
    page.locator(`[data-report-card="${name}"] p`).nth(1);
  return {
    rows,
    total: await readPair(page, "total"),
    cards: {
      visits: count(await card("visits").innerText()),
      registered: count(await card("registered").innerText()),
      showedUp: (await card("showed-up").innerText()).trim(),
    },
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
 * {weekday} and {date} of an instant, worked out HERE and not with the app's
 * formatter: South African Standard Time is UTC+2 all year.
 */
function webinarLine(iso: string): string {
  const local = new Date(new Date(iso).getTime() + 2 * 60 * 60 * 1000);
  return REPORT_COPY.header.webinar
    .replace("{weekday}", WEEKDAYS[local.getUTCDay()]!)
    .replace("{date}", `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]!}`);
}

/** The line under the title for a saved "Counting from" day (or none). */
function countingLine(countFrom: string): string {
  if (countFrom === "") return REPORT_COPY.header.countingFromStart;
  const day = new Date(`${countFrom}T00:00:00Z`);
  return REPORT_COPY.header.countingFrom.replace(
    "{count from}",
    `${WEEKDAYS[day.getUTCDay()]!} ${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]!}`,
  );
}

/** Today in Johannesburg, "YYYY-MM-DD" — the zone the report counts from. */
function todayInSast(): string {
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Seconds left in the limiter's current window. Its windows are FIXED, cut
 * at multiples of the window length (src/lib/rate-limit.ts), so a burst that
 * straddled a boundary would be counted in two windows.
 */
function secondsLeftInWindow(windowSeconds: number): number {
  const size = windowSeconds * 1000;
  const now = Date.now();
  return (Math.floor(now / size) * size + size - now) / 1000;
}

test.describe("PG-016 — denied: what anyone without the password sees and can do", () => {
  test("PG-016 off: with the report switched off, one line — no form, no number", async ({
    page,
    api,
    baseURL,
  }) => {
    const state = await readReportState(api);
    test.skip(
      state !== "off",
      "this deployment's report is switched on; the off checks do not apply",
    );

    await open(page, "/report");
    const root = reportRoot(page);
    await expect(root).toHaveAttribute("data-report-state", "off");
    expect(await rootData(page)).toEqual(["reportState"]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(REPORT_COPY.header.title);
    await expect(root).toContainText(REPORT_COPY.messages.off);
    await expect(root.locator("form, input")).toHaveCount(0);
    await expect(
      page.locator("[data-report-card], [data-report-row]"),
    ).toHaveCount(0);
    expect(await root.innerText(), "a number on the off page").not.toMatch(
      /\d/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );

    // Neither route does any work while the report is off.
    expect(redirectOf(await signIn(api, WRONG_PASSWORD))).toEqual(
      seeOther("/report"),
    );
    expect(
      redirectOf(
        await save(
          api,
          { countFrom: "", showedUp: "1" },
          { origin: ownOrigin(baseURL) },
        ),
      ),
    ).toEqual(seeOther("/report"));
  });

  test("PG-016 locked: without a session, only the password form — no number, not indexed", async ({
    page,
    api,
  }) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);

    // Over HTTP: no number anywhere in the document, not even out of sight.
    const response = await getPage(api, "/report");
    expect(response.status()).toBe(200);
    expect(
      hasNumbers(await response.text()),
      "the locked document carries the report's numbers",
    ).toBe(false);

    // In the browser.
    const errors = collectErrors(page);
    await open(page, "/report");
    const root = reportRoot(page);
    await expect(root).toHaveCount(1);
    await expect(root).toHaveAttribute("data-report-state", "locked");
    expect(await rootData(page)).toEqual(["reportState"]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(REPORT_COPY.header.title);
    await expect(page).toHaveTitle(`${REPORT_COPY.meta.title} · ${BRAND}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(root).toContainText(REPORT_COPY.login.intro);

    // One form, posting the one field to the sign-in route.
    const form = root.locator("form");
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("action", "/report/login");
    await expect(form).toHaveAttribute("method", "post");
    const password = form.getByLabel("Password", { exact: true });
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute("type", "password");
    await expect(password).toHaveAttribute("name", "password");
    await expect(root.locator("input")).toHaveCount(1);
    await expect(
      form.getByRole("button", { name: REPORT_COPY.login.button, exact: true }),
    ).toBeVisible();

    // No number, and no message nobody asked for.
    await expect(
      page.locator("[data-report-card], [data-report-row]"),
    ).toHaveCount(0);
    expect(await root.innerText(), "a number on the locked page").not.toMatch(
      /\d/,
    );
    await expect(root.getByRole("alert")).toHaveCount(0);
    expect(errors, "/report logged browser errors").toEqual([]);
  });

  test("PG-016 locked: a forged session cookie is still only the password form", async ({
    page,
    api,
    baseURL,
  }) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);

    // Empty, junk, the right SHAPE (43 base64url characters), and too long.
    const forgeries = [
      "",
      "forged",
      randomBytes(32).toString("base64url"),
      "A".repeat(43),
      "x".repeat(1000),
    ];
    for (const [index, forged] of forgeries.entries()) {
      const response = await getPage(api, "/report", {
        cookie: `${COOKIE}=${forged}`,
      });
      expect(response.status(), `forgery #${index}`).toBe(200);
      const html = await response.text();
      expect(attribute(html, "data-report-state"), `forgery #${index}`).toBe(
        "locked",
      );
      expect(hasNumbers(html), `forgery #${index} showed numbers`).toBe(false);
    }

    // And in the browser, with the cookie set exactly as the real one is.
    await page.context().addCookies([
      {
        name: COOKIE,
        value: randomBytes(32).toString("base64url"),
        domain: new URL(baseURL ?? "").hostname,
        path: "/report",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    ]);
    await open(page, "/report", "read");
    await expect(reportRoot(page)).toHaveAttribute(
      "data-report-state",
      "locked",
    );
    await expect(
      page.locator("[data-report-card], [data-report-row]"),
    ).toHaveCount(0);
  });

  test("PR-011 a wrong password is refused: 303 to exactly /report?e=wrong, and no cookie", async ({
    api,
  }) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);

    const response = await signIn(api, WRONG_PASSWORD);
    expect(
      redirectOf(response),
      "a Location of /report?e=busy here means this caller's sign-in is still limited " +
        "by a burst inside the same ten-minute window (the last test of an earlier run)",
    ).toEqual(seeOther("/report?e=wrong"));
    expect(await response.text(), "a refusal has no body").toBe("");
  });

  test("PG-016 locked: ?e=wrong shows the approved sentence; an unknown ?e= shows nothing", async ({
    page,
    api,
  }) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);
    const root = reportRoot(page);

    // In the browser: the wrong-password sentence, word for word, read out
    // as an alert under the form.
    await open(page, "/report?e=wrong", "read");
    await expect(root).toHaveAttribute("data-report-state", "locked");
    await expect(root.getByRole("alert")).toHaveText(
      REPORT_COPY.messages.wrong,
    );

    // The other two sentences the password form can show, from the server's
    // markup.
    for (const code of ["busy", "error"] as const) {
      const response = await getPage(api, `/report?e=${code}`);
      expect(response.status(), `?e=${code}`).toBe(200);
      const markup = lockedRoot(await response.text());
      expect(markup, `?e=${code}: no password form`).toContain(
        'action="/report/login"',
      );
      expect(alertsIn(markup), `?e=${code}`).toEqual([
        asHtml(REPORT_COPY.messages[code]),
      ]);
    }

    // Anything else adds nothing — an unknown code, markup, and the codes
    // that belong to the open page — and what was typed is never echoed.
    // Read from the server's own markup, which also covers what is hidden.
    const sentences = Object.values(REPORT_COPY.messages);
    for (const code of [
      "S62-unknown-code",
      "<b>S62-markup</b>",
      "date",
      "number",
      "save",
    ]) {
      const response = await getPage(
        api,
        `/report?e=${encodeURIComponent(code)}`,
      );
      expect(response.status(), `?e=${code}`).toBe(200);
      const html = await response.text();
      expect(attribute(html, "data-report-state"), `?e=${code}`).toBe("locked");
      const markup = lockedRoot(html);
      expect(markup, `?e=${code}: no password form`).toContain(
        'action="/report/login"',
      );
      expect(alertsIn(markup), `?e=${code} showed a message`).toEqual([]);
      for (const sentence of sentences) {
        expect(markup, `?e=${code} showed a message`).not.toContain(
          asHtml(sentence),
        );
      }
      expect(markup, `?e=${code} was echoed`).not.toContain("S62-");
    }
  });

  test("FM-013 a save without a session goes back to /report and sets nothing", async ({
    api,
    baseURL,
  }) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);

    // The number is not a number on purpose. If the session check were
    // missing, the route would answer ?e=number instead — and nothing could
    // be written either way.
    const boxes = { countFrom: "", showedUp: "not-a-number" };
    const own = ownOrigin(baseURL);
    for (const [label, headers] of [
      ["no cookie", { origin: own }],
      ["a forged cookie", { origin: own, cookie: `${COOKIE}=forged` }],
      ["no cookie, another site", { origin: FOREIGN_ORIGIN }],
    ] as const) {
      const response = await save(api, boxes, headers);
      expect(redirectOf(response), label).toEqual(seeOther("/report"));
      expect(await response.text(), label).toBe("");
    }
  });

  test("PG-016 evidence — /report locked at 320 / 768 / 1440", async ({
    page,
    api,
  }, testInfo) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);

    // One load, then each width by resizing the window — the layout is CSS,
    // and reflows exactly as it would in a visitor's own window.
    await page.setViewportSize({ width: WIDTHS[0], height: 900 });
    await open(page, "/report");
    await expect(reportRoot(page)).toHaveAttribute(
      "data-report-state",
      "locked",
    );
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await settleFonts(page);
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: testInfo.outputPath(`S6.2-report-locked-${width}.png`),
        fullPage: true,
      });
      expect(
        await scrollsSideways(page),
        `/report scrolls sideways at ${width}px`,
      ).toBe(false);
    }
  });
});

test.describe("PG-016 — allowed: with the test password", () => {
  test("PG-016 the right password: 303 to /report with one HttpOnly, Secure, SameSite=Lax cookie for /report only", async ({
    api,
  }) => {
    const password = testPassword();
    expect(
      await readReportState(api),
      "E2E_REPORT_PASSWORD is set, but this deployment's report is switched off — " +
        "set REPORT_PASSWORD and REPORT_SECRET for it",
    ).toBe("locked");

    const response = await signIn(api, password);
    const headers = response.headers();
    const cookies = response
      .headersArray()
      .filter((header) => header.name.toLowerCase() === "set-cookie")
      .map((header) => header.value);
    expect({
      status: response.status(),
      location: headers["location"] ?? null,
      cacheControl: headers["cache-control"] ?? null,
      cookies: cookies.length,
    }).toEqual({
      status: 303,
      location: "/report",
      cacheControl: "no-store",
      cookies: 1,
    });
    expect(await response.text()).toBe("");

    // Split the one cookie into its name, its value and its attributes. Only
    // the name and the attributes ever reach an expect.
    const [pair = "", ...rest] = cookies[0]!.split(";").map((p) => p.trim());
    const equals = pair.indexOf("=");
    const name = pair.slice(0, equals);
    const value = pair.slice(equals + 1);
    expect(name).toBe(COOKIE);
    expect(
      /^[A-Za-z0-9_-]{43}$/.test(value),
      "the session is one HMAC-SHA256 digest: 43 base64url characters",
    ).toBe(true);
    expect(rest.map((attr) => attr.toLowerCase()).sort()).toEqual(
      COOKIE_ATTRIBUTES,
    );
    session = value;

    // That cookie opens the report, numbers and all.
    expect(hasNumbers(await signedInHtml(api, "/report"))).toBe(true);
  });

  test("PG-016 open, in a real browser: the form signs in; three cards, eight rows in order and a total, in the copy's words", async ({
    page,
    api,
  }, testInfo) => {
    const password = testPassword();
    const funnel = await readFunnel(api);
    const errors = collectErrors(page);

    await open(page, "/report");
    const root = reportRoot(page);
    await expect(root).toHaveAttribute("data-report-state", "locked");

    // Sign in the way the owner does: through the form. The box is filled by
    // script — a typed `fill` would put the password in the step's title.
    const logins = watchRedirects(page, "/report/login");
    await root.locator('input[name="password"]').evaluate((input, typed) => {
      (input as HTMLInputElement).value = typed;
    }, password);
    // The page the sign-in lands on: the GET that follows the 303, waited
    // for as a navigation, which may take a dev server several seconds.
    const landed = page.waitForResponse(
      (response) =>
        response.request().isNavigationRequest() &&
        response.request().method() === "GET" &&
        new URL(response.url()).pathname === "/report",
      { timeout: 0 },
    );
    await root
      .getByRole("button", { name: REPORT_COPY.login.button, exact: true })
      .click();
    expect((await landed).status()).toBe(200);
    await expect(root).toHaveAttribute("data-report-state", "open");
    const url = new URL(page.url());
    expect(`${url.pathname}${url.search}`).toBe("/report");
    expect(logins).toEqual([{ status: 303, location: "/report" }]);

    // What the browser kept: one cookie, for /report only, that no script on
    // the page can read. Its value is never compared to anything printable.
    const kept = (await page.context().cookies())
      .filter((cookie) => cookie.name === COOKIE)
      .map((cookie) => ({
        path: cookie.path,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        lastsBeyondTheTab: cookie.expires > 0,
      }));
    expect(kept).toEqual([
      {
        path: "/report",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        lastsBeyondTheTab: true,
      },
    ]);
    expect(
      await page.evaluate(() => document.cookie.includes("ur_report")),
      "a script on the page can read the session",
    ).toBe(false);

    // The page around the numbers.
    expect(await rootData(page)).toEqual(["reportState"]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(REPORT_COPY.header.title);
    await expect(page).toHaveTitle(`${REPORT_COPY.meta.title} · ${BRAND}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    const boxes = await readBoxes(page);
    const webinarStart = REPORT_COPY.header.webinar.split("{")[0]!.trim();
    if (funnel.startsAt) {
      await expect(root).toContainText(webinarLine(funnel.startsAt));
    } else {
      await expect(root).not.toContainText(webinarStart);
    }
    await expect(root.locator("p.lede")).toHaveText(
      `${countingLine(boxes.countFrom)} ${REPORT_COPY.header.howItCounts}`,
    );

    // Three cards, in order, with the copy's labels.
    const cards = root.locator("[data-report-card]");
    await expect(cards).toHaveCount(3);
    expect(
      await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-report-card")),
      ),
    ).toEqual(["visits", "registered", "showed-up"]);
    await expect(cards.locator("p:first-child")).toHaveText([
      REPORT_COPY.cards.visits,
      REPORT_COPY.cards.registered,
      REPORT_COPY.cards.showedUp,
    ]);

    // The where-from table: a heading, column headers, the eight sources in
    // the report's order with the copy's labels, and a total row.
    await expect(
      root.getByRole("heading", { level: 2, name: REPORT_COPY.table.heading }),
    ).toBeVisible();
    const table = root.locator("table");
    await expect(table).toHaveCount(1);
    await expect(table).toHaveAttribute(
      "aria-labelledby",
      "report-where-heading",
    );
    await expect(table.locator('thead th[scope="col"]')).toHaveText([
      REPORT_COPY.table.source,
      REPORT_COPY.table.visits,
      REPORT_COPY.table.registered,
    ]);
    const rows = table.locator("tbody tr[data-report-row]");
    expect(
      await rows.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-report-row")),
      ),
    ).toEqual([...SOURCE_KEYS]);
    await expect(table.locator('tbody th[scope="row"]')).toHaveText(
      SOURCE_KEYS.map((key) => REPORT_COPY.sources[key]),
    );
    await expect(
      table.locator('tfoot tr[data-report-row="total"] th[scope="row"]'),
    ).toHaveText(REPORT_COPY.table.total);

    // The numbers agree with each other: the total is the sum of the rows,
    // and the first two cards are the total.
    const numbers = await readNumbers(page);
    const sum = SOURCE_KEYS.reduce<Pair>(
      (acc, key) => ({
        visits: acc.visits + numbers.rows[key].visits,
        registered: acc.registered + numbers.rows[key].registered,
      }),
      { visits: 0, registered: 0 },
    );
    expect(numbers.total, "the total row is not the sum of the rows").toEqual(
      sum,
    );
    expect(numbers.cards.visits).toBe(numbers.total.visits);
    expect(numbers.cards.registered).toBe(numbers.total.registered);
    if (boxes.showedUp === "") {
      expect(numbers.cards.showedUp).toBe(REPORT_COPY.cards.showedUpEmpty);
    } else {
      expect(count(numbers.cards.showedUp)).toBe(Number(boxes.showedUp));
    }

    // The two boxes: a labelled date and a labelled whole number, each with
    // its hint, posted to the save route.
    await expect(
      root.getByRole("heading", { level: 2, name: REPORT_COPY.inputs.heading }),
    ).toBeVisible();
    const form = root.locator("form");
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("action", "/report/save");
    await expect(form).toHaveAttribute("method", "post");
    const countFrom = form.getByLabel(REPORT_COPY.inputs.countFrom, {
      exact: true,
    });
    await expect(countFrom).toHaveAttribute("type", "date");
    await expect(countFrom).toHaveAttribute("name", "countFrom");
    await expect(countFrom).toHaveAttribute(
      "aria-describedby",
      "report-count-from-hint",
    );
    await expect(page.locator("#report-count-from-hint")).toHaveText(
      REPORT_COPY.inputs.countFromHint,
    );
    const showedUp = form.getByLabel(REPORT_COPY.inputs.showedUp, {
      exact: true,
    });
    await expect(showedUp).toHaveAttribute("type", "number");
    await expect(showedUp).toHaveAttribute("name", "showedUp");
    await expect(showedUp).toHaveAttribute(
      "aria-describedby",
      "report-showed-up-hint",
    );
    await expect(page.locator("#report-showed-up-hint")).toHaveText(
      REPORT_COPY.inputs.showedUpHint,
    );
    await expect(
      form.getByRole("button", {
        name: REPORT_COPY.inputs.button,
        exact: true,
      }),
    ).toBeVisible();
    await expect(root.locator("input")).toHaveCount(2);

    // Nothing that was not asked for.
    await expect(root.getByRole("alert")).toHaveCount(0);
    await expect(root.getByRole("status")).toHaveCount(0);
    expect(
      await root.innerText(),
      "an unfilled {token} reached the page",
    ).not.toMatch(/\{[a-z ]+\}/);

    // Evidence, and the layout: one card per row under 640px, three across
    // above it, and no sideways scroll at any width. Each width by resizing
    // the window, as in the locked capture.
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await settleFonts(page);
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: testInfo.outputPath(`S6.2-report-open-${width}.png`),
        fullPage: true,
      });
      expect(
        await scrollsSideways(page),
        `/report scrolls sideways at ${width}px`,
      ).toBe(false);
      const [a, b, c] = await Promise.all(
        [0, 1, 2].map((i) => cards.nth(i).boundingBox()),
      );
      expect(a && b && c, "a card has no box").toBeTruthy();
      if (width < 640) {
        expect(
          a!.x === b!.x && b!.x === c!.x && a!.y < b!.y && b!.y < c!.y,
          `the cards must stack one per row at ${width}px`,
        ).toBe(true);
      } else {
        expect(
          Math.abs(a!.y - b!.y) < 1 &&
            Math.abs(b!.y - c!.y) < 1 &&
            a!.x < b!.x &&
            b!.x < c!.x,
          `the cards must sit three across at ${width}px`,
        ).toBe(true);
      }
    }

    expect(errors, "/report logged browser errors").toEqual([]);
  });

  test("PR-010 one real visit is counted once, under its source, and a robot's is not counted (IN-009)", async ({
    page,
    api,
    baseURL,
  }) => {
    testPassword();
    const funnel = await readFunnel(api);
    test.skip(
      funnel.state !== "open",
      `this deployment's funnel is ${funnel.state}; the visit route answers ${funnel.state === "dormant" ? 404 : 409} to everything`,
    );
    // Room for one Retry-After wait (up to 60 s) on top of the checks.
    test.setTimeout(120_000);

    // A "Counting from" day in the future would hide a visit made today, so
    // it is cleared for this test and put back after it.
    const boxes = await boxesNow(api);
    if (boxes.countFrom !== "" && boxes.countFrom > todayInSast()) {
      restoreTo = boxes;
      expect(
        redirectOf(
          await save(
            api,
            { countFrom: "", showedUp: boxes.showedUp },
            { cookie: sessionCookie(), origin: ownOrigin(baseURL) },
          ),
        ),
      ).toEqual(seeOther("/report?saved=1"));
    }

    await addSession(page.context(), baseURL);
    await open(page, "/report", "read");
    await expect(reportRoot(page)).toHaveAttribute("data-report-state", "open");
    const before = await readNumbers(page);

    // A robot first: answered, and stored nowhere.
    const robot = await sendVisit(api, ROBOT_UA);
    expect(robot.status(), "a robot's visit must be answered 204").toBe(204);
    expect(await robot.text()).toBe("");

    // Then THE ONE REAL VISIT of the suite. Another file's burst may share
    // the counter's bucket (tests/e2e/abuse/), so a 429 waits once.
    let visit = await sendVisit(api, BROWSER_UA);
    if (visit.status() === 429) {
      const wait = Number(visit.headers()["retry-after"]);
      expect(wait > 0 && wait <= 60, "a 429 must say when to come back").toBe(
        true,
      );
      await new Promise((resolve) => setTimeout(resolve, wait * 1000 + 500));
      visit = await sendVisit(api, BROWSER_UA);
    }
    expect(visit.status(), "the visit was not stored").toBe(204);
    expect(await visit.text()).toBe("");
    expect(visit.headers()["cache-control"]).toBe("no-store");

    // Exactly one more, under "other" and in the totals — nothing else.
    await page.reload({ waitUntil: "domcontentloaded" });
    const after = await readNumbers(page);
    const expected = structuredClone(before);
    expected.rows.other.visits += 1;
    expected.total.visits += 1;
    expected.cards.visits += 1;
    expect(after).toEqual(expected);
  });

  test("FM-013 a save from another site, an opaque origin or no Origin is refused with 403 — even signed in — and nothing is written", async ({
    api,
  }) => {
    testPassword();
    const before = await boxesNow(api);
    // Put back by the hook only if a refusal ever let a save through.
    restoreTo = before;

    for (const origin of [FOREIGN_ORIGIN, "null", null]) {
      const response = await save(
        api,
        { countFrom: before.countFrom, showedUp: "4242" },
        origin === null
          ? { cookie: sessionCookie() }
          : { cookie: sessionCookie(), origin },
      );
      const label = `Origin ${origin ?? "(none)"}`;
      const answer = redirectOf(response);
      expect(answer.status, label).toBe(403);
      expect(answer.cacheControl, label).toBe("no-store");
      expect(answer.setsCookie, label).toBe(false);
      expect(await response.text(), label).toBe("");
    }
    expect(await boxesNow(api), "a refused save wrote something").toEqual(
      before,
    );
  });

  test("FM-013 the boxes: a save from the page shows; without a session nothing changes; bad values are explained — then all is put back", async ({
    page,
    api,
    baseURL,
  }) => {
    testPassword();
    // Two page loads and about seventeen requests in a row, each a round
    // trip to the database.
    test.setTimeout(120_000);
    const own = ownOrigin(baseURL);
    const root = reportRoot(page);

    await addSession(page.context(), baseURL);
    await open(page, "/report");
    await expect(root).toHaveAttribute("data-report-state", "open");
    const original = await readBoxes(page);
    restoreTo = original;
    const target = original.showedUp === "12" ? "13" : "12";
    const showedUpCard = page
      .locator('[data-report-card="showed-up"] p')
      .nth(1);

    // 1. A save through the page's own form: the browser sends this site's
    //    Origin, and the page says it saved and shows the number. The
    //    landing page is waited for as a navigation.
    const saves = watchRedirects(page, "/report/save");
    await page.locator("#report-showed-up").fill(target);
    await root
      .locator("form")
      .getByRole("button", { name: REPORT_COPY.inputs.button, exact: true })
      .click();
    await page.waitForURL((url) => url.search === "?saved=1", {
      waitUntil: "domcontentloaded",
    });
    await expect(root.getByRole("status")).toHaveText(REPORT_COPY.inputs.saved);
    expect(saves).toEqual([{ status: 303, location: "/report?saved=1" }]);
    await expect(showedUpCard).toHaveText(target);
    expect(await readBoxes(page)).toEqual({
      countFrom: original.countFrom,
      showedUp: target,
    });

    // 2. Without a session, a well-formed save from this site changes
    //    nothing.
    const anonymous = await save(
      api,
      { countFrom: original.countFrom, showedUp: "99" },
      { origin: own },
    );
    expect(redirectOf(anonymous)).toEqual(seeOther("/report"));
    expect(
      (await boxesNow(api)).showedUp,
      "a save without a session wrote something",
    ).toBe(target);

    // 3. Values the browser's own checks would never send are refused by
    //    the server, each with its code — and none of them is saved.
    const refused: [Boxes, "number" | "date"][] = [
      [{ countFrom: original.countFrom, showedUp: "100001" }, "number"],
      [{ countFrom: original.countFrom, showedUp: "1.5" }, "number"],
      [{ countFrom: "2026-02-30", showedUp: target }, "date"],
      [{ countFrom: "2025-12-31", showedUp: target }, "date"],
    ];
    for (const [sent, code] of refused) {
      const response = await save(api, sent, {
        cookie: sessionCookie(),
        origin: own,
      });
      expect(
        redirectOf(response),
        `${sent.countFrom} / ${sent.showedUp}`,
      ).toEqual(seeOther(`/report?e=${code}`));
    }
    expect(await boxesNow(api), "a refused value was saved").toEqual({
      countFrom: original.countFrom,
      showedUp: target,
    });

    // Each sentence sits under its own field, which is marked invalid and
    // points at it — and the other field is left alone. From the server's
    // markup: these are attributes, which a browser only displays.
    const fields = {
      number: {
        input: "report-showed-up",
        error: "report-showed-up-error",
        sentence: REPORT_COPY.messages.number,
        describedBy: "report-showed-up-hint report-showed-up-error",
      },
      date: {
        input: "report-count-from",
        error: "report-count-from-error",
        sentence: REPORT_COPY.messages.date,
        describedBy: "report-count-from-hint report-count-from-error",
      },
    };
    for (const code of ["number", "date"] as const) {
      const field = fields[code];
      const other = fields[code === "number" ? "date" : "number"];
      const html = await signedInHtml(api, `/report?e=${code}`);
      expect(paragraph(html, field.error), `?e=${code}`).toBe(
        asHtml(field.sentence),
      );
      const tag = inputTag(html, field.input);
      expect(tag, `?e=${code}`).toContain('aria-invalid="true"');
      expect(tag, `?e=${code}`).toContain(
        `aria-describedby="${field.describedBy}"`,
      );
      expect(paragraph(html, other.error), `?e=${code}`).toBeNull();
      expect(inputTag(html, other.input), `?e=${code}`).not.toContain(
        "aria-invalid",
      );
      expect(alertsIn(html), `?e=${code}`).toEqual([]);
      expect(
        html.includes(`>${asHtml(REPORT_COPY.inputs.saved)}<`),
        `?e=${code} said it saved`,
      ).toBe(false);
    }

    // The form-wide sentences, and nothing for a code the page does not
    // know — read from the server's markup.
    for (const code of ["save", "busy", "error"] as const) {
      const html = await signedInHtml(api, `/report?e=${code}`);
      expect(alertsIn(html), `?e=${code}`).toEqual([
        asHtml(REPORT_COPY.messages[code]),
      ]);
    }
    const unknown = await signedInHtml(api, "/report?e=S62-unknown-code");
    expect(alertsIn(unknown), "an unknown code showed a message").toEqual([]);
    expect(
      unknown.includes('id="report-showed-up-error"') ||
        unknown.includes('id="report-count-from-error"'),
      "an unknown code marked a field as wrong",
    ).toBe(false);

    // 4. Put back exactly what was there — here, so the page can be seen to
    //    show it; the hook would otherwise do it after a failure.
    expect(
      redirectOf(
        await save(api, original, { cookie: sessionCookie(), origin: own }),
      ),
    ).toEqual(seeOther("/report?saved=1"));
    restoreTo = null;
    const after = await signedInHtml(api, "/report");
    expect({
      countFrom: inputValue(after, "report-count-from"),
      showedUp: inputValue(after, "report-showed-up"),
    }).toEqual(original);
    expect(cardValue(after, "showed-up")).toBe(
      original.showedUp === ""
        ? asHtml(REPORT_COPY.cards.showedUpEmpty)
        : original.showedUp,
    );
  });
});

test.describe("PR-011 — last: the sign-in limiter", () => {
  test("PR-011 a burst of wrong passwords is refused with ?e=busy — and then so is the right one", async ({
    api,
  }) => {
    test.skip(
      (await readReportState(api)) !== "locked",
      "this deployment's report is switched off; the sign-in route does no work and has no limiter to reach",
    );
    // Up to half a minute's wait for a fresh window, then up to 13 requests.
    test.setTimeout(120_000);

    // Start the burst with room left in the limiter's ten-minute window, so
    // it is counted in ONE window: the 11th try in a window is the first
    // refused, and 12 tries then always reach it.
    const left = secondsLeftInWindow(600);
    if (left < 30) {
      await new Promise((resolve) => setTimeout(resolve, (left + 2) * 1000));
    }

    const answers: Redirect[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const answer = redirectOf(await signIn(api, WRONG_PASSWORD));
      answers.push(answer);
      if (answer.location === "/report?e=busy") break;
    }
    const last = answers[answers.length - 1];
    expect(
      last,
      `no ?e=busy after ${answers.length} wrong passwords — the sign-in is not rate limited`,
    ).toEqual(seeOther("/report?e=busy"));
    // Until then, every answer was the app's own refusal.
    expect(answers.slice(0, -1)).toEqual(
      answers.slice(0, -1).map(() => seeOther("/report?e=wrong")),
    );

    // FAILS CLOSED: while the limit holds, even the right password is turned
    // away — the limit is checked before the password is.
    const password = process.env.E2E_REPORT_PASSWORD ?? "";
    if (password !== "") {
      expect(
        redirectOf(await signIn(api, password)),
        "the right password got past the limit",
      ).toEqual(seeOther("/report?e=busy"));
    }
  });
});
