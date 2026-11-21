import type { APIRequestContext, BrowserContext, Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import { HONEYPOT_FIELD } from "../../../src/lib/webinar/registration-payload";
import { guarded } from "./request-guard";

/**
 * Sprint S6.2 — the visit counter and the sign-up's source, in a real
 * browser. Draft FEATURE-LIST line IN-009 (the owner approves it at Gate B):
 * a visit is counted once per tab, under the platform its link names, and
 * the sign-up from that tab carries the same source.
 *
 * STATE-AWARE, like conversation-page.spec.ts: the counter exists only while
 * registration is open, so every test reads the funnel's state first and
 * SKIPS, visibly, otherwise. A skip is not a pass.
 *
 * NOTHING HERE REACHES THE SERVER'S WRITE ROUTES. Exactly two pathnames are
 * intercepted — /api/conversation/arrival and /api/conversation — and both
 * are always FULFILLED in the browser, never continued: no visit is stored,
 * and no address reaches the one live Mailchimp audience (D-22). Everything
 * else (the page, its scripts) loads normally, so on a protected Preview the
 * shared fixture still adds the bypass to the document.
 *
 * THE COUNTER IGNORES AUTOMATED BROWSERS (navigator.webdriver), and
 * Playwright's browser is one. So the tests that want it to run add an init
 * script that makes navigator.webdriver read false, as a visitor's browser
 * does — and one test leaves it alone, to prove an automated browser is
 * never counted.
 *
 * "NOTHING WAS SENT" NEEDS A MOMENT THAT COMES AFTER THE COUNTER. A sign-up
 * is that moment: the counter runs as the page comes to life, and the form
 * can only be submitted once React is running it, after the page's own
 * startup work. So each check that no visit was sent is made after a sign-up
 * from the same page has been seen.
 *
 * TIME. Each test loads the page once or twice and waits for React each
 * time, inside the project's default time — except the test of a tab another
 * tab opened, which loads five pages in two tabs and has twice that time. A longer time is never a fix for
 * a slow step (docs/ENVIRONMENT-PARITY.md §6 C4).
 */

type Funnel = "dormant" | "open" | "closed";

/** The funnel's state, over HTTP with the bypass-bearing `api` fixture. */
async function readFunnel(api: APIRequestContext): Promise<Funnel> {
  const response = await guarded("GET /conversation", () =>
    api.get("/conversation", { failOnStatusCode: false }),
  );
  const status = response.status();
  if (status === 404) return "dormant";
  expect(
    status,
    "/conversation answered neither 200 nor 404 — on a protected Preview a 401 " +
      "means the bypass header did not reach the deployment",
  ).toBe(200);
  const state =
    (await response.text()).match(/\bdata-conv-state="([^"]*)"/)?.[1] ?? "";
  expect(["open", "closed"]).toContain(state);
  return state as Funnel;
}

/** A visitor's browser: navigator.webdriver reads false, before any script. */
async function asVisitor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", {
      configurable: true,
      get: () => false,
    });
  });
}

type Sent = { method: string; contentType: string; body: unknown };

/**
 * Answer the counter and the sign-up in the browser. ONLY these two
 * pathnames — never a catch-all, which on a protected Preview takes the
 * document away from the fixture that adds the bypass — and ALWAYS fulfilled.
 * The sign-up is answered as a success, so the page shows its thank-you.
 * Given the whole context, it answers every tab of it, an opened one too.
 */
async function intercept(page: Page | BrowserContext) {
  const arrivals: Sent[] = [];
  const signups: Record<string, unknown>[] = [];
  await page.route(
    (url) => url.pathname === "/api/conversation/arrival",
    async (route) => {
      const request = route.request();
      arrivals.push({
        method: request.method(),
        contentType: request.headers()["content-type"] ?? "",
        body: request.postDataJSON(),
      });
      await route.fulfill({ status: 204 });
    },
  );
  await page.route(
    (url) => url.pathname === "/api/conversation",
    async (route) => {
      signups.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, emailable: true }),
      });
    },
  );
  return { arrivals, signups };
}

/**
 * Open a page and say plainly if the document itself did not arrive. Every
 * test then waits for React itself (waitForHydration), so the images and
 * fonts that "load" would also wait for are not waited on.
 */
async function open(page: Page, route: string): Promise<void> {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(
    response?.status(),
    `${route} did not load — on a protected Preview a 401 here means the ` +
      "bypass header did not reach the document",
  ).toBe(200);
}

/**
 * Wait until React has hydrated the form — observed, not assumed (see
 * conversation-page.spec.ts): before that, a click submits the form natively.
 */
async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const el = document.querySelector("#conv-register-first");
    return (
      !!el && Object.keys(el).some((key) => key.startsWith("__reactFiber$"))
    );
  });
}

/**
 * Browser errors, minus the one that is not this page's (the Vercel Analytics
 * debug script, refused by the site's own CSP outside a Vercel deployment —
 * see conversation-page.spec.ts).
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

/** The address convention of tests/e2e/forms/validation.spec.ts: reserved, undeliverable. */
const PROBE_EMAIL = "s62-probe@example.test";

