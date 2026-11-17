# Webinar emails (`conv1`) — paste sheet for Mailchimp (approved by the owner on 2026-11-13, Gate A, Sprint S6.1)

- **Source:** `docs/content/Emails.docx` (the owner's nine emails, 2026-11-13)
- **Drafted:** 2026-11-13 (Sprint S6.1)
- **Status:** APPROVED by the owner on 2026-11-13 (Gate A). The nine emails stay exactly as he wrote them; in his words, *"Its fine - dont worry about the email content - they will bechnaged later to fit the actual webinar"*. One blank was filled on his answer: the course's name in Email 7 is "The (Un)Retire Course". The emails are sent from the Mailchimp account's default sender. Every question put to him, with his answer, is under "Owner's answers (2026-11-13)" at the end. The PASTE VERSION blocks are what gets pasted into Mailchimp; every square bracket still in them is to be replaced before go-live.

> **Note (2026-11-14) — the bodies now come from the owner's HTML files.** On 2026-11-14 the owner gave the builder nine
> finished HTML email files, and those files are what goes into Mailchimp as the body of each email (runbook
> `docs/WEBINAR-FUNNEL.md` §5.0, §5.2 and §6). This sheet stays the source for the Mailchimp names, the
> subjects, the preview texts, the link addresses (the "Buttons and links" tables) and the send rules. The
> Body blocks of the PASTE VERSION are now the fallback route only (runbook §5.5), for the case where
> Mailchimp does not offer its "Code your own" option. Where a line in this file says the owner pastes the
> PASTE VERSION, read it together with this note. The HTML files differ from the PASTE VERSION bodies in
> places — most sample dates are not in square brackets, and the files add labels and footer lines — so the
> words to check before go-live on the HTML route are listed in runbook §9.5, not in the "Replace before
> go-live" tables below.

**What this file is.** The nine webinar emails, each shown twice: once exactly as the owner
wrote it (SOURCE), and once ready to paste into Mailchimp (PASTE VERSION). The owner pastes
the PASTE VERSION. Nobody rewrites his wording here: where something looks off it is listed
under "Owner's answers (2026-11-13)" at the end, with his answer, not changed.

**Links.** Every address in this file starts with the live site, `https://www.unretireproject.com`.
One Mailchimp audience serves the live site, the Preview and local work, so a Preview address
is never pasted into Mailchimp. The Zoom address itself never goes into an email: the join
button always points at `https://www.unretireproject.com/conversation/join`.

**How to read the two versions.**

- SOURCE is character for character from the document, including the curly quotes and
  apostrophes, the "·" separators, the capitals, the two spaces after "SENT", "WHAT IT DOES",
  "Subject:" and "Preview:", and the owner's own blanks such as "[time]". The top four lines of
  each block (the sequence title, the email's label, SENT and WHAT IT DOES) are the owner's
  notes; they are not part of the email.
- A line starting with "- " is a bullet in the document (Word draws the bullet; the hyphen is
  only how this file shows it). Make it a bulleted list in Mailchimp.
- In the document a button is written in square brackets, for example "[Join on Zoom]". In the
  PASTE VERSION a button is written as its label on one line and its full address on the next,
  with no brackets.
- In the PASTE VERSION every square bracket marks something to **replace or confirm before the
  email is sent**. Some are the owner's own blanks ("[time]"). The rest are words that are only
  right for one webinar, with the owner's sample wording kept inside ("[Thursday 10 December]",
  "[tomorrow]"). If the words inside are right, delete the two brackets and keep the words.
  A bracket left in a scheduled email fails the launch check.
- Apart from the brackets, the button layout, the workbook blank and the course's name in
  Email 7 (filled on the owner's answer of 2026-11-13), the PASTE VERSION is the SOURCE, unchanged.

## The nine emails at a glance

| Mailchimp name | What it is | Sent by | Goes to | Send rule — NEW — needs owner approval | The owner's own rule in Emails.docx |
|---|---|---|---|---|---|
| `conv1-01` | Email 1 · You’re in — confirms the seat and gives the Zoom link | Flow `conv1-01` (the owner builds it) | Anyone who gets the tag `conv1-registered` | At once, when the tag is added | "Right after they register" |
| `conv1-02` | Email 2 · Your free Toolkit — delivers the Toolkit and invites them to the webinar | Flow `conv1-02` (the owner builds it) | Anyone who gets the tag `conv1-toolkit` | At once, when the tag is added | "Right after they ask for the Toolkit" |
| `conv1-03` | Email 3 · Join us on Thursday — invites Toolkit people who haven’t registered yet | Scheduled email | Segment "Conv1 - Toolkit, not registered" | Start date − 3 days, at 10:00 | "Mon 7 Dec, 10:00" |
| `conv1-04` | Email 4 · See you tomorrow — reminds them the webinar is tomorrow | Scheduled email | Segment "Conv1 - Registered" | Start − 24 h | "Wed 9 Dec, at webinar time" |
| `conv1-05` | Email 5 · Starting in 1 hour — reminds them we start soon | Scheduled email | Segment "Conv1 - Registered" | Start − 1 h | "Thu 10 Dec, 1 hour before" |
| `conv1-06` | Email 6 · We’re live — tells them to join now | Scheduled email | Segment "Conv1 - Registered" | Start | "Thu 10 Dec, at the start" |
| `conv1-07` | Email 7 · Replay and offer — sends the replay, the free Starter Plan and the course offer | Scheduled email | Segment "Conv1 - Registered" | Start date + 1 day, at 09:00 | "Fri 11 Dec, 9:00" |
| `conv1-08` | Email 8 · Your questions, answered — answers doubts about the course | Scheduled email | Segment "Conv1 - Registered, not bought" | Start date + 4 days, at 09:00 | "Mon 14 Dec, 9:00" |
| `conv1-09` | Email 9 · Last day — says the offer ends tonight | Scheduled email | Segment "Conv1 - Registered, not bought" | Offer-end date, at 09:00 | "Thu 17 Dec, 9:00" |

> **Note (send rules):** all times are webinar local time (SAST). "Start" is the webinar's
> start. "Offer-end date" is the calendar day the offer closes. With the owner's sample dates
> (start Thursday 10 December, offer closing Thursday 17 December at midnight) the seven
> formulas give exactly the seven dates he wrote. The two flow emails have no formula: Mailchimp
> sends them when the tag is added.

> **Note (who is in each segment):** "Conv1 - Registered" = has the tag `conv1-registered`.
> "Conv1 - Toolkit, not registered" = has `conv1-toolkit` and does not have `conv1-registered`.
> "Conv1 - Registered, not bought" = has `conv1-registered` and has neither `purchased-course`
> nor `premium`.

> **Note (flow emails):** Emails 1 and 2 live inside the two flows. No script can read a flow,
> so their blanks are checked by eye before go-live.

---

## conv1-01 — Email 1 · You’re in

- **Mailchimp name:** `conv1-01` · **Sent by:** flow `conv1-01` · **Goes to:** anyone who gets the tag `conv1-registered` · **Send rule:** at once

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 1  ·  You’re in
SENT  Right after they register
WHAT IT DOES  Confirms their seat and gives the Zoom link

Subject:  You’re in. Thursday 10 December
Preview:  Your seat and your Zoom link.

Your seat is saved.
When Work No Longer Defines You, What Does?
Thursday 10 December · [time] SAST · 60 minutes, plus 10 optional minutes of questions
[Join on Zoom] · [Add to calendar]
Keep a pen and paper handy. Microphones stay off, the chat is where we talk, and taking part is up to you. Your workbook arrives after the session.
Put it in your diary now. This hour is for you.
The UnRetire team
```

Formatting in the document: bold — "Your seat is saved." and "[Join on Zoom]"; italic — the title line. No link is attached to either button.

### PASTE VERSION

Subject

```text
You’re in. [Thursday 10 December]
```

Preview text

```text
Your seat and your Zoom link.
```

Body

```text
Your seat is saved.
When Work No Longer Defines You, What Does?
[Thursday 10 December] · [time] SAST · [60 minutes, plus 10 optional minutes of questions]
Join on Zoom
https://www.unretireproject.com/conversation/join
Add to calendar
https://www.unretireproject.com/conversation/calendar.ics
Keep a pen and paper handy. Microphones stay off, the chat is where we talk, and taking part is up to you. [Your workbook arrives after the session.]
Put it in your diary now. [This hour] is for you.
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Join on Zoom | https://www.unretireproject.com/conversation/join | A button, "[Join on Zoom]"; no address given |
| Add to calendar | https://www.unretireproject.com/conversation/calendar.ics | A button, "[Add to calendar]", on the same line after " · "; no address given |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [Thursday 10 December] (subject and body) | The webinar's weekday, day and month | The Vercel value `WEBINAR_STARTS_AT` (Production). Easiest: copy the date from the live `/conversation` page. |
| [time] | The start time | The same value; copy the time from the live `/conversation` page. |
| [60 minutes, plus 10 optional minutes of questions] | How long the session runs | The session length the site is built with. If it has not changed, delete the brackets and keep the words. |
| [Your workbook arrives after the session.] | Keep the sentence only if a workbook will be sent; otherwise delete it | Your answer to Gate A question 1. |
| [This hour] | Keep if the session is still about an hour | The session length. If unchanged, delete the brackets and keep the words. |

---

## conv1-02 — Email 2 · Your free Toolkit

- **Mailchimp name:** `conv1-02` · **Sent by:** flow `conv1-02` · **Goes to:** anyone who gets the tag `conv1-toolkit` · **Send rule:** at once

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 2  ·  Your free Toolkit
SENT  Right after they ask for the Toolkit
WHAT IT DOES  Delivers the Toolkit and invites them to the webinar

Subject:  Your Toolkit is here
Preview:  Plus one free hour that takes it further.

Here’s your free Toolkit. Download it
If you asked for it, the question has probably started following you around. Someone asks “So, what do you do?” and you pause before you answer.
That pause is what our free webinar is about.
When Work No Longer Defines You, What Does?
Thursday 10 December · [time] SAST · 60 minutes on Zoom
You’ll leave with:
- an answer to “what do you do?” that doesn’t start with “I used to”
- where your skills still meet a real need
- one first step you can take this week
[Save my seat]
The UnRetire team
```

Formatting in the document: bold — "Here’s your free Toolkit.", the title line and "[Save my seat]"; italic — “So, what do you do?”; "Download it" is underlined and is a link to https://www.unretireproject.com/tools. No link is attached to the button.

### PASTE VERSION

Subject

```text
Your Toolkit is here
```

Preview text

```text
Plus [one free hour] that takes it further.
```

Body

```text
Here’s your free Toolkit. Download it
https://www.unretireproject.com/tools
If you asked for it, the question has probably started following you around. Someone asks “So, what do you do?” and you pause before you answer.
That pause is what our free webinar is about.
When Work No Longer Defines You, What Does?
[Thursday 10 December] · [time] SAST · [60 minutes] on Zoom
You’ll leave with:
- an answer to “what do you do?” that doesn’t start with “I used to”
- where your skills still meet a real need
- one first step you can take this week
Save my seat
https://www.unretireproject.com/conversation
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Download it | https://www.unretireproject.com/tools | A text link in the first line, exactly this address |
| Save my seat | https://www.unretireproject.com/conversation | A button, "[Save my seat]"; no address given |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [one free hour] (preview text) | Keep if the session is still about an hour | The session length. If unchanged, delete the brackets and keep the words. |
| [Thursday 10 December] | The webinar's weekday, day and month | The Vercel value `WEBINAR_STARTS_AT` (Production). Easiest: copy the date from the live `/conversation` page. |
| [time] | The start time | The same value; copy the time from the live `/conversation` page. |
| [60 minutes] | How long the session runs | The session length the site is built with. If unchanged, delete the brackets and keep the words. |

---

## conv1-03 — Email 3 · Join us on Thursday

- **Mailchimp name:** `conv1-03` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Toolkit, not registered" · **Send rule:** start date − 3 days, at 10:00

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 3  ·  Join us on Thursday
SENT  Mon 7 Dec, 10:00
WHAT IT DOES  Invites Toolkit people who haven’t registered yet

Subject:  You stopped working. So why do you feel like you stopped mattering?
Preview:  This Thursday’s free webinar is for you.

For years, your work told you who you were.
Your title opened doors. People wanted your opinion. Your diary was full and your phone kept ringing.
Then you retired, your role was restructured or you sold the business. The calls slowed down. And quietly, it started to feel as if you mattered less too.
This festive season, someone will ask you, “So, what do you do?” If you dread the answer, this hour is for you.
On Thursday we look at where your worth really comes from, and how to say who you are now without reaching for your old title.
You’ll leave with:
- an answer to “what do you do?” that doesn’t start with “I used to”
- where your skills still meet a real need
- one first step you can take this week
When Work No Longer Defines You, What Does?
Thursday 10 December · [time] SAST · free · 60 minutes
[Save my seat]
Registration closes when we go live on Thursday.
The UnRetire team
```

Formatting in the document: bold — "For years, your work told you who you were.", the title line and "[Save my seat]". No link is attached to the button.

### PASTE VERSION

Subject

```text
You stopped working. So why do you feel like you stopped mattering?
```

Preview text

```text
[This Thursday’s] free webinar is for you.
```

Body

```text
For years, your work told you who you were.
Your title opened doors. People wanted your opinion. Your diary was full and your phone kept ringing.
Then you retired, your role was restructured or you sold the business. The calls slowed down. And quietly, it started to feel as if you mattered less too.
[This festive season], someone will ask you, “So, what do you do?” If you dread the answer, [this hour] is for you.
On [Thursday] we look at where your worth really comes from, and how to say who you are now without reaching for your old title.
You’ll leave with:
- an answer to “what do you do?” that doesn’t start with “I used to”
- where your skills still meet a real need
- one first step you can take this week
When Work No Longer Defines You, What Does?
[Thursday 10 December] · [time] SAST · free · [60 minutes]
Save my seat
https://www.unretireproject.com/conversation
Registration closes when we go live on [Thursday].
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Save my seat | https://www.unretireproject.com/conversation | A button, "[Save my seat]"; no address given |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [This Thursday’s] (preview text) | "This" plus the webinar's weekday. Right only while the email is sent in the same week as the webinar | The Vercel value `WEBINAR_STARTS_AT` (Production) and this email's send date. |
| [This festive season] | Wording for the time of year the webinar falls in | Your own wording. If it is still right, delete the brackets and keep the words. |
| [this hour] | Keep if the session is still about an hour | The session length. If unchanged, delete the brackets and keep the words. |
| [Thursday] (twice in the body) | The webinar's weekday | The Vercel value `WEBINAR_STARTS_AT`; copy the weekday from the live `/conversation` page. |
| [Thursday 10 December] | The webinar's weekday, day and month | The same value; copy the date from the live `/conversation` page. |
| [time] | The start time | The same value; copy the time from the live `/conversation` page. |
| [60 minutes] | How long the session runs | The session length the site is built with. If unchanged, delete the brackets and keep the words. |

---

## conv1-04 — Email 4 · See you tomorrow

- **Mailchimp name:** `conv1-04` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Registered" · **Send rule:** start − 24 h

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 4  ·  See you tomorrow
SENT  Wed 9 Dec, at webinar time
WHAT IT DOES  Reminds them the webinar is tomorrow

Subject:  Tomorrow at [time]: what do you say now?
Preview:  Your Zoom link for tomorrow.

We go live tomorrow at [time].
One hour to work out what defines you once work no longer does. Retired, nearly there, restructured, sold up or moved sideways, this hour is for you.
[Join on Zoom]
Keep a pen and two sheets of paper nearby. That’s all you’ll need.
The UnRetire team
```

Formatting in the document: bold — "We go live tomorrow at [time]." and "[Join on Zoom]". No link is attached to the button.

### PASTE VERSION

Subject

```text
[Tomorrow] at [time]: what do you say now?
```

Preview text

```text
Your Zoom link for [tomorrow].
```

Body

```text
We go live [tomorrow] at [time].
[One hour] to work out what defines you once work no longer does. Retired, nearly there, restructured, sold up or moved sideways, [this hour] is for you.
Join on Zoom
https://www.unretireproject.com/conversation/join
Keep a pen and two sheets of paper nearby. That’s all you’ll need.
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Join on Zoom | https://www.unretireproject.com/conversation/join | A button, "[Join on Zoom]"; no address given |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [Tomorrow] and [tomorrow] (subject, preview text, body) | Right only if this email is sent the day before the webinar | This email's send rule (start − 24 h). If it is scheduled that way, delete the brackets and keep the word. |
| [time] (subject and body) | The start time | The Vercel value `WEBINAR_STARTS_AT` (Production); copy the time from the live `/conversation` page. |
| [One hour] and [this hour] | Keep if the session is still about an hour | The session length. If unchanged, delete the brackets and keep the words. |

---

## conv1-05 — Email 5 · Starting in 1 hour

- **Mailchimp name:** `conv1-05` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Registered" · **Send rule:** start − 1 h

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 5  ·  Starting in 1 hour
SENT  Thu 10 Dec, 1 hour before
WHAT IT DOES  Reminds them we start soon

Subject:  We start in one hour
Preview:  Grab a pen. Here’s your link.

One hour to go.
Grab a pen, two sheets of paper and something to drink. Join a few minutes early so you don’t miss the opening question.
[Join on Zoom]
The UnRetire team
```

Formatting in the document: bold — "One hour to go." and "[Join on Zoom]". No link is attached to the button.

### PASTE VERSION

Subject

```text
We start in [one hour]
```

Preview text

```text
Grab a pen. Here’s your link.
```

Body

```text
[One hour] to go.
Grab a pen, two sheets of paper and something to drink. Join a few minutes early so you don’t miss the opening question.
Join on Zoom
https://www.unretireproject.com/conversation/join
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Join on Zoom | https://www.unretireproject.com/conversation/join | A button, "[Join on Zoom]"; no address given |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [one hour] (subject) and [One hour] (body) | Right only if this email is sent one hour before the start | This email's send rule (start − 1 h). If it is scheduled that way, delete the brackets and keep the words. |

---

## conv1-06 — Email 6 · We’re live

- **Mailchimp name:** `conv1-06` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Registered" · **Send rule:** start

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 6  ·  We’re live
SENT  Thu 10 Dec, at the start
WHAT IT DOES  Tells them to join now

Subject:  We’re live. Join now
Preview:  The first question is on screen.

We’ve started.
The first question is on screen and the chat is open.
[Join now]
```

Formatting in the document: bold — "We’ve started." and "[Join now]". No link is attached to the button. There is no sign-off line (Gate A question 8).

### PASTE VERSION

Subject

```text
We’re live. Join now
```

Preview text

```text
The first question is on screen.
```

Body

```text
We’ve started.
The first question is on screen and the chat is open.
Join now
https://www.unretireproject.com/conversation/join
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Join now | https://www.unretireproject.com/conversation/join | A button, "[Join now]"; no address given |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| None | Nothing to replace. The email is right only if it is sent at the start | This email's send rule (start). |

---

## conv1-07 — Email 7 · Replay and offer

- **Mailchimp name:** `conv1-07` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Registered" · **Send rule:** start date + 1 day, at 09:00

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 7  ·  Replay and offer
SENT  Fri 11 Dec, 9:00
WHAT IT DOES  Sends the replay, the free Starter Plan and the course offer

Subject:  Your replay, workbook and free Starter Plan
Preview:  Plus [course name], open until Thursday.

Thank you for joining us. If you couldn’t make it, the full hour is here.
[Watch the replay] Available until [date].
[Download your workbook] Every exercise from the session, ready for you to work through at home.
[Get your free 14-Day Starter Plan] Plus the two-minute check, on the UnRetire website.
Ready to go further?
[Course name] turns one hour of thinking into a life you’re building. [One line on what the course is.]
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]
Join the course The offer closes Thursday 17 December at midnight.
The UnRetire team
```

Formatting in the document: bold — "Thank you for joining us.", "[Watch the replay]", "[Download your workbook]", "[Get your free 14-Day Starter Plan]", "Ready to go further?" and "Join the course"; "Join the course" is also underlined and is a link to https://www.unretireproject.com/learn/course. It sits in the same paragraph as the sentence after it. No link is attached to the three bracketed buttons.

### PASTE VERSION

Subject

```text
Your replay[, workbook] and free Starter Plan
```

Preview text

```text
Plus The (Un)Retire Course, open until [Thursday].
```

Body

```text
Thank you for joining us. If you couldn’t make it, the full [hour] is here.
Watch the replay
https://www.unretireproject.com/conversation/replay
Available until [date].
[workbook link — or delete this line]
Get your free 14-Day Starter Plan
https://www.unretireproject.com/start
Plus the two-minute check, on the UnRetire website.
Ready to go further?
The (Un)Retire Course turns [one hour] of thinking into a life you’re building. [One line on what the course is.]
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]
Join the course
https://www.unretireproject.com/learn/course
The offer closes [Thursday 17 December at midnight].
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Watch the replay | https://www.unretireproject.com/conversation/replay | A button, "[Watch the replay]"; no address given |
| Download your workbook | [workbook link — or delete this line] | A button, "[Download your workbook]", and the sentence after it; no address given and no workbook file exists |
| Get your free 14-Day Starter Plan | https://www.unretireproject.com/start | A button, "[Get your free 14-Day Starter Plan]"; no address given |
| Join the course | https://www.unretireproject.com/learn/course | A text link, exactly this address |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [, workbook] (subject) | Keep the two words only if a workbook is sent; otherwise delete them | Your answer to Gate A question 1. |
| ~~[course name] (preview text) and [Course name] (body)~~ | Nothing left to replace. Filled on 2026-11-13 with "The (Un)Retire Course" in the preview text and the body. | Your answer to Gate A question 12 (see the end of this file): the name the site uses (`src/app/learn/course/page.tsx:8`). |
| [Thursday] (preview text) | The weekday the offer closes | The Vercel value `WEBINAR_OFFER_ENDS_AT` (Production). |
| [hour] and [one hour] | Keep if the session was about an hour | The session length. If unchanged, delete the brackets and keep the words. |
| [date] ("Available until") | The last day the replay can be watched — or delete the sentence if it stays up | Your decision; the site holds no replay end date. |
| [workbook link — or delete this line] | The workbook's address with its button and sentence, or nothing | Your answer to Gate A question 1. The owner's original line is in SOURCE above. |
| [One line on what the course is.] | One sentence about the course | You write it. Facts already approved for the site: "Ten modules", "forty-eight lessons", "$99 once. Yours to keep." (`docs/content/locked-facts.md:15`, `:17`, `:18`). |
| [Benefit 1], [Benefit 2], [Benefit 3] | Three benefits of the course | You write them. Nothing is on file. |
| [Thursday 17 December at midnight] | The day and time the offer closes | The Vercel value `WEBINAR_OFFER_ENDS_AT`; copy the deadline from the live `/conversation/replay` page. |

