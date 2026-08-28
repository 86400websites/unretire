# ENVIRONMENT-PARITY.md — Testing on Preview Without Touching Production

**Status:** authoritative for environment isolation and Preview↔Production parity on (Un)Retire.
**Written:** 2026-08-25 · **Applies from:** Sprint **S2.2** (isolation) / **S2.3** (harness) / **S2.5** (parity verification) through **S5.1** (Launch Gate) and beyond.
**Last reconciled:** 2026-08-25, Sprint **S1.1**, after the owner's dashboard configuration pass and the
Codex independent review (Blocking finding 6). §§ *Confirmed facts*, 1, 2A, 2B, 3, 4, 5.3, 5.3a, 5.3b, 6, 7,
8 and 9 were rewritten from *"nothing is split yet"* to the **current post-configuration state** — *configured*,
which is a weaker word than *verified* and is used deliberately throughout. ⚠ **Scope of the word
"configured" (added 2026-08-27, Sprint S1.6):** it covers the **Supabase and Stripe** variables only. ~~The
**Mailchimp audience is not configured at all** — `MAILCHIMP_LIST_ID` is one shared Production-and-Preview
entry and no test audience exists (§2B row 9; split = Sprint **S2.2**, proof = §8 **P7**). So overall
isolation is **incomplete**, not merely unproven.~~ → **superseded 2026-08-27 (Sprint S2.2) by decision
D-22:** the Mailchimp audience split is **cancelled, not deferred**. **One live audience serves Production,
Preview and local — permanently, by decision.** `MAILCHIMP_LIST_ID` and `MAILCHIMP_API_KEY` remaining
single shared entries is therefore **correct, not a defect**; §8 **P7 becomes N/A — accepted risk**; and the
Mailchimp half of isolation is **deliberately absent** rather than unfinished. The compensating controls are
the **five test rules recorded at §6 C8**. Superseded descriptions are struck
through and dated, never deleted.
**Domain go-live (added 2026-08-27, Sprint S2.1):** `https://www.unretireproject.com` now serves Production (verified HTTP 200; the apex `https://unretireproject.com` 308-redirects to it), and the Production `NEXT_PUBLIC_SITE_URL`, the `unretire-prod` Site URL and the live Stripe webhook destination all moved to the `www` host (owner-reported, OWNER-ACTIONS Part 4B; D-2 amended to `www`; Known issues 27 and 35 RESOLVED). Each 2026-08-25 "actual" state below is kept and a dated 2026-08-27 state is added beside it. **No §8 proof status changes** — none has been run against the new host; the auth-email landing on `www` (P3/P13) is still owed by S2.5.
**Audience:** the owner first, then any agent or engineer who touches an environment variable, a Supabase
project, or the test suite.

> ### The one thing to understand before reading further
>
> **The Supabase and Stripe halves of isolation are configured; they are not yet proven — and the
> Mailchimp audience is deliberately not isolated at all (D-22).** *(Sharpened 2026-08-27, Sprint S1.6;
> rewritten 2026-08-27, Sprint S2.2, for decision **D-22**: the earlier one-liner
> "Isolation is now configured. It is not yet proven." was true of Supabase/Stripe but wrongly covered
> Mailchimp. ~~`MAILCHIMP_LIST_ID` is one shared entry, no test audience exists; split = S2.2, proof = P7.
> Until that split, **a Preview form submission writes a real subscriber into the live audience**, so no
> Preview email-capture test may run.~~ → **D-22, 2026-08-27: the split is cancelled, not deferred.** One
> live audience serves Production, Preview and local. **A Preview or local form submission does write a real
> subscriber into the live audience and can fire real automations — that is the accepted, permanent risk**,
> and automated email-capture tests **are permitted** under the five rules at §6 **C8**.)* On 2026-08-25 the owner split the Supabase and
> Stripe variables, added the four sandbox Stripe entries to Preview, set `NEXT_PUBLIC_SITE_URL` in
> Production, configured the production Supabase Site URL and redirect allow-list, provisioned the
> automation bypass secret, and retyped the public variables as Config. Every one of those is a **dashboard
> assertion**. Not a single §8 proof has been run. A configured split and a *demonstrated* split are
> different claims, and only the second one is allowed to gate a test run — Sprint **S2.5** owns the proof.

This file answers one question, which the owner asked in these words:

> *"We need to ensure we are ready for testing… test database, Stripe fake payment… ensure it's all set up
> and consistent and not mixed with production — but we need to ensure if we pass all the tests it should
> exactly reflect production. High priority: that it works inside Preview (tests) but we run into errors in
> production."*

So: **how do we test on Preview without touching production, and still trust that green means green?**

### What this file does not repeat

These rules already exist elsewhere in the system and are not restated here as if new. This file applies
them to (Un)Retire and records the current state against them.

| Rule already written down | Where it lives |
|---|---|
| Public vs private variables; never copy a Production value into Preview; redeploy after every change; the leak procedure | `docs/ENV-VARS-SAFETY.md` |
| Two Supabase projects, never one shared database; the key boundary; Site URL + a tight redirect allow-list; RLS default-deny; TEST-first migrations; the per-environment Vercel wiring table | `docs/SUPABASE-VERCEL-SETUP.md` Parts A2, B1, B2, B3, B4, B5, B6 |
| The variable names, which are public and which server-only, and what each one switches on | `docs/TECH-ARCHITECTURE.md` §6 |
| The robot never touches real data or real money; Preview runs test-mode keys and a non-production database; the sanctioned Preview protection bypass for automation | `docs/testing-setup/TESTING-GUIDE.md`, `docs/testing-setup/SETUP-CHECKLIST.md` Parts 2–3 |
| Numbered up/down SQL with its policies, applied TEST first, verified per role, owner-approved before PROD | `docs/templates/SUPABASE-CHANGE-TEMPLATE.md` |
| Production database access for agents is read-only under the recorded Profile B exception (D-11) | `docs/SUPABASE-MCP-SAFETY.md` |

**Never a value.** This file records variable **names**, value **classes** ("the test project's URL"), and
public project identifiers only. Supabase project refs are public identifiers and are safe to record. No key,
token, secret, price id, or connection string ever appears here — per `docs/ENV-VARS-SAFETY.md`.

---


## Confirmed infrastructure facts (verified 2026-08-25)

These were read off the owner's dashboards and probed directly. Do not re-derive or guess them.

| Fact | Value |
|---|---|
| **Production origin — what actually serves the app today** | ~~**`https://unretire.vercel.app`** — verified HTTP 200 on 2026-08-25. **Read every "the production URL" in this file as this host** until DNS moves.~~ → **actual, 2026-08-27: `https://www.unretireproject.com`** — verified HTTP 200, `Server: Vercel`, served `og:url` exactly `https://www.unretireproject.com` (no trailing slash). The apex `https://unretireproject.com` returns HTTP 308 → `https://www.unretireproject.com/`. `https://unretire.vercel.app` still returns HTTP 200 as the Vercel default alias — now a **fallback**, no longer the live origin. **Read every "the production URL" in this file as the `www` host.** |
| Production domain — ~~(intended, not yet live)~~ **LIVE 2026-08-27** | ~~`https://www.unretireproject.com` (apex `unretireproject.com` also registered)~~ — ~~registered and added in Vercel, but **DNS is still parked at GoDaddy**, so neither host serves the site. Target state, not current state (Known issue 27).~~ **DNS moved 2026-08-27:** `https://www.unretireproject.com` serves the app (HTTP 200); the apex `https://unretireproject.com` 308-redirects to it. Canonical production host = **`www`** — decision D-2 **amended 2026-08-27** (not reopened): canonical `https://www.unretireproject.com`, apex redirects. **Known issue 27 RESOLVED 2026-08-27.** The domain remains *registered* at GoDaddy — only DNS moved. |
| Vercel scope / team slug | `86400-s-projects` |
| Vercel project | `unretire` (Production deploys from `master`) |
| Preview URL pattern | `https://unretire-git-<branch-with-dashes>-86400-s-projects.vercel.app` |
| Supabase preview wildcard for allow-lists | `https://*-86400-s-projects.vercel.app/**` |
| Supabase TEST | `unretire-test` · ref `dtdadtggahjsrmevwvbu` · ap-south-1 |
| Supabase PROD | `unretire-prod` · ref `hcjivvlwxltyiycfbttc` · eu-west-1 |
| **Supabase PROD auth URL configuration** | **Configured 2026-08-25** (was: Site URL `http://localhost:3000`, empty allow-list). Site URL ~~**`https://unretire.vercel.app`**~~ → **`https://www.unretireproject.com`** (updated 2026-08-27, owner-reported — OWNER-ACTIONS Part 4B L2); redirect allow-list `http://localhost:3000/**`, `https://www.unretireproject.com/**`, `https://unretireproject.com/**`, `https://unretire.vercel.app/**`, `https://*-86400-s-projects.vercel.app/**` — **unchanged on 2026-08-27**. See §5.3a for what is now correct and what is still hygiene debt. |
| Stripe LIVE account | `acct_1S8bOcF3LxwumsBI` — **shared with other projects** (The Singapore Way, others) |
| Stripe SANDBOX account | `acct_1TsJbSFWySZWCfsj` — a separate account; cannot affect live |
| Live prices | UnRetire — Course $99 one-time · UnRetire — Premium $199 **per year** — both correct |
| Sandbox prices | UnRetire — Course (Test) $99 · UnRetire — Premium (Test) $199/yr — already exist |
| Live webhook (ours) | `brilliant-splendor` → ~~`https://www.unretireproject.com/api/stripe/webhook`~~ ~~**`https://unretire.vercel.app/api/stripe/webhook`**~~ **`https://www.unretireproject.com/api/stripe/webhook`** — repointed 2026-08-25 to the Vercel alias (Known issue 29 resolved), then repointed 2026-08-27 to the `www` host (owner-reported, OWNER-ACTIONS Part 4B L3; signing secret preserved, no Vercel change). API version **`2026-07-29.dahlia`**, Active. Probed 2026-08-25: an unsigned POST returns 400 `Missing signature`, a bogus-signature POST returns 400 `Invalid signature` — **which proves `STRIPE_WEBHOOK_SECRET` is set in Production**, and proves nothing about `STRIPE_SECRET_KEY` (Known issue 36). **Re-probed 2026-08-27 on the new host:** a bogus-signature POST to `https://www.unretireproject.com/api/stripe/webhook` returns 400 `{"error":"Invalid signature"}` — the route is served on the `www` host with the live webhook secret present; the apex webhook path 308-redirects to `www`. |
| Legacy live webhook — **do not delete yet** | `charming-dream` → `https://half-a-life.vercel.app/api/stripe/webhook`, still **Active** on the shared live account (Known issue 26). |
| Sandbox webhook (ours) | `captivating-triumph` → `https://unretire-git-staging-86400-s-projects.vercel.app/api/stripe/webhook`, API version **`2026-06-24.dahlia`** (matches the SDK pin; the live endpoint does not — Known issue 31, severity Low). ~~⚠ `staging` exists on GitHub **at the same commit as `master`**, so Vercel has never built it and that URL returns **404** — the sandbox endpoint currently has nowhere to deliver (Known issue 32).~~ **2026-08-27: `staging` fast-forwarded to `a68f210` and built — the alias answers 302; Known issue 32 RESOLVED.** The endpoint needs the bypass query parameter, which the owner set the same day (owner-reported; proven by P6, S2.5). |
| Preview protection | **ON**, and **Protection Bypass for Automation is now provisioned** — `VERCEL_AUTOMATION_BYPASS_SECRET` exists in the Preview scope (2026-08-25). A human browser still meets the Vercel login page; the remaining unknown is **whether the Playwright config actually uses the bypass**, which is Sprint **S2.3** (Known issue 25, reworded 2026-08-25 — it no longer "blocks all automated testing"). |

### Vercel environment scopes, as verified 2026-08-25 (names and scopes only — never values)

| Scope | What it now holds |
|---|---|
| **Preview** | 3 Supabase entries pointing at the **TEST** project · 4 Stripe entries pointing at the **SANDBOX** account · `VERCEL_AUTOMATION_BYPASS_SECRET` · ~~⚠~~ ✅ **by design (D-22, 2026-08-27):** the 2 Mailchimp names reach Preview only via their **shared Production-and-Preview entries** — there is **no Preview-scoped Mailchimp entry** (corrected 2026-08-26, stage-gate Round 4 Finding 1; a Preview form therefore writes to the LIVE audience — §2B row 9). Logged as a gap until 2026-08-27; **D-22 makes it the accepted permanent posture** — one live audience serves Production, Preview and local, under the five test rules at §6 **C8**. `NEXT_PUBLIC_SITE_URL` is **deliberately absent** (§2A row 10); `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is absent and still open (§3 Gap 4). |
| **Production** | All 10 entries in **live** mode. The three `NEXT_PUBLIC_*` variables are typed **Config**; everything else is typed **Secret** (Known issue 24 resolved). |

**Other projects share the live Stripe account.** Never modify the `the-singapore-way` or `upbeat-splendor`
webhook destinations, the `The Singapore Way (PDF)` product, or the `pkprobe` products. Every Stripe change
this project makes must be scoped to the UnRetire products and the UnRetire webhook destinations only.


## 1. The two rules

> **Rule 1 — Isolation.** *Preview never touches production data or real money.*
>
> **Rule 2 — Fidelity.** *Preview is otherwise structurally identical to Production.*

**Why Rule 1 is needed.** Preview is where unfinished code runs, and where an automated robot will click
every button on the site hundreds of times. Without isolation, a test signup becomes a permanent real
account, a test "purchase" becomes a real charge on a real card, a test email capture becomes a real
subscriber receiving a real automated email sequence, and a test password reset changes a real member's real
password. That is not a testing inconvenience; it is customer harm and lost money.

**Why Rule 2 is needed.** Isolation on its own is easy and worthless — point Preview at an empty sandbox and
everything passes. A green run only means something if the thing that passed is *the same shape* as the thing
that ships. If the test database has a different table constraint, or a different "confirm email" setting, or
a different security policy, then the suite proves the sandbox works and says nothing at all about
Production. That is exactly the failure the owner named: green in Preview, errors in Production.

**How the two rules conflict.** Every isolation step deliberately makes Preview *different* from Production,
and every difference is a place where a test can lie. The conflict is real and cannot be argued away — it is
managed, item by item.

| The tension | How it is resolved here |
|---|---|
| Isolation wants a **different database**; fidelity wants **identical schema, security policies and auth settings**. | Different project — but built from a **committed SQL file** that is diffed against Production, plus a written auth-settings parity table evidenced from both dashboards. Isolation of the *data*; identity of the *definition*. (§5) |
| Isolation wants **Stripe test mode**; fidelity wants the same prices, intervals, currency and events. | Mirror the *shape* exactly — same amounts, same currency, one-time vs yearly recurring, the same two webhook events. Accept that ids, keys and signing secrets differ **by necessity**, and close that gap with one real live purchase at launch. (§6 C1) |
| Isolation wants a **separate email audience**; fidelity wants the same fields and the same automated journeys. | ~~Mirror the field names and tag names exactly and assert them. Accept that the automated journeys are **not** exercised — verify those once, manually, with the owner's own address.~~ **Resolved differently 2026-08-27 by D-22: there is no separate audience, so this tension is not managed — it is conceded.** One live audience serves every environment; fidelity is total and isolation is nil. The suite asserts the field and tag **contract** against the live audience under D-22 rules 1 and 2a–2e (`docs/PROJECT-STATUS.md` §8; cited at §6 **C8**) ~~(owner-mailbox plus-tags, no fabricated addresses, teardown, full-suite only, no campaign sends)~~ *(paraphrase struck 2026-08-28, S2.2 Round 1 Finding 4 — the rules have one canonical home)*; real automations therefore **can** be exercised, and **multi-day journeys are still confirmed manually in the owner's own inbox**. (§6 C8) |
| Isolation wants Preview **locked behind a password**; fidelity wants Production's **open, unauthenticated** request path. | Use Vercel's sanctioned automation bypass on Preview (per `docs/testing-setup/SETUP-CHECKLIST.md` Part 3) and separately assert that Production has no protection — so both request paths get exercised. (§6 C3) |
| Isolation wants Preview to **never touch production data**; fidelity wants Preview to run **exactly the same code**. | Same code, different environment **values**. That is only achievable if Vercel's Preview scope holds different values from Production. ~~**Today it does not — and that single change is what unlocks everything else.**~~ **Done 2026-08-25:** Preview now holds the `unretire-test` Supabase values and the sandbox Stripe values. What remains is *proof* — the split is configured in a dashboard, not yet demonstrated by a request (§3 Gap 1, §4, §8 P1/P2/P4). |

**The one-line summary for the owner:** we make the *data and the money* different, we make *everything else*
provably the same, and where "provably the same" is impossible we write down exactly what is left uncovered
and cover it with a small, explicit manual check on the real site (§6, §7).

---

## 2. The environment matrix

Eleven variables — this is the complete set, verified by an exhaustive scan of the source. There are no other
environment reads anywhere in `src/`, there is no `vercel.json`, and `next.config.ts` contains no env block,
rewrites, redirects, or headers. Names and public/server classification match `docs/TECH-ARCHITECTURE.md` §6.

### 2A — Target state: which value CLASS belongs in each cell

*Never a value. "Class" means which account, project, or mode the value comes from.*

| # | Name | Public / server-only | Local | Preview (target) | Production |
|---|---|---|---|---|---|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | Public | TEST project URL (`unretire-test`) | TEST project URL | PROD project URL (`unretire-prod`) |
| 2 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | TEST project publishable key | TEST project publishable key | PROD project publishable key |
| 3 | `SUPABASE_SECRET_KEY` | Server-only — **bypasses row-level security** | TEST project secret | TEST project secret | PROD project secret |
| 4 | `STRIPE_SECRET_KEY` | Server-only | Stripe **test-mode** secret key | Stripe **test-mode** secret key | Stripe **live-mode** secret key |
| 5 | `STRIPE_WEBHOOK_SECRET` | Server-only | signing secret printed by the local Stripe CLI listener | signing secret of the **test-mode** webhook endpoint | signing secret of the **live-mode** webhook endpoint |
| 6 | `STRIPE_PRICE_COURSE` | Server-only | **test-mode** price id — one-time, $99 USD | **test-mode** price id — one-time, $99 USD | **live-mode** price id — one-time, $99 USD |
| 7 | `STRIPE_PRICE_PREMIUM` | Server-only | **test-mode** price id — recurring yearly, $199 USD | **test-mode** price id — recurring yearly, $199 USD | **live-mode** price id — recurring yearly, $199 USD |
| 8 | `MAILCHIMP_API_KEY` | Server-only | Mailchimp API key (may be the same account as Production) | ~~same key is acceptable — *provided row 9 differs*~~ **one shared key — correct under D-22 (2026-08-27); row 9 no longer differs, by decision** | Mailchimp API key |
| 9 | `MAILCHIMP_LIST_ID` | Server-only | ~~**test audience** id~~ **live audience id (D-22, 2026-08-27)** | ~~**test audience** id~~ **live audience id (D-22, 2026-08-27) — the split is cancelled, not deferred; see §6 C8 for the five rules that govern testing against it** | **live audience** id |
| 10 | `NEXT_PUBLIC_SITE_URL` | Public | `http://localhost:3000` | deliberately **unset** — every PR gets a unique Preview URL, so any fixed value would be wrong for most deployments. Checkout and auth derive the origin from request headers, so they stay correct; the only consequence is that Preview `metadataBase` falls back to localhost, which is harmless because Preview OG tags are never shared | **Set 2026-08-25, Production-scoped only, typed Config.** Its value is the origin that actually serves the site — ~~`https://unretire.vercel.app` (⚠ currently stored **with a trailing slash**, Known issue 35)~~ → **actual, 2026-08-27: `https://www.unretireproject.com`**, no trailing slash (owner-reported, OWNER-ACTIONS Part 4B L1; the served `og:url` without a trailing slash is the evidence the redeploy picked it up — **Known issue 35 RESOLVED 2026-08-27**). ~~It changes to `https://unretireproject.com` when DNS moves off GoDaddy (D-2 / Known issue 27), and it must then be changed~~ DNS moved 2026-08-27 (Known issue 27 RESOLVED; D-2 amended — canonical is the `www` host, the apex redirects) and the value **was changed** in **three** places together: this variable, the `unretire-prod` Supabase **Site URL**, and the live Stripe webhook destination — all three now the `www` host |
| 11 | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Public | a Formspree endpoint (ideally a throwaway form) | a Formspree endpoint (ideally a throwaway form) | the real Formspree endpoint |

