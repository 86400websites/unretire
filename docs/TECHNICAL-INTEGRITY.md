# Technical Integrity — How Every Line of Code Is Held to Standard

One page. The standards are written once as configuration; machines enforce them on every line, every change, forever. Nothing here depends on anyone remembering anything.

---

## The four walls

| Wall | What it guarantees | Where it lives |
|---|---|---|
| 1. The rules | How code must be written | `CLAUDE.md`, `TECH-ARCHITECTURE.md` |
| 2. **The Code Check** | Every PR passes the six checks below — **red physically cannot merge** | This file + `.github/workflows/code-check.yml` |
| 3. Independent review | A second pair of eyes on every PR; Blocking findings never merge | Codex review, `WORKFLOW.md` §7 |
| 4. Behavior proof | Every feature actually works, before launch and every morning after | `testing-setup/` + `error-tracking/` |

This file supplies Wall 2 and is deliberately the simplest piece of the whole system: one workflow file, one GitHub setting, nothing to operate.

## The house standard, in plain words

1. **Strict types** — TypeScript runs in `strict` mode; the compiler rejects vague or unsafe code before it exists.
2. **Lint-clean** — ESLint (Next.js + TypeScript rules) checks every line for known bad patterns.
3. **Formatted** — Prettier, default config, committed to the repo; formatting is never a matter of taste or a source of diff noise.
4. **It builds** — the production build must succeed. "Works in dev" counts for nothing.
5. **Tests pass** — the repo's unit/integration tests run when present. (The full robot-user suite stays with the Launch Gate and morning check — running it on every PR would slow everything for no gain.)
6. **No known-critical vulnerabilities** — dependencies with critical published flaws block the merge.

Line-level professionalism rule for the builder: no `any`, no `@ts-ignore`, no `eslint-disable` without a one-line reason in the PR description — the Codex review treats an unexplained suppression as a finding.

## The Code Check → `.github/workflows/code-check.yml`

Runs automatically on **every pull request**. About three robot-minutes. You never trigger it, tune it, or maintain it.

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

The contract behind it: `package.json` defines the scripts `typecheck` (`tsc --noEmit`), `lint`, `format:check` (`prettier --check .`), `build`, and optionally `test:unit` — Claude Code sets these up once during the Setup Gate.

## Setup (once per site — new build or retrofit, identical)

*Retrofit note: the workflow file and package.json scripts land in Sprint S2.1 — see docs/ROADMAP.md.*

- [ ] **Claude Code (one normal PR):** strict `tsconfig`, ESLint + Prettier configs, the five scripts above, and the workflow file. No behavior changes ride along.
- [ ] **You (2 minutes, once):** GitHub → the repo → **Settings → Branches → Add branch protection rule** → branch name `master` → tick **"Require a pull request before merging"** and **"Require status checks to pass before merging"** → search and select **"Code Check"** → save.
- [ ] **You + Claude Code (verify once):** watch one PR — the "Code Check" appears and goes ✅, and GitHub's merge button stays locked until it does. An unverified gate is the same as no gate.

## Day to day

Every PR now carries a plain ✅ or ❌ before your merge button. On ✅, merge as usual. On ❌, you do nothing — Claude Code reads the failure, fixes it, pushes, and the check re-runs; red can't reach `master`, so there is nothing to worry about, only something to wait for. You never have to wonder whether the checks were *really* run — the merge button is the proof.

## The boundary, one line

The Code Check proves the **code** is sound on every PR; the Launch Gate and morning check prove the **site** behaves. Both, always — neither replaces the other.
