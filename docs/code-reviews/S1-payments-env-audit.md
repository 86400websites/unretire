# Standing Audit Brief — Payments, Environment & Configuration Correctness

> **Commissioned explicitly by the owner (2026-08-25):** *"give me a very powerful review that ensures we are
> all good to go and no errors in any variables, especially Stripe."*
>
> This is deliberately **broader than a diff review**. `AGENTS.md` normally forbids turning a scoped PR review
> into an unrelated audit; this brief is the owner's explicit standing instruction that overrides that default
> **for this audit only**. It still cannot authorise edits: findings-only, no commits, no pushes, no migrations.

## What you can and cannot verify — read this first

You have the repository. You **do not** have the Vercel, Stripe or Supabase dashboards. Therefore:

- **You CAN verify:** every `process.env` read and its failure mode; whether Stripe modes/prices/webhook
  handling are correct; whether secrets could leak to the browser; whether the documented configuration
  matches what the code actually requires; whether the recorded known issues are real and complete.
- **You CANNOT verify:** which values are actually set in which Vercel environment, or what the Stripe and
  Supabase dashboards contain. Those were probed externally and are stated as ground truth below.
  **Do not assert a dashboard fact you cannot check — instead, state what the code requires and flag any
  place where the stated ground truth would break the code.**

Any finding that depends on an unverifiable dashboard value must be labelled `ASSUMES-GROUND-TRUTH`.

## Ground truth — externally verified 2026-08-25 (treat as given)

| Item | State |
|---|---|
| Live site | `https://unretire.vercel.app` (working). Custom domain `unretireproject.com` still resolves to a GoDaddy parking page — DNS not yet pointed at Vercel |
| Live Stripe account | `acct_1S8bOcF3LxwumsBI` — **shared with other projects** (The Singapore Way, others) |
| Sandbox Stripe account | `acct_1TsJbSFWySZWCfsj` — separate account |
| Live products | UnRetire — Course $99 one-time · UnRetire — Premium $199 **per year** |
| Sandbox products | UnRetire — Course (Test) $99 · UnRetire — Premium (Test) $199/yr |
| Live webhook `brilliant-splendor` | `https://unretire.vercel.app/api/stripe/webhook` · API version `2026-07-29.dahlia` · 2 events. Verified: unsigned POST returns `400 {"error":"Missing signature"}` |
| Live webhook `charming-dream` | `https://half-a-life.vercel.app/api/stripe/webhook` — legacy, now a separate product; still Active |
| Sandbox webhook `captivating-triumph` | `https://unretire-git-staging-86400-s-projects.vercel.app/api/stripe/webhook` · API version `2026-06-24.dahlia` |
| `staging` branch | Exists on GitHub; **no Vercel deployment yet** — that URL currently returns 404 |
| Vercel **Production** vars | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (all Type Config); `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_COURSE`, `STRIPE_PRICE_PREMIUM`, `STRIPE_WEBHOOK_SECRET`, `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID` (Type Secret) — all live-mode values |
| Vercel **Preview** vars | The same three Supabase names (test-project values) + all four Stripe names (sandbox values) + `VERCEL_AUTOMATION_BYPASS_SECRET` + the two Mailchimp names |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Not set in any environment |
| Supabase PROD auth | Site URL `https://unretire.vercel.app`; redirect allow-list: `localhost:3000/**`, `www.unretireproject.com/**`, `unretireproject.com/**`, `unretire.vercel.app/**`, `*-86400-s-projects.vercel.app/**` |
| Supabase TEST auth | Site URL `http://localhost:3000`; allow-list: `localhost:3000/**`, `*-86400-s-projects.vercel.app/**` |

## Read these first

`CLAUDE.md`, `AGENTS.md`, `docs/ENVIRONMENT-PARITY.md`, `docs/TECH-ARCHITECTURE.md` §5–§7,
`docs/SECURITY-CHECKLIST.md`, and `docs/PROJECT-STATUS.md` §9–§10 (env-var record and known issues 1–32).

## Audit scope — answer every question with file:line evidence

### A. Stripe correctness (the owner's priority)

1. **Product/mode mapping.** In `src/lib/stripe/checkout.ts`, confirm `course` → `mode: "payment"` and
   `premium` → `mode: "subscription"`, and that each maps to the right `STRIPE_PRICE_*` variable. Confirm the
   code never hardcodes an amount or an interval — the price object owns both.
2. **Session metadata.** The webhook depends on `session.metadata.supabase_user_id` and
   `session.metadata.product`. Trace where they are set. **If any checkout path can create a session without
   both, that payment can never grant entitlement — report it as Blocking.** Check every caller:
   `src/app/api/checkout/route.ts` and the register/login server actions in `src/app/auth/actions.ts`.
