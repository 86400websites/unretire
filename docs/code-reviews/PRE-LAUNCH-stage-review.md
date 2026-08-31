# Codex Review Brief — PRE-LAUNCH — all work since the S2.5 close-out

> Filled from `docs/templates/CODEX-REVIEW-PROMPT-TEMPLATE.md`. Dispatch this before Sprint **S5.1b** (the GO/NO-GO gate). Append the reviewer's returned record below; the reviewer does not edit the repository.

You are the independent, findings-only reviewer for this range. `AGENTS.md` governs this review. Do not edit, stage, commit, push, merge, install dependencies, or run migrations. Review issues introduced by the pinned range; inspect enough surrounding context to validate them without starting an unrelated full audit.

## Review target

- **Repo:** `86400websites/unretire`
- **Scope:** everything built since the last independently reviewed point, across five sprints — S5.1a, S3.1, S4.3, S4.4, S4.5.
- **PRs:** #20, #21, #22, #23 (**merged**) and #24 (**open**, branch `claude/s4.5-launch-floor`)
- **Merge-base SHA:** `baa1d922a6ee1ba8cb48f19df58599f73d3cf65a` (`baa1d92`, the S2.5 close-out merge)
- **Reviewed head SHA:** `8fc94ad` (tip of `claude/s4.5-launch-floor`)
- **Immutable range:** `baa1d92..8fc94ad`
- **Sprint records:** `docs/sprint-prompts/S5.1a-launch-gate-discovery.md`, `S3.1-money-paths.md`, `S4.4-auth-boundary.md` *(S4.3 and S4.5 records are outstanding — see Known gaps)*

**First confirm both SHAs and the actual changed-file list.** Stop and report a target mismatch before reviewing if the range, head, or scope does not agree.

> **⚠ Verify range completeness first — this range has already lost a commit once.**
> PR #23 merged only the **first** of S4.4's two commits. `b26bd19` (host-header guard, Stripe discriminator, D-30, S4.4 record) sat unmerged on `claude/s4.4-auth-boundary` and was recovered by cherry-pick as `8fc94ad`, found only when the changed-file list was checked against git rather than trusted from a build report. Please independently confirm that **every** commit intended for #20–#24 is reachable from the reviewed head, and treat "the builder said it merged" as unverified.

## Read for context

- `AGENTS.md`, `CLAUDE.md`, `docs/WORKFLOW.md`.
- `docs/PROJECT-STATUS.md` — §8 decisions **D-26 … D-30**, §10 known issues, and the **Launch-blocking set**.
- `docs/SECURITY-CHECKLIST.md` — especially §5 (abuse controls), §6 (headers) and §9 invariants **I1–I8**.
- `docs/ENVIRONMENT-PARITY.md` §6, `docs/FEATURE-LIST.md`, `docs/test-reports/2026-08-30-test-report.md`.
- `supabase/migrations/0001…0003` and `docs/database-changes/0003-rate-limits.md`.

## Sprint intent

**Goal:** close every launch blocker in `docs/PROJECT-STATUS.md` §10's Launch-blocking set so the S5.1b gate can run. All eleven are claimed closed: **1, 2, 3, 5, 22, 37, 38, 39, 40, 45, 46** (plus 8, 9, 41, 42, 43 outside that set, and 14 accepted as D-30).

**Owner-authorised exceptions — please do not re-litigate these, but DO flag if the code contradicts them:**

| ID | Decision |
|---|---|
| **D-26** | S2 stage-gate review waived (deadline). Per-PR review retained. |
| **D-27** | S5.1 split into discovery (S5.1a) and verdict (S5.1b). |
| **D-28** | Error tracking removed from the pre-launch path. `LAUNCH-CHECKLIST.md:46` therefore passes **with a recorded exception**, not cleanly. Compensating control: the daily `@morning` check. |
| **D-29** | The build agent drafted `/privacy` and `/terms`, overriding ROADMAP S4.5's "no legal copywriting by the agent". Owner-reviewed. Deliberately contains **no governing-law clause and no fixed refund window** — both owner decisions. |
| **D-30** | `src/middleware.ts` fail-open **accepted**, not fixed. Claimed basis: the middleware is not an access control and every gated surface authorises itself. **Please verify that claim independently** — it is the load-bearing part of the decision. |

