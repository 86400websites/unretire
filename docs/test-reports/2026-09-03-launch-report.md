# (Un)Retire — Launch-Day Report

**Date:** 3 September 2026
**Prepared for:** Maher Kaddoura (via 86400)
**Sprint:** S5.2 — Launch (the last sprint of the plan)
**Companion:** `docs/LAUNCH-CHECKLIST.md` carries the same run, line by line, with each line's evidence next to it.

---

## In one paragraph

The site is live at `https://www.unretireproject.com` and was checked today as a real visitor would meet it —
not on a developer's laptop and not on a preview copy. Every one of the 32 pages Google was told about
loads over HTTPS, the pages that must stay locked stay locked, the security headers are on the live
response, the sitemap is accepted by Google Search Console, and the sending domain carries the DKIM and
DMARC records that keep marketing mail out of spam. The daily **morning check** — the watchman that
will re-test the live site every day and e-mail you only if something breaks — is built, and its seven
tests were run against the live site today: **14 of 14 passed** (each test runs on a desktop and a
390-px phone profile). Three things were found that would have stopped the watchman from ever
starting; all three are fixed in this branch. What remains is a short list of owner clicks and
decisions, listed plainly at the end. **Nothing on that list is a defect in the site.**

---

## What was checked, and how

| | |
|---|---|
| **Where** | The real domain, `https://www.unretireproject.com`, plus the merged code on `master` (`d825ca0`, pull request #31) |
| **When** | 3 September 2026 |
| **How** | Read-only requests to the live site (page loads, headers, the sitemap, DNS); the seven morning-check tests run against a local production build and then against the live site; a read-only comparison of the production and test databases; the repository's own gates (typecheck, lint, format, build) |
| **Money** | No payment was made and no account was created today. Nothing that writes to the live site was run |
| **Who** | Claude (builder) — the owner's own 2 September purchases on the live site are cited where a line needs a real customer's walk |

### The three checklist phases, in plain words

| Phase | What it asks | Result today |
|---|---|---|
| **1 — Pre-launch** | Is the build complete, the content real, the SEO basics in, the legal pages up, monitoring ready, approval in writing? | **Mostly PASS.** Six lines are open — none is a site defect: a success metric nobody has named yet, a database-restore rehearsal that was never done, an uptime monitor, the domain-renewal alert, a mobile/accessibility audit that was never scheduled, and the client's own written sign-off. Two are recorded exceptions already made by the owner (error tracking — D-28; custom mail — D-33) |
| **2 — Launch day** | Domain, SSL, canonical host, site-URL variable, auth allow-list, mail DNS, live security headers | **PASS.** The last two open lines (mail DNS, live headers) were verified today |
| **3 — Post-launch smoke** | Every page loads, the purchase works for a real visitor, forms deliver, Search Console, no `noindex`, auth on the real domain, and the "only the real site can prove it" residuals | **PASS on everything a robot can prove; nine lines wait on the owner** (a real inbox, a real phone, the Stripe dashboard, a real `/assess` submission) |

---

## The morning check — the watchman

**What it is.** Every day at 01:30 UTC (07:00 IST) GitHub runs seven read-only tests against the live
site. If all pass, you hear nothing. If one fails, GitHub e-mails you. It never signs up, never buys,
never submits a form, never sends mail — it only looks.

**The seven tests proposed for your approval** (OWNER-ACTIONS Part 8.1; strike any you do not want):

| # | What it proves every morning | Feature line |
|---|---|---|
| 1 | The home page loads with no browser errors and the (Un)Retire title | smoke |
| 2 | Home, `/premium` and `/learn/course` still show the course at $99 and Premium at $199 | PG-005 |
| 3 | A visitor who has not paid sees ten **locked** modules and a **Buy the course** button | PG-009 |
| 4 | The live response still carries every required security header | PR-005 |
| 5 | A stranger asking for any of the four worksheets is refused (403) — the route S5.1c fixed | AC-012 |
| 6 | `/account` sends a stranger to `/login`, never to the member area | AC-010 |
| 7 | `sitemap.xml`, `robots.txt` and the Google verification file all answer on the www host, and no page says `noindex` | SEO |

**Proof it works.** `pnpm exec playwright test --grep "@morning" --list` lists exactly these seven, twice
(desktop + 390-px phone) = 14. Run against a local production build: **14 passed**. Run against the
**live site** from the builder's machine, exactly as GitHub will run it: **14 passed in 17 s.**

**Three things that would have stopped it from ever starting — all fixed here:**

1. **The test harness refused to point at the live site.** By design, the harness would only test a
   Vercel preview or a local server ("Production is never a target"), so the morning workflow — which
   points at the live site — could not start. The rule now admits **one** more address, the www host,
   and only in the morning lane (`E2E_MORNING=1`) and only when no preview-bypass secret is present. The
   rule moved into its own file and a new test pins every refusal that must survive: the live site
   without the morning flag, the live site with a bypass secret, both Vercel aliases, foreign hosts,
   `http`. **Fifteen command-line cases were run and behave exactly as specified** (the sprint record
   lists them).
2. **No test carried the `@morning` tag**, so the workflow would have selected nothing. (A correction
   to the plan's wording: a zero-test run **fails** — Playwright exits 1 on "No tests found" — so the
   danger was a permanently red watchman, not a falsely green one. Either way, it is fixed.)
3. **Found today — the harness refuses to run in CI without the test-account password**, a deliberate
   guard so a partial suite can never report green. The morning check is *meant* to be partial and
   *must not* carry that password (the test accounts live in the test database, not on the live site).
   The guard now exempts the morning lane and gains its mirror image: a morning run that finds the
   test password, the parity switch or the bypass secret in its environment **refuses to start**.

**One more thing the daily test had to learn.** Its "nothing is telling Google not to index us" check first
looked for that instruction on every copy of the site. But Vercel deliberately marks every *preview* copy
"do not index" — which is correct, previews are not meant to be found — so the check would have gone red on
the preview copy for doing the right thing, and a monitor that cries wolf is worse than none. It now looks
for that instruction only on the live site, where it would actually matter. The live site carries none.

**Still needed from you before it runs on its own** — details in OWNER-ACTIONS Part 8:

- approve (or edit) the seven tests above, in writing;
- add two repository variables in GitHub, `PRODUCTION_URL` and `MORNING_CHECK_ENABLED`, no secrets;
- turn on "only notify for failed workflows" in your GitHub notification settings;
- authorise the commit and push so the branch can be reviewed and merged.

Then the manual run, the review, the merge, and the first scheduled run — which closes the sprint.

---

## Live-domain evidence (all read-only, 3 September 2026)

| Check | Result |
|---|---|
| `https://www.unretireproject.com/` | 200; apex `https://unretireproject.com` → 308 to www |
| Every sitemap URL (`/sitemap.xml`, 32 entries) | 32 × 200, all on the www host |
| `/articles`, `/framework`, `/journeys`, `/login`, `/signup`, `/forgot-password`, one blog article, one course module | all 200; a nonsense URL → the branded 404 |
| `/account` (signed out) | 307 → `/login` |
| `/api/course-worksheet?doc=m1-intro` (anonymous) | 403 (not the old 500) |
| Security headers on the live response | CSP, Permissions-Policy, Referrer-Policy, HSTS (preload), X-Content-Type-Options, X-Frame-Options — all present |
| `robots.txt` | `Allow: /`, `Disallow: /api/`, `Disallow: /account`, `Sitemap:` on the www host |
| Google verification file | 200 with the exact token body |
| `noindex` | none — no `x-robots-tag` header, no robots meta |
| `og:url`, favicon, icon, description | all present on the www host |
| DNS: DKIM `k2`/`k3._domainkey` → Mailchimp; `_dmarc` `p=none`; SPF present | Mailchimp domain authentication in place (D-33) |
| Deployment protection | www answers 200 with no bypass; a preview URL answers 302 to Vercel's login without one (proof P10) |
| Production vs test database (proof P8) | same three tables, RLS on, same policies, same function grants; one test-only helper function, harmless |
| `https://unretire.vercel.app` (the old alias) | still 200 — Known issue 58, first post-launch fix |

---

## What you need to do (owner clicks)

1. **Approve the seven morning tests** — reply "approved", or strike any (Part 8.1).
2. **Set two GitHub variables** — `PRODUCTION_URL` = `https://www.unretireproject.com`, `MORNING_CHECK_ENABLED` = `true` (Part 8.2). No secrets.
3. **GitHub notifications** — "Only notify for failed workflows", e-mail on (Part 8.3).
4. **Commit / Push authorisation** for `claude/s5.2-launch` (Part 8.4), then the review and merge as usual.
5. **Two decisions** — D-35 (the one number that means "this worked", and where it is read) and D-36 (six open pre-launch lines: accept, or schedule) (Part 8.6).
6. **Nine manual lines** only you can do — a real contact-form submission from an outside address, a password reset on the live site, the phone pass, confirming whether the 2 September course purchase was a real $99 charge, the Stripe account/webhook dashboard reads, one real `/assess` submission, the client's written sign-off (Part 8.7).
7. **Close pull request #30** (`feat/live-9`, zero files changed, title "description") or say what it is (Part 8.8).
8. **Known issue 59** — confirm the `FREE` code on the **Course** checkout (Part 8.9).

---

## Status

**Launched.** The site went live with S5.1c on 3 September; today's run confirms it. **S5.2 stays open**
until the morning check's first *scheduled* run is reported green — that is the sprint's exit
condition, and it needs items 1–4 above first. Known issues 58 and 59 stay open, as decided (D-34).
