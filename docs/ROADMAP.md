# ROADMAP.md — Build Order

The scope and dependency plan for `(Un)Retire`. There is no predevelopment handoff behind this file: **the shipped site is the approved baseline**, and scope comes from this roadmap plus the known issues in `PROJECT-STATUS.md` §10. Run one focused sprint at a time. `PROJECT-STATUS.md` records current state; `WORKFLOW.md` records how work ships.

> **Retrofit note (read first):** this site is **already built and live in guest preview** — the core routes, design system, auth, Stripe checkout, and gated course exist as shipped code. Per the owner instruction of 2026-08-25, **predevelopment is dropped entirely** (the project is already at development stage — see withdrawn decision D-6), and the greenfield Stage 0 ("fully working barebones website") and Stage 1 ("approved MVP additions") are **superseded by Stages S1–S5 below**. The product exists; what is being installed around it is the delivery system, the verification, the fixes, and the launch hardening.

## Setup Gate — delivery foundation

Setup is a prerequisite, not a product sprint. In this retrofit, the Setup Gate is completed by Stage S1 and Sprint S2.1 rather than by `docs/templates/NEW-WEBSITE-SETUP-CHECKLIST.md` before Stage 0.

- [ ] Governing docs are filled from the verified state of the shipped site; no critical `[PLACEHOLDER]` remains. *(Sprint S1.1)*
- [ ] GitHub repo exists, `master` is protected, CI is required, and direct/force pushes are blocked. *(Repo exists at github.com/86400websites/unretire; protection + required "Code Check" is an owner action in Sprint S2.1 — gh CLI is not installed, so the owner uses the GitHub web UI. Renaming master→main is Open decision D-1.)*
- [ ] The chosen package manager and verification commands are recorded. *(pnpm — lockfile is pnpm v9 format; `packageManager` pin lands in Sprint S2.1. Commands: `pnpm install`, `pnpm dev`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.)*
- [ ] The approved host builds isolated PR Previews; Vercel is the supplied profile, not a requirement. *(Vercel Preview deployment, per-PR.)*
- [ ] Production deploys only from `master`; rollback action is recorded and tested where practical. *(Rollback: Vercel dashboard → Project → Deployments → previous good Production deployment → "Instant Rollback" (promote previous deployment). Does not restore database data.)*
- [ ] Env-var names are documented without values; live env files are ignored and untracked. *(Names in `PROJECT-STATUS.md` §9 and `.env.example`; live file is `.env.local`, gitignored via the `.env*` rule.)*
- [ ] Database/auth decision is explicit: none, Supabase, or another recorded choice. *(Supabase — auth via @supabase/ssr + Postgres; recorded in `docs/TECH-ARCHITECTURE.md`.)*

**Exit:** a setup PR has passed local checks, Preview QA, independent review, merge, and Production smoke testing. The repository is ready for product work. *(In this plan that setup PR is the Sprint S1.1 PR, with CI made required in Sprint S2.1.)*

## Stage 0 / Stage 1 — superseded by the retrofit

The site is already built (guest preview): all core routes render, the design system is implemented, and the primary conversion (Stripe Checkout) plus email capture exist in code. Stage 0 and Stage 1 as greenfield build stages are **superseded** — their required outcomes are instead **verified and hardened** by the stages below and proven by the Launch Gate test suite. Known defects in the already-built flows are tracked in `PROJECT-STATUS.md` §10 and fixed in their named sprints (notably S3.1: the premium book download and the stale post-refactor redirect paths).

## The five stages

The owner-approved build order (2026-08-25). One focused sprint at a time; every sprint gets a record at `docs/sprint-prompts/[SPRINT_ID]-[SLUG].md`.

