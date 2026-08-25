# PROJECT-STATUS.md — Where the Build Stands

The living tracker for [PROJECT_NAME]. Any fresh session — AI or human — reads this file **first** to know
exactly where the build stands and what to do next. It holds state, not plans: scope and exit gates live in
`docs/ROADMAP.md`; process lives in `docs/WORKFLOW.md`.

## 1. Right now

| Item | Value |
|---|---|
| Current stage | [Setup Gate / Stage 0 / Stage 1 / Launch Gate / Post-launch] |
| Active sprint | [SPRINT_ID] — [one-line scope] — Status: [Not Started / In Progress / Blocked / Ready for Review / Approved / Done / Not Applicable with reason] |
| Current branch | [BRANCH_NAME] |
| Next action | 1. [imperative step] 2. [imperative step] — *Prior:* [keep the previous next-action inline, struck through when closed] |
| Preview / Production | [PREVIEW_ENVIRONMENT] / https://[DOMAIN] on [HOSTING_PROVIDER] |
| Last updated | [DATE] — [one-line summary of the latest state change] — *Prior:* [previous entry] |

### How to resume in a fresh AI session

1. Read this file, then the active sprint's scope + exit gate in `docs/ROADMAP.md`.
2. Read the agent-instructions file (`CLAUDE.md` / `AGENTS.md`) and the docs it points to for the task.
3. Verify the repo state yourself (package manifest, source tree, `git log`). If it disagrees with this file, report the mismatch; update this file only when the task authorizes it.
4. Work only inside the active sprint. Anything else → propose it under Open decisions or the backlog.
5. Before ending: update §1–§3 here, tick the roadmap checkboxes, and include this file in the PR.

Why this matters: this ritual makes the project session-stateless — anyone can cold-start and resume mid-sprint with zero verbal briefing.

## 2. Sprint board

Status legend: Not Started · In Progress · Blocked (say why) · Ready for Review · Approved · Done · Not Applicable (optional only; reason required).

| Sprint | Status | Branch | PR | Merged date | Notes |
|---|---|---|---|---|---|
| Setup Gate | | | | | |
| Stage 0 — fully working barebones site | | | | | |
| [SPRINT_ID] | | | | | Records: `docs/sprint-prompts/[SPRINT_ID]-[SLUG].md`, `docs/code-reviews/[SPRINT_ID]-[SLUG]-review.md` |

Retired sprints stay in the table, struck through, with the date, reason, and where the scope moved (backlog).

## 3. Last completed work

- [DATE] — [SPRINT_ID]: [what shipped, PR#, review verdict, anything the next session must know].

## 4. Next sprint

- [SPRINT_ID] — [one-line scope]. Depends on: [sprint/decision]. Brief: `docs/sprint-prompts/[SPRINT_ID]-[SLUG].md`.

## 5. Blockers

| # | Blocker | Blocking what | Who unblocks | Since |
|---|---|---|---|---|
| | *(e.g. paused free-tier test DB needs an owner dashboard restore)* | | Owner / AI | |

## 6. Checks status

| Check | Last run | Result | Notes |
|---|---|---|---|
| typecheck | [DATE] | pass/fail | |
| lint | [DATE] | pass/fail | |
| tests | [DATE] | pass/fail/N/A | State the reason for N/A |
| build | [DATE] | pass/fail | Record the built route count — an unexpected ±1 flags an accidental route add/delete |
| deployed Preview | [DATE] | pass/fail | [provider, record path, tested head SHA] |

## 7. Locked decisions (do not reopen)

Changes require a new, explicit superseding decision by the client — never a silent edit.

| ID | Date | Decision | Decided by | Supersedes / notes |
|---|---|---|---|---|
| D-[SPRINT]-[a] | [DATE] | [the decision + what it explicitly does NOT change] | Client / owner | |

## 8. Open decisions (resolve here, then propagate)

Resolved rows are stamped **RESOLVED [DATE]** (or **ACCEPTED** for consciously-taken risks) — never deleted.
An accepted risk must name its compensating control and where it's tracked.

| ID | Decision needed | Options / current lean | Needed by | Status |
|---|---|---|---|---|
| D-[n] | [the question] | [lean, so work can proceed] | [SPRINT_ID] | Open |

## 9. Env vars record (NAMES only — never values)

| Name | Public / server-only | Feature it switches on | Set in |
|---|---|---|---|
| [PUBLIC_SITE_URL_NAME] | Public | Canonical URLs | [HOSTING_PROVIDER] environments |
| [VAR_NAME] | Server-only | [feature] | [Production / Preview / local as applicable] |

**Never do this:** never record a value, key, token, or connection string in this file — names and service states only.

## 10. Known issues

The launch sprint cannot pass while this section has unresolved bugs — except deferrals the client has
explicitly accepted (cite the accepting decision ID). Deferred hardening is marked **"required before scale"**.

| # | Severity | Where | Issue | Status |
|---|---|---|---|---|
| | | | | |

## 11. Update rules

- [ ] Update this file **in the same branch/PR** as the work it describes — state and code merge atomically.
- [ ] If the sprint branch is already merged, tracker flips ride a tiny dedicated `docs/` branch.
- [ ] When code and this doc disagree, report the mismatch; correct it only within the authorized scope.
- [ ] Strike through, never delete: resolved decisions, closed blockers, and retired scope stay visible with dates.

Next step → open the active sprint in `docs/ROADMAP.md` and run it via `docs/WORKFLOW.md`.
