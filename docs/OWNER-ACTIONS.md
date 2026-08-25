# Your Checklist — (Un)Retire

Tick each box as you go. Nothing here needs code. Do the sections **in order**.

> **The rule that protects everything:** your live Stripe account is shared with other projects
> (The Singapore Way, and others). **Sandbox/Test mode is a completely separate account** — Stripe gives it
> a different account ID entirely. Nothing you do in Sandbox can touch a real customer or a real payment.
> When this checklist says "Sandbox", you are safe. When it says "live", go slowly.

---

## PART 0 — Already working. Do not change these.

| Thing | State |
|---|---|
| Live site `www.unretireproject.com` | Live and serving |
| Live Stripe product **UnRetire — Course** | $99 USD, one-time — correct |
| Live Stripe product **UnRetire — Premium** | $199 USD, **per year** — correct |
| Live webhook `brilliant-splendor` to `www.unretireproject.com/api/stripe/webhook` | Active, 0% errors |
| Sandbox products **Course (Test)** $99 and **Premium (Test)** $199/yr | Already exist |
| GitHub branch protection on `master` | Done |
| `.env.example` and the 5 Claude skills in the repo | Done — every clone gets them |
| Supabase test project `unretire-test` | Exists |

### Never touch these — they belong to other projects

- Stripe product **The Singapore Way (PDF)**
- Stripe webhook **the-singapore-way** to `thesingaporeway.com`
- Stripe webhook **upbeat-splendor** to `…amplifyapp.com` *(shows 100% errors — not ours)*
- Stripe products named **pkprobe** *(leftover test junk in the live account — harmless, leave alone)*

---

## PART 1 — DO NOW, to finish Stage 1 · about 10 minutes

*Why: the reviewer cannot approve the pull request until it can actually see the Preview site working.*

- [ ] **1.1** Vercel → project **unretire** → **Settings** → **Deployment Protection**.
- [ ] **1.2** Find **Protection Bypass for Automation** → turn it **ON** → generate the secret.
- [ ] **1.3** Copy that secret into Vercel → **Settings** → **Environment Variables** → **Add New**:
      Name `VERCEL_AUTOMATION_BYPASS_SECRET`, tick **Preview** only, Type **Secret**.
      *(Do not paste it in chat. I only ever refer to it by name.)*
- [ ] **1.4** Tell me **"bypass is on"**, plus the **pull request number** (top of the PR page, e.g. `#43`).
- [ ] **1.5** After I record the Preview evidence, re-run the Codex review, then **merge the PR yourself**.

> **Why 1.1–1.3:** your Preview site currently shows a Vercel login screen, so no robot — and no reviewer —
> can open it. This switch keeps Preview private from the public but lets our automated tests in.

---

## PART 2 — Supabase login links · about 10 minutes · FIXES A LIVE BUG

*Why: right now the "confirm your email" and "reset your password" links you send real customers point at
`localhost:3000` — a page that only exists on a developer's laptop. Nobody can reset a password today.*

### 2A — Production project (`unretire-prod`)

- [ ] **2.1** Supabase → project **unretire-prod** → **Authentication** → **URL Configuration**.
- [ ] **2.2** Set **Site URL** to exactly `https://www.unretireproject.com` → **Save changes**.
- [ ] **2.3** Under **Redirect URLs** click **Add URL** for each of these, one at a time:
  - `https://www.unretireproject.com/**`
  - `https://unretireproject.com/**`
  - `https://*-86400-s-projects.vercel.app/**`

### 2B — Test project (`unretire-test`)

- [ ] **2.4** Supabase → project **unretire-test** → **Authentication** → **URL Configuration**.
- [ ] **2.5** Set **Site URL** to `http://localhost:3000` → **Save changes**.
- [ ] **2.6** Add these **Redirect URLs**:
  - `http://localhost:3000/**`
  - `https://*-86400-s-projects.vercel.app/**`

> Password reset will still be broken after this — it *also* points at an old web address that no longer
> exists. I fix that half in the code (Stage 3). **Both** are needed. This half is yours.

---

## PART 3 — Separate Preview from Production · about 20 minutes · ORDER MATTERS

*Why: today your Preview site is wired to your **real** database. Any test would create real users and real
purchase records in live data. This section moves Preview onto the test database.*

