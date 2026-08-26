# TECH-ARCHITECTURE.md — Locked Stack and Architecture

The authoritative mechanics for (Un)Retire. Fill this file before scaffolding. If another document disagrees about the stack or deployment model, this file wins; if the shipped repository disagrees, report the mismatch and correct documentation only within an authorized task.

## 1. Project summary

| Item | Decision |
|---|---|
| Project / client | (Un)Retire / Maher Kaddoura (author) |
| Production domain | **Decided: `https://unretireproject.com`** — confirmed by the owner 2026-08-25 (**resolves Open decision D-2**, `docs/PROJECT-STATUS.md` §8). ⚠ **Decided is not live.** DNS still points at GoDaddy and both the apex and `www` return a parking page (Known issue 27), so **the live origin today is `https://unretire.vercel.app`** — that is the address the application is actually served from, the address the live Stripe webhook destination points at, and the current `unretire-prod` Supabase **Site URL**. `NEXT_PUBLIC_SITE_URL` remains the authoritative place the value is *configured*; verified 2026-08-25 it **is now set in Vercel Production** to `https://unretire.vercel.app/` (trailing slash to remove — Known issue 35) and is **deliberately unset in Preview** (§6). Both the env var and the Supabase Site URL / redirect allow-list move to `unretireproject.com` only once DNS resolves to Vercel — see `docs/ENVIRONMENT-PARITY.md` §5.3a and Known issues 23 and 27. |
| Primary conversion | Primary: paid enrollment via Stripe Checkout — course purchase ($99 one-time) or Premium subscription ($199/yr). Secondary: email capture to Mailchimp (newsletter, 14-Day Starter Plan, assessment results, gated tools). |
| Access model | PUBLIC_PLUS_GATED (public marketing site + signed-in account area + entitlement-gated course & premium content) |
| Content model | STATIC_FILES (copy lives in TSX/data files in the repo; no CMS) |
| Repository | 86400websites/unretire (github.com/86400websites/unretire) on GitHub — source of truth. Default branch: **master** (rename to `main` is Open decision D-1). |

## 2. Locked stack

Record the actual choice; do not leave examples as instructions.

| Layer | Choice for this project | Version / constraint | Reason |
|---|---|---|---|
| Framework or site generator | Next.js (App Router, `src/` directory) | `16.2.7` (`eslint-config-next` matches at `16.2.7`) | Server-side auth/entitlement checks in Server Components, Route Handlers, and Server Actions; SSG blog and course-module params; deployed on Vercel |
| Language | TypeScript | `^5`, strict | |
| Styling / component system | Tailwind CSS v4 via `@tailwindcss/postcss` + hand-written CSS design system (`src/app/unretire.css`, `.ur-site` scope) | `tailwindcss ^4`, `@tailwindcss/postcss ^4` | `globals.css` carries a legacy dark "Half a Life" palette + shadcn tokens (dead weight, overridden by `unretire.css`) |
| Forms and validation | Server-side validation in Route Handlers / Server Actions (product allow-list in `/api/checkout`, email format + password length in `src/app/auth/actions.ts`, name sanitization + doc-type allow-list in `/api/book-download`, email requirement in `/api/subscribe`). Public static forms (contact, community, enterprise) POST from the browser to Formspree. | | Include trusted-boundary validation |
| Auth | Supabase Auth (email/password + PKCE email confirm; SSR clients in `src/lib/supabase/*`, session refresh in `src/middleware.ts` — fail-open) | `@supabase/ssr ^0.12.0`, `@supabase/supabase-js ^2.110.2` | |
| Database | Supabase Postgres (tables: `entitlements`, `book_downloads` — see §4) | via the same Supabase packages | |
| Payments | Stripe Checkout + signature-verified webhook (`src/lib/stripe/*`, `/api/stripe/webhook`) | `stripe ^22.3.1`; API version pinned in code to `2026-06-24.dahlia` | Course = one-time $99 (`STRIPE_PRICE_COURSE`); Premium = $199/yr subscription (`STRIPE_PRICE_PREMIUM`); promotion codes enabled |
| Hosting | Vercel | | Must support the approved Preview workflow |
| Package manager | pnpm | not yet pinned — `packageManager` field lands in Sprint S2.1; lockfile is pnpm v9 format | Never mix managers |
| Verification commands | Typecheck: `pnpm exec tsc --noEmit` (Sprint S2.1 adds a `pnpm typecheck` script; update docs in that PR); Lint: `pnpm lint`; Tests: N/A — no automated suite yet. This project has auth + payments, so per this file an e2e suite is REQUIRED before launch; it arrives with the Launch Gate module (Sprint S2.3 setup, then /activate-testing); Build: `pnpm build` | | `N/A — reason` for tests is allowed **only for a fully static site**. A project with auth, gated content, a database, or payments must ship an automated suite (≥1 allowed-state and ≥1 denied-state test per protected boundary) — see `QA-CHECKLIST.md`. |

⚠ **On the Tests cell above — independent review verdict, 2026-08-25: `PAYMENT PATH: NOT SAFE`.** Codex reviewed range `0983ad5..` and found the purchase→access path unsafe to run real money through (Known issues 22, 37, 38, 39 plus the Stripe lifecycle/idempotency gaps). The e2e suite **and** those launch-blocking fixes must both land and be verified before the site takes a real payment; "no automated suite yet" is therefore a launch blocker, not a deferrable nicety.

