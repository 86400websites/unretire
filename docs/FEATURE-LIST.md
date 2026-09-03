# Feature List — (Un)Retire

> Everything the site does, one plain-English line each. **Everything on this list gets tested; nothing off this list does.** Drafted by Claude Code from a full scan of the code plus the approved docs (`docs/TECH-ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/content/`); approved by the owner before any test is written.

- Source scan date: 2026-08-30 · Repo head: `baa1d92`
- Scan basis: 28 page routes, 5 route handlers, 1 server-actions file, 12 form components, 3 signed-in roles
- Test users (non-production `unretire-test` only): roles `signed-in` (no entitlement) · `course` (owns course) · `premium` (owns premium). Credentials are read from environment variable **names** only — never written here.
- **Owner approval: [NAME], [DATE]** ← no tests are written until this line is filled.

**How to read a line:** `ID | Who can do what | What proves it worked`. If a plain-English line here is wrong or missing, the tests will be too — this list is where your ten minutes matter most.

**The "Expected today" column** is this list's one addition to the standard template, and it is the reason for running the gate now: a line marked 🔴 is one we already know is broken, with the `docs/PROJECT-STATUS.md` §10 issue number that describes it. Those specs are written to **fail on purpose today** and become the fix queue. A line marked ⚪ is untested and genuinely unknown — that is where new bugs will surface.

---

## A. Pages & content

| ID | Feature | Proof of PASS | Expected today |
|---|---|---|---|
| PG-001 | Every one of the 28 public pages loads with no errors, on desktop and on a 390px phone | Page renders, zero console errors, no horizontal scroll | ⚪ |
| PG-002 | Every link on every page goes somewhere real | No 404s, no dead anchors | 🔴 **#4** — 7 `/framework/practice-*` and 7 `/journeys/*` links point at pages that do not exist |
| PG-003 | The footer Privacy and Terms links open real pages | Both render owner-approved legal copy | 🔴 **#3** — both 404; you cannot lawfully take payment without them |
| PG-004 | A wrong URL shows the site's own 404 page | Branded 404, not a blank error | ⚪ |
| PG-005 | Home shows the book, course and Premium offers with correct prices | `$99` course and `$199/year` Premium visible and consistent with `/premium` | ⚪ |
| PG-006 | The course page states the same lesson count as the course itself | Home and `/book` copy match `courseData.totalLessons` (48) | 🔴 **#8** — home says "Thirty-one lessons", course data totals 48 |
| PG-007 | Testimonials and community numbers on `/book`, `/stories`, `/community` are real | No placeholder text; stats traceable to `docs/content/locked-facts.md` | 🔴 **#9** — placeholder "Reader name" testimonials and unverified "340+ Members, 18 Countries" |
| PG-008 | `/blog` lists posts and each `/blog/[slug]` opens | Index renders; every listed slug resolves | ⚪ |
| PG-009 | `/learn/course` shows the ten modules, locked, to a visitor who has not paid | Ten module rows, padlock icon, buy CTA | ⚪ |
| PG-010 | Marketing pages `/about` `/framework` `/practice` `/journeys` `/start` `/tools` `/speaking` `/podcast` `/newsletter` `/enterprise` `/articles` render their approved copy | Approved copy present per `docs/content/page-copy/` | ⚪ |
| PG-011 | Page titles, descriptions and social-share images resolve to the live domain | `metadataBase` produces `https://www.unretireproject.com/...`, not `localhost` | ⚪ |

## B. Accounts & access

| ID | Feature | Proof of PASS | Expected today |
|---|---|---|---|
| AC-001 | A visitor can create an account | Account exists in `unretire-test`; the confirmation branch Production actually uses completes | ⚪ |
| AC-002 | A member can log in and log out | Lands on `/account`; session ends on logout | ⚪ |
| AC-003 | Password reset works end to end | Reset email arrives (test hook), the link lands on **this** environment, and the new password works | 🔴 **#2** — `next=/unretire/reset-password` 404s after the promote-to-root refactor |
| AC-010 | **A signed-out visitor cannot open `/account`** | Redirected to `/login` — never the content | ⚪ |
| AC-011 | **A signed-in member with no purchase cannot open any course module** | Denied — never the lesson video or worksheet | 🔴 **#37** — the gate is an `unlocked` prop passed into a client component |
| AC-012 | **The paid course content is not obtainable without paying, by any route** | An anonymous request for a lesson video ID or a worksheet PDF is refused *server-side*, not merely hidden in the UI | 🔴 **#37** — all 48 lessons' video IDs and worksheet paths ship in the client bundle; 4 worksheet PDFs sit in `public/assets/unretire/course/` and are fetchable by anyone |
| AC-013 | **A member without Premium cannot download the book or workbook** | `/api/book-download` refuses | ⚪ (server-side gate confirmed present at `route.ts:44-45`) |
| AC-014 | **An auth-email link cannot be redirected off-site** | `?next=//evil.example` and `?next=/\evil.example` are both refused | 🔴 **#38** — `startsWith("/")` admits protocol-relative URLs; this is an open redirect |
| AC-015 | A Premium member reaches everything a course member reaches | Premium passes the `course` check | ⚪ |

