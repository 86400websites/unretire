# ENVIRONMENT-PARITY.md — Testing on Preview Without Touching Production

**Status:** authoritative for environment isolation and Preview↔Production parity on (Un)Retire.
**Written:** 2026-08-25 · **Applies from:** Sprint **S2.2** (isolation) / **S2.3** (harness) / **S2.5** (parity verification) through **S5.1** (Launch Gate) and beyond.
**Audience:** the owner first, then any agent or engineer who touches an environment variable, a Supabase
project, or the test suite.

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
| Isolation wants a **separate email audience**; fidelity wants the same fields and the same automated journeys. | Mirror the field names and tag names exactly and assert them. Accept that the automated journeys are **not** exercised — verify those once, manually, with the owner's own address. (§6 C8) |
| Isolation wants Preview **locked behind a password**; fidelity wants Production's **open, unauthenticated** request path. | Use Vercel's sanctioned automation bypass on Preview (per `docs/testing-setup/SETUP-CHECKLIST.md` Part 3) and separately assert that Production has no protection — so both request paths get exercised. (§6 C3) |
| Isolation wants Preview to **never touch production data**; fidelity wants Preview to run **exactly the same code**. | Same code, different environment **values**. That is only achievable if Vercel's Preview scope holds different values from Production. **Today it does not — and that single change is what unlocks everything else.** (§3 Gap 1, §4) |

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
| 8 | `MAILCHIMP_API_KEY` | Server-only | Mailchimp API key (may be the same account as Production) | same key is acceptable — *provided row 9 differs* | Mailchimp API key |
| 9 | `MAILCHIMP_LIST_ID` | Server-only | **test audience** id | **test audience** id | **live audience** id |
| 10 | `NEXT_PUBLIC_SITE_URL` | Public | `http://localhost:3000` | deliberately **unset** — every PR gets a unique Preview URL, so any fixed value would be wrong for most deployments. Checkout and auth derive the origin from request headers, so they stay correct; the only consequence is that Preview `metadataBase` falls back to localhost, which is harmless because Preview OG tags are never shared | the production domain (Open decision **D-2**) |
| 11 | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Public | a Formspree endpoint (ideally a throwaway form) | a Formspree endpoint (ideally a throwaway form) | the real Formspree endpoint |

Two pairing rules that break things quietly when ignored:

- **Rows 1–3 must always come from the same Supabase project.** A Production URL with a test secret key (or
  the reverse) produces an "invalid API key" rejection which — see §7 risk 1 — is currently *swallowed and
  answered with success*, so nothing anywhere records the failure.
- **Row 7 must be a recurring price and row 6 must be a one-time price.** The code opens a subscription
  session for Premium and a payment session for the Course; the wrong price type errors at session creation.

### 2B — Sharing verdict, and today's actual Vercel state

*"Shared" means one Vercel entry whose scope covers both Production and Preview, so both read the same value.*

| # | Name | May Preview and Production share one value? | What sharing actually causes | **Today in Vercel** | Gap |
|---|---|---|---|---|---|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | **NO — catastrophic** | Every Preview deployment, and every future robot test run, reads **and writes** the production database: real accounts, real sessions, real password changes, real entitlements. | **Production AND Preview (shared)** | 🔴 **OPEN** |
| 2 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **NO — catastrophic** | Same as row 1. A *mismatch* with row 1 instead breaks login and signup across the whole site with "invalid API key". | **Production AND Preview (shared)** | 🔴 **OPEN** |
| 3 | `SUPABASE_SECRET_KEY` | **NO — catastrophic** | This key ignores every database security policy. Shared, any Preview deployment that receives a payment event can grant or revoke **production** access with no guard at all. | **Production AND Preview (shared)** | 🔴 **OPEN** |
| 4 | `STRIPE_SECRET_KEY` | **NO — catastrophic in one direction** | A **live** key in Preview turns every automated "purchase" into a real card charge and a real recurring subscription against a real customer record. (A test key in Production fails closed instead: nobody can pay. Bad, but it does not move money.) | **Production ONLY** — absent from Preview | 🟠 Preview cannot test payments at all |
| 5 | `STRIPE_WEBHOOK_SECRET` | **NO — unsafe, fails closed** | A test-mode secret in Production makes every live payment's confirmation fail: **customers pay and never receive access**, and the only symptom is a red delivery list in the Stripe dashboard that nobody is watching. | **Production ONLY** — absent from Preview | 🟠 the Preview webhook rejects everything |
| 6 | `STRIPE_PRICE_COURSE` | **NO — unsafe** | Test and live price ids look identical (both `price_…`, no visible marker). Crossed, checkout fails with the generic "Could not start checkout" 500 — indistinguishable from a Stripe outage. | **Production ONLY** — absent from Preview | 🟠 |
| 7 | `STRIPE_PRICE_PREMIUM` | **NO — unsafe** | Same as row 6. | **Production ONLY** — absent from Preview | 🟠 |
| 8 | `MAILCHIMP_API_KEY` | **Conditionally yes** — safe only while row 9 differs | The key selects the account and its data centre; the audience id selects who actually gets emailed. Sharing the key alone is harmless. | **Production AND Preview (shared)** | 🟡 acceptable once row 9 is split |
| 9 | `MAILCHIMP_LIST_ID` | **NO — unsafe** | Every Preview form submission and every robot email-capture test writes a **real subscriber** into the live audience and fires the real automated sequence — real emails to fake addresses. Pollutes the list, harms sender reputation, and inflates the contact-count billing tier. | **Production AND Preview (shared)** | 🔴 **OPEN** |
| 10 | `NEXT_PUBLIC_SITE_URL` | **NO — sharing is itself the defect** | One string cannot be correct for two hostnames. Shared, Preview pages advertise the production address to search engines and social networks. | **NOT SET IN ANY ENVIRONMENT** | 🟡 see §3 Gap 3 |
| 11 | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | **Yes — safe** | All three forms already post to the same endpoint in code, so there is nothing to isolate. Preferably point Preview at a throwaway form so the owner's inbox stays clean. | **NOT SET IN ANY ENVIRONMENT** | 🟢 low |

