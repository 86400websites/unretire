# The System Map — One Page, Everything

> When you're confused, open this file. It shows the whole machine, where you are in it, and which file or skill to open next. It orients — it never records state: **the repo is always the truth** (per-project status lives in that repo's `docs/PROJECT-STATUS.md`).

---

## The whole system

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. PREDEVELOPMENT              folder: predevelopment/ (files 1–9)│
│    Questions → Research → Sitemap → Inspiration → Design System   │
│    → Page Copies → Features → Wireframes & Mockup ✍GO → Accounts  │
└───────────────────────────────┬──────────────────────────────────┘
                                │ signed GO
┌───────────────────────────────▼──────────────────────────────────┐
│ 2. DEVELOPMENT                 folder: development/               │
│    Setup Gate (templates/NEW-WEBSITE-SETUP-CHECKLIST.md), then    │
│    Stage 0, then sprint by sprint. Every change travels:          │
│    branch → checks → PR → Code Check + Preview → review → merge   │
│    skills: /sprint-prompt · /browser-qa · /close                  │
└───────────────────────────────┬──────────────────────────────────┘
                                │ all MVP sprints merged
┌───────────────────────────────▼──────────────────────────────────┐
│ 3. LAUNCH GATE                 folder: development/testing-setup/ │
│    /activate-testing: scan whole repo → FEATURE LIST ✍you approve │
│    → one robot test per line → FULL RUN → plain-English report    │
│    → fix sprint → re-run failed → FULL RUN 100% green → ✍GO       │
└───────────────────────────────┬──────────────────────────────────┘
                                │ GO verdict
┌───────────────────────────────▼──────────────────────────────────┐
│ 4. LAUNCH                      file: development/LAUNCH-CHECKLIST │
│    pre-launch checks → ✍client written approval → launch day      │
│    (domain · DNS · SSL) → live smoke test → 48-hour watch         │
└───────────────────────────────┬──────────────────────────────────┘
                                │ live
┌───────────────────────────────▼──────────────────────────────────┐
│ 5. AFTER LAUNCH                folder: development/error-tracking/│
│    Watchers: SENTRY (records errors, emails you) · MORNING CHECK  │
│    (robot re-runs 5–7 critical tests daily, emails only on fail)  │
│    Any problem, either door → /handle-error:                      │
│    understand → severity → fix sprint → NEW TEST added forever    │
│    → ✍user informed → incident log closed                         │
└──────────────────────────────────────────────────────────────────┘
```

The compounding rule that ties 3 and 5 together: **every bug fixed after launch becomes a permanent test in the launch gate** — the same bug can never quietly return, and every site gets stronger with age.

## ✍ Your signature moments

Everything else is Claude Code's job. You personally approve exactly these:

| # | You sign | Where |
|---|---|---|
| 1 | Predevelopment **GO** on the final wireframes | `predevelopment/8. Final Wireframes and Mockup.md` |
| 2 | **Every merge** — you are the only one who merges a PR | GitHub, after Preview + review pass |
| 3 | The **feature list** — everything the site does, one line each | `docs/FEATURE-LIST.md` |
| 4 | The launch-gate **GO** — full run, 100% green | latest report in `docs/test-reports/` |
| 5 | The **morning-check selection** (the 5–7 daily tests) | per `testing-setup/templates/MORNING-CHECK-TEMPLATE.md` |
| 6 | **Client written launch approval** | `development/LAUNCH-CHECKLIST.md` Phase 1 |
| 7 | "**User informed ✓**" on every closed incident | `docs/INCIDENT-LOG.md` |

## When confused, open…

| You're wondering… | Open |
|---|---|
| How does the whole thing fit together? | This file |
| What's next on a specific project? | That repo's `docs/PROJECT-STATUS.md` |
| How does a change reach production? | `development/WORKFLOW.md` |
| Is the code itself held to professional standard? | `development/TECHNICAL-INTEGRITY.md` — the four walls + the Code Check |
| How does testing work? | `development/testing-setup/TESTING-GUIDE.md` |
| Are we ready to launch? | Latest `docs/test-reports/` verdict + `development/LAUNCH-CHECKLIST.md` |
| Sentry emailed me / a user reported a bug | Say `/handle-error` · guide: `development/error-tracking/ERROR-TRACKING-GUIDE.md` |
| Production is badly broken right now | `development/ROLLBACK.md` — never panic-fix on main |
| Where do new ideas go mid-project? | `docs/POST-LAUNCH-BACKLOG.md` — never the open sprint |
| Project finished — handing over | `development/HANDOFF.md` |

## The tools, one job each

| Tool | Its one job | Account? |
|---|---|---|
| GitHub | Source of truth for all code; runs the Code Check + morning check | Yes (have it) |
| Vercel | Hosting + a Preview link per PR | Yes (have it) |
| Supabase | Database + logins (non-production twin for testing) | Yes (have it) |
| Playwright | The robot tester — lives inside each repo | **No account — free software** |
| Sentry | The error recorder — who, where, what broke | Yes, free tier |
| Stripe | Payments — test mode for robots, live for humans | Yes (have it) |
| Upstash | Rate limiting — blocks whoever hammers forms/login | Yes, free tier |
| Cloudflare Turnstile | Invisible "are you human" check on forms | Yes, free tier |
| Resend / Mailchimp | Transactional / marketing email | Yes (have them) |
| PostHog | Analytics | Yes (have it) |

---

*One machine, five stages, seven signatures. Everything else is a file in this system or a skill one ask away.*
