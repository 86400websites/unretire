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
| Live site | ~~Served at **`https://unretire.vercel.app`** — working. The custom domain is NOT connected yet (Part 4).~~ **Served at `https://www.unretireproject.com` since 2026-08-27** — the custom domain is live. `https://unretireproject.com` (no www) redirects to it, and `https://unretire.vercel.app` still answers as a fallback. |
| Live Stripe product **UnRetire — Course** | $99 USD, one-time — correct |
| Live Stripe product **UnRetire — Premium** | $199 USD, **per year** — correct |
| Live webhook `brilliant-splendor` | ~~✅ Repointed to `https://unretire.vercel.app/api/stripe/webhook` on 2026-08-25 — verified receiving~~ ✅ Repointed to `https://www.unretireproject.com/api/stripe/webhook` on 2026-08-27 (Part 4B, L3) — verified 2026-08-27: I sent the endpoint a deliberately wrong signature and it answered "Invalid signature", which proves the route is live on the new address with the live secret in place |
| Sandbox products **Course (Test)** $99 and **Premium (Test)** $199/yr | Already exist |
| GitHub branch protection on `master` | Done — **PR-before-merge rule enabled (owner-confirmed 2026-08-26)**. ~~The required "Code Check" status is added in S2.1 once CI exists~~ The "Code Check" workflow is live on `master` since the S2.1 merge (PR #11, 2026-08-27) and ran green on that PR; ~~making it a **required** status is **your** action — see Part 1B (confirmation pending)~~ **— done 2026-08-27 and verified from GitHub's API: the rule requires the check `code-check`** |
| `.env.example` and the 5 Claude skills in the repo | Done — every clone gets them |
| Supabase test project `unretire-test` | Exists |

### Never touch these — they belong to other projects

- Stripe product **The Singapore Way (PDF)**
- Stripe webhook **the-singapore-way** to `thesingaporeway.com`
- Stripe webhook **upbeat-splendor** to `…amplifyapp.com` *(shows 100% errors — not ours)*
- Stripe products named **pkprobe** *(leftover test junk in the live account — harmless, leave alone)*

---

## PART 1A — 🔴 DO THIS FIRST · 2 minutes · live payments are affected

> **Superseded 2026-08-27 (Part 4B, L3):** the endpoint is back on `https://www.unretireproject.com/api/stripe/webhook`,
> which is live and verified. This section is kept for the record — nothing here is still to do.

I traced where your live Stripe webhook actually lands. It is configured to
`https://www.unretireproject.com/api/stripe/webhook`, ~~but that address is not connected to your site yet —~~
~~a request there gets redirected once and then hits a **GoDaddy "page not found"**~~ *(true on 2026-08-25; that address is live since 2026-08-27)*.

**What that means:** if a real customer pays today, Stripe cannot tell your site about it, so the customer
is charged and **does not get access**. (Checkout itself works fine — it is only the "tell the site" step
that is broken.)

- [x] **1A.1** Stripe → **live mode** (not Sandbox) → **Developers** → **Webhooks** → click
      **brilliant-splendor** → **Update details** → change the URL to exactly:
      ~~`https://unretire.vercel.app/api/stripe/webhook`~~ → Save. *(Done 2026-08-25; moved again to
      `https://www.unretireproject.com/api/stripe/webhook` on 2026-08-27 — Part 4B, L3.)*

> **Why this is safe:** editing the address keeps the same signing secret, so nothing in Vercel needs to
> change. You are touching one field on one destination. No other project is affected.

> ⚠ **Do not delete the `charming-dream` destination** (the half-a-life one) yet. It is still reachable and
> may be the only thing currently granting access to anyone who has paid. We remove it *after* 1A.1 is
> verified working.

- [x] **1A.2** Tell me when done — I will verify the endpoint responds correctly, and we can check Stripe's
      recent events together to see whether anyone paid without getting access.

---

## PART 1 — Stage 1 · MERGED — ~~stage gate in remediation (updated 2026-08-26)~~ stage gate STAGE APPROVED (owner-confirmed 2026-08-27; returned record to be pasted by the owner)

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
- [ ] **1.12** ~~(added 2026-08-27) **The last two steps before Stage 2.**~~ **(updated 2026-08-27) Both
      steps are done — two review records still need to be pasted into the repo.**
      (a) ~~Dispatch the S1.8 per-PR review brief `docs/code-reviews/S1.8-state-sync-round7-repin-review.md`
      and **merge S1.8** on APPROVE — it closes the last Should-fix and re-pins the stage brief.~~
      **Done 2026-08-27:** S1.8 merged as **PR #10** (`9d838da`). You confirmed on 2026-08-27 that Codex
      **APPROVED** it. Please paste the returned review into
      `docs/code-reviews/S1.8-state-sync-round7-repin-review.md` so the record is complete.
      (b) ~~Dispatch stage-gate **Round 7** — `docs/code-reviews/S1-stage-review.md`, already pinned to
      `0983ad5..87e89c6` and dispatch-ready. **Two things that round must disposition, both disclosed in
      the brief:** the PR #8 merge-before-review deviation (**D-17** — you choose whether to accept it as a
      recorded deviation with its compensating controls), and the reverted out-of-chain commits.
      **S2.1 starts only after Round 7 returns STAGE APPROVED.**~~
      **Round 7 returned STAGE APPROVED** (you told me 2026-08-27; returned record to be pasted by the owner). Please
      paste the reviewer's returned record into the Round 7 stub in `docs/code-reviews/S1-stage-review.md`.
      Until it is filed I cannot read how the round dispositioned **D-17**, so D-17 stays open with a dated
      note. On your word, Stage 1 is closed and Stage 2 has started with **S2.1** (Part 1B).
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
      confirmed 2026-08-26).~~