**Read the "Today" column as one sentence:** *everything that should be split is shared, and everything that
should exist in Preview is missing.* Preview currently has full read and write access to the production
database, and no ability to test a payment.

> **Documentation drift, for the record.** `docs/PROJECT-STATUS.md` §9 and `docs/TECH-ARCHITECTURE.md` §6
> `docs/TECH-ARCHITECTURE.md` §6 still lists the four Stripe variables as "Production / Preview", and lists the two unset variables as
> set. The table above is the truth as of 2026-08-25. Correcting those two tables is listed in §9 as required
> bookkeeping. Separately, `docs/TECH-ARCHITECTURE.md` §4's line *"Local, Preview, and Production do not share
> writable production data — Unverified"* is now **verified FALSE**: they do share it.

---

## 3. Today's gaps

Four findings, each with its severity, the concrete failure it causes, and the fix.

### Gap 1 — 🔴 CRITICAL · Preview reads *and writes* the production database

**What is true today.** The three Supabase variables each exist as a single Vercel entry scoped to both
Production and Preview, so both environments receive the same value: the `unretire-prod` project
(ref `hcjivvlwxltyiycfbttc`). The test project `unretire-test` (ref `dtdadtggahjsrmevwvbu`) exists — Open
decision **D-8** was resolved on 2026-08-25 — but **no deployment points at it**. It is currently unused.

**What this causes right now, before any test suite exists.** Every one of these writes lands in production:

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

**The trap in that last table row — this is the most important sentence in the document.** The first thing
anyone must do to enable payment testing on Preview is add `STRIPE_WEBHOOK_SECRET` to Preview. If the
Supabase variables are not split *in the same sitting*, that single change immediately switches on a code
path that writes **real entitlements into the production database** from test-mode payments.
**Split Supabase first. Always.**

**The fix.** §4 steps 1–3, in that order. This is the change that makes every other change safe.

### Gap 2 — 🟠 CRITICAL for testing · Stripe is entirely absent from Preview

**What is true today.** All four Stripe variables are scoped **Production only**. The Stripe client reads its
key lazily and deliberately — the file's own comment says this is so Preview *builds* do not fail — so the
site compiles and serves normally on Preview. But at runtime:

- **Checkout** fails with a 500 and the honest message "Could not start checkout" (or a `?checkout=error`
  return to the product page from the signed-in path).
- **The webhook** has no signing secret, so `/api/stripe/webhook` rejects every request with 400 before
  anything else runs.

**What it causes.** **No payment path can be tested on Preview today at all** — not purchase, not access
granting, not cancellation. The entire primary conversion is untested and, in the current wiring, untestable.

**One diagnostic trap worth knowing before it costs an hour.** In the webhook, the missing-key error is
raised *inside* the signature-verification block, so a missing `STRIPE_SECRET_KEY` is reported to the
operator as **"Invalid signature"**. The message names the wrong cause. Check the key before chasing the
signature.