**Hosting / Preview state:** PR #24's `E2E — Preview` failed at `151e226` because the new CSP blocked Vercel's preview toolbar (`vercel.live`); fixed at `b429f27`, preview-scoped only. **Confirm a green run exists at the reviewed head** — do not accept the earlier failure or an older green run.

**Database state:** migration `0003_rate_limits` applied to **`unretire-test` only**. **Not applied to `unretire-prod`** — that is an outstanding owner action, and until it is done `/api/subscribe` will fail closed in Production.

## Checks and evidence

- Typecheck: `pnpm typecheck` · Lint: `pnpm lint` · Format: `pnpm format:check` · Build: `pnpm build`
- Tests: `pnpm test:e2e` locally; the authoritative run is the **`E2E — Preview`** workflow.
- All four gates pass at the reviewed head. Confirm independently; run commands only with the existing environment and state anything you could not run and why.

## Already self-identified and fixed — do not spend time re-finding these

Listed so your effort goes to what has **not** been examined. Please still confirm each fix is real.

1. **CSP blocked Vercel's preview toolbar** → whole suite red. Fixed preview-scoped (`b429f27`); production policy verified to contain no `vercel.live`.
2. **`rate_limits` grew without bound** — no sweep existed despite the migration indexing `window_start` for one. Fixed (`128e6a5`); the sweep cannot fail-close a request.
3. **`AC-015` asserted `svg[aria-label="Locked"]` count `0`** on a page where that selector can never match — passing vacuously since S5.1a. Re-asserted semantically.
4. **The bypass never reached API-style requests**, so five specs got Vercel's 401 instead of the app's response.
5. **Two CI runs of one commit raced** over shared fixture accounts; `AC-002`'s global `signOut()` revoked the other run's session.

## Hunt list

Ordered by risk for this range. Report serious, evidence-backed issues only; no style nits.

1. **Money path.** `webhook/route.ts` now returns non-2xx on a failed entitlement write (**I4**) but 200 for foreign events (`23503`, unknown `app`). Can a genuine payment be silently dropped down the foreign-event path? Can a foreign event grant an entitlement? Is `customer.subscription.updated` handling correct, and is leaving `past_due` **active** defensible given the `status` CHECK admits only `active|canceled|expired`?
2. **Paid content (I2).** `CoursePlayer` no longer imports `courseData`; the server passes `modules` or `lockedModules()`. Is there **any** path — RSC payload, prefetch, JS chunk, `/api/course-worksheet`, a static file — by which an unentitled visitor obtains a lesson video id or worksheet? Does `lockedModules()` strip everything paid?
3. **Redirect and origin guards (I5).** `safeNext()` and `safeOrigin()`. Try to defeat them. Is the `-86400-s-projects` suffix requirement sufficient to prevent a stranger claiming a trusted `*.vercel.app` host? Can a forged `x-forwarded-proto` or `Origin` still influence an e-mail link?
4. **Abuse controls (I7, §5).** `src/lib/rate-limit.ts`. Does it genuinely fail closed? Can a caller evade it (header manipulation, bucket collision, window boundary)? Is `rate_limits` truly default-deny — can a signed-in user read or delete their own counter? Is the read-modify-write race acceptable?
5. **Headers (I8, §6).** Does the CSP allow only origins the site loads? Is `script-src 'unsafe-inline'` (recorded limitation, no nonces yet) acceptable for launch, or Blocking?
6. **Migration safety.** `0003` additive/reversible, down file correct, RLS-enabled with zero policies intentional and sufficient.
7. **Test integrity.** This range has produced **five** tests that passed or failed for incidental reasons. Please look specifically for assertions that cannot fail, or that would pass against the pre-fix code. The S5.1b GO depends entirely on this suite meaning what it says.
8. **Secrets/env.** No live values; env by name only. Note that a bypass-secret leak (Known issues 49/51/52) has happened before in artefacts.
9. **Regressions and scope.** Did any fix weaken an existing guard? Do the changed paths match the sprints? Was approved copy altered beyond the recorded removals (placeholder testimonials, unverified stats, lesson count)?

Do not open a live-value env file from the worktree. Never echo a suspected secret value — identify only its file, line and type, and recommend rotation.

## Known gaps in this range — please confirm and weigh

