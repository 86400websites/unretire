# Owner Actions — (Un)Retire

Everything only you can do, in the order you'll need to do it. Each item says **where**, **what**, and
**what to send back**. Nothing here needs you to read code or open a terminal unless it says so.

Claude Code does everything else. Status of the build itself: `docs/PROJECT-STATUS.md`.

---

## ✅ Already done — nothing to do

| Item | Status |
|---|---|
| GitHub repo exists (`86400websites/unretire`) | Done |
| Vercel connected, site deploying | Done |
| Supabase, Stripe, Mailchimp, Formspree wired in code | Done |
| `.env.local` created and confirmed git-ignored | Done — 2026-08-25 |
| Playwright MCP + Agent Browser installed on this machine | Verified 2026-08-25 — nothing to install |
| **Both Supabase project refs received** — test `unretire-test` / `dtdadtggahjsrmevwvbu`, production `unretire-prod` / `hcjivvlwxltyiycfbttc` | Done — 2026-08-25 |

---

## 🔷 NOW — to finish Stage 1 (System Integration)

**1. ~~Rename the env example file~~** ✅ **DONE 2026-08-25** — renamed, and `!.env.example` added to
`.gitignore` (without it the blanket `.env*` rule hid the file from git). Verified tracked.

**2. Protect the `master` branch** *(2 minutes, GitHub web UI — `gh` CLI isn't installed here)*
- GitHub → repo → **Settings** → **Branches** → **Add branch protection rule**
- Branch name pattern: `master`
- Tick **Require a pull request before merging**
- Tick **Require status checks to pass before merging** — leave the check list empty for now; you'll add
  **"Code Check"** to it after Stage 2.1 creates it.
- Save.

**3. ~~Does the `Website-Development-System/` folder stay in the repo?~~** ✅ **ANSWERED 2026-08-25 — NO**
- Your decision: keep the general system out; commit only what we ingested and actually use here.
- Done in commit `7024375` — all 57 files untracked and gitignored. The folder is still on your disk; delete
  it whenever you like, since you have the master copy elsewhere.
- What *is* committed: `docs/`, `.claude/skills/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `.env.example`.
- This closes the reviewer's second blocking finding. D-12 recorded as **Resolved — NO**.

**4. Review + merge the Stage 1 PR** *(after item 3)*
- ⚠ **The reviews ran out of order last time.** The correct order is: **per-PR review first → you merge →
  then the stage-gate review** on what was merged. The stage gate has already come back **NOT APPROVED**
  for exactly this reason, plus item 3 above. Nothing is wrong with the work itself.
- I'll give you the PR link and the per-PR review brief. Run that review, merge only on **Approve**, and
  then run the stage-gate review on the merged result.

---

## 🔷 STAGE 2 — Readiness Setup ("100% ready on clone")

⚠ **Read this first.** Right now the **Preview** site (the private copy used for testing) is pointed at
your **real, live database** and has no test-mode payments at all. That means any test we run would create
real accounts and touch real customer data — and no payment could be tested. Items 5–8 fix that, **in this
order**. Nothing may be tested until they're done. The reasoning is in `docs/ENVIRONMENT-PARITY.md`.

**Never paste a value into chat.** Everything below is copy-from-one-dashboard, paste-into-another.

---

**5. Point the Preview site at the TEST database** *(15 minutes — the most important item on this page)*

You'll get the values from Supabase and paste them into Vercel. Three names, same routine each time.

*Where the values live:* Supabase → project **`unretire-test`** → **Project Settings** → **API** (or
**API Keys**). That page has the Project URL, the publishable/anon key, and the secret/service-role key.

*Where they go:* Vercel → your project → **Settings** → **Environment Variables**.

For **each** of these three names — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY`:

1. Find the existing entry → **Edit** → **untick Preview**, leave **Production** ticked → **Save**.
   *(This leaves your live site exactly as it is. Don't change the value.)*
2. **Add New** → type the same name → paste the matching value from **`unretire-test`** → tick
   **Preview only** → **Save**.

⚠ All three Preview values must come from the **same** project (`unretire-test`). Mixing one from test with
two from production breaks logins in a way that's hard to spot.

Tell me when it's done and I'll redeploy and verify it from the deployment itself.

---

**6. Add test-mode Stripe to Preview** *(20 minutes — do this AFTER item 5, not before)*

Order matters: doing this first would switch on the "grant access" path while Preview is still connected to
the live database.

*In Stripe:* flip the **Test mode** toggle (top-right) **ON**. Everything below is created inside test mode
and is completely separate from your live products — no real money can move.

- **Products** → create *(Un)Retire Course* with a **one-time** price of **$99 USD** → copy its **price ID**.
- **Products** → create *(Un)Retire Premium* with a **recurring, yearly** price of **$199 USD** → copy its
  **price ID**. *(It must be recurring — a one-time price will fail here.)*
- **Developers → API keys** → copy the **test** secret key.
- **Developers → Webhooks → Add endpoint** → I'll send you the exact Preview address to paste → select
  these two events only: `checkout.session.completed` and `customer.subscription.deleted` → copy the
  endpoint's **signing secret**.

*In Vercel* → **Settings** → **Environment Variables** → **Add New** for each, ticked **Preview only**.
**Do not touch the four Production entries** that already exist.

| Name | Paste |
|---|---|
| `STRIPE_SECRET_KEY` | the test secret key |
| `STRIPE_PRICE_COURSE` | the $99 one-time price ID |
| `STRIPE_PRICE_PREMIUM` | the $199/year recurring price ID |
| `STRIPE_WEBHOOK_SECRET` | the endpoint signing secret |

Also worth doing while you're in test mode: if you have a 100%-off coupon or promo code live, create the
same one in test mode — promo codes don't carry across, and that's a path we need to test.

---

**7. Set the site address** *(2 minutes — decision D-13)*

Vercel → **Settings** → **Environment Variables** → **Add New**:
- Name: `NEXT_PUBLIC_SITE_URL`
- Value: your live domain, written in full (e.g. `https://www.yourdomain.com`)
- Tick **Production only**. Leave Preview blank — the Preview site works its own address out.

If the domain isn't decided yet (that's decision D-2), just tell me **"not live yet"** and we set it at
launch instead.

*Why it matters, briefly:* without it, when someone shares a link to your site on LinkedIn, WhatsApp or
Facebook, the preview card is built against `localhost` and comes out wrong. **Payments and logins are not
affected** — those work out the address from the visitor's request.

---

**8. Optional tidy-up: the Formspree address** *(2 minutes)*

Nothing breaks without this — the forms already work — but it keeps the record honest.
- Vercel → **Add New** → name `NEXT_PUBLIC_FORMSPREE_ENDPOINT` → value: the Formspree endpoint your contact
  form already uses (I'll send it — it isn't a secret) → tick **Production and Preview**.
- Add the same line to your local `.env.local` file. It's the one name your own check reported missing.

---

**9. Authenticate the MCP servers** *(3 minutes, browser — after I wire them)*
- I run the connect commands, then you run `claude /mcp` in a terminal and click through the browser login
  for each server, choosing the org that owns the project.
- **Keep "manual approval of tool calls" ON.** Don't disable it.
- ✅ Production read-only access already approved by you on 2026-08-25 (decision D-11), and I now have both
  project refs, so there's nothing further to decide here.

---

**10. Create test users** *(5 minutes — for the robot tester)*
- In the **test** Supabase project (`unretire-test`) **only** → Authentication → Add user. Create two, with
  obviously fake emails:
  - `member@example.test` — will be given course + premium access
  - `visitor@example.test` — no access (this proves the locks actually lock)
- Send me the **emails only**. Never send passwords in chat — put them in Vercel/GitHub when I tell you where.

---

**11. Confirm two facts** *(one line each)*
- Your **Vercel project name**.
- Your **production domain** (decision D-2) — or "not live yet".

---

**12. Sentry** *(5 minutes — error alerts)* — ⏸ **DEFERRED by owner to Stage S2.4** (do it when we implement
error tracking, not before)
- Create a free account at sentry.io → **Create Project** → platform **Next.js** → name it `unretire`
- Copy the **DSN** and send it to me (a DSN is safe to share — it's an inbox address, it unlocks nothing).
- After I ship the PR: Vercel → project → Settings → Environment Variables → add the DSN under the name I
  give you, for **Production and Preview**.
- Sentry → Alerts → new rule: *when a new issue appears in Production → email me immediately.*
- Confirm you received the test alert email I trigger.

---

## 🔷 STAGE 3 — Critical Fixes

**13. Authorize the cleanup deletions** *(decision — one line)*
- These are dead files I'd like to delete: the stray root-level `page.tsx` (a leftover page Next.js never
  loads), the committed `unretire 21-august-2026.zip` (6.3 MB), and the unused `NewsletterForm.tsx`.
- Reply *"approved"* and I'll remove them in Stage 3.2.

---

## 🔷 STAGE 4 — Improvements

**14. Legal pages** *(your footer links to `/privacy` and `/terms` — both 404 today)*
- Send me the approved privacy policy and terms copy, or say "use a standard template and I'll review".

**15. Email deliverability** *(needed before launch)*
- Add **SPF, DKIM and DMARC** DNS records for your sending domain (your email provider gives you the exact
  values). I'll verify with an external-address inbox test.

**16. Content decisions**
- Home page says "Thirty-one lessons", the course page says "forty-eight" — the code has **48**. Confirm 48.
- Book page testimonials still say *"Reader name, former executive"* — send real attributions or I'll remove them.
- Community page claims *"340+ Members, 18 Countries"* — confirm or I'll remove the numbers.
- ~~The **"Guest Preview until 31 August"** banner~~ ✅ **DECIDED 2026-08-25:** let it expire as originally
  set up — it is date-bound by design, no code change needed (D-10 resolved, Known issue 12 closed).

---

## 🔷 STAGE 5 — Launch Gate

**17. Approve the feature list** *(your most important 10 minutes)*
- I'll generate `docs/FEATURE-LIST.md` — one plain-English line per thing the site does.
- **Everything on that list gets tested. Nothing off it does.** Read it and approve in writing.

**18. Approve the daily morning check** — I'll propose 5–7 safe tests to run against the live site each
morning; you approve the selection, add two secrets in GitHub, and confirm one test alert email arrives.

**19. Sign the launch approval** — `docs/LAUNCH-CHECKLIST.md` Phase 1, and do the one real test purchase on
the live site by hand (robots never touch production money). This one real purchase is not optional: a
passing test suite proves the site works, but only a live purchase proves your **live** payment keys,
webhook and domain are wired correctly.

---

## Rules that never change

- **You are the only one who merges.** Claude Code never merges, never pushes to `master`.
- **Never paste a secret into chat.** Values go into the Vercel or GitHub dashboard only. Names are fine.
- **Tell me after any env-var change** so I can redeploy — Vercel does not apply new values to deployments
  that already exist, so a change without a redeploy looks like it did nothing.
- If a key is ever exposed: **rotate it at the provider first**, then tell me.