Two pairing rules that break things quietly when ignored:

- **Rows 1–3 must always come from the same Supabase project.** A Production URL with a test secret key (or
  the reverse) produces an "invalid API key" rejection which — see §7 risk 1 — is currently *swallowed and
  answered with success*, so nothing anywhere records the failure.
- **Row 7 must be a recurring price and row 6 must be a one-time price.** The code opens a subscription
  session for Premium and a payment session for the Course; the wrong price type errors at session creation.

### 2B — Sharing verdict, today's verified state, and what changed on 2026-08-25

*"Shared" means one Vercel entry whose scope covers both Production and Preview, so both read the same value.*

The **"Today in Vercel"** column is the verified state after the owner's 2026-08-25 configuration pass. The
**"Superseded"** column keeps the state this document was originally written against, so the history — and the
reason each control exists — survives. Nothing is deleted.

| # | Name | May Preview and Production share one value? | What sharing actually causes | **Today in Vercel (verified 2026-08-25)** | ~~Superseded — resolved 2026-08-25~~ | Status |
|---|---|---|---|---|---|---|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | **NO — catastrophic** | Every Preview deployment, and every future robot test run, reads **and writes** the production database: real accounts, real sessions, real password changes, real entitlements. | **Split.** Production = `unretire-prod` URL · Preview = `unretire-test` URL | ~~Production AND Preview (shared)~~ | ✅ **RESOLVED (configured)** — proof pending, §8 P1/P2 |
| 2 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **NO — catastrophic** | Same as row 1. A *mismatch* with row 1 instead breaks login and signup across the whole site with "invalid API key". | **Split.** Production = PROD publishable key · Preview = TEST publishable key | ~~Production AND Preview (shared)~~ | ✅ **RESOLVED (configured)** — proof pending |
| 3 | `SUPABASE_SECRET_KEY` | **NO — catastrophic** | This key ignores every database security policy. Shared, any Preview deployment that receives a payment event can grant or revoke **production** access with no guard at all. | **Split.** Production = PROD secret · Preview = TEST secret | ~~Production AND Preview (shared)~~ | ✅ **RESOLVED (configured)** — proof pending |
| 4 | `STRIPE_SECRET_KEY` | **NO — catastrophic in one direction** | A **live** key in Preview turns every automated "purchase" into a real card charge and a real recurring subscription against a real customer record. (A test key in Production fails closed instead: nobody can pay. Bad, but it does not move money.) | **Split.** Production = live-mode key · Preview = **sandbox account** key | ~~Production ONLY — absent from Preview~~ | ✅ **RESOLVED (configured)** — proof pending, §8 P4 |
| 5 | `STRIPE_WEBHOOK_SECRET` | **NO — unsafe, fails closed** | A test-mode secret in Production makes every live payment's confirmation fail: **customers pay and never receive access**, and the only symptom is a red delivery list in the Stripe dashboard that nobody is watching. | **Split.** Production = `brilliant-splendor`'s secret (proved present by the 400 `Invalid signature` probe) · Preview = `captivating-triumph`'s secret | ~~Production ONLY — absent from Preview~~ | ~~🟠 **Configured but undeliverable** — the sandbox endpoint targets a `staging` Preview Vercel has never built (404, Known issue 32). Nothing can reach the Preview webhook until that lands~~ ✅ **RESOLVED (configured) 2026-08-27** — `staging` is built (Known issue 32 RESOLVED); delivery unproven until §8 P6 (S2.5) |
| 6 | `STRIPE_PRICE_COURSE` | **NO — unsafe** | Test and live price ids look identical (both `price_…`, no visible marker). Crossed, checkout fails with the generic "Could not start checkout" 500 — indistinguishable from a Stripe outage. | **Split.** Production = live one-time $99 · Preview = sandbox one-time $99 | ~~Production ONLY — absent from Preview~~ | ✅ **RESOLVED (configured)** |
| 7 | `STRIPE_PRICE_PREMIUM` | **NO — unsafe** | Same as row 6. | **Split.** Production = live yearly $199 · Preview = sandbox yearly $199 | ~~Production ONLY — absent from Preview~~ | ✅ **RESOLVED (configured)** |
| 8 | `MAILCHIMP_API_KEY` | ~~**Conditionally yes** — safe only while row 9 differs~~ **YES — unconditionally, since D-22 (2026-08-27)** | The key selects the account and its data centre; the audience id selects who actually gets emailed. Sharing the key alone is harmless. | ~~May stay one shared entry **only once row 9 is split**~~ **One shared entry is the approved end state — D-22 cancels the row 9 split, so the condition can never be met and no longer applies** | **ONE shared entry, scoped Production AND Preview** (verified 2026-08-26 — owner's Vercel dashboard screenshot) | ~~🟡 acceptable **only once row 9 genuinely differs** — row 9 is currently NOT split~~ → ✅ **CORRECT AS IS (D-22, 2026-08-27)** — row 9 deliberately does not differ; nothing is owed on this row |
| 9 | `MAILCHIMP_LIST_ID` | ~~**NO — unsafe**~~ → **YES — accepted risk, permanently (D-22, 2026-08-27)** | Every Preview form submission and every robot email-capture test writes a **real subscriber** into the live audience and can fire the real automated sequence. ~~— real emails to fake addresses. Pollutes the list, harms sender reputation, and inflates the contact-count billing tier.~~ **Restated 2026-08-27 under D-22:** those consequences are unchanged and are now **accepted** — inflated contact-count billing tier and sender-reputation exposure included. ~~What is *not* accepted is the thing that actually damages a sending domain: **fabricated addresses (`test@example.com`, random strings) hard-bounce, and bounces are the harm** — so every test contact uses the **owner's own mailbox with a unique plus-tag**, and every email-capture spec tears its contact down. The five governing rules are at §6 **C8**.~~ *(Restated 2026-08-28 so the rules have one home:)* Test submissions therefore write real subscribers to the live audience — governed by **D-22 rules 1 and 2a–2e** in `docs/PROJECT-STATUS.md` §8 — the single canonical statement of these controls; cite them by label rather than restating them. | ~~Production = live audience id · Preview = a **test** audience id in a separate Preview-scoped entry~~ **Target withdrawn 2026-08-27 (D-22): one live audience id, shared by Production, Preview and local** | **ONE shared entry, scoped Production AND Preview** (verified 2026-08-26 — owner's Vercel dashboard screenshot). ~~An earlier version of this row claimed "A Preview-scoped entry now exists alongside the Production one" — **that claim was FALSE** (stage-gate Round 4, Finding 1) and is retracted~~ | ~~🔴 **NOT SPLIT — do not run any Preview form or email-capture test.** The split (test audience + Preview-scoped entry) is Sprint **S2.2** scope; the behavioural proof is §8 **P7** (S2.5)~~ → ✅ **SHARED BY DECISION (D-22, 2026-08-27) — the split is cancelled, not deferred.** Preview and local email-capture tests **are permitted** under the §6 C8 rules; §8 **P7 is N/A — accepted risk** |
| 10 | `NEXT_PUBLIC_SITE_URL` | **NO — sharing is itself the defect** | One string cannot be correct for two hostnames. Shared, Preview pages advertise the production address to search engines and social networks. | **Production: set** to the live origin ~~`https://unretire.vercel.app/` (⚠ trailing slash, Known issue 35)~~ → **`https://www.unretireproject.com`** (no trailing slash — updated 2026-08-27, owner-reported; evidenced by the served `og:url`). **Preview: intentionally unset** — see §2A row 10 | ~~NOT SET IN ANY ENVIRONMENT~~ | ✅ **RESOLVED 2026-08-25** (Known issue 19) — ~~one-character trailing-slash fix outstanding~~ trailing slash removed 2026-08-27 (Known issue 35 RESOLVED; both successor items of Known issue 19 — 27 and 35 — are now closed) |
| 11 | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | **Yes — safe** | All three forms already post to the same endpoint in code, so there is nothing to isolate. Preferably point Preview at a throwaway form so the owner's inbox stays clean. | **NOT SET IN ANY ENVIRONMENT** | *(unchanged)* | 🟢 **STILL OPEN** — low (Known issue 20, §3 Gap 4) |

**A twelfth name now exists in the Preview scope: `VERCEL_AUTOMATION_BYPASS_SECRET`.** It is deliberately not
a row above, because the eleven-variable matrix is the set read by `src/` — this one is consumed by Vercel's
own edge and by the test harness, never by application code. Its presence is what reduces Known issue 25 from
"blocks all automated testing" to "the harness must be wired to it" (Sprint S2.3).