## C. Forms & email

| ID | Feature | Proof of PASS | Expected today |
|---|---|---|---|
| FM-001 | The newsletter and email-capture forms reject a malformed address with a clear message | Inline error, nothing sent | ⚪ |
| FM-002 | A valid newsletter signup reaches Mailchimp with the right tag | Test hook confirms the contact and its source tag | ⚪ |
| FM-003 | The 14-Day Starter Plan download gate captures the email and delivers the file | Contact created, download starts | ⚪ |
| FM-004 | The Wheel of Life assessment submits results and captures the email | `/assess` completes and writes to Mailchimp | 🔴 **#53** — no test exercises `/assess`; the path is unproven end to end |
| FM-005 | The contact form delivers to the owner | Formspree accepts the submission | ⚪ |
| FM-006 | The community join form delivers to the owner | Formspree accepts the submission | ⚪ |
| FM-007 | The enterprise discovery-call form delivers to the owner | Formspree accepts the submission | ⚪ |
| FM-008 | A form failure tells the truth — it never shows success when nothing was sent | Honest error state, no false confirmation | ⚪ |
| FM-009 | A form error never shows the visitor the upstream provider's own words | User-facing message is fixed; only a safe identifier is logged | 🔴 **#44** — raw Mailchimp `detail` is logged and returned to the browser |
| FM-010 | Account emails actually arrive at real-world volume | The 3rd, 5th and 10th signup or reset in the same hour all receive their email | 🔴 **#50** — Production Supabase uses the built-in mailer, capped at **2 emails per hour project-wide** |

## D. Payments *(Stripe test mode only)*

| ID | Feature | Proof of PASS | Expected today |
|---|---|---|---|
| PY-001 | The $99 course can be bought with a test card | Checkout completes, success page shown, test-mode record exists | ⚪ |
| PY-002 | The $199/year Premium subscription can be bought with a test card | Checkout completes, subscription active in test mode | ⚪ |
| PY-003 | After paying, the customer lands on a working page | `success_url` resolves | 🔴 **#2** — `success_url` points at `/unretire/account?checkout=success`, which 404s |
| PY-004 | **Paying actually grants access** — the entitlement is written, and access is only claimed when it was | The course unlocks after the test-mode webhook; the "Payment successful" message appears only when an entitlement exists | 🔴 **#22 + #45** — the webhook returns HTTP 200 even when the entitlement write fails, so Stripe never retries; and `/account` prints "Payment successful… your access is ready" from the URL alone. **The customer pays, receives nothing, and is told everything worked.** |
| PY-005 | A declined test card shows an honest failure and grants nothing | Clear error, no entitlement written | ⚪ |
| PY-006 | Double-clicking Buy does not create two charges | One test-mode charge, one record | 🔴 **#40** — no idempotency key on Checkout Session creation |
| PY-007 | A customer who already owns the product is not sold it twice | Redirected to what they own | 🔴 **#2** — the already-owned redirect targets `/unretire/learn/course`, which 404s |
| PY-008 | A cancelled or failed Premium renewal removes Premium access | Access flips to inactive | 🔴 **#39** — only `customer.subscription.deleted` is handled; a failed renewal leaves access `active` |
| PY-009 | A Premium member can download their watermarked book and workbook | PDF returns, watermarked with their identity | 🔴 **#1** — the route reads masters from `src/app/unretire/account/_book/...`; they live at `src/app/account/_book/...`, so **every** download fails |
| PY-010 | The one-download-per-user limit cannot be bypassed by retrying | Second attempt refused | 🔴 **#43** — only the duplicate-key error is handled; any other write failure lets the download through |

## E. Protection *(being blocked is the PASS — per `docs/SECURITY-CHECKLIST.md` §5)*

| ID | Feature | Proof of PASS | Expected today |
|---|---|---|---|
| PR-001 | Rapid-fire submissions to the public subscribe endpoint are rejected | Rate limit engages and **fails closed** | 🔴 **#5** — no rate limit or bot check exists on any public write endpoint; launch-blocking |
| PR-002 | Submitting a public form without the human-check token is rejected | Server-side rejection | 🔴 **#5** |
| PR-003 | Hammering login with wrong passwords is throttled | Rate limit engages | ⚪ |
| PR-004 | Public endpoints reject junk input server-side, not just in the browser | Schema validation refuses malformed payloads | 🔴 **#5** — server-side validation is minimal |
| PR-005 | The site sends the security headers the launch gate requires | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy present on the live response | 🔴 **#46** — `next.config.ts` is empty; only platform HSTS is returned |
| PR-006 | A signed-in member can only ever read their own data | An attempt to read another user's entitlement row is denied by the database, not just by the app | ⚪ |

