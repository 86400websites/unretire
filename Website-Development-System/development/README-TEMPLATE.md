# [PROJECT_NAME]

> **Usage note:** copy this file to the repo root as `README.md` and fill every `[PLACEHOLDER]`.
> Delete this note when done.

Website for [CLIENT_NAME] — [one sentence from the predevelopment handoff: what the site is and who it serves].
Primary goal: [PRIMARY_GOAL]. Primary conversion: [PRIMARY_CONVERSION].
Live at: `[DOMAIN]` (production deploys from `main`).

## Stack

[TECH_STACK]

Full detail (locked layers, integrations, invariants): `docs/TECH-ARCHITECTURE.md`.
If the code and docs disagree, report the mismatch; update docs only in an authorized task.

## Local development

```bash
[INSTALL_COMMAND]        # e.g. pnpm install --frozen-lockfile
[DEV_COMMAND]            # e.g. pnpm run dev → http://localhost:3000
```

Checks (run before reporting a change ready — all applicable commands must pass):

```bash
[TYPECHECK_COMMAND]      # e.g. pnpm run typecheck
[LINT_COMMAND]           # e.g. pnpm run lint
[TEST_COMMAND_OR_N/A]    # e.g. pnpm test; state why if N/A
[BUILD_COMMAND]          # e.g. pnpm run build
```

## Environment variables

- The authorized owner creates `[LOCAL_LIVE_ENV_FILE]` from `.env.example` outside the AI workflow.
- The live env file is gitignored — never open, print, copy, edit, or commit it. `.env.example` carries names + safe placeholders only.
- Deployed values live in `[HOSTING_PROVIDER]`'s secret/environment settings, scoped per environment.
- Full rules (public vs server-only, redeploy-after-change): `docs/ENV-VARS-SAFETY.md`.

**Never do this:** commit a secret, put a server-only value behind a public env prefix,
or paste real values into any committed file.

## Project docs

| File | What it answers |
|---|---|
| `CLAUDE.md` (root) | *How does the primary AI build engine behave here?* |
| `AGENTS.md` (root) | *How does the second-pass reviewer agent behave here?* |
| `docs/PROJECT-STATUS.md` | *Where is the build right now? Read this first in every fresh session.* |
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
Production smoke test**. `main` is protected and always production-ready; one focused change per branch;
one sprint at a time; local green is necessary but not sufficient — the Preview must be tested before
merging. Full process with per-stage checklists: `docs/WORKFLOW.md`.

## Deploy

`[HOSTING_PROVIDER]` builds every PR into an isolated Preview and deploys Production only from `main`.
Host rollback action: `[HOST_ROLLBACK_ACTION]`. Then fix GitHub's source of truth through the normal workflow; see `docs/ROLLBACK.md`. Host rollback does not restore database data.