---

## conv1-08 — Email 8 · Your questions, answered

- **Mailchimp name:** `conv1-08` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Registered, not bought" · **Send rule:** start date + 4 days, at 09:00

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 8  ·  Your questions, answered
SENT  Mon 14 Dec, 9:00
WHAT IT DOES  Answers doubts about the course (only to people who haven’t bought)

Subject:  “Is it too late for me?”
Preview:  Straight answers before the offer closes Thursday.

The questions people ask us most:
Is it too late for me?
No. Adults in their sixties to nineties who learned something new and demanding saw their memory improve. It was the stretching that made the difference.
I haven’t retired yet. Is this for me?
Yes. It’s for anyone whose title is changing, whether that’s retirement, a restructure, selling up or a sideways move.
How much time does it take?
[Time commitment per week.]
Is this therapy?
No. This is about designing your life. If the low feeling won’t lift, please talk to a professional.
Join the course The offer closes Thursday at midnight.
The UnRetire team
```

Formatting in the document: bold — "The questions people ask us most:", each of the four questions, and "Join the course"; "Join the course" is also underlined and is a link to https://www.unretireproject.com/learn/course. It sits in the same paragraph as the sentence after it.

### PASTE VERSION

Subject

```text
“Is it too late for me?”
```

Preview text

```text
Straight answers before the offer closes [Thursday].
```

Body

```text
The questions people ask us most:
Is it too late for me?
No. Adults in their sixties to nineties who learned something new and demanding saw their memory improve. It was the stretching that made the difference.
I haven’t retired yet. Is this for me?
Yes. It’s for anyone whose title is changing, whether that’s retirement, a restructure, selling up or a sideways move.
How much time does it take?
[Time commitment per week.]
Is this therapy?
No. This is about designing your life. If the low feeling won’t lift, please talk to a professional.
Join the course
https://www.unretireproject.com/learn/course
The offer closes [Thursday at midnight].
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Join the course | https://www.unretireproject.com/learn/course | A text link, exactly this address |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [Thursday] (preview text) | The weekday the offer closes | The Vercel value `WEBINAR_OFFER_ENDS_AT` (Production). |
| [Time commitment per week.] | How much time the course takes each week | You write it. No figure is on file. |
| [Thursday at midnight] | The weekday and time the offer closes | The Vercel value `WEBINAR_OFFER_ENDS_AT`; copy the deadline from the live `/conversation/replay` page. |