Example profile only: Next.js + TypeScript + Tailwind + pnpm on Vercel, with optional Supabase. Select it deliberately; it is not the universal default.

Also installed: `pdf-lib ^1.17.1` (server-side watermarking of member PDF downloads). Installed but effectively unused in `src`: `framer-motion`, `lucide-react`, `@base-ui/react`, `shadcn` (only `cn()` from `src/lib/utils.ts` is used; no `components/ui` directory) — dependency cleanup is Sprint S3.2.

**Never:** swap a locked layer or add a production dependency without an explicit, recorded decision.

## 3. Routes and shells

Copy every route from the approved sitemap. Name the approved shell so public, member, campaign, and admin layouts do not get conflated.

There is **ONE approved shell**: the public shell — every page is wrapped in `.ur-site` with `UnRetireNav` (sticky header) + `UnRetireFooter` (navy footer), defined in `src/app/layout.tsx`. No separate member/admin shell chrome exists. Route handlers render no shell.

| Route / pattern | Purpose | Access | Approved shell | Content source |
|---|---|---|---|---|
| `/` | Home | Public | Public shell | Page TSX in `src/app` |
| `/about` | Author / about | Public | Public shell | Page TSX |
| `/articles` | Legacy articles page (off-nav; Open decision D-3) | Public | Public shell | Page TSX |
| `/assess` | Wheel of Life assessment (8 questions → radar chart → email gate) | Public | Public shell | Page TSX |
| `/blog` | Blog index | Public | Public shell | `src/app/blog/articlesData.ts` |
| `/blog/[slug]` | 12 SSG blog articles | Public | Public shell | `src/app/blog/articlesData.ts` |
| `/book` | Book page (6 editions, Amazon purchase links) | Public | Public shell | Page TSX |
| `/community` | Community page (Formspree join form) | Public | Public shell | Page TSX |
| `/contact` | Contact (Formspree form) | Public | Public shell | Page TSX |
| `/enterprise` | Enterprise / discovery form (Formspree) | Public | Public shell | Page TSX |
| `/framework` | Legacy framework page (links to nonexistent children; Open decision D-3) | Public | Public shell | Page TSX |
| `/journeys` | Legacy journeys page (links to nonexistent children; Open decision D-3) | Public | Public shell | Page TSX |
| `/learn` | Learn hub | Public | Public shell | Page TSX |
| `/learn/course` | Course sales/overview page | Public | Public shell | `src/app/learn/course/courseData.ts` |
| `/learn/course/[module]` | Course player, `module-1`..`module-10` | **Intended invariant:** page renders publicly; lesson content is ENTITLED (course; premium includes course) and is never sent to an unentitled client. **Current state — NOT met (Known issue 37):** the server computes `unlocked`, but `courseData.ts` (lesson ids, YouTube ids, worksheet paths) is imported into the **client** component `CoursePlayer.tsx` and ships in the bundle to every visitor, and four worksheet PDFs are public static files under `public/assets/unretire/course/`. `unlocked` only disables UI controls. Paid content is not protected today. | Public shell | `courseData.ts` + `CoursePlayer.tsx` |
| `/newsletter` | Newsletter signup (Mailchimp) | Public | Public shell | Page TSX |
| `/podcast` | Podcast (coming soon) | Public | Public shell | Page TSX |
| `/practice` | Practice toolkit page | Public | Public shell | Page TSX |
| `/premium` | Premium sales page | Public | Public shell | Page TSX |
| `/speaking` | Speaking page | Public | Public shell | Page TSX |
| `/start` | 14-Day Starter Plan lead magnet | Public | Public shell | Page TSX |
| `/stories` | Stories page | Public | Public shell | Page TSX |
| `/tools` | Tools page (email-gated tools) | Public | Public shell | Page TSX |
| `/login` | Login | Public | Public shell | Page TSX + `src/app/auth/actions.ts` |
| `/signup` | Signup (`intent=course\|premium\|account`) | Public | Public shell | Page TSX + `src/app/auth/actions.ts` |
| `/forgot-password` | Request password reset | Public | Public shell | Page TSX + `src/app/auth/actions.ts` |
| `/reset-password` | Set new password (requires active recovery session to succeed) | Public page; update requires session | Public shell | Page TSX + `src/app/auth/actions.ts` |
| `/account` | Member account page | SIGNED_IN (server redirect to `/login` otherwise) | Public shell | Page TSX |
| `GET /auth/confirm` | Email callback: PKCE code exchange + OTP verify; `next` redirect. **Intended invariant:** `next` resolves same-origin only. **Current state — NOT met (Known issue 38):** the guard is `nextParam.startsWith("/")`, which also admits protocol-relative and backslash forms — this is an open redirect. | Public (token-bearing) | N/A (route handler) | `src/app/auth/confirm/route.ts` |
| `POST /api/checkout` | Create Stripe Checkout Session | SIGNED_IN (401 otherwise) | N/A | `src/app/api/checkout/route.ts` |
| `POST /api/stripe/webhook` | Stripe event handler; grants/cancels entitlements | Stripe only (signature-verified with `STRIPE_WEBHOOK_SECRET`) | N/A | `src/app/api/stripe/webhook/route.ts` |
| `POST /api/subscribe` | Mailchimp email capture (upsert + tag) | Public | N/A | `src/app/api/subscribe/route.ts` |
| `POST /api/book-download` | Watermarked one-time book/workbook PDF via pdf-lib | ENTITLED (premium; 403 otherwise) | N/A | `src/app/api/book-download/route.ts` |

