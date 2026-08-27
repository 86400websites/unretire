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
| Live site | Served at **`https://unretire.vercel.app`** — working. The custom domain is NOT connected yet (Part 4). |
| Live Stripe product **UnRetire — Course** | $99 USD, one-time — correct |
| Live Stripe product **UnRetire — Premium** | $199 USD, **per year** — correct |
| Live webhook `brilliant-splendor` | ✅ Repointed to `https://unretire.vercel.app/api/stripe/webhook` on 2026-08-25 — verified receiving |
| Sandbox products **Course (Test)** $99 and **Premium (Test)** $199/yr | Already exist |
| GitHub branch protection on `master` | Done — **PR-before-merge rule enabled (owner-confirmed 2026-08-26)**. The required "Code Check" status is added in S2.1 once CI exists |
| `.env.example` and the 5 Claude skills in the repo | Done — every clone gets them |
| Supabase test project `unretire-test` | Exists |

### Never touch these — they belong to other projects

- Stripe product **The Singapore Way (PDF)**
- Stripe webhook **the-singapore-way** to `thesingaporeway.com`
- Stripe webhook **upbeat-splendor** to `…amplifyapp.com` *(shows 100% errors — not ours)*
- Stripe products named **pkprobe** *(leftover test junk in the live account — harmless, leave alone)*

---

## PART 1A — 🔴 DO THIS FIRST · 2 minutes · live payments are affected

I traced where your live Stripe webhook actually lands. It is configured to
`https://www.unretireproject.com/api/stripe/webhook`, but that address is not connected to your site yet —
a request there gets redirected once and then hits a **GoDaddy "page not found"**.

**What that means:** if a real customer pays today, Stripe cannot tell your site about it, so the customer
is charged and **does not get access**. (Checkout itself works fine — it is only the "tell the site" step
that is broken.)

- [x] **1A.1** Stripe → **live mode** (not Sandbox) → **Developers** → **Webhooks** → click
      **brilliant-splendor** → **Update details** → change the URL to exactly:
      `https://unretire.vercel.app/api/stripe/webhook` → Save.

> **Why this is safe:** editing the address keeps the same signing secret, so nothing in Vercel needs to
> change. You are touching one field on one destination. No other project is affected.

> ⚠ **Do not delete the `charming-dream` destination** (the half-a-life one) yet. It is still reachable and
> may be the only thing currently granting access to anyone who has paid. We remove it *after* 1A.1 is
> verified working.

- [x] **1A.2** Tell me when done — I will verify the endpoint responds correctly, and we can check Stripe's
      recent events together to see whether anyone paid without getting access.

---

## PART 1 — Stage 1 · MERGED — stage gate in remediation (updated 2026-08-26)

- [x] **1.1–1.3** Protection Bypass enabled ✓
- [x] **1.4** PR is **#1** — https://github.com/86400websites/unretire/pull/1 ✓ (I looked it up, no need to send it)
- [x] **1.5** ~~Re-run the Codex review with the prompt I give you, then **merge PR #1 yourself**.~~ Done 2026-08-26 — the per-PR review reached **APPROVE at round 9** and you merged PR #1 (merge commit `1309e01`) ✓
- [x] **1.6** *(closed 2026-08-27, S1.6 — all three of its actions completed on 2026-08-26; it had been
      left rendering as an open checkbox.)* The stage gate (Round 3, 2026-08-26) returned **STAGE NOT
      APPROVED** — 8 documentation findings, all fixed by sprint **S1.2** (branch
      `claude/s1.2-stage-remediation`, docs only). Your actions, in order:
      ~~(a) dispatch the S1.2 per-PR review; (b) merge the S1.2 PR on APPROVE; (c) dispatch stage-gate
      Round 4~~ — **all three done 2026-08-26**: S1.2 per-PR APPROVE (round 2) → PR #2 merged (`4c3d52e`)
      → Round 4 dispatched and returned **STAGE NOT APPROVED** (5 cumulative findings).
- [x] **1.7** ~~(added 2026-08-26) The Round-4 findings are being fixed by sprint S1.3…~~ **Done
      2026-08-26**: S1.3 per-PR APPROVE (round 2) → PR #3 merged (`ae78679`) → stage-gate **Round 5**
      dispatched and returned **STAGE NOT APPROVED** (1 Blocking + 2 Should-fix; 7 of 8 exit criteria
      VERIFIED).