**Read the "Today" column as one sentence** *(rewritten 2026-08-26 — the 2026-08-25 version wrongly said
the Mailchimp audience was "split in form"; stage-gate Round 4, Finding 1 — **amended 2026-08-27 for
D-22**)*: *the Supabase and Stripe
dependencies are split; the Mailchimp audience is ~~**not split at all** — one shared entry, the S2.2 task —~~
**deliberately not split — one shared live audience, by decision D-22, and it stays that way** —
and nothing has yet been demonstrated by a request.* The two superseded one-sentence readings —
~~*everything that should be split now is split, one thing (Mailchimp's audience) is split in form but
unproven in substance*~~ (2026-08-25, partly false) and ~~*everything that should be split is shared, and
everything that should exist in Preview is missing*~~ (pre-2026-08-25) — are kept here only as history.

> **Documentation drift — reconciled twice (2026-08-25).**
> **Round 1:** `docs/PROJECT-STATUS.md` §9 and `docs/TECH-ARCHITECTURE.md` §6 previously listed the four
> Stripe variables as "Production / Preview" and the two unset variables as set; both were corrected against
> this table, and `docs/TECH-ARCHITECTURE.md` §6 now states *current state vs intended* per row.
> **Round 2 (this pass):** the tables corrected in round 1 described the **pre-split** dashboards and are
> themselves now stale. Known issues **17, 18, 19 and 24** are marked **RESOLVED 2026-08-25** for the same
> reason. `docs/TECH-ARCHITECTURE.md` §4's line *"Local, Preview, and Production do not share writable
> production data"* — recorded in round 1 as **verified FALSE** — becomes **verified TRUE by configuration
> for the Supabase and Stripe dependencies only, unverified by test**, and may not be flipped to a clean
> pass until §8 P1 and P2 are recorded. *(Precision added 2026-08-26, Round 5 Finding 1: the Mailchimp
> audience is excluded from even the configuration claim — it remains one shared entry, §2B row 9.
> **Amended 2026-08-27, D-22: it is excluded because it is deliberately not isolated, not because it is
> unfinished — and it will never be added to that claim.**)*
> This table remains the single source of truth; re-verify it against the live Vercel dashboard after any
> environment change.

---

## 3. The four gaps — status after the 2026-08-25 configuration pass

Four findings, each with its severity, the concrete failure it caused, and where it now stands. **Three of the
four are closed at the configuration level; none is closed at the proof level; one is untouched.**

| Gap | Was | Now |
|---|---|---|
| **1** — Preview reads *and writes* production | 🔴 CRITICAL | ✅ **Configured 2026-08-25** — Preview points at `unretire-test`. Unproven until §8 P1 + P2 |
| **2** — Stripe absent from Preview | 🟠 CRITICAL for testing | ✅ **Configured 2026-08-25** — four sandbox entries added. ~~Blocked in practice by Known issue 32 (`staging` has no deployment)~~ *(2026-08-27: `staging` built, Known issue 32 RESOLVED — unblocked; §8 P4–P6 owed by S2.5)* |
| **3** — `NEXT_PUBLIC_SITE_URL` unset | 🟡 MEDIUM | ✅ **Set in Production 2026-08-25.** ~~Trailing-slash fix outstanding (Known issue 35)~~ Value moved to `https://www.unretireproject.com` with no trailing slash on 2026-08-27 (Known issue 35 RESOLVED) |
| **4** — `NEXT_PUBLIC_FORMSPREE_ENDPOINT` unset | 🟢 LOW | 🟢 **Still open** — unchanged (Known issue 20) |

### Gap 1 — ~~🔴 CRITICAL~~ ✅ RESOLVED (configured) 2026-08-25 · Preview reads *and writes* the production database

> **Current state.** The three Supabase entries are split: Production holds the `unretire-prod` values, Preview
> holds the `unretire-test` (ref `dtdadtggahjsrmevwvbu`) values. Open decision **D-8** is resolved and the test
> project is now in use rather than idle. **Not yet proven:** no Preview deployment has been observed
> resolving to the test ref, and no signup has been observed landing in TEST and *not* in PROD. Those are §8
> **P1** ~~and **P2**, owned by Sprint **S2.5**~~ ~~**— under D-20 (2026-08-27) P1 is owned by S2.2 and P2 by S2.5. P1's
> status: OWED with a named owner — Preview sits behind Vercel Deployment Protection, so the served page cannot be
> inspected from inside the repo; it closes only on owner-supplied evidence and must not be recorded as passed before
> that arrives.**~~ **D-20 amended 2026-08-27: P1 is DEFERRED to S2.3** — not observable in S2.2 ~~(the value is inlined in the client JS behind Deployment Protection)~~ **— and, corrected 2026-08-28 (S2.3): not observable from a browser at all — the ref is in no client chunk and the browser never calls Supabase; P1 is proven by fixture sign-in in the S2.3 harness**; the owner's view-source step was withdrawn and nothing remains for the owner. P2 stays with S2.5. Until they are recorded, the paragraphs below describe a risk
> that is *believed* closed, not one that is *known* closed.

**~~What is true today~~ — what was true until 2026-08-25 (kept as history).** The three Supabase variables each
existed as a single Vercel entry scoped to both Production and Preview, so both environments received the same
value: the `unretire-prod` project (ref `hcjivvlwxltyiycfbttc`). The test project existed but **no deployment
pointed at it**.

**What that caused, before any test suite existed.** Every one of these writes landed in production — and this
list is the reason the split is not optional:

| Production data touched from a Preview | How |
|---|---|
| Real user accounts | Any signup on a Preview creates a permanent production account |
| Real login sessions and refresh tokens | Created on sign-in, and refreshed on **every request** while browsing a Preview while signed in |
| Real passwords | A password-reset or password-change test on a Preview changes a real member's real password |
| The production audit trail | Polluted with test events |
| Members' one-time book-download records | Read today. **Written the moment Known issue 1 is fixed** — a member's single lifetime download could be consumed by a test |
| Product entitlements (who has paid for what) | Not written today, **only because** the Stripe webhook secret happens to be missing from Preview |

Two non-database writes belong on the same list: the **live Mailchimp audience** (real contacts and real
automated journeys, via the email-capture endpoint) and the **live Formspree inbox** (contact and community
forms — see Gap 4 and §6 C9). There is no Supabase Storage usage anywhere, so there is nothing to isolate
there today.

**The trap in that last table row — this is still the most important sentence in the document, and it was
navigated correctly.** The first thing anyone must do to enable payment testing on Preview is add
`STRIPE_WEBHOOK_SECRET` to Preview. Had the Supabase variables not been split *in the same sitting*, that
single change would immediately have switched on a code path writing **real entitlements into the production
database** from test-mode payments. On 2026-08-25 both changes were made together, in the right order.
**Split Supabase first. Always** — this ordering rule stays in force for every future environment, because it
is a property of the code, not of one afternoon's dashboard work.

**The fix.** §4 steps 1–3, in that order — done 2026-08-25, proof outstanding.

### Gap 2 — ~~🟠 CRITICAL for testing~~ ✅ RESOLVED (configured) 2026-08-25 · Stripe is entirely absent from Preview

> **Current state.** All four Stripe variables now exist in the Preview scope holding **sandbox account**
> (`acct_1TsJbSFWySZWCfsj`) values, and a sandbox webhook destination `captivating-triumph` exists.
> ~~⚠ **One thing still blocks an actual test payment:** that destination points at
> `https://unretire-git-staging-86400-s-projects.vercel.app`, and because `staging` sits at the same commit as
> `master` Vercel has never built it — the URL returns **404**. Stripe has nowhere to deliver. Land one commit
> on `staging` and the path opens (Known issue **32**, Sprint S2.2).~~ **DONE 2026-08-27** — `staging` was fast-forwarded to `a68f210` and Vercel built the alias, which now answers **302** (was 404); **Known issue 32 RESOLVED**. The endpoint answered 401 without the bypass query parameter, which the owner set the same day (owner-reported; proven by P6, S2.5). Delivery is now *unrun*, not blocked — §8 P4–P6, Sprint S2.5.

**~~What is true today~~ — what was true until 2026-08-25 (kept as history).** All four Stripe variables were
scoped **Production only**. The Stripe client reads its key lazily and deliberately — the file's own comment
says this is so Preview *builds* do not fail — so the site compiled and served normally on Preview. But at
runtime:

- **Checkout** fails with a 500 and the honest message "Could not start checkout" (or a `?checkout=error`
  return to the product page from the signed-in path).
- **The webhook** has no signing secret, so `/api/stripe/webhook` rejects every request with 400 before
  anything else runs.

**What it caused.** **No payment path could be tested on Preview at all** — not purchase, not access granting,
not cancellation. Checkout session creation is now possible on Preview; ~~**webhook delivery is not**, until
Known issue 32 is cleared.~~ *(2026-08-27: Known issue 32 RESOLVED — `staging` is built; delivery is unrun, not blocked, and is owed by §8 P4–P6 in S2.5.)* So the primary conversion remains untested end to end today, for a different and
smaller reason than before.

**One diagnostic trap worth knowing before it costs an hour.** In the webhook, the missing-key error is
raised *inside* the signature-verification block, so a missing `STRIPE_SECRET_KEY` is reported to the
operator as **"Invalid signature"**. The message names the wrong cause. Check the key before chasing the
signature.

**The fix.** §4 steps 4–7 — done 2026-08-25, ~~plus the one residual: land a commit on `staging` so the sandbox
endpoint has a target (Known issue 32).~~ *(residual DONE 2026-08-27 — `staging` fast-forwarded to `a68f210` and built; Known issue 32 RESOLVED)*

### Gap 3 — ~~🟡 MEDIUM~~ ✅ RESOLVED (Production) 2026-08-25 · `NEXT_PUBLIC_SITE_URL` is not set in any environment

> **Current state.** Set in **Production** to the live origin, typed **Config**, deliberately left **unset in
> Preview** (§2A row 10). Known issue **19** is closed. ~~Two small things remain~~ *(both resolved 2026-08-27 — see the end of this paragraph)*: ~~the stored value carries a~~
> ~~**trailing slash** (Known issue 35 — harmless for `metadataBase`, but it would produce a double slash in the~~
> ~~header-less fallback paths in `src/app/api/checkout/route.ts` and `src/app/auth/actions.ts`), and the value~~
> ~~must change again when DNS moves to the custom domain.~~ **Both done 2026-08-27** (owner-reported, OWNER-ACTIONS Part 4B L1 + L4 redeploy): the value is now `https://www.unretireproject.com`, no trailing slash — Known issues 27 and 35 RESOLVED; the served `og:url` without a trailing slash is the evidence the redeploy picked it up.

**Be precise about this one — it is routinely overstated.** The variable is read in three places, and only
one of them was ever actually broken, because the other two prefer the real request headers:

| Where it is read | What happens with the variable unset | Verdict |
|---|---|---|
| Checkout session creation (`src/app/api/checkout/route.ts:31-34`) | Uses the browser's `origin` header **first**. Stripe's success and cancel URLs are correct. | ✅ **No impact** |
| Auth server actions (`src/app/auth/actions.ts:19-26`) | Derives the origin from `x-forwarded-host` / `host` **first**. Confirmation and password-reset links point at the right deployment — a Preview signup's email returns to that Preview. | ✅ **No impact** |
| Page metadata (`src/app/layout.tsx:40`, `metadataBase`) | **This variable only**, falling back to `http://localhost:3000`. There is no header fallback at this site. | 🟡 **Real defect** |

**So the concrete failure was:** Production published canonical URLs and social-sharing (Open Graph) URLs that
resolved against `http://localhost:3000`. That harms search indexing and makes shared links render the wrong
preview. **Fixed in the dashboard on 2026-08-25** — but a public value is compiled into the build, so it is
only fixed in deployments built *after* that change (§6 C11). Assert it in the served page, not the dashboard.

**It was not a payment defect, not an auth defect, and it did not send anyone to localhost during checkout.**
Any summary claiming otherwise is wrong, and this distinction should survive every retelling.

**The fix.** §4 step 8: set it Production only; leave Preview unset (see §2A row 10 for why a fixed Preview
value would be wrong) — then redeploy, because public values are baked in at build time
(`docs/ENV-VARS-SAFETY.md`, change procedure step 3). **Done 2026-08-25.**

### Gap 4 — 🟢 LOW · `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is not set anywhere — **still open**

**What is true today.** Unset in Vercel, and missing from the owner's local env file (all ten other names are
present there — confirmed by a names-only check; no agent opened the file). Only the enterprise discovery
form reads it, and it falls back to a hardcoded endpoint that passes its own format validation. **Zero
functional impact.**

**Worth setting anyway**, so deployed reality matches `docs/TECH-ARCHITECTURE.md` §6 and so Preview can be
pointed at a throwaway form.

**The isolation ceiling underneath it.** The contact form and the community form hardcode the same Formspree
endpoint with no environment indirection at all. **Preview submissions from those two forms cannot be
isolated from the owner's real inbox without a code change.** Recorded as an accepted, known non-isolation —
§6 C9.

---

## 4. The isolation plan — owner checklist · **PARTLY COMPLETE — the Supabase/Stripe *variable* steps done 2026-08-25; ~~Mailchimp (Steps 6–7) NOT done~~ Mailchimp (Steps 6–7) **CANCELLED 2026-08-27 by D-22**; both proof steps (3 and 11) NOT done**

> ### Status of this section
>
> *(Heading and this block corrected 2026-08-27, Sprint S1.6 — stage-gate Round 6 class: the earlier
> "**COMPLETED 2026-08-25, with three residuals**" heading and the "Steps 1–8 and 10 are done" line both
> wrongly counted the Mailchimp steps as done.)*
> The owner ran this checklist on **2026-08-25**. **Steps 1, 2, 4, 5, 8 and 10 are done** (Supabase
> variable split, Stripe sandbox entries, site URL, auth URL configuration, variable typing, automation
> bypass). **Step 3 is NOT done** — it is itself a proof step (redeploy the Preview and run §8 Proof 1),
> still open as residual 2. ~~**Steps 6–7 — the Mailchimp test audience and the Preview-scoped
> `MAILCHIMP_LIST_ID` — are NOT done** (one shared entry; Sprint **S2.2**).~~ → **Steps 6–7 are CANCELLED,
> not open — decision D-22, 2026-08-27:** the audience split will not be built at all, in this sprint or any
> later one. One live audience serves Production, Preview and local; the single shared entry is the intended
> end state (§2B rows 8–9), and §8 **P7 is N/A — accepted risk**. Step 9 was skipped by choice;
> **step 11 — the rest of the proofs — is not done either** (Sprint **S2.5**). So *both* proof steps in
> this checklist, 3 and 11, remain open. The checkboxes below are ticked against **dashboard state**, which
> is the weaker of the two kinds of evidence this document recognises.
>
> ~~**The three residuals, named so they cannot be lost:**~~ **One residual, plus two items closed on 2026-08-27 —
> one by work (residual 1, `staging`) and one by decision (residual 3, D-22) — all three kept below so nothing is lost:**
>
> 1. ~~**`staging` has no Vercel deployment** — the branch exists at the same commit as `master`, so Vercel never
>    built it and the sandbox Stripe endpoint has a 404 for a target. No Preview payment can complete until one
>    commit lands there. **Known issue 32**, Sprint S2.2.~~ **DONE 2026-08-27** — `staging` was fast-forwarded to
>    `a68f210` and Vercel built the alias, which now answers **302** (was 404). **Known issue 32 RESOLVED.** The
>    endpoint still returns 401 without the bypass query parameter, which the owner set the same day (proven by P6, S2.5).
> 2. **The Supabase/Stripe halves are configured but not proven by test** *(bounded 2026-08-27, S1.6 — the
>    Mailchimp half is not configured either; residual 3 — **and per D-22, 2026-08-27, it never will be: that
>    is a decision, not a debt**)*. Every claim in §2B rests on reading a dashboard. The
>    §8 proofs are the only thing that converts that into knowledge, and **none has been run** — Sprint
>    **S2.5** owns them. Do not let "the split is done" and "the split is verified" be spoken as one sentence.
> 3. ~~**The Mailchimp audience is not split**~~ **The Mailchimp audience is not split — and will not be
>    (D-22, 2026-08-27). This is no longer a residual; it is a closed decision.** (§2B row 9 — corrected
>    2026-08-26, Round 4 Finding 1:
>    ~~an entry exists in the Preview scope~~ the owner's dashboard screenshot shows **one shared entry**
>    scoped Production and Preview; no Preview-scoped entry exists — which is now the *correct* state.)
>    ~~The split is Step 6 below (Sprint **S2.2**); the proof is §8 **P7** (S2.5).~~ → **Step 6 is cancelled,
>    §8 P7 is N/A — accepted risk.** What replaces them: the **five test rules at §6 C8**, and an **S5.1
>    feature-list obligation** to record the manual-verification half (the multi-day journeys the owner
>    confirms in his own inbox).
>
> Anything below marked `[x]` may be re-opened by a failing proof. A proof outranks a checkbox.

**Who does what.** Every step below is done by the **owner**, in the Vercel, Stripe, Supabase and Mailchimp
dashboards. Agents never handle or echo a value — `docs/ENV-VARS-SAFETY.md` and
`docs/SUPABASE-VERCEL-SETUP.md` A2. Paste values only into those dashboards: never into chat, a file, a PR,
or a screenshot.

**How Vercel works here.** A single Vercel variable entry cannot hold two different values. To give Preview a
different value from Production, **each name becomes two entries** — one scoped Production, one scoped
Preview. Mark every server-only entry **Sensitive**.

> ### ⚠ Do these in order. The order is the safety mechanism.
> Steps 1–3 (Supabase split) **must** complete and be verified before step 5 (Stripe webhook secret).
> Doing step 5 first switches on entitlement writes while Preview still points at the production database.

### Phase A — Isolate the database (closes Gap 1)

- [x] **Step 1 — Narrow the three existing Supabase entries to Production only.** ✅ **Done 2026-08-25.**
      For `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`:
      edit each existing entry so its scope is **Production only**. Leave the values untouched — they are
      already the `unretire-prod` values and stay that way.
- [x] **Step 2 — Add three new Preview-scoped entries with the same names**, holding the **`unretire-test`**
      (ref `dtdadtggahjsrmevwvbu`) values: project URL, publishable key, and secret key. All three must come
      from that one project — a mixed pair produces "invalid API key" failures that the webhook currently
      answers with a success code. ✅ **Done 2026-08-25** — three Supabase entries confirmed in the Preview
      scope.
- [ ] **Step 3 — Redeploy the Preview and prove the switch landed.** Run the §8 Proof 1 check. Do not proceed
      until a Preview deployment demonstrably resolves to the test project ref.
      🔶 **STILL OPEN — this is residual 2.** The variables are in place; nothing has confirmed a running
      Preview reads them. Sprint **S2.5**.

### Phase B — Isolate the money (closes Gap 2)

~~Stripe **test mode lives inside the same Stripe account**, toggled by the dashboard switch.~~
**Corrected 2026-08-25:** this project uses a **separate Stripe sandbox account** (`acct_1TsJbSFWySZWCfsj`),
not the test-mode toggle of the shared live account (`acct_1S8bOcF3LxwumsBI`). That is the stronger choice —
the live account is shared with other projects, so a separate account removes any possibility of a test object
touching live data. Objects never sync between accounts; everything below was created fresh in the sandbox.

- [x] **Step 4 — Create the test-mode objects in Stripe** (in the **sandbox account**): ✅ **Done 2026-08-25.**
  - [x] Product **"(Un)Retire Course"** with a **one-time** price of **$99 USD**. Must be one-time — the code
        opens a payment session for this product.
  - [x] Product **"(Un)Retire Premium"** with a **recurring, yearly** price of **$199 USD/year**. Must be
        recurring — the code opens a subscription session, and a one-time price errors at session creation.
  - [x] A **test-mode secret API key**.
  - [x] A **test-mode webhook endpoint** pointing at the Preview **branch alias**
        (`[PREVIEW_URL]/api/stripe/webhook` — use the stable branch alias, never a one-off deployment URL;
        see §6 C2). Subscribe it to exactly two events: **`checkout.session.completed`** and
        **`customer.subscription.deleted`** — the only two the handler acts on. If Preview protection stays
        on, append the automation-bypass query parameter (§6 C3), because Stripe cannot send custom headers.
        ✅ Created as `captivating-triumph` → `https://unretire-git-staging-86400-s-projects.vercel.app/api/stripe/webhook`,
        API version `2026-06-24.dahlia`. ~~⚠ **Target does not exist yet — 404** (Known issue 32, residual 1).~~ **Target live 2026-08-27** — the alias answers 302 (Known issue 32 RESOLVED); the bypass query parameter was set by the owner the same day (owner-reported; proven by P6, S2.5).
        Two things still to confirm on this endpoint once the target is live: that the bypass is appended as a
        **query parameter** (§6 C3), and that both event types are subscribed.
  - [ ] **Recommended:** a test-mode **promotion code / coupon** mirroring the live one. Promotion codes are
        mode-specific objects, and without one the $0-subscription path (100% off, no card collected) is
        never exercised. 🔶 **Not confirmed created.** A 100%-off **live** coupon exists for the launch payment
        test (Known issue 33); the sandbox mirror has not been evidenced. It matters more than it looks —
        see §6 **C14**, because the $0 path is the one the owner intends to use for real.
  - [x] Copy the endpoint's **signing secret** — it is different from the live one and from the local CLI one.
- [x] **Step 5 — Add four new Preview-scoped entries** (only after Phase A is verified):
      `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_COURSE`, `STRIPE_PRICE_PREMIUM` — all with
      the sandbox values from step 4. **Do not touch the existing Production entries.**
      ✅ **Done 2026-08-25** — four Stripe entries confirmed in the Preview scope, Production untouched.

### Phase C — Isolate the email audience

> ### ⛔ **PHASE CANCELLED 2026-08-27 — decision D-22. Cancelled, not deferred.**
>
> **The Mailchimp audience is not split. One live audience serves Production, Preview and local, and that is
> the permanent, approved end state.** Neither step below is owed to any sprint; both are kept, struck, so the
> history and the reasoning survive. **The accepted risk, stated plainly:** every Preview and local form
> submission writes a **real subscriber** into the **live** audience and can fire **real automations**; it
> inflates the contact-count billing tier and can affect sender reputation. The compensating controls are the
> **five test rules recorded at §6 C8** — read them before writing any email-capture spec.

- [x] ~~**Step 6 — Create a Mailchimp test audience** and add `MAILCHIMP_LIST_ID` as a **Preview-scoped** entry
      holding the test audience id; narrow the existing entry to **Production only**.
      Mirror the live audience's **merge fields** and **tag names** exactly — the field list to match is in
      §5.4, and a mismatch silently drops assessment data (§7 risk 8).~~
      ~~❌ **NOT DONE — corrected 2026-08-26 (stage-gate Round 4, Finding 1).**~~ ~~An earlier version of this
      step was ticked with "Two Mailchimp entries exist in the Preview scope" — that was FALSE.~~ ~~The
      owner's Vercel dashboard (screenshot, 2026-08-26) shows `MAILCHIMP_LIST_ID` and `MAILCHIMP_API_KEY`
      as **one shared entry each, scoped "Production and Preview"** — no Preview-scoped entry exists and no
      test audience is evidenced. This step is owned by Sprint **S2.2**; §8 **P7** plus the §5.4 diff prove
      it afterwards (S2.5).~~
      ⛔ **CANCELLED 2026-08-27 (D-22) — no test audience will be created, and no Preview-scoped
      `MAILCHIMP_LIST_ID` entry will exist.** The one shared entry each, scoped "Production and Preview", is
      **correct as it stands**. §8 **P7 → N/A (accepted risk)**; the §5.4 mirror task is moot (§5.4 explains
      why the field list itself still matters).