3. **Signature verification.** `src/app/api/stripe/webhook/route.ts` — confirm the raw body is used, the
   secret comes from env, and failure returns non-2xx. Note that `getStripe()` is called *inside* the try
   whose catch logs "Invalid signature": if `STRIPE_SECRET_KEY` were missing, a config error would be
   misreported as a signature error. Assess whether that matters.
4. **Known issue 22 — the swallowed write.** Confirm the `entitlements` upsert (`:42`) and the cancellation
   update (`:63`) never inspect the returned `.error`, that `supabase-js` does not throw on API errors, and
   that the handler therefore returns **200** after a failed write, so Stripe never retries. Confirm the
   blast radius: which realistic failures (wrong project, RLS denial, schema drift, missing table) land here.
   State whether `src/app/api/book-download/route.ts:142` shows the correct pattern by contrast.
5. **Idempotency and duplicates.** `onConflict: "user_id,product"` — is a replayed or duplicated
   `checkout.session.completed` safe? Is a double-click able to create two Stripe sessions and two charges?
6. **Cancellation.** `customer.subscription.deleted` updates by `stripe_subscription_id`. Can that column be
   null or stale for a course (one-time) purchase, and could the update therefore hit the wrong rows or none?
7. **Entitlement logic.** `src/lib/auth/entitlements.ts` — verify "premium includes course" cannot be
   inverted, and that a `canceled` row cannot still grant access anywhere.
8. **Shared-account safety.** The live Stripe account serves other projects. Does anything in this repo
   enumerate, mutate, or depend on account-wide Stripe state (products, prices, webhooks, customers) rather
   than the specific IDs it is given? Anything account-wide is a finding.
9. **API-version drift (known issue 31).** Code pins `2026-06-24.dahlia`; live delivers `2026-07-29.dahlia`;
   sandbox delivers `2026-06-24.dahlia`. Identify every field the handler reads and state, per field, whether
   its shape differs across those versions. Conclude whether the drift is currently harmless — and say so
   plainly if it is; do not inflate it.

### B. Environment variables — the "no errors in any variables" question

10. Enumerate **every** `process.env.*` read in `src/` (expected: 11 names, ~18 sites). For each: the file:line,
    what happens when it is absent (trace the real fallback or throw), and whether the Ground Truth above
    supplies it in every environment where that code path can run. **Flag any name the code reads that is not
    provisioned somewhere it executes.**
11. **Public/private boundary.** Confirm no server-only value is behind `NEXT_PUBLIC_`, and no server-only
    value reaches client code. Confirm the three `NEXT_PUBLIC_` names are genuinely safe to expose.
12. **Site-wide blast radius.** `src/app/layout.tsx` calls Supabase on every render and
    `src/lib/supabase/server.ts` non-null-asserts its inputs. Confirm whether a missing Supabase variable is a
    degraded feature or a total outage, and whether the middleware's fail-open comment could mislead a reader.
13. **`.env.example` fidelity.** Does it list exactly the names the code reads, with placeholders only?
    Is `!.env.example` correctly whitelisted under the blanket `.env*` ignore in `.gitignore`?
14. **Secret hygiene across history.** Scan the tracked tree for any real key, token, connection string, or
    private URL. Report only file, line, and type — never the value.

### C. Auth and access

15. Every gated route and data path authorises **server-side** before returning protected data
    (`/account`, `/learn/course/[module]`, `/api/book-download`, `/api/checkout`). Client state must never be
    proof of entitlement.
16. `src/app/auth/confirm/route.ts` — confirm the `next` parameter cannot become an open redirect.
17. `src/app/auth/actions.ts:185` still sends password reset to `next=/unretire/reset-password`, a route that
    no longer exists (known issue 2). Confirm, and confirm no other stale `/unretire/*` path survives.
18. `src/middleware.ts` session refresh is fail-open. State the concrete consequence.

### D. Documentation fidelity

19. Do `docs/ENVIRONMENT-PARITY.md` and `docs/TECH-ARCHITECTURE.md` §6 accurately describe what the code
    requires and what Ground Truth says is configured? Report any doc that would mislead a future session.
20. Are known issues 1–32 in `docs/PROJECT-STATUS.md` each real, correctly severity-rated, and free of
    duplicates? **More important: name anything you found that is NOT on that list.**

## Returned record

- Files and paths inspected; commands run or skipped, with results.
- Findings, most severe first. Each: **Severity** (Blocking / Should-fix), **Location** (`file:line`),
  **Issue**, **Failure scenario** (concrete inputs → wrong outcome), **Suggested fix**, **Confidence**, and
  `ASSUMES-GROUND-TRUTH` where applicable.
- A short section: **"Things that are correct"** — the owner needs to know what he does *not* have to worry
  about, not only what is broken. Be specific.
- **Not a verdict on a diff.** End with one line: **PAYMENT PATH: SAFE TO TAKE MONEY / NOT SAFE**, plus the
  single most important thing to fix next.

Never open `.env.local` or any live env file. Never echo a suspected secret — file, line, and type only.