## F. Integrations and everything else

| ID | Feature | Proof of PASS | Expected today |
|---|---|---|---|
| IN-001 | The Stripe webhook accepts genuine events and refuses forged ones | Valid test signature accepted; bad signature refused | ⚪ |
| IN-002 | The webhook ignores events belonging to another project | An event carrying another project's metadata is refused | 🔴 **#41** — no application discriminator, and the live Stripe account is shared |
| IN-003 | Mailchimp receives contacts with the correct audience and tags | Test hook confirms the tag per source | ⚪ |
| IN-004 | All three Formspree forms deliver to the owner's address | Submission accepted for contact, community and enterprise | ⚪ — but see the cross-check below: all three post to the **same** endpoint, so the owner cannot tell them apart |
| IN-005 | YouTube lesson videos play for an entitled member | Player loads for the `course` and `premium` roles | ⚪ |
| IN-006 | Preview auth emails return to the Preview origin, never Production | The reset link host matches the environment under test | ⚪ |

## G. Manual checks *(real but not robot-testable — still on the list, still need evidence)*

| ID | Feature | How a human verifies |
|---|---|---|
| MN-001 | Account and reset emails render correctly in Gmail and Outlook | Owner triggers one of each to a personal inbox on Preview, then screenshots both |
| MN-002 | Email from the sending domain passes SPF, DKIM and DMARC | Send to an external address, check the received headers, screenshot |
| MN-003 | A real end-to-end payment on the live domain grants real access | Owner runs one live purchase with the 100%-off coupon after launch, confirms access, then revokes the coupon |
| MN-004 | The watermarked PDF is legible and carries the right identity | Owner opens a downloaded book and workbook and reads the watermark |

---

## Cross-check findings (docs vs code)

Reported before any test runs, per Phase 1.

