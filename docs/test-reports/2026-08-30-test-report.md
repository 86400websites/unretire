# Test Report — (Un)Retire — 2026-08-30

> Sprint **S5.1a — Launch Gate Discovery Probe** (D-27). One row per feature from `docs/FEATURE-LIST.md`.

- Run type: **PARTIAL BY DESIGN** — the ⚪ (untested) lines only. The 23 🔴 lines are deliberately unwritten; each fix sprint writes its own spec red→green. **No verdict is issued by this sprint** — that is S5.1b.
- Environment: **deployed Vercel Preview**, PR #20, head `af76f02`, Stripe test mode. Actions run **#96** — `105 passed · 1 failed`, 50.5 s, 106 tests in both browser profiles plus the three role sessions.
- Database probe: `unretire-test` (non-production), read-only, via Supabase MCP.

## The one failure, and why it must stay

**`AC-015` — a Premium member is allowed the book download.** `content-type` came back `application/json` instead of `application/pdf`.

This is **Known issue #1 doing exactly its job.** `src/app/api/book-download/route.ts:17,24` read the master PDFs from the stale `src/app/unretire/account/_book/…` path; the file is not there, `readFile` throws, and `route.ts:97-101` returns 500 + a JSON error instead of the document. **Every Premium book download fails today.**

Two things make this the *right* red rather than a problem:
- It did **not** return 403, so authorisation is sound — only the file path is wrong.
- It is the red→green proof for **S3.1**. When that sprint fixes the path, this spec turns green on its own. It must not be softened before then.

## What this sprint was for

Not to find the known bugs — §10 already lists 53 with file-and-line evidence. It was to answer one question: **is anything broken that we did not already know about?**

**Answer so far: no new defects.** Of the 29 unknown lines, 16 now have a result and all 16 pass. That is a genuinely good outcome — it means the schedule risk sits in the *known* launch-blocking set, not in undiscovered breakage.

## Severity, in plain words

| Severity | Means | Response |
|---|---|---|
| **Blocker** | Money, login, or the whole site is affected | Nothing launches with one open |
| **High** | A real feature is broken for some users | Fixed before launch |
| **Medium** | Annoying, but the site works | Fix now or first post-launch sprint — owner's call, logged |
| **Low** | Cosmetic | Backlog |

## Results — the 29 ⚪ lines

### Passing (16)

| ID | Feature | Result | Notes |
|---|---|---|---|
| PG-001 | Every public page loads with no errors | **PASS** | All 26 routes, desktop **and** 390px. No console errors, no horizontal scroll at either width. |
| PG-004 | A wrong URL shows the site's own branded 404 | **PASS** | There is no custom `not-found.tsx`, but Next's built-in 404 renders inside the root `layout.tsx`, so it carries the site header and footer. An earlier draft of this report predicted a failure here; that prediction was wrong. |
| PG-005 | Home shows the offers at the prices `/premium` states | **PASS** | $99 and $199 agree across home, `/premium` and `/learn/course`. |
| PG-008 | The blog lists posts and every listed post opens | **PASS** | All 14 posts return 200. |
| PG-009 | An unpaid visitor sees ten locked modules and a buy CTA | **PASS** | Exactly 10 modules, all showing the locked icon, zero showing unlocked. |
| PG-010 | Marketing pages carry real content, no placeholder tokens | **PASS** | All 11 marketing routes. See the `/podcast` note below. |
| PG-011 | Titles unique and non-empty; social URLs absolute | **PASS** | The "never localhost" half is asserted only against a deployed target and is still owed by the Preview run. |
| FM-001 | A malformed address is rejected and never submitted | **PASS** | Blocked before the network — `/api/subscribe` is never called. |
| FM-008 | A failed submission is reported honestly, never as success | **PASS** | Forced a 500; the success message never appears and an honest error does. |
| IN-001 | The Stripe webhook refuses forged events | **PASS** | Unsigned → 400. Wrongly-signed → 400. No internals leaked in the error body. |
| **PR-006** | **A member can only ever read their own data** | **PASS** | **Proven directly against `unretire-test`, not inferred.** `entitlements` holds 2 rows; an anonymous role sees **0**; one authenticated user sees exactly **1** — their own. The proof is non-vacuous because rows genuinely exist. |
| AC-001 | A visitor can create an account | **PASS** *(pre-existing)* | Covered by `tests/e2e/parity/signup.spec.ts` (proof P2). |
| FM-002 | Newsletter signup reaches Mailchimp with the right tag | **PASS** *(pre-existing)* | Covered by `tests/e2e/parity/subscribe.spec.ts`. |
| PY-001 | The $99 course can be bought with a test card | **PASS** *(pre-existing)* | Covered by `tests/e2e/parity/checkout-course.spec.ts` (P4/P5). |
| PY-002 | The $199/yr Premium subscription can be bought | **PASS** *(pre-existing)* | Covered by `tests/e2e/parity/checkout-premium.spec.ts` (P4/P5). |
| IN-006 | Preview auth emails return to the Preview origin | **PASS** *(pre-existing)* | Covered by `tests/e2e/parity/password-reset.spec.ts` (P3). |

### Role-based access — all run on the Preview, all as expected