| Stage | Outcome | Status |
|---|---|---|
| **S1 — System Integration** | The delivery system exists: governing docs, skills, content freeze, trackers. | Ready for Review |
| **S2 — Readiness Setup** | Clone the repo and be 100% ready: CI, agent tooling, test harness, error tracking. | Not Started |
| **S3 — Critical Fixes** | The live breakage paying customers hit today is repaired. | Not Started |
| **S4 — Improvement Plan** | Audit-then-fix passes: responsiveness/a11y, design system, data, auth, launch blockers. | Not Started |
| **S5 — Launch Gate** | The whole site is proven by an owner-approved test suite, then launched. | Not Started |

### S1 — System Integration

| Sprint | Goal / scope | Explicitly out of scope | Acceptance criteria | Depends on | Status |
|---|---|---|---|---|---|
| S1.1 | System integration: docs pack copied and filled, 5 skills installed (`activate-testing`, `browser-qa`, `close`, `handle-error`, `sprint-prompt`), env example file, content freeze (locked-facts + page-copy baseline), state trackers (this roadmap + `PROJECT-STATUS.md`). Branch: `claude/r1-system-retrofit`. | Any `src/` code change, dependency changes, CI workflows, bug fixes, predevelopment artefacts (dropped — D-6 withdrawn). | Docs pack exists with no critical placeholder unfilled; all 5 skills load by name; content freeze files match on-disk code (flagged items listed, not locked); trackers live; owner reviews and authorizes the commit; the S1 stage-gate Codex review returns **STAGE APPROVED**. | — (D-12 gates what the commit includes) | Ready for Review |

### S2 — Readiness Setup ("100% ready on clone")

| Sprint | Goal / scope | Explicitly out of scope | Acceptance criteria | Depends on | Status |
|---|---|---|---|---|---|
| S2.1 | Code Check CI: `package.json` scripts (`typecheck`, `format:check`, `lint` with an explicit target), Prettier config, `.github/workflows/code-check.yml` per `docs/TECHNICAL-INTEGRITY.md`, `packageManager` pin, **fix the pre-existing lint error at `src/app/premium/page.tsx:182` (raw `<a>` → `next/link` `<Link>`) so the gate can go green** (Known issue 16), rename `env.example` → `.env.example` and add `!.env.example` to `.gitignore`. OWNER: protect `master` (require PR + "Code Check") via the GitHub web UI; optionally resolve D-1 (rename to `main`). | App code or bug fixes, dependency removal, formatting rewrites beyond config, Playwright, Sentry, MCP config. | "Code Check" runs green on a PR; all four local checks pass with `pnpm lint` at zero errors; CI honours the pinned package manager; `.env.example` is tracked and no live env file is tracked or staged; owner has protected `master` (gh CLI is not installed — web UI). | S1.1 | Not Started |
| S2.2 | Agent tooling: project-scoped `.mcp.json` wiring the Supabase MCP — `supabase-test` (read-write; feature groups `database`, `debugging`, `docs`) and `supabase-prod-readonly` (`read_only=true`) — governed by `docs/SUPABASE-MCP-SAFETY.md`, which this repo currently records as **Profile A (no production MCP)**. Verify Playwright MCP (already installed at **USER** scope on this machine) and verify all 5 skills load. | **Adding Playwright MCP to project `.mcp.json`** — `docs/BROWSER-TOOLS.md` keeps it at user scope, so S2.2 only verifies it. Any write against Production, schema changes, and wiring `supabase-prod-readonly` without a recorded Profile B exception. | `supabase-test` answers a read query against the **non-production** project; Playwright MCP is confirmed present at user scope and **absent** from `.mcp.json`; all 5 skills load. The prod server is wired **only** if the owner has approved D-11 and recorded a **Profile B exception** (owner, reason, date, allowed feature groups, data classification, removal condition); otherwise the repo stays Profile A, that row is deferred citing D-11, and the sprint still passes. Where Profile B is live, a write attempted through `supabase-prod-readonly` is refused. | S2.1; **D-11** (prod server only) | Not Started |
| S2.3 | Playwright harness — the Launch Gate's setup half (`docs/testing-setup/SETUP-CHECKLIST.md`): `@playwright/test` as a dev dependency, `playwright.config` (`tests/e2e/`, `PLAYWRIGHT_BASE_URL`, desktop + 390px mobile profiles, one auth-setup project per role), one homepage smoke test proven against a deployed Preview, `.github/workflows/morning-check.yml` added **DISABLED**, `qa-evidence/` gitignored. OWNER: confirm a non-production Supabase project exists and create obviously-fake test users in it. | The full e2e suite (arrives via `/activate-testing` in S5.1), enabling the morning check, any Production Supabase change, using real customer accounts as test users. | The smoke test passes against a **deployed Preview** in both profiles; the auth-setup project stores a session per role; `morning-check.yml` is present and disabled; `qa-evidence/` is ignored and untracked; obviously-fake test users exist in the non-production Supabase project. | S2.1; D-8 | Not Started |
| S2.4 | Error tracking (`docs/error-tracking/SETUP-CHECKLIST.md`): Sentry Next.js SDK, DSN referenced by env **NAME** only, user context, data scrubbing, environment tagging so Production is distinct from Preview, source maps, one deliberate test error triggered then removed. OWNER: create the Sentry project, hand over the DSN, set it in Vercel, create the "new Production issue → email me" alert rule, and confirm the alert arrived. | Analytics tooling (backlog decision), performance monitoring beyond defaults, alert rules beyond the owner's one rule, hardcoding a DSN anywhere in the repo. | A deliberate test error appears in Sentry with the correct environment tag and the owner confirms the alert email arrived; no secret or PII appears in the event payload; the deliberate trigger is removed before merge; the DSN exists in the repo as an env **name** only. | S2.1; owner DSN | Not Started |