- **S4.3 and S4.5 sprint records are not yet written** (`docs/sprint-prompts/`). Tracker updates for S4.5's issues (3, 5, 8, 9, 46) are also outstanding.
- `book_downloads` RLS was proven only vacuously in S5.1a (the table was empty); it now has one row and can be re-proven.
- Eight write-side parity specs remain unwritten (FM-003/005/006/007, IN-003/004, PY-005, PR-003).
- `script-src 'unsafe-inline'`; nonce-based CSP is a follow-up.

## Returned record

Begin with confirmed range, scope match, files inspected, and commands/evidence checked. Then, for each finding: **Severity** (Blocking / Should-fix), **Location**, **Issue**, **Failure scenario**, **Suggested fix**, **Confidence**. If there are no findings, state **No findings** and list the paths verified — do not return a bare approval.

End with exactly one:

**Verdict: [APPROVE / REQUEST CHANGES]** — [one-line reason].
Reviewed range: `baa1d92..8fc94ad` · Reviewed by [REVIEWER] on [DATE].

---

## Returned review record

**Reviewed by Codex on 2026-08-31 · range `baa1d92..8fc94ad` · Verdict: REQUEST CHANGES**

Range confirmed. Recovered commit `b26bd19` and cherry-pick `8fc94ad` share patch-id `79b4350…`, so nothing was lost. 51 paths, 3,467 insertions, 180 deletions; no dependency or lockfile change. Exact-head CI matched and green: Code Check, `E2E — Preview` (pull_request), `E2E — Preview` (deployment_status). Typecheck, lint, format, build all pass. Credential-free local run: 112 passed.

### Blocking

| # | Location | Issue |
|---|---|---|
| **1** | `webhook/route.ts:42` | Discriminator rejects only when `metadata.app` **exists and differs**. An event with **no** `app` still reaches the upsert; `23503` only catches user ids absent from this project. |
| **2** | `webhook/route.ts:37` | Grants without checking `session.payment_status`, and ignores `checkout.session.async_payment_succeeded/failed`. Delayed-notification methods complete Checkout **before funds settle**. |
| **3** | `webhook/route.ts:123` | `past_due` grace has **no deadline**. Stripe's terminal dunning action can leave a subscription `past_due` indefinitely, contradicting the comment's assumption that it becomes `unpaid`/`canceled`. |
| **4** | `webhook/route.ts:145,:179` | Zero-row lifecycle updates are treated as success. Stripe does not guarantee event order, so a revoke arriving before the grant is **permanently lost**, and the retried grant restores a cancelled subscription. |
| **5** | `lib/stripe/checkout.ts:48` | Idempotency key changes at each minute boundary, so it does not cover the two-tab / impatient-retry case it was added for. |
| **6** | `lib/rate-limit.ts:107` | Read-modify-write is **not atomic**. 100 concurrent requests all read `hits=0`, all pass, and all write `hits=1`. The excess is unbounded, not "give or take the concurrency". |
| **7** | `api/subscribe/route.ts:65,:75` | `tag` has no length or allow-list; **any** truthy object is copied into `merge_fields` and forwarded to the shared live Mailchimp audience. |
| **8** | `ContactForm.tsx:42`, `CommunityJoinForm.tsx:31`, `DiscoveryForm.tsx:59` | The limiter protects **only** `/api/subscribe`. The other **three** public forms POST directly from the browser to Formspree, bypassing every server-side control. §5's "every public form" rule is not met. |

### Should-fix

| # | Location | Issue |
|---|---|---|
| **9** | `lib/auth/safe-origin.ts:29` | The `-86400-s-projects` suffix is a **naming convention, not ownership**. Vercel assigns `.vercel.app` names first-come. Deferrable only with an explicit Vercel-only ingress constraint. |
| **10** | `public-pages.spec.ts:29,:153`, `content.spec.ts:7`, `stripe-webhook.spec.ts:13`, `money-paths.spec.ts:12` | `/privacy` and `/terms` omitted from `PUBLIC_ROUTES`; the social-image assertion is conditional and passes when the tag is missing; several claimed closures have no red→green spec. **Cannot be deferred past S5.1b.** |

### Verified sound

D-30's load-bearing claim holds — every gated route authorises independently of middleware. `lockedModules()` strips all paid data; worksheets sit outside `public/` behind an entitlement check. `safeNext()` resisted protocol-relative, backslash, encoded and cross-origin forms. Production CSP contains no `vercel.live`. No RLS or env-boundary weakening. Migration 0003 additive, reversible, default-deny.

### Confirmed outstanding

