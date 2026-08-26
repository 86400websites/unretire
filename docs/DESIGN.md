# DESIGN.md — The Design System in Code

The taste contract for (Un)Retire: how the approved design decisions become code. This project is a
development-stage retrofit with **no predevelopment pack** — the shipped site is the approved design
baseline, and the decisions derived from it are recorded in this file (approved copy and exact claims
live in `docs/content/`). `docs/TECH-ARCHITECTURE.md` fixes the *mechanics*; this file fixes the *taste*. Fill the tables from the
the design system recorded in this file; then implementation never re-decides a visual question.

> **Retrofit note (Sprint S1.1):** this site shipped before the Website-Development-System was adopted.
> The shipped code is the approved design baseline, and "mockups" means the live pages recorded in
> the shipped pages themselves — every table below is filled from the code actually in the repo
> (`src/app/unretire.css`, `src/app/layout.tsx`, the shipped pages), not from a greenfield design file.

## 1. Binding rules (read first)

- [ ] **Mockups + approved copy are the source of truth.** The developer never invents a color, spacing value, or layout — and never rewrites approved copy. New strings (errors, labels, empty states) follow the written brand-voice rules.
- [ ] **Drift rule:** if a built page disagrees with its mockup, **flag it** in `docs/PROJECT-STATUS.md` → Open decisions — never silently pick one.
- [ ] **Code-wins tie-break:** where this file and the shipped tokens disagree, the code wins — update this file in the same PR.
- [ ] Locked facts/numbers the site claims are implemented verbatim and never drift through copy edits.

## 2. Tokens (one source of truth in code)

All tokens live in **one global stylesheet / theme file**: `src/app/unretire.css`, scoped under `.ur-site`
(all tokens are `--ur-*` custom properties on the `.ur-site` wrapper). Components read
tokens only — **never inline hex in markup**. A rebrand must be a one-file change (the accent is a single
token by design: change `--ur-crimson` to re-skin the site).

> **Deprecated dead weight:** `src/app/globals.css` still carries the legacy dark "Half a Life" palette
> (`--page-bg: #0D0D0D`, `--crimson: #8B1A1A`, gold/cream/sand tokens) plus shadcn/ui HSL tokens. It is
> loaded but overridden inside `.ur-site`. Never source a new UI value from `globals.css`; the `--ur-*`
> tokens in `unretire.css` are the only live palette.

### Colors

| Role | Token | Hex | Contrast note |
|---|---|---|---|
| Primary action | `--ur-crimson` (brand orange; historic name) | `#D05D11` | White on it ≥ 4.5:1 target — **measured ≈ 4.0:1**; see flag below |
| Page background | `--ur-bg` | `#FFFFFF` | |
| Surface / card wash | `--ur-warm` (warm cream section bands); cards themselves are `#fff` on `--ur-card-border` | `#FBF5F2` | |
| Body text | `--ur-text` | `#444444` | ≥ 4.5:1 on background — measured ≈ 9.7:1 |
| Accent (sparing) | `--ur-crimson` (same single token as primary — by design) | `#D05D11` | One recorded role only: "the pointer" — eyebrows, `.rule` bars, pill-links, focus rings, `::selection` |

Additional shipped tokens (all in `src/app/unretire.css` on `.ur-site`):

| Role | Token | Hex | Note |
|---|---|---|---|
| Primary hover | `--ur-crimson-dark` | `#B14E0C` | `.btn-crimson:hover` |
| Dark bands / footer | `--ur-navy` | `#232F3F` | Footer, preview banner, dark sections; white on it ≈ 13.5:1 |
| Deeper navy | `--ur-navy-deep` | `#1A2430` | |
| Headings ink | `--ur-ink` | `#1B1B1B` | h1–h4 color; ≈ 17.2:1 on white |
| Muted text | `--ur-muted` | `#666666` | Secondary copy, `.eyebrow-muted` |
| Warm tint | `--ur-tint` | `#FAF3EE` | `.icon-block` fills, chips, active-nav pill |
| Borders | `--ur-border` / `--ur-card-border` | `#ECECEC` | Hairlines, card borders, header border |

> ⚠ **Contrast flag (record in `docs/PROJECT-STATUS.md` → Open decisions):** white button labels
> (13px bold) on `--ur-crimson #D05D11` measure ≈ 4.0:1 — below the 4.5:1 AA bar for normal-size text.
> Shipped baseline; do not silently change either side.

### Type scale

