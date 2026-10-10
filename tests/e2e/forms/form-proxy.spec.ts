import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";

/**
 * Sprint S4.5c — the red→green proof for pre-launch review Finding 8 (Blocking)
 * and FEATURE-LIST lines FM-003, FM-005 and FM-006.
 *
 * Finding 8: SECURITY-CHECKLIST §5 requires every internet-facing public form
 * to ship with at least one enforced abuse control. S4.5 added a limiter to
 * /api/subscribe and stopped, leaving the contact, community and enterprise
 * forms POSTing straight from the browser to Formspree — no rate limit, no
 * validation, no server involvement, and the endpoint sitting in the page
 * source for anyone to hit directly. 231b637 moved all three behind /api/form.
 *
 * WHAT THIS FILE ASSERTS, AND WHAT IT DOES NOT. It proves the browser no longer
 * talks to Formspree, which is the whole of Finding 8's fix and is invisible in
 * any server-side test. It never SUBMITS a valid form: a valid submission sends
 * a real e-mail to the owner's inbox on every pull request, so the delivery half
 * stays where D-25 put it — the dispatch-only parity project. The request is
 * intercepted at the browser, so nothing leaves the machine.
 *
 * The endpoint's own validation and its rate limit are asserted over HTTP by
 * tests/e2e/abuse/public-write-endpoints.spec.ts.
 */

/**
 * The three forms Finding 8 moved.
 *
 * Fields are addressed by the ids the components actually render — they carry
 * no `name` attributes. The submit control is addressed by its LABEL rather
 * than by `button[type=submit]`, for two reasons found while writing this:
 * /contact carries two submit buttons (the contact form and the shared e-mail
 * capture band), and /enterprise's control is an `onClick` handler with no
 * `type` at all, so a type selector matches nothing there.
 */
const FORMS = [
  {
    route: "/contact",
    kind: "contact",
    fields: {
      "#ct-name": "E2E Probe",
      "#ct-email": "e2e@example.test",
      "#ct-message": "probe",
    },
    submit: "Send Message",
  },
  {
    route: "/community",
    kind: "community",
    fields: {
      "#ur-join-name": "E2E Probe",
      "#ur-join-email": "e2e@example.test",
    },
    submit: "Send Request",
  },
  {
    route: "/enterprise",
    kind: "enterprise",
    fields: {
      "#discovery-name": "E2E Probe",
      "#discovery-email": "e2e@example.test",
    },
    submit: "Book a Discovery Call →",
  },
] as const;

/**
 * Wait until React has hydrated the form, and do it deterministically.
 *
 * Every one of these forms submits through a React onSubmit/onClick handler,
 * which does not exist until the client component has hydrated. Interact before
 * that and the browser performs the form's NATIVE submission instead: no POST
 * is issued, the page simply navigates, and the test reports "never submitted
 * anything" while the application is perfectly healthy. It cost three false
 * failures here — the same class of mistake this whole sprint is about, arriving
 * from the test side.
 *
 * `waitUntil: "load"` alone was not enough under a loaded server, and a fixed
 * wait would be a guess that fails on a slower machine. React attaches a
 * `__reactFiber$…` key to each host element as it hydrates it, so the presence
 * of that key IS the event we need, observed rather than assumed. It is an
 * internal name and could change with a React major; if it ever does, this
 * throws a clear timeout here rather than corrupting an assertion elsewhere,
 * which is the right way for a test-only probe to fail.
 *
 * It waits on one of the form's own FIELDS rather than on a `<form>` element,
 * because /enterprise has no `<form>` at all — its inputs and its submit button
 * sit in a plain `<div className="card">`, and the button carries an `onClick`
 * with no `type`. Probing for `form` therefore waited forever on exactly one of
 * the three pages. (Worth noting separately: with no form element, pressing
 * Enter in those fields does not submit. Not this sprint's to change.)
 */
async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith("__reactFiber$"))
    );
  }, selector);
}