> **Note:** the sentence about memory is left exactly as written; it has no source on file
> (Gate A question 2).

---

## conv1-09 — Email 9 · Last day

- **Mailchimp name:** `conv1-09` · **Sent by:** scheduled email · **Goes to:** segment "Conv1 - Registered, not bought" · **Send rule:** offer-end date, at 09:00

### SOURCE

```text
UNRETIRE WEBINAR EMAIL SEQUENCE  ·  WHEN WORK NO LONGER DEFINES YOU, WHAT DOES?
Email 9  ·  Last day
SENT  Thu 17 Dec, 9:00
WHAT IT DOES  Says the offer ends tonight (only to people who haven’t bought)

Subject:  Last day: the offer closes tonight
Preview:  Before someone asks “So, what do you do?”

The offer closes tonight at midnight.
At some point this festive season, at a year-end party, a family lunch or a New Year’s gathering, someone will ask what you do.
You can answer with who you were. Or you can answer with who you’re becoming.
Join the course
After midnight, the offer is gone.
The UnRetire team
```

Formatting in the document: bold — "The offer closes tonight at midnight." and "Join the course"; "Join the course" is also underlined and is a link to https://www.unretireproject.com/learn/course.

### PASTE VERSION

Subject

```text
[Last day]: the offer closes [tonight]
```

