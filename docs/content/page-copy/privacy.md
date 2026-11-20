# Privacy page (`/privacy`) — frozen approved copy

- **Source:** `src/app/privacy/page.tsx`, rendered through the shared shell `src/app/LegalPage.tsx`
- **Extracted:** 2026-11-13 (Sprint S6.1), on branch `claude/s6.1-webinar-funnel` (cut from `origin/master` 7b754f5)
- **Status:** Sections 1 to 12 are the approved baseline (shipped site — per the retrofit content policy in `docs/content/README.md`). Section 13 records the three additions the owner approved on 2026-11-14 (his words: "privacy ok"); they are now part of sections 2, 4 and 5 below and of the page. Section 14 holds the Sprint S6.2 proposals (the analytics sentence, the rest of Known issue 63, and the site's own abuse limit and database), NEW — waiting for the owner's approval at Gate B; nothing in it is on the page yet.

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
> **Sprint S6.2:** the proposed correction is section 14 (a) below.

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

---

## 14. Proposed additions — Sprint S6.2 (NEW — needs owner approval at Gate B)

**Not approved yet.** Drafted 2026-11-20 (Sprint S6.2, `docs/sprint-prompts/S6.2-webinar-report.md` step 3).
They close the rest of `docs/PROJECT-STATUS.md` Known issue 63: the analytics sentence, a Premium purchase
adding the buyer to the email list, and the older `/webinar` page's extra fields. (f) and (g), added after the
S6.2 review of 2026-11-20, say what the page never said about the site's own abuse limit and database. Every claim was checked
against the code named under **Why**, and the Vercel Web Analytics claims against Vercel's own pages, read on
2026-11-20. `src/app/privacy/page.tsx` changes only after the owner approves these words. The item numbers
under "Where" are the numbers on the page today.

### (a) Cookies — the analytics sentence (replaces section 6, paragraph 1)

- **Where:** section 6, "Cookies" — replaces paragraph 1, "We do not use advertising or tracking cookies, and there is no analytics tracking on this site." Paragraph 2 stays as it is, after the three paragraphs below.
- **Proposed copy (NEW — needs owner approval), three paragraphs:**
  1. We do not use advertising or tracking cookies. We do count visits, in two ways that set no cookie.
  2. First, Vercel Web Analytics, a tool of our hosting provider, counts page views across the site: the page, the site that sent you there, your browser and operating system, your type of device and your rough location. It recognises a returning visitor for one day only, and its counts are not tied to your name, your email address or your IP address.
  3. Second, on our webinar page we count each visit and note which site or app sent you there, LinkedIn or Instagram for example, so we can see which platforms bring people to the page. Your browser tab remembers that the visit was counted until you close it, so a reload is not counted twice. If you then register or ask for the Toolkit, we keep a scrambled code made from your email address, so each person is counted once. The code is made with a secret key that stays on our server, and we keep it only with the webinar it belongs to, the site or app that sent you when you first signed up, and when you signed up and registered — never with your address.
- **Why:**
  - Vercel Web Analytics is on every page (`src/app/layout.tsx:11` and `:121`, a plain `<Analytics />`). Vercel's overview, https://vercel.com/docs/analytics: "Web Analytics only stores anonymized data and does not use cookies"; "visitors are identified by a hash created from the incoming request"; "The generated hash is valid for a single day, at which point it is automatically reset." Vercel's Privacy and Compliance page, https://vercel.com/docs/analytics/privacy-policy, lists what is stored with each data point (time, URL, path, referrer, filtered query parameters, location to city level, operating system, browser, device type, script version) and says the data is not "tied to or associated with any individual, customer, or IP address".
  - The sign-up page's own counting: `src/app/conversation/ArrivalCounter.tsx` and `src/app/conversation/tab-source.ts` (one count per browser tab, remembered in the tab's sessionStorage — no cookie); `src/app/api/conversation/arrival/route.ts` and `src/lib/webinar/report-store.ts` (stored with the count: the campaign, the site or app, the time — never an IP address, browser details or the address of the page; the visit first passes the site's abuse limit, which is (f) below). The scrambled code: `personCode` in `src/lib/webinar/report-store.ts`, a keyed one-way hash (HMAC-SHA256 with `REPORT_SECRET`, which stays on the server); migration `supabase/migrations/0005_campaign_report.sql` stores the code with the campaign, the source of the person's first accepted sign-up (either form — the key their tab remembered then), the first sign-up time and the first registration time (`campaign_people`: `campaign`, `person`, `source`, `created_at`, `registered_at`), never the address. "Our webinar page" is the name section 4, item 4 already uses for `/conversation`; the older page is "our older webinar page" in (e), and it has no counter. "Never with your address" is the honest claim, not "cannot be turned back": whoever holds the key and an address can make that address's code again, which is how a returning person is recognised.
  - "set no cookie" covers visitors. The private `/report` page sets one sign-in cookie for the owner's team only; paragraph 2's "the cookies we do set are the ones that make signing in work" already describes that kind of cookie.
- **Note:** Vercel describes Web Analytics, not its whole platform: its platform-wide privacy notice (https://vercel.com/legal/privacy-notice) says it collects visitors' IP addresses with ordinary traffic. That is the request logging the page already describes in section 4, item 7, and in section 5's Vercel item.

### (b) Who processes it — Vercel (section 5, item 7)

- **Where:** section 5, "Who processes it for us" — the **Vercel** item.
- **Today:** **Vercel** — hosting and request logs.
- **Proposed copy (NEW — needs owner approval):** **Vercel** — hosting, request logs and page-view counts (Vercel Web Analytics).
- **Why:** as (a).

### (c) What we collect — the webinar sign-up page (new item after section 4, item 4)

- **Where:** section 4, "What we collect, and why" — a new list item after item 4 ("If you register for a webinar, …") and before item 5 ("If you use the contact, community or enterprise form: …").
- **Proposed copy (NEW — needs owner approval):** **If you visit our webinar page:** a count of your visit and the site or app that sent you there; the count itself holds nothing that identifies you. If you register or ask for the Toolkit there, also the scrambled code described under Cookies.
- **Why:** as (a). "The count itself" because the visit also passes the abuse limit of item 7, which (f) describes.

### (d) What we collect — a Premium purchase (section 4, item 2)

- **Where:** section 4, item 2 ("If you buy the course or Premium: …") — a new sentence after "… so we stop sending you offers for something you own." and before "**We never see or store your card details.**", which stays the item's last sentence.
- **Proposed copy (NEW — needs owner approval):** If you buy Premium, we also add you to our email list if you are not on it already, and tag you there as a Premium member so our Premium emails reach you. If you unsubscribed before, this does not subscribe you again.
- **Why:** `tagPremiumMember` in `src/app/api/stripe/webhook/route.ts` (called for a Premium purchase only, after the paid grant): a Mailchimp upsert with `status_if_new: "subscribed"` — which sets the status of a NEW contact only, so an existing unsubscribed contact keeps its status — then the tag `premium`.

### (e) What we collect — the older webinar page (section 4, item 4)

- **Where:** section 4, item 4 ("If you register for a webinar, or ask for the Toolkit on the webinar page: …") — a new last sentence.
- **Proposed copy (NEW — needs owner approval):** Our older webinar page also asks for your last name and your country.
- **Why:** `src/app/webinar/WebinarForm.tsx` sends `lastName` (optional) and `country` (a list that starts on South Africa); `src/app/api/webinar/route.ts` passes them to Mailchimp as the merge fields LNAME and COUNTRY.

### (f) What we collect — automatically: the abuse limit (section 4, item 7)

- **Where:** section 4, item 7 ("**Automatically:** ordinary web-server request logs kept by our hosting provider, …") — a new last sentence.
- **Proposed copy (NEW — needs owner approval):** To stop abuse, our site also keeps a scrambled form of your IP address when you send most of our forms or open our webinar page, so it can limit how often the same connection does that. It is deleted automatically the next time someone uses one of those forms or that page, ten minutes or more later.
- **Why:** `src/lib/rate-limit.ts` (`bucketFor`: an unkeyed SHA-256 of the endpoint name and the IP address, stored in `rate_limits`, migration `0003`) runs for the contact, community and enterprise forms (`/api/form`), the email sign-ups — newsletter, assessment and free downloads (`/api/subscribe`) — the webinar sign-ups on `/conversation` (`/api/conversation`) and, new in S6.2, each counted visit to that page (`/api/conversation/arrival`), plus the report's own password and reset routes (list them with `grep -rn "checkRateLimit(" src`). "Most": the older `/webinar` form (`/api/webinar`), the account forms (create account, log in, forgot password — `src/app/auth/actions.ts`) and the signed-in members' routes do not use it. **When rows go:** each ACCEPTED request to a rate-limited route deletes every route's rows that started more than ten of the calling route's windows earlier — about ten minutes when one of the public 60-second routes is used (`sweepExpired`, called only after a request is let through). Page views, a refused (429) request and the routes without the limiter delete nothing, so on a quiet site the rows stay until someone uses one of those forms or the page; no schedule deletes them. Hence the copy states the rule, not a period. Re-check this sentence when `docs/PROJECT-STATUS.md` Known issue 71's fix changes the cutoff. Not new in S6.2 for the forms — the page has never said it — but S6.2 is the first to do it for someone who only opens a page (found by the S6.2 review, 2026-11-20).

### (g) Who processes it — Supabase (section 5, item 1)

- **Where:** section 5, "Who processes it for us" — the **Supabase** item.
- **Today:** **Supabase** — accounts, sign-in sessions, and the record of what you have access to.
- **Proposed copy (NEW — needs owner approval):** **Supabase** — accounts, sign-in sessions, the record of what you have access to and of your Premium downloads, our webinar counts and the scrambled sign-up codes, and the abuse limit.
- **Why:** the webinar counts and codes are in Supabase (migration `0005`: `campaign_visits`, `campaign_people`); the abuse limit is (f) (`rate_limits`, migration `0003`); the Premium downloads record is section 4, item 6 (`book_downloads`, migration `0002`), which this item has never named.

### What changes with them

- **The date line (section 2):** "Last updated 14 November 2026" becomes the day the S6.2 pull request merges — section 11 promises a new date. The builder sets it just before the merge.
- **Nothing about how long the counts are kept** is proposed: no code deletes them on a schedule, so the page promises no period.
