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

---

## 🔷 NOW — to finish Stage 1 (System Integration)

**1. Rename the env example file** *(30 seconds — I'm blocked from writing `.env*` paths)*
- In the repo root, rename `env.example` → `.env.example`
- Tell me when done; I add `!.env.example` to `.gitignore` so it stays committed.

**2. Protect the `master` branch** *(2 minutes, GitHub web UI — `gh` CLI isn't installed here)*
- GitHub → repo → **Settings** → **Branches** → **Add branch protection rule**
- Branch name pattern: `master`
- Tick **Require a pull request before merging**
- Tick **Require status checks to pass before merging** — leave the check list empty for now; you'll add
  **"Code Check"** to it after Stage 2.1 creates it.
- Save.

**3. Confirm the `Website-Development-System/` folder stays in the repo** *(decision D-12)*
- It **is included in the Stage 1 PR** (390 KB, 57 files) on my recommendation, so a fresh clone carries the
  system with it — the "ready 100% when we clone" outcome you asked for.
- Its `predevelopment/` half won't apply here; it stays for future greenfield sites.
- Nothing to do if you agree. Say *"leave it out"* at review and I remove it in one commit.

**4. Review + merge the Stage 1 PR**
- I'll give you the PR link and the Codex review brief.
- Run the Codex review → merge only on **STAGE APPROVED**.

---

## 🔷 STAGE 2 — Readiness Setup ("100% ready on clone")

**5. Supabase project refs** *(2 minutes — needed to wire the MCPs)*
- Supabase dashboard → open your **non-production / test** project → copy the ref from the URL:
  `https://supabase.com/dashboard/project/`**`<THIS-PART>`**
- Do the same for your **production** project.
- Send me both, labelled test and prod. These are identifiers, not secrets.
- ⚠ **If no test project exists yet**, create one (Supabase → New Project, name it e.g. `unretire-test`).
  A non-production database is required before any automated testing — the robot must never touch real data.

**6. Approve production read-only MCP** *(decision D-11 — one line back to me)*
- Default policy in `docs/SUPABASE-MCP-SAFETY.md` is **Profile A: production MCP stays disconnected.**
- You asked for prod read-only, which is **Profile B** and needs your explicit, recorded approval.
- Reply with: *"Approve Profile B — production Supabase MCP, read-only, for schema inspection and debugging.
  Remove when the project is handed over."* I'll record it with your name and today's date.

**7. Authenticate the MCP servers** *(3 minutes, browser — after I wire them)*
- I run the connect commands, then you run `claude /mcp` in a terminal and click through the browser login
  for each server, choosing the org that owns the project.
- **Keep "manual approval of tool calls" ON.** Don't disable it.

**8. Create test users** *(5 minutes — for the robot tester)*
- In the **test** Supabase project only → Authentication → Add user. Create two, with obviously fake emails:
  - `member@example.test` — will be given course + premium access
  - `visitor@example.test` — no access (this proves the locks actually lock)
- Send me the **emails only**. Never send passwords in chat — put them in Vercel/GitHub when I tell you where.

**9. Sentry** *(5 minutes — error alerts)*
- Create a free account at sentry.io → **Create Project** → platform **Next.js** → name it `unretire`
- Copy the **DSN** and send it to me (a DSN is safe to share — it's an inbox address, it unlocks nothing).
- After I ship the PR: Vercel → project → Settings → Environment Variables → add the DSN under the name I
  give you, for **Production and Preview**.
- Sentry → Alerts → new rule: *when a new issue appears in Production → email me immediately.*
- Confirm you received the test alert email I trigger.

**10. Confirm two facts** *(one line each)*
- Your **Vercel project name**.
- Your **production domain** (decision D-2) — or "not live yet".

---

## 🔷 STAGE 3 — Critical Fixes

**11. Authorize the cleanup deletions** *(decision — one line)*
- These are dead files I'd like to delete: the stray root-level `page.tsx` (a leftover page Next.js never
  loads), the committed `unretire 21-august-2026.zip` (6.3 MB), and the unused `NewsletterForm.tsx`.
- Reply *"approved"* and I'll remove them in Stage 3.2.

---

## 🔷 STAGE 4 — Improvements

**12. Legal pages** *(your footer links to `/privacy` and `/terms` — both 404 today)*
- Send me the approved privacy policy and terms copy, or say "use a standard template and I'll review".

**13. Email deliverability** *(needed before launch)*
- Add **SPF, DKIM and DMARC** DNS records for your sending domain (your email provider gives you the exact
  values). I'll verify with an external-address inbox test.

**14. Content decisions**
- Home page says "Thirty-one lessons", the course page says "forty-eight" — the code has **48**. Confirm 48.
- Book page testimonials still say *"Reader name, former executive"* — send real attributions or I'll remove them.
- Community page claims *"340+ Members, 18 Countries"* — confirm or I'll remove the numbers.
- The **"Guest Preview until 31 August"** banner expires in days. Tell me what replaces it.

---

## 🔷 STAGE 5 — Launch Gate

**15. Approve the feature list** *(your most important 10 minutes)*
- I'll generate `docs/FEATURE-LIST.md` — one plain-English line per thing the site does.
- **Everything on that list gets tested. Nothing off it does.** Read it and approve in writing.

**16. Approve the daily morning check** — I'll propose 5–7 safe tests to run against the live site each
morning; you approve the selection, add two secrets in GitHub, and confirm one test alert email arrives.

**17. Sign the launch approval** — `docs/LAUNCH-CHECKLIST.md` Phase 1, and do the one real test purchase on
the live site by hand (robots never touch production money).

---

## Rules that never change

- **You are the only one who merges.** Claude Code never merges, never pushes to `master`.
- **Never paste a secret into chat.** Values go into the Vercel or GitHub dashboard only. Names are fine.
- If a key is ever exposed: **rotate it at the provider first**, then tell me.
