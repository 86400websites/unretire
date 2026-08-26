# Codex Stage Review Brief — S1 — System Integration

## ⛔ STATUS: BLOCKED — THIS IS A **POST-MERGE** ARTIFACT. DO NOT RUN IT YET.

**Current verdict on record: STAGE NOT APPROVED** (Codex, 2026-08-25) — 2 Blocking findings. See
**§ Review rounds → Round 1** at the end of this file for the full record. History here is **appended,
never erased**; a later round does not delete an earlier one.

The stage gate is the **last** gate in the chain, not the first. `docs/WORKFLOW.md` §5–§7 orders it:

```
branch → local checks → PR → tested Preview → per-PR Codex review → APPROVE → owner merges → THEN this stage gate
```

**This file must NOT be dispatched to a reviewer until all four are true:**

| # | Precondition | Where it is satisfied | State |
|---|---|---|---|
| (a) | The **per-PR review** returns **APPROVE** at the current head | `docs/code-reviews/S1.1-system-retrofit-review.md` | ❌ not yet run |
| (b) | The **deployed Preview has been tested at that same head** | Preview URL + result recorded in the per-PR brief | ❌ no PR/Preview yet |
| (c) | The **owner has merged** the PR into `master` | owner action; only the owner merges | ❌ not merged |
| (d) | The range below is **re-pinned to the merged `master` range** | this file, "Review target" | ❌ still pinned to the pre-merge branch |

**Every SHA in the "Review target" section below is the pre-merge *branch* range and is therefore STALE.**
It is retained only as the historical record of what was originally (and wrongly) pinned. Before dispatch,
re-pin the immutable range to the merged `master` range — the pre-merge `master` tip
(`0983ad557218666b63cb5b6d3db9152041865bb9` unless `master` has moved) `..` the merge commit on `master` —
and confirm it with `git log --oneline master` and `git diff <base>..<merge> --name-only`.

Running this stage gate against an unmerged branch is exactly what Codex flagged as **Blocking Finding 1**
on 2026-08-25. Do not repeat it.

> **Stage 1 of the owner-approved 5-stage plan (2026-08-25): S1 System Integration → S2 Readiness Setup →
> S3 Critical Fixes → S4 Improvement Plan → S5 Launch Gate.** Each stage ends with this independent Codex
> review — which runs on the **merged `master` range**, after the per-PR review and the owner's merge.
>
> **ID note:** this stage was built and recorded under the earlier ID **R1** ("system retrofit"), which the
> 5-stage plan **supersedes**. The old artifacts keep their `r1` names on purpose, for traceability:
> branch `claude/r1-system-retrofit` and sprint record `docs/sprint-prompts/R1-system-retrofit.md`. Treat
> `R1` and `S1.1` as the same work. A surviving `R1` name in *those two places* is correct; a surviving
> `R1`–`R7` **plan** elsewhere is stale (see focus item 8).

> **Historical head note — superseded by (d) above, kept for the record.** The **substantive** head of the
> branch as first recorded was `b6594b593d0e1980986d8bfb54411aa42ebb3ebb`, on the assumption that any later
> commit touched **only this review record**. That assumption no longer holds: as of 2026-08-25 the branch
> tip is `702437557f133ad31cfe7791faec8feb75bb2aba`, and `git diff b6594b5..HEAD --name-only` lists
> `.gitignore` and 57 deletions under `Website-Development-System/**` as well as this file — commit
> `7024375`, which implements the **D-12 = NO** outcome. That is substantive work, so `b6594b5` is **not**
> the head of anything reviewable. Head pinning for the *branch* is now handled by the per-PR brief; head
> pinning for *this* file is handled by precondition (d) — the merged `master` range.

> **Scope note (added 2026-08-25):** beyond the initial docs-pack commit `f01f139` the branch carries
> `acc0a2a` (completes the `env.example` → `.env.example` rename and adds the `!.env.example` whitelist to
> `.gitignore`; git records it as `R100`, a byte-identical rename), `b6594b5` (records owner decisions D-8,
> D-10 and D-11 in the trackers), and `7024375` (implements D-12 = NO: gitignores and untracks
> `Website-Development-System/`). All are documentation/config only and all will be inside the merged
> `master` range once (c) is done.

> **Scope note on D-12 — remediation of Blocking Finding 2.** This brief must never assume D-12. Whether
> `Website-Development-System/**` belongs in the reviewed scope is decided by the owner's recorded D-12
> outcome, verified in `docs/PROJECT-STATUS.md` at review time — **not** by what happens to be in the diff.
> If the tree and the tracker disagree, that mismatch is itself the finding. See the per-PR brief's focus
> item 8, which now owns this check at the PR gate.

> This brief is saved at `docs/code-reviews/S1-stage-review.md`. Append each reviewer's returned
> record under **§ Review rounds** at the end; the reviewer does not edit the repository.

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
   `[BRACKETS]` for this project (and records that Supabase MCP is **not** connected; Profile B — production read-only — was approved by the owner on 2026-08-25 under D-11 and is wired in S2.2). This is
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

