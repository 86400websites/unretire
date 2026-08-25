---
name: close
description: End-of-sprint close-out for [PROJECT_NAME] — verify a branch is safe to merge and the session is safe to end. Runs typecheck/lint/build, confirms the tree is clean + pushed with no secrets, the trackers (PROJECT-STATUS + ROADMAP) are updated, the sprint + review records are saved, the security invariants the diff touches still hold, and (for DB sprints) migrations are applied + verified — then gives a single GO / NO-GO verdict. Triggers - "close the sprint", "are we safe to merge", "run close", "/close", "end the session safely", "final review before merge".
---

# Close — end-of-sprint verification & handoff ([PROJECT_NAME])

You are the **close-out gate**. The owner runs this once, at the end of a sprint, before merging the PR and closing the session (often from mobile, in a fresh window). Your job: **verify** everything is consistent and safe, **report** a clear GO / NO-GO, and **surface** any gap with the exact fix — never auto-merge, never push beyond the task branch, never silently change code.

This is the bookend to `/sprint-prompt`: that skill *opens and records* a sprint; this one *verifies and hands off*. It does not replace the per-step gating during the sprint — it is the single final sweep.

Read, don't restate from memory — these define the gates you are checking (cite the file/section in your findings):
- `CLAUDE.md` (auto-loaded) — project rules.
- `docs/WORKFLOW.md` — §3 Local verification, §4 Pull Request, §5 Deployed Preview, §6 Independent Codex review, §7 Merge, §8 Production smoke test, **Database change protocol**, **Definition of done**.
- `docs/ROADMAP.md` — the active sprint's row + the **Universal sprint exit gate**.
- `docs/SECURITY-CHECKLIST.md` — the **Quick pre-merge gate** + §9 project-specific blocking invariants.
- `docs/PROJECT-STATUS.md` — §1 (Right now), §2 (Sprint board), §6 (Checks), §7–§8 (decisions), §10 (Known issues).

## Step 0 — work out what this sprint shipped

Before checking anything, scope the run to the actual change:
- `git branch --show-current`, `git log main..HEAD --oneline`, `git diff --stat main...HEAD`.
- From the diff, decide which sections below apply — and **when in doubt, run the section**. Triggers:
  - **Database** — whenever the diff changes *or implies* a database contract: any change under the project's migrations directory (per `docs/TECH-ARCHITECTURE.md`; e.g. `supabase/sql/**`), **or** app code that reads/writes a table, column, or RPC. A required migration can be missing from the diff — that omission is itself the finding. Skip if the project has no database.
  - **Public-writes / abuse controls** — whenever any public-write path can be affected: a public-write handler under the framework's API routes (e.g. `src/app/api/`), **or a shared helper it depends on** (rate-limiting, bot-protection, validation, server-env, or delivery/provider clients), related config, or an env contract.
  - **Copy & design** — only if UI/strings changed.
  Mark a section **N/A** only when nothing in the diff could affect it, with one line of why.

## The checklist

