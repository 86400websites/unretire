import { test, expect } from "../fixtures";
import { assertOrigin, ownerAddress } from "../helpers/parity";

/**
 * ROADMAP S2.5 acceptance (4) — the /api/subscribe contract against the ONE live Mailchimp
 * audience (decision D-22: there is no test audience, by decision). Governed by D-22 rules
 * 1 and 2a–2e (docs/PROJECT-STATUS.md §8): the address is the owner's own mailbox with a
 * `+ur-test-…` tag, never a fabricated one; the contact is torn down by the owner's
 * documented archive after the read (D-24's fallback — the archive fixture lands in S5.1);
 * this spec lives in the parity project only and never in @morning; nothing here can
 * trigger a campaign send.
 *
 * The spec asserts what is synchronously assertable (rule 2d): the endpoint's own
 * response and the on-page confirmation. The tag (`starter-plan`) and merge field (FNAME)
 * are the owner's dashboard read, recorded against the audience's merge-tag/tag list
 * (docs/ENVIRONMENT-PARITY.md §5.4).
 */
test("acceptance (4) — an email capture on the Preview satisfies the /api/subscribe contract", async ({
  page,
  baseURL,
}) => {
  const address = ownerAddress("ur-test-s25");
  await test.info().attach("subscribe-address", {
    body: address,
    contentType: "text/plain",
  });

  await page.goto("/");
  await assertOrigin(page, baseURL);

  const form = page
    .locator("form", { has: page.locator("#ur-ec-email") })
    .first();
  await form.locator("#ur-ec-first").fill("E2E");
  await form.locator("#ur-ec-email").fill(address);

  const responsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/subscribe" &&
      response.request().method() === "POST",
  );
  await form.getByRole("button", { name: "Subscribe", exact: true }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ success: true });
  // The page renders a straight apostrophe (`You&apos;re`); match either form.
  await expect(page.getByRole("status")).toContainText(/You.re in/);
});