---

# Review rounds

*Appended newest last. **History is appended, never erased** — a superseded round stays on the record with
its findings intact, so a later session can see what was wrong and how it was fixed.*

## Round 1 — 2026-08-25 — Codex

**Verdict: STAGE NOT APPROVED** — the stage gate was dispatched out of sequence, and its declared scope
includes owner-gated content whose owner decision is still recorded Open.

Reviewed range as submitted: `0983ad557218666b63cb5b6d3db9152041865bb9..b6594b593d0e1980986d8bfb54411aa42ebb3ebb`
(pre-merge branch range — part of what the review rejected).

Both findings are assessed as **correct**. Recorded here verbatim in substance:

### Finding 1 — Blocking — review sequence

- **Severity:** Blocking
- **Location:** `docs/code-reviews/S1-stage-review.md` (whole file) — workflow, not code
- **Issue:** The stage gate was run at the wrong point in the chain. `docs/WORKFLOW.md` orders it
  branch → local checks → PR → tested Preview → **per-PR Codex review → APPROVE → owner merges** → and
  *then* the stage-gate review runs against the merged `master` range. What was produced instead was a
  stage brief for an **unmerged branch**, with **no per-PR review** and **no Preview evidence**. `master`
  still points at the merge-base `0983ad55…`.
- **Failure scenario:** A stage verdict issued on an unmerged branch certifies a range that `master` never
  contained. If the branch is then rebased, amended, or partly merged, the "approved" range and the shipped
  range differ, and the per-PR gate — the one that catches PR-level defects and confirms a tested Preview —
  is skipped entirely. Nothing in the record would show it was skipped.
- **Remediation (in progress, 2026-08-25):**
  1. The missing per-PR brief has been written at **`docs/code-reviews/S1.1-system-retrofit-review.md`**,
     filled from the canonical `docs/templates/CODEX-REVIEW-PROMPT-TEMPLATE.md`. It is the gate that runs
     first, and it carries the head-pinning proof step, the Preview requirement, and the
     documentation-sprint focus list.
  2. This file has been re-headed as an unmistakably **post-merge** artifact, with the four preconditions
     (a) per-PR APPROVE at the current head, (b) tested Preview at that head, (c) owner merge, (d) range
     re-pinned to the merged `master` range — all four now stated at the top and all four currently unmet.
  3. Its pre-merge SHAs are explicitly marked stale and retained only as the historical record.
- **Confidence:** high

### Finding 2 — Blocking — scope includes an undecided owner gate

- **Severity:** Blocking
- **Location:** `docs/code-reviews/S1-stage-review.md` → "Review target" → Expected changed paths; and
  `docs/PROJECT-STATUS.md` → open decisions, **D-12** (D-7 superseded)
- **Issue:** The immutable range adds all **57 `Website-Development-System/**` files** while decision
  **D-12** ("commit the SOP folder?") is still recorded **Open** in `docs/PROJECT-STATUS.md`. The declared
  scope therefore includes owner-gated content with no recorded owner decision.
- **Failure scenario:** A reviewer approves a range containing 57 files the owner never agreed to commit.
  The folder lands on `master` by review inertia rather than by decision, and the tracker still says the
  question is open — so a later session cannot tell whether the commit was authorized or accidental.
- **Remediation (in progress, 2026-08-25):**
  1. D-12 has been put to the owner as an explicit **yes / no**. Nothing in the review record assumes an
     outcome; the per-PR brief is authored for **both**.
  2. The per-PR brief's **focus item 8** now owns this check at the PR gate: it defines the acceptable end
     state for D-12 = YES (folder tracked **and** tracker records Resolved YES) and for D-12 = NO (folder
     untracked/gitignored **and** tracker records Resolved NO), and names the unacceptable middle state.
  3. **The unacceptable middle state is what the repo is in right now.** Commit `7024375` applies
     **D-12 = NO** — `Website-Development-System/` is gitignored and untracked — while
     `docs/PROJECT-STATUS.md` records D-12 as **Resolved — NO** (see §8) and D-7 as *"Open —
     wording superseded by D-12"*. Tree and tracker disagree. The tracker must record D-12 (and D-7) as
     **Resolved**, with the outcome, the owner, and the date, before either gate can pass. This is a
     documentation-only fix and is **not yet done**.
- **Confidence:** high

**Round 1 outcome:** merge blocked; Stage 2 does not open. Both findings must be fixed and a new head
reviewed — first at the per-PR gate, then here on the merged `master` range.

Reviewed range: `0983ad557218666b63cb5b6d3db9152041865bb9..b6594b593d0e1980986d8bfb54411aa42ebb3ebb` ·
Stage S1 — System Integration · Reviewed by Codex on 2026-08-25.

## Round 2 — [DATE] — [REVIEWER]

*Not yet run.* Blocked on preconditions (a)–(d) in the status block at the top of this file.
