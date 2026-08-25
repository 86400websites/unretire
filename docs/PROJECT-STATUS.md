# PROJECT-STATUS.md — Where the Build Stands

The living tracker for (Un)Retire. Any fresh session — AI or human — reads this file **first** to know
exactly where the build stands and what to do next. It holds state, not plans: scope and exit gates live in
`docs/ROADMAP.md`; process lives in `docs/WORKFLOW.md`.

## 1. Right now

| Item | Value |
|---|---|
| Current stage | **Development** — Stage 1 (System Integration) of the owner-approved 5-stage plan **S1–S5** (2026-08-25; see `docs/ROADMAP.md`). Predevelopment is **dropped** on owner instruction: the site is already built and in guest preview. The earlier R1–R7 numbering is superseded (map in §2) |
| Active sprint | **S1 — System Integration**: docs pack, 5 skills, `env.example`, content freeze, state trackers — Status: **Ready for Review** (work complete in the working tree; local checks run) |
| Current branch | `master` working tree, uncommitted — branch `claude/r1-system-retrofit` to be created when the owner authorizes commit (old ID `r1` kept in the branch name for traceability) |
| Next action | 1. Owner reviews the S1 output (`docs/sprint-prompts/R1-system-retrofit.md` lists everything). 2. Owner authorizes commit → create `claude/r1-system-retrofit`, commit, open PR, test Preview, hand `docs/code-reviews/S1-stage-review.md` to Codex. 3. **Owner actions before Stage 2:** rename `env.example` → `.env.example` (and add `!.env.example` to `.gitignore`), and protect `master` (require PR + "Code Check") via the GitHub web UI. 4. On merge, **Stage 2 opens with S2.1 — Code Check CI**. Full owner checklist: `docs/OWNER-ACTIONS.md`. — *Prior:* owner review of R1 → R2 Code Check CI (superseded 2026-08-25 by the 5-stage plan) |
| Preview / Production | Vercel Preview deployment (per-PR) / production domain TBC (Open decision D-2) on Vercel |
| Last updated | 2026-08-25 — trackers re-pointed from R1–R7 to the owner-approved 5-stage plan (S1–S5); predevelopment withdrawn (D-6); D-11 and D-12 added. — *Prior:* 2026-08-25 — Sprint R1 retrofit docs pack written to the working tree; awaiting owner review and commit authorization |

### How to resume in a fresh AI session

1. Read this file, then the active sprint's scope + exit gate in `docs/ROADMAP.md`.
2. Read the agent-instructions file (`CLAUDE.md` / `AGENTS.md`) and the docs it points to for the task.
3. Verify the repo state yourself (package manifest, source tree, `git log`). If it disagrees with this file, report the mismatch; update this file only when the task authorizes it.
4. Work only inside the active sprint. Anything else → propose it under Open decisions or the backlog.
5. Before ending: update §1–§3 here, tick the roadmap checkboxes, and include this file in the PR.

Why this matters: this ritual makes the project session-stateless — anyone can cold-start and resume mid-sprint with zero verbal briefing.

## 2. Sprint board

Status legend: Not Started · In Progress · Blocked (say why) · Ready for Review · Approved · Done · Not Applicable (optional only; reason required).

Each stage ends with an **independent Codex review** before anything merges.

