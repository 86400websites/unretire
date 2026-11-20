# Webinar report page (`/report`) — copy for owner approval (Sprint S6.2)

- **Source:** written for this page (Sprint S6.2, `docs/sprint-prompts/S6.2-webinar-report.md` step 3) · one shipped string, cited by file:line
- **Drafted:** 2026-11-20 (Sprint S6.2), on branch `claude/s6.2-webinar-report` (cut from `origin/master` fa5faef)
- **Status:** DRAFT — every string marked NEW waits for the owner's approval at Gate B, when he sees the page on the Preview. The page is private (password, no search-engine indexing), so these strings never reach the public site.

The code copies these strings character for character into `src/app/report/copy.ts`. Lines marked **Note:** are
record-keeping, not copy.

**How to read a row.** The Source column holds exactly one of:

- `NEW — needs owner approval` — written for this page; no approved source exists.
- `shipped — path:line` — a string already live on the site, character for character.

**Tokens.** Per-webinar words are never typed; the page fills them in.

| Token | Filled from |
|---|---|
| `{weekday}` `{date}` | `WEBINAR_STARTS_AT`, as on `/conversation` (for example "Thursday" and "10 December") |
| `{count from}` | the "Counting from" day the owner saves on the page: weekday, day and month (for example "Monday 23 November") |

> **Note (voice):** plain words, short sentences, British spelling, straight apostrophes — the voice of the
> site's other forms. The eight source labels start from the ones the owner saw on the template page on
> 2026-11-19.

---

## 1. Page metadata

| Item | Copy | Source |
|---|---|---|
| Browser title | Webinar report | NEW — needs owner approval |

> **Note:** the page also tells search engines not to index or follow it. That is a setting, not copy.

## 2. Page header

| Item | Copy | Source |
|---|---|---|
| Heading | Webinar report | NEW — needs owner approval |
| Webinar line (only when a webinar is set up) | For the webinar on {weekday} {date} | NEW — needs owner approval |
| Counting line, when a date is saved | Counting from {count from}. | NEW — needs owner approval |
| Counting line, when no date is saved | Counting from the beginning. | NEW — needs owner approval |
| How it counts | Each visit is counted once per browser tab, and each person once. Test sign-ups are left out. | NEW — needs owner approval |

## 3. The three cards

| Item | Copy | Source |
|---|---|---|
| Card 1 label | Visits to the sign-up page | NEW — needs owner approval |
| Card 2 label | Registered | NEW — needs owner approval |
| Card 3 label | Showed up | NEW — needs owner approval |
| Card 3, before a number is saved | Add it after the webinar | NEW — needs owner approval |

## 4. Where people came from

| Item | Copy | Source |
|---|---|---|
| Table heading | Where people came from | NEW — needs owner approval |
| Column 1 | Where from | NEW — needs owner approval |
| Column 2 | Visits | NEW — needs owner approval |
| Column 3 | Registered | NEW — needs owner approval |
| Row `linkedin` | LinkedIn | NEW — needs owner approval |
| Row `instagram` | Instagram | NEW — needs owner approval |
| Row `facebook` | Facebook | NEW — needs owner approval |
| Row `whatsapp` | WhatsApp | NEW — needs owner approval |
| Row `email` | Email newsletter | NEW — needs owner approval |
| Row `meta-ads` | Instagram & Facebook ads | NEW — needs owner approval |
| Row `linkedin-ads` | LinkedIn ads | NEW — needs owner approval |
| Row `other` | Other / unknown | NEW — needs owner approval |
| Last row | Total | NEW — needs owner approval |

> **Note:** each row's key and the link that feeds it are fixed by the link contract in the sprint record
> and `src/lib/webinar/sources.ts`; only the label is copy.

## 5. Your numbers (the two boxes)

| Item | Copy | Source |
|---|---|---|
| Heading | Your numbers | NEW — needs owner approval |
| Box 1 label | Counting from | NEW — needs owner approval |
| Box 1 hint | The day your first link goes up. Visits and sign-ups before it are left out. Leave it empty to count everything. | NEW — needs owner approval |
| Box 2 label | Showed up | NEW — needs owner approval |
| Box 2 hint | After the webinar: the number of people in Zoom's participant report, each person counted once, without your team. | NEW — needs owner approval |
| Button | Save | NEW — needs owner approval |
| After saving | Saved. | NEW — needs owner approval |

## 6. The password form

| Item | Copy | Source |
|---|---|---|
| Line above the box | This page is private. Type the report password to open it. | NEW — needs owner approval |
| Box label | Password | shipped — `src/app/PasswordField.tsx:13` (the field's default label) |
| Button | Open the report | NEW — needs owner approval |

## 7. Messages

| When | Copy | Source |
|---|---|---|
| Wrong password | That password didn't work. Try again. | NEW — needs owner approval |
| Too many tries (password or saving) | Too many tries in a short time. Wait 10 minutes and try again. | NEW — needs owner approval |
| "Counting from" is not a real day | That date doesn't look right. Pick a day from the calendar. | NEW — needs owner approval |
| "Showed up" is not a whole number | Type a whole number, for example 74. | NEW — needs owner approval |
| Saving failed | That didn't save. Try again in a minute. | NEW — needs owner approval |
| Anything else went wrong | Something went wrong. Try again in a minute. | NEW — needs owner approval |
| The report's two settings are missing | This report isn't switched on yet. | NEW — needs owner approval |
| The numbers could not be read | The report couldn't load. Refresh the page in a minute. | NEW — needs owner approval |
