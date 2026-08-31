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
    // Record where the page tries to send the submission, and let nothing out.
    const attempts: string[] = [];
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (request.method() === "POST") {
        attempts.push(request.url());
        // Answer as the proxy would on success, so the form reaches its done
        // state and the test can tell "submitted" from "silently failed".
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
        return;
      }
      // `fallback()`, NOT `continue()`. This is the whole reason the three
      // FM-005 tests failed on the deployed Preview while passing locally.
      //
      // tests/e2e/fixtures.ts registers a context-level route that attaches the
      // Vercel Protection Bypass header to same-origin requests. Handlers run
      // most-recently-registered first, so this page-level one runs BEFORE it —
      // and `route.continue()` sends the request immediately, skipping every
      // remaining handler. On a protected Preview that means no bypass header,
      // Vercel answers 401 to the document itself, React never hydrates, and
      // the hydration probe below times out with no clue as to why. `fallback()`
      // passes the request down the chain so the bypass is still applied.
      //
      // Localhost has no protection, so nothing about this was observable in a
      // local run — the same blind spot that produced Known issue 49's sibling
      // in S5.1a, when the bypass never reached API-style requests.
      await route.fallback();
    });

    await page.goto(form.route, { waitUntil: "load" });
    await waitForHydration(page, Object.keys(form.fields)[0]!);

    for (const [selector, value] of Object.entries(form.fields)) {
      const input = page.locator(selector).first();
      await expect(
        input,
        `the ${form.kind} form should have a ${selector} field`,
      ).toBeVisible();
      await input.fill(value);
    }

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
