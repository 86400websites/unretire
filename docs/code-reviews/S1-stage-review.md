# Codex Stage Review Brief — S1 — System Integration

> **Stage 1 of the owner-approved 5-stage plan (2026-08-25): S1 System Integration → S2 Readiness Setup →
> S3 Critical Fixes → S4 Improvement Plan → S5 Launch Gate.** Each stage ends with this independent Codex
> review before anything merges.
>
> **ID note:** this stage was built and recorded under the earlier ID **R1** ("system retrofit"), which the
> 5-stage plan **supersedes**. The old artifacts keep their `r1` names on purpose, for traceability:
> branch `claude/r1-system-retrofit` and sprint record `docs/sprint-prompts/R1-system-retrofit.md`. Treat
> `R1` and `S1.1` as the same work. A surviving `R1` name in *those two places* is correct; a surviving
> `R1`–`R7` **plan** elsewhere is stale (see focus item 8).

> **Reviewed head — read this first.** The **substantive** head of Stage 1 is
> `b6594b593d0e1980986d8bfb54411aa42ebb3ebb` — every file the stage delivers is in it. The branch tip may
> sit one or more commits later; those later commits touch **only this review record** (pinning SHAs,
> appending the returned verdict). Per `docs/WORKFLOW.md`, a commit that only appends the review record does
> not invalidate the reviewed range. So: review `0983ad55…..f01f1394…`, and treat any commit after
> `b6594b5` as in-scope only to confirm it changed nothing but this file (`git diff f01f139..HEAD --name-only`
> must list `docs/code-reviews/S1-stage-review.md` and nothing else — if it lists anything else, that is a
> Blocking target mismatch: stop and report it).

> **Scope note (added 2026-08-25):** after the initial docs-pack commit the branch also carries two
> substantive commits, both in scope and both documentation/config only: `acc0a2a` completes the
> `env.example` → `.env.example` rename and adds the `!.env.example` whitelist to `.gitignore`
> (git records it as `R100` — a byte-identical rename); `b6594b5` records owner decisions D-8, D-10
> and D-11 in the trackers. Both are inside the pinned range below.

> **Status: READY TO SEND.** Branch pushed 2026-08-25. Fill `[PR_NUMBER]`/`[PR_URL]` and the Preview
> result once the PR is opened and its Vercel Preview is tested, then hand this file to Codex.

> This brief is saved at `docs/code-reviews/S1-stage-review.md`. Append the reviewer's returned
> record below; the reviewer does not edit the repository.

You are the independent, findings-only reviewer for this PR. AGENTS.md governs this review. Do not edit,
stage, commit, push, merge, install dependencies, or run migrations. Review issues introduced by the pinned
range; inspect enough surrounding context to validate them without starting an unrelated full audit.

## Review target

- Repo: 86400websites/unretire
- Stage: **S1 — System Integration** (sub-sprint S1.1; formerly R1)
- PR: #[PR_NUMBER] — [PR_URL]  *(to fill when opened)*
- Branch: claude/r1-system-retrofit (context only — created on owner authorization; old ID retained deliberately)
- Merge-base SHA: 0983ad557218666b63cb5b6d3db9152041865bb9
- Reviewed head SHA: b6594b593d0e1980986d8bfb54411aa42ebb3ebb
- Immutable range: 0983ad557218666b63cb5b6d3db9152041865bb9..b6594b593d0e1980986d8bfb54411aa42ebb3ebb
- Sprint record: docs/sprint-prompts/R1-system-retrofit.md
- Expected changed paths: `CLAUDE.md`, `AGENTS.md`, `env.example` (created); `README.md` (modified);
  `docs/**` (47 files on disk as of 2026-08-25); `.claude/skills/**` (5 files).
  **No file under `src/`, no `package.json`, no config, no lockfile, no `.github/**`.**
  `Website-Development-System/**` moves untracked→tracked **only** if the owner resolves D-12 (which
  supersedes the D-7 wording) as YES.

First confirm both SHAs and the actual changed-file list. Stop and report a target mismatch before reviewing
if the range, head, PR, or scope does not agree. If the `docs/**` count differs from 44, reconcile it against
the sprint record's file list before treating it as a finding — files were withdrawn late in the stage (see
"Withdrawn mid-stage" below).

## Read for context

- AGENTS.md.
- The sprint record above.
- docs/PROJECT-STATUS.md and docs/ROADMAP.md — the two live trackers.
- `docs/TECH-ARCHITECTURE.md` and `docs/DESIGN.md` — the two docs asserting the most code-verifiable facts.
- `docs/PROJECT-STATUS.md` §6 checks, §8 open decisions (D-1…D-12), §10 known issues (16 rows).
- The SOP sources under `Website-Development-System/development/` — to confirm the copied files were not
  silently altered (see focus item 4 for the two intentional exceptions).