- [x] **1.8** ~~(added 2026-08-26) The Round-5 findings are being fixed by sprint S1.4…~~ **Done
      2026-08-27**: S1.4 per-PR APPROVE (round 2) → PR #4 merged (`f61082c`) → stage-gate **Round 6**
      dispatched and returned **STAGE NOT APPROVED** (3 pinpoint findings; 7 of 9 exit criteria VERIFIED).
- [x] **1.9** ~~(added 2026-08-27) The Round-6 findings are being fixed by sprint S1.5…~~ **Done
      2026-08-27**: S1.5 per-PR **APPROVE on round 1** → PR #5 merged (`4c8228f`). That review also
      returned the complete 22-item enumeration now closed by S1.6.
- [x] **1.10** ~~(added 2026-08-27) Two decisions I need from you~~ — **both answered 2026-08-27: you
      chose to revert PRs #6/#7 wholesale and redo that work later through the normal process.** That
      resolved **D-15** (the disclaimers are back on the live pages, so the exposure is closed) and
      **D-16** (every contributor PR goes through the per-PR review, as WORKFLOW §6–§7 already says;
      reverted work needs no retroactive review record). Sprint **S1.7** performed the revert.
      *(Original text, struck for the record:)* ~~**Two decisions I need from you — neither blocks S1.6, both matter:**
      **(a) D-15 — unlabelled placeholder testimonials are live right now.** PR #7 removed the
      "these are placeholders" notes from the book and stories pages, but the four invented
      testimonials ("Reader name, former executive" …) are still on `/book`. Pick one: restore a
      one-line disclaimer, send me real attributions, or remove those four quotes. I will not change
      `src/` until you choose.
      **(b) D-16 — teammate PRs bypassed the review chain.** PRs #6 and #7 merged straight to `master`
      with no independent review. Until S2.1's CI exists, that review is the *only* live gate. Tell me
      whether every contributor's PR goes through it (recommended) or whether small content edits get a
      recorded exception — and whether those two PRs should get a retroactive review record.~~
- [x] **1.11** ~~(updated 2026-08-27) Two stacked PRs, merged in order.~~ **Done 2026-08-27:** S1.6 merged as PR #8 (`8062cbe`) — ⚠ before its review, which then ran post-merge and returned REQUEST CHANGES (**D-17**); S1.7 merged as PR #9 (`87e89c6`) after per-PR **APPROVE**. *(Original text, struck:)* ~~Your actions:
      (a) dispatch the S1.6 per-PR review brief `docs/code-reviews/S1.6-current-state-truth-pass-review.md`
      (PR open, head `692ed9d`) and **merge S1.6** on APPROVE;
      (b) dispatch the S1.7 per-PR review brief
      `docs/code-reviews/S1.7-revert-out-of-chain-changes-review.md` and **merge S1.7** on APPROVE — this
      is the revert, so `src/` returns to the last reviewed baseline;
      (c) dispatch stage-gate **Round 7** — `docs/code-reviews/S1-stage-review.md`, re-pinned per its
      Round 7 stub. **S2.1 starts only after Round 7 returns STAGE APPROVED.**
      *(The two teammate branches `feat/remove-life` and `feat/remove-2` were deleted from the remote at
      your request — their commits remain in `master`'s history, so nothing is lost.)*~~
- [ ] **1.12** (added 2026-08-27) **The last two steps before Stage 2.**
      (a) Dispatch the S1.8 per-PR review brief `docs/code-reviews/S1.8-state-sync-round7-repin-review.md`
      and **merge S1.8** on APPROVE — it closes the last Should-fix and re-pins the stage brief.
      (b) Dispatch stage-gate **Round 7** — `docs/code-reviews/S1-stage-review.md`, already pinned to
      `0983ad5..87e89c6` and dispatch-ready. **Two things that round must disposition, both disclosed in
      the brief:** the PR #8 merge-before-review deviation (**D-17** — you choose whether to accept it as a
      recorded deviation with its compensating controls), and the reverted out-of-chain commits.
      **S2.1 starts only after Round 7 returns STAGE APPROVED.**
  *(Superseded detail of items 1.7–1.9, preserved struck for the record — **not open actions**:)*
  ~~(added 2026-08-27, item 1.9) The Round-6 findings are being fixed by sprint **S1.5**
      (`claude/s1.5-stage-remediation-4`). Your actions, in order:
      (a) when the S1.5 PR is open and its Preview built, dispatch the per-PR review brief
      `docs/code-reviews/S1.5-stage-remediation-4-review.md`;
      (b) **merge the S1.5 PR** on APPROVE;
      (c) dispatch stage-gate **Round 7** — `docs/code-reviews/S1-stage-review.md`, re-pinned per its
      Round 7 stub. **S2.1 starts only after Round 7 returns STAGE APPROVED.**~~
  ~~(added 2026-08-26) The Round-5 findings are being fixed by sprint **S1.4**
      (`claude/s1.4-stage-remediation-3`). Your actions, in order:
      (a) when the S1.4 PR is open and its Preview built, dispatch the per-PR review brief
      `docs/code-reviews/S1.4-stage-remediation-3-review.md`;
      (b) **merge the S1.4 PR** on APPROVE;
      (c) dispatch stage-gate **Round 6** — `docs/code-reviews/S1-stage-review.md`, re-pinned per its
      Round 6 stub. **S2.1 starts only after Round 6 returns STAGE APPROVED.**
      *(Original 1.7 text, preserved struck for the record:)* ~~The Round-4 findings are being fixed by
      sprint **S1.3** (`claude/s1.3-stage-remediation-2`). Your actions, in order: (a) when the S1.3 PR is
      open and its Preview built, dispatch the per-PR review brief
      `docs/code-reviews/S1.3-stage-remediation-2-review.md`; (b) merge the S1.3 PR on APPROVE; (c)
      dispatch stage-gate Round 5 — `docs/code-reviews/S1-stage-review.md`, re-pinned per its Round 5 stub
      (same merge-base, new head = the S1.3 merge commit). S2.1 starts only after Round 5 returns STAGE
      APPROVED~~ (the standing reminder stays true: during S2.1 you add the required **"Code Check"**
      status to the existing `master` protection rule — the PR-before-merge half is already enabled,
      confirmed 2026-08-26).

