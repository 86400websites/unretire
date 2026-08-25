# DESIGN.md — The Design System in Code

The taste contract for [PROJECT_NAME]: how the approved predevelopment design decisions become code.
`docs/TECH-ARCHITECTURE.md` fixes the *mechanics*; this file fixes the *taste*. Fill the tables from the
approved `predevelopment/5. Design System.md` and wireframes; then implementation never re-decides a visual question.

## 1. Binding rules (read first)

- [ ] **Mockups + approved copy are the source of truth.** The developer never invents a color, spacing value, or layout — and never rewrites approved copy. New strings (errors, labels, empty states) follow the written brand-voice rules.
- [ ] **Drift rule:** if a built page disagrees with its mockup, **flag it** in `docs/PROJECT-STATUS.md` → Open decisions — never silently pick one.
- [ ] **Code-wins tie-break:** where this file and the shipped tokens disagree, the code wins — update this file in the same PR.
- [ ] Locked facts/numbers the site claims are implemented verbatim and never drift through copy edits.

## 2. Tokens (one source of truth in code)

All tokens live in **one global stylesheet / theme file** (e.g. `src/styles/globals.css`). Components read
tokens only — **never inline hex in markup**. A rebrand must be a one-file change.

### Colors

| Role | Token | Hex | Contrast note |
|---|---|---|---|
| Primary action | `--color-primary` | [#______] | White on it ≥ 4.5:1 |
| Page background | `--color-background` | [#______] | |
| Surface / card wash | `--color-surface` | [#______] | |
| Body text | `--color-text` | [#______] | ≥ 4.5:1 on background |
| Accent (sparing) | `--color-accent` | [#______] | One recorded role only |

### Type scale

| Level | Token / class | Size (fluid ok) | Weight | Line-height |
|---|---|---|---|---|
| Display / h1 | | [clamp(…)] | | |
| h2 / h3 | | | | |
| Body | | ≥ 16px — never smaller | | ~1.6 |
| Small / eyebrow | | | | All-caps only for tracked eyebrows |

Fonts: [display font] + [body font], loaded through the approved privacy/performance-safe method; load only the weights used. One `<h1>` per page; never skip heading levels.

### Spacing

| Token | Value | Use |
|---|---|---|
| `--space-section` | [value] | Vertical rhythm between sections — generous; cramped spacing is the #1 amateur tell |
| `--space-card` | [value] | Card padding |

New value → new token, recorded here. Never invent values ad hoc.

## 3. Component register (spec → code)

One shared component per pattern — never two implementations of the same thing.

| Component | Spec source | Code file | Notes |
|---|---|---|---|
| Button (primary/secondary) | mockups + tokens | [path — e.g. `src/components/ui/button.tsx`] | Primary = the conversion color |
| Form field + errors | | | Validation messages follow brand voice |
| Card | | | |
| Public shell header / footer | locked chrome | | See §4 |
| Member/admin shell navigation (if used) | approved shell specs | | See §4 |

## 4. Locked shell chrome

List the shells approved in the sitemap: [public only / public + member / public + member + admin]. Each
shell has one locked navigation system. Chrome is identical on every page **within that shell** and is never
redesigned per page. A transparent header that solidifies on scroll is a state of the public shell, not a
fork. Adding or changing a shell requires an updated sitemap/mockup and explicit client authorization,
recorded as a decision.

Why this matters: public, member, and admin areas may need different navigation, but one-off page chrome is
the fastest way for a site to stop feeling like one product.

## 5. Motion rules

- Register: restrained, entrance-only reveals. Don't mix registers — coherence beats novelty.
- Locked parameters: one easing curve; durations ~300–600ms; travel ~16–24px; hover scale ≤ 1.02.
- Every animation respects `prefers-reduced-motion`.
- **Never do this:** no parallax, cursor effects, springs, or auto-playing motion without explicit, dated client sign-off recorded as a decision ID — and exceptions can be RETIRED, recorded the same way.

## 6. Accessibility checklist (WCAG AA minimum)

- [ ] Contrast: 4.5:1 body text, 3:1 large text/UI — verify photo-scrim pairs on the **rendered page**, not just math.
- [ ] Visible focus ring on every interactive element; fully keyboard-navigable.
- [ ] Never color alone to convey meaning (errors, badges, states).
- [ ] Semantic HTML, correct `lang`, skip-to-content link.
- [ ] Tap targets ≥ 44×44px; no horizontal scroll from 320px up.
- [ ] Images use the project's optimized image solution with explicit dimensions (no layout shift); alt text conveys the image's useful context and may name a known person/event when that identification matters.

## 7. Working rules

- [ ] Name one shipped page the **benchmark** — every new page measures against it.
- [ ] Placeholder assets go in at the **correct aspect ratio** and are flagged — wrong-ratio placeholders lock in broken layouts.
- [ ] Client master assets stay in a gitignored source folder (client cloud drive is canon); only optimized, size-budgeted outputs are committed.
- [ ] Record reverted design experiments here so they aren't retried.
- [ ] Design changes update this file in the same PR.

## 8. Frontend craft — professional finish

The bar for every page is "looks professionally designed", not "renders without errors". Tokens (§2), motion (§5), and accessibility (§6) already bind; this section adds the craft rules that stop a site looking templated.

- **Visual thesis:** `[ONE_SENTENCE — what the interface communicates at first glance, from approved predevelopment file 04, section 1]`. Every page serves it; a choice that doesn't serve it is out.
- **Anti-generic rules (blocking):**
  - No framework-default look — typography pairing and color roles come from §2, never a library's defaults left in place.
  - Consistent shape language: radii, borders, shadows, and icon style from tokens; no per-component improvisation.
  - Every interactive element has designed hover, focus-visible, and active states (see predev brief §8) — not browser defaults.
  - Imagery meets the recorded quality bar (subjects, crop, treatment per the brief); no stretched, pixelated, or cliché stock assets; placeholders per §7 rules.
  - Real content rhythm at review — no lorem ipsum in a PR; section density varies deliberately, not uniformly.
- **Project anti-patterns (from predev brief §9):** `[3–5 forbidden choices, e.g. "no full-screen hero video", "no gradient text"]`.
- **Visual QA evidence:** every UI sprint captures browser evidence on the deployed Preview — screenshots at 320 / 768 / 1440 of each touched page plus its states (default, hover/focus-visible, loading, empty, error), taken with **Playwright MCP** or the **Agent Browser** CLI (`docs/BROWSER-TOOLS.md`; the `/browser-qa` skill runs this) — and judges them against the approved mockup and this section. Record per `docs/QA-CHECKLIST.md` Part 2.

Next step → build pages sprint by sprint via `docs/WORKFLOW.md`, checking each against its mockup and this file before the PR.
