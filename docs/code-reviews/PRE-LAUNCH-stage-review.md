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

*(paste the reviewer's returned record here)*