| Sprint | Status | Branch | PR | Merged date | Notes |
|---|---|---|---|---|---|
| **Stage 1 — System Integration** | | | | | |
| S1.1 — System integration | Ready for Review | `claude/r1-system-retrofit` (to be created on commit authorization) | | | Docs pack, 5 skills, `env.example`, content freeze, trackers. Records: `docs/sprint-prompts/R1-system-retrofit.md`, `docs/code-reviews/S1-stage-review.md` (brief prepared; SHAs filled when the PR opens). Needs D-12 (commit the SOP folder) |
| **Stage 2 — Readiness Setup ("100% ready on clone")** | | | | | |
| S2.1 — Code Check CI | Not Started | | | | `package.json` scripts (typecheck, format:check, lint with explicit target), Prettier config, `.github/workflows/code-check.yml`, `packageManager` pin, fix Known issue 16, rename `env.example` → `.env.example` + `!.env.example`. OWNER protects `master` (web UI — gh CLI not installed). D-1 optional rename |
| S2.2 — Agent tooling | Not Started | | | | Project-scoped `.mcp.json`: `supabase-test` (read-write; database, debugging, docs) and `supabase-prod-readonly` (`read_only=true`), governed by `docs/SUPABASE-MCP-SAFETY.md` — repo currently records **Profile A (no production MCP)**, so the prod server needs **D-11** first. Playwright MCP stays at USER scope (`docs/BROWSER-TOOLS.md`) — verify only. Verify all 5 skills load |
| S2.3 — Playwright harness | Not Started | | | | Launch Gate setup half (`docs/testing-setup/SETUP-CHECKLIST.md`): `@playwright/test`, config (`tests/e2e/`, `PLAYWRIGHT_BASE_URL`, desktop + 390px mobile, auth-setup project per role), one homepage smoke test proven on a deployed Preview, `morning-check.yml` added **DISABLED**, `qa-evidence/` gitignored. Needs D-8 + owner-created fake test users |
| S2.4 — Error tracking | Not Started | | | | `docs/error-tracking/SETUP-CHECKLIST.md`: Sentry Next.js SDK, DSN by env **NAME** only, user context, data scrubbing, environment tagging (Production ≠ Preview), source maps, one deliberate test error then removed. OWNER creates the project, supplies the DSN, sets it in Vercel, creates the "new Production issue → email" alert and confirms it arrived |
| **Stage 3 — Critical Fixes (live breakage — paying customers affected)** | | | | | |
| S3.1 — Broken-flow fixes | Not Started | | | | Known issues 1–2: book-download master-PDF path + the 3 stale `/unretire/*` destinations. Exit proven on Preview: a premium account downloads a watermarked PDF; checkout-success, already-owned and password-reset all land on real routes |
| S3.2 — Hygiene | Not Started | | | | Stray root `page.tsx`, tracked 6.3MB zip, package name still "half-a-life", unused deps (framer-motion, lucide-react, @base-ui/react, shadcn CLI in runtime deps), unused `NewsletterForm.tsx`. Needs D-5 (deletion authorization) |
| **Stage 4 — Improvement Plan** (each sub-sprint opens with a written AUDIT, then a scoped fix sprint) | | | | | |
| S4.1 — Mobile + accessibility | Not Started | | | | Audit all public routes at 320/768/1440 via `/browser-qa` against `docs/DESIGN.md` (WCAG AA, tap targets ≥44px, no horizontal scroll from 320px, visible focus rings, contrast) → fix sprint |
| S4.2 — Design-system consolidation | Not Started | | | | Remove the dead legacy dark "Half a Life" palette in `globals.css` that `.ur-site` overrides, unify on `--ur-*` tokens, close component-register gaps in `docs/DESIGN.md` |
| S4.3 — Supabase + data hardening | Not Started | | | | `entitlements` has **no schema/RLS SQL in the repo** (only `book_downloads.sql`) — capture it, verify default-deny RLS on every user-reachable table, adopt numbered up/down migrations per `docs/templates/SUPABASE-CHANGE-TEMPLATE.md` |
| S4.4 — Auth hardening | Not Started | | | | `src/middleware.ts` session refresh is fail-open — review and decide (Known issue 14); re-verify every gated route authorizes server-side before protected reads; confirm redirect-target validation and that Preview auth emails return to the Preview origin |
| S4.5 — Launch blockers | Not Started | | | | Abuse controls on public write endpoints (server-verified bot check + rate limit, failing **CLOSED** in Production) per `docs/SECURITY-CHECKLIST.md` §5 (D-9); `/privacy` + `/terms` (owner supplies legal copy); SPF/DKIM/DMARC verified with an external-address inbox test |
| **Stage 5 — Launch Gate** | | | | | |
| S5.1 — `/activate-testing` | Not Started | | | | Phases 1–5: repo-wide feature scan → `docs/FEATURE-LIST.md` → **OWNER APPROVES IN WRITING** → one Playwright spec per approved line (every protected boundary gets an allowed AND a denied assertion; abuse controls asserted as "blocked is the PASS"; Stripe test mode only) → full run on the deployed Preview → plain-English report → fix loop → **GO only from a FULL run at 100% pass on the current head** |
| S5.2 — Launch | Not Started | | | | `docs/LAUNCH-CHECKLIST.md`, then enable the morning check with the owner-approved 5–7 `@morning` specs. Needs D-2 (production domain) |

Retired sprints stay in the table, struck through, with the date, reason, and where the scope moved (backlog).