Run top to bottom. For each item give **PASS / FAIL / N/A** + the evidence (command output, file:line, or the owner's confirmation). Where a check depends on something you cannot see (provider dashboard, host env, the Preview result), **ask the owner — never assume**.

### 1. Build & local checks
- The repo's exact commands from `docs/TECH-ARCHITECTURE.md` — `[TYPECHECK_COMMAND]`, `[LINT_COMMAND]`, `[BUILD_COMMAND]` — all green. Paste any failure verbatim; do not hand-wave or skip the build.
- Tests: run `[TEST_COMMAND_OR_N/A]`; if the project has no test script, record N/A with the reason — the verification set is then typecheck + lint + build + the CI secret scan (e.g. gitleaks) + deployed Preview QA. Record the built route count (an unexpected ±1 flags an accidental route add/delete).

### 2. Git hygiene
- On a **task branch** (`claude/[SPRINT_ID]-slug` or `claude/fix-slug`), not `main`.
- Working tree clean (`git status` shows only intended changes).
- Branch pushed and up to date with its upstream (`git log @{u}..HEAD` is empty); no unpushed commits.
- `.env.local` untracked (`git check-ignore .env.local`); no stray untracked files that should be committed or deleted (e.g. ad-hoc review/output files).
- **Secret scan of the diff** (`git diff main...HEAD`): no keys, tokens, or connection strings; no server-only value behind a public prefix (e.g. `NEXT_PUBLIC_*`). Cross-check names against the server-only secrets recorded in `docs/ENV-VARS-SAFETY.md` and PROJECT-STATUS §9; treat any name documented as deliberately-never-set as expecting zero references.

### 3. Trackers updated in this PR
- `docs/PROJECT-STATUS.md` §1 (Right now), the §2 board row for this sprint, §3 (Last completed work), and §6 (Checks) reflect what shipped and what's next.
- `docs/ROADMAP.md` — the sprint's row/checkbox is ticked; any deferral landed in the Post-launch backlog with a reason.
- If either is stale, quote the exact edit needed and **offer to make it on the task branch**.

### 4. Copy & design — only if UI / strings changed
- Any new or changed user-facing string is verbatim from the **approved baseline** (the filled predevelopment deliverables and the copy files named by the task; the shipped site is the approved source for live copy). New strings (errors, labels, empty states) follow the brand-voice rules in `docs/DESIGN.md`.
- Design values come from `docs/DESIGN.md` tokens — no inline hex or ad-hoc spacing. Locked shell chrome (the approved shell variants in `docs/DESIGN.md` / `docs/TECH-ARCHITECTURE.md`) is unchanged; no per-page chrome variant was invented.
- Any locked facts/numbers the site states are unchanged and identical wherever they appear.

### 5. Security invariants — only those the diff touches (SECURITY-CHECKLIST §9)
For each invariant the change could affect, confirm it holds and cite the file:
- **Gated content stays gated** — for any project with auth/gating, protected bodies/data are never reachable by an anonymous or unapproved user via UI, RPC, or table read (the gated route redirects signed-out users to `/login`; the data layer's RLS/access policy denies the anon key). If the project has no login, mark N/A. (SECURITY-CHECKLIST §3.)
- **Public projections leak no PII** — any public read path (e.g. a verification or share URL) exposes only approved safe metadata, never email/PII. (SECURITY-CHECKLIST §4/§5.)
- **Public writes** (the project's public endpoints) are schema-validated server-side. **Delivery fails CLOSED** (missing required delivery key → honest 5xx via the project's missing-env error). The required **abuse controls (rate limiting, bot protection)** also fail CLOSED in Production — a missing required key yields an honest error, never a silent drop — so the blocking requirement is that their env vars are set in the host's Production environment (SECURITY-CHECKLIST §5). If the project has a *recorded, consciously accepted* fail-open gap for an abuse control, confirm the accepted-risk row and its compensating control (PROJECT-STATUS §8/§10) rather than describing that control as fail-closed.
- **Deliberately-unset secrets stay unreferenced** — any secret documented as never-set (PROJECT-STATUS §9 / `docs/ENV-VARS-SAFETY.md`) has zero references in `src/` (expect zero grep hits).
- **Environment isolation** — the SOP standard is **separate non-production and Production database projects** (`docs/SUPABASE-VERCEL-SETUP.md` B1; `docs/TECH-ARCHITECTURE.md` §4). A single project serving all environments is a **non-default exception that must be recorded**: if the diff assumes it, confirm the accepted-risk row (PROJECT-STATUS §8) and that Preview testing never destructively mutates Production data — never treat shared-project as normal.
- **Admin surface matches the recorded model.** If the diff introduces an admin role/surface where the architecture defines none, stop and flag it (it needs a `docs/THREAT-MODEL.md` / architecture refresh and an explicit server-side role check before release). Where an admin role exists, it is verified server-side against a dedicated role/table (SECURITY-CHECKLIST §3).
- **CSP / headers** — the allow-list in the framework's security-headers config (e.g. `next.config.ts`) is unchanged, or every added origin is the narrowest one and recorded (SECURITY-CHECKLIST §6).

### 6. Database — if the migrations directory changed OR the diff implies a schema/contract change (WORKFLOW → Database change protocol). Skip if the project has no database.
- **Missing-migration check first:** if application code now depends on a table, column, or RPC that no migration in the diff provides, that is a **NO-GO** — the required migration is missing (CI and the build can pass while Production fails against the existing schema).
- Every **numbered migration** (e.g. `supabase/sql/NNNN_*.sql`) has a matching `*.down.sql`. Any seed file is exempt — its rollback is the separately documented operation in the migrations README (e.g. `supabase/sql/README.md`), not a paired down file; validate seed rollback against that README. RLS **default-deny** on every new user-reachable table; every `SECURITY DEFINER` function hardened (pinned `search_path`, fully-qualified identifiers, session authorization via `auth.uid()` — never trusting arguments, narrow returns, `revoke execute from public, anon` then `grant` to the intended role only).
- Migrations are hand-applied by the owner via the provider's dashboard/SQL console in the order given by the migrations README (no CLI; e.g. the Supabase dashboard SQL Editor). **Ask the owner to confirm** they were applied to the shared project and verified per role. You cannot reach the provider dashboard — do not assume; if unconfirmed for a destructive/data-changing migration, this is a NO-GO. Note plainly: a down migration reverses compatible schema; it does not restore lost data. The SOP standard provides a separate non-production project to rehearse a restore on (`docs/SUPABASE-VERCEL-SETUP.md` B1); if a single project serves all environments as a recorded exception, there is nothing to rehearse on — flag that as the elevated risk it is.

### 7. Sprint & review records
- `docs/sprint-prompts/[SPRINT_ID]-[SLUG].md` exists for this sprint. If not: prompt **"run `/sprint-prompt save`"** (or offer to draft it).
- `docs/code-reviews/[SPRINT_ID]-[SLUG]-review.md` exists and holds the returned Codex verdict for the reviewed head (or clearly states review is still pending). A commit that only appends the returned review record is documentation-only and exempt from re-review when the reviewed head and scope are recorded.

### 8. Preview (owner-confirmed)
- **Self-capture first, then confirm the rest.** With the global browser tools (`docs/BROWSER-TOOLS.md`), run `/browser-qa` against the Preview yourself where it is reachable: capture the Part 2 visual evidence and walk the primary flow with test data. Then ask the owner to confirm only what still needs a human — deployment-protection login, judgment calls, and anything you could not reach. Where the Preview is not reachable to you, fall back to owner confirmation for the full WORKFLOW §5 pass (desktop + 320px; if auth changed: sign-in/up/reset + email links resolve to the Preview origin, never Production; forms behave or show their honest no-op). Record it with `docs/templates/VERCEL-PREVIEW-TEST-TEMPLATE.md` or the approved equivalent.
- Note: the Preview may sit behind host deployment protection (e.g. Vercel Login) — the owner must be logged into the host to click through it. For docs/SQL-only sprints, the Preview shows the unchanged site and the real artifact is the docs/SQL + verification results.

## Output — a single verdict

End with one of:
- **✅ GO — safe to merge & close.** One line per applicable check that passed, plus the post-merge reminders: the owner merges PR, deletes the branch, runs the Production smoke test (WORKFLOW §8), then `/sprint-prompt save` if the record is not yet written; next sprint per ROADMAP.
- **❌ NO-GO.** List each blocking gap with the exact fix; offer to do the ones you safely can (trackers, sprint/review record, doc accuracy) on the task branch now. The owner still performs the merge.

## Never
- Never merge, never push beyond the task branch, never skip hooks/CI. Commit/push only when the sprint's task prompt authorized it (default NO).
- Never auto-fix code or security findings silently — report them and fix only what the owner approves.
- Never assume dashboard-only state (provider apply/verify, host env, Preview result) — ask the owner.
- Never restate the gate docs from memory — read them and cite the file/section.
