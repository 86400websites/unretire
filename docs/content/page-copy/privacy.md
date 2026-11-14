# Privacy page (`/privacy`) — frozen approved copy

- **Source:** `src/app/privacy/page.tsx`, rendered through the shared shell `src/app/LegalPage.tsx`
- **Extracted:** 2026-11-13 (Sprint S6.1), on branch `claude/s6.1-webinar-funnel` (cut from `origin/master` 7b754f5)
- **Status:** Sections 1 to 12 are the approved baseline (shipped site — per the retrofit content policy in `docs/content/README.md`). Section 13 records the three additions the owner approved on 2026-11-14 (his words: "privacy ok"); they are now part of sections 2, 4 and 5 below and of the page.

Copy below is verbatim from the shipped page, in section order. JavaScript string escapes
are rendered as their display characters (`“` `”` → “ ”, `—` → —); the
apostrophes are the straight ones the page uses. A phrase in **bold** is bold on the page.
Lines marked **Note:** are record-keeping, not copy. The page has no images.

---

## 1. Page metadata

- Title: Privacy Policy
- Description: What (Un)Retire collects, why, who processes it, and how to have it removed.

> **Note:** the root layout adds ` · (Un)Retire` after the title (`src/app/layout.tsx:78`).

## 2. Page header

- Eyebrow: **Legal**
- H1: **Privacy Policy**
- Intro: This page explains what this site collects, why it needs it, and who else handles it. It is written to be read, not to be impressive.
- Date line: Last updated 14 November 2026

> **Note:** "Last updated" is fixed text in `src/app/LegalPage.tsx`; the date is the page's
> `updated` value.

## 3. Who we are

- Body: This site is operated by 86400 (“we”, “us”). You can reach us at info@unretireproject.com about anything on this page, including a request to see or delete what we hold about you.

## 4. What we collect, and why

- Body: We only collect what a specific feature needs. Nothing here is sold, and none of it is used for advertising.
- List (7 items, in this order):
  1. **If you create an account:** your email address and a password you choose. The password is stored by our authentication provider as a cryptographic hash — we never see it and cannot recover it.
  2. **If you buy the course or Premium:** a record that you own it, plus the customer and subscription identifiers our payment provider gives us. If you are already on our email list, we also add a tag there recording the purchase, so we stop sending you offers for something you own. **We never see or store your card details.**
  3. **If you join the newsletter, take the assessment, or download a free resource:** your email address, your first name if you give one, and a tag recording which of those it came from. The assessment also sends the scores you produced, so the results email can reflect them.
  4. **If you register for a webinar, or ask for the Toolkit on the webinar page:** your email address, your first name if you give one, and a tag recording which of the two you asked for. We then send you what you asked for and email you about that webinar: reminders before it, then the replay and an offer for our course.
  5. **If you use the contact, community or enterprise form:** whatever you type into it — typically your name, email, and message.
  6. **If you download the book or workbook as a Premium member:** a record that you did, so the one-per-person limit can be applied, and the name you enter, which is stamped into your copy.
  7. **Automatically:** ordinary web-server request logs kept by our hosting provider, including IP address and browser type. We use these for security and to keep the site working.

## 5. Who processes it for us

- Body: We use a small number of established providers. Each receives only what its job requires.
- List (7 items, in this order):
  1. **Supabase** — accounts, sign-in sessions, and the record of what you have access to.
  2. **Stripe** — payment processing. You are taken to Stripe's own page to pay, and your card details are handled entirely by them.
  3. **Mailchimp** — email lists and the messages we send you.
  4. **Formspree** — delivery of the contact, community and enterprise forms to our inbox.
  5. **YouTube** — lesson and preview videos are embedded from YouTube, which may set its own cookies when a video loads.
  6. **Zoom** — our webinars are held on Zoom. The link to join takes you to Zoom, a separate service that handles what you share there under its own privacy policy.
  7. **Vercel** — hosting and request logs.

## 6. Cookies

- Body paragraph 1: We do not use advertising or tracking cookies, and there is no analytics tracking on this site.
- Body paragraph 2: The cookies we do set are the ones that make signing in work — they keep you logged in between pages. Blocking them will prevent you from using an account. Embedded YouTube videos may set cookies of their own when you play one; those are governed by Google's policy, not ours.

> **Note (flagged — do NOT treat as locked):** "there is no analytics tracking on this site"
> is no longer accurate: the layout renders Vercel Analytics on every page
> (`src/app/layout.tsx:11` and `:121`). It is recorded here because it is what the shipped page
> says. The correction is `docs/PROJECT-STATUS.md` Known issue 63 and belongs to Sprint S6.2;
> section 13 below does not touch it.