*ID map (2026-08-25 renumbering — old IDs kept traceable, no scope deleted):* R1 → **S1.1** · R2 → **S2.1** · R3 → **S3.1** · R4 → **S3.2** · R5 → **S2.3** (setup half) + **S5.1** (run half) · R6 → **S2.4** · R7 → **S4.5**. New scope added by the plan: **S2.2** (agent tooling), **S4.1–S4.4** (improvement audits), **S5.2** (launch). The branch and record filenames created under the old numbering (`claude/r1-system-retrofit`, `docs/sprint-prompts/R1-system-retrofit.md`) keep their original names.

## 3. Last completed work

- 2026-08-25 — S1.1 (in progress, old ID R1): retrofit docs pack, content freeze, and state trackers written to the `master` working tree. Nothing committed or merged yet; no code changed. Next session must not commit without explicit owner authorization.
- 2026-08-25 — Plan re-pointed to the owner-approved 5-stage sequence (S1 System Integration → S2 Readiness Setup → S3 Critical Fixes → S4 Improvement Plan → S5 Launch Gate); predevelopment dropped (D-6 withdrawn). Documentation only.

## 4. Next sprint

- **S2.1 — Code Check CI**: package scripts, Prettier config, `.github/workflows/code-check.yml`, `packageManager` pin, Known issue 16 fix, `env.example` → `.env.example`; owner protects `master`. Depends on: S1 merged after Codex review; owner branch-protection action (and D-1 if renaming). Brief: to be created at sprint start at `docs/sprint-prompts/[SPRINT_ID]-[SLUG].md`.

## 5. Blockers

| # | Blocker | Blocking what | Who unblocks | Since |
|---|---|---|---|---|
| 1 | Commit authorization for the S1 output not yet given | S1.1 completion (branch, commit, PR) | Owner | 2026-08-25 |
| 2 | gh CLI not installed on this machine — branch protection must be done via the GitHub web UI | S2.1 exit (protected `master` + required "Code Check") | Owner | 2026-08-25 |

## 6. Checks status

| Check | Last run | Result | Notes |
|---|---|---|---|
| typecheck | 2026-08-25 | **PASS** | `pnpm exec tsc --noEmit` — exit 0, zero errors (strict). Run locally on the S1 working tree; not yet in CI (S2.1 adds a `pnpm typecheck` script + the Code Check workflow) |
| lint | 2026-08-25 | **FAIL — 1 pre-existing error** | `pnpm lint` — `src/app/premium/page.tsx:182` `@next/next/no-html-link-for-pages`: raw `<a>` navigating to `/learn/course/`, must be `<Link>`. **Pre-existing, not caused by S1** (S1 changed no app code). Must be green before the Code Check gate — see Known issue 16, fixed in S2.1 |
| tests | 2026-08-25 | N/A — no suite yet | No automated suite exists. Auth + payments make an e2e suite REQUIRED before launch per `docs/TECH-ARCHITECTURE.md` (S2.3 setup, then `/activate-testing` in S5.1) |
| build | 2026-08-25 | **PASS** | `pnpm build` — exit 0, compiled in 18.9s. **Built route count: 35 entries (33 dynamic ƒ + 2 static ○), 58 static pages generated** (58 includes the 12 blog `[slug]` and 10 course `[module]` variants). An unexpected ±1 on a later run flags an accidental route add/delete |
| deployed Preview | — | not run | Vercel Preview deployment (per-PR); no S1 PR opened yet — S1 is uncommitted pending owner authorization |

*S1 note: `pnpm install --frozen-lockfile` succeeded (dependencies were not previously installed on this machine). Checks were run against the S1 working tree, which changes documentation only — no app code, config, or dependency was modified.*

## 7. Locked decisions (do not reopen)

Changes require a new, explicit superseding decision by the client — never a silent edit.

| ID | Date | Decision | Decided by | Supersedes / notes |
|---|---|---|---|---|
| — | | None recorded yet — first locked decisions expected at the S1 review | | |

## 8. Open decisions (resolve here, then propagate)

Resolved rows are stamped **RESOLVED [DATE]** (or **ACCEPTED** for consciously-taken risks) — never deleted.
An accepted risk must name its compensating control and where it's tracked.