### S3 — Critical Fixes (live breakage — paying customers affected)

| Sprint | Goal / scope | Explicitly out of scope | Acceptance criteria | Depends on | Status |
|---|---|---|---|---|---|
| S3.1 | Broken-flow fixes: `/api/book-download` master-PDF path (`src/app/unretire/account/_book/...` → `src/app/account/_book/...`) and the 3 stale `/unretire/*` destinations left by the promote-to-root refactor — Stripe `success_url` (`src/lib/stripe/checkout.ts`), already-owned redirect (`src/app/api/checkout/route.ts`), password-reset `next` (`src/app/auth/actions.ts`) (Known issues 1–2). | Hygiene deletions (S3.2), moving master PDFs out of git (D-4), legacy-page decisions (D-3), copy changes, watermarking logic changes. | On the deployed Preview: a premium account downloads the **watermarked** book and workbook PDFs; checkout success, already-owned, and password-reset all land on real routes with no 404; no other route's behavior changes. | S2.1 | Not Started |
| S3.2 | Hygiene: delete the stray root `page.tsx` (dead legacy page Next never loads), untrack `unretire 21-august-2026.zip` (6.3MB), rename the package from "half-a-life", remove unused dependencies (`framer-motion`, `lucide-react`, `@base-ui/react`, shadcn CLI out of runtime deps), remove the unused `NewsletterForm.tsx` with its fake submit. Requires owner deletion authorization (D-5). | Behavior changes to live pages, master-PDF relocation (D-4), CSS/design refactors (S4.2), git-history scrub. | `pnpm build` passes with the recorded route count unchanged apart from the dead root page; junk files untracked; no unused-dependency regression; "Code Check" green. | S3.1; D-5 | Not Started |

### S4 — Improvement Plan

Each sub-sprint **opens with a written AUDIT**; the owner approves the finding list; only then does a scoped fix sprint run. The audit is a deliverable, not a preamble.

