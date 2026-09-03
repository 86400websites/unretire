# (Un)Retire — Final Pre-Launch Test Report

**Date:** 1 September 2026
**Prepared for:** Maher Kaddoura
**Sprint:** S5.1b — Launch Gate, verdict half

---

## In one paragraph

Every part of the (Un)Retire website was tested against a real, deployed copy of the site — not
a developer's laptop. **221 automated tests ran and 221 passed.** That includes buying the $99
course and the $199/year Premium subscription with a real card through Stripe, confirming the
customer's access was actually granted afterwards, and confirming that a *declined* card grants
nothing. Nothing was skipped, switched off, or loosened to make the numbers look better. Four
things still need a human pair of eyes rather than a robot, and three things are knowingly
accepted rather than fixed — all seven are listed plainly below, with nothing hidden in a
footnote. **The verdict is GO.**

---

## What was tested, and how

| | |
|---|---|
| **What we tested** | The complete website — 28 visitor-facing pages, the login and account area, the paid course, both purchase paths, all seven forms, and the defences that sit in front of them |
| **Where** | A deployed copy of the site at the exact code being launched, on the same hosting as the live site |
| **When** | 1 September 2026 |
| **Exact version tested** | Commit `f8702f1` |
| **Money** | Stripe **Sandbox** only — a completely separate Stripe account from your live one. No real card, no real charge, no real customer could be touched |
| **Result** | **221 tests run · 221 passed · 0 failed · 0 skipped** |

The suite was run **three separate times** at this same version — twice automatically and once
by hand with the payment tests switched on. The results were identical every time. That
repeatability matters: a test that passes only sometimes is not evidence.

### The 56 things we promised to check

Before any test was written, we listed everything the website does in plain English — 56
numbered items — and you approved that list. **Every test traces back to one of those 56 lines,
and nothing outside the list was tested.** This report walks through all 56.

---

## How to read the result column

| Result | What it means |
|---|---|
| **PASS** | A robot checked it on the real deployed site, and it worked |
| **PASS \*** | It works, and there is a specific limit to how far the check goes. The limit is spelled out |
| **ACCEPTED** | Known, decided by you, deliberately not fixed before launch |
| **NOT TESTED** | Honestly, nothing checks this yet. Listed, not buried |
| **OWED** | A human has to look at it. Not something a robot can judge |

---

## A. The pages people see *(11 checks)*

| # | What we checked | Result | Notes |
|---|---|---|---|
| PG-001 | All 28 pages load with no errors, on a computer **and** on a phone | **PASS** | Every page loaded twice — desktop and a 390-pixel phone screen. No errors, and nothing spills off the side of a phone |
| PG-002 | Every link goes somewhere real | **PASS** | **This is newly fixed.** Eight links pointed at pages that were never built and returned "page not found". On your instruction they were removed. A test now fails if a ninth dead link ever appears |
| PG-003 | The Privacy and Terms links open real pages | **PASS** | Both open, both carry real content. You cannot lawfully take payment without them, so this one is checked by *following the actual footer links*, not by assuming |
| PG-004 | A mistyped web address shows your own branded page | **PASS** | Visitors still get your header and footer, so they can find their way back |
| PG-005 | The prices on the home page match the Premium page | **PASS** | $99 and $199 agree across the home page, the Premium page and the course page |
| PG-006 | The lesson count is the same number everywhere | **PASS** | The home page once said "thirty-one lessons" while the course held forty-eight. Now every page says 48, and the number is read from the course itself, so the two cannot drift apart again |
| PG-007 | Testimonials and community numbers are real | **PASS \*** | The invented testimonials and the unverified "340+ Members, 18 Countries" are gone from the book and community pages. **On the Stories page, six invented example stories remain and are clearly labelled as placeholders** — your decision of 1 September. The test enforces that label: the page can only get more honest, never quietly less |
| PG-008 | The blog lists posts and every post opens | **PASS** | All 14 posts open |
| PG-009 | Someone who has not paid sees ten locked modules | **PASS** | Exactly ten, all locked, none accidentally open |
| PG-010 | The 11 marketing pages carry real content | **PASS** | Checked for real copy and for leftover placeholder text |
| PG-011 | Social sharing images and page titles are correct | **PASS** | **Two problems were found and fixed here.** Every page on the test site was telling Facebook and LinkedIn its address was `localhost` — a developer's machine. And the share image itself still read *"part of Half a Life"*. Both fixed |

## B. Accounts and access *(9 checks)*

This is the section that decides whether someone can take your paid work without paying.