## Stage intent

- Goal and exit condition: install the Website-Development-System into an **already-built** site — governing
  docs filled with code-verified facts, the five Claude Code skills, the testing + error-tracking modules,
  content-freeze records, and live trackers naming every known issue and open decision. Exit: the repo is
  self-contained and governed — every later change can travel branch → checks → PR → Preview → review →
  merge. **Documentation and tooling only; no runtime behavior may change.**
- Intentionally out of scope, with the stage that owns each: CI workflow file (**S2.1** — needs scripts that
  do not exist yet); the pre-existing lint error at `src/app/premium/page.tsx:182` (**S2.1**, Known issue 16);
  `.mcp.json` / agent tooling (**S2.2**); Playwright harness (**S2.3**); Sentry (**S2.4**); the two
  live-breakage bug groups (**S3.1**, Known issues 1–2); hygiene deletions (**S3.2**); mobile/a11y, design
  consolidation, Supabase/RLS, auth hardening (**S4.1–S4.4**); abuse controls + legal pages + email
  deliverability (**S4.5**); the test suite and launch (**S5**).
- Owner-authorized exceptions: None. Two forced deviations are recorded in the sprint record: (a) the env
  example is committed as `env.example` because agent tooling blocks writing `.env*` paths — the owner
  renames it to `.env.example` and whitelists it with `!.env.example` in `.gitignore` during S2.1;
  (b) branch protection is a GitHub web-UI owner action because `gh` CLI is not installed on this machine.
- **Withdrawn mid-stage — `docs/predevelopment/`.** ~10 files were created under `docs/predevelopment/` as a
  backfilled predevelopment record, then **withdrawn on owner instruction on 2026-08-25**: the project is
  already at the development stage, so the predevelopment worksheets do not apply, and predevelopment is
  dropped from the plan entirely. The SOP originals remain in `Website-Development-System/predevelopment/`
  for future greenfield projects. Open decision **D-6** (predevelopment owner inputs) is struck through and
  marked WITHDRAWN. The facts those files would have carried live where they are actually used: sitemap →
  `docs/TECH-ARCHITECTURE.md` §3, design system → `docs/DESIGN.md`, copy/facts → `docs/content/`, feature
  list → generated later by `/activate-testing`. **The reviewer must confirm the withdrawal is clean** — see
  focus item 3.
- Hosting/Preview state: [PREVIEW_URL_AND_TEST_RESULT_FOR_HEAD_SHA]  *(no PR yet; a docs-only change still
  gets a Preview so the reviewer can confirm the site is unchanged)*
- Database/migration state: N/A — no migration, no schema change, no database access in this stage.

## Checks and evidence

- Typecheck: `pnpm exec tsc --noEmit` — **PASS** (exit 0) on the S1 working tree, 2026-08-25
- Lint: `pnpm lint` — **FAIL: 1 error**, `src/app/premium/page.tsx:182` `@next/next/no-html-link-for-pages`.
  **Pre-existing and outside this stage's changed files** (S1 touches no `src/`). Verify it reproduces on
  the merge-base before treating it as introduced. Logged as Known issue 16, scoped to S2.1.
- Tests: N/A — no automated suite exists yet. Auth + payments make an e2e suite REQUIRED before launch per
  `docs/TECH-ARCHITECTURE.md`; the harness arrives in S2.3 and the suite in S5.1 → `/activate-testing`.
- Production build: `pnpm build` — **PASS** (exit 0, 18.9s; 35 route entries, 58 static pages) on the S1
  working tree, 2026-08-25
- Install: `pnpm install --frozen-lockfile` — PASS (dependencies were not previously installed on this
  machine). The lockfile was not modified.
- Current CI evidence for HEAD_SHA: None — no CI exists yet; the Code Check workflow is S2.1.
- Current tested Preview evidence for HEAD_SHA: [RESULT_OR_LINK]  *(to fill after the PR is opened)*

Run commands only with the existing environment. Do not install or change anything to make a check pass.
State every command not run and why.

## Hunt list

1. Correctness: exit criteria work in realistic success, empty, loading, and failure states that apply.
2. Authorization: gated routes/data paths, if any, authorize server-side before protected reads; admin paths
   verify role.
3. Secrets/env: no live env values, credentials, tokens, private keys, or server-only values exposed. A
   placeholder-only example file is acceptable only when it contains names/placeholders, not live values.
4. Data safety: no unintended anonymous path or silent data loss; database changes, if any, match the selected
   migration, rollback, and access-policy rules.