| Sprint | Goal / scope | Explicitly out of scope | Acceptance criteria | Depends on | Status |
|---|---|---|---|---|---|
| S4.1 | Mobile responsiveness + accessibility: **audit** every public route at 320 / 768 / 1440 via `/browser-qa`, judged against `docs/DESIGN.md` (WCAG AA contrast, tap targets ≥44px, no horizontal scroll from 320px, visible focus rings) → owner approves the finding list → scoped fix sprint. | Design-system refactor (S4.2), new pages or features, copy changes, any redesign not traceable to an approved audit finding. | The audit doc lists every finding with route, viewport, screenshot evidence, and severity; the owner-approved subset is fixed; a re-run at 320/768/1440 shows no horizontal scroll, tap targets ≥44px, a visible focus ring on every interactive element, and AA contrast on the approved palette pairs. | S3.1; S2.2 | Not Started |
| S4.2 | Design-system consolidation: remove the dead legacy dark "Half a Life" palette from `globals.css` that `.ur-site` already overrides, unify on the `--ur-*` tokens, close the component-register gaps in `docs/DESIGN.md`. | Visual redesign, new components, copy changes, layout changes beyond what a token swap requires. | No dead palette remains and every live surface resolves `--ur-*` tokens; before/after screenshots at 320/768/1440 show no unintended visual change; the `docs/DESIGN.md` component register has no gaps. | S4.1 | Not Started |
| S4.3 | Supabase + data hardening: the `entitlements` table has **no schema/RLS SQL in the repo** (only `book_downloads.sql` exists) — capture it; verify default-deny RLS on every user-reachable table; adopt the numbered up/down migration workflow per `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`. | Production data migration, destructive schema changes, new tables or features, applying any migration to Production without an explicit owner instruction. | Every user-reachable table has a checked-in schema + RLS policy file; default-deny is **proven** by a denied read from an unauthorized role in the non-production project; migrations are numbered with up/down and were applied non-production first; the template's change record is filled, including classification and recovery limits. | S2.2; D-8 | Not Started |
| S4.4 | Auth hardening: `src/middleware.ts` session refresh is **fail-open** — review and decide (Known issue 14); re-verify that every gated route authorizes server-side before protected reads; confirm redirect-target validation; confirm Preview auth emails return to the **Preview** origin, not Production. | New auth providers, role-model changes, auth-page UI or copy changes, password-policy changes. | The middleware decision is recorded (fixed, or accepted with a named compensating control and a decision ID); every gated route is listed with the server-side check it performs plus an **allowed** and a **denied** proof on Preview; redirect destinations are validated against an allowlist; a Preview password-reset link lands on the Preview origin. | S3.1 | Not Started |
| S4.5 | Launch blockers: abuse controls on public write endpoints (server-verified bot check + rate limit, failing **CLOSED** in Production) per `docs/SECURITY-CHECKLIST.md` §5 — currently absent and launch-blocking (Known issue 5); `/privacy` + `/terms` pages (footer links 404 today; owner supplies the legal copy — Known issue 3); email deliverability SPF/DKIM/DMARC verified with an external-address inbox test. | Advanced hardening (tighter limits, anomaly detection — scale-deferrable to backlog), legal copywriting by the agent, analytics. | Public write endpoints reject bot and over-limit traffic on Preview and **fail closed** (reject, never pass through) when the control is unavailable in a Production-like configuration; `/privacy` and `/terms` render owner-approved copy and the footer 404s are gone; SPF, DKIM, and DMARC pass an external-inbox test from the sending domain. | S3.1; D-9; D-2; owner legal copy | Not Started |

### S5 — Launch Gate

