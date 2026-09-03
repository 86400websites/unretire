# Launch Checklist

Three phases that take (Un)Retire from "feature-complete" to "live on `https://www.unretireproject.com` (D-2 resolved 2026-08-25; amended 2026-08-27 — canonical is the www host, apex redirects to it) and verified".
Launch is a checklist, not an event — nothing goes live on a feeling.

---

## Phase 1 — PRE-LAUNCH (days before; nothing here happens on launch day)

> **Run record (S5.2, 2026-09-03):** every line below is marked from evidence gathered on 2026-09-03 against the live
> domain and the merged `master` (`d825ca0`, PR #31), never from a Preview result where the line forbids it. A tick
> carries its evidence; an unticked line carries either a decision ID (a recorded exception) or the owner action that
> closes it. Nothing is ticked silently. The line-by-line write-up is `docs/test-reports/2026-09-03-launch-report.md`.

### Build completeness
- [x] All MVP sprints merged to `master`; no sprint half-open. — verified 2026-09-03: every build sprint is merged (last: S5.1c as PR #29 `9d34a5e`, its close-out as PR #31 `d825ca0`); S5.2 — this checklist — is the only open sprint. ⚠ One stray open PR, **#30 `feat/live-9` → `master`** (title "description", **0 files changed**), is not a sprint and is flagged for the owner to close.
- [ ] `docs/QA-CHECKLIST.md` passed in full on the current `master` (both parts). — ⚠ **NOT VERIFIED 2026-09-03:** no record of a full run of both parts exists in `docs/PROJECT-STATUS.md`; Part 2's browser evidence is covered in part by the S5.1b full run (PG-001 at desktop + 390 px on every public route) and the S4.5c/S5.1b sprint QA, but the mobile/accessibility audit that would complete it is Sprint **S4.1 (Not Started)**. Disposition: **D-36** (owner accepts as a post-launch item or schedules S4.1).
- [x] 🔴 **Launch Gate passed:** the whole-site test run (`docs/testing-setup/`) is 100% green — GO verdict recorded in the latest `docs/test-reports/` report, from a FULL run on the release candidate. A partial run never counts. Launch-blocking. — ✅ **GO 2026-09-01** (`docs/test-reports/2026-09-01-test-report.md`: 221/221 at `f8702f1`, PR #28). The release candidate moved once more after the GO (S5.1c, PR #29 — four `src/`/`tests/` files) and the full `E2E — Preview [deployment_status]` run stayed green at every S5.1c head (215/215; last 33785773775 at `5d469e7`, content-identical to the merged `d825ca0`).
- [x] `docs/SECURITY-CHECKLIST.md` passed in full — every blocking item resolved, not deferred. — verified 2026-09-03: the §10 launch-blocking set is fully struck; §9 invariants I1–I8 all read **MET** (I5/I7/I8 by spec since S4.5c; I1/I2 certified for the worksheet path by the S5.1c independent review; I3/I4/I6 by the S3.1/S4.5c sprints and their audits). Recorded gap, not a deferred item: the S4.5c per-PR review itself was **waived under D-31** (the review was deferred, no finding was).
- [x] Post-launch items live in the backlog, not in your head. — `docs/POST-LAUNCH-BACKLOG.md` (Known issues 58 and 59 filed 2026-09-03; plus the D-36 residuals from this run).
- [ ] Database sites: a full restore from backup/PITR has been **rehearsed once** on a non-production copy and the result recorded. An untested backup is not a backup. (DB-less lead data is covered by the conversion-durability rule below.) — ⚠ **NOT DONE 2026-09-03:** no rehearsal is recorded anywhere (`docs/TECH-ARCHITECTURE.md` §7 still says "no backup/PITR plan recorded — owner to confirm Supabase backup settings"); it was S4.6 (d), which never opened. Disposition: **D-36** (owner: rehearse a restore of `unretire-prod`'s backup into a throwaway project and record the result, or accept the risk with a date).

### Content
- [x] Real content everywhere — zero placeholder text, zero `[placeholder]` tokens, zero stock "lorem". — PG-010 (eleven marketing routes) green on the GO run and on every run since; the invented social proof was removed in S4.5 (Known issue 9).
- [x] The locked facts/numbers list verified: every exact claim the site makes is correct and identical site-wide. — PG-005 (prices identical on `/`, `/premium`, `/learn/course`) and PG-006 (one lesson-count claim everywhere, Known issue 8) green; source `docs/content/locked-facts.md`.
- [ ] All images are final assets, optimized, with alt text. — ⚠ **NOT VERIFIED 2026-09-03:** no spec or audit covers alt text or image weight; it belongs to the S4.1 mobile + accessibility audit (Not Started). Disposition: **D-36**.
- [x] Content/CMS sites: editor roles, draft-review-publish flow, redirects, media ownership, backup/export, and client training are approved. — **N/A**: no CMS (scope fence in `CLAUDE.md`); all content is in-repo.

### SEO basics
- [x] Every page has a unique `<title>` and meta description. — PG-011 asserts distinct, non-empty titles on the five key pages; the root layout supplies a title template and the site description. **Limit:** four pages (`/articles`, `/community`, `/framework`, `/journeys` — three of them the D-3 legacy pages) export no metadata of their own and inherit the root description; recorded, not hidden.
- [x] OG image set and rendering (test with a share-preview tool). — PG-011 asserts `og:image` exists, is absolute and is not localhost on the deployed build; the served `og:url` is `https://www.unretireproject.com` (read 2026-09-03). The share-preview-tool render is an optional owner spot-check.
- [x] Favicon + app icons present. — `favicon.ico` (256 px) and `icon.png` (512 px) both linked in the live `<head>` (read 2026-09-03).
- [x] `sitemap.xml` and `robots.txt` generated and correct. — live 2026-09-03: `/sitemap.xml` 200 with 32 URLs all on the canonical origin (every one answers 200), `/robots.txt` 200 with `Allow: /`, `Disallow: /api/`, `Disallow: /account`, the `Sitemap:` line; Google Search Console accepted the sitemap (Status Success, 32 pages — owner evidence, `PROJECT-STATUS.md` §1).
- [x] Canonical URL derives from the single public site-URL variable named in `TECH-ARCHITECTURE.md` — not hardcoded. — `metadataBase`, `og:url`, the sitemap and the robots `Host`/`Sitemap` lines all derive from `NEXT_PUBLIC_SITE_URL` through `src/lib/site-url.ts`. **Limit:** the app emits no `<link rel="canonical">` tag (PG-011 note); Search Console indexes from the sitemap, so this is a backlog nicety, not a launch defect.
- [ ] Key pages meet the approved performance budget recorded in `QA-CHECKLIST.md`. — ⚠ **NOT MEASURED 2026-09-03:** no performance run is recorded for this site. Disposition: **D-36** (owner accepts or schedules with S4.1).

### Legal and tracking
- [x] Legal pages live (privacy, terms, cookies — whatever the client's jurisdiction requires). — `/privacy` and `/terms` live (S4.5, Known issue 3; PG-003 asserts the footer links open real pages; both 200 on the live domain 2026-09-03). No cookie banner: see the consent line below.
- [x] Analytics installed IF agreed with the client — and covered by the privacy page. — **N/A**: none agreed, none installed (Known issue 13, parked in the backlog).
- [ ] **The measurement instrument for the PRIMARY success metric** is installed and **verified capturing events** — analytics event, form-tool dashboard, or DB count. The one number that defines success must be measurable on day one, or the project cannot prove it worked.
      ⚠ **owner input required — no predevelopment pack exists for this project (development-stage retrofit).** The primary *conversion* is recorded (paid enrollment via Stripe Checkout — course $99 or Premium $199/yr; `docs/TECH-ARCHITECTURE.md` §1), but no success **metric**, target number, measurement window, or named measurement tool has been approved. Owner names the metric and the instrument before launch; record both in `docs/PROJECT-STATUS.md`. This item stays open until they exist — it is not satisfied by "Stripe records payments". — ⚠ **STILL OPEN 2026-09-03 — surfaced, not ticked: open decision D-35.** What exists today and could serve as the instrument once a metric is named: the live Stripe dashboard (payments) and the `entitlements` table in `unretire-prod` (a DB count of active course/premium rows).
- [ ] **Consent mechanism (where the jurisdiction requires prior consent):** the consent gate actually blocks third-party/analytics scripts **before** consent (verified in the browser, not just a banner present), and a data retention/erasure path exists. — 2026-09-03: **no analytics or tracking script loads at all** (live CSP `script-src 'self' 'unsafe-inline'`, `connect-src 'self'`). The one third-party embed is YouTube on the course pages (`www.youtube.com/embed`, not the `-nocookie` host), which can set cookies before any consent. Whether the audience's jurisdiction requires a gate for that is the owner's call — **D-36**; no gate is claimed.

### Conversion durability & deliverability
- [x] The primary conversion has **≥2 independent capture paths** (e.g. email + provider dashboard / second recipient / store) — a single mailbox is not acceptable. — Paid enrollment: the live Stripe dashboard **and** the `entitlements` row written by the webhook (**and** the Supabase auth user). The three forms: `/api/form` → Formspree dashboard **and** the owner's inbox. (The secondary conversion, e-mail capture, has one path — the Mailchimp audience — which is acceptable for a secondary.)
- [ ] Email-based conversions: **SPF, DKIM, and DMARC** are configured on the sending domain (records added in Phase 2), and a submission from an **external** address lands in the inbox, not spam. — **Half done 2026-09-03:** the DNS half is verified (Phase 2 below); the inbox half — a real submission from an external address landing in the inbox, not spam — is **MN-002**, still owed by the owner.

### Monitoring (configured before launch, not after)
- [ ] **Uptime monitor + primary-conversion canary** with alerts to a **named owner**, so a silent failure weeks later (broken form, expired key, provider change) is caught without waiting for the client to notice. — 2026-09-03: the **canary** is the morning check (next line). There is **no uptime monitor** (nothing polls the site between morning checks; Vercel sends no downtime alert by default). Disposition: **D-36** (a free external monitor with e-mail alerts to the owner, ~5 minutes, or accept a ≤24 h detection window).
- [ ] **Morning check ready** (`docs/testing-setup/templates/MORNING-CHECK-TEMPLATE.md`): the owner-approved 5–7 `@morning` tests are tagged, the workflow is committed, and the failure email is verified — enable it on launch day. This fulfils the conversion-canary requirement above. — **Nearly complete, S5.2 (2026-09-04).** ✅ Seven read-only tests **owner-approved in writing** (Part 8.1) and tagged, proven 14/14 (two viewports) against a local production build and against the live domain; the workflow is wired (`E2E_MORNING=1`; production admitted for that lane only; every secret refused) and **committed**; both repository variables are **set and verified from the GitHub API** (Part 8.2). ⚠ **This line stays unticked on one clause: "the failure email is verified" — it is not.** The owner declined the deliberate-failure test (**D-37**, 2026-09-04), so the alert channel is configured but unproven. The line closes when either D-37's two-minute test is run or a genuine failure arrives with its e-mail. *(Previously, 2026-09-03: in progress; all four items above were still owed.)*
- [ ] ~~**Error tracking live** (`docs/error-tracking/SETUP-CHECKLIST.md`): Sentry installed, Production alert rule on, deliberate test error received and confirmed by the owner.~~ — **RECORDED EXCEPTION, D-28 (2026-08-30):** removed from the pre-launch path by the owner; the morning check is the named compensating control; `docs/error-tracking/` stays for post-launch adoption.
- [ ] **Domain and SSL expiry monitoring/alerts** enabled with a named owner — the #1 small-site outage is a lapsed renewal. — ⚠ **NOT VERIFIED 2026-09-03:** the certificate is Vercel-managed (auto-renewed while DNS points at Vercel); the domain renewal is at GoDaddy and its auto-renew/alert setting is not recorded. Disposition: **D-36** (owner confirms GoDaddy auto-renew is on and the renewal e-mail goes to a monitored address).

### Approval
- [ ] Client has seen the full site on the production URL (or final Preview) — desktop and mobile. — Owner action: the owner has (2026-09-02, real purchases on the live domain from an iPhone); the client's own walk-through is not recorded.
- [ ] Client written launch approval received (email or message — in writing, dated). — The **owner's** written instruction to launch is recorded (2026-09-01 "lets launch now", S5.1b; 2026-09-03 D-34 "leave as is … I will merge the PR"). Whether that stands as the **client's** approval, or a separate dated message from the client exists, is for the owner to record here.

**Why this matters:** the approval line makes launch the client's decision, on a site they have actually seen.

**Never do this:**
- Never launch with an unresolved security-checklist blocking item.
- Never launch with placeholder content "we'll swap later".

---

## Phase 2 — LAUNCH DAY

- [x] Connect `unretireproject.com` (registrar: GoDaddy; ~~where DNS is parked today — Known issue 27~~ DNS live on Vercel since 2026-08-27 — Known issue 27 resolved) to `Vercel`; add only the provider-specified DNS records. — done 2026-08-27: `https://www.unretireproject.com` serves the app; apex 308-redirects to www.
- [x] Email-based conversions: add the sending domain's **SPF, DKIM, and DMARC** DNS records alongside the host records. — verified 2026-09-03 by DNS lookup: DKIM CNAMEs `k2._domainkey` → `dkim2.mcsv.net` and `k3._domainkey` → `dkim3.mcsv.net` (Mailchimp domain authentication, D-33); `_dmarc` TXT `v=DMARC1; p=none;`; SPF TXT `v=spf1 include:secureserver.net -all` (GoDaddy mail; Mailchimp signs with its own envelope domain and needs no SPF include). Auth mail goes out through Supabase's built-in mailer (D-33), which sends from Supabase's own domain — no record of ours applies to it.
- [x] Wait for DNS to propagate and SSL to issue — the padlock must be valid before you announce anything. — done 2026-08-27: `https://www.unretireproject.com` serves over HTTPS (HTTP 200, `Server: Vercel`).
- [x] Decide www vs apex as canonical; configure the other to 301-redirect to it. — decided 2026-08-27: canonical = `www`; the apex 308-redirects to it (D-2 amended).
- [x] Update the site-URL env var in Production to the real domain, then redeploy
      (env changes do not take effect without a redeploy). — done 2026-08-27 (OWNER-ACTIONS Part 4B L1 + L4; the served `og:url` is `https://www.unretireproject.com`, no trailing slash).
- [x] If auth is in use: add the new domain to the auth provider's redirect allow-list —
      KEEP the old domain listed for a grace period so existing email links still resolve. — `www` and apex entries present since 2026-08-25; Site URL moved to `www` 2026-08-27 (Part 4B L2); `unretire.vercel.app/**` kept as the grace-period entry. *(The delivered-email proof that links land on `www` is still owed — S2.5.)*
- [x] Verify security headers on the LIVE domain response (`curl -I https://www.unretireproject.com`) —
      config reading is not deployed reality. ~~⚠ Requires Known issue 46 (no headers configured yet) to be
      closed first — S4.5.~~ — verified 2026-09-03 on the live response: `Content-Security-Policy` (the §6 set, no `vercel.live` in Production), `Permissions-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (2 y, includeSubDomains, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`. Known issue 46 closed in S4.5.

---

## Phase 3 — POST-LAUNCH SMOKE TEST (on the real domain, same day)

- [x] Every page loads over https on `https://www.unretireproject.com` — click through the full sitemap. — 2026-09-03: all 32 sitemap URLs answer 200 over https, plus the eight public routes the sitemap deliberately omits (`/articles`, `/framework`, `/journeys`, `/forgot-password`, `/login`, `/signup`, a blog article, a course module page); a nonsense URL answers the branded 404.
- [x] Primary conversion flow end-to-end as a real visitor: form validates, submits, confirmation shows. — done by the **owner on 2026-09-02**: a real Course checkout and a real Premium checkout on the live domain, both entitlements written by the live webhook (auth-log timeline in `PROJECT-STATUS.md` §10 row 58). **Exception on the record:** the Course return trip landed on `/login` instead of the confirmation (Known issue 58, launched with under D-34); the Premium return trip showed the confirmation.
- [ ] Forms actually deliver: send a REAL test submission from an **external** address and confirm it arrives **in the inbox (not spam)** AND that the **second capture path** also recorded it. — Owner action (feature line **IN-004**, owed since the GO): one real contact-form submission from an external address → inbox + the Formspree dashboard.
- [ ] Mobile pass on a real phone: home, conversion page, one deep page. — Owner action: the 2026-09-02 purchases were made from an iPhone (conversion page ✓); home and one deep page on the phone are for the owner to confirm here.
- [x] Canonical, og:url, sitemap URLs all show the new domain — nothing pinned to the old host. — 2026-09-03: `og:url` = `https://www.unretireproject.com`; every sitemap `<loc>` and the robots `Host`/`Sitemap` lines are on the www host; no localhost or Preview host anywhere.
- [x] Relaunch only: spot-check the **301/410 redirect map** on the live domain — the top old URLs land on their new destinations, never a bare 404. — **N/A** (first launch on this domain; no old URL map). Note for the backlog: the previous address `https://unretire.vercel.app` still serves the site with 200 rather than redirecting — Known issue 58, first post-launch fix sprint.
- [x] Search console: property added, ownership verified, sitemap submitted. — owner evidence 2026-09-03 (`PROJECT-STATUS.md` §1): URL-prefix property verified by the HTML-file method, sitemap submitted and accepted (Status Success, 32 discovered pages); the token file answers 200 on the live domain.
- [x] No accidental `noindex` anywhere — check the live HTML head and response headers. — 2026-09-03: no `x-robots-tag` header and no `<meta name="robots">` on the live home page; the `@morning` SEO test now re-checks this daily.
- [ ] Auth (if in use): sign up / sign in / reset on the live domain; email links land on `https://www.unretireproject.com`. — **Sign-in on the live domain: done** (the owner's password logins on 2026-09-02, production auth logs). **Still owed by the owner:** one sign-up and one password reset on the live domain, confirming the e-mailed link lands on `https://www.unretireproject.com/…` (the P13 e-mail half; remember the 2-per-hour built-in mailer cap, D-33).

### Parity residuals — what no Preview can prove (`docs/ENVIRONMENT-PARITY.md` §6 / §7; added by S2.5, 2026-08-28)

A green Preview suite proves the application logic and the wiring of the test-mode dependencies. Each line below
covers something only the real site can show; none may be ticked from a Preview result.

- [ ] **One real purchase at a NON-ZERO amount** — a temporary $1 price, a real card, refunded afterwards — confirmed by
      a success in the **live** Stripe dashboard **and** the `entitlements` row appearing in `unretire-prod` **and** the
      member reaching the content. A 100%-off code does **not** satisfy this line: it skips the card, 3-D Secure,
      capture and payout entirely, and for Premium collects no payment method at all (§6 C14; §9 row 3).
      — Owner to record: the 2026-09-02 live purchases wrote both entitlement rows, but whether either was charged at a
      **non-zero** amount is not on the record (Known issue 59 shows `FREE` applied to Premium at $0.00 on 2026-09-03).
      If the Course purchase was a real $99 charge, this line is met by it — write the charge ID and amount here.
- [ ] **Live Stripe account readiness** (§6 C15), dated by the owner: `charges_enabled` = true, `payouts_enabled` =
      true, `requirements.currently_due` empty, a verified payout destination, business/tax details complete.
      — Owner action (dashboard read; cannot be verified from the repo or any test).
- [ ] **Live webhook endpoint read off the dashboard** (§6 C16): `brilliant-splendor`'s URL is
      `https://www.unretireproject.com/api/stripe/webhook`, **both** `checkout.session.completed` and
      `customer.subscription.deleted` are subscribed, and its API version is recorded.
      — **Partly on record:** URL verified 2026-08-27 (OWNER-ACTIONS Part 4B L3, signature check answered "Invalid
      signature" from the live address); API version `2026-07-29.dahlia` (Known issue 31). **Owed:** the owner reads the
      subscribed events off the dashboard and confirms both are ticked.
- [ ] **One real `/assess` submission, end to end** (Known issue 53; added by S2.5 Round 2, 2026-08-30) — the
      audience's thirteen merge tags are proven to **exist** (ENVIRONMENT-PARITY §5.4, verbatim owner read), but no
      test posts them: submit the Wheel of Life once, then confirm in Mailchimp that `WEAKEST`, `WEAKLOW`,
      `BRIGHTEST`, `SCORE` and all eight `S_*` fields hold the submitted values and that the `wheel-of-life` tag
      started the intended Customer Journey. `/api/subscribe` swallows a failed tag call, so a silent no-op here
      is invisible from the response. — Owner action (it writes a real contact to the live audience; not for an agent to do unasked — D-22 rule 2b).
- [x] **Prod-vs-test schema and policy diff re-run and empty** (proof P8, §5.6) — the committed
      `supabase/migrations/` files are the intent; the diff is the proof both databases still match them.
      — re-run **2026-09-03, read-only, both projects:** the same three `public` tables (`book_downloads`, `entitlements`,
      `rate_limits`), RLS **on** for all three, identical policies (2 / 1 / 0), and `increment_rate_limit` is
      `SECURITY INVOKER` with EXECUTE granted to `postgres` and `service_role` only, in both. One difference, harmless
      and test-only: `unretire-test` carries an extra `rls_auto_enable()` helper that no migration defines and Production
      does not have. Production's migration-history table is empty (its schema was hand-applied, as S2.5 recorded).
- [x] **Production has no deployment protection; Preview does** (proof P10): `https://www.unretireproject.com` answers
      200 with no bypass; a Preview URL without the bypass does not. — 2026-09-03: `www` **200** with no bypass; the S5.1b
      Preview `unretire-1gbvflsep-86400-s-projects.vercel.app` answers **302** to Vercel's login without one.
- [ ] **Auth smoke on the real domain** (§6 C6): sign in, sign out, the session survives a refresh, and a password reset
      requested on the live site resolves to `https://www.unretireproject.com/…` (proof P13's email half).
      — Sign-in: done by the owner 2026-09-02. **Owed:** sign-out, a refresh, and the password-reset e-mail (see the auth line above).
- [x] **Manual bot-check negative on Production** once abuse controls exist (§6 C10; S4.5): the real widget rejects a
      scripted submission, and the server-side verification-failure path fails closed. — **N/A as written:** the abuse
      control this project selected is a server-side rate limit (S4.5, `src/lib/rate-limit.ts`), not a widget, and it uses
      no environment-specific keys — so, unlike a CAPTCHA, Preview exercises the **same** code path Production runs.
      Fail-closed is proven by PR-001/PR-002 on every deployed run (last 33785773775, 2026-09-03) and by the migrations
      `0003`/`0004` verified applied to `unretire-prod` on 2026-08-31 (Blocker 8). No burst was sent at Production: it
      would write real rate-limit rows for no additional proof.

### The 48-hour watch
- [ ] Monitor errors (host logs / error tracker) and form deliveries for 48 hours. — **Running: launched 2026-09-03.** Vercel logs + the owner's inbox (no error tracker — D-28); the morning check joins once enabled.
- [ ] Log every issue found to the post-launch backlog with severity. — `docs/POST-LAUNCH-BACKLOG.md` (two rows filed on launch day already: Known issues 58 and 59).
- [ ] Fix via the normal workflow: branch → build → local checks → PR → deployed Preview (Vercel or approved equivalent) → Codex review → merge → Production smoke test.

**Never do this:**
- Never hotfix directly on `master` in a launch-day panic — if production is broken, use `docs/ROLLBACK.md`.
- Never mark launch "done" without a real test submission delivered.

Next step → if anything breaks in production, `docs/ROLLBACK.md`. When the dust settles, `docs/HANDOFF.md`.
