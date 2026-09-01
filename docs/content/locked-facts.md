# Locked facts — (Un)Retire

Exact approved claims. Implement these **verbatim** wherever they appear. Every row was
verified against the shipped code on 2026-08-25 (Sprint S1.1) before locking. Changing a
locked fact goes through this file first (owner approval), then code — see `README.md`
in this folder.

| Fact | Exact approved wording | Source in code | Status |
|---|---|---|---|
| Brand name | (Un)Retire | ~~`src/app/page.tsx` (Guest Preview banner: "the (Un)Retire Exclusive Guest Preview")~~ *(banner removed 2026-09-01, D-32)* `src/app/UnRetireFooter.tsx` (copyright line); `src/app/book/page.tsx` metadata | LOCKED |
| Tagline (primary) | Reboot. Don't Mute. | `src/app/page.tsx` hero eyebrow; `src/app/book/page.tsx` cover alt text | LOCKED |
| Tagline (signature quote) | Aging is inevitable. Diminishing is optional. | `src/app/page.tsx` signature-quote section, attributed "— Maher Kaddoura" | LOCKED |
| Author | Maher Kaddoura | `src/app/page.tsx` hero lede + quote attribution; `src/app/book/page.tsx` metadata | LOCKED |
| Framework | 5 Mindsets × 7 Practices (equation: Mindset × Practice) | `src/app/book/page.tsx` `mindsets` array (5 entries: Freedom, Evolution, Balance, Relevance, Joy) and `practices` array (7 entries: Ignite, Move, Connect, Contribute, Explore, Grow, Optimize); `src/app/page.tsx` framework section | LOCKED |
| Course price | $99 one-time ("$99 once. Yours to keep.") | Display copy: `src/app/learn/course/page.tsx` (lines 30, 41, 149, 156), `src/app/premium/page.tsx` ("$99 on its own — included here."), `src/app/page.tsx` ("The Course — $99, once."). Charged amount: Stripe price behind env `STRIPE_PRICE_COURSE`, mode `payment` (one-time) — `src/lib/stripe/checkout.ts` | LOCKED |
| Premium price | $199/yr subscription ("Premium — $199 a year." / "$199/year") | Display copy: `src/app/premium/page.tsx` (lines 8, 69, 165, 171), `src/app/learn/course/page.tsx` (line 160), `src/app/page.tsx`. Charged amount: Stripe price behind env `STRIPE_PRICE_PREMIUM`, mode `subscription` — `src/lib/stripe/checkout.ts` | LOCKED |
| Course size — modules | 10 modules ("Ten modules") | `src/app/learn/course/courseData.ts` `modules` array (module-1 … module-10); `src/app/learn/course/page.tsx` line 27 | LOCKED |
| Course size — lessons | 48 lessons ("forty-eight lessons") | `src/app/learn/course/courseData.ts` `totalLessons` = 48 (per-module lesson counts 4+6+5+5+5+5+5+4+4+5); rendered via `totalLessons` on `src/app/learn/course/page.tsx`. ⚠ Home page card says "Thirty-one lessons" — see Flagged item 1; the 48 figure is the locked one | LOCKED |
| Course lesson format | YouTube video per lesson + downloadable PDF worksheets | `src/app/learn/course/courseData.ts` (`youtubeId`, `pdfUrl`, module `intro.deliverablePdf` fields) | LOCKED |
| Premium contents | The course, an electronic copy of the book and workbook, a monthly letter from Maher, and a growing toolkit | `src/app/premium/page.tsx` (line 8 description; "Five things. One of them is the $99 course."). Book/workbook downloads are premium-gated, per-user watermarked PDFs — `src/app/api/book-download/route.ts` (pdf-lib) | LOCKED |
| Book editions | 6 editions, purchased via Amazon links (Paperback A5, Hardcover A5, Paperback B5, Hardcover B5, Kindle eBook, Workbook A4 Paperback) | `src/app/book/page.tsx` `BOOK_EDITIONS` array (lines 11–18), all `amazon.com/dp/…` hrefs | LOCKED |
| Lead magnet — 14-Day Starter Plan | 14-Day Starter Plan (free, by email) — long form "14-Day (Un)Retire Starter Plan" | `src/app/start/page.tsx` (email capture); `src/app/page.tsx` CTA "Download the Free 14-Day Starter Plan"; `src/app/book/page.tsx` tools strip | LOCKED |
| Lead magnet — Practice Toolkit | Practice Toolkit | `src/app/book/page.tsx` tools strip → `/tools` | LOCKED |
| Lead magnet — Wheel of Life assessment | Wheel of Life — (Un)Retirement Edition: 8 questions, about 2 minutes, radar-chart result, email gate for the personal reading | `src/app/assess/WheelOfLife.tsx` ("8 questions · about 2 minutes · honest, not graded"; radar geometry; email gate); `src/app/page.tsx` Assess card ("Eight questions, two minutes, no signup."); `src/app/book/page.tsx` tools strip | LOCKED |