---

## PART 2 — Supabase login links · REVIEWED

### 2A — Production (`unretire-prod`) — two entries to REMOVE

Site URL `https://www.unretireproject.com` ✓ and 7 redirect URLs. Five are right. Two should go:

- [x] **2.7** Delete `https://half-a-life.vercel.app/**` — I checked it: that address serves a **different
      website** ("Half a Life"), which you confirmed is now a separate repo. Any address on this list is
      allowed to receive a login token, so leaving someone else's site on it is a needless risk.
- [x] **2.8** Delete `https://*-86400websites.vercel.app/**` — an old Vercel account name. Yours is now
      `86400-s-projects`, which is already on the list. *(If you still use that older account for this
      project, tell me and we keep it.)*

- [x] **2.9** ⚠ Change **Site URL** to `https://unretire.vercel.app` for now. Your custom domain is not
      live yet (see Part 4) — it currently shows a GoDaddy "Launching Soon" page. We switch Site URL to
      the real domain on the day DNS goes live. **Keep all the unretireproject.com entries in the redirect
      list** — they cost nothing and will be needed.

> ✓ Keep these five: `www.unretireproject.com/**`, `unretireproject.com/**`,
> `*-86400-s-projects.vercel.app/**`, `unretire.vercel.app/**`, `localhost:3000/**`

### 2B — Test (`unretire-test`) — ✅ perfect, nothing to do

Site URL `http://localhost:3000` with `localhost:3000/**` and `*-86400-s-projects.vercel.app/**`.
Exactly right — minimal and correct.

---

## PART 3 — Preview separation

### 3A — Please confirm two things

I cannot check this from outside (the Preview is password-protected, and this particular setting never
reaches the public page), so I need you to verify:

- [x] **3.10** In Vercel → Environment Variables, use the **All Environments** dropdown → pick **Preview**.
      Confirm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`
      all appear. Then switch it to **Production** and confirm they appear there too. Send me a screenshot
      of each.
- [x] **3.11** ⚠ Change the two `NEXT_PUBLIC_…` ones from **Secret** to **Config**. You saved them as
      Secret, which makes them permanently unreadable — so neither of us can ever check they hold the right
      value. Delete each and re-add with Type **Config**. *(They are a web address and a restricted key —
      both are meant to be public. This is exactly what Vercel's red warning is telling you.)*
- [x] **3.12** After any variable change, Vercel → **Deployments** → find the newest Preview → **Redeploy**.
      Environment values are baked in at build time; without a redeploy nothing actually changes.

### 3B — Stripe test setup · your webhook question answered

**You were right to worry.** A Preview address contains the branch name, so it changes every sprint and any
webhook pointed at it would break. The fix is a permanent branch that always has the same address:

- [x] **3.13** GitHub → **Branches** → **New branch** → name it `staging`, from `master`.
      That gives you one address that never changes:
      `https://unretire-git-staging-86400-s-projects.vercel.app`
