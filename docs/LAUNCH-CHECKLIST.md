# Launch Checklist

Three phases that take (Un)Retire from "feature-complete" to "live on `https://www.unretireproject.com` (D-2 resolved 2026-08-25; amended 2026-08-27 — canonical is the www host, apex redirects to it) and verified".
Launch is a checklist, not an event — nothing goes live on a feeling.

---

## Phase 1 — PRE-LAUNCH (days before; nothing here happens on launch day)

### Build completeness
- [ ] All MVP sprints merged to `master`; no sprint half-open.
- [ ] `docs/QA-CHECKLIST.md` passed in full on the current `master` (both parts).
- [ ] 🔴 **Launch Gate passed:** the whole-site test run (`docs/testing-setup/`) is 100% green — GO verdict recorded in the latest `docs/test-reports/` report, from a FULL run on the release candidate. A partial run never counts. Launch-blocking.
- [ ] `docs/SECURITY-CHECKLIST.md` passed in full — every blocking item resolved, not deferred.
- [ ] Post-launch items live in the backlog, not in your head.
- [ ] Database sites: a full restore from backup/PITR has been **rehearsed once** on a non-production copy and the result recorded. An untested backup is not a backup. (DB-less lead data is covered by the conversion-durability rule below.)

### Content
- [ ] Real content everywhere — zero placeholder text, zero `[placeholder]` tokens, zero stock "lorem".
- [ ] The locked facts/numbers list verified: every exact claim the site makes is correct and identical site-wide.
- [ ] All images are final assets, optimized, with alt text.
- [ ] Content/CMS sites: editor roles, draft-review-publish flow, redirects, media ownership, backup/export, and client training are approved.

### SEO basics
- [ ] Every page has a unique `<title>` and meta description.
- [ ] OG image set and rendering (test with a share-preview tool).
- [ ] Favicon + app icons present.
- [ ] `sitemap.xml` and `robots.txt` generated and correct.
- [ ] Canonical URL derives from the single public site-URL variable named in `TECH-ARCHITECTURE.md` — not hardcoded.
- [ ] Key pages meet the approved performance budget recorded in `QA-CHECKLIST.md`.