- [x] ~~**Step 7 — `MAILCHIMP_API_KEY` may stay shared** while the test audience lives in the same Mailchimp
      account (the key selects the account and data centre; the audience id selects the recipients). Split it
      too if a separate account is used. Currently one shared entry covering both scopes (verified
      2026-08-26) — acceptable **only once** Step 6 is genuinely done.~~
      ✅ **SETTLED 2026-08-27 (D-22): `MAILCHIMP_API_KEY` stays one shared entry, unconditionally.** The
      condition "only once Step 6 is genuinely done" is void, because Step 6 is cancelled. Nothing to do.

### Phase D — Close the URL and form gaps

- [x] **Step 8 — Add `NEXT_PUBLIC_SITE_URL` for the first time.** ✅ **Done 2026-08-25 — Production only.**
      ~~**Preview** = the branch alias URL~~ — **corrected:** Preview is deliberately **left unset**, because a
      single fixed value cannot be right for per-PR Preview hostnames and the code prefers request headers
      anyway (§2A row 10). **Production** = the origin that actually serves the site,
      `https://unretire.vercel.app` *(as of 2026-08-25 — see the 2026-08-27 update below)* — ~~`https://unretireproject.com`, which is the target only once DNS moves~~
      ~~off GoDaddy (D-2 / Known issue 27)~~ *(DNS moved 2026-08-27 — see the update below)*. `docs/LAUNCH-CHECKLIST.md` Phase 2 already carries the "update the
      site-URL env var in Production, then redeploy" line; that line now describes a **change** of value, not a
      first setting. ~~⚠ Remove the stored trailing slash (Known issue 35).~~ **Updated 2026-08-27** (owner-reported, OWNER-ACTIONS Part 4B L1 + L4 redeploy): DNS moved and the value is now `https://www.unretireproject.com` — the `www` host, no trailing slash, confirmed by the served `og:url` (D-2 amended: canonical = `www`, apex redirects). Known issues 27 and 35 RESOLVED.
- [ ] **Step 9 — Optional: add `NEXT_PUBLIC_FORMSPREE_ENDPOINT`** in both scopes — a throwaway form for
      Preview, the real endpoint for Production. Note the ceiling in §6 C9: two of the three forms are
      hardcoded and cannot be isolated this way. 🟢 **Not done — deliberately deferred**, zero functional
      impact (Known issue 20, §3 Gap 4).
- [x] **Step 9a — Enable Protection Bypass for Automation** and store its secret as
      `VERCEL_AUTOMATION_BYPASS_SECRET` in the **Preview** scope. ✅ **Done 2026-08-25.** Deployment Protection
      itself stays **on**, which is correct. The remaining unknown is whether the Playwright configuration
      actually presents the bypass — Sprint **S2.3** (Known issue 25, reworded).

### Phase E — Make it real

- [x] **Step 10 — Redeploy both environments.** Environment changes do not reach deployments that already
      exist, and public (`NEXT_PUBLIC_*`) values are compiled into the build. This is
      `docs/ENV-VARS-SAFETY.md` change-procedure step 3 and `docs/SUPABASE-VERCEL-SETUP.md` A2, and it is the
      single most commonly skipped step in this whole document.
      ✅ Production verified serving at `https://unretire.vercel.app` on 2026-08-25; re-verified serving at `https://www.unretireproject.com` on 2026-08-27 after the Part 4B redeploy (served `og:url` = the `www` host, no trailing slash). **Preview redeploy is not
      independently evidenced** — which is exactly what §8 P1 exists to catch, so treat step 3 as the gate.
- [ ] **Step 11 — Run every proof in §8 and record the results.** No test suite runs before §8 is green.
      🔴 **NOT DONE — zero of thirteen proofs recorded.** This is residual 2 and the single most important open
      item in this document. Sprint **S2.5**.

### After Phase E — the end state, in one table

**The Database and Money columns were configured 2026-08-25; ~~the Email column is NOT yet configured~~
the Email column is *deliberately* not isolated — one live audience in all three environments (D-22,
2026-08-27)**
*(corrected 2026-08-27, stage-gate Round 6 Finding 1 — ~~an earlier heading stamped the whole table
"Configured 2026-08-25"~~, wrongly covering the nonexistent test audience; **amended 2026-08-27 for D-22 —
the test audience is not "nonexistent yet", it is cancelled**)*. The "proven by" column is
what turns each cell from a claim into a fact; every one of them is still outstanding — **except the Email
cells, which are settled by decision and prove nothing by test (§8 P7 is N/A)**.

| Scope | Database | Money | Email | Inbox | Proven by |
|---|---|---|---|---|---|
| **Local** | `unretire-test` | Stripe sandbox + local CLI listener | ~~test audience~~ ~~**live audience today** — no test audience exists yet (S2.2 creates it); local form tests hit the live list until then~~ **live audience — permanently (D-22, 2026-08-27)**; local form tests hit the live list, which is the accepted posture under the five rules at §6 C8 | shared Formspree (accepted) | developer's own run |
| **Preview** | `unretire-test` ✅ configured | Stripe **sandbox** ✅ configured — ~~delivery blocked by Known issue 32~~ *(Known issue 32 RESOLVED 2026-08-27; delivery unrun until §8 P4–P6, S2.5)* | ~~test audience 🟡 unproven~~ ~~**one shared LIVE audience — 🔴 NOT SPLIT** (no Preview-scoped `MAILCHIMP_LIST_ID` exists; Preview form testing prohibited until S2.2 splits it; §8 P7 then proves the completed split)~~ **one shared LIVE audience — ✅ ACCEPTED POSTURE (D-22, 2026-08-27)**: no Preview-scoped `MAILCHIMP_LIST_ID` will ever exist, Preview email-capture testing **is permitted** under the §6 C8 rules, and §8 P7 is **N/A — accepted risk** | shared Formspree (accepted) | §8 P1, P2, P4, P5, ~~P7~~ *(P7 N/A — D-22)* |
| **Production** | `unretire-prod` | Stripe live mode | live audience — **the same one Preview and local write to (D-22)** | real Formspree | §8 P10, P13 + the launch smoke (§7) |

---

## 5. The fidelity plan

The **Supabase and Stripe** halves of isolation are **configured** (§4) — the Mailchimp half is not, and no
§8 proof has run *(bounded 2026-08-27, S1.6; **amended 2026-08-27 — under D-22 the Mailchimp half is not
merely unbuilt but cancelled, so "the Mailchimp half is not configured" is a permanent statement, not a
to-do**)*. This section is the other half: making `unretire-test` a true structural
twin of `unretire-prod`, and keeping it one. Note the ordering trap — the test project now *receives* Preview
traffic, but nothing below has been done to it yet, so it is currently an isolated database of **unknown
shape**. Isolation without fidelity is the failure mode described in §1: a suite that passes against a
sandbox and proves nothing about production.

### 5.1 Capture the production schema before building anything

**The single highest-risk item in the project:** the `entitlements` table — the table that records who has
paid for what — **has no SQL anywhere in the repository.** Its definition exists only inside the production
database, created by hand at an unrecorded time. It is unversioned, unreviewed, and currently unknown.
`docs/TECH-ARCHITECTURE.md` §4 already flags this as unverified. Sprint **S4.3** owns capturing the `entitlements` schema/RLS permanently; Sprint **S2.5** owns proving parity between `unretire-test` and `unretire-prod` before any suite runs — whichever lands first must not assume the other has.

**Do not hand-rebuild it in the test project.** A hand-rebuild will differ, and the difference is invisible
until a customer pays.

- [ ] **Capture the real definition read-only** — via the approved Supabase MCP Profile B connection
      (D-11: `read_only=true`, feature groups `database,debugging,docs`, per `docs/SUPABASE-MCP-SAFETY.md`),
      or a schema-only dump, or the dashboard's table and policy views.
- [ ] **Commit the captured DDL** into the repo (alongside the existing `book_downloads.sql`, or in a
      `supabase/` migrations folder) so it is version-controlled and reviewable.
- [ ] **Build `unretire-test` from that committed file** — never from a fresh hand-written guess.

**Use this list to *verify* the captured definition, not to replace it.** These are the properties the code
depends on:

| Property | Why it matters |
|---|---|
| `user_id` referencing the auth users table, cascade on delete | Links access to the account |
| `product` limited to `course` and `premium` | The two things sold |
| `status` values `active` and **`canceled`** (American spelling) | A constraint spelled `cancelled` would break cancellation |
| Stripe customer id and subscription id, both **nullable** | The webhook explicitly writes null when Stripe omits them |
| An index on the subscription id | It is the lookup key when a subscription is cancelled |
| **A UNIQUE constraint on (user_id, product) — MANDATORY** | The webhook's "insert or update" depends on it. Without it, Postgres raises an error *which the code currently swallows and answers with success* (§7 risk 1) — the customer pays, gets nothing, and Stripe never retries |
| **RLS enabled, with a read policy restricting each user to their own rows** | RLS on with *no* read policy makes every paying customer look unentitled. RLS off in one project means the test proves nothing about the other |
| **No user-facing write policy** | All writes come from the service-role webhook client, which bypasses RLS. A write policy present in one project and not the other is a security-parity break |
| Table grants | These differ depending on whether the table was made in the SQL editor or the table editor; a dump captures them, a hand-rebuild does not |

### 5.2 Reconcile `book_downloads`

`src/app/account/_book/book_downloads.sql` is committed, but its own header says to run it in the SQL editor
— meaning production may have drifted from it.

- [ ] Diff production against the committed file, then apply the **verified** file to the test project.
- [ ] Confirm all of: the unique constraint on (user, document type) — this is what actually enforces
      "one download, once"; the document-type check constraint; RLS enabled; exactly two policies (read and
      insert, both own-row-only); and deliberately **no** update or delete policy. Preserve that absence.

### 5.3 Triggers, functions, extensions, and auth settings

- [ ] **Inspect production for triggers** even though the code references none — a "create a profile row on
      new user" trigger is the most common Supabase pattern. If production has one and test does not, signup
      passes in test and fails in production with an opaque database error. Confirm UUID generation and any
      timestamp triggers too.
- [ ] **Build a written Auth-settings parity table**, evidenced from both dashboards. These live in the
      dashboard, not in SQL, so a schema dump will not catch them, and every one changes observable
      behaviour:

| Setting | Why it must match, and what differs if it does not |
|---|---|
| **Site URL** and the **redirect allow-list** | Test = the Vercel Preview wildcard plus localhost (as configured 2026-08-25; no branch alias is listed, and none is needed because the wildcard covers every Preview); Production = the origin that actually serves the site, ~~**`https://unretire.vercel.app`** (changing to `https://unretireproject.com` when DNS moves — D-2 / Known issue 27)~~ **`https://www.unretireproject.com`** since 2026-08-27 (DNS moved; D-2 amended — canonical = `www`, apex redirects; Known issue 27 RESOLVED). If a redirect target is not on the list, Supabase **silently falls back to the Site URL**, and confirmation and reset links land on the wrong host — a failure that looks like a broken app rather than a config gap. This is `docs/SUPABASE-VERCEL-SETUP.md` B3, applied per project. ~~⚠ **Currently unconfigured in both projects and actively breaking Production**~~ → ✅ **`unretire-prod` CONFIGURED 2026-08-25** (Site URL + five allow-list entries; Known issue 23's configuration half is closed; Site URL moved to `https://www.unretireproject.com` on 2026-08-27, owner-reported, allow-list unchanged). ✅ **`unretire-test` CONFIGURED 2026-08-25** — Site URL `http://localhost:3000`, allow-list `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`. ~~Previously logged as unevidenced.~~** Concrete entries and click-path in §5.3a; **and read §5.3b — a correct allow-list here does not make the app's own `next` handling safe.** |
| **"Confirm email" ON/OFF** | **The single most behaviour-changing toggle in the project.** With it OFF, signup returns a live session and goes straight to checkout. With it ON, signup returns "please confirm your email" and no purchase starts. A suite built against the wrong setting exercises a flow production does not have. |
| **Enumeration protection** | Determines which of two code branches handles a duplicate-email signup. Both branches exist; only one is live per setting. |
| **Minimum password length** and **leaked-password protection** | A fixture password that passes in test can be rejected in production. |
| **Email templates** (confirm signup, reset password) | Which template variable is used decides which half of the confirmation route runs. The route handles both, but only the configured one is ever exercised. Copy the templates across. |
| **Token and session expiry, refresh-token rotation** | Govern session refresh and any long-running test. |
| **Enabled providers** | Confirm email/password only, and that production has no extra provider the test project lacks. |
| **SMTP** | Production should use a real SMTP provider; the built-in mailer is not for production. See §6 C7. |

### 5.3a Auth URL configuration — the Site URL and the redirect allow-list

> ✅ **RESOLVED for `unretire-prod` on 2026-08-25 — this subsection is now the record of how, plus what is
> still outstanding.**
>
> ~~⚠ **This subsection documents a live production defect, not a future task.** Verified 2026-08-25 against
> the owner's Supabase **URL Configuration** screen for `unretire-prod`: **Site URL = `http://localhost:3000`**
> and **Redirect URLs = none** ("No Redirect URLs").~~ *(the state this subsection was written against —
> kept because it is the reason every rule below exists)*
>
> **Verified state, `unretire-prod` (verified 2026-08-25; Site URL updated 2026-08-27):**
> **Site URL** ~~`https://unretire.vercel.app`~~ **`https://www.unretireproject.com`** *(2026-08-27, owner-reported — OWNER-ACTIONS Part 4B L2)* · **Redirect URLs** *(unchanged 2026-08-27)* `http://localhost:3000/**`,
> `https://www.unretireproject.com/**`, `https://unretireproject.com/**`, `https://unretire.vercel.app/**`,
> `https://*-86400-s-projects.vercel.app/**`.
> Production auth email links now resolve to a host that exists. **Known issue 23's configuration half is
> closed**; the two legacy hosts that used to sit on this list (`half-a-life.vercel.app/**` and the old
> `*-86400websites.vercel.app/**` scope) are **gone — Known issue 28 is RESOLVED**.
>
> **Three things are still outstanding, and none of them is small:**
> 1. ~~**`unretire-test` URL configuration is unevidenced.**~~ **RESOLVED 2026-08-25** — `unretire-test` **is configured** (verified 2026-08-25 from the owner's dashboard): Site URL `http://localhost:3000`, allow-list `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`. What remains unproven is not the setting but the behaviour: no Preview signup has yet been observed
> returning its confirmation link to the Preview origin (verification **P3**, owed by S2.5). Superseded text:
> ~~Until it is set, Preview auth links fall back to~~
>    whatever that project's Site URL happens to be, and §8 **P3** cannot pass.
> 2. **Two entries on the production list contradict the "Must NOT contain" rule below** — `localhost:3000/**`
>    and the Preview wildcard `*-86400-s-projects.vercel.app/**`. Every allow-listed host can receive an auth
>    redirect carrying a session token, so a Preview deployment can currently be handed a **production**
>    session. This is deliberate for now (it is what keeps local development and Preview auth working while the
>    test project is configured as of 2026-08-25) and it is **lower severity than the legacy hosts were** — both are hosts this
>    project controls — but it is real, dated, and must be tightened once `unretire-test` carries Preview auth
>    and DNS has moved *(DNS moved 2026-08-27 — the remaining precondition is Preview auth on `unretire-test`; both entries still present as of 2026-08-27)*. Logged as **hygiene follow-up**, not as done.
> 3. **Password reset is still broken end to end** for the second, independent reason below (Known issue 2).

**Why this belongs in a document about environment parity.** The Site URL and the redirect allow-list are
**per-Supabase-project dashboard settings**. They are not environment variables, Vercel does not know they
exist, and nothing in the §4 checklist touches them — so an environment can be perfectly split at the
variable level and still send its users to the wrong host. They are the **third leg** of isolation:

> same code · **different env values per environment** · **different auth URL configuration per Supabase project**

Miss the third leg and the first two do not save you. This is the same shape as every other row in §5: the
*data* must differ between test and prod, the *definition* must be deliberate in each.

The rule these settings enforce is already stated in `docs/TECH-ARCHITECTURE.md` §5 — *"Auth links generated
from a Preview return to that Preview, never silently to Production"* — and the per-project wiring pattern is
already in `docs/SUPABASE-VERCEL-SETUP.md` B3. Neither is restated here. This subsection is only **how it is
actually configured on this project, and what is wrong with it today.**

#### How the mechanism works — three steps, and the failure is silent

1. **The app asks for the right URL.** `getOrigin()` in `src/app/auth/actions.ts:19-26` derives the origin
   from the real `x-forwarded-host` / `host` request headers, so signup
   (`src/app/auth/actions.ts:110` — `emailRedirectTo: ${origin}/auth/confirm`) and password reset
   (`:185` — `redirectTo: ${origin}/auth/confirm?next=…`) hand Supabase the origin of the deployment the user
   is genuinely on: ~~`https://unretire.vercel.app`~~ `https://www.unretireproject.com` (since 2026-08-27) in Production today, that deployment's own URL on a Preview.
   **The application code is correct *about the origin*. It is not what caused the outage described here.**
   ⚠ That is a narrower statement than this document used to make — the same code path's handling of the
   `next` parameter **is** defective, independently. See **§5.3b**.
2. **Supabase checks that requested URL against the project's redirect allow-list.**
3. **If it does not match, Supabase silently substitutes the Site URL.** No error is returned to the app, no
   entry appears in any log, and the user simply receives an email pointing somewhere else.

**Therefore, until 2026-08-25:** the requested target never matched (the list was empty), so every production
auth email link was rewritten to `http://localhost:3000` — a machine that does not exist for the recipient. A
new customer could not confirm their email address; an existing member could not reset their password.
**Since the allow-list was configured, the requested target matches and links resolve to the real host.**

> ### ⚠ CORRECTION 2026-08-25 — the paragraph this replaces was wrong
>
> ~~✅ **This is not an open-redirect vulnerability, and it must not be described as one.**~~
> ~~`src/app/auth/confirm/route.ts:20-21` accepts the `next` parameter only when it starts with `/`, and~~
> ~~otherwise forces `/account` — so the redirect target is constrained to same-origin relative paths. The~~
> ~~security control is present and correct. What is missing is configuration.~~
>
> **That claim is false and is retracted.** It was reproduced and disproved during the 2026-08-25 independent
> review. `startsWith("/")` does **not** constrain a target to a same-origin relative path: it also admits
> **protocol-relative** URLs. `new URL("//evil.example", request.url)` resolves to `https://evil.example/`,
> and `/\evil.example` escapes the origin too. **This is an open redirect.** It is tracked as its own defect
> (**Known issue 38**) and explained in **§5.3b**.
>
> The correction is left visible rather than deleted because the wrong sentence was repeated into
> `docs/PROJECT-STATUS.md` (Known issue 23) and `docs/TECH-ARCHITECTURE.md`, and anyone who read it there
> needs to encounter the retraction, not a silent edit.

⚠ **Password reset is broken twice over, for two independent reasons.** Even once the allow-list is
configured, `src/app/auth/actions.ts:185` still sends `next=/unretire/reset-password` — a stale pre-refactor
path that 404s (**Known issue 2**, fixed in Sprint **S3.1**). **S2.2 and S3.1 must both land** before password
reset works end to end. Fixing either one alone changes nothing the user can see.

#### The concrete entries — what goes in each project

Two projects, two different sets. Neither list may contain the other's hosts; that separation *is* the
isolation, exactly as it is for the variables in §2.

| | **`unretire-prod`** (ref `hcjivvlwxltyiycfbttc`) | **`unretire-test`** (ref `dtdadtggahjsrmevwvbu`) |
|---|---|---|
| **Site URL — target** | ~~`https://unretireproject.com` *once DNS moves*; **`https://unretire.vercel.app`** until then~~ **`https://www.unretireproject.com`** — target reached 2026-08-27 (DNS moved; D-2 amended: canonical = `www`, the apex 308-redirects to it) | the stable Vercel **branch alias** for Preview — `[PREVIEW_BRANCH_ALIAS_URL]` (never a one-off per-deployment URL; see §6 C2) |
| **Site URL — actual, 2026-08-25** | ✅ **`https://unretire.vercel.app`** — correct on that date *(superseded 2026-08-27 — next row)* | ✅ **`http://localhost:3000`**, with `localhost:3000/**` and `*-86400-s-projects.vercel.app/**` allow-listed — correct for a test project whose only clients are local dev and Preview |
| **Site URL — actual, 2026-08-27** | ✅ **`https://www.unretireproject.com`** — owner-reported (OWNER-ACTIONS Part 4B L2); matches the origin that now serves Production (Confirmed facts table) | *(unchanged)* `http://localhost:3000` |
| **Redirect URLs — target** | `https://www.unretireproject.com/**` (canonical since 2026-08-27) and `https://unretireproject.com/**` (the redirecting apex) | `http://localhost:3000/**` |
| | *(add `https://www.unretireproject.com/**` **only if** the `www` host actually serves the app rather than redirecting to the apex)* — **condition SATISFIED 2026-08-27:** the `www` host serves the app (HTTP 200) and the apex 308-redirects *to* `www`, so `https://www.unretireproject.com/**` is required — and it is present (on the list since 2026-08-25) | `[PREVIEW_BRANCH_ALIAS_URL]/**` |
| | | `https://[VERCEL_PROJECT_NAME]-*.vercel.app/**` — **the Vercel preview wildcard**, and the entry that makes per-PR Previews work at all |
| **Redirect URLs — actual, 2026-08-25** | ✅ `https://unretire.vercel.app/**`, `https://unretireproject.com/**`, `https://www.unretireproject.com/**` — ~~the live host plus both future hosts~~ *(as of 2026-08-25; see the 2026-08-27 row)*, all correct. ⚠ **plus** `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`, which the row below says must not be here — see outstanding item 2 in the banner above | ✅ `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**` — verified 2026-08-25. Correct and minimal: a test project's only clients are local development and Preview deployments |
| **Redirect URLs — actual, 2026-08-27** | **Unchanged** (owner-reported, OWNER-ACTIONS Part 4B L2) — the same five entries. Read against the live domain: `https://www.unretireproject.com/**` is now the **live host**, `https://unretireproject.com/**` its redirecting apex, `https://unretire.vercel.app/**` the fallback alias; `http://localhost:3000/**` and the Preview wildcard remain the two hygiene entries (outstanding item 2 — DNS has moved, Preview auth on `unretire-test` has not) | *(unchanged)* |
| **Must NOT contain** | `localhost`, any `*.vercel.app` wildcard, any Preview host — **currently violated by two entries, knowingly and temporarily.** Every allow-listed host can be handed a session token, so each extra entry is real attack surface: tighten once `unretire-test` carries Preview auth and DNS has moved *(DNS moved 2026-08-27; entries unchanged as of that date)* | `https://www.unretireproject.com` or `https://unretireproject.com` — a Preview must never be able to bounce a user into Production |
| **No longer present** ✅ | ~~`https://half-a-life.vercel.app/**`~~ and ~~`https://*-86400websites.vercel.app/**`~~ — both removed; **Known issue 28 RESOLVED 2026-08-25** | — |

**Reading `[VERCEL_PROJECT_NAME]`:** it is the first segment of any existing Preview URL — the part before
the first `-` in `something-git-branch-team.vercel.app`. Vercel mints a new hostname for **every** push
(`…-git-<branch>-<team>.vercel.app` for the branch alias, `…-<hash>-<team>.vercel.app` for one-off
deployments), which is precisely why a wildcard is required and why pinning single URLs will break on the
next push.

**Four details that quietly cost an afternoon:**

- **Use the `/**` suffix, not a bare path.** `*` matches any characters *except* `/`; `**` matches everything
  including `/` and `?`. The password-reset link is `…/auth/confirm?next=…`, so an entry pinned to the bare
  path can fail to match the query string and fall straight back to the Site URL.
- **The Site URL is the fallback, so make it a real host.** It is what users get whenever a match fails —
  which is exactly why a leftover `http://localhost:3000` turns a small config gap into a total outage.
- **No redeploy is needed.** Unlike a Vercel environment variable (§6 C11), a Supabase dashboard setting takes
  effect immediately for emails sent from that moment on. Emails already sent keep their old, broken links.
- **Do this in the production project first.** It is the only one of the two that is currently harming real
  people.

#### Owner steps — do this once per project

Do the whole list for `unretire-prod` first, then repeat it for `unretire-test`.

1. Go to the Supabase dashboard and open the project (start with **`unretire-prod`**).
2. In the left sidebar, click **Authentication**.
3. Click **URL Configuration**.
4. In the **Site URL** box, replace whatever is there with the Site URL from the table above for this project.
5. Under **Redirect URLs**, click **Add URL**.
6. Type one entry from the table above for this project, then confirm it.
7. Repeat steps 5 and 6 until every entry listed for this project is on the screen.
8. Click **Save changes**.
9. Read the list back on screen and check each entry against the table — a typo here fails silently.
10. Repeat steps 1 to 9 for the project **`unretire-test`**.
11. Tell the agent it is done, so proof **P3** and **P13** in §8 can be recorded.

*Nothing on this screen is a secret. Project URLs and refs are public identifiers, so it is safe to
screenshot this page. Never screenshot the **API Keys** page.*

**Status of this click-path, 2026-08-25:** completed for **`unretire-prod`** (that is how the entries recorded
above got there). ~~**Not yet completed for `unretire-test`**~~ — **completed 2026-08-25**: that project now has Site URL `http://localhost:3000` with `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**` allow-listed. Both projects are done; what remains is the behavioural proof **P3**, not the setting
before §8 P3 or P13 can be recorded.

### 5.3b Auth redirect safety — the allow-list is not the whole control

> **One sentence:** *the identity provider's allow-list is now correct, and the application's own redirect
> handling is not — those are two different controls, and the first does not compensate for the second.*

This note exists because §5.3a is easy to misread as "auth redirects are now safe." They are not, and the
distinction is worth being precise about, because the two controls guard different doors:

| Control | Where it lives | Guards | Status |
|---|---|---|---|
| **The Supabase redirect allow-list** | `unretire-prod` dashboard (§5.3a) | Where **Supabase** is willing to send a user *after authenticating them* — i.e. which host receives the emailed confirmation or reset link, and with it a session | ✅ Configured 2026-08-25 (with the hygiene caveat above) |
| **The app's own `next` handling** | `src/app/auth/confirm/route.ts` | Where **the application** sends the user *after it has consumed that link*, using a value taken straight from the query string | 🔴 **Defective — Known issue 38** |

**Why the first cannot cover for the second.** Supabase's allow-list is consulted once, when the link is
generated, and it only constrains the **host of the link itself**. Once the user clicks that link and lands on
an allow-listed host, the app takes over and performs its own redirect based on the `next` query parameter.
Supabase has no visibility into that second hop and no ability to constrain it. An attacker does not need to
get a hostile host onto the allow-list — they only need a legitimate, allow-listed link that carries a hostile
`next`.

**The defect, stated exactly.** The guard accepts any `next` beginning with `/`. That check does not mean
"relative path": `//evil.example` and `/\evil.example` both begin with `/`, and both resolve against the
deployment's origin to an **external** host — reproduced independently on 2026-08-25. A user who clicks a
genuine (Un)Retire confirmation link can be delivered to an attacker's page, having just authenticated, with
this site's domain as the referrer. That is an open redirect, and it is the standard shape of a
credential-phishing chain.

**What this section deliberately does *not* do:** propose the fix. That is a code change, it belongs to the
fix-and-improve sprint that precedes testing activation, and Known issue **38** carries it. What matters here,
in an environment-parity document, is that **this defect is environment-independent** — it is identical in
Local, Preview and Production, so no amount of environment splitting affects it, no §8 proof detects it, and a
fully green Preview suite would say nothing about it whatsoever. It is exactly the class of problem that a
parity document is prone to hiding, which is why it is written down here.

### 5.4 Mailchimp field parity — ~~a setup task~~ **moot as a parity task (D-22, 2026-08-27); the field list survives as the assertion contract**

> **Why this subsection changed.** *Parity* here only ever meant "make the test audience match the live one".
> **Under decision D-22 there is no test audience and there will not be one** — one live audience serves
> Production, Preview and local — so **there is nothing to mirror and nothing to diff.** The task is struck.
> **The field and tag list itself is not struck**, because it is now doing a different job: it is the
> **contract Playwright asserts** against the live audience (D-22 rule 2d — the spec checks that the contact
> exists with the right tag and merge fields and that `/api/subscribe` behaved correctly). Same list, different
> purpose.

~~Mirror into the test audience, and assert as part of setup:~~ **The contract to assert (unchanged list):**
merge fields `FNAME`, `WEAKEST`, `WEAKLOW`,
`BRIGHTEST`, `SCORE`, and the eight spoke scores `S_PASSION`, `S_HEALTH`, `S_RELAT`, `S_GROWTH`, `S_SPIRIT`,
`S_FUN`, `S_MONEY`, `S_CONTRIB`; tags `starter-plan`, `wheel-of-life`, and whichever tag each gated download
passes. ~~Diff the two audiences' field and tag lists — a field present in test but missing in live silently
drops assessment data.~~ → **there are no "two audiences" to diff (D-22).** The failure this diff existed to
catch — assessment data silently dropped on an unknown merge field — is instead caught by asserting the fields
above **on the live audience** in the email-capture spec, which every such spec must then tear down (§6 **C8**,
rules 1, 2b and 2c).

### 5.5 Seed data — the fixtures the suite needs

Create these in `unretire-test` only, with obviously-fake names and addresses, per
`docs/testing-setup/SETUP-CHECKLIST.md` Part 2. Record the emails (never passwords) in `docs/FEATURE-LIST.md`
when it is generated. **Create at least one of them through a real test-mode purchase**, so the payment path
itself is proven rather than simulated.

> **Status 2026-08-28 (Sprint S2.3):** the **accounts** for fixtures 2, 3 and 4 exist in `unretire-test` only —
> `thefalafeltheory+ur-e2e-signed-in@gmail.com` (signed-in, no entitlement), `thefalafeltheory+ur-e2e-course@gmail.com` (course), `thefalafeltheory+ur-e2e-premium@gmail.com` (premium) — created through the `supabase-test`
> MCP (SQL into `auth.users` + `auth.identities`, email-confirmed, bcrypt via pgcrypto; verified: the stored hash
> validates the fixture password, one `email` identity each). They carry **no entitlement rows yet** — `public` is
> still empty until S2.5 replicates the schema, and §5.5's "at least one through a real test-mode purchase" is
> S2.5's. **P1 negative control run the same day:** a read-only count of those three addresses in `unretire-prod`
> via `supabase-prod-readonly` returned **0**, so a successful Preview sign-in can only mean the test project.

| # | Fixture | What it proves |
|---|---|---|
| 1 | No account at all | Anonymous denial on every gated surface |
| 2 | Account, no entitlement | Signed in but locked out; checkout can start |
| 3 | Course entitlement, active | Course unlocked, Premium still locked, book download refused |
| 4 | Premium entitlement, active | Both unlocked — proves "premium includes course" |
| 5 | Premium **with an existing download record** | Proves the one-time download refusal |
| 6 | Entitlement with status `canceled` | Proves revocation actually denies access |
| 7 | An account that already owns the product | Proves checkout skips Stripe and sends them to the content |

### 5.6 Keeping the two in sync from now on

From the moment the test project is built, **the two projects only diverge through a numbered migration**.
The workflow is already defined — `docs/SUPABASE-VERCEL-SETUP.md` B5 and
`docs/templates/SUPABASE-CHANGE-TEMPLATE.md` — and applies here without amendment:

1. Every schema or policy change ships as **numbered up-SQL + a paired down-SQL + its RLS policies, in the
   same PR** as the code that needs it.
2. Applied **TEST first**, verified per role by a read-only check (the table exists, the policy list matches,
   an unauthorized role is refused), **then owner approval, then PROD by a human**. Never PROD first, and no
   agent writes to production through any channel.
3. The change record in the template is filled — classification, data impact, recovery source, the security
   checklist, and the applied/verified dates for both environments.
4. The migration number and its verified dates are recorded in `docs/PROJECT-STATUS.md`.

**Add one standing item:** a **prod-vs-test schema and policy diff** on the launch checklist and before every
Launch Gate run. The committed SQL is the intent; the diff is the proof that both databases still match it.

---

### The `staging` branch — what it is, and its lifecycle *(added 2026-08-27, owner question)*

`staging` is **not a feature branch and not a release branch.** It exists for exactly one reason: Vercel gives every
branch a **stable alias** (`https://unretire-git-staging-86400-s-projects.vercel.app`), and the Stripe **Sandbox**
webhook `captivating-triumph` needs an address that never changes. A per-PR Preview URL is different on every push
(§6 **C2**), so it cannot be a webhook target. `staging` is that fixed address.

| Question | Answer |
|---|---|
| Keep it? | **Yes — permanently.** Deleting it destroys the alias and the Sandbox webhook loses its target. |
| Merge `staging` **into** `master`? | **Never.** It holds nothing `master` does not; it is a deployment target, not a source of work. Nothing is ever developed on it. |
| Merge `master` **into** `staging`? | **Yes, periodically — always as a fast-forward**, so `staging` mirrors `master` exactly (`git push origin origin/master:staging`). Done 2026-08-27 (`0983ad5` → `a68f210`, 86 commits). |
| When must it be refreshed? | Before **any** Sandbox payment test (S2.5, S5.1) and before **launch** — otherwise a payment test exercises stale code and proves nothing about what is live. Refresh it whenever `master` has moved and a test is about to run. |
| Which environment values does it use? | Vercel treats every non-Production branch as **Preview**, so the `staging` deployment reads the **Preview** scope: the `unretire-test` Supabase project and Stripe **sandbox** keys/prices. That is the isolation working as designed. ⚠ It also reads the **shared** `MAILCHIMP_LIST_ID` — the live audience — which is the accepted risk recorded as **D-22**. |
| Is it protected? | No, and it does not need to be. The `master` ruleset targets the **default branch only**, so `staging` takes a direct fast-forward push with no PR and no review. |
| Does it need its own review chain? | No. It never contains unreviewed work — it only ever mirrors an already-merged `master`. |

**Do not** point the **live** Stripe webhook at `staging`; that mistake existed once (destination `engaging-voyage`)
and was deleted 2026-08-25 (Known issue 30). Live money goes to `https://www.unretireproject.com/api/stripe/webhook`.

## 6. What cannot be made identical

Honest list. Each gap is permanent, and each has a compensating check that covers it another way.

| # | Irreducible gap | Why it cannot be closed | Compensating check |
|---|---|---|---|
| **C1** | **Stripe sandbox vs live account** | Separate accounts, separate object namespaces, separate keys, separate signing secrets. Test cards never reach a bank; live mode has 3-D Secure, fraud rules, and real declines. | Run both products through full sandbox checkout **including a decline card and a 3-D Secure card**. Then, before launch, **one real live purchase**, refunded afterwards — and confirm in the **live** Stripe dashboard that the endpoint logged a success, and that the access record actually appeared in `unretire-prod`. ⚠ **Read C14 before choosing how to pay for that live purchase** — a 100%-off code makes this check far weaker than it looks. |
| **C2** | **The Preview web address changes on every push** | Each deployment gets a unique URL; a Stripe endpoint pinned to one dies on the next push. | Point the test-mode endpoint at the **stable branch alias**, not a deployment URL. Add a preflight step asserting the endpoint URL matches the deployment under test. And always assert **the access record exists**, never merely that the browser redirected — only the record proves the confirmation arrived. |
| **C3** | **Preview sits behind Vercel's deployment password; Production does not** | Stripe's webhooks cannot send custom headers, so a protected Preview answers Stripe with a login page. | Enable **Protection Bypass for Automation** (`docs/testing-setup/SETUP-CHECKLIST.md` Part 3) and append the bypass as a **query parameter** on the webhook URL — verify in the dashboard, since a header-only bypass would force the local-CLI route instead. Prove it with an unauthenticated request that succeeds. Separately assert Production has **no** protection, so the open request path is covered too. **Status 2026-08-25:** protection remains **on** and the bypass secret **is provisioned** in the Preview scope; still unconfirmed are (a) ~~whether the Playwright config presents it (S2.3)~~ **the config presents it by name (S2.3, 2026-08-28); its end-to-end effect is proven by the first green `E2E — Preview` run — pending** and (b) whether the sandbox webhook URL carries it as a query parameter. Known issue 25, reworded — it no longer blocks all automated testing. |
| **C4** | **Different regions** — test is in ap-south-1 (Mumbai), production in eu-west-1 (Ireland) | Fixed at project creation; cannot be changed. | **Correctness-neutral; timing only.** Test is further from the app's server region, so tests run *slower* than production — the conservative direction. Record the typical round-trip in both. Treat any test that only passes after a timeout is lengthened as a **defect, not a tuning problem**. Data-residency note: keep only synthetic personal data in the Mumbai project. |
| **C5** | **Free tier vs Pro tier** | `unretire-test` is on the free tier: it auto-pauses after about a week idle, has smaller compute and fewer connections, no point-in-time recovery, and tighter auth-email limits. | A **preflight health check** that pings the test project and fails loudly with "the test project is paused" rather than letting database errors masquerade as app bugs. Never load-test against it. **S2.3 (2026-08-28): the auth-setup helper turns a network-level sign-in failure into a message naming this row ("the free-tier test project may be paused"); a dedicated pre-run ping is still owed by S5.1.** |
| **C6** | **Domain and cookie behaviour** | Preview runs on a `vercel.app` subdomain; ~~Production is *intended* to run on `https://unretireproject.com` (D-2 resolved) but today runs on `https://unretire.vercel.app` (Known issue 27)~~ **2026-08-27: intended and actual are now the same host** — Production runs on `https://www.unretireproject.com` (D-2 amended to the `www` host; the apex 308-redirects to it; Known issue 27 RESOLVED). Cookie scope and secure-cookie prefixes behave differently — ~~and note that while both environments sit on `vercel.app`, this gap is **temporarily invisible**: it reappears the day DNS moves, which is the worst possible timing~~ the gap is **now real and visible** (since 2026-08-27 Preview sits on `vercel.app` and Production on the custom domain), so the compensating check is due. | After the domain is fixed, re-run the full auth smoke **on Production itself** — sign in, sign out, session survives a refresh, password reset *(the domain moved 2026-08-27 — this re-run is now due and has not been done; the auth-email landing on the `www` host is still unproven — §8 P3/P13, S2.5)*. `docs/LAUNCH-CHECKLIST.md` Phase 2 already carries the "add the new domain to the auth provider's redirect allow-list" line; keep it. |
| **C7** | **Email deliverability** | The test project's built-in mailer is a rate-limited sandbox with poor deliverability. Inbox placement cannot be proven from Preview. | (i) Match production's confirm-email setting so the suite exercises the right flow; (ii) obtain reset tokens through the admin API rather than an inbox; (iii) at launch, one manual real-inbox reset to both a Gmail and an Outlook address, **checking the spam folder** — which is the same discipline `docs/LAUNCH-CHECKLIST.md` Phase 3 already requires for form delivery. |
| **C8** | **Mailchimp has no test mode** | Only audience separation is possible, and a test audience cannot carry identical automated journeys unless they are rebuilt — and firing real journeys is exactly what isolation avoids. **Since D-22 (2026-08-27) even audience separation is off the table by decision: one live audience serves Production, Preview and local.** So the ceiling is now the floor — there is no isolation here at all, only controls. | ~~The suite asserts the **contract**: the endpoint reports success and the contact appears in the **test** audience with the right tag and fields. Separately **diff the field and tag lists** between the two audiences (§5.4). Verify the live journeys once, manually, with the owner's own address.~~ → **Rewritten 2026-08-27 (D-22).** The suite asserts the **contract** against the **live** audience: `/api/subscribe` behaved correctly and the contact appears with the right tag and merge fields (§5.4's list). ~~The two-audience diff~~ is moot. Multi-day journeys are still confirmed **manually, in the owner's own inbox**. Everything that keeps this survivable is in ~~**the five rules immediately below this table**~~ **D-22 rules 1 and 2a–2e (`docs/PROJECT-STATUS.md` §8)** — cited, not repeated, in the note immediately below this table *(2026-08-28)* — they are the compensating check. |
| **C9** | **Two of the three Formspree forms are hardcoded** | The contact and community forms have no environment indirection, so Preview submissions reach the owner's real inbox. | **Accepted, known non-isolation**, with the owner's sign-off. Mitigate by tagging test submissions with an obvious marker (for example a `[PREVIEW TEST]` prefix) so the owner can filter them; or make the endpoint environment-driven in a later sprint. |
| **C10** | **Abuse controls do not exist yet** (Known issue 5, decision D-9, Sprint S4.5) | When bot protection and rate limiting land, Preview will use test keys that always pass — so the bot check is never genuinely exercised in Preview. | One manual negative test on Production with the real widget, plus a server-side test of the verification-failure path. Note that `docs/TECH-ARCHITECTURE.md` §7 already requires these to fail **closed** in Production. |
| **C11** | **Public values are compiled into the build** | Preview and Production are separate builds with separately baked values. A dashboard change does **not** reach a deployment that already exists. | After changing any `NEXT_PUBLIC_*` value, **redeploy**, then assert the value **in the served page** (for example, read the rendered canonical/Open Graph tag) rather than trusting the dashboard. |
| **C12** | **Data volume and shape** | Production accumulates real users; test starts empty. Query behaviour and "row already exists" edge cases differ. | Seed the §5.5 fixtures, and keep a periodic read-only production sanity query through the approved Profile B connection after launch. |
| **C13** | **Runtime version drift** | Should be identical, but project settings can drift apart. | Pin the runtime version at the project level and confirm both environments report the same build image. |
| **C14** | **A $0 / 100%-off checkout is not a payment, and it is the only payment this project plans to make** | This is the largest and least obvious hole in the whole plan, so state it in full. A checkout completed with a 100%-off promotion code **does** exercise: session creation, the redirect to Stripe, `checkout.session.completed`, webhook signature verification, the metadata round-trip, the entitlement write, and the return to the site. It **does not** exercise **any** of: a real charge, card entry and tokenisation, 3-D Secure / SCA, issuer declines, authorisation and capture, currency and tax handling, receipts, refunds, disputes, or payout. And for **Premium** it is worse than for the Course: `src/lib/stripe/checkout.ts` sets `payment_method_collection: "if_required"`, so a $0 subscription completes **with no payment method attached at all** (Known issue 34) — meaning the subscription that exists afterwards is one that **cannot renew**, and the renewal path is therefore not merely untested but not even represented. | Treat "the coupon test passed" as proof of **wiring**, never of **payments**. Then, separately: (i) run the **sandbox** decline and 3-D Secure cards, which is where card behaviour can be exercised for free; (ii) make the live pre-launch purchase at a **real non-zero amount** — a temporary $1 price, paid with a real card and refunded — because only a non-zero charge touches the parts listed above; (iii) delete any $0 test subscription rather than leaving it to fail at renewal (Known issue 34); (iv) accept that **renewal itself can never be observed before launch** and cover it with the C15 account checks plus a calendared first-renewal watch. Compounded by **Known issue 39** — the code has no handling for failed renewals — so nothing would surface the failure anyway. |
| **C15** | **Stripe *account-level* readiness cannot be verified from this repository, from a test suite, or from any environment split** | Everything in §2 is about which credentials an environment holds. None of it says whether the **live account** is actually able to take and keep money. These are properties of the Stripe account and its onboarding state, they live behind the dashboard, and they are invisible to every test that can be written here — a checkout can succeed while payouts are frozen. The live account is also **shared with other projects**, so its state can be changed by work that has nothing to do with (Un)Retire. | A manual, dated, pre-launch dashboard check by the **owner**, recorded like a proof: **`charges_enabled` = true**; **`payouts_enabled` = true**; **`requirements.currently_due` is empty** (anything listed here is a deadline that will disable the account when it passes, and Stripe emails about it are easy to miss); a **bank account / payout destination is attached and verified**, with the payout schedule and currency as intended; and business/tax details complete. Re-check after any Stripe account change, and once more on launch day. Repeat the same check on the **sandbox** account only insofar as it affects test behaviour. |
| **C16** | **The live webhook endpoint's own configuration is not covered by any variable** | `STRIPE_WEBHOOK_SECRET` being present proves a secret exists — it says nothing about the endpoint's **URL**, its **subscribed events**, or its **API version**. All three have already been wrong on this project: the URL pointed at a parked domain (Known issue 29), a wrong-mode duplicate existed (issue 30), and the live and sandbox endpoints still run different API versions (issue 31, Low). A legacy endpoint on the shared account is also still Active (issue 26). | Read the live endpoint's URL, event list and API version off the dashboard as part of the launch check, and again after any Stripe change. Assert **both** `checkout.session.completed` and `customer.subscription.deleted` are subscribed — a missing second event loses cancellations silently, which is the same failure shape as issue 39. |

### The Mailchimp test rules — the compensating controls for C8 *(added 2026-08-27, decision **D-22**; the enumeration moved to its canonical home 2026-08-28)*

**D-22, in one line:** one live Mailchimp audience serves Production, Preview and local, so test submissions
write real subscribers; accepted under D-22. The compensating controls are **governed by D-22 rules 1 and
2a–2e (`docs/PROJECT-STATUS.md` §8)** — that row is the enumeration's only canonical home, and this file no
longer repeats it *(the copy that lived here from 2026-08-27 was removed 2026-08-28 under S2.2 Round 1,
Finding 4, so the rules cannot drift between documents)*. For the harness: Playwright asserts the §5.4 field
and tag list as the contract — that is the practical meaning of rule 2d (D-22, `docs/PROJECT-STATUS.md` §8).

**Two consequences to carry into every other document:** `MAILCHIMP_LIST_ID` and `MAILCHIMP_API_KEY` remaining
single shared entries is **correct rather than a defect** (§2B rows 8–9), and **§8 P7 is N/A — accepted risk**,
not owed. Recording the manual-verification half (the journeys the owner confirms in his own inbox) is an
**S5.1 feature-list obligation**.

---

## 7. "Green on Preview but broken in Production"

The owner's core fear, ranked by likelihood × damage. Every entry has a mitigation.

> ### First, the harder version of that fear: **a payment test can PASS while the payment silently failed**
>
> Added 2026-08-25 after the independent review. Everything else in this section assumes a failure shows up as
> *something*. Three defects, stacked, mean it need not — a test can go green, a browser can show a success
> page, and Stripe can show "Delivered", while the customer has no access:
>
> 1. **Known issue 22 — the webhook returns HTTP 200 after a failed database write.** Neither Supabase write in
>    `src/app/api/stripe/webhook/route.ts` inspects the returned error, and nothing calls `.throwOnError()`, so
>    a failed entitlement write still ends in a 200. Stripe records the event as **Delivered and never
>    retries**. There is no alert, no log entry, and no second chance. This is the root of the whole class.
> 2. **Known issue 45 — the success banner is rendered from the URL, not from the data.**
>    `src/app/account/page.tsx` shows "Payment successful" whenever `?checkout=success` is present in the query
>    string, with no check that an entitlement row exists. Stripe always sends the customer to that URL after
>    checkout. So the page **cannot** display anything but success, whatever happened in the database — and any
>    test that asserts "the success message appeared" is asserting that Stripe performed a redirect.
> 3. **Known issue 39 — no failed-renewal handling.** Access is granted on `checkout.session.completed` and
>    revoked only on `customer.subscription.deleted`. `invoice.payment_failed`, `invoice.paid`, `past_due` and
>    `unpaid` are not handled, so a Premium member whose renewal fails keeps access indefinitely. Nothing to
>    test, because nothing is implemented.
>
> **What this means for how tests are written, and it is not optional:** the only trustworthy assertion for a
> payment is **the entitlement row in the database**, plus the gated content actually rendering for that user.
> A redirect, an HTTP 200, a Stripe "Delivered", and an on-screen success message are — on this codebase,
> today — all compatible with total failure. §8 **P5** is written this way for exactly this reason; keep it
> that way. All three are code defects, deliberately **not** fixed in this sprint; they belong to the
> fix-and-improve stage that precedes testing activation.

| Rank | The way a green suite still ships a broken Production | Mitigation |
|---|---|---|
| **1** | **The access-record table differs between test and production, and the suite cannot see it.** Production's definition has no committed SQL. If the real table lacks the exact unique constraint, the payment confirmation fails in production while a correctly built test table sails through. Made far worse by the fact that the webhook currently **does not read the database error** — a failed write is answered with a success code, so **Stripe never retries and nothing anywhere records the failure**. The customer pays and gets nothing. | Capture the production definition read-only, **commit it**, build test from the committed file (§5.1), and add a prod-vs-test schema and policy diff to the launch checklist. Separately: fix the swallowed error so a failed write returns a failure and Stripe retries — **Known issue 22**, a code fix owned by the fix-and-improve stage, not by this document. |
| **2** | **Auth settings differ — above all "Confirm email".** A suite built against confirm-email-OFF proves nothing about a production with it ON: signup would return "check your inbox" and no purchase would ever start. | The written parity table in §5.3, evidenced from both dashboards, plus one test asserting that observed post-signup behaviour matches the documented production setting. |
| **3** | **The live-mode Stripe wiring is never actually exercised.** A wrong live key, a missing live endpoint, a live endpoint missing the cancellation event, or a stale live signing secret all leave a green test run completely untouched. | The C1 live smoke purchase, plus a dashboard check that the **live** endpoint carries **both** event types and logged a success, plus confirming the live access record landed. |
| **4** | **The known broken paths hide behind shallow assertions.** Known issues 1 and 2 fail *identically* in both environments — so they are not a parity problem, but they are invisible unless the tests assert the right things. The post-payment landing page and the password-reset destination are stale `/unretire/*` paths that 404, and the book download always fails on a stale file path. | The suite must assert the **final landing page loads and shows the success message**, and that the book download returns an actual PDF — not that the browser reached Stripe. A test that stops at "redirected to Stripe" goes green while production is broken. Fixed in **S3.1**, before the Launch Gate run. |
| **5** | **`NEXT_PUBLIC_SITE_URL` — a green suite is honest here, and that is the problem.** Nothing functional breaks, so no test fails; production simply ships localhost canonical and social URLs. | Set it per environment (§4 step 8) and add one test asserting the rendered canonical/Open Graph host equals the deployment host. |
| **6** | **Build-time desync.** A value corrected in the dashboard is absent from the already-built deployment; equally, Production's last build may predate a variable being added. | Redeploy after every environment change and re-run the smoke. Never treat the dashboard as the running state (§6 C11). |
| **7** | **The protection bypass masks an auth problem.** The suite runs against Preview carrying a bypass Production never sees. | Run a small read-only smoke — public pages plus one sign-in with a dedicated production test account — **against Production**, not only Preview. |
| **8** | ~~**Mailchimp fields exist in test but not in live.**~~ → **Restated 2026-08-27 (D-22): there is only one audience, so the test-vs-live mismatch cannot occur — the surviving risk is a merge field the app posts that the live audience does not define.** The assessment posts thirteen merge fields; behaviour on an unknown field differs and the failure is quiet. | ~~Diff the field and tag lists between the two audiences~~ *(no second audience exists — D-22)* — instead **assert the exact list against the live audience** in the email-capture spec, pre-launch (§5.4), under the five rules at §6 C8. |
| **9** | **Abuse controls (not built yet) behave differently.** Production will run a real bot check; Preview will use always-pass test keys. | Manual negative test on production plus a server-side test of the verification-failure path (§6 C10). |
| **10** | **The free-tier test project pauses, or hits its email limit mid-run.** Produces **red** tests that look like app bugs — a false alarm, which is the safe direction, but it burns hours. | The C5 preflight health check with an explicit, unmistakable error message. |
| **11** | **Region latency tempts someone to lengthen a timeout.** Low risk, conservative direction. | Record typical round-trips; never lengthen a timeout to make a test pass (§6 C4). |
| **12** | **Subscription lifecycle is only half-implemented — a real gap, not a test gap.** The webhook handles only "checkout completed" and "subscription deleted". There is no handling of `invoice.payment_failed`, `invoice.paid`, a subscription moving to `past_due`/`unpaid`, or a delayed-payment outcome — so **a Premium member whose card fails keeps access indefinitely** until Stripe deletes the subscription outright. No test can surface a case the code does not implement. | **Known issue 39.** A product decision as much as a code one: decide before launch whether to handle the renewal and failed-payment events. Compounded by C14 — the $0 test subscription has no payment method, so even a manual renewal cannot be observed pre-launch. Until it is implemented, the only detection is the owner reading Stripe's own subscription list. |
| **13** | **The suite asserts the success *page*, not the entitlement — so it passes when the payment silently failed.** See the callout at the top of this section. The webhook answers 200 after a failed write (**issue 22**), and `/account` prints "Payment successful" from the query string alone (**issue 45**), so every visible signal a test can reach is compatible with the customer having no access. This outranks every other row here: it does not merely let a production bug through, it makes the test **actively misleading**. | Assert the **database row** and the **gated content rendering**, never the redirect or the banner (§8 P5). Treat a payment test that does not read the database as no test at all. |
| **14** | **The pre-launch "real purchase" is a $0 coupon, so it proves the wiring and none of the money.** No charge, no card, no 3-D Secure, no capture, no payout — and for Premium, `payment_method_collection: "if_required"` means no payment method is collected at all, so the resulting subscription cannot renew (issue 34). Green everywhere; the first real customer is still the first real charge. | §6 **C14** in full: sandbox decline + 3-D Secure cards, and one **non-zero** live purchase (temporary $1 price, real card, refunded) before launch. Delete the $0 subscription afterwards. |
| **15** | **The live Stripe account cannot take or keep money, and nothing in the repo can tell.** `charges_enabled` false, `payouts_enabled` false, an unmet `requirements.currently_due` deadline, or no verified bank account — each is invisible to every environment variable, every test, and every code review. The account is shared with other projects, so its state can change without anyone touching this repo. | §6 **C15**: a dated manual dashboard check by the owner before launch and after any Stripe account change. Record it beside the §8 proofs, because it has the same weight as one. |
| **16** | **The live webhook endpoint drifts — wrong URL, missing event, different API version.** Already happened three times on this project (issues 29, 30, 31); a legacy endpoint on the shared account is still Active (issue 26). A Preview suite cannot see any of it. | §6 **C16**: read the live endpoint's URL, subscribed events and API version off the dashboard at launch and after every Stripe change. |

### The honest residual risk

State it in these words, because pretending it is zero is how launches go wrong.

**A green Preview suite proves the application logic and the wiring of the test-mode dependencies. It cannot
prove:** the live Stripe credentials, the live webhook endpoint's URL / events / API version, **the live
Stripe account's ability to charge and pay out** (`charges_enabled`, `payouts_enabled`,
`requirements.currently_due`, a verified bank account — §6 C15), the production domain, real card-issuer
behaviour (3-D Secure, declines, fraud rules), **anything about a real charge if the test purchase was a $0
coupon** (§6 C14), **subscription renewal** — which is unimplemented as well as untested (issue 39), real email
deliverability and spam placement, real bot traffic, or production data volume.