Preview text

```text
Before someone asks “So, what do you do?”
```

Body

```text
The offer closes [tonight at midnight].
At some point [this festive season, at a year-end party, a family lunch or a New Year’s gathering], someone will ask what you do.
You can answer with who you were. Or you can answer with who you’re becoming.
Join the course
https://www.unretireproject.com/learn/course
[After midnight], the offer is gone.
The UnRetire team
```

### Buttons and links

| Label | Full address | In the document |
|---|---|---|
| Join the course | https://www.unretireproject.com/learn/course | A text link, exactly this address |

### Replace before go-live

| Blank | What to put | Where the real value comes from |
|---|---|---|
| [Last day] and [tonight] (subject) | Right only if this email is sent on the day the offer closes | This email's send rule (offer-end date, at 09:00). If it is scheduled that way, delete the brackets and keep the words. |
| [tonight at midnight] | When the offer closes, as the reader will see it on the day | The Vercel value `WEBINAR_OFFER_ENDS_AT` (Production). |
| [this festive season, at a year-end party, a family lunch or a New Year’s gathering] | Wording for the time of year the offer closes in | Your own wording. If it is still right, delete the brackets and keep the words. |
| [After midnight] | The moment after the offer closes | The Vercel value `WEBINAR_OFFER_ENDS_AT`. |