| ID | Decision needed | Options / current lean | Needed by | Status |
|---|---|---|---|---|
| D-1 | Default branch is `master`; the system SOP assumes `main`. Rename? | Lean: rename to `main` (GitHub auto-redirects; update Vercel prod branch). Owner call. | S2.1 | Open |
| D-2 | Confirm the production domain (value of `NEXT_PUBLIC_SITE_URL` in Vercel) | Owner confirms; env var is authoritative | S4.5 / S5.2 (Launch) | Open |
| D-3 | Legacy pages: `/framework` children (7 nonexistent `/framework/practice-*`), `/journeys` (7 nonexistent children), `/articles` (off-nav) — complete them or remove them | No lean recorded; owner call | S5.1 (Launch Gate feature list) | Open |
| D-4 | Move un-watermarked master PDFs out of git (private storage / Supabase storage)? History scrub is destructive | Lean: move them out; scrub is owner call | Before launch — by S5.2 (tracked in backlog) | Open |
| D-5 | Authorize deletion of tracked junk files (`unretire 21-august-2026.zip`, stray root `page.tsx`) plus the unused deps and `NewsletterForm.tsx` | Lean: delete | S3.2 | Open |
| ~~D-6~~ | ~~Predevelopment owner inputs — files 1 (strategy), 2 (research), 4 (inspirations) + retroactive GO signature on file 8~~ | ~~Owner provides~~ | ~~S1.1 close-out~~ | **WITHDRAWN 2026-08-25 — owner instruction: project is at development stage; predevelopment does not apply** |
| D-7 | Commit the `Website-Development-System/` folder into the repo (currently untracked)? | Lean: YES — keep it as the SOP source of record | S1.1 commit | Open — wording superseded by **D-12** (2026-08-25); resolve the two as one decision. Kept for traceability |
| D-8 | Does a non-production (test) Supabase project exist? Required for Launch Gate test users. | **RESOLVED 2026-08-25** — yes: project `unretire-test`, ref `dtdadtggahjsrmevwvbu`, region ap-south-1 (org "Test Databases", free tier). Identifier only — no key or value recorded here. | S2.2 / S2.3 | Resolved |
| D-9 | Choose the abuse-control stack for the public write endpoints | Lean: Cloudflare Turnstile + Upstash rate limit (SOP defaults) | S4.5 | Open |
| D-10 | Guest Preview banner ends 31 August 2026 — what replaces it? | **RESOLVED 2026-08-25** — owner decision: let it expire as originally set up. No code change; the banner is date-bound by design. Known issue 12 closes on that basis. | — | Resolved |
| D-11 | Supabase MCP Profile B (production read-only) — approve? | **APPROVED 2026-08-25 by the owner (Khalid Siddiqui).** Reason: schema inspection and debugging parity between test and production. Scope: `read_only=true`, feature groups `database,debugging,docs`. Data classification: confidential (account identities + purchase entitlements). Removal condition: at client handover, or on request. Manual approval of MCP tool calls stays ON. Production project ref still required from the owner before wiring. | S2.2 | Resolved — pending prod ref |
| D-12 | Commit the `Website-Development-System/` SOP folder into the repo? (supersedes the D-7 wording; D-7 kept for traceability) | **Included in the S1 PR** on recommendation — a fresh clone then carries the system, which is the stated "ready 100% on clone" goal (390 KB, 57 files). Its `predevelopment/` half does not apply to this project but stays for future greenfield sites. Owner confirms at PR review, or says the word and it comes out in one commit. | S1.1 | Open — decided at S1 review |

## 9. Env vars record (NAMES only — never values)

Owner sets all values in Vercel environments; the local live file is `.env.local` (gitignored via the `.env*` rule; never opened by agents).

| Name | Public / server-only | Feature it switches on | Set in |
|---|---|---|---|
| NEXT_PUBLIC_SITE_URL | Public | Canonical site URL (authoritative for D-2) | Vercel environments |
| NEXT_PUBLIC_SUPABASE_URL | Public | Supabase project endpoint (auth + Postgres) | Vercel environments / local |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public | Supabase browser/SSR client | Vercel environments / local |
| SUPABASE_SECRET_KEY | Server-only | Service-role admin client (entitlements upsert from Stripe webhook) | Vercel Production / Preview |
| STRIPE_SECRET_KEY | Server-only | Stripe Checkout session creation | Vercel Production / Preview |
| STRIPE_WEBHOOK_SECRET | Server-only | Stripe webhook signature verification (`/api/stripe/webhook`) | Vercel Production / Preview |
| STRIPE_PRICE_COURSE | Server-only | Course price — $99 one-time | Vercel Production / Preview |
| STRIPE_PRICE_PREMIUM | Server-only | Premium price — $199/yr subscription | Vercel Production / Preview |
| MAILCHIMP_API_KEY | Server-only | Mailchimp Marketing API (`/api/subscribe`) | Vercel Production / Preview |
| MAILCHIMP_LIST_ID | Server-only | Mailchimp audience for email capture | Vercel Production / Preview |
| NEXT_PUBLIC_FORMSPREE_ENDPOINT | Public | Formspree static forms (e.g. contact) | Vercel environments |