S4.3/S4.5 sprint records absent and S4.5 tracker rows stale; migration 0003 unapplied to Production; the dispatch-only parity project did not run at this head, so the non-vacuous `book_downloads` RLS proof and the eight write-side specs remain outstanding.


---

## Remediation record — Finding 10 (Sprint S4.5c, 2026-08-31)

> ⚠ **Note on where this landed.** S4.5 was merged to `master` as **PR #24** (`a7a2540`) and
> **PR #25** (`0afbef2`) **while this verdict still read REQUEST CHANGES and Finding 10 was
> still open**, and GitHub deleted the branch on merge. The reviewed range `baa1d92..8fc94ad`
> is therefore on `master` already. S4.5c lands on `claude/s4.5c-test-integrity`, branched
> from the merged `master`, and the re-review should be pinned to `0afbef2..<its head>`.

Findings **1–9** were fixed in `231b637` and recorded in `docs/sprint-prompts/S4.5-launch-floor.md`.
Finding **10** was left open and is closed here. Sprint record:
`docs/sprint-prompts/S4.5c-test-integrity.md`.

### The three clauses of Finding 10

| Clause | Disposition |
|---|---|
| *"`/privacy` and `/terms` omitted from `PUBLIC_ROUTES`"* | **Fixed.** Both added. Confirmed: the two pages S4.5 shipped had no coverage of any kind — not a route check, not a link check, nothing. |
| *"the social-image assertion is conditional and passes when the tag is missing"* | **Fixed.** PG-011's entire body was inside `if (await ogImage.count())`. The tag's existence is now the first assertion. The test was also titled *"social and canonical URLs"* while asserting no canonical — and the app emits none — so it was retitled to what it proves; canonical is recorded against `LAUNCH-CHECKLIST.md` for S5.2. |
| *"several claimed closures have no red→green spec"* | **Fixed, and it was worse than "several."** Mapping every fix in the range to its spec: of the nine review findings, **exactly one (F9) had a spec that would go red against the pre-fix code.** Issues 3, 8, 9 and 46 had none either. |

### What the reviewer could not have seen from the range alone

Writing the missing specs surfaced three live defects:

1. **Known issue 44 was never fixed.** It was S4.5 scope (`ROADMAP.md:77`), the tracker still read `Open — S4.5`, and `/api/subscribe` still returned Mailchimp's `detail` string to anonymous callers and logged the whole response body. Fixed here.
2. **Known issue 9 was closed on two of its three pages.** `/stories` still displayed *"Placeholders below — swap in real, named stories as they're gathered."* Fixed here.
3. **The parity checkout helper could no longer complete a purchase.** S3.1 moved the `success_url` to `/account?checkout=success`; `helpers/parity.ts` still waited for the pre-S3.1 `/unretire/account`. Fixed here.

### On Hunt-list item 7 ("assertions that cannot fail")

The reviewer counted five such tests in this range. Five more were found and fixed:

- Both **paid-checkout parity specs had stopped exercising a purchase** once the fixture owned the product, while still reporting PASS for *"a purchase reaches Stripe sandbox and grants access"* — vacuous since S2.5, and the reason defect 3 above went unnoticed for two sprints. They now fail with instructions unless the reduced proof is explicitly accepted.
- **AC-012's bundle scan** silently skipped any chunk it could not fetch, so before S5.1a's bypass fix it would have declared the paid course safe having read nothing.
- **IN-005** counted `button:not([disabled])` across the whole page, matching the site's own header chrome — it could not reach zero on any page.
- **A CI run with no fixture password** dropped every access-boundary, paid-content, money-path and logout spec and reported green. The config now refuses to run a partial suite in CI.
- **`origin-guard.spec.ts`** reset two of the four environment variables it sets, leaking state between tests.

### Still outstanding at this head

- **Migrations 0003 and 0004 are not on `unretire-prod`** — verified, `list_migrations` returns empty. Since Finding 8 the limiter also guards `/api/form`, so a Production deploy today leaves **all four public forms refusing every visitor**. Raised to a Blocker in `PROJECT-STATUS.md` §5. Owner action.
- **Known issue 4** — eight dead links, measured rather than estimated, blocked on **D-3**.
- The **eight write-side parity specs** and the non-vacuous **`book_downloads` RLS proof** still need a dispatch-only run.
- **This range has not been re-reviewed.** The standing verdict is REQUEST CHANGES; a re-run at the new head is required before S5.1b.