File location and hidden navigation are not access control. Every protected request checks authentication and authorization at a trusted server or data boundary before returning protected data. Admin access requires a separate server-enforced role check. **That rule stands as the requirement; §3 and §5 now mark where the shipped code does not yet satisfy it.**

**Known deviations (see docs/PROJECT-STATUS.md Known issues).** The intended architecture is recorded above and below; the shipped code currently deviates from it in these places, all scheduled for Sprint S3.1:

- `/api/book-download` is intended to read the master PDFs from `src/app/account/_book/` (where they live, outside `/public`). The code still reads the pre-refactor path `src/app/unretire/account/_book/...`, so premium downloads currently fail (Known issue 1).
- Post-checkout, already-owned, and password-reset destinations are intended to be `/account?checkout=success`, `/learn/course`, and `/reset-password`. The code still uses stale pre-refactor `/unretire/...` paths in `src/lib/stripe/checkout.ts` (`success_url`), `src/app/api/checkout/route.ts` (already-owned redirect), and `src/app/auth/actions.ts` (reset `next` param), which now 404 (Known issue 2).
- Footer links `/privacy` and `/terms` are intended pages but do not exist yet (Known issue 3, Sprint S4.5).
- **Paid course content is not actually gated (Known issue 37, launch blocker).** The entitlement decision is made server-side but the protected material is shipped to the client regardless — see the `/learn/course/[module]` row above. Serving lesson media/worksheets only from an entitlement-checked server boundary is the fix.
- **`GET /auth/confirm` accepts an off-site `next` target (Known issue 38, open redirect, launch blocker).** `startsWith("/")` is not a same-origin test; `//host` and `/\host` both escape the origin. This corrects an earlier statement in this file and in Known issue 23 which claimed the opposite.
- **A failed entitlement write is reported to Stripe as success (Known issue 22, blocker).** See §7 Stripe failure behavior below.

## 4. Data and files — skip if none

| Store / entity | Purpose | Owner | Read rule | Write rule | Retention / deletion |
|---|---|---|---|---|---|
| `entitlements` (Supabase Postgres) | Product access records: `product` (`course` \| `premium`), `status`, Stripe customer/subscription ids, keyed on (`user_id`, `product`). Access logic in `src/lib/auth/entitlements.ts` — "premium includes course". | Owner's Supabase project | Server-side only, under the user's own session + RLS (`getAccess()` selects `product` where `status='active'`; a user can only see their own rows). On query error, `getAccess()` returns no products (fails closed for gated content). | ONLY the Stripe webhook, via the service-role admin client (`src/lib/supabase/admin.ts`, bypasses RLS): upsert `status='active'` on `checkout.session.completed`; set `status='canceled'` on `customer.subscription.deleted`. No user-reachable write path. | Rows persist; cancellation sets `status='canceled'` rather than deleting. No further retention/deletion policy recorded — table schema/policies SQL is not in the repo; owner to confirm (tracked in docs/PROJECT-STATUS.md). |
| `book_downloads` (Supabase Postgres) | One-download-per-user-per-document record for watermarked book/workbook PDFs. Schema: `src/app/account/_book/book_downloads.sql`. | Owner's Supabase project | RLS policy "own downloads readable": `select` only where `auth.uid() = user_id`. Route reads under the user's own session. | RLS policy "own downloads insertable": `insert` only `with check (auth.uid() = user_id)`. Unique constraint on (`user_id`, `doc_type`) is what actually enforces "once" — a duplicate insert (code `23505`) is refused by the route as "already downloaded". RLS is default-deny otherwise. | Rows cascade-delete when the `auth.users` row is deleted (`on delete cascade`); otherwise persist. |
| Master PDFs (`unretire-book-master.pdf`, `unretire-workbook-master.pdf` in `src/app/account/_book/`) | Un-watermarked source documents for premium downloads | Repo (git-tracked) | Intended: read ONLY by the `/api/book-download` server route (stored outside `/public` so they can never be fetched clean by URL), watermarked per-user before delivery, `Cache-Control: no-store`. See Known deviations in §3 for the current stale read path. | Never written at runtime | Being git-tracked, the clean masters are exposed to anyone with repo access — moving them out of git is Open decision D-4. |