for (const form of FORMS) {
  test(`FM-005 — the ${form.kind} form posts to our server, never to Formspree`, async ({
    page,
  }) => {
    /**
     * OBSERVE EVERYTHING, INTERCEPT ALMOST NOTHING.
     *
     * The first two versions of this test wrapped the whole page in
     * `page.route("**\/*")`, and both broke it on the deployed Preview while
     * passing locally:
     *
     *   v1 called `route.continue()`, which sends the request immediately and
     *   skips every remaining handler — including the CONTEXT-level route in
     *   tests/e2e/fixtures.ts that attaches the Vercel Protection Bypass
     *   header. Vercel then answered 401 to the document itself, React never
     *   hydrated, and the probe below timed out.
     *
     *   v2 swapped in `route.fallback()` on the theory that it would hand the
     *   request down to that context handler. It did not fix the run, so the
     *   theory was wrong or incomplete — and the honest response to a fix that
     *   did not work is to stop relying on the mechanism, not to guess at it
     *   again.
     *
     * So the page's traffic is no longer touched. `page.on("request")` is a
     * passive observer: it sees every request the page makes, including any POST
     * to any host, and changes nothing — so the document, the chunks and the
     * bypass header all behave exactly as they do in every other spec in this
     * suite. Only the two possible SUBMISSION targets are intercepted, which is
     * the one thing that genuinely must not happen for real: a valid submission
     * would e-mail the owner on every pull request. That mistake has already
     * been made once this sprint (see abuse/public-write-endpoints.spec.ts).
     *
     * The assertion is made against the OBSERVER, so a POST to a third host
     * would still be caught even though it is not intercepted — and no such host
     * can exist, because FM-006 proves the Formspree endpoint has left the
     * bundle entirely.
     */
    const attempts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") attempts.push(request.url());
    });

    await page.route(
      (url) =>
        url.pathname === "/api/form" || url.hostname.endsWith("formspree.io"),
      async (route) => {
        // Answer as the proxy would on success, so the form reaches its done
        // state and the test can tell "submitted" from "silently failed".
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      },
    );

    const response = await page.goto(form.route, { waitUntil: "load" });

    // Diagnose before probing. A hydration timeout is an opaque symptom with
    // many possible causes, and this sprint has already spent two rounds
    // guessing at one from CI logs alone. If the document itself did not come
    // back 200 — Vercel's 401 when a bypass is missing being the case that
    // actually happened — say THAT, here, instead of failing 30 seconds later
    // inside waitForFunction with no clue as to why.
    expect(
      response?.status(),
      `${form.route} did not load — on a protected Preview a 401 here means the ` +
        "bypass header did not reach the document, so nothing below can work",
    ).toBe(200);

    await waitForHydration(page, Object.keys(form.fields)[0]!);

    for (const [selector, value] of Object.entries(form.fields)) {
      const input = page.locator(selector).first();
      await expect(
        input,
        `the ${form.kind} form should have a ${selector} field`,
      ).toBeVisible();
      await input.fill(value);
    }

    // Only POSTs caused by THIS click are the submission. Anything the page
    // posted while loading — a Server Action, an analytics beacon, whatever a
    // future dependency adds — is not what this test is about, and folding it
    // into the assertion would make the test fail for a reason that has nothing
    // to do with Finding 8.
    attempts.length = 0;
    await page.getByRole("button", { name: form.submit }).first().click();

    await expect
      .poll(() => attempts.length, {
        message: `the ${form.kind} form never submitted anything`,
        timeout: 10_000,
      })
      .toBeGreaterThan(0);

    // THE FINDING. Every POST must be same-origin, at our proxy.
    for (const url of attempts) {
      expect(url, "a form still posts straight to Formspree").not.toContain(
        "formspree.io",
      );
      expect(new URL(url).pathname, "forms must post to /api/form").toBe(
        "/api/form",
      );
    }
  });
}

test("FM-006 — the Formspree endpoint is no longer shipped to the browser", async ({
  page,
  api,
}) => {
  // Finding 8 also took the endpoint out of the client bundle. It is not a
  // secret, but a public form endpoint in the page source is an invitation to
  // POST around every control the site has — which is exactly what the finding
  // said. The same scan shape as AC-012, and with the same rule: a chunk that
  // cannot be read is a failure, not a skip.
  await page.goto("/contact", { waitUntil: "domcontentloaded" });

  expect(
    await page.content(),
    "the Formspree endpoint is still in the page source",
  ).not.toContain("formspree.io");

  const chunks = (
    await page
      .locator("script[src]")
      .evaluateAll((els) =>
        els.map((e) => (e as HTMLScriptElement).getAttribute("src") ?? ""),
      )
  ).filter((src) => src.includes("/_next/static/"));

  expect(chunks.length, "the page should load some JS chunks").toBeGreaterThan(
    0,
  );

  let scanned = 0;
  const leaked: string[] = [];
  for (const src of chunks) {
    const res = await api.get(src, { failOnStatusCode: false });
    expect(res.status(), `could not read ${src}, so it is not cleared`).toBe(
      200,
    );
    scanned += 1;
    if ((await res.text()).includes("formspree.io")) leaked.push(src);
  }

  expect(scanned, "no chunk was read, so this proved nothing").toBeGreaterThan(
    0,
  );
  expect(leaked, "the Formspree endpoint is still in the bundle").toEqual([]);
});