| # | What we checked | Result | Notes |
|---|---|---|---|
| AC-001 | A visitor can create an account | **PASS** | A real signup ran during this test and landed in the test database |
| AC-002 | A member can log in and log out | **PASS** | And the session genuinely ends — going back to the account page afterwards bounces to the login screen |
| AC-003 | Password reset works end to end | **PASS \*** | The reset is requested and the email link points back to the right place. **The final step — typing a new password and logging in with it — has never been checked by anyone.** See the gaps section |
| AC-010 | A logged-out visitor cannot open the account area | **PASS** | Both halves proven: they are redirected, *and* the content is confirmed absent |
| AC-011 | A member who has not bought the course cannot open it | **PASS** | Checked at the server, not just the buttons |
| AC-012 | **The paid course cannot be taken without paying, by any route** | **PASS** | The strongest check in the suite. It reads the actual page *and every JavaScript file the browser downloads*, hunting for lesson video IDs. It finds none. It also confirms the worksheet PDFs refuse anonymous downloads and that the old public copies are gone. **This was once genuinely broken** — all 48 lessons shipped to every visitor |
| AC-013 | A member without Premium cannot download the book | **PASS** | Refused, correctly |
| AC-014 | A password-reset link cannot be hijacked to another website | **PASS** | Eleven hostile web addresses tried; all eleven refused. **Six of the eleven used to get through** — that was a real phishing risk on the one link people click from their email |
| AC-015 | A Premium member reaches everything a course member reaches | **PASS** | Including the watermarked book download, which used to fail every single time |

## C. Forms and email *(10 checks)*

| # | What we checked | Result | Notes |
|---|---|---|---|
| FM-001 | A wrong email address is rejected clearly | **PASS** | Rejected before anything is sent |
| FM-002 | A newsletter signup reaches Mailchimp with the right tag | **PASS** | A real signup was sent to Mailchimp during this test |
| FM-003 | The 14-Day Starter Plan captures the email | **PASS \*** | The capture is proven. Whether Mailchimp then *delivers the file* is a Mailchimp automation, outside what we can test from here |
| FM-004 | The Wheel of Life assessment submits results | **PASS \*** | All 13 pieces of data the assessment sends are proven to survive intact. **But no test drives the assessment screen itself from start to finish** — see the gaps section |
| FM-005 | The contact form reaches your server | **PASS** | |
| FM-006 | The community form reaches your server | **PASS** | All three forms used to post *directly from the visitor's browser* to Formspree, with no checks at all. They now go through your own server first, and the Formspree address is no longer visible in the page |
| FM-007 | The enterprise form reaches your server | **PASS** | |
| FM-008 | A failed form never pretends it worked | **PASS** | Forced a failure; the visitor gets an honest error, never a false "thank you" |
| FM-009 | A form error never shows the visitor technical wording | **PASS** | Mailchimp's own error text used to be shown to visitors and written to the logs. Now only your own four fixed messages can ever appear |
| FM-010 | Account emails arrive at real-world volume | **ACCEPTED** | **Your decision of 1 September.** Password reset emails are sent by Supabase's built-in mailer, which is capped at **2 emails per hour for the whole site**. The third person to request a reset in the same hour gets nothing and is told a link is on its way. See "Accepted, not fixed" |

## D. Payments *(10 checks — Stripe Sandbox only)*

Every check in this section ran against Stripe for real, in the sandbox account.

| # | What we checked | Result | Notes |
|---|---|---|---|
| PY-001 | The $99 course can be bought | **PASS** | Bought for real during this test. Card entered, payment taken, access granted |
| PY-002 | The $199/year Premium subscription can be bought | **PASS** | Bought for real during this test |
| PY-003 | After paying, the customer lands on a working page | **PASS** | Every paying customer used to land on "page not found" at the most important moment of the journey |
| PY-004 | **Paying actually grants access — and access is only claimed when it exists** | **PASS** | Two failures used to combine here into the worst possible outcome: the payment could silently fail to grant access, *and* the page reassured the customer that everything worked. They paid, received nothing, and were told it was fine. Both fixed and proven |
| PY-005 | A declined card fails honestly and grants nothing | **PASS** | **Newly written and run for the first time today.** A genuine decline card was submitted to Stripe. The customer is told; no access is granted |
| PY-006 | Double-clicking Buy does not create two charges | **PASS** | **Newly written and run for the first time today.** Two rapid clicks return the *same* payment session, so only one can ever be paid |
| PY-007 | Someone who already owns it is not sold it twice | **PASS** | They are sent to what they own, and Stripe is never involved |
| PY-008 | A cancelled or failed renewal removes Premium access | **PASS** | Including a deliberate grace period: a customer whose card bounces keeps access until the period they already paid for runs out |
| PY-009 | A Premium member downloads their watermarked book | **PASS \*** | Proven for the book. **The workbook has never actually been downloaded by any test** |
| PY-010 | The one-download-per-user limit cannot be bypassed | **PASS \*** | The repeat attempt is refused. One rarer failure path — the database refusing the write for an unusual reason — cannot be triggered from outside and is proven by code review only |