| Level | Token / class | Size (fluid ok) | Weight | Line-height |
|---|---|---|---|---|
| Display / h1 | Tailwind steps, e.g. home hero `text-4xl sm:text-5xl lg:text-6xl` | 2.25rem → 3rem → 3.75rem (responsive steps, no clamp) | 700 (shared `.ur-site h1–h4` rule, letter-spacing −0.01em) | `leading-[1.05]` hero; 1.14 shared rule |
| h2 / h3 | Tailwind steps per page (commonly `text-2xl`–`text-4xl`), bound by the shared `.ur-site h1–h4` rule | per page | 700, −0.01em | 1.14 |
| Body | `.ur-site` base 17px; `.lede` 18px; `.prose-body` 16px | ≥ 16px — never smaller (inputs forced to 16px to avoid iOS zoom) | 400 | 1.6 base / 1.75 lede / 1.7 prose |
| Small / eyebrow | `.eyebrow` 18px, 0.16em tracking; nav links + `.pill-link` 12px, 0.08–0.1em; `.btn` 13px, 0.04em | 12–18px | 700 | All-caps only for tracked eyebrows, nav labels, and pill-links |

Fonts: **Libre Baskerville** (400/700 + italic — the primary serif for the entire `.ur-site`: body *and* headings, applied via `--font-libre-baskerville` on the `.ur-site` wrapper with Georgia/Times fallbacks) + three legacy faces loaded in `src/app/layout.tsx` for the old Half a Life theme mapping in `globals.css`: **Cormorant Garamond** (`--font-cormorant` → `--font-display`; effectively unused inside `.ur-site`), **DM Sans** (`--font-dm-sans` → `--font-body`; reaches only pre-`.ur-site` chrome such as the skip-link), **Fira Code** (`--font-fira-code` → `--font-mono`; unused in `.ur-site`). All are loaded through `next/font/google` (self-hosted by Next.js, `display: swap`) — the approved privacy/performance-safe method; load only the weights used. One `<h1>` per page; never skip heading levels.

### Spacing

| Token | Value | Use |
|---|---|---|
| `--space-section` | No token yet — shipped rhythm is Tailwind steps `py-16 sm:py-20 lg:py-24` (4rem → 5rem → 6rem); quote/CTA bands `py-14`–`py-16` (3.5–4rem) | Vertical rhythm between sections — generous; cramped spacing is the #1 amateur tell |
| `--space-card` | No token yet — shipped: `p-6`–`p-8` (1.5–2rem), `sm:p-10` (2.5rem) on feature cards | Card padding |
| `--ur-nav-h` | `70px` | Sticky header height (real shipped token in `unretire.css`) |

New value → new token, recorded here. Never invent values ad hoc.

> **Spacing shim rule:** `.ur-site` re-asserts every Tailwind margin/padding utility it uses in an
> auto-generated shim at the bottom of `src/app/unretire.css` (needed because `globals.css` has an
> unlayered `* { margin:0; padding:0 }` reset). Using a spacing utility not already in the shim silently
> does nothing — add the shim entry in the same change.

## 3. Component register (spec → code)

One shared component per pattern — never two implementations of the same thing.

| Component | Spec source | Code file | Notes |
|---|---|---|---|
| Button (primary/secondary) | mockups + tokens | `.btn` + `.btn-crimson` / `.btn-outline` classes in `src/app/unretire.css` (class-based; no component file) | Primary = the conversion color (`--ur-crimson`); pill radius 999px |
| Form field + errors | shipped forms | No single shared field component — shared clients: `src/app/EmailCaptureForm.tsx`, `src/app/EmailCaptureBand.tsx`, `src/app/DownloadGate.tsx` (email-gate modal → `/api/subscribe`); per-feature: `src/app/contact/ContactForm.tsx`, `src/app/community/CommunityJoinForm.tsx`, `src/app/enterprise/DiscoveryForm.tsx`, `src/app/login/LoginForm.tsx`, `src/app/RegistrationForm.tsx`, `src/app/PasswordField.tsx`, `src/app/forgot-password/ForgotPasswordForm.tsx`, `src/app/reset-password/ResetPasswordForm.tsx` | Validation messages follow brand voice. `src/app/NewsletterForm.tsx` is unused with a fake submit — do not reuse (removal: Sprint S3.2) |
| Card | mockups + tokens | `.card` + `.card-hover` classes in `src/app/unretire.css` | 16px radius, `#fff` on `--ur-card-border`, hover lifts −3px |
| Public shell header / footer | locked chrome | `src/app/UnRetireNav.tsx` (sticky white 70px header, backdrop-blur, uppercase 12px links, orange account CTA) + `src/app/UnRetireFooter.tsx` (navy `--ur-navy` footer) — wired once in `src/app/layout.tsx` | See §4 |
| Member/admin shell navigation (if used) | approved shell specs | None — gated pages (`/account`, `/learn/course/[module]`) reuse the public shell | See §4 |
| Course player | shipped baseline | `src/app/learn/course/CoursePlayer.tsx` | Entitlement-gated module player (YouTube embeds + PDF worksheets) |
| Checkout button | shipped baseline | `src/app/premium/CheckoutButton.tsx` | Posts to `/api/checkout` (Stripe) |
| Book download (premium) | shipped baseline | `src/app/premium/BookDownloadModal.tsx`, `src/app/account/BookDownload.tsx` | Watermarked PDF via `/api/book-download` |
| Wheel of Life assessment | shipped baseline | `src/app/assess/WheelOfLife.tsx` | 8 questions → radar chart → email gate |
| Small primitives | tokens | `.eyebrow`, `.rule`, `.lede`, `.prose-body`, `.icon-block`, `.pill-link` in `src/app/unretire.css`; `src/app/BackToTop.tsx`, `src/app/ComingSoon.tsx`, `src/app/enterprise/FaqAccordion.tsx` | |