**The fix.** §4 steps 4–7: create the test-mode Stripe objects, then add all four variables scoped to Preview
only — **after** Gap 1 is closed.

### Gap 3 — 🟡 MEDIUM · `NEXT_PUBLIC_SITE_URL` is not set in any environment

**Be precise about this one — it is routinely overstated.** The variable is read in three places, and only
one of them is actually broken, because the other two prefer the real request headers:

| Where it is read | What happens with the variable unset | Verdict |
|---|---|---|
| Checkout session creation (`src/app/api/checkout/route.ts:31-34`) | Uses the browser's `origin` header **first**. Stripe's success and cancel URLs are correct. | ✅ **No impact** |
| Auth server actions (`src/app/auth/actions.ts:19-26`) | Derives the origin from `x-forwarded-host` / `host` **first**. Confirmation and password-reset links point at the right deployment — a Preview signup's email returns to that Preview. | ✅ **No impact** |
| Page metadata (`src/app/layout.tsx:40`, `metadataBase`) | **This variable only**, falling back to `http://localhost:3000`. There is no header fallback at this site. | 🟡 **Real defect** |

**So the concrete failure is:** Production currently publishes canonical URLs and social-sharing (Open Graph)
URLs that resolve against `http://localhost:3000`. That harms search indexing and makes shared links render
the wrong preview.

**It is not a payment defect, not an auth defect, and it does not send anyone to localhost during checkout.**
Any summary claiming otherwise is wrong, and this distinction should survive every retelling.

**The fix.** §4 step 8: set it Production only; leave Preview unset (see §2A row 10 for why a fixed Preview value would be wrong).
once confirmed — then redeploy, because public values are baked in at build time (`docs/ENV-VARS-SAFETY.md`,
change procedure step 3).

### Gap 4 — 🟢 LOW · `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is not set anywhere

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

## 4. The isolation plan — owner checklist

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

- [ ] **Step 1 — Narrow the three existing Supabase entries to Production only.**
      For `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`:
      edit each existing entry so its scope is **Production only**. Leave the values untouched — they are
      already the `unretire-prod` values and stay that way.
- [ ] **Step 2 — Add three new Preview-scoped entries with the same names**, holding the **`unretire-test`**
      (ref `dtdadtggahjsrmevwvbu`) values: project URL, publishable key, and secret key. All three must come
      from that one project — a mixed pair produces "invalid API key" failures that the webhook currently
      answers with a success code.
- [ ] **Step 3 — Redeploy the Preview and prove the switch landed.** Run the §8 Proof 1 check. Do not proceed
      until a Preview deployment demonstrably resolves to the test project ref.

### Phase B — Isolate the money (closes Gap 2)

Stripe **test mode lives inside the same Stripe account**, toggled by the dashboard switch. Objects never
sync between the two modes — everything below must be created fresh in test mode.

- [ ] **Step 4 — Create the test-mode objects in Stripe (test mode ON):**
  - [ ] Product **"(Un)Retire Course"** with a **one-time** price of **$99 USD**. Must be one-time — the code
        opens a payment session for this product.
  - [ ] Product **"(Un)Retire Premium"** with a **recurring, yearly** price of **$199 USD/year**. Must be
        recurring — the code opens a subscription session, and a one-time price errors at session creation.
  - [ ] A **test-mode secret API key**.
  - [ ] A **test-mode webhook endpoint** pointing at the Preview **branch alias**
        (`[PREVIEW_URL]/api/stripe/webhook` — use the stable branch alias, never a one-off deployment URL;
        see §6 C2). Subscribe it to exactly two events: **`checkout.session.completed`** and
        **`customer.subscription.deleted`** — the only two the handler acts on. If Preview protection stays
        on, append the automation-bypass query parameter (§6 C3), because Stripe cannot send custom headers.
  - [ ] **Recommended:** a test-mode **promotion code / coupon** mirroring any live one. Promotion codes are
        mode-specific objects, and without one the $0-subscription path (100% off, no card collected) is
        never exercised.
  - [ ] Copy the endpoint's **signing secret** — it is different from the live one and from the local CLI one.
- [ ] **Step 5 — Add four new Preview-scoped entries** (only after Phase A is verified):
      `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_COURSE`, `STRIPE_PRICE_PREMIUM` — all with
      the test-mode values from step 4. **Do not touch the existing Production entries.**

### Phase C — Isolate the email audience

- [ ] **Step 6 — Create a Mailchimp test audience** and add `MAILCHIMP_LIST_ID` as a **Preview-scoped** entry
      holding the test audience id; narrow the existing entry to **Production only**.
      Mirror the live audience's **merge fields** and **tag names** exactly — the field list to match is in
      §5.4, and a mismatch silently drops assessment data (§7 risk 8).
