# Codex Stage-Gate Review Brief — [STAGE_ID] — [STAGE_NAME]

> Save the filled brief at docs/code-reviews/[STAGE_ID]-stage-review.md before review.
> Append the reviewer's returned record; the reviewer does not edit the repository.

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

- Repo: [REPO_NAME]
- Stage: **[STAGE_ID] — [STAGE_NAME]**
- Stage merge-base SHA (parent of the stage's first merge): [STAGE_MERGE_BASE_SHA]
- Stage head SHA (master after the stage's final merge): [STAGE_HEAD_SHA]
- Immutable stage range: [STAGE_MERGE_BASE_SHA]..[STAGE_HEAD_SHA]
- Default branch: master
- Stage closed on: [DATE]

### PRs in this stage

| # | PR | Sprint ID | Branch | Merged head SHA | Sprint record | Per-PR review record | Per-PR verdict |
|---|---|---|---|---|---|---|---|
| 1 | #[PR_NUMBER] | [SPRINT_ID] | claude/[SLUG] | [HEAD_SHA] | docs/sprint-prompts/[SPRINT_ID]-[SLUG].md | docs/code-reviews/[SPRINT_ID]-[SLUG]-review.md | APPROVE / [OTHER] |
| 2 | #[PR_NUMBER] | [SPRINT_ID] | claude/[SLUG] | [HEAD_SHA] | docs/sprint-prompts/[SPRINT_ID]-[SLUG].md | docs/code-reviews/[SPRINT_ID]-[SLUG]-review.md | APPROVE / [OTHER] |

### Confirm the target before reviewing

- [ ] Both stage SHAs resolve, and [STAGE_HEAD_SHA] is the current tip of master.
- [ ] The commits in [STAGE_MERGE_BASE_SHA]..[STAGE_HEAD_SHA] are exactly the PRs listed above —
      **no extra merge, no direct push to master, no force-push** slipped into the range.
- [ ] The changed-file list for the whole range matches the stage's declared scope.
- [ ] Every listed per-PR review record exists and its reviewed head equals that PR's merged head.

Stop and report a target mismatch before reviewing if any of these disagree.

---

## 2. Read for context

- AGENTS.md (canonical reviewer policy) and CLAUDE.md (builder rules and stack lock).
- docs/WORKFLOW.md (delivery chain, §7 merge rule), docs/ROADMAP.md (this stage's scope + the
  **Universal sprint exit gate**), docs/PROJECT-STATUS.md (§1–§3 state, §6 checks, §7–§8 decisions,
  §10 known issues, §11 update rules).
- docs/TECH-ARCHITECTURE.md, docs/SECURITY-CHECKLIST.md, docs/TECHNICAL-INTEGRITY.md.
- Every sprint record and per-PR review record listed in §1.
- Stage-specific: [DESIGN / SUPABASE-MCP-SAFETY / BROWSER-TOOLS / testing-setup / error-tracking /
  content/locked-facts.md / content/page-copy / schema / spec files this stage touched].

---

## 3. Stage intent and exit criteria

- Stage goal, in one paragraph: [ONE_PARAGRAPH]
- Intentionally out of scope for this stage: [LIST_OR_NONE]
- Owner-authorized exceptions (each with owner, reason, date): [LIST_OR_NONE]
- Hosting/Preview state at [STAGE_HEAD_SHA]: [PREVIEW_URL_AND_TEST_RESULT]
- Database/migration state: [STATE_OR_N/A]
- The next stage is **[NEXT_STAGE_ID]**, and it depends on this stage delivering: [LIST]

### Exit criteria — fill one row per criterion, reviewer completes the last two columns

| # | Exit criterion (from docs/ROADMAP.md) | Claimed evidence | How the reviewer verified it | VERIFIED / NOT VERIFIED / UNVERIFIABLE |
|---|---|---|---|---|
| 1 | [CRITERION] | [CLAIM_AND_LOCATION] | | |
| 2 | [CRITERION] | [CLAIM_AND_LOCATION] | | |

**A stage with any row that is NOT VERIFIED or UNVERIFIABLE cannot be approved.**

---

## 4. Evidence

### Commands (run with the existing environment only)

- Typecheck: [TYPECHECK_COMMAND]
- Lint: [LINT_COMMAND]
- Format check: [FORMAT_COMMAND_OR_N/A]
- Tests: [TEST_COMMAND_OR_N/A]
- Production build: [BUILD_COMMAND]
- Stage-specific: [COMMANDS_OR_NONE]

Do not install, upgrade, change a lockfile, apply a migration, or alter source/config to make a check pass.
State every command you did not run and why.

### Per-PR evidence in this stage

| PR | CI ("Code Check") at merged head | Deployed Preview tested at merged head | QA evidence (docs/QA-CHECKLIST.md Part 2) |
|---|---|---|---|
| #[PR_NUMBER] | [RESULT_OR_LINK] | [PREVIEW_URL] · [RESULT] | [LINK_OR_N/A] |
| #[PR_NUMBER] | [RESULT_OR_LINK] | [PREVIEW_URL] · [RESULT] | [LINK_OR_N/A] |

### Evidence at the stage head

- Checks re-run at [STAGE_HEAD_SHA]: [RESULTS]
- Production/Preview smoke at [STAGE_HEAD_SHA]: [RESULT_OR_LINK]

Per-PR green does **not** prove stage green: each PR was verified against its own base, not against the
final combined head. Treat a missing re-run at [STAGE_HEAD_SHA] as a gap and say so.

---

## 5. Stage-level hunt list

These are the questions a per-PR review structurally cannot ask. Work them in order.

1. **Did the stage actually achieve its exit criteria, or only appear to?** For every row in §3, find the
   thing itself — the file, the config value, the route, the passing run — not the sentence that says it
   exists. A checkbox, a PR description, or a status table is a claim, not evidence.

2. **Cumulative drift across the PRs.** Read the combined range as one diff, not as N diffs. Hunt for what
   only shows up in the sum: a guard added in one PR and removed in a later one; a helper introduced then
   orphaned; a config value toggled twice and left on the wrong setting; an env var name introduced in one
   PR and referenced under a different spelling in another; a route created then made unreachable; a file
   moved and its old path still imported.

3. **Tracker fidelity — is anything claimed as done that is not true in the code?** Walk docs/PROJECT-STATUS.md
   §1 (Right now), §2 (Sprint board), §3 (Last completed work), §6 (Checks status), §10 (Known issues) and
   docs/ROADMAP.md against the repository. A "PASS" that no longer reproduces, a known issue marked closed
   whose defect is still present, a sprint marked complete with unfinished scope — each is a finding. Also
   confirm §11 was honoured: trackers updated in the same authorized branch as the work, resolved rows
   struck through with dates rather than deleted.

4. **Deferred-item ledger.** Collect every **Should-fix** deferred in this stage's per-PR reviews. Each must
   be recorded with owner, reason, and risk (docs/PROJECT-STATUS.md §8; docs/WORKFLOW.md §7). Any item that
   silently disappeared between its review record and the trackers is a finding. Confirm **no Blocking
   finding from any per-PR review was merged over** — docs/WORKFLOW.md §7 forbids it absolutely.

5. **Safety boundaries — weakened anywhere across the stage?** Apply the AGENTS.md security-review checklist
   and docs/SECURITY-CHECKLIST.md to the whole range:
   - §1 secrets/repo hygiene — no secret, token, key, connection string, or private URL added anywhere in the
     range, including docs, workflows, MCP config, test fixtures, and comments.
   - §2 env boundary — nothing server-only moved behind a public prefix, into client code, into serialized
     props, into logs, or into a client-visible error.
   - §3 auth & access — every gated route still authorizes server-side before protected reads; no gate was
     loosened, moved to the client, or bypassed to make something else work; redirect targets validated
     same-origin; Preview auth links return to the Preview origin.
   - §4 database — default-deny RLS on every user-reachable table; policies owner-scoped; migrations
     classified and applied non-production first with the rollback artifacts in the same PR.
   - §5 public forms & writes — server-side schema validation, the selected abuse controls present, and
     **failing CLOSED in Production**.
   - §6–§7 headers and error hygiene — no header weakened; no stack, internal path, credential, or upstream
     body reaching a user.
   - §9 project-specific invariants — still intact and still checkable.

6. **Scope containment and stack lock.** Files outside the stage's declared scope; a locked stack layer
   swapped or a dependency added without an explicit owner decision (CLAUDE.md, docs/TECH-ARCHITECTURE.md);
   approved copy or facts changed without going through docs/content/locked-facts.md and
   docs/content/page-copy/*.md; an unexplained `any`, `@ts-ignore`, or `eslint-disable`
   (docs/TECHNICAL-INTEGRITY.md line-level rule).

7. **Half-built things.** A workflow added disabled and never wired; a flag half-implemented; a checklist
   file referencing a path that does not exist; a script named in a doc that is absent from package.json;
   a template with an unfilled required field shipped as if complete. These pass per-PR review easily and
   are exactly what the stage gate exists to catch.

8. **Reversibility.** docs/ROLLBACK.md still describes a path that would work from [STAGE_HEAD_SHA]. Anything
   destructive in the stage has its backup/recovery evidence. Note plainly where rollback cannot restore data.

9. **Is the repo genuinely ready for [NEXT_STAGE_ID]?** Take the dependency list in §3 and prove each one is
   present and usable now — not planned, not documented, not "landing next sprint". A dependency the next
   stage assumes and does not get is the most expensive defect this gate can prevent.

Report serious, evidence-backed issues only. No style nits, no speculative rewrites, no critique of approved
copy or design.

---

## 6. Per-stage focus block

Work the block for **[STAGE_ID]** in addition to §5. Skip the others.

### S1 — System Integration · focus: documentation fidelity

- The docs describe **this** repository, not a generic SOP: every path, command, route, script, and file name
  a doc asserts actually exists at [STAGE_HEAD_SHA].
- Every cross-reference between docs resolves. Every command a doc tells a human or agent to run exists.
- The content freeze is real: spot-check claims in docs/content/locked-facts.md and docs/content/page-copy/*.md
  against the shipped pages; report any drift in either direction.
- The trackers were seeded with **true** values, including uncomfortable ones — a known failing check must be
  recorded as failing, not rounded up.
- A docs-only stage must have changed no app code, config, or dependency. Verify against the range's file list
  rather than the claim.
- Skills, templates, and checklists: present, complete, and free of unfilled required fields presented as done.

### S2 — Readiness Setup · focus: does the tooling actually work, and does the gate actually block?

- **The gate must be proven, not present.** docs/TECHNICAL-INTEGRITY.md is explicit: *an unverified gate is
  the same as no gate.* Require evidence that a real PR showed "Code Check" and that GitHub's merge button
  stayed locked until it passed. A workflow file plus an unverified branch-protection claim is **NOT VERIFIED**.
- package.json defines every script the workflow invokes (`typecheck`, `lint`, `format:check`, `build`, and
  `test:unit` if referenced), the lint target is explicit and actually covers the source tree, and the
  `packageManager` pin matches what CI installs with `--frozen-lockfile`.
- `format:check` is meaningful: a Prettier config exists and the ignore file does not quietly exclude the code.
- Env example file: **names and placeholders only, never a live value** (docs/SECURITY-CHECKLIST.md §1).
  Confirm live env files are still ignored **without opening them** — a negation rule added to .gitignore must
  not have un-ignored anything real.
- MCP config is committed and world-readable in this repo: it must contain **no token, key, or connection
  string**. If one is present, report file, line, and type only, and tell the owner to rotate.
- A production Supabase MCP server may exist **only** under a recorded **Profile B** exception with owner,
  reason, date, allowed feature groups, data classification, and removal condition
  (docs/SUPABASE-MCP-SAFETY.md §1). Absent that record, its presence is Blocking. Where present, confirm
  read-only is actually set, and that the non-production server's feature groups match what was approved.
- Browser tooling stays at user scope per docs/BROWSER-TOOLS.md — it must not appear in project MCP config.
- Test harness: config points at the intended test directory, base URL comes from an env var (not a hardcoded
  host), the declared viewport profiles exist, auth setup exists per role, and the one smoke test was proven
  against a **deployed Preview**, not localhost.
- Any workflow added "disabled" is genuinely incapable of firing. Evidence directories are gitignored.
- Error tracking: DSN referenced **by env name only** with no literal in the repo; data scrubbing configured;
  environment tagging makes Production distinct from Preview; the deliberate test error was **removed**
  (grep for it); source-map upload ships no secret.

### S3 — Critical Fixes · focus: the fix really fixes it, and nothing regressed

- Verify the corrected path/route **resolves to something that exists** at [STAGE_HEAD_SHA] — check the file
  on disk and, where relevant, in the build output. "The string looks right" is not verification.
- Require end-to-end proof on the deployed Preview at the reviewed head: the real user outcome, by a real
  account in the real state, not a unit assertion.
- **Hunt the classic regression:** a broken gated path made to work by loosening the gate. Confirm entitlement
  and session checks are byte-for-byte as strict as before, server-side, and still run before protected reads
  (docs/SECURITY-CHECKLIST.md §3).
- Sweep the **whole repo** for remaining instances of the stale pattern in every URL-bearing position:
  redirect targets, checkout success/cancel URLs, auth `next` parameters, email templates, metadata, canonical
  tags, sitemap, and docs. One fixed call site does not close the class.
- Confirm each new destination is a real route, and that no redirect became open or origin-unvalidated.
- Deletions (hygiene): every removed module, dependency, or asset has **no remaining reference** anywhere —
  grep each name across the range's post-state; the build still passes; and a deletion authorized by the owner
  is matched to that authorization. State plainly where a deleted tracked file still exists in git history, so
  it is not mistaken for a secret removal.

### S4 — Improvement Plan · focus: were the audit's findings actually closed?

- Each sub-sprint must have a **written, dated audit document** that preceded its fix sprint. No audit, or an
  audit written after the fix, is a finding.
- Reconcile audit → fix: every audit finding has a disposition (fixed, or deferred with owner + reason in
  docs/PROJECT-STATUS.md §8). Findings that vanished between the two documents are the failure mode this
  block exists to catch.
- Conversely, the fix sprint's changes should map back to audit findings; unrelated redesign smuggled into a
  fix sprint is scope creep (docs/WORKFLOW.md §2).
- Responsive/accessibility work: evidence exists at each declared viewport for **every route claimed**, not a
  representative sample presented as full coverage; judged against docs/DESIGN.md.
- Design-system consolidation: the removed tokens/palette are actually gone and nothing still references them.
- Data hardening: the schema and policy SQL for every user-reachable table is **in the repo** and matches the
  live database; default-deny RLS verified per table; migrations numbered with up/down per
  docs/templates/SUPABASE-CHANGE-TEMPLATE.md; applied non-production first with evidence
  (docs/SECURITY-CHECKLIST.md §4).
- Auth hardening: any fail-open behavior is now a **recorded decision** — fixed, or consciously accepted with
  a named compensating control (docs/PROJECT-STATUS.md §7–§8). Silently changed either way is a finding.
  Re-verify server-side authorization on every gated route and that Preview auth mail returns to Preview.
- Launch blockers: abuse controls present on every public write, server-verified, and **failing CLOSED in
  Production** — read the env-absence branch and the environment signal it keys on (docs/SECURITY-CHECKLIST.md
  §5). Legal pages exist and their footer links resolve. Deliverability verified by an external-address test.

### S5 — Launch Gate · focus: is the GO legitimate?

- The feature list was **approved by the owner in writing, dated, before** specs were written. An
  after-the-fact approval invalidates the gate.
- One spec per approved line: count approved lines against specs and name any line with no spec.
- Every protected boundary carries **both** an allowed and a denied assertion. Abuse controls are asserted as
  "blocked is the PASS". Payments run in **test mode only** — no live key, no live-mode identifier anywhere in
  the suite or its fixtures.
- The GO must come from a **FULL run at 100% pass on the current head**, against the **deployed Preview**.
  Reject a GO built from a partial re-run of previously failing specs.
- Hunt the ways a suite is made green without the site being fixed: skipped, `only`-scoped, `fixme`, or
  quarantined specs; retries masking flake; assertions weakened, deleted, or made vacuous between the failing
  run and the green run — **diff the spec files across those runs**; a spec silently removed from the list.
- The run's reported head SHA equals [STAGE_HEAD_SHA]. A run against any other head does not support a GO.
- The morning check is enabled only with the owner-approved spec set, per docs/LAUNCH-CHECKLIST.md.

---

## 7. Prove it, don't trust it

1. Treat every claim — in a doc, tracker, PR description, sprint record, prior review, or commit message —
   as a **hypothesis** until you have verified it against the repository or an artifact.
2. Order of proof: **(a)** the code, config, or schema itself; **(b)** a machine-produced artifact (CI log,
   test run output, build output, Preview screenshot, provider dashboard state); **(c)** a human note.
   A human note alone is never proof of a technical fact.
3. Verify at the **stage head**, not at the PR that introduced the thing. What was true mid-stage may not be
   true now — that is precisely the drift this gate looks for.
4. Run the commands in §4 if the environment allows. If a command cannot run, say why and rely on the recorded
   CI/Preview evidence **without claiming independent execution** (AGENTS.md, Checks and evidence).
5. **An unverifiable claim is itself a finding.** Report it as such, with severity by consequence: **Blocking**
   if it underpins an exit criterion, a safety boundary, or a next-stage dependency; **Should-fix** otherwise.
   Never silently accept it, and never report a claim you did verify.
6. Never accept "unchanged since last review" — check. Never accept a percentage, a count, or a "100%" without
   seeing what produced it.
7. Never open a live-value env file from the worktree, and never echo a suspected secret. Identify only its
   file, line, and type, and recommend rotation before any cleanup (docs/SECURITY-CHECKLIST.md §1).
8. Record your blind spots. Anything you did not inspect goes in the **Not inspected** list. A stage approval
   that hides its gaps is worse than one that names them.

---

## 8. Returned record

Return this complete and paste-ready. Do not write it into the repository.

**Header**

- Stage reviewed: [STAGE_ID] — [STAGE_NAME]
- Confirmed stage range: [STAGE_MERGE_BASE_SHA]..[STAGE_HEAD_SHA]
- PRs confirmed in range: [LIST — flag any commit in the range not attributable to a listed PR]
- Per-PR review preconditions: [every PR carries a current-head APPROVE — YES / NO + which]
- Scope match: [YES / NO — explanation]
- Files/context inspected: [LIST]
- Commands/evidence checked: [RESULTS_AND_SKIPS]
- **Not inspected:** [LIST — explicit blind spots]

**Exit-criteria verification** — reproduce the §3 table with the last two columns completed.

**Deferred-item reconciliation** — every Should-fix deferred during the stage, and where it is now recorded.
State explicitly whether any Blocking finding was merged over.

**Findings** — one block each, most severe first:

### Finding [N]
- **Severity:** Blocking / Should-fix
- **Location:** [path/file.ext:line plus route/flow]
- **Introduced by:** [PR #[PR_NUMBER] / commit [HEAD_SHA] / emergent across the stage / pre-existing]
- **Issue:** [One or two evidence-based sentences.]
- **Failure scenario:** [Concrete input/state → wrong outcome.]
- **Suggested fix:** [Specific minimal fix.]
- **Confidence:** high / medium / low

If there are no findings, state **No findings** and list every exit criterion verified, the safety paths
checked, the commands/evidence used, and the blind spots. Do not return a bare approval.

**Next-stage readiness** — for [NEXT_STAGE_ID], one line per declared dependency: READY / NOT READY + why.

---

## 9. Verdict

End with exactly one:

**Verdict: [STAGE APPROVED / STAGE NOT APPROVED]** — [ONE_LINE_REASON].
Stage range: [STAGE_MERGE_BASE_SHA]..[STAGE_HEAD_SHA] · Reviewed by [REVIEWER] on [DATE].

- **STAGE APPROVED** requires all of: no Blocking findings; every **Should-fix** given an explicit disposition;
  every exit-criterion row marked VERIFIED; and every next-stage dependency marked READY.
- **STAGE NOT APPROVED** whenever there is one or more Blocking finding, **or** any exit criterion is
  NOT VERIFIED or UNVERIFIABLE, **or** any next-stage dependency is NOT READY.

**Merge freeze.** While a stage is NOT APPROVED, the owner merges nothing further — the next stage does not
open, and unrelated PRs wait. Remediation lands on a branch, goes through the normal chain
(docs/WORKFLOW.md), and the stage is re-reviewed at a **new** [STAGE_HEAD_SHA]. Stage approval never carries
forward across a substantive change; a commit that only appends this returned record may be exempt when its
documentation-only scope and reviewed head are recorded.

The owner or builder appends the returned record to docs/code-reviews/[STAGE_ID]-stage-review.md, then updates
docs/PROJECT-STATUS.md and docs/ROADMAP.md to reflect the stage's real closing state.

Next step → on STAGE APPROVED, open the first sprint of [NEXT_STAGE_ID] via docs/WORKFLOW.md.