## 4. Locked shell chrome

List the shells approved in the sitemap: **public only** — one shell, the `.ur-site` wrapper defined in
`src/app/layout.tsx`: `UnRetireNav` (sticky white header, `--ur-nav-h` 70px) + `<main>` + `UnRetireFooter`
(navy footer). Signed-in and entitlement-gated pages use the same shell. Each
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
- *Shipped baseline (recorded, not a new rule):* hover/focus transitions only, 200–300ms; card easing `cubic-bezier(0.22, 1, 0.36, 1)`; card hover lift `translateY(-3px)`; a global `prefers-reduced-motion` kill-switch in `unretire.css` disables all transitions/animations. `framer-motion` is installed but unused — do not introduce it without a decision.

## 6. Accessibility checklist (WCAG AA minimum)

- [ ] Contrast: 4.5:1 body text, 3:1 large text/UI — verify photo-scrim pairs on the **rendered page**, not just math.
- [ ] Visible focus ring on every interactive element; fully keyboard-navigable.
- [ ] Never color alone to convey meaning (errors, badges, states).
- [ ] Semantic HTML, correct `lang`, skip-to-content link.
- [ ] Tap targets ≥ 44×44px; no horizontal scroll from 320px up.
- [ ] Images use the project's optimized image solution with explicit dimensions (no layout shift); alt text conveys the image's useful context and may name a known person/event when that identification matters.

## 7. Working rules

- [ ] Name one shipped page the **benchmark** — every new page measures against it: **the home page (`/`, `src/app/page.tsx`)**.
- [ ] Placeholder assets go in at the **correct aspect ratio** and are flagged — wrong-ratio placeholders lock in broken layouts.
- [ ] Client master assets stay in a gitignored source folder (client cloud drive is canon); only optimized, size-budgeted outputs are committed.
- [ ] Record reverted design experiments here so they aren't retried.
- [ ] Design changes update this file in the same PR.

## 8. Frontend craft — professional finish

The bar for every page is "looks professionally designed", not "renders without errors". Tokens (§2), motion (§5), and accessibility (§6) already bind; this section adds the craft rules that stop a site looking templated.

- **Visual thesis:** Calm, literary, unhurried — a light editorial page set in Libre Baskerville on warm white, like a well-made book: generous whitespace, hairline borders, navy grounding, and a single orange accent doing all the pointing. Every page serves it; a choice that doesn't serve it is out. *(Retrofit: derived from the shipped baseline — no predevelopment pack exists for this project, so this recorded thesis IS the approved source. Changing it is an owner decision, logged in `docs/PROJECT-STATUS.md` → Open decisions.)*
- **Anti-generic rules (blocking):**
  - No framework-default look — typography pairing and color roles come from §2, never a library's defaults left in place.
  - Consistent shape language: radii, borders, shadows, and icon style from tokens; no per-component improvisation.
  - Every interactive element has designed hover, focus-visible, and active states (specified in §2 tokens, §5 motion, and §6 accessibility of this file; the shipped baseline is the reference) — not browser defaults.
  - Imagery meets the recorded quality bar (subjects, crop, treatment per the brief); no stretched, pixelated, or cliché stock assets; placeholders per §7 rules.
  - Real content rhythm at review — no lorem ipsum in a PR; section density varies deliberately, not uniformly.
- **Project anti-patterns (derived from the shipped baseline; this list is the approved record — additions are an owner decision):**
  - No dark-theme page sections reintroducing the legacy Half a Life palette from `globals.css` — the only approved dark surfaces are the navy (`--ur-navy`) footer and band sections.
  - No gradient text and no gradient backgrounds.
  - No parallax, cursor-following, or scroll-jacking effects.
  - No full-screen hero video or auto-playing media.
  - No second accent color — `--ur-crimson` is the single accent token and carries all accent duty.
- **Visual QA evidence:** every UI sprint captures browser evidence on the deployed Preview — screenshots at 320 / 768 / 1440 of each touched page plus its states (default, hover/focus-visible, loading, empty, error), taken with **Playwright MCP** or the **Agent Browser** CLI (`docs/BROWSER-TOOLS.md`; the `/browser-qa` skill runs this) — and judges them against the approved mockup and this section. Record per `docs/QA-CHECKLIST.md` Part 2.

Next step → build pages sprint by sprint via `docs/WORKFLOW.md`, checking each against its mockup and this file before the PR.
