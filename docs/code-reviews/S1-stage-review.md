# Codex Stage-Gate Review Brief — S1 — System Integration

> Save the filled brief at docs/code-reviews/S1-stage-review.md before review.
> Append the reviewer's returned record; the reviewer does not edit the repository.

## ⏳ STATUS: ROUND 4 RETURNED **STAGE NOT APPROVED** (2026-08-26) — S1.3 remediation in progress; Round 5 next

Round 4 (filed under § Review rounds below) raised 4 Blocking + 1 Should-fix cumulative findings. All five
are being fixed by sprint **S1.3** (`claude/s1.3-stage-remediation-2`; record
`docs/sprint-prompts/S1.3-stage-remediation-2.md`), grounded in two owner-supplied facts obtained the same
day: the Vercel dashboard screenshot (Mailchimp names = ONE shared entry each) and the owner's confirmation
that the `master` PR-before-merge protection rule is already enabled. After the S1.3 PR merges on per-PR
APPROVE, re-pin §1's stage head to the S1.3 merge commit and dispatch **Round 5** per the stub below.

**Round 4 re-pin (2026-08-26, post-S1.2-merge):** stage-gate Round 3 returned NOT APPROVED with 8
documentation findings; remediation sprint **S1.2** fixed all 8 (plus the 5 findings its own per-PR review
raised in round 1), reached **per-PR APPROVE at round 2** (head `e78faa8`; the two later commits are
record-only appends the approval covers), and was merged by the owner as **PR #2 → merge commit
`4c3d52edcd94a1cda42fc6449874739774bfb419`**. This brief is re-pinned to the full stage range
`0983ad5…..4c3d52e…` covering both PRs. The table below records PR #1's original preconditions; PR #2's
equivalents are all met: per-PR APPROVE ✅ (round 2) · Preview deployed ✅ (Vercel Ready on PR #2) ·
owner merge ✅ (`4c3d52e`) · range re-pinned ✅ (§1 below).

This version supersedes the pre-merge "BLOCKED — DO NOT RUN" version of this file (that version, pinned to
the obsolete branch head `b6594b5`, is preserved in git history — see the merged branch — and its refusal
rationale is preserved as **Round 1** and **Round 2** under § Review rounds below; history is appended,
never erased).

| # | Precondition | Evidence | State |
|---|---|---|---|
| (a) | Per-PR review returns **APPROVE** at the current head | `docs/code-reviews/S1.1-system-retrofit-review.md` § Review rounds → **Round 9 — 2026-08-26 — APPROVE**, range `0983ad5…..39f698d…`. The two commits after `39f698d` (`ff1dae7`, `543d26e`) append review-round records only — the exemption for record-append commits, with scope and reviewed head documented inside Round 9 itself | ✅ |
| (b) | Deployed Preview tested at that head | Per-PR record line ~115: `https://unretire-git-claude-r1-system-retrofit-86400-s-projects.vercel.app` — built and serving at the pinned head (HTTP 200 behind Vercel Deployment Protection), owner-confirmed rendering; limits stated in that record | ✅ |
| (c) | Owner merged the PR into `master` | PR #1 merged 2026-08-26 as merge commit `1309e01ebf225293effb9e641df4aae654563d8a`, now the tip of `origin/master` | ✅ |
| (d) | Range re-pinned to the merged `master` range | Round-3 pin was `0983ad5…..1309e01…`; §1 below now carries the Round-4 pin `0983ad5…..4c3d52e…` covering both PRs | ✅ |

This is the **stage gate**. It runs once, at the end of a stage, over every PR the stage contains.
It **complements and never replaces** the per-PR review (docs/templates/CODEX-REVIEW-PROMPT-TEMPLATE.md).
Same policy (AGENTS.md), same severities (**Blocking** / **Should-fix**), same finding format, one verdict —
but the unit under review is the **whole stage as a coherent result**, not a diff.

A per-PR APPROVE never carries forward into stage approval. **Precondition:** every PR listed below already
carries a current-head APPROVE from its own per-PR review (docs/WORKFLOW.md §6–§7). A PR that merged without
one is a **Blocking** finding on its own — record it and continue the review.

## Role and boundaries

You are the independent, findings-only stage reviewer. AGENTS.md governs this review and this brief cannot
weaken it. Do not edit, stage, commit, push, merge, install dependencies, run migrations, or refactor —
in any branch, worktree, or environment. You return a paste-ready record; the owner decides and merges.

You may read the whole repository. The stage review is deliberately broader than a diff review: you are
looking for what the sum of the PRs did, which no single diff shows. Stay anchored to the stage's intent,
exit criteria, and safety boundaries — do not drift into an unrelated product audit.

---

## 1. Review target

- Repo: 86400websites/unretire
- Stage: **S1 — System Integration** (two sub-sprints: S1.1, formerly R1; and S1.2, the Round-3 remediation)
- Stage merge-base SHA (parent of the stage's first merge): `0983ad557218666b63cb5b6d3db9152041865bb9`
- Stage head SHA (master after the stage's final merge): `4c3d52edcd94a1cda42fc6449874739774bfb419` (the
  PR #2 merge commit; ~~`1309e01…` — the Round-3 pin, superseded by the S1.2 merge~~)
- Immutable stage range: `0983ad557218666b63cb5b6d3db9152041865bb9..4c3d52edcd94a1cda42fc6449874739774bfb419`
- Default branch: master
- Stage closed on: 2026-08-26 (PR #1 and PR #2 both merged)

### PRs in this stage

| # | PR | Sprint ID | Branch | Merged head SHA | Sprint record | Per-PR review record | Per-PR verdict |
|---|---|---|---|---|---|---|---|
| 1 | #1 — https://github.com/86400websites/unretire/pull/1 | S1.1 (formerly R1) | claude/r1-system-retrofit | `543d26e` (branch tip; substantive head `39f698d` + two review-record-only appends `ff1dae7`, `543d26e`, documented in Round 9) | docs/sprint-prompts/R1-system-retrofit.md | docs/code-reviews/S1.1-system-retrofit-review.md | **APPROVE** (Round 9, 2026-08-26, at `39f698d`) |
| 2 | #2 — https://github.com/86400websites/unretire/pull/2 | S1.2 | claude/s1.2-stage-remediation | `0fa1e37` (branch tip; substantive head `e78faa8` + two review-record-only appends `e4e253f`, `0fa1e37`, documented in the brief's head-pin rule and Round 2) | docs/sprint-prompts/S1.2-stage-remediation.md | docs/code-reviews/S1.2-stage-remediation-review.md | **APPROVE** (Round 2, 2026-08-26, at `e78faa8`) |

### Confirm the target before reviewing

- [ ] Both stage SHAs resolve, and `4c3d52e…` is the current tip of master.
- [ ] The commits in the range are exactly the two listed PRs' branch commits plus their two merge commits
      (`1309e01`, `4c3d52e`) — ~45 commits total, all from `claude/r1-system-retrofit` and
      `claude/s1.2-stage-remediation` — **no extra merge, no direct push to master, no force-push**
      slipped into the range.
- [ ] The changed-file list for the whole range matches the declared scope: PR #1's 59 paths plus PR #2's
      13 paths (overlapping), **all under `docs/`, `.claude/skills/`, or root documentation (`CLAUDE.md`,
      `AGENTS.md`, `README.md`, `.env.example`, `.gitignore`). Zero `src/` paths; no `package.json`,
      lockfile, `next.config.*`, `tsconfig.json`, or PostCSS/Tailwind config in the combined range.**
      (Builder-verified 2026-08-26 per PR; re-verify on the combined range.)
- [ ] Both listed per-PR review records exist and each reviewed head relates to its merged head exactly as
      the table above states (substantive head + record-only appends).

**Working-tree note (updated at S1.3, 2026-08-26):** ~~two untracked files exist in the local working
tree — the planned S2.1 records~~ — the two prepared S2.1 planning records
(`docs/sprint-prompts/S2.1-code-check-ci.md`, `docs/code-reviews/S2.1-code-check-ci-review.md`) are now
**committed on the S1.3 branch**: the Round-4 Finding-2 fix had to correct the S2.1 prompt's
branch-protection wording, so both records ride that PR. The earlier pattern of this brief carrying
uncommitted re-pin modifications between rounds continues: each re-pin rides the next authorized branch
per `docs/PROJECT-STATUS.md` §11 (the Round-3 fill rode S1.2; the Round-4 fill + Round-4 record rode
S1.3; the Round-5 re-pin will ride the S1.3→Round-5 dispatch state or the subsequent branch).

Stop and report a target mismatch before reviewing if any of these disagree.

---

## 2. Read for context

- AGENTS.md (canonical reviewer policy) and CLAUDE.md (builder rules and stack lock).
- docs/WORKFLOW.md (delivery chain, §7 merge rule), docs/ROADMAP.md (S1 row + the **Universal sprint exit
  gate**), docs/PROJECT-STATUS.md (§1–§3 state, §6 checks, §7–§8 decisions, §10 known issues, §11 update rules).
- docs/TECH-ARCHITECTURE.md, docs/SECURITY-CHECKLIST.md, docs/TECHNICAL-INTEGRITY.md.
- The sprint record and per-PR review record listed in §1 (the per-PR record's nine rounds are the
  audit trail of how this stage reached APPROVE).
- Stage-specific: docs/content/locked-facts.md, docs/content/page-copy/home.md, docs/DESIGN.md,
  docs/SUPABASE-MCP-SAFETY.md, docs/SUPABASE-VERCEL-SETUP.md, docs/ENVIRONMENT-PARITY.md,
  the five `.claude/skills/*/SKILL.md`, docs/testing-setup/**, docs/error-tracking/**.

---

## 3. Stage intent and exit criteria

- Stage goal, in one paragraph: install the Website-Development-System into an **already-built** site —
  governing docs filled with code-verified facts, the five Claude Code skills, the testing + error-tracking
  modules, content-freeze records, and live trackers naming every known issue and open decision. Exit: the
  repo is self-contained and governed — every later change travels branch → checks → PR → Preview → review →
  merge. **Documentation and tooling only; no runtime behavior may change.** Within the stage, sub-sprint
  **S1.2** (PR #2) remediated the 8 documentation findings this gate's own Round 3 raised, plus the 5
  findings its per-PR review raised in round 1 — all closures independently verified by that review's
  round-2 APPROVE.
- Intentionally out of scope, with the stage that owns each: CI workflow + scripts + the pre-existing lint
  error at `src/app/premium/page.tsx:182` (**S2.1**, Known issues 10/16); `.mcp.json` / agent tooling,
  MAILCHIMP_LIST_ID split, `staging` build (**S2.2**); Playwright harness (**S2.3**); Sentry (**S2.4**);
  parity proofs (**S2.5**); the live-breakage fixes (**S3.1**, Known issues 1–2, 22, 43, 45); hygiene
  deletions (**S3.2**); audits + hardening (**S4.1–S4.4**, Known issues 37–42); abuse controls, legal pages,
  deliverability (**S4.5**, Known issue 44); suite and launch (**S5**). The ten code defects found by the
  per-PR review are **deliberately deferred by explicit owner instruction** — S1 documents, it does not fix;
  each is recorded in PROJECT-STATUS §10 with file, line, mechanism, and fixing sprint.
- Owner-authorized exceptions: the `env.example` → `.env.example` rename plus `!.env.example` whitelist
  landed **in-branch** (commit `acc0a2a`) once tooling allowed it — the earlier recorded deviation is
  historical. The `master` PR-before-merge protection rule is **already enabled** (owner-confirmed 2026-08-26, Round 4 Finding 2); the remaining owner action — adding the required "Code Check" status and watching the lock work — is owed at S2.1 (web UI; gh CLI absent).
- **Withdrawn mid-stage — `docs/predevelopment/`:** ~10 files were created, then withdrawn on owner
  instruction 2026-08-25 (project already at development stage; D-6 WITHDRAWN). The reviewer must confirm
  the withdrawal is clean — no dangling project-specific reference survives (see §6 focus item 3).
- Hosting/Preview state at `4c3d52e`: Preview evidence per §1 (both PRs). **Production at the Round-3 stage
  head (probed 2026-08-26, read-only):** `https://unretire.vercel.app` HTTP 200; `/api/stripe/webhook`
  returns `Missing signature` unsigned and `Invalid signature` on a bogus signature; `og:url` resolves
  `https://unretire.vercel.app` — the docs-only merge changed no runtime behavior.
- Database/migration state: N/A — no migration, no schema change, no database access in this stage.
- The next stage is **S2 — Readiness Setup** (first sprint S2.1 — Code Check CI), and it depends on this
  stage delivering: (1) accurate live trackers (PROJECT-STATUS + ROADMAP); (2) docs/TECHNICAL-INTEGRITY.md
  as the CI spec; (3) Known issues 10/16/20 recorded with S2.1 ownership; (4) a tracked, placeholder-only
  `.env.example`; (5) the five skills loadable; (6) the sprint-record + review-brief conventions S2.1's
  prepared records follow.

### Exit criteria — rows 1–5 from the docs/ROADMAP.md S1.1 row (as amended by S1.2); row 6 is the
### stage-level criterion (moved out of S1.1 by S1.2 Finding-3 fix); row 7 is S1.2's own acceptance.
### Reviewer completes the last two columns.

| # | Exit criterion | Claimed evidence | How the reviewer verified it | VERIFIED / NOT VERIFIED / UNVERIFIABLE |
|---|---|---|---|---|
| 1 | Docs pack exists with no critical placeholder unfilled | Builder sweep 2026-08-26 at `1309e01`: ~260 bracketed-token hits across docs/**, CLAUDE.md, AGENTS.md — every one in a sanctioned class (verbatim template skeletons; per-use slots; SOP copies with prepended project-values blocks; review-brief owner-supplied values explicitly marked pending; quoted/struck historical text). Round 3's two placeholder-class defects (unfilled §9 invariants; stale operational facts) were corrected by S1.2 and verified closed by its round-2 APPROVE at `e78faa8` | | |
| 2 | All 5 skills load by name | `.claude/skills/{activate-testing,browser-qa,close,handle-error,sprint-prompt}/SKILL.md` — all five tracked at `1309e01`, non-empty (5–13 KB), frontmatter name matches directory, all listed loadable | | |
| 3 | Content freeze files match on-disk code (flagged items listed, not locked) | Builder spot-check 2026-08-26: $99 one-time and $199/yr match code at `src/app/learn/course/page.tsx`, `src/app/premium/page.tsx`, `src/lib/stripe/checkout.ts:13-19` (modes payment/subscription); home hero copy verbatim vs `src/app/page.tsx:87-97,146-149`; courseData = 10 modules / 48 lessons (4+6+5+5+5+5+5+4+4+5); the 31-vs-48 inconsistency is FLAGGED in locked-facts (Flagged item 1) and home.md, not locked; placeholder testimonials / "340+ Members" / date-bound banner all flagged and present as described | | |
| 4 | Trackers live | At `4c3d52e` the trackers describe the merged reality (S1.2 Finding-4/5/6 fixes: §1–§8 current, two-gate sequence, D-13 whole-row, 46 known issues incl. the launch-blocking set) — verified by the S1.2 round-2 APPROVE. One deliberate timing exception declared in the disclosed-items list below (S1.2 board row) | | |
| 5 | Owner reviewed and authorized the commit | Blocker #1 cleared in PROJECT-STATUS §5; PR #1 merged by the owner 2026-08-26 (`1309e01`); PR #2 merged by the owner 2026-08-26 (`4c3d52e`) | | |
| 6 | (Stage-level) The S1 stage-gate review returns STAGE APPROVED | **This review** — the criterion this dispatch exists to satisfy; Rounds 1–3 filed below | | |
| 7 | S1.2 acceptance: all 8 Round-3 findings corrected at their cited locations; checks unchanged; per-PR APPROVE | `docs/sprint-prompts/S1.2-stage-remediation.md` + `docs/code-reviews/S1.2-stage-remediation-review.md` — round-2 **APPROVE** at `e78faa8` (2026-08-26) with every F1–F8 closure and all five round-1 findings verified by that reviewer | | |

**A stage with any row that is NOT VERIFIED or UNVERIFIABLE cannot be approved.**

### Known minor items, disclosed by the builder (updated at the Round-4 re-pin, 2026-08-26)

1. `docs/ENVIRONMENT-PARITY.md:956-957` — the doc's own delivery footer (`branch [BRANCH], PR #[PR_NUMBER]…`)
   is still bracketed although PR #1's values now exist. Visibly unfilled (not presented as done); the values
   are owner-supplied by rule. Owner may fill it on the next authorized docs branch. **Still open.**
2. ~~A trailing "Round 1 — *Not yet run*" stub below the nine filed rounds~~ — **fixed in S1.2** (stub
   retired with a dated note; verified by the S1.2 round-2 review).
3. `docs/SUPABASE-MCP-SAFETY.md:12` — the prod project ref row still reads "Owner to confirm" although the
   ref is recorded under resolved D-8/D-11 elsewhere; conservative rather than wrong (prod stays disconnected
   from MCP until S2.2). **Still open, deliberate.**
4. `docs/content/locked-facts.md` cites the book-page testimonials at "lines 40-45"; they sit at 41-44.
   Content identical; line-number drift only. **Still open.**
5. **Declared timing state, not drift:** at the stage head `4c3d52e`, the PROJECT-STATUS §2 board row for
   S1.2 reads **In Progress** and §1 still names S1.2 as the active sprint, although PR #2 is merged. This
   is the rule-compliant state: per §11 and the round-9 precedent, a board flip after the reviewed head
   invalidates per-PR approval, so the flip to Done rides the next authorized branch (S2.1, or a docs
   branch) **after** this gate returns its verdict — this gate's outcome is itself part of what that flip
   must record. Do not file the In-Progress row as a stale-tracker finding.

---

## 4. Evidence

### Commands (run with the existing environment only)

- Typecheck: `pnpm exec tsc --noEmit`
- Lint: `pnpm lint`
- Format check: N/A — no `format:check` script exists yet (arrives in S2.1)
- Tests: N/A — no automated suite yet (harness S2.3, suite S5.1)
- Production build: `pnpm build`
- Stage-specific: `git diff --name-only 0983ad5..4c3d52e`; the byte-identity `cmp` checks in §6 item 4

Do not install, upgrade, change a lockfile, apply a migration, or alter source/config to make a check pass.
State every command you did not run and why.

### Per-PR evidence in this stage

| PR | CI ("Code Check") at merged head | Deployed Preview tested at merged head | QA evidence |
|---|---|---|---|
| #1 | N/A — no CI exists yet; the Code Check workflow is S2.1's deliverable (honest gap, not a lapse) | `https://unretire-git-claude-r1-system-retrofit-86400-s-projects.vercel.app` · built and serving at the pinned head; owner-confirmed rendering (per-PR record, with Deployment Protection limits stated) | N/A — docs-only change; QA-CHECKLIST Part 2 applies to UI sprints |
| #2 | Two green Vercel deployment checks on the PR ("All checks have passed"); Code Check still N/A (S2.1) | `https://unretire-git-claude-s12-stage-remediation-86400-s-projects.vercel.app` · deployment Ready per the PR page; Deployment Protection limits independent rendering (same limit as PR #1) | N/A — docs-only change |

### Evidence at the stage head

- At `e78faa8` (the S1.2 approved head — the stage head `4c3d52e` adds only the two record-only commits
  and the merge above it), the independent S1.2 round-2 reviewer re-ran typecheck (PASS), lint (exactly the
  one known error), and build (PASS, expected routes/pages). **Re-run everything yourself at `4c3d52e`** —
  the earlier builder run below was at the Round-3 pin `1309e01`:
- Checks re-run at `1309e01` (builder, 2026-08-26, this machine): `git rev-parse HEAD` =
  `1309e01ebf225293effb9e641df4aae654563d8a`; range file list = 59 paths, 0 under `src/`, no
  dependency/config files; `pnpm exec tsc --noEmit` **exit 0, zero errors**; `pnpm lint` **exit 1 with
  exactly one error** — `src/app/premium/page.tsx:182` `@next/next/no-html-link-for-pages` (pre-existing
  Known issue 16, deferred to S2.1; reproduce it on the merge-base to confirm it is not introduced);
  `pnpm build` **exit 0** (Turbopack, compiled 25.6s), **35 app route entries** (+ framework `/_not-found`),
  **58/58 static pages**. Non-fatal pre-existing build warnings: middleware-to-proxy deprecation notice and
  a Turbopack NFT trace warning via `next.config.ts` → the book-download route.
- Production smoke at `1309e01` (2026-08-26, read-only probes): site HTTP 200; webhook signature validation
  behaves correctly (`Missing signature` / `Invalid signature`); `og:url` correct; custom domain still
  parked at GoDaddy (Known issue 27, expected).

Per-PR green does **not** prove stage green: the per-PR review ran against the branch head, not the merged
result. The builder's stage-head re-run above is claimed evidence — re-verify, do not inherit.

---

## 5. Stage-level hunt list

These are the questions a per-PR review structurally cannot ask. Work them in order.

1. **Did the stage actually achieve its exit criteria, or only appear to?** For every row in §3, find the
   thing itself — the file, the config value, the route, the passing run — not the sentence that says it
   exists. A checkbox, a PR description, or a status table is a claim, not evidence.

2. **Cumulative drift across the range.** Read the combined range as one diff. This stage's ~45 commits
   across two PRs include nine review-fix rounds (PR #1) plus the Round-3 remediation and its own two-round
   fix cycle (PR #2) — hunt for what only shows up in the sum: a rule stated one way in
   an early commit and contradicted by a later round-fix; a tracker row corrected in one file and left stale
   in its cross-reference; a struck-through claim that a later edit accidentally reinstated; an env-var name
   spelled differently across docs; the Profile A/Profile B history (rounds 7–8) leaving any active text
   that still says Profile A.

3. **Tracker fidelity — is anything claimed as done that is not true in the code?** Walk
   docs/PROJECT-STATUS.md §1, §2, §3, §6, §10 and docs/ROADMAP.md against the repository. A "PASS" that no
   longer reproduces, a known issue marked closed whose defect is still present, a sprint marked complete
   with unfinished scope — each is a finding. Confirm §11 was honoured: trackers updated in the same branch
   as the work; resolved rows struck through with dates, never deleted. Note: the S1.1 board row reads
   *Ready for Review* at the reviewed head — correct by the round-9 rule (the flip to *Done* rides a tiny
   post-merge docs branch, not the reviewed branch).

4. **Deferred-item ledger.** Collect every Should-fix and deliberately-deferred item from the per-PR rounds:
   the ten code defects (Known issues 22, 37–45) deferred by owner instruction, each of which must have its
   §10 row with file, line, mechanism, and fixing sprint; the minor items disclosed in §3 above. Any item
   that silently disappeared between a review round and the trackers is a finding. Confirm **no Blocking
   finding from any per-PR round was merged over** — every round-1-through-8 Blocking finding must show as
   FIXED in the per-PR record with round 9 confirming none remain.

5. **Safety boundaries — weakened anywhere across the stage?** Apply the AGENTS.md checklist and
   docs/SECURITY-CHECKLIST.md to the whole range: §1 no secret, token, key, connection string, or private
   URL anywhere (docs, skills, `.env.example` — placeholder-only); §2 env boundary intact (no server-only
   name presented as public; classifications in TECH-ARCHITECTURE §6 / PROJECT-STATUS §9 correct);
   §3 no gating language weakened in CLAUDE.md/AGENTS.md/skills relative to SOP sources (Commit/Push
   default-NO, never-open-live-env, server-side authorization, owner-only merge, findings-only reviewer);
   §4–§7 N/A for a docs-only range except as documentation claims — verify the docs do not assert a
   protection the code lacks (the corrected open-redirect retraction, Known issue 38, is the precedent:
   confirm no reinstated false safety claim anywhere).

6. **Scope containment and stack lock.** Files outside the declared scope; any dependency or locked-layer
   change (there must be none); approved copy or facts changed outside docs/content/; an unexplained
   suppression directive. `Website-Development-System/**` must contribute **zero** paths to the range
   (D-12 = NO, implemented in `7024375`) while the folder remains on disk, gitignored.

7. **Half-built things.** A doc naming a script absent from package.json is acceptable **only** where it
   names it as a future deliverable with its owning sprint (e.g. `pnpm typecheck` → S2.1) — flag any doc
   that presents a nonexistent command, path, or file as currently available. Known accepted
   future-references: docs/FEATURE-LIST.md (S5.1), docs/INCIDENT-LOG.md (post-launch),
   docs/THREAT-MODEL.md (conditional in the close skill), docs/FIX-LOG.md (S3.1 onward, owner-decided
   2026-08-26), qa-evidence/ (S2.3).

8. **Reversibility.** docs/ROLLBACK.md describes a path that works from `4c3d52e`. Nothing destructive
   shipped in this stage; confirm that claim against the range (deletions in the range are the withdrawn
   predevelopment files and the D-12 untracking — both documentation-state, not data).

9. **Is the repo genuinely ready for S2 (S2.1 first)?** Prove each §3 dependency present and usable now:
   TECHNICAL-INTEGRITY.md carries the exact workflow YAML and five-script contract; Known issues 10/16/20
   are recorded with S2.1 ownership; `.env.example` is tracked and `.gitignore` carries `.env*` +
   `!.env.example` without un-ignoring anything live; prettier + prettier-plugin-tailwindcss already sit in
   devDependencies (so S2.1 needs no dependency change); the trackers name S2.1 as next with its scope.

Report serious, evidence-backed issues only. No style nits, no speculative rewrites, no critique of approved
copy or design.

---

## 6. Per-stage focus block — S1 — System Integration · documentation fidelity

This stage's risk is not runtime breakage; it is a governing docs pack that *misdescribes the system it
governs*. Every later stage is built from these files.

1. **Fact accuracy.** Spot-check docs/TECH-ARCHITECTURE.md (stack versions, routes + access levels, data
   stores, auth matrix, env-var classes) and docs/DESIGN.md (tokens, fonts, components) against the code.
   Confirm the round-5/6-corrected claims stayed corrected: course content is NOT entitlement-protected
   (Known issue 37), the auth-confirm redirect IS an open redirect (Known issue 38), webhook failures do
   NOT produce retries today (Known issue 22) — the architecture doc must state the true, broken behavior
   with its fixing sprint, not the aspirational one.
2. **No runtime change.** The diff must touch no `src/`, `package.json`, lockfile, or config — verify
   against the range's file list (claimed: 59 paths, zero `src/`), not the claim.
3. **Predevelopment withdrawal is clean.** `docs/predevelopment/` must not exist at `4c3d52e` and no
   project-specific claim that this repo has, needs, or will get predevelopment files may survive
   (`grep -rn "predevelopment" docs/ .claude/ CLAUDE.md AGENTS.md README.md`; generic SOP prose describing
   the concept in verbatim copies is fine; D-6 must read WITHDRAWN).
4. **Copy fidelity — 22 byte-identical, 3 intentionally not** *(ledger updated at the Round-4 re-pin:
   S1.2 made docs/SECURITY-CHECKLIST.md the third declared exception)*. Of the 25 files copied from the
   SOP source, 22 must be byte-identical (docs/BROWSER-TOOLS.md, all 10 docs/templates/*.md, all 6
   docs/testing-setup/**, all 5 docs/error-tracking/**). The three exceptions: docs/SUPABASE-MCP-SAFETY.md
   and docs/SUPABASE-VERCEL-SETUP.md each carry a prepended "(Un)Retire project values" block (the latter
   now including the 2026-08-26 `main`→`master` override) with the SOP body below unchanged; and
   docs/SECURITY-CHECKLIST.md carries the §9 project-invariants fill **mandated by its own §9
   instruction** (S1.2 Finding-3 fix) with the SOP body outside §9 unchanged. No exception block may
   contain a live value. `Website-Development-System/` itself (on disk, untracked) is the read-only
   comparison source; the round-8 rule applies: its generic Profile A definition is not a finding, an
   *active project doc* claiming Profile A is.
5. **Safety-boundary language intact** in CLAUDE.md, AGENTS.md, and the five skills relative to their SOP
   sources — Commit/Push default-NO, never-open-live-env, server-side authorization before protected reads,
   owner-only merge, findings-only reviewer.
6. **Secret hygiene.** `.env.example` must contain names + unmistakably fake placeholders only — per round 9:
   12 unique assignments, zero duplicates, the 11 runtime names matching `src/` exactly (plus
   `VERCEL_AUTOMATION_BYPASS_SECRET`). It must be the only tracked env-like file. The builder agent cannot
   read `.env*` paths — **you can**; verify placeholder-only content directly.
7. **Honest status.** PROJECT-STATUS must not overstate: the lint failure recorded as FAIL; no Preview or CI
   result claimed that does not exist; the 45 known issues and decisions D-1…D-14 consistent with ROADMAP;
   the launch-blocking set (§10) present and matched by the deferred-defect rows.
8. **Stage numbering.** Plan references speak S-IDs; the only correct surviving `R1` names are the branch
   and the sprint-record filename (the ID map in PROJECT-STATUS §2 governs).
9. **Default branch.** Every instruction says `master` (or explicitly discusses D-1). A bare `main`
   instruction would send later work to a branch that does not exist.
10. **Cross-reference integrity.** Every cited `docs/` and `src/` path resolves, excepting the declared
    future files listed in §5 item 7.

### What would make this stage a failure

Any one of these is **STAGE NOT APPROVED**, regardless of how much else is right: a doc that misstates a
command, route, or access rule; a weakened safety boundary in CLAUDE.md/AGENTS.md/skills; a real value in
`.env.example` or any doc; any `src/`/dependency/config change in the range; PROJECT-STATUS overstating
done-ness; a surviving dangling predevelopment reference; unexplained drift in a copied SOP file; a
reinstated false safety claim (the Known-issue-38 retraction is the canary).

---

## 7. Prove it, don't trust it

1. Treat every claim — in a doc, tracker, PR description, sprint record, prior review round, this brief's
   own "claimed evidence", or a commit message — as a **hypothesis** until verified against the repository
   or an artifact.
2. Order of proof: **(a)** the code/config itself; **(b)** a machine-produced artifact (build output, test
   run, Preview response, dashboard state); **(c)** a human note. A human note alone is never proof of a
   technical fact.
3. Verify at the **stage head** `4c3d52e`, not at the commit that introduced the thing.
4. Run the §4 commands if the environment allows. If a command cannot run, say why and rely on recorded
   evidence **without claiming independent execution**.
5. **An unverifiable claim is itself a finding** — Blocking if it underpins an exit criterion, a safety
   boundary, or a next-stage dependency; Should-fix otherwise.
6. Never accept "unchanged since last review" — check. Never accept a count or a "100%" without seeing what
   produced it.
7. Never open a live-value env file (`.env.local`); `.env.example` is a placeholder file and IS in scope.
   Never echo a suspected secret — file, line, type only; recommend rotation.
8. Record your blind spots in the **Not inspected** list. An approval that hides its gaps is worse than one
   that names them.

---

## 8. Returned record

Return this complete and paste-ready. Do not write it into the repository.

**Header**

- Stage reviewed: S1 — System Integration
- Confirmed stage range: [CONFIRM: 0983ad557218666b63cb5b6d3db9152041865bb9..4c3d52edcd94a1cda42fc6449874739774bfb419]
- PRs confirmed in range: [LIST — flag any commit not attributable to PR #1]
- Per-PR review preconditions: [PR #1 carries a current-head APPROVE — YES / NO + explanation of the
  record-append exemption applied]
- Scope match: [YES / NO — explanation]
- Files/context inspected: [LIST]
- Commands/evidence checked: [RESULTS_AND_SKIPS]
- **Not inspected:** [LIST — explicit blind spots]

**Exit-criteria verification** — reproduce the §3 table with the last two columns completed.

**Deferred-item reconciliation** — every deferred item from the per-PR rounds and where it is now recorded.
State explicitly whether any Blocking finding was merged over.

**Findings** — one block each, most severe first, in the standard format (Severity / Location / Introduced
by / Issue / Failure scenario / Suggested fix / Confidence). If there are no findings, state **No findings**
and list every exit criterion verified, the safety paths checked, the commands/evidence used, and the blind
spots. Do not return a bare approval.

**Next-stage readiness** — for S2 (S2.1 first), one line per dependency in §3: READY / NOT READY + why.

---

## 9. Verdict

End with exactly one:

**Verdict: [STAGE APPROVED / STAGE NOT APPROVED]** — [ONE_LINE_REASON].
Stage range: `0983ad557218666b63cb5b6d3db9152041865bb9..4c3d52edcd94a1cda42fc6449874739774bfb419` ·
Reviewed by [REVIEWER] on [DATE].

- **STAGE APPROVED** requires all of: no Blocking findings; every Should-fix given an explicit disposition;
  every exit-criterion row marked VERIFIED; and every next-stage dependency marked READY.
- **STAGE NOT APPROVED** whenever there is one or more Blocking finding, **or** any exit criterion is
  NOT VERIFIED or UNVERIFIABLE, **or** any next-stage dependency is NOT READY.

**Merge freeze.** While a stage is NOT APPROVED, the owner merges nothing further — the next stage does not
open, and unrelated PRs wait. Remediation lands on a branch, goes through the normal chain, and the stage is
re-reviewed at a **new** stage head. A commit that only appends this returned record may be exempt when its
documentation-only scope and reviewed head are recorded.

The owner or builder appends the returned record under § Review rounds below, then updates
docs/PROJECT-STATUS.md and docs/ROADMAP.md to reflect the stage's real closing state.

Next step → on STAGE APPROVED, open the first sprint of S2 (S2.1 — Code Check CI;
prepared prompt: docs/sprint-prompts/S2.1-code-check-ci.md) via docs/WORKFLOW.md.

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

*Addendum — added 2026-08-26, deliberately outside the filed record above (S1.2 per-PR review Round 1,
Finding 1: a filed round stays as written on its day).* Both remediations were subsequently completed: the
per-PR review ran to **APPROVE at round 9** (head `39f698d`); D-12 was resolved **NO** and implemented in
`7024375`, independently verified (zero `Website-Development-System/**` paths in the range); the four
preconditions were satisfied and this brief was re-pinned to the merged range on 2026-08-26. An earlier
S1.2 commit (`5143797`) had edited the filed Round-1 text itself to state these outcomes — that edit
violated append-only history and is reverted here: the Round-1 text above is restored **verbatim** from
`1309e01`.

## Round 2 — 2026-08-26 — Codex

**Verdict: STAGE NOT APPROVED** — the mandatory immutable target and stage evidence were not supplied, and
the repository's existing S1 brief remained explicitly blocked and stale.

The gate was dispatched with an **unfilled brief** (the raw template), while this file still carried the
pre-merge "BLOCKED — DO NOT RUN" header pinned to obsolete head `b6594b5`. The reviewer correctly refused
to infer the target: the repository-derived candidate range
`0983ad557218666b63cb5b6d3db9152041865bb9..1309e01ebf225293effb9e641df4aae654563d8a` (PR #1 only) was
reported as a candidate, not certified. Finding 1 (Blocking, high confidence): the owner or builder must
fill this brief with the authoritative merged-master range, PR #1's merged head, current-head evidence,
exit criteria, next-stage dependencies, and exact commands; supersede the stale blocked status; then
dispatch the filled brief. Commands (typecheck/lint/build/stage-specific) were deliberately not run —
mandatory target confirmation failed first. Exit criteria: UNVERIFIABLE. Next-stage readiness: NOT READY.

**Round 2 outcome:** no review of the work occurred — this was a refusal of an invalid dispatch, exactly as
the process requires. **Remediated 2026-08-26 by this version of the brief:** all four preconditions met
and evidenced in the status block; range pinned; exit criteria filled with claimed evidence; checks re-run
at the stage head; production/Preview evidence recorded.

Stage range: UNCONFIRMED (candidate `0983ad5..1309e01`) · Reviewed by Codex on 2026-08-26.

## Round 3 — 2026-08-26 — Codex

**Verdict: STAGE NOT APPROVED** — critical security and operational claims are inaccurate, the live
trackers do not represent the merged stage, and the review audit trail does not validly dispose of three
Blocking findings.

Stage range: `0983ad557218666b63cb5b6d3db9152041865bb9..1309e01ebf225293effb9e641df4aae654563d8a` ·
Reviewed by Codex on 2026-08-26.

**Header (as returned):**

- Confirmed stage range: `0983ad5…..1309e01…` — PR #1 only; 39 branch commits + merge commit; master,
  origin/master and HEAD all at the declared stage head; no direct-to-master or extra merge.
- Per-PR review preconditions: mechanically YES (Round 9 APPROVE at `39f698d`; `ff1dae7`/`543d26e`
  record-only) — but see Finding 1.
- Scope match: YES — 59 paths, +7056/−22; no src/, dependency, lockfile, or app/build config changes;
  `Website-Development-System/**` contributes zero tracked paths.
- Working-tree exclusions honoured: the modified stage brief and the two untracked S2.1 records were not
  treated as stage scope.
- Commands/evidence: range diff = 59 expected paths; `git diff --check` PASS; `tsc --noEmit` PASS;
  `pnpm lint` FAIL only on the documented pre-existing error (byte-identical at base and head);
  `pnpm build` PASS (58/58 static pages, expected routes; needed network access for Google Fonts);
  all 23 required SOP copies byte-identical at the git-object level, both Supabase exceptions differ only
  by their prefaces; `.env.example` = 12 unique placeholder-only assignments, sole tracked env-like file;
  production root HTTP 200 with expected `og:url`; webhook probes rejected unsigned and bogus signatures.
- Not inspected: authenticated rendering of the protected Preview; direct proof of the Preview deployment
  SHA; GitHub branch-protection settings; Vercel/Supabase dashboard values; live database/RLS contents;
  full browser/responsive pass; gitleaks unavailable (pattern/history scans used instead).

**Exit-criteria verification (as returned):**

| # | Exit criterion | Result |
|---|---|---|
| 1 | Docs pack, no critical placeholder unfilled | **NOT VERIFIED** — project-specific security invariants unfilled; active docs contain false/stale operational facts (Findings 2, 3, 5, 7) |
| 2 | All 5 skills load by name | VERIFIED |
| 3 | Content freeze matches on-disk code | VERIFIED |
| 4 | Trackers live | **NOT VERIFIED** — trackers describe the pre-merge state; wrong stage-review sequence (Findings 4, 6) |
| 5 | Owner reviewed and authorized the commit | VERIFIED |
| 6 | Stage gate returns STAGE APPROVED | **NOT VERIFIED** — Blocking findings remain |

**Deferred-item reconciliation (as returned):** the ten deferred code defects are present and correctly
recorded in PROJECT-STATUS §10 with mechanisms and sprints (22→S3.1, 37→S4.3, 38→S4.4, 39–40→S4.3,
41–42→S4.4, 43→S3.1, 44→S4.5, 45→S3.1); the stale-path observation maps to issues 1–2 (S3.1); the four
builder-disclosed minor items are non-blocking. **Blocking reconciliation problem:** Round 1 of the per-PR
review filed issues 22/37/38 as Blocking, they were deferred by owner instruction rather than fixed, and
Round 9 approved — the append-only record never corrected the classification, so the record as written
shows Blocking findings being merged over (Finding 1).

**Findings (as returned, condensed to substance — full fidelity preserved in the remediation sprint record):**

| # | Severity | Location | Issue |
|---|---|---|---|
| 1 | Blocking | `docs/code-reviews/S1.1-system-retrofit-review.md:484-490,531-535` + `docs/WORKFLOW.md:73,77-79` | Issues 22/37/38 filed as Blocking in Round 1, deferred unfixed by owner instruction, then Round 9 approved — the workflow rule allows deferring only Should-fix. Fix: append a correction reclassifying them as pre-existing, out-of-range product observations (retaining launch-blocker status in §10); the record must be corrected, not rewritten |
| 2 | Blocking | `docs/TECH-ARCHITECTURE.md:222`; `next.config.ts:3-5`; `docs/SECURITY-CHECKLIST.md:51-52` | Architecture doc claims security headers are defined and verified on the deployed response. The config defines none; the live response lacks CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — only HSTS present. Record as NOT MET + new known issue with owner and fixing sprint |
| 3 | Blocking | `docs/SECURITY-CHECKLIST.md:66-73` | §9 project-specific invariants still contain the generic `[DATE]` examples. This project has paid/gated routes and a known entitlement defect — fill with dated concrete invariants, each MET/NOT MET with its issue and fixing sprint |
| 4 | Blocking | `docs/PROJECT-STATUS.md:12-16,37,63,68,132`; `docs/OWNER-ACTIONS.md:60-64` | Trackers still say S1 active, PR #1 open, master at merge-base, review at (per-PR) round 3, owner still to merge; D-13 still Open despite the recorded configuration. Update on an authorized docs branch, preserving superseded state struck-through |
| 5 | Blocking | `README.md:5,33`; `docs/PROJECT-STATUS.md:39,68`; `docs/ROADMAP.md:47` | Active onboarding/S2.1 scope still describe `env.example` as awaiting rename though `.env.example` is tracked with its whitelist; README presents the live origin as TBC. Normalize; make the S2.1 item verification-only |
| 6 | Blocking | `docs/PROJECT-STATUS.md:32` | "Each stage ends with independent Codex review before anything merges" misstates the two gates. State them explicitly: per-PR review before each owner merge; stage gate after all stage PRs are merged, before the next stage opens |
| 7 | Blocking | `docs/SUPABASE-VERCEL-SETUP.md:16-17,66-67` | The preface names `master` but the copied SOP body instructs merging to / protecting `main`, which does not exist here. Add an explicit project override: every bare `main` in the generic body means `master` until D-1 resolves |
| 8 | Should-fix | `docs/TECH-ARCHITECTURE.md:129` vs `docs/ROADMAP.md:69` / `PROJECT-STATUS.md:188` | Middleware fail-open review assigned to S2.3 in the architecture doc but S4.4 in roadmap/ledger. Change to S4.4 |

**Next-stage readiness (as returned):** trackers NOT READY (stale); record conventions NOT READY (sequence
misstated; Blocking-disposition contradiction); TECHNICAL-INTEGRITY spec, issues 10/16/20 ownership,
`.env.example`, five skills, Prettier deps all READY.

**Round 3 outcome:** merge freeze holds — S2 does not open. Remediation is docs-only and lands on a branch
through the normal chain (**S1.2 — stage remediation**, record: `docs/sprint-prompts/S1.2-stage-remediation.md`);
the stage is then re-reviewed at the **new** stage head. Note for the re-run: fixing Finding 3 makes
`docs/SECURITY-CHECKLIST.md` a **third intentional exception** to SOP byte-identity (§6 item 4 becomes
22 byte-identical + 3 prefaced/filled exceptions) — its fill is mandated by the checklist's own §9
instruction.

## Round 4 — 2026-08-26 — Codex

**Verdict: STAGE NOT APPROVED** — four Blocking documentation/tooling findings leave exit criterion 4
unverified and two S2 dependencies not ready.

Stage range: `0983ad557218666b63cb5b6d3db9152041865bb9..4c3d52edcd94a1cda42fc6449874739774bfb419` ·
Reviewed by Codex on 2026-08-26.

**Target confirmed:** both PRs attributed exactly (46 commits: 39+merge for #1, 5+merge for #2); per-PR
preconditions YES for both with the record-only exemption honoured; scope match YES — 61 unique
documentation/governance/tooling paths, zero `src/`/dependency/config changes; the three disclosed
working-tree items honoured. Checks re-run at the head: `tsc` PASS; lint = the one recorded pre-existing
error; build PASS (network-enabled rerun, 58/58); 22 SOP copies content-identical with the three declared
exceptions confined to their documented changes; `.env.example` verified placeholder-only; secret scans
clean; content freeze re-verified. Not inspected: live dashboards, gh/PR UI, authenticated Preview,
production probes.

**Exit criteria:** 1 VERIFIED · 2 VERIFIED (mechanical discovery only — operational defects → Finding 3) ·
3 VERIFIED · 4 **NOT VERIFIED** (Findings 1–2) · 5 VERIFIED · 6 NOT VERIFIED · 7 VERIFIED (S1.2 closures
all traced). Deferred-item ledger fully reconciled (issues 22, 37–46, 1–2 all correctly scheduled); no
Blocking finding introduced by either PR was merged over — the findings below are cumulative stage-head
reconciliation defects.

| # | Severity | Finding (locations as returned) | Substance |
|---|---|---|---|
| 1 | Blocking | PROJECT-STATUS:167-168 · TECH-ARCHITECTURE:165-166 · ROADMAP:49 · ENVIRONMENT-PARITY:173-174, 419-426 | Active trackers say `MAILCHIMP_LIST_ID` is one shared entry needing a split, while ENVIRONMENT-PARITY says separate entries already exist and marks the step complete — audience isolation cannot be established from the repo. Fix: establish provider truth (names/scopes only), update all four records atomically, never mark the split complete before P7 |
| 2 | Blocking | README:64 · CLAUDE.md:104 · WORKFLOW:7 · TECH-ARCHITECTURE:223 · OWNER-ACTIONS:21 · ROADMAP:12,48 · PROJECT-STATUS:74,81 | Some active records assert `master` is protected (OWNER-ACTIONS: Done) while others say protection is still an S2.1 owner action — no artifact resolves which is true. Fix: owner inspects the GitHub rule and every record is updated together to the verified state |
| 3 | Blocking | activate-testing SKILL:19,32,35,50,60 · close SKILL:50 · sprint-prompt SKILL:15,38 · handle-error SKILL:52 | Active skills require the withdrawn predevelopment deliverables and cite four bare `templates/...` paths that do not exist (the real templates live under `docs/testing-setup/templates/` and `docs/error-tracking/templates/`). Fix: apply the ROADMAP S5.1 substitution inside every affected skill; repoint every bare template path |
| 4 | Blocking | ENVIRONMENT-PARITY:896-900,907,917,940,954,961 | The §8 proof ledger contradicts its own rows (status says nothing PASS / P3 blocked, rows say P13 satisfied / P3 unblocked); P13 marked satisfied "by inspection" though its procedure also requires a delivered-email observation; bookkeeping still instructs completed corrections; the delivery footer is unreconciled. Fix: reconcile status paragraph, rows, bookkeeping, and next step; split P13's inspection from its email proof |
| 5 | Should-fix | PROJECT-STATUS:136,193 · locked-facts:52 · home.md:17 | D-10 is resolved and issue 12 closed in PROJECT-STATUS, but both content-freeze records still call D-10 open. Fix with the Blocking remediation |

**Next-stage readiness (as returned):** trackers NOT READY (Findings 1–2); skills NOT READY (Finding 3);
TECHNICAL-INTEGRITY spec, issues 10/16/20 ownership, `.env.example`, record conventions all READY.

**Round 4 outcome:** merge freeze holds — S2 does not open. Remediation is **S1.3** (docs + skills only),
through the normal chain; the stage re-reviews as **Round 5** at the post-S1.3 head. Ground truth for
Findings 1–2 was supplied by the owner the same day: the Vercel screenshot shows `MAILCHIMP_LIST_ID` and
`MAILCHIMP_API_KEY` as **one shared entry each** ("Production and Preview") — ENVIRONMENT-PARITY's claim
was the false side — and the owner confirmed a `master` protection rule **requiring a PR before merging is
already enabled** ("Code Check" requirement still owed by S2.1).

## Round 5 — [DATE] — [REVIEWER]

*Not yet run.* Dispatch after the S1.3 remediation PR merges. Before dispatch: keep the stage merge-base
`0983ad557218666b63cb5b6d3db9152041865bb9`, set §1's stage head to the S1.3 merge commit on `master`, add
the S1.3 row to the §1 PR table, and refresh §3's exit-criteria claimed-evidence cells for rows 1 and 4
with the S1.3 closures. Append the returned record here.