> ### Do 3A completely before starting 3B.
> If you add Stripe test keys while Preview is still on the real database, test payments would write
> **real access rights** into your live customer data.

### 3A — Point Preview at the test database

First open Supabase → **unretire-test** → **Settings** → **API Keys** and keep that tab open.

Then, in Vercel → **Settings** → **Environment Variables**, do these two steps for **each** of the three
names below:

- [ ] **3.1** Click the existing variable → **Environments** → **untick Preview** (leave Production ticked) → **Save**.
- [ ] **3.2** Click **Add New** → type the **same name**, spelled identically → paste the **unretire-test**
      value → tick **Preview** only → set the Type from the table → **Save**.
- [ ] **3.3** Repeat 3.1 and 3.2 for all three.

| Name | Type |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Config** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Config** |
| `SUPABASE_SECRET_KEY` | **Secret** |

> **Keep the names exactly the same.** The code looks for those precise spellings. Picture one labelled box
> whose contents differ depending on which room it sits in — Vercel's Preview/Production tickboxes *are* the
> separation. Renaming anything to "…_TEST" would break the site.

> **About Vercel's red warning:** the two `NEXT_PUBLIC_…` values are meant to be public (a web address and a
> restricted key), so set them to **Config**. That is exactly what the warning is asking for, and it is safe.
> `SUPABASE_SECRET_KEY` stays **Secret**.

### 3B — Give Preview its own Stripe test setup

Everything here happens in the **Sandbox** account. It cannot affect live.

- [ ] **3.4** Stripe → switch to **Sandbox** → **Product catalog** → **UnRetire — Course (Test)** →
      copy its **price ID** (starts with `price_`).
- [ ] **3.5** Same for **UnRetire — Premium (Test)** → copy its price ID.
- [ ] **3.6** Sandbox → **Developers** → **API keys** → copy the **Secret key** (`sk_test_…`).
- [ ] **3.7** Sandbox → **Developers** → **Webhooks** → **Add destination**:
  - URL: `https://unretire-git-claude-r1-system-retrofit-86400-s-projects.vercel.app/api/stripe/webhook`
  - Events: `checkout.session.completed` and `customer.subscription.deleted`
  - Save, then copy the **Signing secret** (`whsec_…`).
- [ ] **3.8** In Vercel add these four, **all ticked Preview only**, all Type **Secret**:

| Name | Value comes from |
|---|---|
| `STRIPE_SECRET_KEY` | step 3.6 |
| `STRIPE_PRICE_COURSE` | step 3.4 |
| `STRIPE_PRICE_PREMIUM` | step 3.5 |
| `STRIPE_WEBHOOK_SECRET` | step 3.7 |

- [ ] **3.9** Tell me when 3A and 3B are done. I then **prove** the separation before we test anything:
      a signup on Preview must appear in `unretire-test` and **not** in `unretire-prod`.

---

## PART 4 — Small fixes · about 5 minutes

- [ ] **4.1** Vercel → **Add New** → `NEXT_PUBLIC_SITE_URL` = `https://www.unretireproject.com` →
      tick **Production only** → Type **Config**. Leave Preview unticked; each Preview has its own address.
      *Why: link previews on WhatsApp and LinkedIn currently point at localhost.*
- [ ] **4.2** Answer one question: is `half-a-life.vercel.app` still needed? Your live Stripe still sends
      real payment events to it and it is still running. **Do not delete anything yet** — just tell me, and
      I will check whether removing it is safe.

---

## PART 5 — Later, when we reach testing

Nothing to do now. When we get there I will walk you through creating two fake test users in
`unretire-test`, connecting the Supabase MCP tools, setting up Sentry error alerts, and approving the
feature list before any test is written.

---

## What I need back from you

1. "Bypass is on" + the **pull request number**
2. Confirmation when **Part 2** is done
3. Confirmation when **Part 3A** is done, then again when **3B** is done
4. Your answer on `half-a-life.vercel.app`

**Never paste a secret key into chat.** Values go into the Vercel or Supabase screens only; names are fine.
If a secret is ever exposed, **rotate it at the provider first**, then tell me.

*Your live publishable key `pk_live_…` appeared in a screenshot. That one is designed to be public and ships
in every visitor's browser, so no action is needed. Your secret keys stayed masked.*