- [ ] **Step 7 — `MAILCHIMP_API_KEY` may stay shared** while the test audience lives in the same Mailchimp
      account (the key selects the account and data centre; the audience id selects the recipients). Split it
      too if a separate account is used.

### Phase D — Close the URL and form gaps

- [ ] **Step 8 — Add `NEXT_PUBLIC_SITE_URL` for the first time**, per environment: **Preview** = the branch
      alias URL; **Production** = the D-2 domain (add it at launch per `docs/LAUNCH-CHECKLIST.md` Phase 2,
      which already carries the "update the site-URL env var in Production, then redeploy" line).
- [ ] **Step 9 — Optional: add `NEXT_PUBLIC_FORMSPREE_ENDPOINT`** in both scopes — a throwaway form for
      Preview, the real endpoint for Production. Note the ceiling in §6 C9: two of the three forms are
      hardcoded and cannot be isolated this way.

### Phase E — Make it real

- [ ] **Step 10 — Redeploy both environments.** Environment changes do not reach deployments that already
      exist, and public (`NEXT_PUBLIC_*`) values are compiled into the build. This is
      `docs/ENV-VARS-SAFETY.md` change-procedure step 3 and `docs/SUPABASE-VERCEL-SETUP.md` A2, and it is the
      single most commonly skipped step in this whole document.
- [ ] **Step 11 — Run every proof in §8 and record the results.** No test suite runs before §8 is green.

### After Phase E — the end state, in one table

| Scope | Database | Money | Email | Inbox |
|---|---|---|---|---|
| **Local** | `unretire-test` | Stripe test mode + local CLI listener | test audience | shared Formspree (accepted) |
| **Preview** | `unretire-test` | Stripe test mode | test audience | shared Formspree (accepted) |
| **Production** | `unretire-prod` | Stripe live mode | live audience | real Formspree |

---

## 5. The fidelity plan

Isolation is now done. This section is the other half: making `unretire-test` a true structural twin of
`unretire-prod`, and keeping it one.

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
| **Site URL** and the **redirect allow-list** | Test = the Preview base plus the Vercel Preview wildcards plus localhost; Production = the D-2 domain. If a redirect target is not on the list, Supabase **silently falls back to the Site URL**, and confirmation and reset links land on the wrong host — a failure that looks like a broken app rather than a config gap. This is `docs/SUPABASE-VERCEL-SETUP.md` B3, applied per project. |
| **"Confirm email" ON/OFF** | **The single most behaviour-changing toggle in the project.** With it OFF, signup returns a live session and goes straight to checkout. With it ON, signup returns "please confirm your email" and no purchase starts. A suite built against the wrong setting exercises a flow production does not have. |
| **Enumeration protection** | Determines which of two code branches handles a duplicate-email signup. Both branches exist; only one is live per setting. |
| **Minimum password length** and **leaked-password protection** | A fixture password that passes in test can be rejected in production. |
| **Email templates** (confirm signup, reset password) | Which template variable is used decides which half of the confirmation route runs. The route handles both, but only the configured one is ever exercised. Copy the templates across. |
| **Token and session expiry, refresh-token rotation** | Govern session refresh and any long-running test. |
| **Enabled providers** | Confirm email/password only, and that production has no extra provider the test project lacks. |
| **SMTP** | Production should use a real SMTP provider; the built-in mailer is not for production. See §6 C7. |

### 5.4 Mailchimp field parity

Mirror into the test audience, and assert as part of setup: merge fields `FNAME`, `WEAKEST`, `WEAKLOW`,
`BRIGHTEST`, `SCORE`, and the eight spoke scores `S_PASSION`, `S_HEALTH`, `S_RELAT`, `S_GROWTH`, `S_SPIRIT`,
`S_FUN`, `S_MONEY`, `S_CONTRIB`; tags `starter-plan`, `wheel-of-life`, and whichever tag each gated download
passes. Diff the two audiences' field and tag lists — a field present in test but missing in live silently
drops assessment data.

### 5.5 Seed data — the fixtures the suite needs

Create these in `unretire-test` only, with obviously-fake names and addresses, per
`docs/testing-setup/SETUP-CHECKLIST.md` Part 2. Record the emails (never passwords) in `docs/FEATURE-LIST.md`
when it is generated. **Create at least one of them through a real test-mode purchase**, so the payment path
itself is proven rather than simulated.

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

