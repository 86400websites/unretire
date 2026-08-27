# Technical Integrity — How Every Line of Code Is Held to Standard

> ## ⚠ STATUS BANNER — read before every present-tense sentence below (added 2026-08-27, Sprint S1.6)
>
> **This document describes the TARGET design. Wall 2 is not live yet in this repository.** Every
> present-tense statement below **about Wall 2 (the Code Check) or Wall 4 (behavior proof)** — "machines
> enforce", "every PR passes", "red cannot merge", "package.json defines" — describes the state **after
> Sprints S2.1 / S2.3 land**, not today. *(Walls 1 and 3 are live now and their statements read
> normally.)* What is true right now:
>
> | Piece | State today (2026-08-27) |
> |---|---|
> | `.github/workflows/code-check.yml` | **Does not exist** — created by **S2.1** |
> | `package.json` scripts `typecheck`, `format:check` | **Do not exist** (only `dev`, `build`, `start`, `lint`) — added by **S2.1** |
> | Prettier config | **Does not exist** — added by **S2.1** |
> | `master` branch protection | **PR-before-merge rule: ENABLED** (owner-confirmed 2026-08-26). **Required "Code Check" status: NOT yet added** — S2.1, then verified on a real PR |
> | Wall 3 (independent review) | **LIVE and operating** — every PR of the S1 build chain (#1–#5) went through it. ⚠ **Not universally enforced by machinery:** two teammate PRs (#6, #7) merged on 2026-08-27 without a review, because nothing mechanically requires one until S2.1 adds the status check (PROJECT-STATUS §8 **D-16**) |
> | Wall 4 (behavior proof) | **Not live** — Playwright harness is **S2.3**, the suite is **S5.1**; no automated suite exists today |
>
> Consequence to hold onto: **red CAN currently reach `master`**, because the status check does not exist
> to block it. That is precisely what S2.1 closes, and why S2.1 is the first sprint of Stage 2.
> Prepared prompt: `docs/sprint-prompts/S2.1-code-check-ci.md`.

One page. The standards are written once as configuration; machines enforce them on every line, every change, forever *(target state — see the status banner above)*. Nothing here depends on anyone remembering anything.

---

## The four walls

| Wall | What it guarantees | Where it lives |
|---|---|---|
| 1. The rules | How code must be written | `CLAUDE.md`, `TECH-ARCHITECTURE.md` |
| 2. **The Code Check** | Every PR passes the six checks below — **red physically cannot merge** ⚠ *target; the workflow does not exist yet — **S2.1*** | This file + `.github/workflows/code-check.yml` *(to be created)* |
| 3. Independent review | A second pair of eyes on every PR; Blocking findings never merge ✅ *live today* | Codex review, `WORKFLOW.md` §7 |
| 4. Behavior proof | Every feature actually works, before launch and every morning after ⚠ *target; harness **S2.3**, suite **S5.1*** | `testing-setup/` + `error-tracking/` |

This file supplies Wall 2 and is deliberately the simplest piece of the whole system: one workflow file, one GitHub setting, nothing to operate. ⚠ **Not yet installed — Sprint S2.1 installs it** (status banner above).

## The house standard, in plain words

1. **Strict types** — TypeScript runs in `strict` mode; the compiler rejects vague or unsafe code before it exists.
2. **Lint-clean** — ESLint (Next.js + TypeScript rules) checks every line for known bad patterns.
3. **Formatted** — Prettier, default config, committed to the repo; formatting is never a matter of taste or a source of diff noise.
4. **It builds** — the production build must succeed. "Works in dev" counts for nothing.
5. **Tests pass** — the repo's unit/integration tests run when present. (The full robot-user suite stays with the Launch Gate and morning check — running it on every PR would slow everything for no gain.)
6. **No known-critical vulnerabilities** — dependencies with critical published flaws block the merge.

Line-level professionalism rule for the builder: no `any`, no `@ts-ignore`, no `eslint-disable` without a one-line reason in the PR description — the Codex review treats an unexplained suppression as a finding.

## The Code Check → `.github/workflows/code-check.yml`

⚠ **This file does not exist yet — Sprint S2.1 creates it exactly as written below** (status banner at the top). Once it exists it runs automatically on **every pull request**. About three robot-minutes. You never trigger it, tune it, or maintain it.

```yaml
name: Code Check
on:
  pull_request:
jobs:
  code-check:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Types are sound
        run: pnpm typecheck
      - name: Code passes lint
        run: pnpm lint
      - name: Formatting is clean
        run: pnpm format:check
      - name: Unit tests pass (when present)
        run: pnpm run --if-present test:unit
      - name: Production build succeeds
        run: pnpm build
      - name: No critical known vulnerabilities
        run: pnpm audit --prod --audit-level=critical
```

The contract behind it: `package.json` defines the scripts `typecheck` (`tsc --noEmit`), `lint`, `format:check` (`prettier --check .`), `build`, and optionally `test:unit` — Claude Code sets these up once during the Setup Gate. ⚠ **Today `package.json` defines only `dev`, `build`, `start` and `lint`; `typecheck` and `format:check` (and the Prettier config `format:check` needs) are added by S2.1.** Until then the equivalent commands are run directly: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.

## Setup (once per site — new build or retrofit, identical)

*Retrofit note: the workflow file and package.json scripts land in Sprint S2.1 — see docs/ROADMAP.md.*

- [ ] **Claude Code (one normal PR):** strict `tsconfig`, ESLint + Prettier configs, the five scripts above, and the workflow file. No behavior changes ride along.
- [ ] **You (2 minutes, once):** GitHub → the repo → **Settings → Branches → Add branch protection rule** → branch name `master` → tick **"Require a pull request before merging"** and **"Require status checks to pass before merging"** → search and select **"Code Check"** → save. *(Retrofit note 2026-08-26: the "Require a pull request" half is already enabled on this repo — owner-confirmed; what S2.1 adds is the required "Code Check" status, then the watch-one-PR verification below.)*
- [ ] **You + Claude Code (verify once):** watch one PR — the "Code Check" appears and goes ✅, and GitHub's merge button stays locked until it does. An unverified gate is the same as no gate.

## Day to day

*(From S2.1 onward —* ⚠ *not yet true today; see the status banner.)* Every PR now carries a plain ✅ or ❌ before your merge button. On ✅, merge as usual. On ❌, you do nothing — Claude Code reads the failure, fixes it, pushes, and the check re-runs; red can't reach `master`, so there is nothing to worry about, only something to wait for. You never have to wonder whether the checks were *really* run — the merge button is the proof. **Until S2.1 lands, the local checks are run and reported by hand in each sprint's record, and the independent review (Wall 3) is the gate that actually holds.**

## The boundary, one line

The Code Check proves the **code** is sound on every PR; the Launch Gate and morning check prove the **site** behaves. Both, always — neither replaces the other. ⚠ **Both are target state**: the Code Check arrives in **S2.1**, the Launch Gate harness in **S2.3** and its suite in **S5.1**. Today neither is live, and the independent review (Wall 3) plus hand-run local checks carry the load.