- [ ] Default deny is enforced at the strongest supported boundary. — *Partially verified: `book_downloads` verified (RLS enabled, own-row-only policies in `book_downloads.sql`). `entitlements` schema/policies SQL is not in the repo; the code depends on RLS (reads under user session, writes via service role only) but the policies themselves cannot be verified from the repo — owner to confirm/export (docs/PROJECT-STATUS.md).*
- [ ] If the chosen platform supports row-level policies (for example Supabase RLS), every user-reachable table has minimum-grant policies before data lands. — *Same status as above: verified for `book_downloads`, unverified in-repo for `entitlements`.*
- [ ] If it does not, the database is not browser-reachable and every server operation authorizes the caller. — *N/A: Supabase supports RLS; the previous item applies.*
- [x] Public projections contain only explicitly public fields. — *No public projection of either table exists; all reads are per-user under the user's own session.*
- [x] Private files require authorized, short-lived delivery or an equivalent protected mechanism. — *Masters live outside `/public`; delivery is via the premium-gated server route only, watermarked with the member's name, one-time, `no-store`. Deviations: current read path is broken (§3) and the masters are git-tracked (D-4).*
- [x] Local, Preview, and Production do not share writable production data. — *~~__Verified FALSE, 2026-08-25.__ They do share it. A non-production project exists (`unretire-test`, ref `dtdadtggahjsrmevwvbu` — D-8 resolved) but no deployment points at it: the three Supabase variables are single Vercel entries scoped to Production **and** Preview, so every Preview deployment reads and writes `unretire-prod`. Known issue 17 (CRITICAL); remediation is Sprint S2.2, governed by `docs/ENVIRONMENT-PARITY.md` §3 Gap 1 and §4 Phase A.~~* **RESOLVED 2026-08-25 (supersedes the struck text above).** The owner split the variables in the Vercel dashboard: Preview now carries its own three Supabase entries pointing at `unretire-test` (ref `dtdadtggahjsrmevwvbu`, `ap-south-1`) while Production keeps `unretire-prod` (ref `hcjivvlwxltyiycfbttc`, `eu-west-1`). Known issue 17 is closed. Preview also now carries the four **sandbox** Stripe variables, so the §6 ordering trap was cleared in the correct order (Supabase split first). Remaining caveat: `entitlements` DDL is still uncommitted (Known issue 21), so `unretire-test` cannot yet be proven schema-identical to production.*
- [ ] Migrations are classified as additive, reversible, or destructive. Destructive work has an approved backup/PITR and restore plan; down migrations do not recreate lost data. — *No migration tooling exists; `book_downloads.sql` (additive) is run manually in the Supabase SQL editor per its header. No backup/PITR plan recorded — owner to confirm.*

## 5. Authentication and authorization — skip if none

Auth is Supabase Auth (email/password + PKCE email confirm). SSR clients live in `src/lib/supabase/` (browser client, server client, middleware refresh, admin client). Entitlement states: `ENTITLED(course)` and `ENTITLED(premium)`, where premium includes the course (`ownsProduct()` in `src/lib/auth/entitlements.ts`).

| Role / state | May access | Must not access | Enforcement point |
|---|---|---|---|
| Anonymous | All public pages in §3; `POST /api/subscribe`; Formspree form posts; `GET /auth/confirm` (with valid token); locked course-player view | `/account`; `POST /api/checkout`; `POST /api/book-download`; course lesson content; any `entitlements`/`book_downloads` rows | Server-side `supabase.auth.getUser()`: `/account` redirects to `/login` (`src/app/account/page.tsx`); `/api/checkout` returns 401; `/api/book-download` returns 403 via `getAccess()`; Supabase RLS on tables. ⚠ **The "course lesson content" cell is an intended invariant that is NOT met today (Known issue 37):** `hasAccess("course")` does compute `unlocked` server-side in `src/app/learn/course/[module]/page.tsx`, but the lesson data reaches the client anyway (client-imported `courseData.ts` + public worksheet PDFs), so an anonymous visitor can read it without any gate being consulted. |
| SIGNED_IN (no entitlement) | `/account`; `POST /api/checkout` (start a purchase); own rows of `entitlements`/`book_downloads` (empty) | Course lesson content; `POST /api/book-download`; other users' data | `hasAccess()`/`getAccess()` server-side against `entitlements` under the user's session + RLS |
| ENTITLED (course) | Everything SIGNED_IN can, plus unlocked course modules (`/learn/course/module-1..10`) | `POST /api/book-download` (premium only); other users' data | `hasAccess("course")` server-side; `ownsProduct("premium", ...)` check returns false in `/api/book-download` → 403 |
| ENTITLED (premium) | Everything ENTITLED (course) can (premium includes course), plus `POST /api/book-download` (one per document) | Other users' data; repeat downloads of the same document | `ownsProduct("premium", products)` server-side in `/api/book-download`; `book_downloads` unique constraint + RLS |
| Stripe (machine) | `POST /api/stripe/webhook` | Everything else | Webhook signature verification against `STRIPE_WEBHOOK_SECRET` (400 on missing/invalid signature). This is the ONLY path that writes `entitlements`, via the service-role admin client. |

These four are **intended invariants**. Each carries its current state; where a line says NOT met, the rule still stands — it is the code that has to change, not the rule.