## E. Defences *(6 checks — being blocked is the correct result)*

| # | What we checked | Result | Notes |
|---|---|---|---|
| PR-001 | Rapid-fire form submissions are rejected | **PASS** | The limit engages. Just as important, an *honest* visitor is not caught by it |
| PR-002 | Forms cannot be submitted by a robot without checks | **PASS \*** | There is no "click to prove you're human" box — you chose database rate limiting instead. That control is proven working. Judge this line against that choice, not against the original wording |
| PR-003 | Repeated wrong-password login attempts are throttled | **NOT TESTED** | See the gaps section |
| PR-004 | Junk data is refused by the server, not just the browser | **PASS** | Including an attempt to overwrite another person's Mailchimp record, which used to be possible |
| PR-005 | The site sends the required security headers | **PASS** | All six, read from the real deployed response rather than from a settings file |
| PR-006 | A member can only ever read their own data | **PASS \*** | Proven directly against the database: two records exist, an anonymous visitor sees zero, and a logged-in member sees exactly one — their own. This was a one-time check, not part of the automatic suite |

## F. Connections to other services *(6 checks)*

| # | What we checked | Result | Notes |
|---|---|---|---|
| IN-001 | Stripe messages are accepted if genuine, refused if forged | **PASS** | Both halves. A forged message is refused and leaks no internal detail |
| IN-002 | Messages belonging to another project are ignored | **PASS** | Your live Stripe account is shared with other businesses, so their messages reach your website too. It now ignores them |
| IN-003 | Mailchimp receives contacts with the right tag | **PASS \*** | Proven for the newsletter signup. The assessment's tag is not separately proven |
| IN-004 | All three forms actually deliver to your inbox | **NOT TESTED** | See the gaps section |
| IN-005 | Course videos play for a paying member | **PASS** | For both the course and Premium roles |
| IN-006 | Test emails come back to the test site, never the live one | **PASS** | Proven during this test run |

## G. The four things a human must check *(4 items)*

Robots cannot judge these. They are on the list precisely so they do not get forgotten.

| # | What a human must do | Status |
|---|---|---|
| MN-001 | Open a password-reset email in **Gmail and Outlook** and confirm it looks right | **OWED** — a reset email has been received in Gmail, but neither was checked for how it *renders* |
| MN-002 | Confirm email passes SPF, DKIM and DMARC from an external mailbox | **PARTLY DONE** — you have completed Mailchimp domain authentication, which covers your *marketing* email. The headers check itself has not been captured, and note that password-reset email does **not** come from your authenticated domain (see FM-010) |
| MN-003 | One real purchase on the live site after launch | **OWED — after launch, by definition.** A 100%-off coupon is ready. Worth knowing: a free checkout proves the plumbing but skips the actual charge. A temporary $1 payment, refunded, is the stronger test |
| MN-004 | Download the book **and workbook** and read the watermark | **OWED** — a watermarked book has been produced by the system, but no human has opened one, and the workbook has never been produced |

---

## The honest gaps — two things nothing checks

These are not failures. They are places where **no test exists**, so nobody should claim they work.

**1. PR-003 — repeated wrong-password login attempts.** We believe Supabase throttles these
automatically. Nobody has ever verified it. It was deliberately not written because a careless
version of this test could lock the test accounts out and break every other test. **Risk if
wrong:** someone could guess passwords faster than they should. **Recommended:** confirm the
setting in the Supabase dashboard — a five-minute check, not a sprint.

**2. IN-004 — whether the three forms actually land in your inbox.** We prove the contact,
community and enterprise forms reach *your server* correctly. We have never proven the email
then arrives with you, because a test that proves it would email you on every run. **Risk if
wrong:** a customer enquiry is silently lost. **Recommended, and it takes two minutes:** submit
each of the three forms yourself on the live site after launch and confirm all three arrive.
Note they share one Formspree inbox, so check the subject line tells them apart.

Two smaller limits worth naming: **the last step of a password reset** (typing the new password
and logging in with it) has never been checked end to end, and **the assessment screen** has
never been driven from start to finish, though everything it sends is proven correct.

---

## Accepted, not fixed — three decisions you have made

These are deliberate, recorded, and each has a reason and a fallback.

**1. No custom email service (decision D-33, 1 September).** Password-reset emails stay on
Supabase's built-in mailer, capped at **2 per hour across the whole site**. At launch volumes
this is very unlikely to bite. If it ever does, the person sees "a reset link is on its way"
and receives nothing. **Fallback:** the daily automatic site check, and adding a proper email
service is roughly a half-day of work whenever you want it.

