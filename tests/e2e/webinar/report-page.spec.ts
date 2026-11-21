import { randomBytes } from "node:crypto";
import type {
  APIRequestContext,
  APIResponse,
  BrowserContext,
  Page,
} from "@playwright/test";
import { test, expect } from "../fixtures";
import { PRODUCTION_HOST } from "../helpers/target";
import { COPY } from "../../../src/app/conversation/copy";
import { REPORT_COPY } from "../../../src/app/report/copy";
import { SOURCE_KEYS, type SourceKey } from "../../../src/lib/webinar/sources";
import { guarded } from "./request-guard";
import { isPreviewHost } from "./test-database";

/**
 * Sprint S6.2 — /report, the owner's webinar report, over HTTP and in a real
 * browser, as the owner simplified it at Gate B (PROJECT-STATUS D-65). Draft
 * FEATURE-LIST lines (the owner approves them at Gate B): PG-016 (the page and
 * its password gate — off, locked, open), FM-013 ("Start again for a new
 * webinar", the reset — refused without a session, from another site or with
 * a wrong password, and one real reset through the page's own form), PR-011
 * (a burst of wrong passwords is refused, failing closed), and the end-to-end
 * halves of PR-010 and IN-009 (one real visit is stored once, under its
 * source; a robot's is not stored at all).
 *
 * DENIED FIRST, AND ALWAYS. Everything a stranger can try — no cookie, a
 * forged cookie, a wrong password, a reset with no session — runs on every
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
 *   • Neither reaches a step title: the browser's password boxes — the
 *     sign-in's and the reset's — are filled by a script, because Playwright
 *     titles a `fill` with the text it typed.
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
 * the caller's address — the sign-in's (10 in ten minutes), the reset's (5 in
 * ten minutes) and the visit counter's (60 a minute) — and a second browser
 * profile would put a second sequence into the same counters, as
 * tests/e2e/abuse/ explains. The pages are captured at three widths by
 * resizing the window, so the second profile would add nothing.
 *
 * THE RESET'S LIMIT. A reset uses one of its five tries only once the session
 * and the Origin have passed (src/app/report/reset/route.ts). In a run, three
 * get that far — the wrong-password reset, the stale reset and the one real
 * reset — under five; only two runs from one runner address inside one
 * ten-minute window could reach six. Every other reset here is refused before
 * the limit, at the session or at the Origin, and costs it nothing. The
 * reset's other cases run without any database in report-reset-route.spec.ts.
 *
 * WHAT IT WRITES — only with the test password: ONE visit, under "other";
 * then, after every test that reads the numbers, ONE real reset, which
 * DELETES every visit and every person counted for the campaign, as the
 * owner's button does. So that half runs ONLY on a Vercel Preview of this
 * project: Previews use the test database, unretire-test, by the hosting
 * configuration, and tests/e2e/parity/signup.spec.ts proves the binding. On
 * any other target — a local server, whose database this spec cannot see, or
 * the live site — testPassword() skips it, by name, before a request is sent
 * (Codex review of S6.2, Finding 2). The reset's other cases, a stale page
 * among them, run without any database in report-reset-route.spec.ts. No spec
 * sends a valid sign-up (D-22).
 *
 * FEW PAGE LOADS. A dev server can take seconds for one browser page load
 * (each load is one more chance of a slow one), and a plain request for the
 * same page a fraction of a second. So what needs a browser — the sign-in
 * form, the reset form, the cookie as a browser keeps it, layout — is checked
 * in the browser, and what the server rendered is read from its HTML.
 *
 * TIME. Every test here is a short, fixed sequence of requests, and runs in
 * the project's default time. Only the one real visit (it may wait out one
 * Retry-After) and the burst (it may wait for a fresh limiter window) get
 * more, each with its reason beside it. A longer time is never a fix for a
 * slow step (docs/ENVIRONMENT-PARITY.md §6 C4).
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
/** The page's own conversion format: a whole percentage, the en-GB way. */
const PERCENT = new Intl.NumberFormat("en-GB", {
  style: "percent",
  maximumFractionDigits: 0,
});