| Sprint | Goal / scope | Explicitly out of scope | Acceptance criteria | Depends on | Status |
|---|---|---|---|---|---|
| S5.1 | `/activate-testing` Phases 1–5: repo-wide feature scan → `docs/FEATURE-LIST.md` → **owner approves in writing** → one Playwright spec per approved line → full run against the deployed Preview → plain-English report → fix loop → GO/NO-GO verdict. **Input substitution:** this project has no predevelopment pack (dropped — D-6 withdrawn), so where `/activate-testing` Phase 1 says to cross-check the predevelopment deliverables, the equivalent sources are `docs/TECH-ARCHITECTURE.md` (routes, access rules, data), `docs/DESIGN.md` (design intent) and `docs/content/` (copy + locked facts); the code remains the primary source of truth. | New features, refactors beyond fixing a failing test, Stripe live keys, testing against Production, issuing GO from a partial or stale run. | `docs/FEATURE-LIST.md` is approved in writing; one spec exists per approved line; **every protected boundary has an allowed AND a denied assertion**; abuse controls are asserted as "blocked is the PASS"; Stripe runs in test mode only; a **FULL** run against the deployed Preview is 100% pass **on the current head**; the plain-English report is saved. | S2.3; S4.5 (all launch scope Done) | Not Started |
| S5.2 | Launch: run `docs/LAUNCH-CHECKLIST.md`, then enable the morning check with the owner-approved 5–7 `@morning` specs. | Any new scope; deferrals without a decision ID and a backlog owner. | The launch checklist is complete; the primary journey works on the real domain; the Production smoke test passes; `morning-check.yml` is enabled and its first scheduled run is reported green to the owner. | S5.1 GO | Not Started |

## Stage-gate review — Codex runs at the end of every stage

There are **two** independent reviews in this plan, not one:

1. **Per-PR review** — unchanged, per `WORKFLOW.md` §6: every PR is reviewed over the immutable `[MERGE_BASE_SHA]..[HEAD_SHA]` range at the head that was Preview-tested, and saved at `docs/code-reviews/[SPRINT_ID]-[SLUG]-review.md`.
2. **Stage-gate review** — after the last sprint in a stage is merged and **before the next stage begins**, the owner has Codex review the stage as a whole against the acceptance criteria recorded above, using `docs/templates/CODEX-STAGE-REVIEW-TEMPLATE.md`. Save it at `docs/code-reviews/[STAGE_ID]-stage-review.md`.

A stage is not Done until its stage-gate review returns **STAGE APPROVED**. A Blocking finding at the stage gate is never merged past and never carried into the next stage; a Should-fix may be deferred only with a logged owner + reason in `PROJECT-STATUS.md` §8. The stage gate is **additional to** — never a substitute for — the per-PR review, and like it the reviewer makes no repository changes.

## Launch Gate

- [ ] All launch-scope sprints are Done; accepted deferrals cite a decision ID and backlog owner.
- [ ] Full `QA-CHECKLIST.md`, `SECURITY-CHECKLIST.md`, and `LAUNCH-CHECKLIST.md` pass.
- [ ] Primary journey works on the real domain.
- [ ] Content sites have an approved editorial workflow, editor roles, media ownership, redirects, backup/export plan, and client training.
- [ ] Rollback owner and action are known; database recovery limits are understood.

## Post-launch backlog

Deferred or retired scope is never silently deleted. Record the item, value, owner, dependency, decision ID, and reason. Promote one item at a time into a scoped sprint. The living backlog is `docs/POST-LAUNCH-BACKLOG.md`.

## Universal sprint exit gate

- [ ] Allowed paths and acceptance criteria are satisfied; out-of-scope behavior is preserved.
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, tests (N/A — no automated suite yet; this project has auth + payments, so an e2e suite is REQUIRED before launch and arrives with the Launch Gate module — Sprint S2.3 setup, then `/activate-testing`), and `pnpm build` pass.
- [ ] Manual and accessibility checks for affected journeys pass.
- [ ] Deployed Preview is tested on desktop and mobile; Vercel or the approved equivalent is named in the record.
- [ ] Security sections touched by the diff pass.
- [ ] Codex reviewed the immutable merge-base-to-head range and returned Approve.
- [ ] No substantive change occurred after the reviewed head; otherwise Preview and review were repeated.
- [ ] `PROJECT-STATUS.md` and this roadmap were updated in the same authorized branch.
- [ ] After merge, Production smoke test passes.

Database sprints additionally record migration classification (additive, reversible, or destructive), non-production verification, backup/recovery needs, and the fact that schema rollback cannot restore lost data.

## Build-sequence rationale

This order is the smallest safe path because each stage protects the ones after it.