---

## Owner's answers (2026-11-13)

The Gate A questions, numbered as they were, each followed by the owner's answer. His reply of
2026-11-13, in full:

> all recommended - except for: 9. Its fine - dont worry about the email content - they will bechnaged later to fit the actual webinar 10. same 11. same (for offer) 12. ok no worries - and theres less chances that they will use different emails right? so lets not complicate 13. yes mailchimp default rest recommended

His numbers come from the list the builder sent him, not from this file: his 9, 10, 11, 12 and 13
are questions 1, 2, 4, 5 and 6 below (recorded in the status block of
`docs/sprint-prompts/S6.1-webinar-funnel.md`). "Recommended" means the builder's recommendation
for that question. The result: the nine emails stay exactly as he wrote them, and he will change
them for the real webinar.

1. Emails 1 and 7 promise a workbook. There is no workbook file. Will you send one (then we need its link), or do both lines come out?
   - **Owner:** "Its fine - dont worry about the email content - they will bechnaged later to fit the actual webinar" — both lines stay as he wrote them; the workbook blanks stay in the paste version until he rewrites the emails.
2. Email 8 says "Adults in their sixties to nineties who learned something new and demanding saw their memory improve." We have no source on file for it. What is the source — or do the two sentences come out?
   - **Owner:** "same" — the two sentences stay as he wrote them.
