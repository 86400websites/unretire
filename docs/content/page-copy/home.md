# Home page — frozen approved copy

- **Source:** `src/app/page.tsx`
- **Extracted:** 2026-08-25 (Sprint S1.1)
- **Status:** Approved baseline (shipped site — per the retrofit content policy in `docs/content/README.md`)

Copy below is verbatim from the shipped page, in section order. JSX entities are
rendered as their display characters. Lines marked **Note:** are record-keeping, not
copy. Decorative inline SVG icons (orange, `aria-hidden`) carry no alt text and are not
listed; the three content images and their alt text are.

---

## 1. Guest Preview banner — REMOVED 2026-09-01 (Sprint S5.1b, owner decision D-32)

> **Note:** date-sensitive — the preview ends 31 August 2026. ~~what happens then is Open
> decision **D-10**~~ **D-10 RESOLVED 2026-08-25**: the banner expires on its own date as
> originally designed — no code change (Known issue 12 closed). Do not treat the date as
> locked copy. *(Synchronized 2026-08-26, stage-gate Round 4 Finding 5.)*
> **REMOVED 2026-09-01 (D-32):** the preview period ended on its own date and the owner
> instructed the band be removed for launch. There was no code behind it — the band was
> static JSX with no gating logic — so deleting the markup deactivates it entirely.

~~**Welcome to the (Un)Retire Exclusive Guest Preview**~~

~~*This private preview is available to selected guests until 31 August.*~~

## 2. Fixed pill (bottom-right, fixed position) — REMOVED 2026-09-01 (Sprint S5.1b, owner decision D-32)

- ~~Link text: `← Half a Life` → href `/`~~ **Removed with the rest of the "Half a Life"
  chrome (D-32): this pill, the mobile-nav "← Back to Half a Life" link, the footer's
  "Part of Half a Life" pill, the plain-text "· Part of Half a Life" copyright suffix,
  and the share image's "part of Half a Life" caption. All three links pointed at `/` —
  this site's own home — a relic of when (Un)Retire lived under the Half a Life site.**

## 3. Hero

- Eyebrow: **Reboot. Don't Mute.**
- H1 (with line break):

  > The job ended.
  > You didn't.

- Bold subhead: **The title goes. The calendar empties. Nobody prepares you for that part.**
- Lede: Discover a book, a ten-module course, and a framework built for this — by Maher Kaddoura, who redefined his own retirement at 40.
- CTAs:
  - `Read the Book` → `/book` (primary, crimson)
  - `Take the 2-minute check` → `/assess` (outline)
  - `See what's in the course` → `/learn/course` (outline)
- Fine print: Prefer to look around first? [Watch the course introduction](https://youtu.be/6cUHqODZJ28) — 3 minutes, no email needed. *(external link, new tab)*
- Image: `/assets/unretire/images/homepage/hero.png` — alt: **"Stepping through retirement toward a new path — reboot, don't mute"**

## 4. Signature quote

> "Aging is inevitable. Diminishing is optional."

- Attribution: **— Maher Kaddoura**

## 5. The Framework

- Eyebrow: **What It's About**
- H2: **A Practical Way to Live Fully — at Any Age**
- Body paragraph 1: Most books about retirement tell you how to *slow down*. This one shows you how to *wake up*.
- Body paragraph 2: The (Un)Retire framework is built on one simple equation: **Mindset × Practice.**
- Body paragraph 3: Five mindsets to change how you think. Seven practices to change what you do. Together they turn the empty calendar into a blank canvas — not time to fill, but a life to design.
- CTA: `Download the Free 14-Day Starter Plan` → `/practice#tools` (primary, crimson)
- Image: `/assets/unretire/diagrams/mindset-practice-loop.png` — alt: **"The Mindset × Practice framework — five mindsets and seven practices"**

## 6. Who Is It For

- Eyebrow: **Who Is It For**
- H2: **Who this is for**
- Body: UnRetire isn't about fading quietly. It's about what you do next. Write your next chapter.
- CTA: `Check out the Book` → `/book` (outline)
- Image: `/assets/unretire/images/homepage/who-is-it-for.png` — alt: **"People living a fuller next chapter — painting, staying active, connecting"**
- Checklist card (5 items, each with a decorative orange check icon):
  1. Your job title disappeared. You didn't.
  2. You still feel useful. You just don't know how.
  3. The freedom was wonderful for about a month.
  4. Money's tighter than expected.
  5. You're tired of being told to take it easy.

## 7. Here's What You Pay For

- Eyebrow: **Simple pricing**
- H2: **Here's What You Pay For**

### Card 1 — Course

- H3: **The Course — $99, once.**
- Body: Ten modules. Thirty-one lessons. A short video and a downloadable workbook for each module. It moves from an honest look at where you are now, through purpose, health, relationships, growth, money and contribution, and finishes with a written 90-day plan. Work at your own pace. Yours to keep and to come back to.

  > **Note (flagged):** "Thirty-one lessons" contradicts the course page ("forty-eight
  > lessons") and `courseData.ts` (totals 48). See `docs/content/locked-facts.md`,
  > Flagged item 1 — do NOT treat "Thirty-one" as locked; the fix awaits an
  > owner-approved content change.

- Link: `See the ten modules →` → `/learn/course`

### Card 2 — Premium

- H3: **Premium — $199 a year.**
- Body: Everything in the course, plus the book and the workbook in electronic form, a letter from Maher once a month, and the full practice toolkit — which keeps growing for as long as you're a member.
- Link: `What's in Premium →` → `/premium`

### Section footer line

Start free. The 2-minute check costs nothing and asks for nothing.

## 8. Four ways to engage

- Eyebrow: **Four ways to begin**
- H2: **Choose where you start**
- Cards (each is a link card with a decorative icon):

| Card title | Description | Href | CTA |
|---|---|---|---|
| Assess | Eight questions, two minutes, no signup. See which parts have gone quiet. | `/assess` | Start the check → |
| Learn | The book, the ten-module course, and honest conversations about life after work. | `/learn` | See the course → |
| Practice | The 5 Mindsets, the 7 Practices, the 14-Day Starter Plan. | `/practice` | Get the free plan → |
| Stories | People who refused to fade. | `/stories` | Read them → |

## 9. Email capture band

Shared component `EmailCaptureBand` (`src/app/EmailCaptureBand.tsx`), rendered with
`showFaq` and these page-level props:

- Heading: **Begin Your Next Chapter**
- Blurb: The best chapter of your life hasn't been written yet. Get the free 14-Day Starter Plan and a weekly note on living fully — at any age.

> **Note:** the band's internal copy (form labels, button, FAQ) lives in
> `src/app/EmailCaptureBand.tsx` and is not duplicated here; it gets extracted in the
> sprint that first touches that component.

## 10. Closing band (navy)

- Lead-in: Take a moment. Ask yourself, honestly:
- Question 1 (bold): **Where have I started muting myself?**
- Question 2 (bold): **What part of me is still awake, asking for more?**
- Closing line (italic): *You don't need the answers yet. Just the courage to ask.*