## 7. How long we keep it

- Body paragraph 1: Account and purchase records are kept for as long as you have an account, because they are what give you access to something you paid for.
- Body paragraph 2: You can unsubscribe from any email using the link in it, which stops us sending you more. If you want your account and its data deleted entirely, email us and we will do it — note that this also ends access to anything you have bought.

## 8. Your choices

- Body paragraph 1: You can ask us what we hold about you, ask for it to be corrected, or ask for it to be deleted. Email info@unretireproject.com and we will respond.
- Body paragraph 2: Depending on where you live you may have further rights under local law. We will honour any request of this kind regardless of where you are.

## 9. Security

- Body paragraph 1: The site is served over HTTPS. Pages and files you have paid for are checked on our server on every request, not merely hidden in the interface. Card details never reach our systems.
- Body paragraph 2: No system is perfect. If you believe you have found a security problem, please email us rather than posting it publicly, and we will look at it quickly.

## 10. Children

- Body: This site is intended for adults planning or living their retirement. It is not directed at children, and we do not knowingly collect their information.

## 11. Changes

- Body: If we change this policy we will update the date below. If a change is significant, we will say so by email to anyone it affects.

> **Note:** the page says "the date below", but the date line sits above the sections
> (section 2). Recorded as shipped; not changed here.

## 12. Footer line

Questions about this page? Email [info@unretireproject.com](mailto:info@unretireproject.com). See also our [Terms](/terms).

---

## 13. Additions approved by the owner on 2026-11-14 (Sprint S6.1, Gate 0 item 10)

**Approved.** The owner chose to add these in Sprint S6.1 (`docs/PROJECT-STATUS.md` D-48). The builder
put the three sentences to him on 2026-11-14 and he replied "privacy ok". They are on the page
(`src/app/privacy/page.tsx`) with these words exactly, and in sections 2, 4 and 5 above. The item
numbers under "Where" are the numbers before the additions.

### (a) Webinar sign-ups — one new list item

- **Where:** section 4, "What we collect, and why" — a new list item between item 3 ("If you join the newsletter, …") and item 4 ("If you use the contact, community or enterprise form: …").
- **Approved copy:** **If you register for a webinar, or ask for the Toolkit on the webinar page:** your email address, your first name if you give one, and a tag recording which of the two you asked for. We then send you what you asked for and email you about that webinar: reminders before it, then the replay and an offer for our course.
- **Why:** the webinar page sends exactly these to Mailchimp (already named in section 5), and the nine webinar emails follow from the tag.

### (b) Zoom — one new list item

- **Where:** section 5, "Who processes it for us" — a new list item between item 5 (**YouTube**) and item 6 (**Vercel**).
- **Approved copy:** **Zoom** — our webinars are held on Zoom. The link to join takes you to Zoom, a separate service that handles what you share there under its own privacy policy.
- **Why:** "Join on Zoom" forwards the visitor from this site to the Zoom meeting.

### (c) Purchase tag — one new sentence

- **Where:** section 4, list item 2 ("If you buy the course or Premium: …") — a new sentence after "… our payment provider gives us." and before "**We never see or store your card details.**", which stays the item's last sentence.
- **Approved copy:** If you are already on our email list, we also add a tag there recording the purchase, so we stop sending you offers for something you own.
- **Why:** from S6.1 a course or Premium purchase adds the tag `purchased-course` to a buyer who is already in the list; it never adds anyone to the list.

### What changes with them

- **The date line (section 2):** "Last updated 30 August 2026" becomes "Last updated 14 November 2026", the day the owner approved them — section 11 promises a new date. If the pull request merges on a later day, the builder sets the date to the merge day before the merge.

> **Note (not part of this proposal):** three things on the page stay untrue or unsaid after
> (a) to (c). All three were on the site before S6.1 and belong to Known issue 63.
> First, the analytics sentence in section 6 (Sprint S6.2). Second, a Premium purchase adds
> the buyer to the email list as a subscriber and tags them `premium`, so the monthly letter
> can reach them (`src/app/api/stripe/webhook/route.ts`, `tagPremiumMember`); (c) does not
> describe that. Third, the older `/webinar` page also sends a last name and a country to
> Mailchimp when the visitor gives them (`src/app/api/webinar/route.ts:103-104` and its
> header comment); (a) describes the new webinar page only.
