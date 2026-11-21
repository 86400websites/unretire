# Webinar report page (`/report`) — approved copy (approved by the owner on 2026-11-21, Gate B, Sprint S6.2)

- **Source:** written for this page (Sprint S6.2, `docs/sprint-prompts/S6.2-webinar-report.md` step 3) · shipped strings cited by file:line
- **Drafted:** 2026-11-20 (Sprint S6.2), on branch `claude/s6.2-webinar-report` (cut from `origin/master` fa5faef). **Simplified the same day at Gate B** on the owner's direction (PROJECT-STATUS D-65), verbatim: *"ok please note that, we remove "For the webinar on Thursday 13 December Counting from Friday 6 November. Each visit is counted once per browser tab, and each person once. Test sign-ups are left out." and counting from too so we just keep the table and then the 2 cards and we remove showed up and too as it requires manual action.. and we just make it like conversion pecrecentage, etc.. and we can just mention that this is for webinar title... thats all and we can reset it for new webinar with a password so we enter the password and it resets then start counting again.. somehting like this so we keep it very simple?"* — then, to the plan shown to him: *"go, yes keep orange"*.
- **Status:** APPROVED by the owner on 2026-11-21 (Gate B, after he saw the simplified page on the Preview), as written. His reply, verbatim: *"Ok approved, thank you. As for privacy policy, keep as is. Let me know when we are ready for the codex review and give me the updated checklist that we had"* (its privacy half is `docs/PROJECT-STATUS.md` D-66). The rows keep their Source labels as drafted. The page is private (password, no search-engine indexing), so these strings never reach the public site.

The code copies these strings character for character into `src/app/report/copy.ts`. Lines marked **Note:** are
record-keeping, not copy.

**How to read a row.** The Source column holds exactly one of:

- `NEW — needs owner approval` — written for this page; no approved source exists.
- `shipped — path:line` — a string already live on the site, character for character.

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
| The webinar's name, under the heading | When Work No Longer Defines You, What Does? | shipped — `src/app/conversation/copy.ts:35` (`COPY.hero.title`, the sign-up page's own title; the page reads it from there, so the two never differ) |

## 3. The three cards

| Item | Copy | Source |
|---|---|---|
| Card 1 label | Visits to the sign-up page | NEW — needs owner approval |
| Card 2 label | Registered | NEW — needs owner approval |
| Card 3 label | Conversion | NEW — needs owner approval |

> **Note:** card 3 shows Registered as a share of Visits, as a whole percentage ("33%"), or "—" while there
> are no visits. The percentage sign and the number come from the formatter, not from copy.

## 4. Where people came from

| Item | Copy | Source |
|---|---|---|
| Table heading | Where people came from | NEW — needs owner approval |
| Column 1 | Where from | NEW — needs owner approval |
| Column 2 | Visits | NEW — needs owner approval |
| Column 3 | Registered | NEW — needs owner approval |
| Column 4 | Conversion | NEW — needs owner approval |
| A conversion with no visits yet | — | NEW — needs owner approval |
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

## 5. Start again for a new webinar (the reset)

| Item | Copy | Source |
|---|---|---|
| Heading | Start again for a new webinar | NEW — needs owner approval |
| What it does | Type the report password and click the button. All visits and sign-ups are deleted, and counting starts again from zero. | NEW — needs owner approval |
| Before you reset | Want to keep these numbers? Take a screenshot first: a reset cannot be undone. | NEW — needs owner approval |
| Box label | Password | shipped — `src/app/PasswordField.tsx:13` (the field's default label) |
| Button | Reset the numbers | NEW — needs owner approval |
| After a reset | Done. Counting starts again from zero. | NEW — needs owner approval |

## 6. The password form

| Item | Copy | Source |
|---|---|---|
| Line above the box | This page is private. Type the report password to open it. | NEW — needs owner approval |
| Box label | Password | shipped — `src/app/PasswordField.tsx:13` (the field's default label) |
| Button | Open the report | NEW — needs owner approval |

## 7. Messages

| When | Copy | Source |
|---|---|---|
| Wrong password (signing in) | That password didn't work. Try again. | NEW — needs owner approval |
| Wrong password (resetting) | That password didn't work, so nothing was reset. | NEW — needs owner approval |
| Too many tries (signing in or resetting) | Too many tries in a short time. Wait 10 minutes and try again. | NEW — needs owner approval |
| The reset failed | That didn't reset. Try again in a minute. | NEW — needs owner approval |
| The page was out of date (resetting) | The report changed after you opened this page, so nothing was reset. Check the numbers, then try again. | NEW — approved by the owner on 2026-11-21, after the Codex review's Finding 1: offered two wordings, he chose this one (*""The report changed…" (Recommended)"*) |
| Anything else went wrong | Something went wrong. Try again in a minute. | NEW — needs owner approval |
| The report's two settings are missing | This report isn't switched on yet. | NEW — needs owner approval |
| The numbers could not be read | The report couldn't load. Refresh the page in a minute. | NEW — needs owner approval |