**S1 first — machinery before matter.** The governing docs, skills, content freeze, and trackers are installed before anything else, so every later change is made against recorded facts instead of memory, and so every later sprint has a record, a scope fence, and an exit gate to be judged by.

**S2 second — make every later sprint verifiable.** Code Check CI plus branch protection means nothing after it can merge unverified; the MCP wiring, the Playwright harness, and Sentry mean that from this point on a claim ("the download works", "nothing else broke", "Production is quiet") can be *proved* rather than asserted. Second place is the whole point of the owner's instruction that a fresh clone be "ready 100%": the tooling is a precondition of trustworthy work, not a nice-to-have bolted on at the end.

**S3 third — and this is the one recommendation added to the owner's plan, stated openly rather than applied silently.** Two defects are not "improvements", they are **live breakage that paying customers hit today**: (a) `/api/book-download` reads master PDFs from `src/app/unretire/account/_book/...` while the files live at `src/app/account/_book/...`, so **every premium book and workbook download fails**; and (b) three stale `/unretire/*` destinations left by the promote-to-root refactor now 404 — the Stripe `success_url`, the already-owned redirect, and the password-reset `next` — so a customer who has **just paid** lands on a 404, and a locked-out customer cannot reset their password. Money has already changed hands in both cases. **Recommendation: make these Stage S3 (Critical Fixes) instead of leaving them inside the Improvement Plan**, which shifts Improvement to S4 and the Launch Gate to S5. They sit *after* S2 only because S2 is what makes the fix provable on a Preview; they sit *before* S4 because no amount of responsive polish outranks a paying customer being able to download what they bought. Hygiene (S3.2) rides in the same stage but strictly after the flow fixes, so deletions are verified against a working app under CI.

**S4 fourth — improve what is now stable and measurable.** Each sub-sprint opens with a written audit so the fix list is evidence-driven and owner-approved rather than taste-driven: responsiveness and accessibility first, then the design-system consolidation that depends on knowing what the audit found, then data and auth hardening, then the remaining launch blockers — abuse controls, legal pages, deliverability — each of which needs an owner input (D-9, owner legal copy, D-2) and is therefore scheduled where those inputs can be gathered in parallel.

**S5 last — prove it all.** The full suite is written only once the feature surface has stopped moving; otherwise the suite tests a site that no longer exists. The Launch Gate then converts everything above into a single defensible verdict: 100% pass on a FULL run against the deployed Preview at the current head, or no GO.

**Reviews:** the owner runs an independent Codex review at the end of **every stage**, before anything merges onward — see "Stage-gate review" above — in addition to the per-PR review on each sprint.

## Superseded numbering

The earlier R1–R7 plan is retired but must stay traceable: existing sprint records, review records, branch names, and known-issue references still point at R-numbers. Map them as follows.

| Old | New | Note |
|---|---|---|
| R1 | **S1** (S1.1) | Same work, minus the predevelopment backfill (dropped). Records and the branch keep the `r1-system-retrofit` slug. |
| R2 | **S2.1** | Code Check CI; now also carries the `env.example` → `.env.example` rename. |
| R3 | **S3.1** | Broken-flow fixes; promoted into their own stage (see rationale). |
| R4 | **S3.2** | Hygiene; now in the same stage as, and after, the flow fixes. |
| R5 | **S2.3** | Playwright harness; moved earlier, into Readiness Setup. |
| R6 | **S2.4** | Error tracking; moved earlier, into Readiness Setup. |
| R7 | **S4.5** | Launch blockers; now the last Improvement sub-sprint. |

New in this plan, with no R-number: **S2.2** (agent tooling / MCP), **S4.1** (responsiveness + accessibility), **S4.2** (design-system consolidation), **S4.3** (Supabase + data hardening), **S4.4** (auth hardening), and the two explicit **S5** Launch Gate sprints.

**Next:** set the active sprint in `PROJECT-STATUS.md`, then run it through `WORKFLOW.md`.