| ID | Feature | Result |
|---|---|---|
| AC-002 | A member can log out, and the session genuinely ends | **PASS** |
| AC-010 | A signed-out visitor is denied `/account` and the book-download API | **PASS** — both halves |
| AC-013 | A course-only member is denied the Premium book download | **PASS** — 403, correctly |
| AC-015 | A Premium member reaches course content | **PASS** |
| AC-015 | …**and** is allowed the book download | **FAIL — Known issue #1**, see above |
| IN-005 | An entitled member gets a playable lesson video | **PASS** |

This is the first time any protected boundary has been proven on a deployed environment with both an **allowed** and a **denied** assertion.

### Still owed (8)

Not written this sprint. All are write-side (they create real Mailchimp contacts, real Formspree emails, or real Stripe attempts) or consume a shared quota, so each belongs in the dispatch-only `parity` project under D-25.

| ID | Feature | Why it is not written yet |
|---|---|---|
| FM-003 | The Starter Plan download gate captures the email | Writes a live Mailchimp contact (D-22: one shared audience) |
| FM-005 | The contact form delivers to the owner | Sends a real email |
| FM-006 | The community join form delivers | Sends a real email |
| FM-007 | The enterprise discovery form delivers | Sends a real email |
| IN-004 | All three Formspree forms deliver | Same three emails |
| PY-005 | A declined test card fails honestly and grants nothing | Real Stripe sandbox attempt |
| PR-003 | Login throttling engages | ⚠ Consumes a shared Supabase auth rate-limit budget; a careless version could lock out the fixture accounts and break every later run |
| IN-003 | Mailchimp receives the correct audience and tags | Largely covered by `subscribe.spec.ts`; needs a tag-level assertion |

## Two defects found in the test harness itself (both fixed in this sprint)

Neither is a site defect, but both would have corrupted the S5.1b verdict, so they are recorded rather than quietly fixed.

**1. The Preview bypass never reached API-style requests.** `tests/e2e/fixtures.ts` attached the Vercel Protection Bypass through `context.route()`, which intercepts only browser navigations — Playwright's `APIRequestContext` is not routed. Five specs therefore received Vercel's **401** instead of the app's own 400/403 (PR #20, runs #94/#95). The tell was which specs *passed*: `AC-013` and `PG-008` make the same kind of call but had a bypass **cookie** already in the jar, from a stored role session and a preceding navigation respectively. Cookie presence, not the assertion, predicted the outcome. Invisible locally, because `localhost` has no deployment protection. Fixed by an `api` fixture (`af76f02`).

**2. Two CI runs of the same commit raced each other over shared fixture accounts.** `e2e-preview.yml`'s concurrency key fell back to `github.run_id` for non-PR events, and a run id is unique per run — so the `pull_request` and `deployment_status` runs of one commit ran **concurrently**. `AC-002` signs a fixture out, and `supabase.auth.signOut()` (`src/app/auth/actions.ts:178`) takes the library's default **`global`** scope, revoking that user's session everywhere. One run signed the other out mid-test. Evidence: run **#96** was 105/1 while its twin **#97** was 104/2, the extra failure being `AC-002` unable to find the signed-in heading at the same commit. Fixed by keying concurrency on the commit SHA and queueing rather than cancelling.

> Both are the same class of bug: **a test that passes for an incidental reason.** That is more dangerous than a failing one, because it reads as proof when it is not — and S5.1b's GO depends on the suite meaning what it says.

## Findings

**No new site defects.** Two things worth your attention, neither a bug:

1. **`/podcast` advertises a podcast with no episodes.** The page carries an approved COMING SOON badge and the line *"The first episodes are coming soon."* That is true, approved copy — not a placeholder — so it is not a test failure. But it is a **judgement call for launch**: a visitor clicking Podcast in the nav finds nothing to listen to. Options: leave as-is, remove from the launch nav, or de-emphasise. Your call; not launch-blocking either way.

2. **`book_downloads` RLS is not yet proven.** The table is empty, so the anonymous "sees 0 rows" result is vacuous — it proves nothing. Its policies read correctly (`auth.uid() = user_id` for both SELECT and INSERT, no UPDATE/DELETE policy at all), but the empirical proof must be re-run once S3.1 fixes #1 and real download rows exist. Tracked into **S4.3**.

**One incidental confirmation:** `entitlements` has a SELECT policy and **no INSERT, UPDATE or DELETE policy whatsoever**, so nothing but the service-role client can write it. That independently satisfies `docs/SECURITY-CHECKLIST.md` §9 invariant **I3 — single entitlements writer**.

## Fix handoff

Nothing to hand off — no new defects. The known launch-blocking set proceeds as planned in the approved launch plan: S3.1 → S4.3 → S4.4 → S4.5 → S4.6 → S5.1b → S5.2.

---

## Verdict

**No verdict. By design.**

S5.1a is a discovery instrument, not a gate (D-27). A GO can only come from S5.1b: a FULL run of all 56 lines, 100% passing, on one head, nothing skipped.

**Done since the first draft of this report:**
1. ~~Push the branch so a Preview deploys.~~ Done — PR #20.
2. ~~Run the `E2E — Preview` workflow.~~ Done — run **#96**, 105 passed / 1 failed at `af76f02`.
3. Two harness defects found and fixed (see above).

**Still outstanding for S5.1b:**
1. The 8 write-side parity specs (FM-003/005/006/007, IN-003/004, PY-005, PR-003).
2. A `parity: on` dispatch — deferred until those specs exist, since each run writes real data.
3. The 23 🔴 specs, which arrive with their fix sprints.
4. `book_downloads` RLS re-proof once S3.1 makes real rows exist.
