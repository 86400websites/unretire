# Development — Start Here

Use this folder only after the final predevelopment GO gate is signed. It contains the project docs pack and reusable templates. The one-page map of the entire system lives at `../00-SYSTEM-MAP.md` — open it whenever you lose the thread.

## Entry gate

- [ ] `../predevelopment/8. Final Wireframes and Mockup.md` has a signed **GO** verdict.
- [ ] Its final handoff table links the approved client answers, research, feature plan, design system, sitemap, page plans/copy, and wireframes.
- [ ] `[PROJECT_NAME]`, the primary conversion, the MVP feature list, build sequence, and locked facts are known.
- [ ] Open decisions are explicitly non-blocking and do not block the Setup Gate or Stage 0.

If any box is open, return to predevelopment. Do not scaffold the app.

## Copy map

Run `templates/NEW-WEBSITE-SETUP-CHECKLIST.md`. It uses this placement:

| SOP item | Project repository location |
|---|---|
| `README-TEMPLATE.md` | `README.md` |
| `CLAUDE.md` | `CLAUDE.md` |
| `AGENTS.md` | `AGENTS.md` |
| All other top-level development `.md` files (except this start file), including both prompt guides | `docs/` |
| Entire `templates/` folder (except the two Claude skills below) | `docs/templates/` |
| `templates/sprint-prompt.md`, `templates/close.md`, and `templates/browser-qa.md` — the Claude Code skills | `.claude/skills/sprint-prompt/SKILL.md`, `.claude/skills/close/SKILL.md`, and `.claude/skills/browser-qa/SKILL.md` (rename each to `SKILL.md`) |
| Filled sprint prompt records | `docs/sprint-prompts/[SPRINT_ID]-[SLUG].md` |
| Filled review records | `docs/code-reviews/[SPRINT_ID]-[SLUG]-review.md` |
| `testing-setup/` — the Launch Gate module | `docs/testing-setup/`; its skill `activate-testing.md` → `.claude/skills/activate-testing/SKILL.md` (see the module's own `00-START-HERE.md`) |
| `error-tracking/` — the post-launch incident module | `docs/error-tracking/`; its skill `handle-error.md` → `.claude/skills/handle-error/SKILL.md` (see the module's own `00-START-HERE.md`) |

Copying the entire templates folder makes the project docs self-contained. Create the record folders with their first record; empty folders do not survive Git.

Three files in `templates/` are Claude Code skills rather than fill-in prompt skeletons: `sprint-prompt.md` (opens a sprint and fills the implementation prompt; records it after merge), `close.md` (the single pre-merge GO / NO-GO sweep), and `browser-qa.md` (real-browser verification — visual QA evidence, Preview form tests, and bug reproduction via the globally installed Playwright MCP / Agent Browser; see `BROWSER-TOOLS.md`). Copy each to `.claude/skills/[NAME]/SKILL.md`; they then invoke as `/sprint-prompt`, `/close`, and `/browser-qa` (or trigger automatically when the task matches), fill the same `docs/templates/` skeletons, and cite the same `docs/` gates — they add no rules of their own.

Two more skills ship inside their own self-contained modules: `testing-setup/activate-testing.md` (`/activate-testing` — the whole-site Launch Gate that must pass before launch) and `error-tracking/handle-error.md` (`/handle-error` — the post-launch incident lane). Copy each to `.claude/skills/[NAME]/SKILL.md` the same way; each module's `00-START-HERE.md` carries its full copy map, and both modules also retrofit into existing sites on their own.

## Delivery model

Every change follows:

**branch → build → local checks → PR → deployed Preview (Vercel or approved equivalent) → Codex review → merge → Production smoke test**

- GitHub is the source of truth; `main` is protected and production-ready.
- One feature or fix = one branch = one PR. Finish the active sprint before starting another.
- Claude Code builds; Codex reviews an immutable merge-base-to-head range; the owner merges.
- Any substantive change after approval requires a refreshed Preview and another review at the new head.
- Never push or commit unless the task explicitly authorizes it.
- Never read, print, copy, edit, stage, or commit live env files or values.

The standard hosting profile is Vercel. A different approved host must provide an isolated PR Preview, environment separation, production-from-`main`, and a tested rollback action. Supabase is optional and should be skipped when the approved architecture does not need it.

## Source-of-truth boundaries

- The repository owns shipped code and project-level docs.
- `docs/ROADMAP.md` owns scope and order.
- `docs/PROJECT-STATUS.md` owns live project state.
- `../00-SYSTEM-MAP.md` is the operator's one-page orientation map; it explains the system and never replaces repo state.
- The approved predevelopment files remain the authority for client facts, research decisions, scope, copy, design, routes, and wireframes.

## Status lifecycle

Every checklist and record in this system uses one common lifecycle:

**Not Started → In Progress → Blocked or Ready for Review → Approved → Done**, plus **Not Applicable** with a reason for optional items.

Use **Approved** when the required reviewer or owner accepts an item. Use **Done** only after it is approved and filed, merged, or handed off.

## Reading order

1. `WORKFLOW.md`
2. `TECH-ARCHITECTURE.md` and `DESIGN.md`
3. `ROADMAP.md` and `PROJECT-STATUS.md`
4. `CLAUDE.md` and `AGENTS.md`
5. `ENV-VARS-SAFETY.md`, `SECURITY-CHECKLIST.md`, `QA-CHECKLIST.md`, `ROLLBACK.md`, and `HANDOFF.md`
6. `testing-setup/TESTING-GUIDE.md` and `error-tracking/ERROR-TRACKING-GUIDE.md` — the Launch Gate before launch, the incident lane after it

## First action

Complete the **Setup Gate** in `templates/NEW-WEBSITE-SETUP-CHECKLIST.md`. The gate prepares a protected repository, filled governing docs, CI, and the Preview pipeline. It does not count an incomplete page or no-op form as a finished barebones website.

After the Setup Gate, execute Stage 0 from `ROADMAP.md`: the smallest complete website with its primary journey working end to end.

**Next:** `templates/NEW-WEBSITE-SETUP-CHECKLIST.md`.