**Never do this:** never record a value, key, token, or connection string in this file — names and service states only.

## 10. Known issues

The launch sprint cannot pass while this section has unresolved bugs — except deferrals the client has
explicitly accepted (cite the accepting decision ID). Deferred hardening is marked **"required before scale"**.

| # | Severity | Where | Issue | Status |
|---|---|---|---|---|
| 1 | Blocker (for premium users) | `/api/book-download` | Loads master PDFs from `src/app/unretire/account/_book/...` but they live at `src/app/account/_book/...` → downloads always fail | Open — fix in S3.1 |
| 2 | High | `src/lib/stripe/checkout.ts`, `src/app/api/checkout/route.ts`, `src/app/auth/actions.ts` | Stale `/unretire/*` paths post-refactor: Stripe `success_url` `/unretire/account?checkout=success`, already-owned redirect `/unretire/learn/course`, password-reset `next=/unretire/reset-password` — all 404 | Open — fix in S3.1 |
| 3 | High | Footer | `/privacy` and `/terms` links → 404 (pages don't exist); needs owner-approved legal copy | Open — S4.5 |
| 4 | Medium | `/framework`, `/journeys`, `/articles` | Dead links: 7 nonexistent `/framework/practice-*` pages, 7 nonexistent `/journeys/*` pages; `/articles` is a legacy off-nav page | Open — decision D-3 (by S5.1) |
| 5 | High (launch-blocking) | Public write endpoints (`/api/subscribe` et al.) | No abuse controls (rate limit / bot check) — launch-blocking per `docs/SECURITY-CHECKLIST.md` §5 | Open — S4.5 |
| 6 | High | Git-tracked repo content | Un-watermarked master PDFs (`unretire-book-master.pdf`, `unretire-workbook-master.pdf`) are git-tracked — the clean copies the watermark system exists to protect | Open — decision D-4 (by S5.2) |
| 7 | Low | Repo root | Tracked junk: `unretire 21-august-2026.zip` (6.3MB) and stray root-level `page.tsx` (25KB dead legacy page) | Open — S3.2 (authorization D-5) |
| 8 | Medium | Home page vs course page | Copy inconsistency: "Thirty-one lessons" vs "forty-eight lessons" (courseData totals 48) | Open — owner supplies corrected copy; applied in S4.5 (content pass) |
| 9 | Medium | Book page, community page | Placeholder testimonials ("Reader name") + unverified community stats ("340+ Members, 18 Countries") | Open — owner supplies attributions/stats; applied in S4.5 (content pass) |
| 10 | Medium | Repo tooling | No CI, no typecheck/format scripts, lint script is bare `eslint` | Open — S2.1 |
| 11 | Low | `package.json` | Package name is "half-a-life"; unused UI deps; shadcn CLI in runtime deps | Open — S3.2 |
| 12 | Medium | Home page banner | Guest Preview banner expires 31 August 2026 (6 days from 2026-08-25) | ~~Closed 2026-08-25~~ — D-10 resolved: banner expires on its own date as originally intended; no change needed |
| 13 | Medium | Observability | No error tracking (Sentry) or analytics | Open — S2.4 (error tracking); analytics in backlog |
| 14 | Medium | `src/middleware.ts` | Session refresh is fail-open | Open — S4.4 (auth hardening) |
| 15 | Low | `NewsletterForm.tsx` | Unused component with a fake submit | Open — S3.2 |
| 16 | Medium (gates CI) | `src/app/premium/page.tsx:182` | Lint error `@next/next/no-html-link-for-pages`: raw `<a>` navigating to `/learn/course/` must use `<Link>` from `next/link`. Found by running `pnpm lint` during S1; pre-existing, unrelated to S1. Blocks the Code Check gate until fixed | Open — S2.1 |

## 11. Update rules

- [ ] Update this file **in the same branch/PR** as the work it describes — state and code merge atomically.
- [ ] If the sprint branch is already merged, tracker flips ride a tiny dedicated `docs/` branch.
- [ ] When code and this doc disagree, report the mismatch; correct it only within the authorized scope.
- [ ] Strike through, never delete: resolved decisions, closed blockers, and retired scope stay visible with dates.

Next step → open the active sprint in `docs/ROADMAP.md` and run it via `docs/WORKFLOW.md`.