/** Sign up on the register form and return what the browser sent. */
async function register(
  page: Page,
  signups: Record<string, unknown>[],
): Promise<Record<string, unknown>> {
  const before = signups.length;
  await page.locator("#conv-register-email").fill(PROBE_EMAIL);
  await page.locator('#conv-register-form button[type="submit"]').click();
  await expect(page.locator('[data-conv-done="register"]')).toBeVisible();
  expect(signups, "the sign-up was not sent exactly once").toHaveLength(
    before + 1,
  );
  return signups[before]!;
}

/** What the register form sends, with this tab's source. */
function signup(source: string) {
  return {
    form: "register",
    firstName: "",
    email: PROBE_EMAIL,
    [HONEYPOT_FIELD]: "",
    source,
  };
}

/** What this tab remembers, under the counter's own prefix — and only that. */
async function tabMemory(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const kept: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i) ?? "";
      if (key.startsWith("ur-conv-source:")) {
        kept[key] = sessionStorage.getItem(key) ?? "";
      }
    }
    return kept;
  });
}

const LINKEDIN = "/conversation?utm_source=linkedin&utm_medium=social";
const INSTAGRAM = "/conversation?utm_source=instagram&utm_medium=social";
const META_ADS = "/conversation?utm_source=meta&utm_medium=paid";

