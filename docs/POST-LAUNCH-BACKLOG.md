# Post-Launch Backlog — (Un)Retire

> The single holding pen for everything that is not the current sprint. Copy once per project and keep it living — this file is the project's single backlog of record.

## Backlog

Type: feature / fix / improvement · Priority: High / Medium / Low · Effort: S / M / L · Status: Parked / Ready / Promoted / Done

| Item | Type | Priority | Effort | Source | Status | Notes |
|---|---|---|---|---|---|---|
| Legacy pages: complete or remove `/framework` children, `/journeys`, `/articles` | fix | Medium | M | build deferral — S1.1 audit / Open decision D-3 | Parked | 7 nonexistent `/framework/practice-*` pages, 7 nonexistent `/journeys/*` pages, `/articles` legacy off-nav page (Known issue 4). Blocked on owner decision D-3; needed by Launch Gate. |
| Move un-watermarked master PDFs out of git (private / Supabase storage) | fix | High | M | build deferral — S1.1 audit / Open decision D-4 | Parked | `unretire-book-master.pdf` and `unretire-workbook-master.pdf` are git-tracked — the clean copies the watermark system exists to protect (Known issue 6). History scrub is destructive — owner call (D-4). |
| Dependency cleanup (unused framer-motion, lucide-react, @base-ui/react; shadcn CLI out of runtime deps) | improvement | Low | S | build deferral — S1.1 audit (Known issue 11) | Parked | Only `cn()` from `src/lib/utils.ts` is used; no `components/ui` dir. Assigned to Sprint S3.2 in `docs/ROADMAP.md` — flips to Promoted when S3.2 opens (with package rename and junk-file removal, D-5). |
| Remove dead `globals.css` palette (legacy dark "Half a Life" theme + shadcn tokens) | improvement | Low | S | build deferral — S1.1 design audit | Parked | Dead weight overridden by the `.ur-site` theme in `src/app/unretire.css`. Verify nothing outside `.ur-site` depends on it before removal. |
| Analytics decision (PostHog or other) | feature | Medium | M | build deferral — S1.1 audit (Known issue 13) | Parked | Owner decision on tool and privacy posture. Separate from error tracking — Sentry ships in Sprint S2.4; analytics is not in S2.4 scope. |
| Copy fix: "Thirty-one lessons" (home) vs "forty-eight lessons" (course page; courseData totals 48) | fix | Medium | S | content freeze flag — S1.1 (Known issue 8) | Parked | Flagged, not locked, in the content freeze. Needs owner-approved corrected copy; then a small content sprint applies it verbatim. |
| Verify testimonials and community stats | fix | Medium | S | content freeze flag — S1.1 (Known issue 9) | Parked | Book-page testimonials use placeholder "Reader name" attributions; community page claims "340+ Members, 18 Countries" (unverified). Owner supplies real attributions/figures or approves removal. |
| Review fail-open session-refresh middleware (`src/middleware.ts`) | improvement | High | S | build deferral — S1.1 audit (Known issue 14) | Parked | Security hardening deferral — **required-before-scale**. Review scheduled with the S4.4 / security pass; decide fail-open vs fail-closed behavior and document the choice. |
| Redirect the `unretire.vercel.app` alias to `www` and refuse Stripe sessions from a rejected host (Known issue 58 — course-purchase logout) | fix | High | S | S5.1c investigation, 2026-09-03 — PROJECT-STATUS §10 row 58 / D-34 | Ready | Probable cause of the post-payment logout: a session started on the alias, `safeOrigin()` rejects the host, `success_url` is built on `www`, Stripe returns the buyer to a host with no cookie. Fix: host-conditional permanent redirect in `next.config.ts` `redirects()` (`has: [{type: 'host', value: 'unretire.vercel.app'}]` → `https://www.unretireproject.com/:path*`), plus refuse `/api/checkout` / `continueByIntent()` when the request host is rejected rather than silently falling back; regression in `tests/e2e/security/origin-guard.spec.ts`. Confirm first via Vercel logs (`Refusing to build a URL from untrusted host`). **First post-launch fix sprint.** Owner: builder |
| Live Stripe 100%-off promotion code (Known issue 59) | fix | Medium | S | S5.1c reproduction, 2026-09-03 — PROJECT-STATUS §10 row 59 | Ready | `FREE` is invalid on the live account ("This code is invalid."); needed for MN-003 and for a $0 reproduction of Known issue 58. Owner action in the live Stripe dashboard — an unrestricted promotion code on the 100%-off coupon. Owner: owner |

> Launch-blocking items are **not** parked here: basic public-form abuse controls (bot check + rate limit) and the `/privacy` + `/terms` pages belong to Sprint S4.5 in `docs/ROADMAP.md`, per the intake rule below and `docs/SECURITY-CHECKLIST.md` §5.

## Intake rules

- [ ] New ideas land HERE, not in the current sprint. The sprint scope is closed once it starts.
- [ ] Deferred sprint scope arrives with a pointer to its brief (`docs/sprint-prompts/[SPRINT_ID]-[SLUG].md`) so context isn't lost.
- [ ] Security hardening deferrals (rate limiting, CAPTCHA, etc.) are marked **required-before-scale**, not optional. But **basic** public-form abuse control (a server-verified bot check and/or rate limit) is **launch-blocking** and may not be parked here — only *advanced* hardening (tighter limits, anomaly detection) is scale-deferrable (`docs/SECURITY-CHECKLIST.md` §5).
- [ ] Every item records its Source — where it came from decides how much re-validation it needs later.
- [ ] Nothing is deleted. Parked is a status, not a fate; rejected ideas keep a one-line "why" in Notes.

Why this matters: a trusted backlog is what makes "not now" a safe answer — ideas stop leaking into open sprints.

## Promotion rule

- [ ] A backlog item becomes work only by being promoted into a sprint via `SPRINT-PLAN-TEMPLATE.md` when its turn comes.
- [ ] On promotion: set Status to Promoted, note the [SPRINT_ID], and re-validate the item against the current repo (paths, routes, and assumptions rot).
- [ ] One sprint at a time — never promote an item into a sprint that is already running.

Never do this: never "quickly slip in" a backlog item mid-sprint, and never fix a backlog item silently inside an unrelated PR.

---

Next step → when an item's turn comes, scope it with `SPRINT-PLAN-TEMPLATE.md` and add it to `docs/ROADMAP.md`.