5. Input safety: untrusted values are validated before redirects, URLs, raw HTML, queries, or other sinks.
6. Build/deploy: imports, generated artifacts, routing/rendering mode, config, lockfiles, and hosting behavior
   have no unintended change.
7. Scope/content: actual paths match the stage; approved copy/design/facts were not silently changed.
8. Regressions: the change does not weaken an existing guard or break a neighboring workflow.

Do not open a live-value env file from the worktree. Never echo a suspected secret value. Identify only
its file, line, and type and recommend rotation.
Report serious, evidence-backed issues only; no style nits.

## Stage-specific focus (S1 — a documentation stage)

This stage's risk is **not** runtime breakage; it is a governing docs pack that *misdescribes the system it
governs*. A doc that states a wrong command, a wrong route, or a wrong access rule is a defect here, because
every later stage is built from these files. Weight the review accordingly:

1. **Fact accuracy.** Spot-check `docs/TECH-ARCHITECTURE.md` (stack versions, routes + access levels, data
   stores, auth/authz matrix, env-var classes) and `docs/DESIGN.md` (tokens, fonts, components) against the
   actual code. Flag anything asserted that the code does not support.
2. **No runtime change.** Confirm the diff touches no `src/`, `package.json`, lockfile, or config — the
   claim "documentation only" must hold literally.
3. **Predevelopment withdrawal is clean.** `docs/predevelopment/` must not exist on the reviewed head, and
   **no dangling reference to it may survive anywhere in the docs pack** — no `docs/predevelopment/...`
   path, no tracker row or sprint scope line still promising a "predevelopment backfill", no open decision
   still demanding predevelopment inputs (D-6 must read WITHDRAWN, not Open). Generic SOP prose that
   *describes* predevelopment as a concept is fine where it is verbatim SOP text (e.g. the copied
   `docs/templates/NEW-WEBSITE-SETUP-CHECKLIST.md`, `docs/testing-setup/**`, and the five skills, which are
   written for the whole system, not this project); what must not survive is a **project-specific claim that
   this repo has, needs, or will get predevelopment files**. `grep -rn "predevelopment" docs/ .claude/
   CLAUDE.md AGENTS.md README.md` and judge each hit against that line. At the time this brief was written
   the tracker renumbering was still in flight and `docs/ROADMAP.md` still listed "predevelopment backfill"
   in the S1 scope row — confirm it does not survive on the reviewed head.
4. **Copy fidelity — 23 byte-identical, 2 intentionally not.** 25 files were copied from
   `Website-Development-System/development/`. **23 must be byte-identical** to their sources:
   `docs/SECURITY-CHECKLIST.md`, `docs/BROWSER-TOOLS.md`, all 10 `docs/templates/*.md`, all 6
   `docs/testing-setup/**`, and all 5 `docs/error-tracking/**`. `cmp` is sufficient:
   `cmp docs/<f> Website-Development-System/development/<f>` for each.
   **The two deliberate exceptions are `docs/SUPABASE-MCP-SAFETY.md` and `docs/SUPABASE-VERCEL-SETUP.md`.**
   Each gained a **prepended "(Un)Retire project values" block** that resolves the SOP's generic
   `[BRACKETS]` for this project (and records that Supabase MCP is **not** connected — Profile A). This is
   intended, not drift. Verify that in each of those two files the diff is **additive at the top only** and
   the SOP body below the block is unchanged, and that the prepended block contains **no live value** —
   project refs, domains, and the Vercel project are all "⚠ Owner to confirm" placeholders, which is correct.
   Also confirm `Website-Development-System/` itself is unmodified as a read-only SOP source.
5. **Safety boundaries intact.** The filled `CLAUDE.md`, `AGENTS.md`, and the five `.claude/skills/*/SKILL.md`
   must not have weakened any rule of their source template — especially Commit/Push default-NO, the
   never-open-live-env rule, server-side authorization before protected reads, owner-only merge, and the
   findings-only (no-edit) reviewer role.
6. **Secret hygiene.** `env.example` must contain names + unmistakably fake placeholders only (11 names,
   matching the 11 `process.env.*` names in `src/`). Confirm no real value, and that no doc pastes a live
   value. Env names are documented in `docs/TECH-ARCHITECTURE.md` §6 and `docs/PROJECT-STATUS.md` §9 —
   names only.
7. **Honest status.** `docs/PROJECT-STATUS.md` must not overstate completion: the lint failure is recorded
   as a failure, no check is claimed that was not run, no Preview result is claimed (none exists yet), and
   the 16 known issues + open decisions D-1…D-12 (D-6 withdrawn) are present and consistent with
   `docs/ROADMAP.md`.