**And one thing it cannot prove even about Preview**, which is the uncomfortable one: while issues 22 and 45
stand, a green payment test does not prove the payment worked *there* either. Fix those before trusting any
payment result from any environment.

**What covers the residual, and nothing else does:**

1. **The Production smoke test** on the real domain, same day — `docs/LAUNCH-CHECKLIST.md` Phase 3. It
   already requires a real external-address submission delivered to an inbox, the full sitemap over HTTPS,
   the canonical/Open Graph URLs showing the new domain, and live-domain sign-up / sign-in / reset.
2. **One real manual purchase on the live site** — a live card at a **non-zero** amount (a temporary $1 price),
   refunded afterwards; confirmed by a success in the **live** Stripe dashboard **and** the access record
   appearing in `unretire-prod` **and** the member actually reaching the content. This is the C1 compensating
   check. ⚠ **A 100%-off code does not substitute for this** — it skips the card, 3-D Secure, capture and
   payout entirely, and for Premium collects no payment method at all (§6 C14). Use a coupon only as an
   *additional* wiring check, never as the money check.
   ⚠ **`docs/LAUNCH-CHECKLIST.md` Phase 3 does not yet carry this line** — it covers forms, not payments.
   Adding it is required bookkeeping (§9).
3. **The §6 C15 account-readiness check**, dated and recorded — `charges_enabled`, `payouts_enabled`, an empty
   `requirements.currently_due`, and a verified payout destination. A perfect purchase test on an account that
   cannot pay out is a business failure that no engineering check catches.