## 6. What cannot be made identical

Honest list. Each gap is permanent, and each has a compensating check that covers it another way.

| # | Irreducible gap | Why it cannot be closed | Compensating check |
|---|---|---|---|
| **C1** | **Stripe test mode vs live mode** | Separate object namespaces, separate keys, separate signing secrets. Test cards never reach a bank; live mode has 3-D Secure, fraud rules, and real declines. | Run both products through full test-mode checkout **including a decline card and a 3-D Secure card**. Then, before launch, **one real live purchase** with a real card (a $1 price or a 100%-off code), refunded afterwards — and confirm in the **live** Stripe dashboard that the endpoint logged a success, and that the access record actually appeared in `unretire-prod`. |
| **C2** | **The Preview web address changes on every push** | Each deployment gets a unique URL; a Stripe endpoint pinned to one dies on the next push. | Point the test-mode endpoint at the **stable branch alias**, not a deployment URL. Add a preflight step asserting the endpoint URL matches the deployment under test. And always assert **the access record exists**, never merely that the browser redirected — only the record proves the confirmation arrived. |
| **C3** | **Preview sits behind Vercel's deployment password; Production does not** | Stripe's webhooks cannot send custom headers, so a protected Preview answers Stripe with a login page. | Enable **Protection Bypass for Automation** (`docs/testing-setup/SETUP-CHECKLIST.md` Part 3) and append the bypass as a **query parameter** on the webhook URL — verify in the dashboard, since a header-only bypass would force the local-CLI route instead. Prove it with an unauthenticated request that succeeds. Separately assert Production has **no** protection, so the open request path is covered too. |
| **C4** | **Different regions** — test is in ap-south-1 (Mumbai), production in eu-west-1 (Ireland) | Fixed at project creation; cannot be changed. | **Correctness-neutral; timing only.** Test is further from the app's server region, so tests run *slower* than production — the conservative direction. Record the typical round-trip in both. Treat any test that only passes after a timeout is lengthened as a **defect, not a tuning problem**. Data-residency note: keep only synthetic personal data in the Mumbai project. |
| **C5** | **Free tier vs Pro tier** | `unretire-test` is on the free tier: it auto-pauses after about a week idle, has smaller compute and fewer connections, no point-in-time recovery, and tighter auth-email limits. | A **preflight health check** that pings the test project and fails loudly with "the test project is paused" rather than letting database errors masquerade as app bugs. Never load-test against it. |
| **C6** | **Domain and cookie behaviour** | Preview runs on a `vercel.app` subdomain; Production will run on the D-2 domain. Cookie scope and secure-cookie prefixes behave differently. | After the domain is fixed, re-run the full auth smoke **on Production itself** — sign in, sign out, session survives a refresh, password reset. `docs/LAUNCH-CHECKLIST.md` Phase 2 already carries the "add the new domain to the auth provider's redirect allow-list" line; keep it. |
| **C7** | **Email deliverability** | The test project's built-in mailer is a rate-limited sandbox with poor deliverability. Inbox placement cannot be proven from Preview. | (i) Match production's confirm-email setting so the suite exercises the right flow; (ii) obtain reset tokens through the admin API rather than an inbox; (iii) at launch, one manual real-inbox reset to both a Gmail and an Outlook address, **checking the spam folder** — which is the same discipline `docs/LAUNCH-CHECKLIST.md` Phase 3 already requires for form delivery. |
| **C8** | **Mailchimp has no test mode** | Only audience separation is possible, and a test audience cannot carry identical automated journeys unless they are rebuilt — and firing real journeys is exactly what isolation avoids. | The suite asserts the **contract**: the endpoint reports success and the contact appears in the **test** audience with the right tag and fields. Separately **diff the field and tag lists** between the two audiences (§5.4). Verify the live journeys once, manually, with the owner's own address. |
| **C9** | **Two of the three Formspree forms are hardcoded** | The contact and community forms have no environment indirection, so Preview submissions reach the owner's real inbox. | **Accepted, known non-isolation**, with the owner's sign-off. Mitigate by tagging test submissions with an obvious marker (for example a `[PREVIEW TEST]` prefix) so the owner can filter them; or make the endpoint environment-driven in a later sprint. |
| **C10** | **Abuse controls do not exist yet** (Known issue 5, decision D-9, Sprint S4.5) | When bot protection and rate limiting land, Preview will use test keys that always pass — so the bot check is never genuinely exercised in Preview. | One manual negative test on Production with the real widget, plus a server-side test of the verification-failure path. Note that `docs/TECH-ARCHITECTURE.md` §7 already requires these to fail **closed** in Production. |
| **C11** | **Public values are compiled into the build** | Preview and Production are separate builds with separately baked values. A dashboard change does **not** reach a deployment that already exists. | After changing any `NEXT_PUBLIC_*` value, **redeploy**, then assert the value **in the served page** (for example, read the rendered canonical/Open Graph tag) rather than trusting the dashboard. |
| **C12** | **Data volume and shape** | Production accumulates real users; test starts empty. Query behaviour and "row already exists" edge cases differ. | Seed the §5.5 fixtures, and keep a periodic read-only production sanity query through the approved Profile B connection after launch. |
| **C13** | **Runtime version drift** | Should be identical, but project settings can drift apart. | Pin the runtime version at the project level and confirm both environments report the same build image. |

