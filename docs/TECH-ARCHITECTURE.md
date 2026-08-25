# TECH-ARCHITECTURE.md — Locked Stack and Architecture

The authoritative mechanics for (Un)Retire. Fill this file before scaffolding. If another document disagrees about the stack or deployment model, this file wins; if the shipped repository disagrees, report the mismatch and correct documentation only within an authorized task.

## 1. Project summary

| Item | Decision |
|---|---|
| Project / client | (Un)Retire / Maher Kaddoura (author) |
| Production domain | TBC (Open decision D-2) — env `NEXT_PUBLIC_SITE_URL` is authoritative |
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
| `/learn/course/[module]` | Course player, `module-1`..`module-10` | Page renders publicly; lesson content ENTITLED (course; premium includes course) via server-computed `unlocked` flag | Public shell | `courseData.ts` + `CoursePlayer.tsx` |
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
| `GET /auth/confirm` | Email callback: PKCE code exchange + OTP verify; same-origin-only `next` redirect | Public (token-bearing) | N/A (route handler) | `src/app/auth/confirm/route.ts` |
| `POST /api/checkout` | Create Stripe Checkout Session | SIGNED_IN (401 otherwise) | N/A | `src/app/api/checkout/route.ts` |
| `POST /api/stripe/webhook` | Stripe event handler; grants/cancels entitlements | Stripe only (signature-verified with `STRIPE_WEBHOOK_SECRET`) | N/A | `src/app/api/stripe/webhook/route.ts` |
| `POST /api/subscribe` | Mailchimp email capture (upsert + tag) | Public | N/A | `src/app/api/subscribe/route.ts` |
| `POST /api/book-download` | Watermarked one-time book/workbook PDF via pdf-lib | ENTITLED (premium; 403 otherwise) | N/A | `src/app/api/book-download/route.ts` |

File location and hidden navigation are not access control. Every protected request checks authentication and authorization at a trusted server or data boundary before returning protected data. Admin access requires a separate server-enforced role check.

**Known deviations (see docs/PROJECT-STATUS.md Known issues).** The intended architecture is recorded above and below; the shipped code currently deviates from it in these places, all scheduled for Sprint S3.1:

- `/api/book-download` is intended to read the master PDFs from `src/app/account/_book/` (where they live, outside `/public`). The code still reads the pre-refactor path `src/app/unretire/account/_book/...`, so premium downloads currently fail (Known issue 1).
- Post-checkout, already-owned, and password-reset destinations are intended to be `/account?checkout=success`, `/learn/course`, and `/reset-password`. The code still uses stale pre-refactor `/unretire/...` paths in `src/lib/stripe/checkout.ts` (`success_url`), `src/app/api/checkout/route.ts` (already-owned redirect), and `src/app/auth/actions.ts` (reset `next` param), which now 404 (Known issue 2).
- Footer links `/privacy` and `/terms` are intended pages but do not exist yet (Known issue 3, Sprint S4.5).

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
- [ ] Local, Preview, and Production do not share writable production data. — *Unverified: whether a non-production Supabase project exists is Open decision D-8.*
- [ ] Migrations are classified as additive, reversible, or destructive. Destructive work has an approved backup/PITR and restore plan; down migrations do not recreate lost data. — *No migration tooling exists; `book_downloads.sql` (additive) is run manually in the Supabase SQL editor per its header. No backup/PITR plan recorded — owner to confirm.*

## 5. Authentication and authorization — skip if none

Auth is Supabase Auth (email/password + PKCE email confirm). SSR clients live in `src/lib/supabase/` (browser client, server client, middleware refresh, admin client). Entitlement states: `ENTITLED(course)` and `ENTITLED(premium)`, where premium includes the course (`ownsProduct()` in `src/lib/auth/entitlements.ts`).

| Role / state | May access | Must not access | Enforcement point |
|---|---|---|---|
| Anonymous | All public pages in §3; `POST /api/subscribe`; Formspree form posts; `GET /auth/confirm` (with valid token); locked course-player view | `/account`; `POST /api/checkout`; `POST /api/book-download`; course lesson content; any `entitlements`/`book_downloads` rows | Server-side `supabase.auth.getUser()`: `/account` redirects to `/login` (`src/app/account/page.tsx`); `/api/checkout` returns 401; `/api/book-download` returns 403 via `getAccess()`; course `unlocked` flag computed server-side by `hasAccess("course")` in `src/app/learn/course/[module]/page.tsx`; Supabase RLS on tables |
| SIGNED_IN (no entitlement) | `/account`; `POST /api/checkout` (start a purchase); own rows of `entitlements`/`book_downloads` (empty) | Course lesson content; `POST /api/book-download`; other users' data | `hasAccess()`/`getAccess()` server-side against `entitlements` under the user's session + RLS |
| ENTITLED (course) | Everything SIGNED_IN can, plus unlocked course modules (`/learn/course/module-1..10`) | `POST /api/book-download` (premium only); other users' data | `hasAccess("course")` server-side; `ownsProduct("premium", ...)` check returns false in `/api/book-download` → 403 |
| ENTITLED (premium) | Everything ENTITLED (course) can (premium includes course), plus `POST /api/book-download` (one per document) | Other users' data; repeat downloads of the same document | `ownsProduct("premium", products)` server-side in `/api/book-download`; `book_downloads` unique constraint + RLS |
| Stripe (machine) | `POST /api/stripe/webhook` | Everything else | Webhook signature verification against `STRIPE_WEBHOOK_SECRET` (400 on missing/invalid signature). This is the ONLY path that writes `entitlements`, via the service-role admin client. |

