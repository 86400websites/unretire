# Conversation page (`/conversation`) — approved copy (approved by the owner on 2026-11-13, Gate A, Sprint S6.1)

- **Source:** `docs/content/Emails.docx` (the owner's nine emails, 2026-11-13) · `docs/content/locked-facts.md` · shipped strings cited by file:line on branch `claude/s6.1-webinar-funnel` (cut from `origin/master` 7b754f5)
- **Drafted:** 2026-11-13 (Sprint S6.1)
- **Status:** APPROVED by the owner on 2026-11-13 (Gate A), as written. His reply: *"all recommended - except for: 9. Its fine - dont worry about the email content - they will bechnaged later to fit the actual webinar 10. same 11. same (for offer) 12. ok no worries - and theres less chances that they will use different emails right? so lets not complicate 13. yes mailchimp default rest recommended"*. His exceptions, 9 to 13, are about the emails, not this page. The rows whose Source is `NEW — needs owner approval` were put to him as new page wording to approve or edit, and he approved them unchanged; the label stays in the Source column as the record that those strings had no earlier source. Nothing else in this file changed on approval.

Covers `/conversation`, `/conversation/replay`, the calendar event, and the messages
`POST /api/conversation` returns. Copy is in page order. Lines marked **Note:** are
record-keeping, not copy.

**How to read a row.** Every string sits in a table with a Source column holding exactly one of:

- `Emails.docx — Email N` — a sentence or button label taken character for character from that email (curly quotes and apostrophes included).
- `shipped — path:line` — a string already live on the site, character for character.
- `locked-facts.md:line` — the exact wording of a locked fact.
- `NEW — needs owner approval` — written for this page; no approved source exists.

**Tokens.** Per-webinar words are never typed. The page renders them from the Vercel values;
this file writes them as tokens. The right-hand column quotes the owner's sample wording from
the emails for the record only — it is never page text.

| Token | Rendered from | Owner's sample wording (record only) |
|---|---|---|
| `{weekday}` | `WEBINAR_STARTS_AT` | "Thursday" |
| `{date}` | `WEBINAR_STARTS_AT` — day and month | "10 December" |
| `{time}` | `WEBINAR_STARTS_AT` — 24-hour clock | the owner left this as his own blank, "[time]", in every email |
| `{offer deadline}` | `WEBINAR_OFFER_ENDS_AT` — `{weekday} {date} at {time} SAST` of that value | "Thursday 17 December at midnight" (Email 7) |
| `{offer code}` | `WEBINAR_OFFER_CODE` | not written in any email |
| `{site}` | the site's own address | — (an address, not copy) |

> **Note (brand):** the emails write "UnRetire" ("The UnRetire team", "the UnRetire website").
> Pages use the locked "(Un)Retire" (`locked-facts.md:10`). No email sentence used below
> contains the brand name, so no owner sentence was altered; the locked form appears only in
> strings that already carry it (the title suffix, the Open Graph site name, the course name,
> the coming-soon text).

> **Note (apostrophes):** email sentences keep the owner's curly marks (’ “ ”); shipped
> strings keep the straight marks (') the site uses. NEW strings follow the emails.

> **Note (session length):** "60 minutes", "one hour" and "this hour" in the owner's sentences
> below must agree with the session length held in `src/lib/webinar/config.ts`. Changing the
> length is a small developer change that touches these rows too.

---

## 1. Page metadata

| Element | Copy | Source | Note |
|---|---|---|---|
| `/conversation` — title | When Work No Longer Defines You, What Does? | Emails.docx — Email 1 | The root layout adds ` · (Un)Retire` after it (`src/app/layout.tsx:78`). The same title is in Emails 2 and 3. |
| `/conversation` — description | One hour to work out what defines you once work no longer does. Retired, nearly there, restructured, sold up or moved sideways, this hour is for you. | Emails.docx — Email 4 | One whole paragraph, unchanged. |
| `/conversation` — Open Graph title | When Work No Longer Defines You, What Does? | Emails.docx — Email 1 | |
| `/conversation` — Open Graph description | One hour to work out what defines you once work no longer does. Retired, nearly there, restructured, sold up or moved sideways, this hour is for you. | Emails.docx — Email 4 | |
| Open Graph site name (both pages) | (Un)Retire | locked-facts.md:10 | Already set site-wide at `src/app/layout.tsx:87`. |
| `/conversation/replay` — title | Watch the replay | Emails.docx — Email 7 | The button label in the email. The root layout adds ` · (Un)Retire`. |
| `/conversation/replay` — description and Open Graph description | Thank you for joining us. If you couldn’t make it, the full hour is here. | Emails.docx — Email 7 | |

> **Note:** no new share image and no image alt text. Both pages use the site's existing
> share image (`src/app/opengraph-image.png`).

## 2. Hero

| Element | Copy | Source | Note |
|---|---|---|---|
| Eyebrow | Free webinar | NEW — needs owner approval | The two words come from Email 2 ("our free webinar"); as a stand-alone label it is new. |
| H1 (the page's only one) | When Work No Longer Defines You, What Does? | Emails.docx — Email 1 | |
| Detail line (date · time · length) | {weekday} {date} · {time} SAST · 60 minutes, plus 10 optional minutes of questions | Emails.docx — Email 1 | Original: "Thursday 10 December · [time] SAST · 60 minutes, plus 10 optional minutes of questions". Emails 2 and 3 word the length differently — see Gate A question 9 in `docs/content/email-copy/conv1.md`. |
| Time-zone label | SAST | Emails.docx — Email 1 | A fixed label kept beside the display time zone in config. It is not computed. |
| Button | Save my seat | Emails.docx — Email 2 | Goes to the register form on the same page (section 7). Not shown once registration has closed. |

## 3. The problem

| Element | Copy | Source | Note |
|---|---|---|---|
| H2 | You stopped working. So why do you feel like you stopped mattering? | Emails.docx — Email 3 | The email's subject line. |
| Paragraph 1 | For years, your work told you who you were. | Emails.docx — Email 3 | |
| Paragraph 2 | Your title opened doors. People wanted your opinion. Your diary was full and your phone kept ringing. | Emails.docx — Email 3 | |
| Paragraph 3 | Then you retired, your role was restructured or you sold the business. The calls slowed down. And quietly, it started to feel as if you mattered less too. | Emails.docx — Email 3 | |
| Paragraph 4 | Someone asks “So, what do you do?” and you pause before you answer. | Emails.docx — Email 2 | The second sentence of its paragraph. The first ("If you asked for it, …") is about the Toolkit email and is not used. |
| Paragraph 5 | That pause is what our free webinar is about. | Emails.docx — Email 2 | |
| Paragraph 6 | On {weekday} we look at where your worth really comes from, and how to say who you are now without reaching for your old title. | Emails.docx — Email 3 | Original: "On Thursday we look at …". |

## 4. You'll leave with

| Element | Copy | Source | Note |
|---|---|---|---|
| H2 | You’ll leave with: | Emails.docx — Email 2 | Identical in Email 3. The colon is the owner's. |
| List item 1 | an answer to “what do you do?” that doesn’t start with “I used to” | Emails.docx — Email 2 | Lower-case first letter and no full stop, as written. |
| List item 2 | where your skills still meet a real need | Emails.docx — Email 2 | |
| List item 3 | one first step you can take this week | Emails.docx — Email 2 | |

## 5. Who it is for

| Element | Copy | Source | Note |
|---|---|---|---|
| H2 | Who this is for | shipped — src/app/page.tsx:240 | The home page's own heading (`docs/content/page-copy/home.md`, section 6). |
| Body | Retired, nearly there, restructured, sold up or moved sideways, this hour is for you. | Emails.docx — Email 4 | |

## 6. How the hour runs

| Element | Copy | Source | Note |
|---|---|---|---|
| H2 | How the hour runs | NEW — needs owner approval | No email has a heading for this. |
| Line 1 | Keep a pen and paper handy. | Emails.docx — Email 1 | Emails 4 and 5 say "a pen and two sheets of paper" — Gate A question 10. |
| Line 2 | Microphones stay off, the chat is where we talk, and taking part is up to you. | Emails.docx — Email 1 | The next sentence in the email, about a workbook, is left out (section 16). |
| Line 3 | Registration closes when we go live on {weekday}. | Emails.docx — Email 3 | Original: "… when we go live on Thursday." |

## 7. Both forms — shared strings

| Element | Copy | Source | Note |
|---|---|---|---|
| Field 1 label (and placeholder) | First name | shipped — src/app/DownloadGate.tsx:106 | Placeholder is the same string (`:113`). |
| Field 2 label (and placeholder) | Email address | shipped — src/app/DownloadGate.tsx:117 | Placeholder is the same string (`:125`). |
| Button while sending (both forms) | Sending… | shipped — src/app/DownloadGate.tsx:133 | The button is disabled while this shows. |
| Consent line under each form (the same line under both) | We’ll email you about this webinar: reminders before it, then the replay and an offer for our course. Unsubscribe anytime. | NEW — needs owner approval | Must cover Emails 3–6 (reminders) and Emails 7–9 (replay and offer). "Unsubscribe anytime." echoes the shipped "No spam. Unsubscribe anytime." (`src/app/DownloadGate.tsx:140`). |

> **Note:** the hidden anti-spam field has no visible text and no label; it is hidden from
> screen readers and from the keyboard.

## 8. Register form

| Element | Copy | Source | Note |
|---|---|---|---|
| H2 | This hour is for you. | Emails.docx — Email 1 | |
| Line under the heading | {weekday} {date} · {time} SAST · free · 60 minutes | Emails.docx — Email 3 | Original: "Thursday 10 December · [time] SAST · free · 60 minutes". |
| Button | Save my seat | Emails.docx — Email 2 | |

## 9. Toolkit form

| Element | Copy | Source | Note |
|---|---|---|---|
| Eyebrow | Free — sent by email | shipped — src/app/DownloadGate.tsx:99 | |
| H2 | Get the Practice Toolkit | shipped — src/app/tools/page.tsx:59 | "Practice Toolkit" is the locked name (`locked-facts.md:23`). The emails say only "Toolkit"; this row assumes they mean the same thing — Gate A question 3. |
| Blurb | 28 small experiments across the seven practices — one a week for half a year. No pressure. Just forward motion. | shipped — src/app/tools/page.tsx:24 | The Toolkit card's own description on `/tools`. |
| Button | Email it to me | shipped — src/app/DownloadGate.tsx:133 | |

## 10. Validation and error messages

Shown under the form that was submitted, in a visible message (never colour alone).

| When | Copy | Source | Note |
|---|---|---|---|
| First name left empty | Please enter your first name. | NEW — needs owner approval | Used only if the form requires a first name. |
| Email left empty, or not an email address (checked in the browser and again by the server, 400) | A valid email address is required | shipped — src/lib/forms/subscribe-payload.ts:90 | No full stop, as shipped. Reaches visitors today through `src/app/api/subscribe/route.ts:69`. |
| The email service says the address cannot be right (400) — the "check your email address" message | Please check your email address and try again. | NEW — needs owner approval | |
| Too many tries in a short time (429) | Too many requests. Please wait a moment and try again. | shipped — src/lib/rate-limit.ts:162 | |
| The sign-up could not be completed (502) | We could not sign you up just now. Please try again. | shipped — src/app/api/subscribe/route.ts:40 | The one fixed message for every upstream failure, on both forms. |
| The browser got no usable answer (offline, or an unreadable reply) | Something went wrong. Please try again. | shipped — src/app/DownloadGate.tsx:49 | |
| A request the server cannot read or accept (400) | Invalid request | shipped — src/app/api/subscribe/route.ts:60 | Also the answer to a filled anti-spam field. |
| Email too long (400) | Email is too long | shipped — src/lib/forms/subscribe-payload.ts:93 | |
| First name too long (400) | Name is too long | shipped — src/lib/forms/subscribe-payload.ts:99 | |

> **Note:** a request that arrives after registration has closed (409) gets the closed text in
> section 13.

## 11. Thank-you — after saving a seat

### 11a. The address can be emailed

| Element | Copy | Source | Note |
|---|---|---|---|
| Heading | Your seat is saved. | Emails.docx — Email 1 | |
| Title line | When Work No Longer Defines You, What Does? | Emails.docx — Email 1 | |
| Detail line | {weekday} {date} · {time} SAST · 60 minutes, plus 10 optional minutes of questions | Emails.docx — Email 1 | Same string as the hero. |
| Join button | Join on Zoom | Emails.docx — Email 1 | → `/conversation/join`. The Zoom address itself is never on the page. |
| Calendar link — file (.ics) | Add to calendar | Emails.docx — Email 1 | → `/conversation/calendar.ics` |
| Calendar link — Google Calendar | Add to Google Calendar | NEW — needs owner approval | Opens Google Calendar with the event filled in. |
| "Save this now" line | Put it in your diary now. This hour is for you. | Emails.docx — Email 1 | |
| Inbox line | Check your inbox | shipped — src/app/DownloadGate.tsx:91 | |

### 11b. The address cannot be emailed

Everything in 11a except the last two rows, which are replaced by this one line:

| Element | Copy | Source | Note |
|---|---|---|---|
| "Save this now" line | We can’t send email to this address, so you won’t get a confirmation or reminders. Save the link below and add the hour to your calendar now. | NEW — needs owner approval | Shown when the address has unsubscribed, has bounced, or cannot be added. No "Check your inbox". |

> **Note (placement, 2026-11-14):** on the page this line sits **above** the Join button and the
> two calendar links, not in the place of the two rows it replaces — it says "the link below",
> so the links have to come after it. The words are unchanged.

## 12. Toolkit sent — after asking for the Toolkit

### 12a. The address can be emailed

| Element | Copy | Source | Note |
|---|---|---|---|
| Eyebrow | You're in | shipped — src/app/DownloadGate.tsx:90 | |
| Heading | Check your inbox | shipped — src/app/DownloadGate.tsx:91 | |
| Body | ✓ Your Practice Toolkit is on its way to your inbox. If you don't see it in a few minutes, check your spam or promotions folder. | shipped — src/app/DownloadGate.tsx:93 | The shipped sentence with its item filled as "Practice Toolkit" (`src/app/tools/page.tsx:58`) — exactly what `/tools` shows today. What arrives is Email 2, whose link opens `/tools` — Gate A question 3. |
| Line leading to the register form | Plus one free hour that takes it further. | Emails.docx — Email 2 | The email's preview text. |
| Link after that line | Save my seat | Emails.docx — Email 2 | Goes to the register form (section 8). |

### 12b. The address cannot be emailed

| Element | Copy | Source | Note |
|---|---|---|---|
| Body | We can’t send email to this address, so we can’t send the Toolkit. Please try a different email address. | NEW — needs owner approval | Replaces all of 12a. |

## 13. Registration closed — from the moment the webinar starts

Both forms are replaced by this text and its links. The hero button is not shown.

| Element | Copy | Source | Note |
|---|---|---|---|
| Closed text (also the 409 message) | Registration for this webinar has closed. | NEW — needs owner approval | The emails only say when registration closes (section 6, line 3), not what the page says afterwards. |
| Link 1 | Get the Practice Toolkit | shipped — src/app/tools/page.tsx:59 | → `/tools` |
| Link 2 — shown only once a replay address is set | Watch the replay | Emails.docx — Email 7 | → `/conversation/replay` |

## 14. Replay page (`/conversation/replay`)

### 14a. In every state

| Element | Copy | Source | Note |
|---|---|---|---|
| H1 (the page's only one) | When Work No Longer Defines You, What Does? | Emails.docx — Email 1 | |

### 14b. Coming soon — no replay address set yet

| Element | Copy | Source | Note |
|---|---|---|---|
| Eyebrow | Coming Soon | shipped — src/app/ComingSoon.tsx:18 | |
| Body | We're putting this part of the (Un)Retire experience together. Check back soon — or explore what's already here. | shipped — src/app/ComingSoon.tsx:5 | The site's standard coming-soon text. |
| Link | Explore the Practice | shipped — src/app/ComingSoon.tsx:26 | → `/practice`, as the standard coming-soon block does. |

### 14c. Replay available

| Element | Copy | Source | Note |
|---|---|---|---|
| Intro | Thank you for joining us. If you couldn’t make it, the full hour is here. | Emails.docx — Email 7 | |
| Link to the recording | Watch the replay | Emails.docx — Email 7 | → the address in `WEBINAR_REPLAY_URL`, shown as a link, opened in a new tab. |

### 14d. Offer block — shown under the replay while the offer is open

Every fact in this block is a locked fact. The only other words are the owner's own heading,
his closing sentence with the deadline token, his button label, and one NEW line naming the code.

| Element | Copy | Source | Note |
|---|---|---|---|
| Heading | Ready to go further? | Emails.docx — Email 7 | |
| Course name | The (Un)Retire Course | shipped — src/app/learn/course/page.tsx:8 | The only course name used. The emails leave it as the blank "[Course name]". |
| Fact 1 | Ten modules | locked-facts.md:17 | |
| Fact 2 | forty-eight lessons | locked-facts.md:18 | |
| Price | $99 once. Yours to keep. | locked-facts.md:15 | |
| Code line — shown only when a code is set | Use code {offer code} at checkout. | NEW — needs owner approval | No email names a code or says what the offer is — Gate A question 4. |
| Deadline line | The offer closes {offer deadline}. | Emails.docx — Email 7 | Original: "The offer closes Thursday 17 December at midnight." The page shows the clock time from the Vercel value, not the word "midnight" — Gate A question 11. |
| Button | Join the course | Emails.docx — Email 7 | → `/learn/course` |

### 14e. Offer ended — shown in place of 14d after the deadline

| Element | Copy | Source | Note |
|---|---|---|---|
| Text | This offer has now closed. | NEW — needs owner approval | No code and no deadline are shown. |
| Link | The (Un)Retire Course | shipped — src/app/learn/course/page.tsx:8 | → `/learn/course` |

## 15. Calendar event (the `.ics` file and the Google Calendar link)

| Element | Copy | Source | Note |
|---|---|---|---|
| Summary (the event's name) | When Work No Longer Defines You, What Does? | Emails.docx — Email 1 | |
| Description, line 1 | One hour to work out what defines you once work no longer does. | Emails.docx — Email 4 | |
| Description, line 2 | Join on Zoom | Emails.docx — Email 1 | Followed on the next line by the address `{site}/conversation/join`. Never the Zoom address itself. |
| Description, line 3 | Keep a pen and paper handy. Microphones stay off, the chat is where we talk, and taking part is up to you. | Emails.docx — Email 1 | Two whole sentences; the workbook sentence that follows them is left out. |
| Location label | Zoom | NEW — needs owner approval | The word comes from "Join on Zoom". Used only if the location shows a word before the address `{site}/conversation/join`. |

> **Note:** start and end times come from the Vercel start value and the session length. The
> file name and any header value are plain ASCII (an em-dash in a header crashed a route in
> S5.1c); they are not copy.

## 16. Left out on purpose

Nothing below reaches the page. Each item has no approved content, or would be wrong on a
page that must work for any webinar date.

| Left out | Where it is in the emails | Why |
|---|---|---|
| A host line ("With …") | nowhere | No email names a host. Every email is signed "The UnRetire team". |
| The workbook | Email 1 "Your workbook arrives after the session."; Email 7 "[Download your workbook] Every exercise from the session, ready for you to work through at home." | No workbook file exists. Gate A question 1. |
| Any course name other than "The (Un)Retire Course" | Email 7 "[Course name]" and, in the preview, "[course name]" | The owner's own blank. The page uses the shipped name. |
| The one-line course description and the benefit list | Email 7 "[One line on what the course is.]", "[Benefit 1]", "[Benefit 2]", "[Benefit 3]" | The owner's own blanks. The offer block uses locked facts instead. |
| The weekly time commitment | Email 8 "[Time commitment per week.]" | The owner's own blank. |
| The replay "available until" line | Email 7 "Available until [date]." | The owner's own blank; the site holds no replay end date. |
| The research claim | Email 8 "Adults in their sixties to nineties who learned something new and demanding saw their memory improve. It was the stretching that made the difference." | No source on file. On a page it would become an unverified site claim. Gate A question 2. |
| The four question-and-answer pairs | Email 8 | They answer doubts about the course, not the webinar; one answer is a blank and one is the research claim. |
| Season and year-end wording | Email 3 "This festive season, someone will ask you, …"; Email 9 "At some point this festive season, at a year-end party, a family lunch or a New Year’s gathering, …" | Tied to one time of year. No Vercel value can change it. |
| "Tomorrow", "tonight", "one hour to go", "We’ve started." | Emails 4, 5, 6 and 9 | True only at the moment each email is sent. |
| The Starter Plan line | Email 7 "[Get your free 14-Day Starter Plan] Plus the two-minute check, on the UnRetire website." | Written for a reader outside the site; not needed for the replay page to work. |
| The sign-off | "The UnRetire team" | The page is not signed. |
| The Toolkit delivery sentence | Email 2 "Here’s your free Toolkit. Download it" | It belongs to the email that delivers the Toolkit. |
| The shipped Toolkit gate blurb | `src/app/tools/page.tsx:61` | It promises "a short series to help you put them to work", which this funnel does not send. |
| Anything from `/webinar` | `src/app/webinar/**` | Unapproved placeholder copy for a different event. |