### Legal and tracking
- [ ] Legal pages live (privacy, terms, cookies — whatever the client's jurisdiction requires).
- [ ] Analytics installed IF agreed with the client — and covered by the privacy page.
- [ ] **The measurement instrument for the PRIMARY success metric** is installed and **verified capturing events** — analytics event, form-tool dashboard, or DB count. The one number that defines success must be measurable on day one, or the project cannot prove it worked.
      ⚠ **owner input required — no predevelopment pack exists for this project (development-stage retrofit).** The primary *conversion* is recorded (paid enrollment via Stripe Checkout — course $99 or Premium $199/yr; `docs/TECH-ARCHITECTURE.md` §1), but no success **metric**, target number, measurement window, or named measurement tool has been approved. Owner names the metric and the instrument before launch; record both in `docs/PROJECT-STATUS.md`. This item stays open until they exist — it is not satisfied by "Stripe records payments".
- [ ] **Consent mechanism (where the jurisdiction requires prior consent):** the consent gate actually blocks third-party/analytics scripts **before** consent (verified in the browser, not just a banner present), and a data retention/erasure path exists.

### Conversion durability & deliverability
- [ ] The primary conversion has **≥2 independent capture paths** (e.g. email + provider dashboard / second recipient / store) — a single mailbox is not acceptable.
- [ ] Email-based conversions: **SPF, DKIM, and DMARC** are configured on the sending domain (records added in Phase 2), and a submission from an **external** address lands in the inbox, not spam.

### Monitoring (configured before launch, not after)
- [ ] **Uptime monitor + primary-conversion canary** with alerts to a **named owner**, so a silent failure weeks later (broken form, expired key, provider change) is caught without waiting for the client to notice.
- [ ] **Morning check ready** (`docs/testing-setup/templates/MORNING-CHECK-TEMPLATE.md`): the owner-approved 5–7 `@morning` tests are tagged, the workflow is committed, and the failure email is verified — enable it on launch day. This fulfils the conversion-canary requirement above.
- [ ] **Error tracking live** (`docs/error-tracking/SETUP-CHECKLIST.md`): Sentry installed, Production alert rule on, deliberate test error received and confirmed by the owner.
- [ ] **Domain and SSL expiry monitoring/alerts** enabled with a named owner — the #1 small-site outage is a lapsed renewal.

### Approval
- [ ] Client has seen the full site on the production URL (or final Preview) — desktop and mobile.
- [ ] Client written launch approval received (email or message — in writing, dated).

**Why this matters:** the approval line makes launch the client's decision, on a site they have actually seen.

**Never do this:**
- Never launch with an unresolved security-checklist blocking item.
- Never launch with placeholder content "we'll swap later".

---

## Phase 2 — LAUNCH DAY

- [x] Connect `unretireproject.com` (registrar: GoDaddy; ~~where DNS is parked today — Known issue 27~~ DNS live on Vercel since 2026-08-27 — Known issue 27 resolved) to `Vercel`; add only the provider-specified DNS records. — done 2026-08-27: `https://www.unretireproject.com` serves the app; apex 308-redirects to www.
- [ ] Email-based conversions: add the sending domain's **SPF, DKIM, and DMARC** DNS records alongside the host records.
- [x] Wait for DNS to propagate and SSL to issue — the padlock must be valid before you announce anything. — done 2026-08-27: `https://www.unretireproject.com` serves over HTTPS (HTTP 200, `Server: Vercel`).
- [x] Decide www vs apex as canonical; configure the other to 301-redirect to it. — decided 2026-08-27: canonical = `www`; the apex 308-redirects to it (D-2 amended).
- [x] Update the site-URL env var in Production to the real domain, then redeploy
      (env changes do not take effect without a redeploy). — done 2026-08-27 (OWNER-ACTIONS Part 4B L1 + L4; the served `og:url` is `https://www.unretireproject.com`, no trailing slash).
- [x] If auth is in use: add the new domain to the auth provider's redirect allow-list —
      KEEP the old domain listed for a grace period so existing email links still resolve. — `www` and apex entries present since 2026-08-25; Site URL moved to `www` 2026-08-27 (Part 4B L2); `unretire.vercel.app/**` kept as the grace-period entry. *(The delivered-email proof that links land on `www` is still owed — S2.5.)*
- [ ] Verify security headers on the LIVE domain response (`curl -I https://www.unretireproject.com`) —
      config reading is not deployed reality. ⚠ Requires Known issue 46 (no headers configured yet) to be
      closed first — S4.5.

---

## Phase 3 — POST-LAUNCH SMOKE TEST (on the real domain, same day)

- [ ] Every page loads over https on `https://www.unretireproject.com` — click through the full sitemap.
- [ ] Primary conversion flow end-to-end as a real visitor: form validates, submits, confirmation shows.
- [ ] Forms actually deliver: send a REAL test submission from an **external** address and confirm it arrives **in the inbox (not spam)** AND that the **second capture path** also recorded it.
- [ ] Mobile pass on a real phone: home, conversion page, one deep page.
- [ ] Canonical, og:url, sitemap URLs all show the new domain — nothing pinned to the old host.
- [ ] Relaunch only: spot-check the **301/410 redirect map** on the live domain — the top old URLs land on their new destinations, never a bare 404.
- [ ] Search console: property added, ownership verified, sitemap submitted.
- [ ] No accidental `noindex` anywhere — check the live HTML head and response headers.
- [ ] Auth (if in use): sign up / sign in / reset on the live domain; email links land on `https://www.unretireproject.com`.

### Parity residuals — what no Preview can prove (`docs/ENVIRONMENT-PARITY.md` §6 / §7; added by S2.5, 2026-08-28)

A green Preview suite proves the application logic and the wiring of the test-mode dependencies. Each line below
covers something only the real site can show; none may be ticked from a Preview result.

- [ ] **One real purchase at a NON-ZERO amount** — a temporary $1 price, a real card, refunded afterwards — confirmed by
      a success in the **live** Stripe dashboard **and** the `entitlements` row appearing in `unretire-prod` **and** the
      member reaching the content. A 100%-off code does **not** satisfy this line: it skips the card, 3-D Secure,
      capture and payout entirely, and for Premium collects no payment method at all (§6 C14; §9 row 3).
- [ ] **Live Stripe account readiness** (§6 C15), dated by the owner: `charges_enabled` = true, `payouts_enabled` =
      true, `requirements.currently_due` empty, a verified payout destination, business/tax details complete.
- [ ] **Live webhook endpoint read off the dashboard** (§6 C16): `brilliant-splendor`'s URL is
      `https://www.unretireproject.com/api/stripe/webhook`, **both** `checkout.session.completed` and
      `customer.subscription.deleted` are subscribed, and its API version is recorded.
- [ ] **One real `/assess` submission, end to end** (Known issue 53; added by S2.5 Round 2, 2026-08-30) — the
      audience's thirteen merge tags are proven to **exist** (ENVIRONMENT-PARITY §5.4, verbatim owner read), but no
      test posts them: submit the Wheel of Life once, then confirm in Mailchimp that `WEAKEST`, `WEAKLOW`,
      `BRIGHTEST`, `SCORE` and all eight `S_*` fields hold the submitted values and that the `wheel-of-life` tag
      started the intended Customer Journey. `/api/subscribe` swallows a failed tag call, so a silent no-op here
      is invisible from the response.
- [ ] **Prod-vs-test schema and policy diff re-run and empty** (proof P8, §5.6) — the committed
      `supabase/migrations/` files are the intent; the diff is the proof both databases still match them.
- [ ] **Production has no deployment protection; Preview does** (proof P10): `https://www.unretireproject.com` answers
      200 with no bypass; a Preview URL without the bypass does not.
- [ ] **Auth smoke on the real domain** (§6 C6): sign in, sign out, the session survives a refresh, and a password reset
      requested on the live site resolves to `https://www.unretireproject.com/…` (proof P13's email half).
- [ ] **Manual bot-check negative on Production** once abuse controls exist (§6 C10; S4.5): the real widget rejects a
      scripted submission, and the server-side verification-failure path fails closed.

### The 48-hour watch
- [ ] Monitor errors (host logs / error tracker) and form deliveries for 48 hours.
- [ ] Log every issue found to the post-launch backlog with severity.
- [ ] Fix via the normal workflow: branch → build → local checks → PR → deployed Preview (Vercel or approved equivalent) → Codex review → merge → Production smoke test.

**Never do this:**
- Never hotfix directly on `master` in a launch-day panic — if production is broken, use `docs/ROLLBACK.md`.
- Never mark launch "done" without a real test submission delivered.

Next step → if anything breaks in production, `docs/ROLLBACK.md`. When the dust settles, `docs/HANDOFF.md`.