- Sessions and authorization are rechecked at the trusted boundary for every protected request.
- Client state is presentation, never proof of entitlement.
- Redirect targets are same-origin or allow-listed.
- Auth links generated from a Preview return to that Preview, never silently to Production.

Factual notes (verified in code): `GET /auth/confirm` only follows a `next` param that starts with `/` (same-origin relative), defaulting to `/account`. Server actions derive the origin from the real request headers (`x-forwarded-host`/`host`) before falling back to `NEXT_PUBLIC_SITE_URL`, so Preview auth/Stripe links return to the Preview. `src/middleware.ts` session refresh is deliberately **fail-open** (missing env or auth error passes the request through untouched) — it is a session-freshness mechanism, NOT an enforcement point; every gate above is enforced in the page/route itself. The fail-open choice is scheduled for review in Sprint S2.3's security pass.

## 6. Environment variables — names only

Public naming differs by framework. Record `NEXT_PUBLIC_`; anything bearing that prefix is world-readable.

| Name | Public / server-only | Feature | Environments | Owner |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical URL (`metadataBase`, origin fallback for auth/Stripe return URLs) | Local / Preview / Production | Owner |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL (auth + database) | Local / Preview / Production | Owner |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Supabase browser-safe key (always RLS-bound) | Local / Preview / Production | Owner |
| `SUPABASE_SECRET_KEY` | Server-only | Service-role admin client — imported ONLY by the Stripe webhook; bypasses RLS | Production (and any environment that receives Stripe webhooks) | Owner |
| `STRIPE_SECRET_KEY` | Server-only | Stripe API client (checkout sessions, webhook event construction) | Local / Preview / Production (test vs live keys per environment) | Owner |
| `STRIPE_WEBHOOK_SECRET` | Server-only | Webhook signature verification | Production (and any environment that receives Stripe webhooks) | Owner |
| `STRIPE_PRICE_COURSE` | Server-only | Course price id ($99 one-time); env-based so test → live swaps without code changes | Local / Preview / Production | Owner |
| `STRIPE_PRICE_PREMIUM` | Server-only | Premium price id ($199/yr subscription) | Local / Preview / Production | Owner |
| `MAILCHIMP_API_KEY` | Server-only | Mailchimp Marketing API (`/api/subscribe`) | Local / Preview / Production | Owner |
| `MAILCHIMP_LIST_ID` | Server-only | Mailchimp audience id | Local / Preview / Production | Owner |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Public | Enterprise discovery form endpoint (code falls back to a hardcoded Formspree endpoint when unset) | Local / Preview / Production | Owner |

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
| Stripe (Checkout + webhook) | YES | Honest error, fails closed: `/api/checkout` returns 500 "Could not start checkout"; post-auth checkout falls back to the product page with `?checkout=error` (logged-in one-click retry); `getStripe()` throws when `STRIPE_SECRET_KEY` is unset; webhook rejects missing/invalid signatures with 400 and returns 500 on handler errors so Stripe retries. | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_COURSE`, `STRIPE_PRICE_PREMIUM` | Email (`customer_email`), Supabase user id (`client_reference_id` + metadata), product name |
| Mailchimp (Marketing API) | YES (email capture is the secondary conversion) | Honest error, fails closed: `/api/subscribe` returns 400/500 JSON errors when config is missing or the upsert fails — it never reports success while losing the contact. Tagging failure after a successful upsert is logged but does not fail the request (the contact is already saved). `status_if_new: "subscribed"` avoids resurrecting unsubscribes. | `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID` | Email, first name, tags, merge fields (assessment WEAKEST / WEAKLOW / SCORE) |
| Formspree (static forms: contact, community, enterprise) | NO | Browser POSTs directly to Formspree; if Formspree is down the submission fails in the browser. Submissions persist in the Formspree dashboard in addition to email delivery. | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (enterprise form; contact/community endpoints are hardcoded in their components) | Name, email, message / form fields |
| YouTube (course lesson videos) | NO (course video delivery, not the purchase journey) | Embeds fail to load; lessons show unavailable players. No code path breaks. | none | Standard embed traffic from the viewer's browser |
| Amazon (book purchase links) | NO | Outbound links only; a dead link fails on Amazon's side. | none | None (navigation only) |
| pdf-lib (in-process library, no external service) | YES for the premium book-download journey | `/api/book-download` returns honest 500 ("not available right now") when the master cannot be loaded; nothing is delivered un-watermarked. | none | None — watermarking runs entirely on the server |

Optional integrations may be disabled in local or Preview when documented. In Production, a required delivery, payment, or abuse-prevention dependency fails closed with an honest error; it never reports success while losing work.

**Conversion durability (required).** A required conversion (e.g. the primary form) has **at least two independent capture paths** — never a single mailbox. If it emails a lead, it also persists the submission to a second sink (the form/email provider's dashboard, a second recipient, a data store, or a webhook) so one delivery failure never loses a lead.

*Current state:* the primary conversion (payment) is durable — Stripe's own dashboard/records plus the webhook-written `entitlements` table are independent sinks. Email capture persists in the Mailchimp audience (provider dashboard) with honest failure to the user otherwise. Formspree submissions persist in the Formspree dashboard plus email delivery.

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
- Every PR gets an isolated deployed Preview. The supplied profile is Vercel; record an approved equivalent here when different. *(This project: Vercel Preview deployment, per-PR.)*
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