4. **The daily morning check** after launch — the 5–7 most critical tests re-run against the live site every
   morning, emailing the owner only on failure, per `docs/testing-setup/TESTING-GUIDE.md` §5 and Sprint S5.2.
   Silence means green. This is what catches the payment path that quietly stops working three weeks after
   launch.

That smoke test is not optional, and it is not an admission that the suite failed. It is the part of the
surface that no preview environment can ever reach.

---

## 8. Verification — proving isolation holds *before* any test runs

**The gate:** no Launch Gate run, and no Playwright suite, starts until every proof below is recorded as
PASS with a date *(amended 2026-08-27 for decision **D-22**: **P7 is N/A — accepted risk** and is excluded
from this gate; a retired proof cannot be recorded PASS, and its absence is not a blocker)*. `docs/testing-setup/SETUP-CHECKLIST.md` Part 2 already makes this a blocker: *"confirm
environment separation… if anything live-keyed leaks into Preview, stop and report."* This section is how
that confirmation is actually performed on this project.

Record the results in the PR that ships the wiring, or in `docs/PROJECT-STATUS.md`.

> **Recording status — rewritten whole 2026-08-26 (stage-gate Round 4, Finding 4; the 2026-08-25 version
> had drifted out of agreement with its own rows).** ~~**No behavioural proof in this table is PASS.**~~ *(Superseded 2026-08-27/28: **P11 is PASS** — recorded 2026-08-27 by S2.2 (`supabase-test` `list_tables` → `{"tables":[]}`); **P1 is deferred to S2.3** — not observable in S2.2, D-20 amended 2026-08-27 *(S2.3 opened 2026-08-28: harness landed; the proof is a fixture sign-in on the Preview; run pending)*; ~~**P12 is OWED — S2.5** — its 2026-08-27 PASS was reverted 2026-08-28 (Round 1 Finding 1: recorded on prose, not a reviewable artefact)~~ **P12 is PASS** (the artefact arrived the same day); every other proof is owed by S2.5. ~~D-20 amended a second time 2026-08-28: S2.2's proof scope closes as P11 only.~~ **D-20 amended a THIRD time later on 2026-08-28: the owner supplied the Vercel Environment Variables artefact, so **P12 is PASS** and S2.2 closes with **P11 and P12**; P1 alone moves to S2.3.**)* What
> IS recorded: **P13's configuration-inspection halves** for both Supabase projects (2026-08-25) — but
> P13's own procedure also requires observing a **delivered production password-reset email**, which has
> NOT been done, so P13 is *configuration-verified*, not PASS; ~~**P12 is PARTIAL and currently FAILING on
> its Mailchimp portion** — the Supabase and Stripe scope portions were recorded 2026-08-25 and
> re-verified 2026-08-26 (owner screenshot), but that same screenshot shows **no Preview-scoped Mailchimp
> entry exists** (§2B row 9), so P12 cannot complete until S2.2 creates it (corrected 2026-08-26, S1.3
> per-PR review round 1).~~ → **corrected 2026-08-27 (D-22): P12's Mailchimp portion is not failing and is
> not owed — its PASS condition changed.** The Supabase and Stripe scope portions remain recorded
> 2026-08-25 / re-verified 2026-08-26 (owner screenshot); the **shared audience entry is now the accepted
> D-22 posture**, so P12 is **PARTIAL on the Supabase/Stripe evidence alone** and nothing about Mailchimp
> blocks it ~~*(2026-08-28: that Supabase/Stripe evidence exists only as prose in review records, not as a reviewable artefact — P12 is **owed, S2.5**)*~~ ***(2026-08-28, later the same day: the owner supplied the Vercel Environment Variables view — names/scopes/types only, transcribed in full in the S2.2 review brief — so P12 is **PASS**, closed in S2.2.)***. **P3 is unblocked but unrun** (both URL
> configurations recorded; no Preview signup email has been observed). ~~**P4/P5/P6 remain blocked** on a built `staging` deployment (Known issue 32).~~ **2026-08-27: `staging`
> is built and its alias answers (302, was 404) — Known issue 32 RESOLVED. P4, P5 and P6 are therefore
> **runnable but unrun**, owned by S2.5 under D-20 — not structurally blocked.** ~~**P7 cannot run** until §4 Step 6 creates the test audience
> (S2.2).~~ → **P7 is N/A — accepted risk (D-22, 2026-08-27); Step 6 is cancelled, so P7 will never run.**
> Every other proof is unrun. Sprint **S2.5** owns closing this table. Until then, no statement
> anywhere in this project may describe environment isolation as *verified* — only as *configured*, and
> the Mailchimp audience not even as that *(and, since D-22, never as that: it is deliberately shared)*.

| # | Proof | How to run it | PASS looks like | FAIL means |
|---|---|---|---|---|
| **P1** | **The Preview deployment resolves to the test project** *(2026-08-27: attempted in S2.2 and not observable — ~~the value is inlined in the client JS behind Deployment Protection~~ **corrected 2026-08-28 (S2.3): the ref is in NO client chunk (`grep -r supabase.co .next/static` → nothing) and the browser never calls Supabase, so no request capture is possible**; **deferred to S2.3**, ~~whose harness sends the bypass header~~ whose auth-setup projects carry the sanctioned bypass by name and sign in a fixture that exists only in `unretire-test` — D-20 amended and corrected)* | ~~On the deployed Preview `[PREVIEW_URL]`, inspect the served page for the Supabase project reference (it is a public value and appears in the deployment's own configuration listing). Compare against both refs.~~ **(S2.3, 2026-08-28)** Run the three auth-setup projects against the Preview (`E2E — Preview`): each signs in a fixture account that exists only in `unretire-test` and must land on `/account` showing that fixture's email. Negative control: the fixture emails are absent from `unretire-prod` (read-only count via `supabase-prod-readonly`, or the owner's dashboard). | The reference is **`dtdadtggahjsrmevwvbu`** (`unretire-test`). | It still shows `hcjivvlwxltyiycfbttc` — Phase A did not take effect, most likely because the Preview was not redeployed. Stop. |
| **P2** | **A test signup lands in TEST and is absent from PROD** | Sign up on `[PREVIEW_URL]` with an obviously-fake address. Then look in **both** Supabase dashboards. | The new user exists in `unretire-test` and **does not exist** in `unretire-prod`. | Preview is still writing to production. Stop everything and re-check P1. This is the definitive test — `docs/SUPABASE-VERCEL-SETUP.md` B6 already names it as the wiring verification. |
| **P3** | **Preview auth emails return to the Preview** | From the P2 signup (or a password reset), inspect the link in the email. | The link's host is the Preview origin — **not** the production origin and **not** `localhost`. | ~~The `unretire-test` redirect allow-list is missing the Vercel preview wildcard~~ · ~~**This proof fails today by construction**~~ — **superseded 2026-08-25: both projects are configured.** `unretire-test` has Site URL `http://localhost:3000`, allow-list `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`, so the Preview wildcard **is** present and this proof is no longer expected to fail for a configuration reason. It is simply **unrun** — no Preview signup has yet been observed returning its link to the Preview origin. Owed by **S2.5**. |
| **P4** | **A Preview payment appears only in Stripe TEST mode** | Complete a checkout on `[PREVIEW_URL]` with the standard test card. Check the Stripe dashboard in **both** modes. | The payment appears under **test mode** and **nothing** appears in live mode. | A live key reached Preview. Stop immediately — this is a real-money leak, and `docs/ENV-VARS-SAFETY.md`'s leak procedure applies (rotate first). |
| **P5** | **The payment actually granted access — in the test database** ⚠ **the single most important proof in this table** | *(2026-08-27: Known issue 32 cleared - `staging` is built and its alias answers, so P5 is runnable but unrun, owned by S2.5.)* After P4, check `unretire-test` for the access record, and load the gated content as that fixture user. **Read the database. Do not accept the redirect, the HTTP 200, Stripe's "Delivered", or the "Payment successful" banner** — with Known issues 22 and 45 open, all four are printed regardless of whether the write succeeded (§7 callout). | The record exists with status `active`, **and** the gated page opens for that user. | The webhook did not deliver, or the write failed and was silently swallowed. Check the Stripe endpoint's delivery log; remember the "invalid signature" message can actually mean a missing key (§3 Gap 2 / Known issue 36), and that a database write error is currently answered with a success code (§7 risk 1, Known issue 22) — so a green delivery log does **not** prove the write. Today, delivery is additionally impossible ~~until Known issue 32 is cleared.~~ **P5 is runnable but unrun, owned by S2.5 — Known issue 32 was cleared 2026-08-27.** |
| **P6** | **The webhook endpoint is reachable through Preview protection** | Send an unauthenticated request to the Preview webhook URL, including the bypass query parameter. | It is handled by the application (a signature rejection is fine — it proves the request reached the app), **not** answered with a login page. | The bypass is header-only or missing (§6 C3). **2026-08-25:** the bypass secret now exists in the Preview scope, so this proof has become runnable — but it needs a built `staging` deployment first (~~Known issue 32~~ **cleared 2026-08-27; P6 is runnable but unrun, owned by S2.5**), and it must be run against the **query-parameter** form, because that is the only form Stripe can use. |
| **P7** | ⛔ **N/A — ACCEPTED RISK (decision D-22, 2026-08-27). This proof is retired, not owed.** ~~**A Preview email capture lands in the TEST audience only**~~ | ~~Submit an email-capture form on `[PREVIEW_URL]`. Check both Mailchimp audiences.~~ **There is no second audience to check** — one live audience serves Production, Preview and local, permanently (§2B row 9, §4 Phase C). | ~~The contact appears in the **test** audience with the right tag; the live audience is unchanged.~~ **No PASS condition exists** — a Preview capture *is expected* to land in the live audience. What replaces this proof: the email-capture spec runs against the one live audience — the accepted D-22 posture — governed by **D-22 rules 1 and 2a–2e** (`docs/PROJECT-STATUS.md` §8), the single canonical statement of those controls. ~~the email-capture spec asserts the contact, tag and merge fields **on the live audience** and tears it down, under the five rules at §6 **C8** (S2.3 builds the teardown), plus the owner's manual inbox confirmation of multi-day journeys (an **S5.1** feature-list obligation).~~ | ~~`MAILCHIMP_LIST_ID` was not split.~~ **No FAIL condition exists either.** The wording above is retired whole; do not re-record P7 as PASS, FAIL, blocked or owed anywhere in this project. |
| **P8** | **The two databases match structurally** | Diff `unretire-test` against `unretire-prod`: table definitions, constraints, indexes, RLS enabled state, and the full policy list on both tables. | No differences on the items listed in §5.1 and §5.2. | The suite is testing a different shape from the one that ships — §7 risk 1. Reconcile before running anything. |
| **P9** | **The auth-settings parity table is filled and evidenced** | Walk §5.3's table in both dashboards and record each pair. | Every row matches, or a difference is recorded with an explicit reason and a compensating check. | Unknown behaviour differences — §7 risk 2. |
| **P10** | **Production has no deployment protection and Preview does** | Request the production URL without any bypass. | Production serves the page directly; Preview does not. | Both request paths are not being covered (§6 C3). |
| **P11** | **The test project is awake** | Preflight ping of `unretire-test` before every suite run. | Responds normally. | Free-tier auto-pause (§6 C5) — resume it and re-run, rather than debugging phantom app errors. **✅ PASS 2026-08-27 (Sprint S2.2):** after the owner's MCP OAuth, `supabase-test` `list_tables` answered `{"tables":[]}` — awake, empty `public` schema (schema replication is S2.5's). This is a point-in-time result; the preflight ping is still owed before every suite run. |
| **P12** | **No live-keyed value is present in Preview** — **✅ PASS 2026-08-28 (Sprint S2.2)** on an owner-supplied Vercel Environment Variables view (names/scopes/types only), transcribed in full in `docs/code-reviews/S2.2-environment-isolation-agent-tooling-review.md`: Supabase and Stripe hold **separate entries per environment**, the two Mailchimp names are **one shared entry each** (the D-22 accepted posture, not a failure), `NEXT_PUBLIC_SITE_URL` is Production-only and `NEXT_PUBLIC_FORMSPREE_ENDPOINT` absent; all twelve `PROJECT-STATUS.md` §9 rows match. *(Recorded PASS 2026-08-27 on prose, reverted to owed on review Finding 1, then closed the same day the artefact arrived.)* | Review the Preview scope's variable list in Vercel — **names and scopes only, never values**. | ~~The Supabase, Stripe **and audience** entries are Preview-scoped and distinct from Production;~~ → **PASS condition rewritten 2026-08-27 (D-22): the Supabase and Stripe entries are Preview-scoped and distinct from Production, *and* the Mailchimp entries are the single shared Production-and-Preview entries that D-22 approves.** `NEXT_PUBLIC_SITE_URL` is absent by design and `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is absent pending Gap 4. ~~**✅ PASS — recorded 2026-08-27 by Sprint S2.2 under D-20**, on the evidence in this cell (the 2026-08-25 live-dashboard check and the 2026-08-26 owner screenshot, re-affirmed by the owner 2026-08-27) and with the audience clause as rewritten above.~~ → *(history:)* ~~**REVERTED 2026-08-28 to OWED — S2.5**~~ (S2.2 Round 1, Finding 1 accepted: that PASS was recorded on **prose** — the 2026-08-25/26 dashboard checks exist only as narrative in earlier review records, not as a reviewable artefact named in the brief. ~~P12 reads **owed — S2.5** until a names/scopes/types-only screenshot is posted as a reviewable artefact (e.g. a PR #14 comment) and cited; the earlier configuration checks are recorded in the review records but are not proof.~~ **That artefact arrived on 2026-08-28** — the owner's Vercel Environment Variables view, transcribed in full in `docs/code-reviews/S2.2-environment-isolation-agent-tooling-review.md` — so **P12 is PASS, closed in S2.2**. **~~D-20 amended a second time 2026-08-28: S2.2's proof scope closes as P11 only.~~ **D-20 amended a THIRD time later on 2026-08-28: the owner supplied the Vercel Environment Variables artefact, so **P12 is PASS** and S2.2 closes with **P11 and P12**; P1 alone moves to S2.3.**** **Current state** (corrected 2026-08-26, S1.3 per-PR review round 1; ~~PARTIAL — … the Mailchimp portion FAILS today~~ → re-stated 2026-08-27 under D-22: **the Mailchimp portion neither passes nor fails — it is the accepted posture**): **Supabase and Stripe portions recorded 2026-08-25 and re-verified 2026-08-26 (owner screenshot)** — ~~the scopes match (§2B)~~ `MAILCHIMP_LIST_ID` is one shared Production-and-Preview entry with **no Preview-scoped entry** (§2B row 9), which is now **correct by decision**, so ~~this proof stays INCOMPLETE until S2.2 creates the test-audience entry~~ **nothing about Mailchimp holds this proof open**; ~~S2.2 owns recording the result under D-20~~ ~~*(2026-08-28: **S2.5** owns it — D-20 amended; S2.2 closes on P11 only)*~~ **(2026-08-28, final: **S2.2** owns and closes P12 — D-20 third amendment; S2.2 closes P11 and P12, P1 alone moves to S2.3)**. A names-only listing also cannot show that the Preview *values* are the test ones — that is what P1 and P4 exist to demonstrate ~~and P7~~ *(P7 retired — D-22)*. | Stop and report — an explicit blocker per `docs/testing-setup/SETUP-CHECKLIST.md` Part 2. ~~**The Mailchimp portion is in this failed state now** — no Preview email-capture proof (P7) may run before S2.2.~~ → **2026-08-27 (D-22): the Mailchimp portion is no longer a failure state.** A FAIL here now means a **Supabase or Stripe** entry that is not Preview-scoped and distinct, or a Mailchimp entry that has drifted from the single shared pair. |
| **P13** | 🟡 **Configuration-inspection halves recorded 2026-08-25 for both projects — NOT fully PASS** (corrected 2026-08-26, stage-gate Round 4 Finding 4: this proof's own procedure also requires observing a delivered **production password-reset email** resolving to the live origin, which has not been done — that observation is owed by **S2.5**). *(Re-run the inspection if either project's URL configuration is changed.)* **Both Supabase projects have a real Site URL and a correct redirect allow-list** — the settings §5.3a covers, which no environment variable can substitute for | Open **Authentication → URL Configuration** in each project and read the Site URL and the full Redirect URLs list back against the §5.3a table. Then confirm a **production** password-reset email link resolves to ~~`https://unretire.vercel.app/auth/confirm?next=…` (the live origin; the custom domain once DNS moves)~~ `https://www.unretireproject.com/auth/confirm?next=…` (the live origin since 2026-08-27) and not to localhost. **Note 2026-08-27:** the `unretire-prod` Site URL moved to `https://www.unretireproject.com` on 2026-08-27 (owner-reported), so both halves of this proof — the inspection and the delivered-email observation — must be (re-)run against the `www` host; status unchanged. | `unretire-prod`: Site URL is the live origin, allow-list contains it plus both ~~future~~ custom-domain entries (both live since 2026-08-27 — `www` serves, the apex redirects). `unretire-test` (verified 2026-08-25): Site URL is `http://localhost:3000`, allow-list contains `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**` — correct and minimal for a project whose only clients are local development and Preview deployments; no branch alias is needed because the wildcard covers every Preview, and **not** the production domain. | ~~**Known issue 23 is still open.**~~ **Half-recorded 2026-08-25:** `unretire-prod` **PASSES** on Site URL and on the removal of the legacy hosts (Known issue 28 resolved), with a noted exception — `localhost:3000/**` and the Preview wildcard are still on the production list, knowingly (§5.3a, outstanding item 2). ~~**`unretire-test` is NOT recorded** and this proof cannot be closed until it is.~~ **`unretire-test` IS recorded (2026-08-25): Site URL `http://localhost:3000`, allow-list `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`.** ~~P13 is therefore satisfied by inspection for both projects~~ — corrected 2026-08-26 (Round 4, Finding 4): the inspection halves are recorded, but the delivered-email observation this proof's own procedure requires is **unrun**, so P13 is configuration-verified only (see the row lead); the email observation is owed by S2.5. ⚠ Passing P13 does **not** make auth redirects safe — the app's own `next` handling is separately defective (Known issue 38, §5.3b). |

**Re-run P1, P2, P4 and P8 after any environment change and after any migration.** They are cheap, and they
are the only things standing between a test run and production data.

**Re-run P3 and P13 after any change to a Supabase project's URL Configuration, after the production domain
changes, and at launch** *(both triggers fired on 2026-08-27 — the production Site URL moved to `https://www.unretireproject.com` and the domain went live; neither proof has been re-run since)* — `docs/LAUNCH-CHECKLIST.md` Phase 2 already carries the "add the new domain to the
auth provider's redirect allow-list" line, and P13 is how that line is proven rather than assumed. Note that
P13 is the one proof in this table that is **not** about Vercel: it checks settings that live only in the
Supabase dashboard, so it is the one most easily forgotten during an environment audit.

---

## 9. Bookkeeping this document creates

This file is documentation only; it changes no configuration by itself. The following are required and are
**not** done by writing it:

| # | Required | Owner | Where |
|---|---|---|---|
| 1 | ~~Correct the env-var table in `docs/PROJECT-STATUS.md` §9 — the four Stripe rows are **Production only**, and `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_FORMSPREE_ENDPOINT` are **not set anywhere**~~ | agent, in the sprint that owns that file | **DONE 2026-08-25** — `docs/PROJECT-STATUS.md` §9 now carries the corrected scopes plus a note on the Vercel Secret-vs-Config type (Known issue 24) |
| 2 | ~~Correct the same rows in `docs/TECH-ARCHITECTURE.md` §6, and flip §4's *"Local, Preview, and Production do not share writable production data — Unverified"* to **verified false, remediation tracked here**~~ | agent, same sprint | **DONE 2026-08-25** — `docs/TECH-ARCHITECTURE.md` §6 now states *current state vs intended* per row, §4's checkbox reads verified FALSE, and §1 carries the resolved production domain |
| 3 | Add the **live manual purchase** line to the post-launch smoke test — the checklist currently verifies forms, not payments. Write it as a **non-zero** charge (temporary $1 price, real card, refunded); a 100%-off code does not satisfy it (§6 C14) | agent, launch sprint | `docs/LAUNCH-CHECKLIST.md` Phase 3 |
| 4 | ~~Run the §4 owner checklist in the dashboards~~ | **owner** | 🟡 **LARGELY DONE 2026-08-25, corrected 2026-08-26** — Supabase split, four sandbox Stripe entries added to Preview, `NEXT_PUBLIC_SITE_URL` set in Production, automation bypass provisioned, public variables retyped Config. ~~"Mailchimp entries added to Preview"~~ — **FALSE, retracted (Round 4 Finding 1): the Mailchimp names are one shared entry each (owner screenshot 2026-08-26); ~~§4 Steps 6–7 are NOT done and belong to S2.2~~ → §4 Steps 6–7 are CANCELLED, not owed (decision D-22, 2026-08-27) — one shared entry each is the approved end state, and §8 P7 is N/A.** Other residuals: ~~`staging` has no deployment (issue 32)~~ *(built 2026-08-27, issue 32 RESOLVED)*; ~~**no §8 proof has been run** (S2.5)~~ **P11 and P12 PASS (S2.2, 2026-08-27 / 2026-08-28); P1 deferred to S2.3; every other proof owed by S2.5** — **S2.2 closes with P11 and P12; P1 alone moves to S2.3; P2–P6 and P13's delivered-email half remain S2.5's; P7 is N/A (D-22)** — D-20, third amendment, 2026-08-28 |
| 5 | Capture and commit the production `entitlements` definition, then build the test project from it | agent + owner approval | Sprint **S4.3** |
| 6 | Record the §8 proof results with dates | agent | the wiring PR, or `docs/PROJECT-STATUS.md` |
| 7 | Decide whether to handle failed-renewal / subscription-updated events before launch (§7 risk 12) — **Known issue 39**; note that a Premium member whose renewal fails keeps access today | **owner** | new decision entry, or `docs/POST-LAUNCH-BACKLOG.md` |
| 8 | Record the Formspree non-isolation (§6 C9) as accepted, with the owner's sign-off | **owner** | `docs/PROJECT-STATUS.md` open decisions |
| ~~9~~ | ~~**Configure Site URL + the redirect allow-list in BOTH Supabase projects** (§5.3a) — the production project is currently sending every auth email link to `http://localhost:3000`.~~ | **owner** | ✅ **DONE 2026-08-25 — both projects configured.** `unretire-prod`: Site URL `https://unretire.vercel.app` *(moved to `https://www.unretireproject.com` on 2026-08-27, owner-reported — allow-list unchanged)*, five allow-listed origins (`localhost:3000/**`, `www.unretireproject.com/**`, `unretireproject.com/**`, `unretire.vercel.app/**`, `*-86400-s-projects.vercel.app/**`), two stale third-party hosts removed (Known issue 28 resolved). `unretire-test`: Site URL `http://localhost:3000`, allow-list `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`. Only the behavioural proof **P3** (§8) remains unrun — owed by **S2.5**. ⚠ Known issue 23's *configuration* half is closed; its embedded \"not an open redirect\" claim is **wrong and retracted** — see §5.3b and Known issue 38 |
| 10 | ~~Change the Vercel variable **Type** of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from **Secret** to **Config**~~ | **owner** | ✅ **DONE 2026-08-25** — all three `NEXT_PUBLIC_*` variables in Production are typed **Config**; `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `MAILCHIMP_API_KEY` remain **Secret**, as required. Known issue 24 resolved |
| 11 | ~~Set `NEXT_PUBLIC_SITE_URL` in **Production**, then redeploy; leave Preview unset (§2A row 10)~~ | **owner** | ✅ **DONE 2026-08-25** — set to the live origin (not the custom domain, which ~~is still parked~~ was still parked until 2026-08-27). Closes Known issue 19 and the Production half of D-13. **Two follow-ups:** ~~remove the trailing slash (Known issue 35), and change the value when DNS moves~~ — **both done 2026-08-27** (owner-reported, OWNER-ACTIONS Part 4B L1 + L4 redeploy): value now `https://www.unretireproject.com`, no trailing slash, confirmed by the served `og:url`; Known issues 27 and 35 RESOLVED |
| ~~12~~ | ~~**Land one commit on `staging`** so Vercel builds its branch alias and the sandbox Stripe webhook has a target — until then no Preview payment can complete~~ **DONE 2026-08-27** — fast-forwarded `0983ad5` → `a68f210` under a one-time owner authorisation; the alias answers **302** (was 404). The endpoint still returns **401 `Protected deployment`** to an unauthenticated POST, so the Sandbox destination needs the bypass **query parameter** (§6 C3) — owner-reported done 2026-08-27, proven by P6. See the `staging` lifecycle table above §6 | **owner / agent** | GitHub. Known issue **32**; unblocks §8 P4, P5, P6 |
| ~~13~~ | ~~**Configure `unretire-test`'s Site URL + redirect allow-list**~~ | **owner** | ✅ **DONE 2026-08-25.** Site URL `http://localhost:3000`; allow-list `http://localhost:3000/**`, `https://*-86400-s-projects.vercel.app/**`. §8 **P3** is unblocked but has not been run — that proof is owed by S2.5 |
| 14 | **Run the §8 proofs and record each with a date** — the one thing that converts "configured" into "verified" | agent + owner | Sprint **S2.5**. Nothing in the Launch Gate may start before this |
| ~~15~~ | ~~**Prove the Mailchimp audience split** (§8 P7) and diff the test audience's merge fields and tags against live (§5.4)~~ → **CANCELLED 2026-08-27 by decision D-22 — there is no split to prove and no second audience to diff.** What remains in its place: the email-capture specs run against the one live audience, governed by **D-22 rules 1 and 2a-2e** (`docs/PROJECT-STATUS.md` §8), the single canonical statement of those controls - cited by label, never restated here; the S5.1 feature list carries the manual-verification obligation those rules describe. *(Struck restatement, kept for the audit trail:)* ~~(a) the email-capture specs assert the §5.4 field and tag contract **on the live audience** under the five rules at §6 **C8**, with teardown built in **S2.3**; (b) recording the **manual-verification half** — the multi-day journeys the owner confirms in his own inbox — is an **S5.1 feature-list obligation**~~ | agent + owner | Mailchimp. ~~§2B row 9 stays **NOT SPLIT** until S2.2 performs the split, and unproven until P7~~ → §2B row 9 is **shared by decision**; §8 **P7 is N/A — accepted risk** |
| 16 | **Record the §6 C15 Stripe account-readiness check** — `charges_enabled`, `payouts_enabled`, empty `requirements.currently_due`, verified payout destination | **owner** | Stripe dashboard, before launch and after any account change |
| 17 | **Tighten the production redirect allow-list** — remove `http://localhost:3000/**` and the Preview wildcard once `unretire-test` carries Preview auth and DNS has moved (§5.3a outstanding item 2; DNS moved 2026-08-27 — the Preview-auth precondition remains) | **owner** | Supabase dashboard. Hygiene follow-up to Known issue 28 |
| ~~18~~ | ~~**Correct the retracted open-redirect claim wherever it was repeated** — `docs/PROJECT-STATUS.md` Known issue 23 and `docs/TECH-ARCHITECTURE.md` both state the app's `next` handling is safe; it is not (§5.3b, Known issue 38)~~ | agent | ✅ **DONE 2026-08-25 (during S1)** — both corrections were made visibly (Known issue 23 carries the retraction; TECH-ARCHITECTURE §5 states the open redirect as NOT met). Row closed 2026-08-26 (stage-gate Round 4, Finding 4: this row still instructed completed work) |

**Reference for this document's own delivery** *(filled 2026-08-26 from the filed review records — closes
the long-standing unfilled footer, stage-gate Round 4 Finding 4 / disclosed item 1)*: branch
`claude/r1-system-retrofit`, PR **#1** (https://github.com/86400websites/unretire/pull/1), substantive head
`39f698d` (branch tip `543d26e`), Preview
`https://unretire-git-claude-r1-system-retrofit-86400-s-projects.vercel.app`, reviewed 2026-08-26 (per-PR
round 9 **APPROVE**; merged as `1309e01`).

---

Next step → the remaining work, in order (updated 2026-08-26; **item (1) cancelled 2026-08-27, D-22; item (2) done 2026-08-27; P11 **and P12** PASS, P1 → S2.3, recorded 2026-08-28**):
~~**(1)** §4 Steps 6–7 — the Mailchimp test
audience + Preview-scoped `MAILCHIMP_LIST_ID` (Sprint **S2.2**, owner in the dashboards);~~ **(1) — struck:
the Mailchimp audience split is cancelled, not deferred (D-22). Nothing is owed here; the five rules at §6
C8 govern instead.** *(2026-08-28: the canonical rules are D-22 rules 1 and 2a–2e in `docs/PROJECT-STATUS.md` §8; §6 C8 now cites them rather than repeating them.)* ~~**(2)** land a
commit on `staging` (Known issue 32, S2.2);~~ **(2) — DONE 2026-08-27: `staging` fast-forwarded to `a68f210` and built; Known issue 32 RESOLVED.** **(3)** run the §8 proofs and record each with a date (Sprint
**S2.5** — the step that converts *configured* into *verified*); then `docs/testing-setup/SETUP-CHECKLIST.md`
and `/activate-testing` (Sprint S5.1). Before touching any value, re-read `docs/ENV-VARS-SAFETY.md`; before
touching any schema, re-read `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`.