---

## 7. "Green on Preview but broken in Production"

The owner's core fear, ranked by likelihood × damage. Every entry has a mitigation.

| Rank | The way a green suite still ships a broken Production | Mitigation |
|---|---|---|
| **1** | **The access-record table differs between test and production, and the suite cannot see it.** Production's definition has no committed SQL. If the real table lacks the exact unique constraint, the payment confirmation fails in production while a correctly built test table sails through. Made far worse by the fact that the webhook currently **does not read the database error** — a failed write is answered with a success code, so **Stripe never retries and nothing anywhere records the failure**. The customer pays and gets nothing. | Capture the production definition read-only, **commit it**, build test from the committed file (§5.1), and add a prod-vs-test schema and policy diff to the launch checklist. Separately: fix the swallowed error so a failed write returns a failure and Stripe retries — its own sprint (S4.3 / a bug-fix branch), not this document. |
| **2** | **Auth settings differ — above all "Confirm email".** A suite built against confirm-email-OFF proves nothing about a production with it ON: signup would return "check your inbox" and no purchase would ever start. | The written parity table in §5.3, evidenced from both dashboards, plus one test asserting that observed post-signup behaviour matches the documented production setting. |
| **3** | **The live-mode Stripe wiring is never actually exercised.** A wrong live key, a missing live endpoint, a live endpoint missing the cancellation event, or a stale live signing secret all leave a green test run completely untouched. | The C1 live smoke purchase, plus a dashboard check that the **live** endpoint carries **both** event types and logged a success, plus confirming the live access record landed. |
| **4** | **The known broken paths hide behind shallow assertions.** Known issues 1 and 2 fail *identically* in both environments — so they are not a parity problem, but they are invisible unless the tests assert the right things. The post-payment landing page and the password-reset destination are stale `/unretire/*` paths that 404, and the book download always fails on a stale file path. | The suite must assert the **final landing page loads and shows the success message**, and that the book download returns an actual PDF — not that the browser reached Stripe. A test that stops at "redirected to Stripe" goes green while production is broken. Fixed in **S3.1**, before the Launch Gate run. |
| **5** | **`NEXT_PUBLIC_SITE_URL` — a green suite is honest here, and that is the problem.** Nothing functional breaks, so no test fails; production simply ships localhost canonical and social URLs. | Set it per environment (§4 step 8) and add one test asserting the rendered canonical/Open Graph host equals the deployment host. |
| **6** | **Build-time desync.** A value corrected in the dashboard is absent from the already-built deployment; equally, Production's last build may predate a variable being added. | Redeploy after every environment change and re-run the smoke. Never treat the dashboard as the running state (§6 C11). |
| **7** | **The protection bypass masks an auth problem.** The suite runs against Preview carrying a bypass Production never sees. | Run a small read-only smoke — public pages plus one sign-in with a dedicated production test account — **against Production**, not only Preview. |
| **8** | **Mailchimp fields exist in test but not in live.** The assessment posts thirteen merge fields; behaviour on an unknown field differs and the failure is quiet. | Diff the field and tag lists between the two audiences and assert the exact list pre-launch (§5.4). |
| **9** | **Abuse controls (not built yet) behave differently.** Production will run a real bot check; Preview will use always-pass test keys. | Manual negative test on production plus a server-side test of the verification-failure path (§6 C10). |
| **10** | **The free-tier test project pauses, or hits its email limit mid-run.** Produces **red** tests that look like app bugs — a false alarm, which is the safe direction, but it burns hours. | The C5 preflight health check with an explicit, unmistakable error message. |
| **11** | **Region latency tempts someone to lengthen a timeout.** Low risk, conservative direction. | Record typical round-trips; never lengthen a timeout to make a test pass (§6 C4). |
| **12** | **Subscription lifecycle is only half-implemented — a real gap, not a test gap.** The webhook handles only "checkout completed" and "subscription deleted". There is no handling of a failed renewal payment or a subscription going past-due, so **a Premium member whose card fails keeps access indefinitely** until Stripe deletes the subscription outright. No test can surface a case the code does not implement. | A product decision, not a testing one. Record it and decide before launch whether to handle subscription-updated and failed-payment events. Belongs in `docs/POST-LAUNCH-BACKLOG.md` or a pre-launch sprint. |