- **Promised in the approved docs but missing in code:** `/privacy` and `/terms` are linked from the footer and required by `docs/SECURITY-CHECKLIST.md`, but no page exists (#3). The 7 `/framework/practice-*` and 7 `/journeys/*` destinations are linked but unbuilt (#4).
- **Found in code but not in docs:** `/articles` is a legacy off-nav page still reachable by URL (#4). All three Formspree forms — contact, community join and enterprise discovery — post to the **same hardcoded endpoint** `https://formspree.io/f/mgogyqey`: `ContactForm.tsx:5` and `CommunityJoinForm.tsx:5` hardcode it, and `DiscoveryForm.tsx:17-18` falls back to it when `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is unset (#20). No approved doc records that these three flows share one inbox.
- ~~**Contradiction to resolve before approval:** `src/app/learn/course/[module]/page.tsx` declares `generateStaticParams()` while also calling `hasAccess()`.~~ **Resolved 2026-08-30 from the `pnpm build` route table: the route is `ƒ (Dynamic) server-rendered on demand`.** Because `hasAccess()` reads cookies, the route opts out of static rendering and `generateStaticParams()` only enumerates params — the access check genuinely runs per request. AC-011 needs no clarification. The defect at AC-012 is unaffected: the check runs, then passes its answer to a client component that already holds all 48 lessons.

## Coverage record — 2026-08-31 (Sprint S4.5c)

Added after the pre-launch review's Finding 10: *"several claimed closures have no
red→green spec."* The approved lines above are NOT edited — this records which of them
gained a spec, so the S5.1b verdict can be read against evidence rather than against a
tracker tick.

| Line | Was | Now asserted by |
|---|---|---|
| PG-002 | 🔴 #4 | `tests/e2e/crawl/links.spec.ts` — still 🔴 and still blocked on **D-3**, but now measured: **exactly eight** dead links, held as a named exception list that fails in both directions |
| PG-003 | 🔴 #3 | `tests/e2e/pages/links-and-copy.spec.ts` — the footer links are followed, both pages return 200 and carry real copy |
| PG-006 | 🔴 #8 | `tests/e2e/pages/links-and-copy.spec.ts` — one lesson count site-wide, cross-checked against `courseData` |
| PG-007 | 🔴 #9 | `tests/e2e/pages/links-and-copy.spec.ts` — all three named pages swept for placeholder copy and invented figures. **This spec is what found that `/stories` had been missed.** |
| PG-011 | ⚪ | `tests/e2e/pages/public-pages.spec.ts` — the assertion no longer evaporates when the og:image tag is absent |
| FM-004 | ⚪ | `tests/e2e/forms/subscribe-payload.spec.ts` |
| FM-005 · FM-006 | ⚪ | `tests/e2e/forms/form-proxy.spec.ts` — the three forms post to `/api/form`, and the Formspree endpoint has left the bundle |
| FM-009 | 🔴 #44 | `tests/e2e/forms/subscribe-payload.spec.ts` — **and the defect itself was still live**; S4.5 was assigned it and did not do it |
| IN-002 | 🔴 #41 | `tests/e2e/integrations/webhook-fulfilment.spec.ts` — an event with no `app` stamp, and one stamped for another project, both write nothing |
| PY-008 · PY-010 | ⚪ | `tests/e2e/integrations/webhook-fulfilment.spec.ts` — the settled-funds gate, the bounded `past_due` grace, out-of-order lifecycle events, and **I4** |
| PR-001 · PR-002 · PR-004 | ⚪ | `tests/e2e/abuse/public-write-endpoints.spec.ts` — enforced *and* not failing closed |
| PR-005 | ⚪ | `tests/e2e/security/headers.spec.ts` — read off the deployed response, not the config file |

Still without a spec, and deliberately: **PY-001/PY-002/PY-006** (need a real sandbox
charge — the parity project, D-25), **FM-002/FM-003/FM-007** (need a real write),
**MN-001…MN-004** (manual by definition), **PR-003/PR-006** (need a database read the
harness does not have).

> ⚠ **Two corrections to the paragraph above, found by the S5.1b coverage audit (2026-09-01).**
> **(1) It omitted PY-005.** The declined-card line had no spec either, and its absence from
> this list made it read as covered when nothing tested it — the exact failure mode Finding 10
> was about, one level up in the record rather than in a spec.
> **(2) "PY-001/PY-002/PY-006 without a spec" was true only of the pull_request suite** —
> PY-001 and PY-002 have had dispatch-only parity specs since S2.5. The distinction that
> matters is *which trigger runs them*, not whether they exist.

## Coverage record — 2026-09-01 (Sprint S5.1b)

The verdict sprint. Both remaining money-path gaps closed, and run for the first time.

| Line | Was | Now asserted by |
|---|---|---|
| **PY-005** | uncovered, and mis-recorded as deliberate above | `tests/e2e/parity/checkout-declined.spec.ts` — a real Stripe decline card is submitted; the customer is told, the success redirect is never reached, and the fixture still owns nothing afterwards. **First run 2026-09-01** (dispatch 33500462380, 16.8 s) |
| **PY-006** | uncovered — the fix existed but nothing asserted the one-charge property | `tests/e2e/parity/checkout-declined.spec.ts` — two rapid `/api/checkout` calls must return the **same** session URL, so only one can ever be paid. **First run 2026-09-01** (4.7 s) |
| PG-002 | 🔴 #4, "blocked on D-3, exactly eight dead links" | **Row now stale in the S4.5c record above and corrected here:** D-3 resolved REMOVE on 2026-09-01 and `24efcb5` deleted all eight. `KNOWN_DEAD` is an empty list, the ratchet asserts it stays empty, and a companion test confirms the practice pages still 404 when requested directly — so "the links are gone" cannot be misread as "the pages were built". **Known issue 4 CLOSED** |

Still without any assertion after S5.1b, and stated plainly rather than left to inference:
**PR-003** (login throttling — presumed to be Supabase's built-in control, never verified; the
planned `tests/e2e/protection/` folder was never created) and **IN-004** (whether the three
Formspree forms actually deliver to the owner's inbox — the posting half is proven by
`forms/form-proxy.spec.ts`, the delivery half by nothing). Both are owner-verifiable in minutes
and are listed as post-launch actions in `docs/test-reports/2026-09-01-test-report.md`.

## Change log

Approved lines are never silently edited. Every later addition or change: [DATE — ID — what changed — re-approved by].

- 2026-08-30 — initial draft from head `ec6c7b7` — awaiting owner approval.
- 2026-09-01 — S5.1b — **no approved line was edited.** Two coverage records appended (2026-08-31, 2026-08-30 corrections) and two mis-statements in the S4.5c record corrected at source: PY-005's omission from the "deliberately without a spec" list, and PG-002's row still describing the pre-D-3 state. Recorded by Claude Code; the 56 approved lines and their wording are untouched.
- 2026-09-03 — S5.1c — **no approved line was edited.** Coverage record: **AC-011** gains its first ALLOWED-half worksheet assertion (`tests/e2e/accounts/paid-content.spec.ts` — `a buyer can actually download each worksheet`), added because every prior worksheet assertion covered only the denied 403 halves and the production 500 (Known issue 57) shipped through the gate. Recorded by Claude (builder); no re-approval needed — no line text changed.
