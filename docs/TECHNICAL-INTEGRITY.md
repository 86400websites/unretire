# Technical Integrity — How Every Line of Code Is Held to Standard

> ## ⚠ STATUS BANNER — read before every present-tense sentence below (added 2026-08-27, Sprint S1.6; updated 2026-08-27, Sprint S2.1)
>
> **This document describes the TARGET design. ~~Wall 2 is not live yet in this repository.~~ 2026-08-27: Wall 2 is
> INSTALLED and LIVE on `master` (Sprint S2.1 — PR #11, merged by the owner 2026-08-27 as `a68f210`; the check ran green on that PR)
> but is NOT yet a required status on `master` (owner confirmation pending).** Every present-tense statement below **about Wall 2 (the Code
> Check) or Wall 4 (behavior proof)** — "machines enforce", "every PR passes", "red cannot merge", "package.json
> defines" — describes the state **after S2.1 merges AND the owner adds the required "Code Check" status (Wall 2),
> and after S2.3 / S5.1 land (Wall 4)**, not today. *(Walls 1 and 3 are live now and their statements read
> normally.)* What is true right now:
>
> | Piece | State (2026-08-27, Sprint S2.1) |
> |---|---|
> | `.github/workflows/code-check.yml` | ~~**Does not exist** — created by **S2.1**~~ **EXISTS on `master` since the S2.1 merge (PR #11, 2026-08-27)** (`a68f210`), diff-verified identical to the YAML block in this file (name "Code Check", `pull_request` only, `timeout-minutes: 10`, **node 24** (corrected from the spec's original 20 — see the note under the YAML block), pnpm cache, frozen lockfile, six named steps) — 2026-08-27 |
> | `package.json` scripts `typecheck`, `format:check` | ~~**Do not exist** (only `dev`, `build`, `start`, `lint`) — added by **S2.1**~~ **EXIST on `master` since the S2.1 merge (PR #11, 2026-08-27)**: `typecheck` = `tsc --noEmit`, `format:check` = `prettier --check .`, `lint` = `eslint .`; `"packageManager": "pnpm@11.3.0"` pinned (pnpm 11.3.0 verified installed). No dependency entry changed; `pnpm-lock.yaml` byte-identical — 2026-08-27 |
> | Prettier config | ~~**Does not exist** — added by **S2.1**~~ **EXISTS on `master` since the S2.1 merge (PR #11, 2026-08-27)**: `.prettierrc` = `{ "endOfLine": "auto" }` — the single deliberate deviation from the literal `{}`, because the worktree is CRLF under `core.autocrlf=true` while CI checks out LF; with `{}` the local check would be permanently red on Windows. `.prettierignore` excludes `.next/ out/ build/ node_modules/ pnpm-lock.yaml next-env.d.ts public/ qa-evidence/` and `*.md` (markdown excluded by owner decision 2026-08-27 so docs and filed records stay byte-stable). `prettier-plugin-tailwindcss` stays installed but NOT enabled (deliberate follow-up, not silent) — 2026-08-27 |
> | Lint | **0 errors, 0 warnings** at branch head — Known issue 16 (raw `<a href="/learn/course">` in `src/app/premium/page.tsx`) fixed by S2.1 (PR #11, merged 2026-08-27) with `next/link`. Known issue 10 (no CI / no typecheck-format scripts / bare eslint) likewise fixed by S2.1 (PR #11, merged 2026-08-27) — 2026-08-27 |
> | The six checks, run locally at branch head 1770cc1 | `pnpm typecheck` PASS · `pnpm lint` 0 errors 0 warnings · `pnpm format:check` clean · `pnpm build` PASS (35 app route entries + `/_not-found`, 58/58 static pages, unchanged) · `pnpm audit --prod --audit-level=critical` exit 0 — 41 advisories (2 low, 20 moderate, 19 high, 0 critical), so the gate passes; the 19 high are **Known issue 48** (Medium, owned by the S3.2 dependency pass) · `test:unit` absent, `--if-present` skips it — 2026-08-27 |
> | `master` branch protection | **Mechanism corrected 2026-08-27 (owner screenshot):** `master` is protected by a repository **Ruleset** named **"Protect master"** (Enforcement status **Active**, **bypass list empty** — no role, team, app or user is exempt), targeting **Default** → 1 target: `master`. Enabled rules: **Restrict deletions**, **Require a pull request before merging**, **Block force pushes**. **"Require status checks to pass" is NOT enabled** — that is the remaining owner action. Not enabled (and not required by this project): restrict creations/updates, linear history, signed commits, deployments, code-scanning/code-quality/coverage gates, Copilot review. Rulesets live under **Settings → Rules → Rulesets**, not the legacy Settings → Branches screen. **PR-before-merge: ENABLED** (owner-confirmed 2026-08-26; re-evidenced 2026-08-27). **Required "Code Check" status: owner confirmation pending** — ~~S2.1, then verified on a real PR~~ **owner action now that PR #11 is merged**: ~~(i) confirm "Code Check" appears and passes on the PR~~ (done — green at `3f695a7`); (ii) add the required status check "Code Check" to the EXISTING `master` rule via the GitHub web UI (`gh` CLI not installed) and watch the merge button stay locked until the check passes — an unverified gate is the same as no gate — 2026-08-27 |
> | Wall 3 (independent review) | **LIVE and operating** — every PR of the S1 build chain (#1–#5) went through it. ⚠ **Not universally enforced by machinery:** two teammate PRs (#6, #7) merged on 2026-08-27 without a review, because nothing mechanically requires one until S2.1 adds the status check (PROJECT-STATUS §8 **D-16**) *(2026-08-27: unchanged — the workflow is on `master` since the S2.1 merge (PR #11, 2026-08-27); the required status is the owner action in the `master` row)* |
> | Wall 4 (behavior proof) | **Not live** — Playwright harness is **S2.3**, the suite is **S5.1**; no automated suite exists today *(unchanged 2026-08-27)* |
>
> Consequence to hold onto: ~~**red CAN currently reach `master`**, because the status check does not exist
> to block it. That is precisely what S2.1 closes, and why S2.1 is the first sprint of Stage 2.~~
> **2026-08-27: the check RUNS on every PR from S2.1's merge; red can still be merged by hand until the required
> status is added and watched.** Workflow installed by S2.1; live on every PR from its merge; the required-status +
> watched-lock verification is an owner action, pending.
> Prepared prompt: `docs/sprint-prompts/S2.1-code-check-ci.md`.

One page. The standards are written once as configuration; machines enforce them on every line, every change, forever *(target state until S2.1 merges and the owner adds the required status — see the status banner above)*. Nothing here depends on anyone remembering anything.

---

## The four walls

| Wall | What it guarantees | Where it lives |
|---|---|---|
| 1. The rules | How code must be written | `CLAUDE.md`, `TECH-ARCHITECTURE.md` |
| 2. **The Code Check** | Every PR passes the six checks below — **red physically cannot merge** ~~⚠ *target; the workflow does not exist yet — **S2.1***~~ ⚠ *2026-08-27: the workflow EXISTS on `master` since the S2.1 merge (PR #11, 2026-08-27) (`a68f210`) and runs on every PR from S2.1's merge; "red cannot merge" holds only once the owner adds the required "Code Check" status and watches it lock a real PR* | This file + `.github/workflows/code-check.yml` ~~*(to be created)*~~ *(on `master` since the S2.1 merge (PR #11, 2026-08-27), 2026-08-27)* |
| 3. Independent review | A second pair of eyes on every PR; Blocking findings never merge ✅ *live today* | Codex review, `WORKFLOW.md` §7 |
| 4. Behavior proof | Every feature actually works, before launch and every morning after ⚠ *target; harness **S2.3**, suite **S5.1*** | `testing-setup/` + `error-tracking/` |

This file supplies Wall 2 and is deliberately the simplest piece of the whole system: one workflow file, one GitHub setting, nothing to operate. ~~⚠ **Not yet installed — Sprint S2.1 installs it** (status banner above).~~ ⚠ **2026-08-27: the workflow file is installed on `master` since the S2.1 merge (PR #11, 2026-08-27) (`a68f210`); the one GitHub setting — the required "Code Check" status — is still an owner action after the PR is open** (status banner above).

## The house standard, in plain words

1. **Strict types** — TypeScript runs in `strict` mode; the compiler rejects vague or unsafe code before it exists.
2. **Lint-clean** — ESLint (Next.js + TypeScript rules) checks every line for known bad patterns.
3. **Formatted** — Prettier, default config, committed to the repo; formatting is never a matter of taste or a source of diff noise.
   *Config note (S2.1, 2026-08-27): two deliberate decisions qualify "default config". `.prettierrc` is `{ "endOfLine": "auto" }` rather than the literal `{}` — the worktree is CRLF under `core.autocrlf=true` while CI checks out LF, so with `{}` the local check would be permanently red on Windows. `.prettierignore` excludes `*.md` (owner decision 2026-08-27, so docs and filed records stay byte-stable) alongside `.next/ out/ build/ node_modules/ pnpm-lock.yaml next-env.d.ts public/ qa-evidence/`. `prettier-plugin-tailwindcss` is installed but not enabled — a deliberate follow-up, not silent.*
4. **It builds** — the production build must succeed. "Works in dev" counts for nothing.
5. **Tests pass** — the repo's unit/integration tests run when present. (The full robot-user suite stays with the Launch Gate and morning check — running it on every PR would slow everything for no gain.)
6. **No known-critical vulnerabilities** — dependencies with critical published flaws block the merge.

Line-level professionalism rule for the builder: no `any`, no `@ts-ignore`, no `eslint-disable` without a one-line reason in the PR description — the Codex review treats an unexplained suppression as a finding.

## The Code Check → `.github/workflows/code-check.yml`

~~⚠ **This file does not exist yet — Sprint S2.1 creates it exactly as written below** (status banner at the top).~~ ⚠ **2026-08-27: the file exists on `master` since the S2.1 merge (PR #11, 2026-08-27) (`a68f210`), diff-verified identical to the block below** (status banner at the top). Once it exists it runs automatically on **every pull request**. About three robot-minutes. You never trigger it, tune it, or maintain it.

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
          node-version: 24
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

> **Node version — corrected 2026-08-27 (Sprint S2.1, first CI run).** The block originally pinned `node-version: 20`.
> The first "Code Check" run on PR #11 failed at `actions/setup-node` before any of our steps ran: **pnpm 11.3.0
> (the pinned package manager) requires Node ≥ 22.13** (`npm view pnpm@11.3.0 engines`), and Node 20 reached end of
> life on 2026-04-30. The pin is now **24** — the active LTS line and the version the local checks were run on
> (v24.15.0); Next 16.2.7 needs only ≥ 20.9. The workflow file and this block stay byte-identical.

The contract behind it: `package.json` defines the scripts `typecheck` (`tsc --noEmit`), `lint`, `format:check` (`prettier --check .`), `build`, and optionally `test:unit` — Claude Code sets these up once during the Setup Gate. ~~⚠ **Today `package.json` defines only `dev`, `build`, `start` and `lint`; `typecheck` and `format:check` (and the Prettier config `format:check` needs) are added by S2.1.** Until then the equivalent commands are run directly: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.~~ ⚠ **2026-08-27: done on `master` since the S2.1 merge (PR #11, 2026-08-27)** — `typecheck` = `tsc --noEmit`, `format:check` = `prettier --check .`, `lint` = `eslint .`, `"packageManager": "pnpm@11.3.0"`, plus the Prettier config (house standard item 3). The canonical local verification commands are now `pnpm typecheck` · `pnpm lint` · `pnpm format:check` · `pnpm build` (CI additionally runs `pnpm audit --prod --audit-level=critical` and `pnpm run --if-present test:unit`); `pnpm exec tsc --noEmit` remains equivalent, but the script is canonical. `CLAUDE.md`'s Verification section was updated to match on the branch.

## Setup (once per site — new build or retrofit, identical)

*Retrofit note: the workflow file and package.json scripts land in Sprint S2.1 — see docs/ROADMAP.md. (2026-08-27: landed on `master` since the S2.1 merge (PR #11, 2026-08-27) `claude/s2.1-code-check-ci`, in progress; merged 2026-08-27 as PR #11 (`a68f210`).)*

- [x] **Claude Code (one normal PR):** strict `tsconfig`, ESLint + Prettier configs, the ~~five~~ four scripts above (`test:unit` is optional and not yet present), and the workflow file. No behavior changes ride along. *(Done — PR #11 merged 2026-08-27 as `a68f210`; commits b3f7cd3 Prettier config; 57639bf one dedicated format-only commit, 63 code files (62 in `src/` + the stray root `page.tsx`) — the Step-4 contingency: `prettier --check` failed on 131 files at the merge-base measured with `--end-of-line auto` (154 with the default `lf`, the excess being CRLF line endings, not style); the whitespace-stripped character diff of every file shows only trailing commas, semicolons (statement terminators and inline type-member separators), arrow-function parentheses, quote style, CSS hex-case/leading-zero normalisation and `{" "}` placement, with typecheck and build results identical before and after; 1770cc1 workflow + scripts + pin + Known-issue-16 fix + CLAUDE.md. PR #11, merged by the owner 2026-08-27 as `a68f210`.)*
- [ ] **You (2 minutes, once):** ~~GitHub → the repo → **Settings → Branches → Add branch protection rule** → branch name `master` → tick **"Require a pull request before merging"** and **"Require status checks to pass before merging"** → search and select **"Code Check"** → save.~~ **Corrected 2026-08-27 (owner screenshot):** this repo protects `master` with a **Ruleset**, so the path is **Settings → Rules → Rulesets → "Protect master" → Branch rules** → tick **"Require status checks to pass"** → **+ Add checks** → select **"Code Check"** → **Save changes**. "Require a pull request before merging" is already ticked there; leave "Require branches to be up to date before merging" unticked (not in this spec). *(Retrofit note 2026-08-26: the "Require a pull request" half is already enabled on this repo — owner-confirmed; what S2.1 adds is the required "Code Check" status, then the watch-one-PR verification below.)* *(2026-08-27: still pending — owner action after the S2.1 PR is open, via the GitHub web UI; `gh` CLI not installed.)*
- [ ] **You + Claude Code (verify once):** watch one PR — the "Code Check" appears and goes ✅, and GitHub's merge button stays locked until it does. An unverified gate is the same as no gate. *(2026-08-27: pending — until this is recorded, a red PR can still be merged by hand; the workflow runs on every PR from S2.1's merge, but nothing requires it yet.)*

## Day to day

*(From S2.1's merge onward —* ⚠ *~~not yet true today; see the status banner.~~ 2026-08-27: the ✅/❌ appears on every PR from S2.1's merge; the "merge button stays locked" half is true only once the owner adds the required status and watches it on a real PR; see the status banner.)* Every PR now carries a plain ✅ or ❌ before your merge button. On ✅, merge as usual. On ❌, you do nothing — Claude Code reads the failure, fixes it, pushes, and the check re-runs; red can't reach `master`, so there is nothing to worry about, only something to wait for. You never have to wonder whether the checks were *really* run — the merge button is the proof. **Until S2.1 lands, the local checks are run and reported by hand in each sprint's record, and the independent review (Wall 3) is the gate that actually holds.** *(2026-08-27: S2.1 merged as PR #11 (`a68f210`) — each PR now carries the green check, but red can still be merged by hand until the required status is added and watched.)*

## The boundary, one line

The Code Check proves the **code** is sound on every PR; the Launch Gate and morning check prove the **site** behaves. Both, always — neither replaces the other. ~~⚠ **Both are target state**: the Code Check arrives in **S2.1**,~~ the Launch Gate harness in **S2.3** and its suite in **S5.1** are still target state. ~~Today neither is live~~ 2026-08-27: the Code Check is installed on `master` since the S2.1 merge (PR #11, 2026-08-27) (`a68f210`) and runs on every PR from its merge but is not yet a required status; the Launch Gate is still not live — the independent review (Wall 3) plus hand-run local checks carry the load.
