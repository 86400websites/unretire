# (Un)Retire — Claude Code Instructions

> This file governs the primary build agent in the 86400websites/unretire repository.
> Companion docs: docs/WORKFLOW.md, docs/ROADMAP.md, docs/PROJECT-STATUS.md,
> docs/TECH-ARCHITECTURE.md, docs/DESIGN.md, and AGENTS.md.

## Project context

**(Un)Retire** is a website for Maher Kaddoura (author): a standalone marketing + membership website
for the (Un)Retire book, course, and premium membership — a retirement-life-design product built on the
"5 Mindsets × 7 Practices" framework. It serves people approaching or in retirement. Scope fence: this
repo is the public site + gated course/premium area only; no admin CMS, no mobile app.
Its approved conversion priorities are — Primary: paid enrollment via Stripe Checkout — course purchase
($99 one-time) or Premium subscription ($199/yr); Secondary: email capture to Mailchimp (newsletter,
14-Day Starter Plan, assessment results, gated tools). Optional authentication,
database, private-area, integration, and hosting behavior is defined in docs/TECH-ARCHITECTURE.md;
do not invent it.

Approved factual claims and content sources are listed in docs/content/locked-facts.md and
docs/content/page-copy/*.md. Implement them exactly. GitHub is the source of truth. Vercel provides
the Vercel Preview deployment (per-PR) and Production when hosting is in scope. Work one sprint at a time from
docs/ROADMAP.md.

## Start every session

1. Read docs/PROJECT-STATUS.md, including current stage, active sprint, and open decisions.
2. Read the active sprint scope and exit checklist in docs/ROADMAP.md.
3. Inspect the package manifest, framework config, source tree, current branch, and git status.
4. Read every task input and relevant approved copy/design file before editing.
5. Confirm the task names the files allowed to change. If another file is needed, stop and explain why.
6. Work only inside the active sprint and branch named by the task.

When a sprint completes, update docs/PROJECT-STATUS.md and docs/ROADMAP.md in the same branch, provided
those files are listed as allowed changes. Otherwise report the required bookkeeping to the owner.

## Stack and sources of truth

The selected stack is **Next.js 16.2.7 (App Router, `src/`), React 19.2.4, TypeScript 5 (strict),
Tailwind CSS v4 (@tailwindcss/postcss) + hand-written CSS design system (`src/app/unretire.css`,
`.ur-site` scope), Supabase (auth + Postgres via @supabase/ssr), Stripe (Checkout + webhook),
Mailchimp (Marketing API), Formspree (static forms), pdf-lib (watermarked member downloads), deployed
on Vercel**, recorded in docs/TECH-ARCHITECTURE.md with its package manager,
framework, styling, validation, data, integration, and hosting choices.

Verify the on-disk implementation before relying on a note. If code and documentation disagree, report
the mismatch. Update documentation only when the current task explicitly allows that file and change.
Treat traces of an earlier prototype or stack as historical.

## Approved content and design

- Copy comes from the approved copy files named by the task — canonically the in-repo frozen set at `docs/content/page-copy/*.md`, with exact claims in `docs/content/locked-facts.md`. Implement both verbatim; do not rewrite approved copy or invent facts. If a needed string has no approved source, add it via the copy file (following the voice rules) rather than inventing it inline.
- Design comes from approved mockups and docs/DESIGN.md. Use the selected tokens and components.
- Use only the approved shell variants in docs/DESIGN.md or docs/TECH-ARCHITECTURE.md. Keep shared chrome
  consistent within each shell; do not invent page-specific header or footer variants.
- If copy, mockup, sitemap, or architecture conflicts, stop and record an open decision. Do not choose silently.

## Working rules

- Make the smallest safe change that completes the exact task.
- Preserve current behavior unless the task explicitly changes it.
- Do not perform unrelated refactors, renames, formatting, dependency changes, or cleanup.
- Do not change a locked stack layer without an explicit owner request.
- Preserve existing user changes. Never reset, discard, or overwrite work to obtain a clean tree.
- For auth, access gates, schema, env handling, security headers, routing, or destructive data behavior,
  explain a short plan before editing.
- If the task is ambiguous, choose the smallest safe interpretation only when it cannot change the result
  materially; otherwise stop and ask.

## Security and environment safety

- Follow the framework boundaries recorded in docs/TECH-ARCHITECTURE.md. Privileged logic and secrets stay
  in framework-defined server-only contexts; client code receives only approved public values.
- Never place a server-only value behind a public env prefix or pass it into client code.
- Never open, read, copy, print, or modify .env.local or another file containing live environment values.
  Use env variable names and documented placeholders only. A placeholder-only .env.example is permitted.
- Never hardcode or echo secrets, credentials, tokens, private keys, database passwords, or private URLs.
  If a leak is suspected, report only the file, line, and secret type; tell the owner to rotate it.
- Every gated route or data path, when the project has one, must enforce session and authorization checks
  server-side before protected data is read. Admin paths also verify the admin role server-side.
- Validate untrusted input. Validate redirect destinations and URL schemes; never feed untrusted data into
  raw HTML. Error responses must not expose internals or upstream bodies.
- Public write endpoints use the abuse controls selected in docs/TECH-ARCHITECTURE.md. Controls configured
  as required in Production fail closed.
- Database changes apply only when the project has a database and follow its selected migration and access
  policy. Ship the required forward/rollback artifacts and policies together. Do not apply a migration
  unless the owner explicitly asks; use a non-production environment first.

## Verification

Run the exact commands defined by the repo and filled task prompt:

1. Typecheck: pnpm typecheck
2. Lint: pnpm lint
3. Format: pnpm format:check
4. Tests: N/A — no automated suite yet. This project has auth + payments, so per docs/TECH-ARCHITECTURE.md an e2e suite is REQUIRED before launch; it arrives with the Launch Gate module (Sprint S2.3 setup, then /activate-testing).
5. Production build: pnpm build
6. Task-specific and manual checks: [TASK_SPECIFIC_CHECKS]

Do not guess a command or install/change dependencies to make a check run. Report checks that cannot run.
Fix failures caused by the task; label verified pre-existing failures. Review the complete diff and git
status without printing live values. Stage explicit files only when committing is authorized.

## Git and delivery rules

master is protected and production-ready. Use one focused branch per feature or fix, created from current
master. The normal chain is:

branch → implementation → local checks → PR → tested Vercel Preview deployment (per-PR) → independent review →
merge by owner → Production smoke test

- Commit only when the filled task prompt explicitly says **Commit: YES**. Omitted or unfilled means NO.
- Push only when the filled task prompt explicitly says **Push: YES**. Omitted or unfilled means NO.
- Never push to master, push another branch, merge a PR, force-push, or skip hooks.
- One implementation agent owns a branch at a time.

Branch examples: claude/[SPRINT_ID]-short-slug and claude/fix-short-slug.

## Task report

Return:

1. Outcome and scope completed.
2. Files changed.
3. Commands/checks run and exact results.
4. Manual or Preview verification completed.
5. Risks, open decisions, or follow-ups.
6. Branch plus actual commit/push status; include commit SHA/message if committed, otherwise suggest a message.
7. Roadmap/status bookkeeping completed or still required.

## Clarification behavior

Proceed when the task, allowed files, and safety boundaries are clear. Ask only when missing information
would materially change the implementation or an open decision blocks the work.

Next step → AGENTS.md defines the independent review; docs/WORKFLOW.md defines the delivery chain.