const OFF_SKIP =
  "this deployment's report is switched off (REPORT_PASSWORD or REPORT_SECRET is not set); the locked checks do not apply";
const NO_PASSWORD =
  "E2E_REPORT_PASSWORD is not set, so the signed-in half of the report is not exercised by this run";
const PREVIEW_ONLY =
  "the signed-in half stores a visit and deletes every count, so it runs only on a Vercel Preview of " +
  "this project, whose database is unretire-test (tests/e2e/parity/signup.spec.ts) — never against a " +
  "server whose database this spec cannot see";

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
 * The page's own markup — what <main> holds — without the shell around it,
 * and without the router data, which repeats the address's query string. It
 * must hold the page root in the expected state, so a check made on it can
 * never pass on an empty string.
 */
function pageMarkup(html: string, state: "locked" | "open"): string {
  const markup = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  expect(
    attribute(markup, "data-report-state"),
    `the ${state} page root is not inside <main>`,
  ).toBe(state);
  return markup;
}

/** The text of every role="alert" paragraph, as HTML. */
function alertsIn(html: string): string[] {
  return [...html.matchAll(/<p\b[^>]*\brole="alert"[^>]*>([^<]*)<\/p>/g)].map(
    (match) => match[1]!,
  );
}

/** The text of every role="status" paragraph, as HTML. */
function statusesIn(html: string): string[] {
  return [...html.matchAll(/<p\b[^>]*\brole="status"[^>]*>([^<]*)<\/p>/g)].map(
    (match) => match[1]!,
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

/** An answer reduced to what may be printed — never a cookie's value. */
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

/** What every refusal and every reset answers: a relative 303, not cached. */
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

type Funnel = "dormant" | "open" | "closed";

/** The webinar funnel's state, as tests/e2e/webinar/conversation-page.spec.ts reads it. */
async function readFunnel(api: APIRequestContext): Promise<Funnel> {
  const response = await getPage(api, "/conversation");
  if (response.status() === 404) return "dormant";
  expect(
    response.status(),
    "/conversation answered neither 200 nor 404 — on a protected Preview a 401 means the bypass header did not arrive",
  ).toBe(200);
  const state = attribute(await response.text(), "data-conv-state");
  expect(["open", "closed"]).toContain(state);
  return state as Funnel;
}

/**
 * The test password, or a visible skip. The signed-in half stores a visit and
 * deletes every count, so it never runs against the live site: the harness
 * lets a run reach it only as the morning check, which holds no secret, and
 * this refuses it before a single request is sent.
 */
function testPassword(): string {
  const value = process.env.E2E_REPORT_PASSWORD ?? "";
  test.skip(value === "", NO_PASSWORD);
  const host = new URL(test.info().project.use.baseURL ?? "").hostname;
  expect(
    host,
    "the report spec's signed-in half stores a visit and deletes every count: it never runs against the live site",
  ).not.toBe(PRODUCTION_HOST);
  test.skip(!isPreviewHost(host), PREVIEW_ONLY);
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

/**
 * POST /report/reset as the page's form sends it: the password, typed again.
 * With a valid session and this site's Origin it uses one of the reset's
 * tries (THE RESET'S LIMIT, above).
 */
function postReset(
  api: APIRequestContext,
  password: string,
  headers: Record<string, string>,
  fields: Record<string, string> = {},
) {
  return guarded("POST /report/reset", () =>
    api.post("/report/reset", {
      form: { password, ...fields },
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

/** A count as the page prints it: whole, grouped the en-GB way ("1,234"). */
function count(text: string): number {
  const trimmed = text.trim();
  expect(trimmed, "a count must be a whole en-GB number").toMatch(
    /^\d{1,3}(,\d{3})*$/,
  );
  return Number(trimmed.replace(/,/g, ""));
}

/**
 * The conversion the page must print for two counts — registered as a share
 * of visits, as a whole percentage — or the copy's "—" while there are no
 * visits. Worked out HERE, with the same format the page uses.
 */
function conversionOf(registered: number, visits: number): string {
  return visits > 0
    ? PERCENT.format(registered / visits)
    : REPORT_COPY.noConversion;
}

/** One row of the table, or the three cards: two counts and their ratio. */
type Line = { visits: number; registered: number; conversion: string };
type Numbers = {
  rows: Record<SourceKey, Line>;
  total: Line;
  cards: Line;
};

/** The line the page must print for these two counts. */
function line(visits: number, registered: number): Line {
  return { visits, registered, conversion: conversionOf(registered, visits) };
}

/** One row of the table as the page prints it: visits, registered, conversion. */
function rowIn(markup: string, row: string): Line {
  const cells = [
    ...(
      markup.match(
        new RegExp(
          `<tr\\b[^>]*\\bdata-report-row="${row}"[^>]*>([\\s\\S]*?)</tr>`,
        ),
      )?.[1] ?? ""
    ).matchAll(/<td\b[^>]*>([^<]*)<\/td>/g),
  ].map((match) => match[1]!);
  expect(cells.length, `the "${row}" row must hold three cells`).toBe(3);
  return {
    visits: count(cells[0]!),
    registered: count(cells[1]!),
    conversion: cells[2]!.trim(),
  };
}

/** The three cards as the page prints them. */
function cardsIn(markup: string): Line {
  const value = (name: string): string => {
    const text = cardValue(markup, name);
    expect(text, `the "${name}" card is not on the page`).not.toBeNull();
    return text!;
  };
  return {
    visits: count(value("visits")),
    registered: count(value("registered")),
    conversion: value("conversion").trim(),
  };
}

/** Every number on the open report: the eight rows, the total, the cards. */
function numbersIn(markup: string): Numbers {
  const rows = {} as Record<SourceKey, Line>;
  for (const key of SOURCE_KEYS) rows[key] = rowIn(markup, key);
  return { rows, total: rowIn(markup, "total"), cards: cardsIn(markup) };
}

/** Every number the browser's open report holds now. */
async function readNumbers(page: Page): Promise<Numbers> {
  return numbersIn(pageMarkup(await page.content(), "open"));
}

/** Every number the server renders now, read with the session. */
async function numbersNow(api: APIRequestContext): Promise<Numbers> {
  return numbersIn(pageMarkup(await signedInHtml(api, "/report"), "open"));
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
        await postReset(api, WRONG_PASSWORD, { origin: ownOrigin(baseURL) }),
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

  test("PG-016 locked: ?e=wrong shows the approved sentence; an unknown ?e= or a reset's ?r= shows nothing", async ({
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
      const markup = pageMarkup(await response.text(), "locked");
      expect(markup, `?e=${code}: no password form`).toContain(
        'action="/report/login"',
      );
      expect(alertsIn(markup), `?e=${code}`).toEqual([
        asHtml(REPORT_COPY.messages[code]),
      ]);
    }

    // Anything else adds nothing — an unknown code, markup, a message of the
    // open page's, and the reset's answers (?r=), which only the open page
    // shows — and what was typed is never echoed. Read from the server's own
    // markup, which also covers what is hidden.
    const sentences = [
      ...Object.values(REPORT_COPY.messages),
      REPORT_COPY.reset.done,
    ];
    for (const query of [
      `e=${encodeURIComponent("S62-unknown-code")}`,
      `e=${encodeURIComponent("<b>S62-markup</b>")}`,
      "e=resetWrong",
      "e=done",
      "r=wrong",
      "r=busy",
      "r=error",
      "r=done",
    ]) {
      const response = await getPage(api, `/report?${query}`);
      expect(response.status(), `?${query}`).toBe(200);
      const html = await response.text();
      expect(attribute(html, "data-report-state"), `?${query}`).toBe("locked");
      const markup = pageMarkup(html, "locked");
      expect(markup, `?${query}: no password form`).toContain(
        'action="/report/login"',
      );
      expect(alertsIn(markup), `?${query} showed a message`).toEqual([]);
      expect(statusesIn(markup), `?${query} showed a message`).toEqual([]);
      for (const sentence of sentences) {
        expect(markup, `?${query} showed a message`).not.toContain(
          asHtml(sentence),
        );
      }
      expect(markup, `?${query} was echoed`).not.toContain("S62-");
    }
  });

  test("FM-013 a reset without a session goes back to /report and deletes nothing", async ({
    api,
    baseURL,
  }) => {
    test.skip((await readReportState(api)) !== "locked", OFF_SKIP);

    // The password is a wrong one on purpose: this half has none. If the
    // session check were missing, the route would answer 403 (another site),
    // ?r=wrong or ?r=busy instead of /report — and with a wrong password
    // nothing could be deleted either way. (The signed-in half sends the
    // RIGHT password without a session, and checks the numbers too.) Each is
    // refused before the reset's rate limit, so none of them uses a try.
    const own = ownOrigin(baseURL);
    for (const [label, headers] of [
      ["no cookie", { origin: own }],
      ["a forged cookie", { origin: own, cookie: `${COOKIE}=forged` }],
      [
        "a forged cookie of the right shape",
        {
          origin: own,
          cookie: `${COOKIE}=${randomBytes(32).toString("base64url")}`,
        },
      ],
      ["no cookie, another site", { origin: FOREIGN_ORIGIN }],
    ] as const) {
      const response = await postReset(api, WRONG_PASSWORD, headers);
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

  test("PG-016 open, in a real browser: the form signs in; the webinar's name, three cards, eight rows in order and a total, each conversion its own ratio, and the reset form — in the copy's words", async ({
    page,
  }, testInfo) => {
    const password = testPassword();
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

    // The page around the numbers: the heading, then the webinar's name —
    // the sign-up page's own title, so the two can never differ.
    expect(await rootData(page)).toEqual(["reportState"]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(REPORT_COPY.header.title);
    await expect(root.locator("h1 + p")).toHaveText(COPY.hero.title);
    await expect(page).toHaveTitle(`${REPORT_COPY.meta.title} · ${BRAND}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );

    // Three cards, in order, with the copy's labels.
    const cards = root.locator("[data-report-card]");
    await expect(cards).toHaveCount(3);
    expect(
      await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-report-card")),
      ),
    ).toEqual(["visits", "registered", "conversion"]);
    await expect(cards.locator("p:first-child")).toHaveText([
      REPORT_COPY.cards.visits,
      REPORT_COPY.cards.registered,
      REPORT_COPY.cards.conversion,
    ]);

    // The where-from table: a heading, four column headers, the eight
    // sources in the report's order with the copy's labels, and a total row.
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
      REPORT_COPY.table.conversion,
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

    // The numbers agree with each other: every conversion is its own line's
    // registered ÷ visits ("—" with no visits), the total is the sum of the
    // rows, and the three cards are the total.
    const numbers = await readNumbers(page);
    const lines: [string, Line][] = [
      ...SOURCE_KEYS.map((key): [string, Line] => [key, numbers.rows[key]]),
      ["total", numbers.total],
      ["the cards", numbers.cards],
    ];
    for (const [label, entry] of lines) {
      expect(
        entry.conversion,
        `${label}: the conversion is not registered ÷ visits`,
      ).toBe(conversionOf(entry.registered, entry.visits));
    }
    const sum = SOURCE_KEYS.reduce(
      (acc, key) => ({
        visits: acc.visits + numbers.rows[key].visits,
        registered: acc.registered + numbers.rows[key].registered,
      }),
      { visits: 0, registered: 0 },
    );
    expect(
      { visits: numbers.total.visits, registered: numbers.total.registered },
      "the total row is not the sum of the rows",
    ).toEqual(sum);
    expect(numbers.cards, "the cards are not the total row").toEqual(
      numbers.total,
    );

    // "Start again for a new webinar": its heading, its two lines, and the
    // page's one form, posting the password — typed again, in a box labelled
    // like the sign-in's — to the reset route.
    const resetSection = root.locator(
      'section[aria-labelledby="report-reset-heading"]',
    );
    await expect(
      resetSection.getByRole("heading", {
        level: 2,
        name: REPORT_COPY.reset.heading,
      }),
    ).toBeVisible();
    await expect(
      resetSection.getByText(REPORT_COPY.reset.intro, { exact: true }),
    ).toBeVisible();
    await expect(
      resetSection.getByText(REPORT_COPY.reset.keep, { exact: true }),
    ).toBeVisible();
    const form = root.locator("form");
    await expect(form).toHaveCount(1);
    await expect(resetSection.locator("form")).toHaveCount(1);
    await expect(form).toHaveAttribute("action", "/report/reset");
    await expect(form).toHaveAttribute("method", "post");
    const resetPassword = form.getByLabel("Password", { exact: true });
    await expect(resetPassword).toBeVisible();
    await expect(resetPassword).toHaveAttribute("id", "report-reset-password");
    await expect(resetPassword).toHaveAttribute("type", "password");
    await expect(resetPassword).toHaveAttribute("name", "password");
    await expect(
      form.getByRole("button", { name: REPORT_COPY.reset.button, exact: true }),
    ).toBeVisible();

    // What the owner took out at Gate B (D-65) stays out: no box to type a
    // date or a number into, and none of the old lines. The one box is the
    // reset's password; beside it the form carries exactly two hidden values,
    // the campaign and when its counting began (Codex review, Finding 1).
    await expect(root.locator('input:not([type="hidden"])')).toHaveCount(1);
    await expect(
      root
        .locator('input[type="hidden"]')
        .evaluateAll((inputs) =>
          inputs.map((input) => (input as HTMLInputElement).name),
        ),
    ).resolves.toEqual(["campaign", "since"]);
    await expect(
      page.locator('input[type="date"], input[type="number"]'),
    ).toHaveCount(0);
    for (const gone of [
      "Showed up",
      "Counting from",
      "For the webinar on",
      "Each visit is counted",
    ]) {
      await expect(root, `"${gone}" is on the page again`).not.toContainText(
        gone,
      );
    }

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
      funnel !== "open",
      `this deployment's funnel is ${funnel}; the visit route answers ${funnel === "dormant" ? 404 : 409} to everything`,
    );
    // Room for one Retry-After wait (up to 60 s) on top of the checks.
    test.setTimeout(120_000);

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

    // Exactly one more, under "other" and in the totals — nothing else — and
    // each conversion it touches follows its new counts.
    await page.reload({ waitUntil: "domcontentloaded" });
    const after = await readNumbers(page);
    const expected = structuredClone(before);
    expected.rows.other = line(
      before.rows.other.visits + 1,
      before.rows.other.registered,
    );
    expected.total = line(before.total.visits + 1, before.total.registered);
    expected.cards = line(before.cards.visits + 1, before.cards.registered);
    expect(after).toEqual(expected);
  });

  test("FM-013 the right password alone deletes nothing: without a session the reset goes back to /report, and from another site, an opaque origin or no Origin it is refused with 403", async ({
    api,
    baseURL,
  }) => {
    const password = testPassword();
    const before = await numbersNow(api);
    const own = ownOrigin(baseURL);

    // Every reset here carries the RIGHT password, so the one check it meets
    // is all that stands between it and a deletion: had that check been
    // missing, the numbers read at the end would be gone. (They can show it
    // only while there is something to delete; each answer is checked either
    // way.) Both checks come before the reset's rate limit, so none of these
    // uses a try.

    // No session — no cookie, or a forged one — even from this site: back to
    // /report, which shows the password form.
    for (const [label, headers] of [
      ["no cookie", { origin: own }],
      [
        "a forged cookie",
        {
          origin: own,
          cookie: `${COOKIE}=${randomBytes(32).toString("base64url")}`,
        },
      ],
    ] as const) {
      const response = await postReset(api, password, headers);
      expect(redirectOf(response), label).toEqual(seeOther("/report"));
      expect(await response.text(), label).toBe("");
    }

    // Signed in, but not from this site: 403, and nothing else.
    for (const origin of [FOREIGN_ORIGIN, "null", null]) {
      const response = await postReset(
        api,
        password,
        origin === null
          ? { cookie: sessionCookie() }
          : { cookie: sessionCookie(), origin },
      );
      const label = `Origin ${origin ?? "(none)"}`;
      expect(redirectOf(response), label).toEqual({
        status: 403,
        location: null,
        setsCookie: false,
        cacheControl: "no-store",
      });
      expect(await response.text(), label).toBe("");
    }

    expect(await numbersNow(api), "a refused reset deleted something").toEqual(
      before,
    );
  });

  test("FM-013 a wrong password deletes nothing: the reset answers 303 to exactly /report?r=wrong", async ({
    api,
    baseURL,
  }) => {
    testPassword();
    const before = await numbersNow(api);

    // Signed in and from this site, so this reset passes the session and the
    // Origin and uses one of the reset's tries (THE RESET'S LIMIT, above).
    const response = await postReset(api, WRONG_PASSWORD, {
      cookie: sessionCookie(),
      origin: ownOrigin(baseURL),
    });
    expect(
      redirectOf(response),
      "a Location of /report?r=busy here means this caller's resets are limited: five in ten minutes",
    ).toEqual(seeOther("/report?r=wrong"));
    expect(await response.text(), "a refusal has no body").toBe("");
    expect(await numbersNow(api), "a wrong password deleted something").toEqual(
      before,
    );
  });

  test("FM-013 after a reset the page says what happened: ?r=wrong, ?r=busy, ?r=error and ?r=stale are alerts, ?r=done a status line, anything else nothing", async ({
    api,
  }) => {
    testPassword();

    // From the server's markup; nothing is sent to the reset here.
    for (const [code, sentence] of [
      ["wrong", REPORT_COPY.messages.resetWrong],
      ["busy", REPORT_COPY.messages.busy],
      ["error", REPORT_COPY.messages.resetFailed],
      ["stale", REPORT_COPY.messages.resetStale],
    ] as const) {
      const markup = pageMarkup(
        await signedInHtml(api, `/report?r=${code}`),
        "open",
      );
      expect(alertsIn(markup), `?r=${code}`).toEqual([asHtml(sentence)]);
      expect(statusesIn(markup), `?r=${code}`).toEqual([]);
    }
    const done = pageMarkup(await signedInHtml(api, "/report?r=done"), "open");
    expect(statusesIn(done), "?r=done").toEqual([
      asHtml(REPORT_COPY.reset.done),
    ]);
    expect(alertsIn(done), "?r=done").toEqual([]);

    // Anything else adds nothing — an unknown code, markup, and a sign-in's
    // ?e=, which only the password form shows — and what was typed is never
    // echoed.
    for (const query of [
      `r=${encodeURIComponent("S62-unknown-code")}`,
      `r=${encodeURIComponent("<b>S62-markup</b>")}`,
      "e=wrong",
    ]) {
      const markup = pageMarkup(
        await signedInHtml(api, `/report?${query}`),
        "open",
      );
      expect(alertsIn(markup), `?${query} showed a message`).toEqual([]);
      expect(statusesIn(markup), `?${query} showed a message`).toEqual([]);
      expect(markup, `?${query} was echoed`).not.toContain("S62-");
    }
  });

  test("FM-013 a reset whose since is no longer when the counting began deletes nothing: the database itself answers ?r=stale", async ({
    api,
    baseURL,
  }) => {
    const password = testPassword();
    const before = await numbersNow(api);

    // The case the Codex review's Finding 1 names, and the one only the
    // database can catch: this campaign, the right password and a well-formed
    // since — but not the campaign's, as on a page left open across a reset.
    // The route lets it through; reset_campaign_report must refuse it. The
    // second of the file's three resets to use a try (THE RESET'S LIMIT).
    const response = await postReset(
      api,
      password,
      { cookie: sessionCookie(), origin: ownOrigin(baseURL) },
      { campaign: "conv1", since: "2000-01-01T00:00:00+00:00" },
    );
    expect(
      redirectOf(response),
      "/report?r=done here means the database deleted numbers no page showed; /report?r=error, that " +
        "the test database lacks this sprint's reset_campaign_report(text, timestamptz); " +
        "/report?r=busy, that this caller's resets are limited (five in ten minutes)",
    ).toEqual(seeOther("/report?r=stale"));
    expect(await response.text(), "a refusal has no body").toBe("");
    expect(await numbersNow(api), "a stale reset deleted something").toEqual(
      before,
    );
  });

  test("FM-013 the reset, through the page's own form: /report?r=done, the done line, and every count back to zero", async ({
    page,
    baseURL,
  }) => {
    const password = testPassword();
    const errors = collectErrors(page);
    const root = reportRoot(page);

    await addSession(page.context(), baseURL);
    await open(page, "/report");
    await expect(root).toHaveAttribute("data-report-state", "open");

    // The form names what it deletes: this campaign, and when the counting
    // this page shows began (Codex review, Finding 1). The database deletes
    // only if that is still so — a reset that came back ?r=stale here would
    // mean the value did not survive the round trip.
    const form = root.locator('form[action="/report/reset"]');
    await expect(
      form.locator('input[type="hidden"][name="campaign"]'),
    ).toHaveValue("conv1");
    await expect(
      form.locator('input[type="hidden"][name="since"]'),
    ).toHaveCount(1);

    // Reset the way the owner does: the password typed again into the page's
    // own form, which the browser posts with this site's Origin. The box is
    // filled by script — a typed `fill` would put the password in the step's
    // title. This is THE ONE DELETION: every count of the campaign goes, on
    // purpose, and the third of the file's resets to use a try.
    const resets = watchRedirects(page, "/report/reset");
    await page.locator("#report-reset-password").evaluate((input, typed) => {
      (input as HTMLInputElement).value = typed;
    }, password);
    // The reset's own answer first, so that a refusal is named rather than
    // waited out: the page the form is on is open too.
    const answered = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/report/reset",
      { timeout: 0 },
    );
    await root
      .locator('form[action="/report/reset"]')
      .getByRole("button", { name: REPORT_COPY.reset.button, exact: true })
      .click();
    await answered;
    expect(
      resets,
      "a 403 means the browser's Origin is not one of this deployment's hosts; a Location of " +
        "/report?r=busy, that this caller's resets are limited (five in ten minutes); " +
        "/report?r=error, that the database did not reset; /report?r=stale, that the page's " +
        "campaign or start of counting did not match the database's",
    ).toEqual([{ status: 303, location: "/report?r=done" }]);
    // Then the page it leads to, which may take a dev server several seconds.
    await page.waitForURL(
      (url) => `${url.pathname}${url.search}` === "/report?r=done",
      { waitUntil: "domcontentloaded" },
    );

    // The page that came back says it is done, and nothing else.
    await expect(root).toHaveAttribute("data-report-state", "open");
    await expect(root.getByRole("status")).toHaveText(REPORT_COPY.reset.done);
    await expect(root.getByRole("alert")).toHaveCount(0);

    // Every count is 0, and with no visits every conversion is "—".
    const zero: Line = {
      visits: 0,
      registered: 0,
      conversion: REPORT_COPY.noConversion,
    };
    expect(await readNumbers(page)).toEqual({
      rows: Object.fromEntries(SOURCE_KEYS.map((key) => [key, zero])),
      total: zero,
      cards: zero,
    });

    expect(errors, "/report logged browser errors").toEqual([]);
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