## Flagged — needs owner resolution (do NOT treat as locked)

These claims appear on the shipped site but are inconsistent or unverified. They are
**excluded** from the approved baseline. Do not copy them into new pages, do not "fix"
them without an owner decision, and do not lock them.

1. **Lesson-count inconsistency: "Thirty-one lessons" vs "forty-eight lessons".**
   The home page course card says "Ten modules. Thirty-one lessons." (`src/app/page.tsx`,
   "Here's What You Pay For" section) while the course page says "Ten modules,
   forty-eight lessons" (`src/app/learn/course/page.tsx` line 27) and
   `src/app/learn/course/courseData.ts` totals 48. The code total is 48; the home-page
   copy needs an owner-approved content fix (Known issue 8).

2. **Placeholder testimonial attributions ("Reader name").** *(Briefly unlabelled on 2026-08-27; restored the same day — see the note below.)*
   All four book-page testimonials are attributed with the placeholder token "Reader name" (three add a descriptor — "…, former executive", "…, recently retired", "…, retired educator" — the fourth is bare)
   (`src/app/book/page.tsx` `testimonials` array, lines 41–44). and the page itself
   prints "Placeholders written in the book's voice — swap in real endorsements when
   available." ⚠ **History, 2026-08-27:** PR #7 (`6c4416a`) removed that disclaimer — and the
   equivalent note on `src/app/stories/page.tsx`, along with the sentence "Each card links to a
   full profile." — while the four placeholder testimonials remained, so for part of that day the
   invented endorsements carried no statement that they were placeholders. **Sprint S1.7 reverted
   both PRs the same day, so all of that copy is back as recorded above.** Kept here because the
   episode is why Known issue 9 was briefly escalated. Recorded
   2026-08-27 (Sprint S1.6); severity escalated under Known issue 9. Real endorsements are
   owner input.

3. **Unverified community stats: "340+ Members, 18 Countries".**
   `src/app/community/page.tsx` (lines 4–5) claims these numbers; no source verifies
   them. Owner must confirm real figures or remove the claim (Known issue 9).

4. **Guest Preview banner is date-sensitive: "until 31 August".** — **CLOSED: banner
   REMOVED 2026-09-01 (Sprint S5.1b, owner decision D-32).**
   ~~The home-page banner (`src/app/page.tsx`, top of page) says "This private preview is
   available to selected guests until 31 August." — it expires 31 August 2026.~~
   ~~what happens then is Open decision D-10 (Known issue 12)~~ **D-10 was RESOLVED
   2026-08-25** (owner: the banner expires on its own date as originally designed — no code
   change; Known issue 12 closed on that basis). The date stayed flagged, not locked; this
   note was synchronized 2026-08-26 (stage-gate Round 4, Finding 5). The preview period
   ended on its own date; the band was deleted for launch under D-32.