### The honest residual risk

State it in these words, because pretending it is zero is how launches go wrong.

**A green Preview suite proves the application logic and the wiring of the test-mode dependencies. It cannot
prove:** the live Stripe credentials, the live webhook endpoint, the production domain, real card-issuer
behaviour (3-D Secure, declines, fraud rules), real email deliverability and spam placement, real bot
traffic, or production data volume.

**What covers the residual, and nothing else does:**

1. **The Production smoke test** on the real domain, same day — `docs/LAUNCH-CHECKLIST.md` Phase 3. It
   already requires a real external-address submission delivered to an inbox, the full sitemap over HTTPS,
   the canonical/Open Graph URLs showing the new domain, and live-domain sign-up / sign-in / reset.
2. **One real manual purchase on the live site** — a live card, a $1 price or a 100%-off code, refunded
   afterwards; confirmed by a success in the **live** Stripe dashboard **and** the access record appearing in
   `unretire-prod` **and** the member actually reaching the content. This is the C1 compensating check.
   ⚠ **`docs/LAUNCH-CHECKLIST.md` Phase 3 does not yet carry this line** — it covers forms, not payments.
   Adding it is required bookkeeping (§9).
3. **The daily morning check** after launch — the 5–7 most critical tests re-run against the live site every
   morning, emailing the owner only on failure, per `docs/testing-setup/TESTING-GUIDE.md` §5 and Sprint S5.2.
   Silence means green. This is what catches the payment path that quietly stops working three weeks after
   launch.

That smoke test is not optional, and it is not an admission that the suite failed. It is the part of the
surface that no preview environment can ever reach.

---

## 8. Verification — proving isolation holds *before* any test runs

**The gate:** no Launch Gate run, and no Playwright suite, starts until every proof below is recorded as
PASS with a date. `docs/testing-setup/SETUP-CHECKLIST.md` Part 2 already makes this a blocker: *"confirm
environment separation… if anything live-keyed leaks into Preview, stop and report."* This section is how
that confirmation is actually performed on this project.

Record the results in the PR that ships the wiring, or in `docs/PROJECT-STATUS.md`.