---

## PART 1B — Stage 2 · S2.1 Code Check (added 2026-08-27)

Sprint **S2.1** was built on branch `claude/s2.1-code-check-ci` and **merged on 2026-08-27 as PR #11** after the
Codex review approved it. It adds the automatic **"Code Check"** that runs on every pull request — typecheck, lint, formatting
check, build and a dependency-vulnerability audit (plus unit tests, once they exist). The check **runs** on every PR ~~, but nothing **requires** it until you add it to the `master`
protection rule — and only you can do that~~ **and, since 2026-08-27, is a required status: a red PR cannot be
merged**. ~~Until then a red PR can still be merged by hand, so the gate
counts as pending until you confirm it locks.~~ **You did that on 2026-08-27: the `master` ruleset now requires
the `code-check` status (I confirmed it from GitHub's own API), so a red PR cannot be merged. The gate is closed.**

- [x] **1B.1** *(done 2026-08-27 — PR #11)* GitHub → **Pull requests** → **New pull request** → base `master`, compare
      `claude/s2.1-code-check-ci` → title suggestion: **"S2.1 — Code Check CI"** → Create.
- [x] **1B.2** *(done 2026-08-27 — green at `3f695a7`, run 33063383071, after the first runs failed at `actions/setup-node`: pnpm 11 needs Node 22.13+ and the workflow pinned Node 20; fixed by pinning Node 24)* On the PR's **Checks** tab, wait for **"Code Check"** to appear and go green. *(It should —
      I ran the same checks locally at the branch head and every one passed.)*
- [x] **1B.3** *(received 2026-08-27 — PR #11; Preview https://unretire-git-claude-s21-code-check-ci-86400-s-projects.vercel.app)* Send me the **PR number** and the **Preview URL**.
- [x] **1B.4** ✅ **DONE 2026-08-27 — and I confirmed it from GitHub's own API, so this is fact, not assumption:** the `master` rule now requires the check `code-check`, with "Require branches to be up to date" left off exactly as recommended. **A red PR can no longer be merged.** *(Original instruction, kept for the record:)* ~~This is the one open item~~ — and your screenshot of 2026-08-27 showed exactly where to do it.
      Your protection is a **Ruleset** called **"Protect master"** (not the older "branch protection rule"
      screen), and it is already **Active** with an **empty bypass list** — so nobody, including you, can
      slip past it. Three of its rules are on: *Restrict deletions*, *Require a pull request before
      merging*, *Block force pushes*. The one that is off is the one we need:

      GitHub → **Settings** → **Rules** → **Rulesets** → **Protect master** → scroll to **Branch rules** →
      1. tick **"Require status checks to pass"**;
      2. a panel opens under it — click **"+ Add checks"** (or the search box), type **Code Check**, and
         **select it** so it is listed;
      3. leave **"Require branches to be up to date before merging"** **unticked** *(optional and stricter:
         it forces every PR to re-run against the newest `master` before it can merge — useful on a busy
         repo, needless churn on this one; not part of the `docs/TECHNICAL-INTEGRITY.md` spec)*;
      4. click **Save changes** at the bottom.

      **Do not tick anything else** on that page — the other rules (linear history, signed commits,
      deployments, code scanning, code quality, coverage, Copilot review) are outside what this project
      needs, and each one adds a way for a PR to get stuck.
- [x] **1B.5** ✅ **Effectively done 2026-08-27** — PR #12 ran `code-check`, it concluded **success**, and the merge was gated behind it. If you noticed the merge button greyed out before the tick appeared, that was the gate working. *(Original:)* Open any later PR and confirm the **merge button stays locked** until "Code Check" passes.
      Tell me — an unverified gate is the same as no gate.

> **Nothing here touches Vercel, Stripe or Supabase.** This is GitHub only, and no secret is involved.

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

- [x] **2.9** ⚠ ~~Change **Site URL** to `https://unretire.vercel.app` for now. Your custom domain is not~~
      ~~live yet (see Part 4) — it currently shows a GoDaddy "Launching Soon" page. We switch Site URL to~~
      ~~the real domain on the day DNS goes live.~~ **Keep all the unretireproject.com entries in the redirect
      list** — they cost nothing and will be needed. *(Switched back to `https://www.unretireproject.com`
      on 2026-08-27 — Part 4B, L2. The redirect list was left unchanged.)*

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

- [x] **4.3** ~~⚠ **Your domain is not live yet.** I checked both `unretireproject.com` and
      `www.unretireproject.com` — both return a **GoDaddy "Launching Soon" parking page**, not your site.
      Adding it in Vercel is only half the job; the **DNS records at GoDaddy must point to Vercel**.
      Vercel → **Settings** → **Domains** → click your domain → it shows the exact records to create.
      Copy those into GoDaddy → DNS. Then tell me and I will verify it end to end.~~ **Done 2026-08-27 —
      DNS is live.** `https://www.unretireproject.com` serves your site (from Vercel), and
      `https://unretireproject.com` (no www) redirects to it. I verified the domain and the webhook endpoint (the
      login-link proof is still owed — see L5). *(The domain itself
      is still registered at GoDaddy — only the DNS moved.)*
- [x] **4.4** ~~Until DNS is done, set `NEXT_PUBLIC_SITE_URL` to `https://unretire.vercel.app`
      (Production, Type **Config**). Right now it points at the parking page. We switch it on launch day.~~
      **Superseded 2026-08-27 by L1 below** — `NEXT_PUBLIC_SITE_URL` now points at
      `https://www.unretireproject.com`.

> ~~**Your real live site today is `https://unretire.vercel.app`.** That is what customers reach, and it is
> working fine. Nothing is broken — the pretty address just is not connected yet.~~
> **(2026-08-27) Your live site is now `https://www.unretireproject.com`.** The `unretire.vercel.app`
> address still answers as a fallback.

- [x] **4.2** `half-a-life.vercel.app` — answered: separate repo now. I will handle removing its leftover
      live Stripe webhook carefully in a later sprint; **do not delete anything there yourself yet.**

---

## PART 4B — 🚀 THE DAY YOUR DOMAIN GOES LIVE

Save this. When DNS is done and `https://www.unretireproject.com` shows your site (not the GoDaddy page),
do exactly these five, in this order. **You do not touch any secret — every value here is a public address.**

**Update 2026-08-27: DNS went live and you completed all five steps that day. Kept below for the record.**

- [x] **L1** Vercel → Environment Variables → `NEXT_PUBLIC_SITE_URL` (Production) →
      change to `https://www.unretireproject.com` — **done 2026-08-27** *(no trailing slash — the live page
      now reports its own address as exactly `https://www.unretireproject.com`, which also closes the old
      trailing-slash issue)*
- [x] **L2** Supabase → **unretire-prod** → Authentication → URL Configuration →
      **Site URL** → change to `https://www.unretireproject.com` → Save — **done 2026-08-27**
      *(Leave the redirect list alone — `unretire.vercel.app/**` stays as a useful fallback.)*
- [x] **L3** Stripe → **live mode** → Webhooks → **brilliant-splendor** → Update details →
      Endpoint URL → `https://www.unretireproject.com/api/stripe/webhook` → Save — **done 2026-08-27**
      *(Signing secret is preserved, so no Vercel change is needed — same as last time.)*
- [x] **L4** Vercel → Deployments → newest **Production** deployment → **Redeploy** — **done 2026-08-27**
      *(the live page already shows the new address, which proves the redeploy picked it up)*
- [x] **L5** ~~Tell me. I verify the domain, the webhook endpoint and the login links end to end.~~
      **Verified 2026-08-27:** the domain is live; the webhook endpoint answers on the new address with the
      live secret in place (a deliberately wrong signature gets "Invalid signature" back); and the no-www
      address redirects to www. **Still to prove later (S2.5):** a real login/reset email whose link lands
      on `https://www.unretireproject.com` — that proof needs a delivered email and is scheduled for S2.5.

> **That's the whole list.** Your instinct was right — it is the Supabase URL and the Stripe webhook, plus
> the site-URL variable and a redeploy. Nothing else moves.
>
> **Nothing here touches the Sandbox setup.** Test webhooks keep pointing at the `staging` address forever;
> that is the entire reason we used a permanent branch.

---

## PART 1C — Stage 2 · S2.2 prep (added 2026-08-27)

~~Three of the five things I asked for are now settled, so only **two** are left for you.~~ ~~**Updated 2026-08-27: four of the five are settled — only **1C.2** (sign in to the two database tools) is left, and S2.2 is waiting on it.**~~ **Updated 2026-08-28: all five are settled — you signed in to the two database tools on 2026-08-27 (1C.2) and the preview-site look (1C.3) was withdrawn because my instruction was wrong; that check moves to S2.3 and needs nothing from you. There is nothing left for you in S2.2.** Nothing here needs code.

**Settled already — nothing to do:**
- ~~Create a Mailchimp test audience~~ — **cancelled by your decision (D-22)**: one live audience, shared. See the
  warning below.
- ~~Land a commit on `staging`~~ — **done 2026-08-27**: you authorised me once, and I fast-forwarded `staging` to
  match `master` (it was 86 commits behind). Vercel has built it — the address answers now instead of 404'ing.
  **We are keeping the `staging` branch permanently** — it is the address your Sandbox webhook points at.
- ~~Confirm `unretire-test` is not paused~~ — you confirmed it.

- [x] **1C.1 — Stripe Sandbox webhook: put the bypass in the URL.** ✅ **Done 2026-08-27 (owner-reported).** I cannot verify it from here — the endpoint answers `401 Protected deployment` to anyone without the secret, which is the point. It is proven the first time a Sandbox payment's `checkout.session.completed` shows **delivered** in Stripe's recent-deliveries list; that is proof **P6**, owed by S2.5. *(This is the one I explained badly. Here it is
      plainly.)* Your `staging` address sits behind Vercel's login page. I tested it: a request to
      `…/api/stripe/webhook` comes back **"401 Protected deployment"** — which is exactly what **Stripe** gets when it
      tries to tell your site a payment succeeded. Stripe cannot send the secret header that would get it past the
      login page; the only thing it can carry is the web address itself. So the secret goes **into the address**.
      1. Vercel → project `unretire` → **Settings** → **Deployment Protection** → **Protection Bypass for
         Automation** → copy the secret. *(It already exists — you created it on 2026-08-25.)*
      2. Stripe → **Sandbox** (not live) → **Developers** → **Webhooks** → **captivating-triumph** →
         **Update details** → set the Endpoint URL to exactly this, with the secret pasted where shown:
         `https://unretire-git-staging-86400-s-projects.vercel.app/api/stripe/webhook?x-vercel-protection-bypass=PASTE_THE_SECRET_HERE`
      3. While you are on that screen, confirm the subscribed events are exactly **`checkout.session.completed`**
         and **`customer.subscription.deleted`** — those are the only two the code handles
         (`src/app/api/stripe/webhook/route.ts:36,61`); anything else is ignored.
      4. Save, then tell me. I will verify the endpoint answers.
      > **Never paste that secret into chat.** It goes from the Vercel screen into the Stripe field, nowhere else.
      > *(Alternative if you would rather not put a secret in a URL: give the `staging` branch its own subdomain in
      > Vercel, which makes it publicly reachable with no bypass at all. That also makes a test copy of the site
      > public, so I did not recommend it — your call.)*

- [x] **1C.2 — Sign in to the two database tools.** ✅ **Done 2026-08-27.** Your terminal showed "Authentication successful" for both servers, `claude mcp list` shows both **Connected**, and I then ran the
      safety checks: the test database answered, a throw-away table was created and deleted there, and a write to
      the **live** database was **refused** ("cannot execute UPDATE in a read-only transaction") — the read-only
      guard works. **Nothing here is outstanding.**
      > *How this item evolved, for the record: it was first written as "not yet possible" (my sequencing error —
      > the servers do not exist until S2.2 creates `.mcp.json`), then as "ready now, S2.2 is waiting on it", and
      > was completed the same day. The instructions were: run `claude` in the project folder, then `/mcp`, and
      > sign in with your browser once **per server** — they live in **different Supabase organisations**, so
      > `supabase-test` → org **"Test Databases"** and `supabase-prod-readonly` → org **"86400"**; approve the
      > project when Claude Code asks. No key, no token — browser sign-in only.*
      > `supabase-prod-readonly` is **read-only by construction** — it cannot write to your live database even if
      > something tried. That is the exception you approved on 2026-08-25 (D-11).

- [x] **1C.3 — ~~One look at the preview site~~ WITHDRAWN 2026-08-27 — nothing to do.** My instruction was wrong: the database address is not in the page source — and, as I found on 2026-08-28 while building S2.3, it is not in the site's JavaScript either: the site talks to the database only from the server, so nothing you could open in a browser would ever show it. I cannot see it from here either — the preview sends my browser to the Vercel login. This check moves to **S2.3**, where the test robot carries the proper key to get past that login and proves it a better way: it logs in with a test account that exists only in the test database — if that login works on the preview, the preview is using the test database. *(Original text, kept for the record:)* I need to prove the
      preview build talks to the **test** database, not the live one, and the preview sits behind Vercel's login so I
      cannot look myself. Open https://unretire-git-claude-s22-environment-isolation-86400-s-projects.vercel.app (sign in to Vercel
      if asked), then press **Ctrl+U** to view the page source and **Ctrl+F** for `supabase.co`. Tell me the word that
      appears just before `.supabase.co` — it should be **`dtdadtggahjsrmevwvbu`** (the test project). If it says
      `hcjivvlwxltyiycfbttc` instead, stop and tell me — that would mean the preview is pointed at production.
      *(These are public identifiers, not secrets — fine to paste.)*

> ### ⚠ What one shared Mailchimp audience means, in writing
> You chose to keep a single live audience (**D-22**), which I have recorded. The consequence is permanent: **any
> form submitted on a preview build, or on my machine, adds a real subscriber to your real list** and can trigger
> your real welcome emails.
>
> **The house rules that keep it harmless are written out once — as D-22 rules 1 and 2a–2e in**
> **`docs/PROJECT-STATUS.md` §8.** That is the only copy on purpose: a rule restated in several places drifts out
> of agreement with itself, which is exactly what an independent review caught here twice. In plain terms they
> say that test signups use your own plus-tagged address and never an invented one, that each test cleans up
> after itself, that email tests run only in the full suite and never in the daily morning check, and that no
> test triggers a campaign send — but if those words and D-22 ever disagree, **D-22 wins**.

---

## PART 5 — Testing setup · S2.3 (opened 2026-08-28) — four small things, ~15 minutes

The test robot (Playwright) is built and waiting on the branch `claude/s2.3-playwright-harness`. Of the four
things it needed from you, **5.1, 5.2 and 5.3 are done** (2026-08-28) and you gave Commit/Push for the
branch, which is now pushed; **5.4 and 5.5 are done too — PR #16 is merged. Part 5 is complete apart from the close-out pull request (5.5 a).** Nothing here needs code, and none of it touches the live site or the
live database.

- [x] **5.1 — Three fake test accounts in the TEST database — DONE for you, 2026-08-28.** You asked me to create
      them through the database tool so they are certainly right, and I did: three accounts in **`unretire-test`**
      only (email-confirmed, one shared password, nothing in the live database — I checked it holds none of
      these addresses). They use your own mailbox with plus-tags, so nothing can ever bounce:
      `thefalafeltheory+ur-e2e-signed-in@gmail.com`, `thefalafeltheory+ur-e2e-course@gmail.com`,
      `thefalafeltheory+ur-e2e-premium@gmail.com`. If you would rather use a different mailbox, say so and I
      will recreate them.
- [x] **5.2 — Give the robot its keys, in GitHub only — DONE 2026-08-28** (your screenshot shows all five
      names; I never see the values). If `tests/e2e/.auth/FIXTURES.local.md` still exists, delete it now.
      *(Original instructions, kept for reference:)* Open the local file
      **`tests/e2e/.auth/FIXTURES.local.md`** in your editor — it is ignored by git and exists only on your
      machine — and copy its four values into GitHub → the `unretire` repository → Settings → Secrets and
      variables → Actions → **New repository secret**: `E2E_FIXTURE_PASSWORD`, `E2E_SIGNED_IN_EMAIL`,
      `E2E_COURSE_EMAIL`, `E2E_PREMIUM_EMAIL`. The fifth, `VERCEL_AUTOMATION_BYPASS_SECRET`, you copy from
      Vercel → project `unretire` → Settings → Deployment Protection → Protection Bypass for Automation (I can
      never see that one). **Then delete `FIXTURES.local.md`.** *(You asked for these in `.env.example`; that
      file is committed and placeholder-only, so real values can never go there — the hand-off file is the
      safe equivalent. `.env.example` already lists `VERCEL_AUTOMATION_BYPASS_SECRET`; adding the four `E2E_*` names as placeholders was blocked by your `.env*` permission rule, so they are documented here instead.)*
- [x] **5.3 — Two decisions — confirmed by you on 2026-08-28 ("Ok").** **D-23** — the robot runs from
      GitHub Actions, which is where the keys above live. **D-24** — after any test that signs an address up to
      Mailchimp, the robot archives that contact again automatically (the code for that comes later, in S5.1).
- [x] **5.4 — DONE 2026-08-28.** PR #16 is open; "E2E — Preview" went green on it — twice, in fact: once as
      the pull-request check and once because Vercel's own deployment also triggers it. Proof P1 is closed:
      the preview is using the test database. *(Original instructions, kept for reference:)* Open
      https://github.com/86400websites/unretire/compare/master...claude/s2.3-playwright-harness?expand=1
      → *Create pull request* (title: `S2.3 — Playwright harness`). The **"E2E — Preview"** check appears on
      the PR within a minute, waits for Vercel to finish the preview, then tests it — there is no button to
      press. Green on all five lines = the preview is proven to use the test database (proof P1) and the robot
      is alive. Tell me the PR number and whether it went green; if it is red, send me the link and I will read
      it. *(The manual "Run workflow" button only starts working after this file reaches `master` — GitHub's
      rule, not ours.)*
- [x] **5.5 — DONE 2026-08-28.** Round 3 came back **APPROVE** with no findings and you merged PR #16. *(History: Round 1 — four findings, all fixed the same day; Round 2 — two more, one real: a Production deployment address could have passed the address check — both fixed.)* Two tiny things remain: **(a)** give me Commit/Push YES for the close-out branch `claude/s2.3-close-out` and merge its docs-only pull request (same as PR #15 last time); **(b)** delete `tests/e2e/.auth/FIXTURES.local.md` from your machine if it is still there. When I tell you the brief is pinned to the final head, run
      the Codex review from `docs/code-reviews/S2.3-playwright-harness-review.md` exactly as for S2.2, paste the
      returned record back to me, and merge only on **APPROVE**. After the merge, the "Run workflow" button for
      "E2E — Preview" also works from `master`, and I run the Production smoke (read-only).

Later: approving the feature list before any further test is written (S5.1); Sentry error alerts (S2.4)
come after the Launch Gate passes.

---

## PART 6 — Environment parity · S2.5 (opened 2026-08-28) — the proofs that turn "configured" into "verified"

Sprint S2.5 is built and waiting on the branch `claude/s2.5-environment-parity`. It does three things: copies the
**exact** definition of your live database tables into the test database (from a read-only capture — nothing is
typed by hand), writes down the login settings of both databases side by side, and then runs the test robot through
a real signup, two **sandbox** purchases and one newsletter signup on the preview site to prove each lands in the
test database / the Stripe sandbox / your one Mailchimp list — and nowhere else. **Nothing here touches the live
database or real money.** The first four items are needed before I can continue; the rest come as the sprint runs.

> **Status 2026-08-28 (same day):** 6.1 ✅ ("Yes please — but please also verify" → applied to `unretire-test` and
> verified line by line against production; an unauthorised role is refused), 6.2 ✅ ("ok yes" → `staging`
> fast-forwarded to `master`), 6.3 ✅ (`E2E_OWNER_MAILBOX` added; password confirmed > 8 characters), 6.4 ✅ (all
> screens read; the one mismatch — "Confirm email" — was switched OFF on the test project by you; two prod screens
> still welcome: *Providers → Email* detail and *Attack Protection*), 6.10 ✅ ("Ok"), 6.11 ✅ (deleted by me without
> opening it). ~~**Open: 6.5–6.9 (after the push and the PR) and the Commit/Push words for this branch.**~~
> **Later the same day:** Commit/Push YES ("Ok please proceed"); PR #18 opened; **6.5 ✅ — pressed twice: run #25 at
> `2958785` went 7/10 (two defects in my test code, fixed), run #28 at `d1b7d2f` went 10/10.** The robot bought the
> course and Premium in the Stripe Sandbox and the test database received both access rows; a test signup landed in
> the test database only; a password-reset e-mail was sent to your inbox (twice — once per run). **Open: 6.6–6.9.**

- [x] **6.1 — Say "yes" to building the test database from the captured files.** ✅ Done 2026-08-28. Two files,
      `supabase/migrations/0001_entitlements.sql` and `0002_book_downloads.sql`, are the live tables' definitions as
      read from `unretire-prod` on 2026-08-28. I will apply them to **`unretire-test` only** — never to the live
      database, which is where they came from. The plain-English records are `docs/database-changes/0001-entitlements.md`
      and `0002-book-downloads.md`. Two things I found while capturing, for your information (nothing to do): the
      live `status` column also allows a value `expired` that no document mentioned, and there is no database index on
      the subscription id (harmless at today's size; noted for S4.3).
- [x] **6.2 — Say "yes" to refreshing `staging` once more.** ✅ Done 2026-08-28 (your Stripe Sandbox webhook keeps the same address and bypass parameter; only the code behind it was refreshed). As on 2026-08-27, I fast-forward the `staging` branch to
      match `master` so the Sandbox webhook address runs the current code before any test payment. No code changes on
      it; it only mirrors what is already merged.
- [x] **6.3 — One new robot key, in GitHub only: `E2E_OWNER_MAILBOX`.** ✅ Done 2026-08-28 (no password of any kind was needed — only the address; the robot uses the S2.3 `E2E_FIXTURE_PASSWORD`, which you confirmed is longer than 8 characters). GitHub → the `unretire` repository → Settings →
      Secrets and variables → Actions → **New repository secret** → name `E2E_OWNER_MAILBOX`, value = your own bare
      mailbox address (the one the three test accounts use, without any `+tag`). The robot builds every test address
      from it with a plus-tag, so every test email lands in **your** inbox and nothing can ever bounce. Also confirm
      the shared test-account password is **at least 8 characters** (the signup form insists on it). *This is decision
      **D-25** — the parity tests run only when you press the button in 6.5, never on every pull request and never in
      the daily morning check.*
- [x] **6.4 — Read me the login settings of BOTH databases** ✅ Done 2026-08-28 — recorded in `docs/ENVIRONMENT-PARITY.md` §5.3c. **One thing it found and you fixed the same day:** "Confirm email" was ON in the test database and OFF on the live one; you switched the test database to OFF, so both now behave the same way (the live database was never touched). Still welcome, not blocking: the live database's *Providers → Email* detail and *Attack Protection* screens. (Supabase → project → **Authentication**). Screenshots
      are perfect; none of these screens holds a secret (never send the API Keys page). For `unretire-prod` and then
      `unretire-test`: **URL Configuration** (the Site URL and the full Redirect URLs list); **Providers → Email**
      (is "Confirm email" on or off; secure email change; minimum password length; leaked-password protection);
      **Sign In / Providers** (which providers are enabled); **Rate Limits** (how many emails per hour); **Emails**
      (for the "Confirm signup" and "Reset password" templates, whether the link uses `{{ .ConfirmationURL }}` or
      `{{ .SiteURL }}` / `{{ .TokenHash }}`; and whether a custom SMTP provider is set — its name only); **Sessions**
      (JWT expiry, refresh-token rotation, OTP expiry). This becomes the written parity table the roadmap asks for.
- [x] **6.5 — Press the button (after 6.1–6.4 and after I tell you the branch is pushed).** ✅ Done 2026-08-28 — run #28 (`d1b7d2f`) green on all ten lines; run #25 before it was red on my code, not yours. GitHub → Actions →
      "E2E — Preview" → **Run workflow** → *Use workflow from:* **`claude/s2.5-environment-parity`** → `sha` = the full
      commit id I give you → `parity` = **on** → Run. It takes about five minutes. Green on all ten lines = the proofs
      ran. Send me the link either way; if it is red, I will read it (a red caused by the test database's hourly email
      limit needs no change — we re-run the same commit an hour later).
- [x] **6.6 — Three inbox and Mailchimp reads (after 6.5).** ✅ (a) done 2026-08-28 — the reset link points back at the preview site (proof P3). ✅ (b)/(c) done 2026-08-29 — the contact profile you sent shows the tag **`starter-plan`**, First Name `E2E`, "Added via API", and the audience's full field list (recorded in `docs/ENVIRONMENT-PARITY.md` §5.4); that closes the email-capture acceptance line. **One tidy-up left:** archive the three `ur-test-s25` contacts (one per test run) — Audience → search `ur-test-s25` → select → Actions → Archive. (a) You will receive one or two emails from the test
      database (a signup confirmation if "Confirm email" is on; a password-reset for the signed-in test account). Click
      the link and tell me the **address at the top of the browser** on the page it lands on — it should start with the
      preview site's address (`https://unretire-git-claude-s25-…vercel.app`), never `www.unretireproject.com` and never
      `localhost`. A "page not found" there is expected (Known issue 2). If you would rather not click, copy the part of
      the link after `redirect_to=`. (b) Mailchimp → your audience → search **`ur-test-s25`**: tell me the tag and first
      name on the contact (expected: tag `starter-plan`, first name `E2E`), then **archive every match** (archive, not
      permanent delete — decision D-24). One such contact exists per button press — **two today:**
      `…+ur-test-s25-33196333939@…` and `…+ur-test-s25-33197903287@…`. (c) Send me the audience's list of
      merge fields and tags (Audience → Settings → Audience fields and *|MERGE|* tags; and the Tags page) — names only.
- [x] **6.7 — Two Stripe Sandbox reads (after 6.5).** ✅ Done 2026-08-28 — both payments Succeeded in the Sandbox; `captivating-triumph` delivered 2 events, 0 failed (proofs P4, P6). **⚠ See 6.12 — that webhook screenshot shows the bypass secret.** In the **Sandbox** (never live): (a) Payments — two new test
      payments (a $99 one-time and a $199/year subscription) from the test accounts, and **nothing new in live mode**;
      (b) Developers → Webhooks → `captivating-triumph` → recent deliveries — the `checkout.session.completed` event
      shows **200**. That 200 is proof P6.
- [x] **6.8 — One reset on the live site, for proof P13.** ✅ Done 2026-08-28 — the link landed on the live domain (proof P13). On https://www.unretireproject.com/forgot-password
      request a reset for **your own existing** account (do not create one). Open the email and tell me the address at
      the top of the browser after clicking (expected to start with `https://www.unretireproject.com/`; a "page not
      found" is expected — Known issue 2). If you have no account on the live site, tell me and this half waits for
      launch day.
- [x] **6.9 — Confirm nothing changed in Vercel's environment variables since 2026-08-28** ✅ "yes that's right" (proof P12 re-affirmed).
- [x] **6.12 — Required: rotate the Preview bypass secret** (Known issue 52). ✅ **DONE 2026-08-29 (owner-reported).** The old value that appeared in the webhook screenshot no longer opens anything. *(Instructions kept for the next time:)* The webhook screenshot you sent for
      6.7 shows the endpoint address with the secret inside it (it has to be in that address — Stripe cannot send it
      any other way), and that screenshot now lives in our chat history. It only opens preview builds (test database,
      Sandbox keys — never live data), so the damage is bounded — but our own rule (`docs/ENV-VARS-SAFETY.md`) is
      "rotate first", so please do it before the review rather than after. All three, in this order, or the robot
      goes red: (1) Vercel → project `unretire` → Settings → Deployment Protection → Protection Bypass for Automation
      → **regenerate**; (2) GitHub → Settings → Secrets and variables → Actions → edit
      `VERCEL_AUTOMATION_BYPASS_SECRET` with the new value; (3) Stripe **Sandbox** → Developers → Webhooks →
      `captivating-triumph` → Update details → put the new value after `?x-vercel-protection-bypass=`. Never paste it
      into chat again — the screens only. If you decide to postpone it, say so and I record that as your decision.
- [ ] **6.13 — The robot's own report was leaking the test password (Known issue 51) — two clean-ups.** My
      pre-review check found that the report file the robot uploads after every run lists each typing step with the
      text it typed — including the test accounts' password — and that upload has happened on every run since S2.3.
      Only people with access to **this** GitHub repository could download it, and it opens nothing but the three
      test accounts in the test database, but it should not exist. The robot no longer uploads that file (fixed on
      the branch, and proven by run 33253395067, which uploaded nothing at all).
      **(a) Deleting the old artefacts — NOT required; owner's decision 2026-08-29: leave them.** They expire by
      themselves on **2026-09-11** (14-day retention), they exist only in `86400websites/unretire` (artefacts are
      per-repository — nothing you do or don't do here can touch another repo's Playwright setup), and the rotation
      in (b) makes their contents worthless before then. The builder cannot delete them (no GitHub token here), and
      deleting them by hand is optional tidying, not a control.
      **(b) Rotate the three test accounts' password — the fix that actually closes it, and best done right after
      PR #18 merges** (doing it mid-review would make the next `E2E — Preview` run fail until the GitHub secret
      catches up). Two ways, your choice: **(i)** you do both halves — Supabase → `unretire-test` → SQL Editor →
      `update auth.users set encrypted_password = extensions.crypt('YOUR-NEW-PASSWORD', extensions.gen_salt('bf')) where email like 'thefalafeltheory+ur-e2e-%';`
      then GitHub → Secrets → `E2E_FIXTURE_PASSWORD` → the same value; or **(ii)** tell me and I set it through the
      database tool and hand it over in a gitignored local file exactly as in S2.3, and you paste it into the secret
      and delete the file. Either way, tell me when it is done and I record it.
- [x] **6.10 — Known issue 31 (Stripe API-version tidy-up) moves to S4.3.** ✅ "Ok" 2026-08-28 — recorded there.
- [x] **6.11 — Delete `tests/e2e/.auth/FIXTURES.local.md` from your machine.** ✅ Deleted by me on 2026-08-28 at
      your request, without opening it.

Also needed from you, as every sprint: the **Commit / Push** decision for this branch, then the pull request, then
the Codex review from `docs/code-reviews/S2.5-environment-parity-review.md` once I pin the brief.

---

## What I need back from you

*(The original four asks are all received — struck for the record. Current asks, updated 2026-08-28 — **Part 6
items 6.1–6.4 first**, then the Commit/Push decision for `claude/s2.5-environment-parity`; earlier list retained:)*

1. ~~"Bypass is on" + the **pull request number**~~ → ~~the S2.1 pull request number and its Preview URL (Part 1B.3)~~ received. Now: your **Commit: YES / Push: YES** for the
   docs-only close-out branch `claude/s2.1-close-out`, then open its PR (#12)
2. ~~Confirmation when **Part 2** is done~~ → the **S1.8 per-PR review record** pasted into
   `docs/code-reviews/S1.8-state-sync-round7-repin-review.md` (you confirmed APPROVE on 2026-08-27 — item 1.12a)
3. ~~Confirmation when **Part 3A** is done, then again when **3B** is done~~ → the **Round 7 stage-gate
   record** pasted into the Round 7 stub in `docs/code-reviews/S1-stage-review.md` (item 1.12b)
4. ~~Your answer on `half-a-life.vercel.app`~~ ~~→ confirmation that "Code Check" is a required status on `master` and that the merge button stayed locked on a later PR (Part 1B.4–1B.5)~~ ✅ **done and verified 2026-08-27 — nothing owed**
5. *(Nothing to do — recorded 2026-08-27 as decision **D-18**:)* error tracking (Sentry, S2.4) moves to after testing and
   before launch, as you asked.

**Never paste a secret key into chat.** Values go into the Vercel or Supabase screens only; names are fine.
If a secret is ever exposed, **rotate it at the provider first**, then tell me.

*Your live publishable key `pk_live_…` appeared in a screenshot. That one is designed to be public and ships
in every visitor's browser, so no action is needed. Your secret keys stayed masked.*