3. Email 2's "Download it" opens https://www.unretireproject.com/tools, where the Practice Toolkit asks for an email address again before sending anything. Keep it, or will you give a direct link to the file? And is "the Toolkit" the Practice Toolkit — yes or no?
   - Not put to him as a numbered question: the builder said it would be left exactly as he wrote it unless he said otherwise, and he did not. The link stays https://www.unretireproject.com/tools. The approved page copy treats "the Toolkit" as the Practice Toolkit (`docs/content/page-copy/conversation.md`, section 9).
4. No email says what the offer is. Add one new line above "Join the course" in Emails 7, 8 and 9 — "Use code [offer code] at checkout: [what the code gives]." — yes or no?
   - **Owner:** "same (for offer)" — no line is added.
5. Add "Already joined? Thank you, you can ignore this." to Emails 8 and 9 — yes or no? (A buyer who paid with a different email address cannot be left out automatically.)
   - **Owner:** "ok no worries - and theres less chances that they will use different emails right? so lets not complicate" — no line is added; a buyer who paid with a different email address will still get Emails 8 and 9.
6. What From name and reply-to address do the nine emails use?
   - **Owner:** "yes mailchimp default" — the From name and the reply-to address are the Mailchimp account's defaults.
7. The emails say "UnRetire"; the site's locked brand is "(Un)Retire". Default: the emails stay as you wrote them and the pages use "(Un)Retire". OK?
   - **Owner:** "rest recommended" — the recommendation was to leave both as they are: "UnRetire" in the emails, "(Un)Retire" on the pages.
