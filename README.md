# (Un)Retire

Website for Maher Kaddoura (author) — a standalone marketing + membership website for the (Un)Retire book, course, and premium membership, a retirement-life-design product built on the "5 Mindsets × 7 Practices" framework, serving people approaching or in retirement.
Primary goal: Sell the (Un)Retire book, course, and Premium membership; capture emails. Primary conversion: paid enrollment via Stripe Checkout — course purchase ($99 one-time) or Premium subscription ($199/yr).
Live at: **`https://www.unretireproject.com`** since 2026-08-27 (D-2 resolved 2026-08-25, amended 2026-08-27: canonical is the www host; the apex `https://unretireproject.com` 308-redirects to it; Known issue 27 resolved). `https://unretire.vercel.app` remains the Vercel default alias as a fallback (production deploys from `master`).

## Stack

Next.js 16.2.7 (App Router, `src/`), React 19.2.4, TypeScript 5 (strict), Tailwind CSS v4 (@tailwindcss/postcss) + hand-written CSS design system (`src/app/unretire.css`, `.ur-site` scope), Supabase (auth + Postgres via @supabase/ssr), Stripe (Checkout + webhook), Mailchimp (Marketing API), Formspree (static forms), pdf-lib (watermarked member downloads), deployed on Vercel

Full detail (locked layers, integrations, invariants): `docs/TECH-ARCHITECTURE.md`.
If the code and docs disagree, report the mismatch; update docs only in an authorized task.

## Local development

```bash
pnpm install             # install dependencies (pnpm; pinned via `packageManager` pnpm@11.3.0)
pnpm dev                 # dev server → http://localhost:3000
```

Checks (run before reporting a change ready — all applicable commands must pass):

```bash
pnpm typecheck           # typecheck (tsc --noEmit)
pnpm lint                # lint
pnpm format:check        # formatting
# tests: N/A — no automated suite yet; auth + payments make an e2e suite REQUIRED
#        before launch (Launch Gate module: Sprint S2.3 setup, then /activate-testing)
pnpm build               # production build
```

## Environment variables

- The authorized owner creates `.env.local` from the committed **`.env.example`** outside the AI workflow (the rename from `env.example` completed during S1; `.gitignore` whitelists it via `!.env.example`).
- The live env file is gitignored — never open, print, copy, edit, or commit it. The example file carries names + safe placeholders only.
- Deployed values live in Vercel's secret/environment settings, scoped per environment.
- Full rules (public vs server-only, redeploy-after-change): `docs/ENV-VARS-SAFETY.md`.

**Never do this:** commit a secret, put a server-only value behind a public env prefix,
or paste real values into any committed file.

## Project docs

| File | What it answers |
|---|---|
| `CLAUDE.md` (root) | *How does the primary AI build engine behave here?* |
| `AGENTS.md` (root) | *How does the second-pass reviewer agent behave here?* |
| `docs/PROJECT-STATUS.md` | *Where is the build right now? Read this first in every fresh session.* |
| `docs/OWNER-ACTIONS.md` | *What do **I**, the owner, need to do — and in what order?* |
| `docs/ROADMAP.md` | *What are we building, in what order, with what exit gates?* |
| `docs/WORKFLOW.md` | *How does a change get from a branch to production safely?* |
| `docs/TECH-ARCHITECTURE.md` | *What is the locked stack and its invariants?* |
| `docs/DESIGN.md` | *What are the design tokens and locked visual rules?* |
| `docs/content/` | *The frozen approved copy (`page-copy/*.md`) and locked facts (`locked-facts.md`) — the build's canonical content source, implemented verbatim.* |
| `docs/SECURITY-CHECKLIST.md` | *Which security checks gate every merge and the launch?* |
| `docs/QA-CHECKLIST.md` · `docs/LAUNCH-CHECKLIST.md` | *What gets tested before launch?* |
| `docs/ROLLBACK.md` | *Something broke in production — what now?* |
| `docs/HANDOFF.md` | *What does the owner get at the end?* |
| `docs/templates/` | *Which reusable prompt, PR, Preview, and change-record templates do we use?* |
| `docs/sprint-prompts/` · `docs/code-reviews/` | *Per-sprint records and review verdicts.* |

## Workflow (summary)

Every change follows: **branch → build → local checks → PR → deployed Preview (Vercel or approved equivalent) → Codex review → merge →
Production smoke test**. `master` is protected and always production-ready; one focused change per branch;
one sprint at a time; local green is necessary but not sufficient — the Preview must be tested before
merging. Full process with per-stage checklists: `docs/WORKFLOW.md`.

## Deploy

`Vercel` builds every PR into an isolated Preview and deploys Production only from `master`.
Host rollback action: `Vercel dashboard → Project → Deployments → previous good Production deployment → "Instant Rollback" (promote previous deployment)`. Then fix GitHub's source of truth through the normal workflow; see `docs/ROLLBACK.md`. Host rollback does not restore database data.