test.describe("IN-009 — a visit is counted once per tab, under its platform, and the sign-up carries it", () => {
  test("IN-009 a LinkedIn link: one visit, none on reload, and the tab's sign-ups say linkedin", async ({
    page,
    api,
  }) => {
    const funnel = await readFunnel(api);
    test.skip(
      funnel !== "open",
      `this deployment's funnel is ${funnel}; there is no counter while registration is not open`,
    );

    const errors = collectErrors(page);
    await asVisitor(page);
    const sent = await intercept(page);

    // 1. The first visit: exactly one, carrying only the key.
    await open(page, LINKEDIN);
    await waitForHydration(page);
    expect(
      await page.evaluate(() => navigator.webdriver),
      "the init script did not make this a visitor's browser",
    ).toBe(false);
    await expect
      .poll(() => sent.arrivals.length, {
        message: "the visit was never sent",
      })
      .toBeGreaterThan(0);
    expect(await register(page, sent.signups)).toEqual(signup("linkedin"));
    expect(sent.arrivals, "one visit, sent once").toEqual([
      {
        method: "POST",
        contentType: "application/json",
        body: { source: "linkedin" },
      },
    ]);
    // The tab keeps the key and nothing else.
    expect(Object.values(await tabMemory(page))).toEqual(["linkedin"]);

    // 2. A reload in the same tab is not a second visit, and its sign-up
    //    still says where the tab came from.
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    expect(await register(page, sent.signups)).toEqual(signup("linkedin"));
    expect(sent.arrivals, "a reload was counted again").toHaveLength(1);

    expect(errors, "/conversation logged browser errors").toEqual([]);
  });

  test("IN-009 the tab keeps its first source: an untagged page in the same tab is not counted again, and its sign-up says linkedin", async ({
    page,
    api,
  }) => {
    const funnel = await readFunnel(api);
    test.skip(
      funnel !== "open",
      `this deployment's funnel is ${funnel}; there is no counter while registration is not open`,
    );

    await asVisitor(page);
    const sent = await intercept(page);
    await open(page, LINKEDIN);
    await waitForHydration(page);
    await expect
      .poll(() => sent.arrivals.length, {
        message: "the visit was never sent",
      })
      .toBeGreaterThan(0);
    const memory = await tabMemory(page);

    // The same tab, on the page's own untagged address — as after following
    // a link inside the site. Not counted again, and still LinkedIn: the
    // tab's first source is the one that stays.
    await open(page, "/conversation");
    await waitForHydration(page);
    expect(await register(page, sent.signups)).toEqual(signup("linkedin"));
    expect(sent.arrivals, "the untagged page was counted again").toEqual([
      {
        method: "POST",
        contentType: "application/json",
        body: { source: "linkedin" },
      },
    ]);
    expect(await tabMemory(page)).toEqual(memory);
  });

  test("IN-009 a tab another tab opened counts its own visit: a LinkedIn tab opens an Instagram link, and the new tab — though it starts with a copy of the first tab's memory — is counted once under instagram, its sign-ups say instagram, and a reload of it counts nothing more", async ({
    page,
    api,
  }) => {
    const funnel = await readFunnel(api);
    test.skip(
      funnel !== "open",
      `this deployment's funnel is ${funnel}; there is no counter while registration is not open`,
    );

    // Two tabs and five page loads, each waiting for React: more work than
    // the other tests here, not a slower step (see TIME, above).
    test.setTimeout(60_000);

    // Codex review of S6.2, Finding 4. A visitor's browser in EVERY tab of
    // this context, the opened one included, and a note of what each page's
    // memory held before any of the page's own scripts ran.
    const context = page.context();
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "webdriver", {
        configurable: true,
        get: () => false,
      });
      const kept: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i) ?? "";
        if (key.startsWith("ur-conv-source:")) {
          kept[key] = sessionStorage.getItem(key) ?? "";
        }
      }
      (window as unknown as { s62MemoryAtStart: unknown }).s62MemoryAtStart =
        kept;
    });
    const sent = await intercept(context);

    // 1. The first tab, from LinkedIn: one visit.
    await open(page, LINKEDIN);
    await waitForHydration(page);
    await expect
      .poll(() => sent.arrivals.length, {
        message: "the first tab's visit was never sent",
      })
      .toBeGreaterThan(0);
    const firstTab = await tabMemory(page);
    expect(Object.values(firstTab)).toEqual(["linkedin"]);

    // 2. It opens an Instagram link in a new tab that keeps its opener.
    const [opened] = await Promise.all([
      context.waitForEvent("page"),
      page.evaluate((url) => {
        window.open(url);
      }, INSTAGRAM),
    ]);
    const errors = collectErrors(opened);
    await opened.waitForLoadState("domcontentloaded");
    await waitForHydration(opened);
    // What this test is about: the new tab has an opener, and its memory
    // started as a copy of the first tab's — the copy that used to stop its
    // visit and give its sign-ups the first tab's source.
    expect(
      await opened.evaluate(() => window.opener !== null),
      "the new tab has no opener, so it proves nothing",
    ).toBe(true);
    expect(
      await opened.evaluate(
        () =>
          (window as unknown as { s62MemoryAtStart: unknown }).s62MemoryAtStart,
      ),
      "the new tab did not start with a copy of the first tab's memory, so it proves nothing",
    ).toEqual(firstTab);

    // 3. Counted once, under its own link, and its sign-up says so.
    await expect
      .poll(() => sent.arrivals.length, {
        message:
          "the new tab's visit was never sent — the copied memory stopped it",
      })
      .toBe(2);
    expect(await register(opened, sent.signups)).toEqual(signup("instagram"));
    expect(sent.arrivals).toEqual([
      {
        method: "POST",
        contentType: "application/json",
        body: { source: "linkedin" },
      },
      {
        method: "POST",
        contentType: "application/json",
        body: { source: "instagram" },
      },
    ]);
    expect(Object.values(await tabMemory(opened))).toEqual(["instagram"]);
    // The first tab keeps its own.
    expect(await tabMemory(page)).toEqual(firstTab);

    // 4. A reload of the new tab is not a second visit, and its sign-up still
    //    says where that tab came from.
    await opened.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(opened);
    expect(await register(opened, sent.signups)).toEqual(signup("instagram"));
    expect(
      sent.arrivals,
      "a reload of the new tab was counted again",
    ).toHaveLength(2);

    // 5. Its own address loaded again, as by a link to itself — the browser
    //    keeps one history entry — is not a second visit either.
    await opened.goto(opened.url(), { waitUntil: "domcontentloaded" });
    await waitForHydration(opened);
    expect(await register(opened, sent.signups)).toEqual(signup("instagram"));
    expect(
      sent.arrivals,
      "the new tab's own address, loaded again, was counted again",
    ).toHaveLength(2);

    // 6. A page inside the site, in the same tab, keeps the tab's source and
    //    is not counted again.
    await open(opened, "/conversation");
    await waitForHydration(opened);
    expect(await register(opened, sent.signups)).toEqual(signup("instagram"));
    expect(
      sent.arrivals,
      "an in-site page of the new tab was counted again",
    ).toHaveLength(2);

    expect(errors, "the new tab logged browser errors").toEqual([]);
  });

  test("IN-009 a Meta ads link in a fresh tab is counted under meta-ads", async ({
    page,
    api,
  }) => {
    const funnel = await readFunnel(api);
    test.skip(
      funnel !== "open",
      `this deployment's funnel is ${funnel}; there is no counter while registration is not open`,
    );

    await asVisitor(page);
    const sent = await intercept(page);
    await open(page, META_ADS);
    await waitForHydration(page);
    await expect
      .poll(() => sent.arrivals.length, {
        message: "the visit was never sent",
      })
      .toBeGreaterThan(0);
    expect(await register(page, sent.signups)).toEqual(signup("meta-ads"));
    expect(sent.arrivals).toEqual([
      {
        method: "POST",
        contentType: "application/json",
        body: { source: "meta-ads" },
      },
    ]);
  });

  test("IN-009 an automated browser is never counted", async ({
    page,
    api,
  }) => {
    const funnel = await readFunnel(api);
    test.skip(
      funnel !== "open",
      `this deployment's funnel is ${funnel}; there is no counter while registration is not open`,
    );

    // No init script: this is Playwright's browser as it is.
    const sent = await intercept(page);
    await open(page, LINKEDIN);
    expect(
      await page.evaluate(() => navigator.webdriver),
      "this browser does not say it is automated, so it proves nothing",
    ).toBe(true);
    await waitForHydration(page);

    // The sign-up is the moment after the counter: by now it has had its
    // chance, and it sent nothing and remembered nothing. The sign-up still
    // names the link's platform, read from the address itself.
    expect(await register(page, sent.signups)).toEqual(signup("linkedin"));
    expect(sent.arrivals, "an automated browser was counted").toEqual([]);
    expect(await tabMemory(page)).toEqual({});
  });
});