- [x] **3.14** Sandbox → **Developers** → **Webhooks** → **Add destination**:
  - Destination type: **Webhook endpoint**
  - URL: `https://unretire-git-staging-86400-s-projects.vercel.app/api/stripe/webhook`
  - API version: leave as shown (`2026-06-24.dahlia` matches our code)
  - Events: **Selected events** → tick `checkout.session.completed` and `customer.subscription.deleted`
  - Save → copy the **Signing secret** (`whsec_…`)

> **Set this up once and it works forever.** All future testing runs against the `staging` branch, so the
> webhook address never changes again — whatever sprint or branch we happen to be on.

- [x] **3.15** ✅ **Yes — you only add the Preview ones.** Your four Stripe variables are already scoped
      **Production only**, which is correct. Do not touch them. Just **Add New** these four, each ticked
      **Preview only**, Type **Secret**:

| Name | Value comes from |
|---|---|
| `STRIPE_SECRET_KEY` | Sandbox → Developers → API keys → Secret key (`sk_test_…`) |
| `STRIPE_PRICE_COURSE` | Sandbox → **UnRetire — Course (Test)** → price ID |
| `STRIPE_PRICE_PREMIUM` | Sandbox → **UnRetire — Premium (Test)** → price ID |
| `STRIPE_WEBHOOK_SECRET` | step 3.14 |

---

## PART 4 — Domain

- [ ] **4.3** ⚠ **Your domain is not live yet.** I checked both `unretireproject.com` and
      `www.unretireproject.com` — both return a **GoDaddy "Launching Soon" parking page**, not your site.
      Adding it in Vercel is only half the job; the **DNS records at GoDaddy must point to Vercel**.
      Vercel → **Settings** → **Domains** → click your domain → it shows the exact records to create.
      Copy those into GoDaddy → DNS. Then tell me and I will verify it end to end.
- [x] **4.4** Until DNS is done, set `NEXT_PUBLIC_SITE_URL` to `https://unretire.vercel.app`
      (Production, Type **Config**). Right now it points at the parking page. We switch it on launch day.

> **Your real live site today is `https://unretire.vercel.app`.** That is what customers reach, and it is
> working fine. Nothing is broken — the pretty address just is not connected yet.

- [x] **4.2** `half-a-life.vercel.app` — answered: separate repo now. I will handle removing its leftover
      live Stripe webhook carefully in a later sprint; **do not delete anything there yourself yet.**

---

## PART 4B — 🚀 THE DAY YOUR DOMAIN GOES LIVE

Save this. When DNS is done and `https://www.unretireproject.com` shows your site (not the GoDaddy page),
do exactly these five, in this order. **You do not touch any secret — every value here is a public address.**

- [ ] **L1** Vercel → Environment Variables → `NEXT_PUBLIC_SITE_URL` (Production) →
      change to `https://www.unretireproject.com`
- [ ] **L2** Supabase → **unretire-prod** → Authentication → URL Configuration →
      **Site URL** → change to `https://www.unretireproject.com` → Save
      *(Leave the redirect list alone — `unretire.vercel.app/**` stays as a useful fallback.)*
- [ ] **L3** Stripe → **live mode** → Webhooks → **brilliant-splendor** → Update details →
      Endpoint URL → `https://www.unretireproject.com/api/stripe/webhook` → Save
      *(Signing secret is preserved, so no Vercel change is needed — same as last time.)*
- [ ] **L4** Vercel → Deployments → newest **Production** deployment → **Redeploy**
- [ ] **L5** Tell me. I verify the domain, the webhook endpoint and the login links end to end.

> **That's the whole list.** Your instinct was right — it is the Supabase URL and the Stripe webhook, plus
> the site-URL variable and a redeploy. Nothing else moves.
>
> **Nothing here touches the Sandbox setup.** Test webhooks keep pointing at the `staging` address forever;
> that is the entire reason we used a permanent branch.

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