- Sessions and authorization are rechecked at the trusted boundary for every protected request. — *Current state: met for `/account`, `/api/checkout`, `/api/book-download` and the database (RLS). **NOT met for course lesson content** (Known issue 37).*
- Client state is presentation, never proof of entitlement. — ⚠ **Current state — NOT met (Known issue 37).** The course player inverts this: the entitlement decision is server-computed but the protected payload is already in the client bundle, so client state is the only thing standing between a visitor and the paid material.
- Redirect targets are same-origin or allow-listed. — ⚠ **Current state — NOT met (Known issue 38, open redirect).** `src/app/auth/confirm/route.ts:19-21` tests `nextParam.startsWith("/")`, which is a *prefix* test, not an origin test. Reproduced 2026-08-25: `new URL("//evil.example", request.url)` resolves to `https://evil.example/`, and `/\evil.example` escapes the same way. A crafted confirmation link therefore lands the user on a third-party host straight out of an authenticated callback. The fix is to resolve `next` against the request origin and reject anything whose resolved origin differs (and to reject `\` outright).
- Auth links generated from a Preview return to that Preview, never silently to Production. — *Current state: the **configuration** half is now correct (verified 2026-08-25: `unretire-prod` Site URL is `https://unretire.vercel.app` with an allow-list covering `localhost:3000/**`, `www.unretireproject.com/**`, `unretireproject.com/**`, `unretire.vercel.app/**` and `*-86400-s-projects.vercel.app/**`, so Preview hosts under the project scope are honoured — Known issue 23's config half RESOLVED, Known issue 28 RESOLVED). Remaining hygiene: `localhost:3000/**` and the Preview wildcard are broad entries that should be re-reviewed before launch.*

Factual notes (verified in code): `GET /auth/confirm` follows a `next` param that starts with `/`, defaulting to `/account`. ⚠ **That check does not make the redirect same-origin, and this document previously claimed it did — that claim was wrong and is withdrawn.** `startsWith("/")` also admits protocol-relative (`//host`) and backslash (`/\host`) targets, both of which resolve off-origin; `src/app/auth/confirm/route.ts:19-21` **is** an open redirect (Known issue 38, launch blocker). Any other document still saying otherwise — including the original wording of Known issue 23 — is superseded by this paragraph. Server actions derive the origin from the real request headers (`x-forwarded-host`/`host`) before falling back to `NEXT_PUBLIC_SITE_URL`, so Preview auth/Stripe links *request* the Preview origin; those headers are currently trusted without an approved-host allow-list, which is its own open item. ⚠ **Requesting is not the same as receiving:** Supabase honours an auth redirect target only when it matches that project's redirect allow-list, and otherwise silently substitutes the project Site URL — which is why the allow-list above matters. `src/middleware.ts` session refresh is deliberately **fail-open** (missing env or auth error passes the request through untouched) — it is a session-freshness mechanism, NOT an enforcement point; every gate above is enforced in the page/route itself. The fail-open choice is scheduled for review in Sprint S2.3's security pass.

## 6. Environment variables — names only

Public naming differs by framework. Record `NEXT_PUBLIC_`; anything bearing that prefix is world-readable.

**Reading the Environments column.** It was audited against the live Vercel dashboard on **2026-08-25**, found
drifted, and then **re-audited the same day after the owner reconfigured the dashboards** — the rows below
state the post-reconfiguration reality. Each row gives **current state** (what Vercel actually holds today)
and **intended** (the target wiring). The intended state is governed by `docs/ENVIRONMENT-PARITY.md`
§2A/§2B. Where the two still differ the row carries its Known-issue number from `docs/PROJECT-STATUS.md`
§10; where they now agree the row says so and names the superseded issue as RESOLVED. **"Shared"** means one
Vercel entry whose scope covers both Production and Preview — i.e. Preview receives the *production* value.

**Dashboard summary, verified 2026-08-25 (names only, no values):** Vercel **Preview** holds 3 Supabase
(`unretire-test`) + 4 Stripe (**sandbox**) + `VERCEL_AUTOMATION_BYPASS_SECRET` + 2 Mailchimp. Vercel
**Production** holds all 10 application variables in **live** mode, with the three `NEXT_PUBLIC_*` typed
**Config** and everything else typed **Secret**. `NEXT_PUBLIC_SITE_URL` is set in Production only.
`NEXT_PUBLIC_FORMSPREE_ENDPOINT` remains unset everywhere (harmless — working hardcoded fallback).

⚠ **Ordering trap, kept on the record because it is the one that moves money:** never add
`STRIPE_WEBHOOK_SECRET` to Preview before the three Supabase variables are split, because that switches on a
code path that writes **real entitlements into the production database** from test-mode payments. *Status
2026-08-25: cleared in the correct order — Supabase was split first, then the sandbox Stripe variables were
added. The rule stays here for any future environment.*

| Name | Public / server-only | Feature | Environments — current state vs intended | Owner |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical URL (`metadataBase`, origin fallback for auth/Stripe return URLs) | **Current: SET in Production only, typed Config** — value `https://unretire.vercel.app/`, i.e. the live origin while the custom domain is parked (Known issue 27). ~~NOT SET in any Vercel environment — Known issue 19~~ → **Known issue 19 RESOLVED 2026-08-25**; the one residual is the **trailing slash** (Known issue 35, evidenced by the owner's dashboard screenshot), harmless for `metadataBase` but capable of producing `…app//auth/confirm` on the header-missing fallback path. Preview is **intentionally unset** (see Intended). **Intended:** Production = the live origin — `https://unretire.vercel.app` today, `https://unretireproject.com` once DNS resolves (§1, D-2 resolved, blocked by Known issue 27); Preview **deliberately unset** — every PR gets a unique Preview host, so one fixed value would be wrong for most deployments, and checkout/auth already derive the origin from request headers; Local = `http://localhost:3000` | Owner |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL (auth + database) | **Current: SPLIT — Production = `unretire-prod` (ref `hcjivvlwxltyiycfbttc`, eu-west-1), Preview = `unretire-test` (ref `dtdadtggahjsrmevwvbu`, ap-south-1). Typed Config.** ~~one shared Vercel entry scoped Production + Preview, so Preview reads and writes `unretire-prod` — Known issue 17 (CRITICAL); typed Secret — Known issue 24~~ → **Known issues 17 and 24 both RESOLVED 2026-08-25** (owner split the entries and retyped the public vars from Secret to Config). **Intended:** matches current state | Owner |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Supabase browser-safe key (always RLS-bound) | **Current: SPLIT Production `unretire-prod` / Preview `unretire-test`, typed Config.** ~~one shared entry — Known issue 17; typed Secret — Known issue 24~~ → **both RESOLVED 2026-08-25.** **Intended (still binding):** paired with the row above and always drawn from the *same* project — a URL from one project with a key from the other yields "invalid API key" across the whole site | Owner |
| `SUPABASE_SECRET_KEY` | Server-only | Service-role admin client — imported ONLY by the Stripe webhook; bypasses RLS | **Current: SPLIT — Production = `unretire-prod` secret, Preview = `unretire-test` secret. Type Secret.** ~~one shared Vercel entry scoped Production + Preview — Known issue 17~~ → **RESOLVED 2026-08-25.** The standing warning still applies to any future change: this key ignores every RLS policy, so a Preview holding a production secret could grant or revoke **production** access. **Intended:** matches current state; stays Vercel type **Secret** | Owner |
| `STRIPE_SECRET_KEY` | Server-only | Stripe API client (checkout sessions, webhook event construction) | **Current: SET in BOTH — Production = live-mode, Preview = sandbox/test-mode. Type Secret.** ~~Production ONLY — absent from Preview (Known issue 18), so Preview checkout compiles and then fails at runtime with "Could not start checkout"~~ → **Known issue 18 RESOLVED 2026-08-25** (all four Stripe variables now present in Preview with sandbox values). **Intended:** matches current state | Owner |
| `STRIPE_WEBHOOK_SECRET` | Server-only | Webhook signature verification | **Current: SET in BOTH — Production = the live destination `brilliant-splendor` (→ `https://unretire.vercel.app/api/stripe/webhook`, API `2026-07-29.dahlia`); Preview = the Sandbox destination `captivating-triumph` (→ `https://unretire-git-staging-86400-s-projects.vercel.app/api/stripe/webhook`, API `2026-06-24.dahlia`). Type Secret.** ~~Production ONLY — absent from Preview (Known issue 18)~~ → **RESOLVED 2026-08-25.** Production's secret is externally confirmed present: an unsigned POST to the live route returns 400 `Missing signature` and a bogus-signature POST returns 400 `Invalid signature`. ⚠ Two open caveats, neither an env-var problem: the `staging` branch sits at the same commit as `master` so Vercel has never built it and the Sandbox destination's URL currently **404s** (Known issue 32); and the two destinations run different API versions (Known issue 31, Low). **Intended:** matches current state. The ordering rule above still governs any future environment | Owner |
| `STRIPE_PRICE_COURSE` | Server-only | Course price id ($99 one-time); env-based so test → live swaps without code changes | **Current: SET in BOTH — Production = live-mode price id, Preview = sandbox price id.** ~~Production ONLY — absent from Preview (Known issue 18)~~ → **RESOLVED 2026-08-25.** **Intended:** matches current state. Both must be **one-time** prices: `src/lib/stripe/checkout.ts` opens `mode: "payment"` for this product | Owner |
| `STRIPE_PRICE_PREMIUM` | Server-only | Premium price id ($199/yr subscription) | **Current: SET in BOTH — Production = live-mode price id, Preview = sandbox price id.** ~~Production ONLY — absent from Preview (Known issue 18)~~ → **RESOLVED 2026-08-25.** **Intended:** matches current state. Both must be **recurring** prices: `src/lib/stripe/checkout.ts` opens `mode: "subscription"` for this product. ⚠ **The billing interval is a property of the Stripe Price object, not of the code** — the code passes only the id, so whether Premium bills yearly or monthly is decided in the Stripe dashboard and must be verified there as **recurring, interval = year, $199 USD** | Owner |
| `MAILCHIMP_API_KEY` | Server-only | Mailchimp Marketing API (`/api/subscribe`); its `-usNN` suffix also selects the datacenter | **Current: one shared Vercel entry scoped Production + Preview.** **Intended:** sharing is acceptable **only** while the row below is split — the key selects the account, the audience id selects who is actually emailed. Stays type **Secret** | Owner |
| `MAILCHIMP_LIST_ID` | Server-only | Mailchimp audience id | **Current: one shared Vercel entry scoped Production + Preview**, so every Preview form submission writes a **real subscriber** into the live audience and fires the real automated sequence. **Intended:** Production = the live audience id; Preview and Local = a test audience id, with merge fields and tags mirrored per `docs/ENVIRONMENT-PARITY.md` §5.4 | Owner |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Public | Enterprise discovery form endpoint (code falls back to a hardcoded Formspree endpoint when unset) | **Current: still NOT SET in any Vercel environment** — Known issue 20 remains open and remains **Low**. Zero functional impact: only the enterprise form reads it, and the hardcoded fallback is a working endpoint that passes its own format check. **Intended:** Production = the real endpoint; Preview and Local = a throwaway form. *Ceiling:* the contact and community forms hardcode the same endpoint with no env indirection, so their Preview submissions cannot be isolated without a code change (`docs/ENVIRONMENT-PARITY.md` §6 C9) | Owner |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Server-only (test tooling) | Bypasses Vercel Deployment Protection so Playwright / external reviewers can reach a Preview | **Current: SET in Preview** (added 2026-08-25). Deployment Protection itself **remains on** — the secret is the sanctioned way through it, not a removal of it. Known issue 25 is therefore no longer "blocks all automated testing"; the remaining unknown is whether the Playwright config actually sends the bypass header/cookie, which is verified in Sprint S2.3. **Intended:** Preview only; never Production | Owner |

Bot-protection secret: N/A — none wired yet (required before launch, Sprint S4.5).

- Commit only `.env.example` with safe placeholders. Never commit `.env.local` or another live-value file.
- Never read, print, paste, or pass a server-only value into browser code.
- Changing a deployed value requires a fresh deployment when the platform or framework inlines it.
- Provider-specific names belong in the optional profile `SUPABASE-VERCEL-SETUP.md` only when that profile is selected.

The local live-env file for this project is `.env.local` (gitignored via the `.env*` rule).

## 7. Integrations

| Integration | Required for core journey? | Failure behavior | Env names | Data sent |
|---|---|---|---|---|
| Supabase (Auth + Postgres) | YES | Gated surfaces fail closed with honest denials (redirect to `/login`, 401, 403); `getAccess()` treats a query error as "no products". Middleware session refresh is fail-open by design (site stays up; that request's session is not refreshed) — refresh failure is not an access grant. | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Email, password (to Supabase Auth), user id, entitlement product/status, Stripe customer/subscription ids, book-download records |
| Stripe (Checkout + webhook) | YES | **Intended invariant:** honest error, fails closed — `/api/checkout` returns 500 "Could not start checkout"; post-auth checkout falls back to the product page with `?checkout=error` (logged-in one-click retry); `getStripe()` throws when `STRIPE_SECRET_KEY` is unset; the webhook rejects missing/invalid signatures with 400 **and returns 5xx on handler errors so Stripe retries**. **Current state — the last clause is NOT met (Known issue 22, blocker).** The signature checks and the checkout-side behavior do hold (probed live 2026-08-25: 400 `Missing signature` / 400 `Invalid signature`). But the entitlement `upsert` and the cancellation `update` never inspect the returned `.error`, and `supabase-js` v2 returns `{data, error}` without throwing (no `.throwOnError()` anywhere in `src/`), so a failed write cannot reach the `try/catch`: the route returns **HTTP 200**, Stripe records "Delivered", **no retry ever happens**, and the customer has paid for nothing. Also not met: no lifecycle handling for `invoice.payment_failed` / `invoice.paid` / `past_due` / `unpaid`, so a failed Premium renewal leaves `status='active'` and access continues unpaid; and no Stripe idempotency key on session creation, so retries or multiple tabs can create duplicate sessions and duplicate charges. | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_COURSE`, `STRIPE_PRICE_PREMIUM` | Email (`customer_email`), Supabase user id (`client_reference_id` + metadata), product name |
| Mailchimp (Marketing API) | YES (email capture is the secondary conversion) | Honest error, fails closed: `/api/subscribe` returns 400/500 JSON errors when config is missing or the upsert fails — it never reports success while losing the contact. Tagging failure after a successful upsert is logged but does not fail the request (the contact is already saved). `status_if_new: "subscribed"` avoids resurrecting unsubscribes. | `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID` | Email, first name, tags, merge fields (assessment WEAKEST / WEAKLOW / SCORE) |
| Formspree (static forms: contact, community, enterprise) | NO | Browser POSTs directly to Formspree; if Formspree is down the submission fails in the browser. Submissions persist in the Formspree dashboard in addition to email delivery. | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (enterprise form; contact/community endpoints are hardcoded in their components) | Name, email, message / form fields |
| YouTube (course lesson videos) | NO (course video delivery, not the purchase journey) | Embeds fail to load; lessons show unavailable players. No code path breaks. | none | Standard embed traffic from the viewer's browser |
| Amazon (book purchase links) | NO | Outbound links only; a dead link fails on Amazon's side. | none | None (navigation only) |
| pdf-lib (in-process library, no external service) | YES for the premium book-download journey | `/api/book-download` returns honest 500 ("not available right now") when the master cannot be loaded; nothing is delivered un-watermarked. | none | None — watermarking runs entirely on the server |

Optional integrations may be disabled in local or Preview when documented. In Production, a required delivery, payment, or abuse-prevention dependency fails closed with an honest error; it never reports success while losing work.

**Conversion durability (required).** A required conversion (e.g. the primary form) has **at least two independent capture paths** — never a single mailbox. If it emails a lead, it also persists the submission to a second sink (the form/email provider's dashboard, a second recipient, a data store, or a webhook) so one delivery failure never loses a lead.

*Intended invariant:* the primary conversion (payment) is durable — Stripe's own dashboard/records plus the webhook-written `entitlements` table are two independent sinks, and a failure in either is visible and recoverable.

⚠ *Current state — **NOT met** for the primary conversion (Known issues 22 and 45; independent review verdict 2026-08-25: `PAYMENT PATH: NOT SAFE`).* The two sinks are not independent in the way that matters. Stripe records the payment, but the only thing that turns a payment into *access* is the `entitlements` write — and that write's failure is swallowed and answered with HTTP 200 (Known issue 22), so Stripe never retries and no alert fires. The failure is then actively concealed from the customer: `src/app/account/page.tsx` renders its "Payment successful" banner purely from the `?checkout=success` query string rather than from an entitlement row, so the reassuring message appears **whether or not anything was granted** (Known issue 45). Net effect: money taken, no access, no retry, no alert, and a success screen. Two independent capture paths exist on paper only until the webhook surfaces write failures as 5xx and the account page reads real entitlement state. Fixes are scheduled in the improvement/fixing stage before `/activate-testing`; **no real payment should be taken until both land and are verified end-to-end.**

*Current state — the secondary paths are met:* email capture persists in the Mailchimp audience (provider dashboard) with honest failure to the user otherwise. Formspree submissions persist in the Formspree dashboard plus email delivery.

**Deliverability (required for email-based conversions).** The sending domain has **SPF, DKIM, and DMARC** configured, and before launch a submission from an *external* address is verified to land in the inbox — not spam. (Records are added at launch; see `LAUNCH-CHECKLIST.md`.)

*Current state:* not yet configured/verified — scheduled for Sprint S4.5 (launch blocker).

## 8. Content operations — complete for content/CMS sites

| Item | Decision |
|---|---|
| Canonical content source | Static files in the repo (STATIC_FILES; no CMS): page copy in TSX files under `src/app/`, blog articles in `src/app/blog/articlesData.ts`, course data in `src/app/learn/course/courseData.ts`. Approved-copy baseline: `docs/content/page-copy/*.md` + `docs/content/locked-facts.md` (frozen in Sprint S1.1). |
| Content types | Marketing pages; blog articles (12, SSG); course modules/lessons (10 modules, 48 lessons — YouTube embeds + PDF worksheets); lead magnets (14-Day Starter Plan, Practice Toolkit, Wheel of Life assessment); member documents (watermarked book/workbook PDFs); legal pages (`/privacy`, `/terms` — do not exist yet, Sprint S4.5) |
| Draft → review → publish workflow | Edit in repo on a branch → PR → Vercel Preview → independent review → owner merges to `master` → Production deploy. No CMS; no runtime editing. |
| Editor roles | Owner (Maher Kaddoura) approves copy and facts; Claude Code implements; Codex reviews independently. |
| Media ownership and optimization | Static assets ship from the repo (`/public`); course videos are hosted on YouTube; master PDFs live outside `/public` (see §4). No formal image-optimization pipeline is recorded — owner to confirm if one is needed. |
| Redirect/migration plan | The site refactor promoted `/unretire/*` routes to root; stale internal references to old paths are Known issue 2 (Sprint S3.1). No public old→new redirect map is recorded — TBC: owner to confirm whether any pre-refactor `/unretire/*` URLs were shared externally and need redirects. |
| Backup/export and restore test | Content: git history is the backup (all content is in-repo). Database: no backup/PITR plan recorded — owner to confirm Supabase backup settings (see §4). |
| Client training and handoff | TBC — owner to schedule. |

Approved launch copy is the baseline. Later editorial changes follow this workflow rather than silently editing frozen source files.

## 9. Security and deployment

- Security headers and transport controls are defined for the selected framework/host and verified on the deployed response.
- `master` is protected; Production deploys only from `master`. *(This repo's default branch is `master`, not `main` — protection is enabled by the owner via the GitHub web UI (gh CLI not installed), scheduled Sprint S2.1; renaming `master`→`main` is Open decision D-1.)*
- Every PR gets an isolated deployed Preview. The supplied profile is Vercel; record an approved equivalent here when different. *(This project: Vercel Preview deployment, per-PR. **Isolation is now real** — since 2026-08-25 Preview runs on `unretire-test` and sandbox Stripe, not production (§6). **Reachability:** Vercel Deployment Protection is still enabled, so a Preview URL is not open to the world; a `VERCEL_AUTOMATION_BYPASS_SECRET` is provisioned in Preview as the sanctioned way through it. Whether the Playwright config actually presents that secret is unverified until Sprint S2.3 — Known issue 25, reworded from "blocks all automated testing", which is no longer accurate.)*
- Preview test record: `docs/templates/VERCEL-PREVIEW-TEST-TEMPLATE.md` or its approved equivalent.
- Rollback action: Vercel dashboard → Project → Deployments → previous good Production deployment → "Instant Rollback" (promote previous deployment). Does not restore database data. A host rollback restores application artifacts, not database state.
- Relaunch only: the old→new **301/410 redirect map** is implemented and verified on the live domain at launch; the highest-traffic old URLs never resolve to a bare 404. ⚠ **owner input required — no predevelopment pack exists for this project (development-stage retrofit), and no redirect map is recorded anywhere in the repo.** The only candidate source is the promote-to-root refactor (`/unretire/*` → root; see §8 Redirect/migration plan): owner confirms whether any pre-refactor `/unretire/*` URL was ever shared externally. If yes, the map is built from that list and implemented before launch; if no, this item is closed as N/A with the owner's answer recorded in `docs/PROJECT-STATUS.md`. Do not treat it as done until one of those two answers exists.

Abuse controls: none are wired yet on public write endpoints (`/api/subscribe` et al.) — a launch-blocking gap per `docs/SECURITY-CHECKLIST.md` §5, scheduled Sprint S4.5 (stack choice is Open decision D-9).

## 10. Companion documents

- Order: `ROADMAP.md`
- Current state: `PROJECT-STATUS.md`
- Delivery: `WORKFLOW.md`
- Visual rules: `DESIGN.md`
- Security gate: `SECURITY-CHECKLIST.md`
- Provider profile: `SUPABASE-VERCEL-SETUP.md` when selected

Any authorized architecture change updates this file in the same PR.

**Next:** fill `DESIGN.md`, then complete the Setup Gate.
