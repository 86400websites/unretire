# Testing Setup — One-Time Checklist

Run once per website. Every box says who does it. Your total hands-on time: ~20 minutes.
When the last box is ticked, testing is a single ask forever after: `/activate-testing`.

> Works for new builds and existing sites alike. Prerequisites: the site lives in a GitHub repo and deploys to Vercel (or the approved equivalent with PR Previews). If the site has accounts, a non-production Supabase project must exist per `docs/SUPABASE-MCP-SAFETY.md`.

---

## Part 1 — Put the files in place

- [x] **You:** copy this folder into the project repo per the copy map in `00-START-HERE.md` (or simply tell Claude Code: *"Install the testing setup from docs/testing-setup — follow its 00-START-HERE copy map"*). *(done in S1.1 — the folder and skill have lived in the repo since PR #1)*
- [x] **Claude Code:** place `activate-testing.md` at `.claude/skills/activate-testing/SKILL.md`; place the rest under `docs/testing-setup/`. *(done in S1.1)*

## Part 2 — Install the tester (one normal PR)

- [x] **Claude Code:** install Playwright in the repo as a dev dependency (`@playwright/test`, via pnpm). Free software — no account, no key, no cost. *(S2.3, 2026-08-28 — `@playwright/test` 1.62.1; script `test:e2e`)*
- [x] **Claude Code:** create the Playwright config: tests live in `tests/e2e/`, the target URL comes from the `PLAYWRIGHT_BASE_URL` environment variable, desktop + mobile (390px) browser profiles, and one auth-setup step per user role. *(S2.3, 2026-08-28 — `playwright.config.ts`: `tests/e2e/`, `PLAYWRIGHT_BASE_URL`, `desktop-chromium` + `mobile-390`, one auth-setup project per role: signed-in / course / premium)*
- [x] **Claude Code:** create the test users the robot will log in as — typically one **visitor-to-be**, one **member**, one **admin** (whichever roles the site has) — in the **non-production** database only, with obviously-fake names/emails. Never in production. Record their emails (never passwords) in `docs/FEATURE-LIST.md` when it is generated. *(~~this project: the OWNER creates them in `unretire-test` — `docs/ROADMAP.md` S2.3; OWNER-ACTIONS Part 5.1 — pending 2026-08-28~~ **done 2026-08-28 by the builder at the owner's request, through the `supabase-test` MCP (SQL into `auth.users` + `auth.identities`, email-confirmed, bcrypt via pgcrypto, verified: hash validates, one identity each)** — roles here are signed-in / course / premium, there is no admin; emails: `thefalafeltheory+ur-e2e-signed-in@gmail.com` (signed-in, no entitlement), `thefalafeltheory+ur-e2e-course@gmail.com` (course), `thefalafeltheory+ur-e2e-premium@gmail.com` (premium); password only in the gitignored hand-off file, then only in GitHub Actions secrets)*
- [x] **Claude Code:** confirm environment separation: the Preview deployment uses test-mode keys (Stripe test mode, non-production database). If anything live-keyed leaks into Preview, stop and report — that is a blocker per `docs/ENV-VARS-SAFETY.md`. *(configured in S2.2 — proof P12 PASS 2026-08-28 on the Vercel artefact: Preview holds `unretire-test` + sandbox Stripe, no live-keyed value)*
- [x] **Claude Code:** add the morning-check workflow file from `templates/MORNING-CHECK-TEMPLATE.md`, **disabled** for now (it is switched on only after the gate passes). *(S2.3, 2026-08-28 — schedule commented out + `MORNING_CHECK_ENABLED` guard; Node 24)*

## Part 3 — Unlock the robot's door (only if Previews are password-protected)

Vercel can protect Preview links so strangers cannot see unfinished work. The robot needs a sanctioned key through that door — never a workaround.

- [x] **You:** in Vercel → the project → Settings → Deployment Protection → enable **Protection Bypass for Automation**. Vercel generates a secret. *(done 2026-08-25)*
- [ ] **You:** add that secret to the project's environment variables in Vercel (Preview environment) and to GitHub Actions secrets — Claude Code will tell you the exact variable name to use. Paste the value only into those dashboards, never into chat, never into any file. *(Vercel half done 2026-08-25 — `VERCEL_AUTOMATION_BYPASS_SECRET`, Preview scope; the GitHub Actions secret of the same name is OWNER-ACTIONS Part 5.2 — pending 2026-08-28)*
- [x] **Claude Code:** reference the secret **by name only** in the Playwright config so test requests carry the bypass header. If Preview protection is off, skip this part. *(S2.3, 2026-08-28 — `playwright.config.ts` sends `x-vercel-protection-bypass` when the variable is present)*

## Part 4 — Prove it works, then close

- [ ] **Claude Code:** write one smoke test (homepage loads with no errors) and run it against a deployed Preview to prove the pipeline is alive end to end. *(spec written and passing locally 2/2 on 2026-08-28; the deployed-Preview run — the `E2E — Preview` workflow — is pending the Part 3 secret)*
- [ ] **You:** merge the setup PR (normal workflow: PR → Preview → review → merge).
- [ ] **You:** confirm in one line that setup is done, dated, in the PR or project status.

---

**Done.** From now on the entire testing system is: *"Activate the testing setup"* → approve the feature list → *"run the tests"* → read the report. See `TESTING-GUIDE.md` steps 2–5.