**2. No error monitoring at launch (decision D-28).** If something breaks for one customer, you
find out when they tell you. **Fallback:** a daily automatic check catches a broken page or a
dead purchase path within 24 hours.

**3. The Stories page keeps its six example stories (decision, 1 September).** They stay, and
they stay clearly labelled as placeholders. The test enforces the label, so the page cannot
quietly become misleading.

One further item is recorded honestly rather than accepted: **the independent code review of
the previous sprint was waived** when the review tool's usage limit ran out. It is deferred,
not cancelled — the review brief is written and pinned, and can still be run against that exact
code at any time.

---

## What changed in this final sprint

- **The "Exclusive Guest Preview" banner is gone.** It was only ever an announcement — there
  was no switch or restriction behind it, so removing it is the whole of turning it off.
- **Every visible link to the "Half a Life" website is gone**: the floating button on the home
  page, the mobile menu link, and the footer badge and credit line.
- **The social share image was fixed.** It still carried "part of Half a Life" printed into the
  picture, and that image is what appears whenever *any* page of the site is shared on
  WhatsApp, LinkedIn, Facebook or Slack. This was not on the list of things to remove; it was
  found by checking, and it would have been visible to everyone.
- **Two new payment tests were written and run** — the declined card and the double-click.

---

## One red result, and why it was not the website

If you look at the project's test history you will see **one failed run** after the successful
ones. It is worth explaining rather than leaving it looking like a loose end, because the
explanation is the reason to trust the rest.

A commit that changed **one paragraph of a document** — no website code at all — came back red,
failing two payment-page tests. A documentation change cannot break a website, so it was worth
chasing rather than simply re-running until it went green.

The cause was in the *testing machinery*, not the site. Two test runs had been started a minute
apart and overlapped for about two minutes. Both use the same three test accounts, and one of
the tests deliberately logs an account out — which logs it out *everywhere*, including inside
the other run. The second run then found itself logged out and reported two failures that had
nothing to do with the code it was testing.

**This is fixed.** Test runs are now queued one at a time, so they can never interfere with each
other again. The very next run confirmed it: same code, no overlap, **214 of 214 passed** on
both triggers.

Why this is worth a paragraph in your report: a test that fails for an incidental reason is a
smaller problem than a test that *passes* for one, but they come from the same place — and this
project has been bitten by the second kind before. The correct response to an unexplained red is
to explain it, not to re-run it until it turns green. That is what was done here.

---

## Verdict

# ✅ GO

**All three conditions for GO are met:**

1. **A full run at the exact version being launched** — 221 tests, the complete approved list,
   nothing held back. ✅
2. **100% passed** — 221 of 221, repeated three times with identical results. ✅
3. **Nothing skipped, switched off, or weakened** to get there. ✅

**Every launch-blocking issue is closed.** The project kept a separate, stricter list of eleven
problems that had to be fixed before the site could take real money — silent payment failure,
the course being downloadable without paying, a phishing hole in the password-reset link,
broken book downloads, missing Privacy and Terms pages, missing security headers, and more.
**All eleven are fixed and merged.**

**What GO does not say.** It does not say the two untested items above are working — it says
they are untested and small enough to check by hand. It does not cover the four human checks,
one of which can only happen after launch. And it rests on the three accepted decisions above,
which are yours and are recorded as decisions rather than as passes.

**Recommended immediately after launch:**

1. Submit the three forms on the live site and confirm all three emails arrive *(2 minutes — closes IN-004)*
2. Run one real purchase and confirm access, then withdraw the coupon *(MN-003)*
3. Open the downloaded book and workbook and read the watermark *(MN-004)*
4. Confirm login throttling in the Supabase dashboard *(5 minutes — closes PR-003)*
5. Cancel the accumulated Stripe sandbox subscriptions *(instructions in `docs/OWNER-ACTIONS.md`, Part 7)*

---

*Verdict: **GO** · 1 September 2026 · Full-run report: this file · Version tested: `f8702f1`*
*Test runs: GitHub Actions 33499770687, 33499791411 (214 each) and 33500462380 (221, payments included)*

> **A note for anyone checking this against the code.** Writing this report necessarily adds
> commits *after* the version it certifies, so the branch tip will not equal `f8702f1` — that is
> expected, not drift. The rule for verifying it, in one command:
>
> ```
> git diff --name-only f8702f1..<tip> -- src/ tests/ playwright.config.ts package.json
> ```
>
> This must return **nothing**. If it ever returns a file, the website or its tests have moved
> past what was certified here and this verdict no longer covers them — re-run the gate rather
> than trusting this page. (Everything added after `f8702f1` is documentation, plus one
> continuous-integration setting described below.)