8. **Stage numbering is consistent.** The docs pack was authored under the old R1–R7 sprint plan, which the
   owner replaced on 2026-08-25 with the 5-stage plan **S1–S5**. On the reviewed head, `PROJECT-STATUS.md`,
   `ROADMAP.md`, and every cross-reference should speak in S-IDs (with the supersession explicitly recorded).
   The only correct surviving `r1`/`R1` names are the branch `claude/r1-system-retrofit` and the sprint
   record filename. Flag any *plan* reference that still routes later work to a sprint ID that no longer
   exists — especially "fix in R3" / "R7" style pointers in known issues and open decisions.
9. **Default branch.** This repo's default branch is `master`, not `main`. Every reference should say
   `master` (or explicitly discuss the D-1 rename). A bare `main` instruction would send later work to a
   branch that does not exist.
10. **Cross-reference integrity.** Every `docs/` and `src/` path cited in the filled docs should resolve.
    Three expected-future/conditional exceptions are known and acceptable: `docs/FEATURE-LIST.md` (produced
    by `/activate-testing`), `docs/INCIDENT-LOG.md` (produced by `/handle-error`), and `docs/THREAT-MODEL.md`
    (conditional text inside the verbatim `close` skill). Anything else that does not resolve is a finding.

## What would make this stage a failure

Any one of these is **STAGE NOT APPROVED**, regardless of how much else is right. This is the bar:

1. **A doc that misstates a command, a route, or an access rule.** A wrong `pnpm` command, a route listed at
   the wrong path or the wrong access level, a gate described as protected that is public (or vice versa),
   or a wrong env-var class (public vs server-only). Every later stage is built from these files, so a wrong
   fact here propagates into code.
2. **A weakened safety boundary** in `CLAUDE.md`, `AGENTS.md`, or any of the five `.claude/skills/*/SKILL.md`
   relative to its SOP source — Commit/Push defaulting to anything but NO, a softened never-open-live-env
   rule, dropped server-side authorization language, self-merge or reviewer-edits permitted, or a removed
   fail-closed requirement.
3. **A real value in `env.example`** (or in any doc): a key, token, secret, connection string, project ref,
   or private URL. Report file, line, and type only — never the value — and recommend rotation.
4. **Any `src/`, `package.json`, lockfile, or config change** sneaking into a stage declared documentation
   only. The scope claim must hold literally, not approximately.
5. **`docs/PROJECT-STATUS.md` overstating done-ness**: a check marked PASS that failed or was not run, a
   Preview result claimed without one, a known issue silently dropped, a sprint marked further along than
   the working tree supports, or an open decision recorded as resolved without an owner decision.
6. **A surviving dangling `docs/predevelopment/` reference** that tells a future session to read, fill, or
   wait on files that were withdrawn and do not exist.
7. **Unexplained drift in a copied SOP file** — any of the 23 that should be byte-identical differing, or a
   change inside the SOP body of the two Supabase docs (as opposed to their prepended project-values block),
   or any modification to `Website-Development-System/` itself.

## Returned record

Begin with:

- Confirmed range: 0983ad557218666b63cb5b6d3db9152041865bb9..b6594b593d0e1980986d8bfb54411aa42ebb3ebb
- Scope match: [YES / NO — explanation]
- Files/context inspected: [LIST]
- Commands/evidence checked: [RESULTS_AND_SKIPS]

For each finding:

### Finding [N]
- **Severity:** Blocking / Should-fix
- **Location:** [path/file.ext:line plus route/flow]
- **Issue:** [One or two evidence-based sentences.]
- **Failure scenario:** [Concrete input/state → wrong outcome.]
- **Suggested fix:** [Specific minimal fix.]
- **Confidence:** high / medium / low

If there are no findings, state **No findings** and list the correctness, safety, build, and Preview paths
verified. Do not return a bare approval.

End with the stage verdict in the form defined by `docs/templates/CODEX-STAGE-REVIEW-TEMPLATE.md` — exactly
one of:

**Verdict: STAGE APPROVED** — [ONE_LINE_REASON].
**Verdict: STAGE NOT APPROVED** — [ONE_LINE_REASON].

Reviewed range: 0983ad557218666b63cb5b6d3db9152041865bb9..b6594b593d0e1980986d8bfb54411aa42ebb3ebb · Stage S1 — System Integration · Reviewed by [REVIEWER] on [DATE].

STAGE NOT APPROVED blocks the merge and Stage 2 does not open until the findings are fixed and a new head is
reviewed. The owner or builder appends this returned record to
`docs/code-reviews/S1-stage-review.md`. Any substantive change after HEAD_SHA invalidates
approval and requires updated checks, a refreshed Preview, and independent review of the new immutable head.
A commit that only appends this review record may be exempt when its documentation-only scope and reviewed
head are recorded.