8. Email 6 has no sign-off line; the other eight end "The UnRetire team". Leave it, or add the line?
   - Not put to him as a numbered question: the builder said it would be left exactly as he wrote it unless he said otherwise, and he did not. Email 6 keeps no sign-off line.
9. The session length is written three ways: "60 minutes, plus 10 optional minutes of questions" (Email 1), "60 minutes on Zoom" (Email 2) and "free · 60 minutes" (Email 3). The page's top line uses the Email 1 wording. Keep all three as written, or one wording everywhere — which?
   - Not put to him as a numbered question: the builder said it would be left exactly as he wrote it unless he said otherwise, and he did not. All three wordings stay.
10. Email 1 says "a pen and paper"; Emails 4 and 5 say "a pen and two sheets of paper". The page uses "Keep a pen and paper handy." Which is right?
   - Not put to him as a numbered question: the builder said it would be left exactly as he wrote it unless he said otherwise, and he did not. Both wordings stay in the emails, and the page keeps "Keep a pen and paper handy."
11. "The offer closes Thursday 17 December at midnight" — is that the end of Thursday? If yes, the deadline is set to 23:59 on Thursday and the page shows the clock time ("at 23:59 SAST"), not the word "midnight". OK?
   - **Owner:** "rest recommended" — the recommendation was yes: the deadline is 23:59 on the offer's last day, and the page shows the clock time.
12. Email 7 leaves the course's name blank ("[Course name]"). The site calls it "The (Un)Retire Course", and the page's offer block uses that. What should the emails call it?
   - **Owner:** "rest recommended" — the recommendation was "The (Un)Retire Course", as on the site; filled into Email 7's paste version (preview text and body) on 2026-11-13.