| # | Proof | How to run it | PASS looks like | FAIL means |
|---|---|---|---|---|
| **P1** | **The Preview deployment resolves to the test project** | On the deployed Preview `[PREVIEW_URL]`, inspect the served page for the Supabase project reference (it is a public value and appears in the deployment's own configuration listing). Compare against both refs. | The reference is **`dtdadtggahjsrmevwvbu`** (`unretire-test`). | It still shows `hcjivvlwxltyiycfbttc` — Phase A did not take effect, most likely because the Preview was not redeployed. Stop. |
| **P2** | **A test signup lands in TEST and is absent from PROD** | Sign up on `[PREVIEW_URL]` with an obviously-fake address. Then look in **both** Supabase dashboards. | The new user exists in `unretire-test` and **does not exist** in `unretire-prod`. | Preview is still writing to production. Stop everything and re-check P1. This is the definitive test — `docs/SUPABASE-VERCEL-SETUP.md` B6 already names it as the wiring verification. |
| **P3** | **Preview auth emails return to the Preview** | From the P2 signup (or a password reset), inspect the link in the email. | The link's host is the Preview origin, not the production domain. | The Supabase redirect allow-list is missing the Preview pattern, so it silently fell back to the Site URL (§5.3). |
| **P4** | **A Preview payment appears only in Stripe TEST mode** | Complete a checkout on `[PREVIEW_URL]` with the standard test card. Check the Stripe dashboard in **both** modes. | The payment appears under **test mode** and **nothing** appears in live mode. | A live key reached Preview. Stop immediately — this is a real-money leak, and `docs/ENV-VARS-SAFETY.md`'s leak procedure applies (rotate first). |
| **P5** | **The payment actually granted access — in the test database** | After P4, check `unretire-test` for the access record, and load the gated content as that fixture user. | The record exists with status active, and the gated page opens. | The webhook did not deliver or the write failed. Check the Stripe endpoint's delivery log; remember the "invalid signature" message can actually mean a missing key (§3 Gap 2), and that a database write error is currently answered with a success code (§7 risk 1) — so a green delivery log does **not** prove the write. |
| **P6** | **The webhook endpoint is reachable through Preview protection** | Send an unauthenticated request to the Preview webhook URL, including the bypass query parameter. | It is handled by the application (a signature rejection is fine — it proves the request reached the app), **not** answered with a login page. | The bypass is header-only or missing (§6 C3). |
| **P7** | **A Preview email capture lands in the TEST audience only** | Submit an email-capture form on `[PREVIEW_URL]`. Check both Mailchimp audiences. | The contact appears in the **test** audience with the right tag; the live audience is unchanged. | `MAILCHIMP_LIST_ID` was not split. |
| **P8** | **The two databases match structurally** | Diff `unretire-test` against `unretire-prod`: table definitions, constraints, indexes, RLS enabled state, and the full policy list on both tables. | No differences on the items listed in §5.1 and §5.2. | The suite is testing a different shape from the one that ships — §7 risk 1. Reconcile before running anything. |
| **P9** | **The auth-settings parity table is filled and evidenced** | Walk §5.3's table in both dashboards and record each pair. | Every row matches, or a difference is recorded with an explicit reason and a compensating check. | Unknown behaviour differences — §7 risk 2. |
| **P10** | **Production has no deployment protection and Preview does** | Request the production URL without any bypass. | Production serves the page directly; Preview does not. | Both request paths are not being covered (§6 C3). |
| **P11** | **The test project is awake** | Preflight ping of `unretire-test` before every suite run. | Responds normally. | Free-tier auto-pause (§6 C5) — resume it and re-run, rather than debugging phantom app errors. |
| **P12** | **No live-keyed value is present in Preview** | Review the Preview scope's variable list in Vercel — **names and scopes only, never values**. | All eleven names present; the Supabase, Stripe and audience entries are Preview-scoped and distinct from Production. | Stop and report — an explicit blocker per `docs/testing-setup/SETUP-CHECKLIST.md` Part 2. |

**Re-run P1, P2, P4 and P8 after any environment change and after any migration.** They are cheap, and they
are the only things standing between a test run and production data.

---

## 9. Bookkeeping this document creates

This file is documentation only; it changes no configuration by itself. The following are required and are
**not** done by writing it:

| # | Required | Owner | Where |
|---|---|---|---|
| 1 | Correct the env-var table in `docs/PROJECT-STATUS.md` §9 — the four Stripe rows are **Production only**, and `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_FORMSPREE_ENDPOINT` are **not set anywhere** | agent, in the sprint that owns that file | `docs/PROJECT-STATUS.md` §9 |
| 2 | Correct the same rows in `docs/TECH-ARCHITECTURE.md` §6, and flip §4's *"Local, Preview, and Production do not share writable production data — Unverified"* to **verified false, remediation tracked here** | agent, same sprint | `docs/TECH-ARCHITECTURE.md` §4, §6 |
| 3 | Add the **live manual purchase** line to the post-launch smoke test — the checklist currently verifies forms, not payments | agent, launch sprint | `docs/LAUNCH-CHECKLIST.md` Phase 3 |
| 4 | Run the §4 owner checklist in the dashboards | **owner** | Vercel / Stripe / Supabase / Mailchimp |
| 5 | Capture and commit the production `entitlements` definition, then build the test project from it | agent + owner approval | Sprint **S4.3** |
| 6 | Record the §8 proof results with dates | agent | the wiring PR, or `docs/PROJECT-STATUS.md` |
| 7 | Decide whether to handle failed-renewal / subscription-updated events before launch (§7 risk 12) | **owner** | new decision entry, or `docs/POST-LAUNCH-BACKLOG.md` |
| 8 | Record the Formspree non-isolation (§6 C9) as accepted, with the owner's sign-off | **owner** | `docs/PROJECT-STATUS.md` open decisions |

**Reference for this document's own delivery:** branch `[BRANCH]`, PR `#[PR_NUMBER]` (`[PR_URL]`), head
`[HEAD_SHA]`, Preview `[PREVIEW_URL]`, reviewed `[DATE]`.

---

Next step → run §4 as the owner, then §8 as the gate, then `docs/testing-setup/SETUP-CHECKLIST.md` and
`/activate-testing` (Sprint S5.1). Before touching any value, re-read `docs/ENV-VARS-SAFETY.md`; before
touching any schema, re-read `docs/templates/SUPABASE-CHANGE-TEMPLATE.md`.
