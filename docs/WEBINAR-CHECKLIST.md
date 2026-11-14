# WEBINAR-CHECKLIST.md — The webinar funnel on one page

> For the owner. Three parts: how it works, what to do now, and what to tick off for the real webinar.
> The click-by-click steps are in `docs/WEBINAR-FUNNEL.md` ("the runbook"). Each line here names the section to open.
> Written 2026-11-14 (Sprint S6.1).

## Part 1 — How it works, in plain words

**Before the webinar**

1. You announce the webinar. People open the sign-up page, `https://www.unretireproject.com/conversation`.
2. The page has two forms. **Save my seat** is for people who want to attend. **Email it to me** is for people who only want the Toolkit.
3. Someone saves a seat. The site adds them to Mailchimp with the tag `conv1-registered`. The page shows "Your seat is saved." with the join link and the calendar links, so nobody depends on an email to get in.
4. That tag starts a Mailchimp flow. Mailchimp sends **Email 1 (You’re in)** by itself.
5. Someone asks for the Toolkit instead. They get the tag `conv1-toolkit`, and Mailchimp sends **Email 2 (Your free Toolkit)** by itself. Email 2 also invites them to the webinar.
6. Three days before the webinar, **Email 3 (Join us)** goes to the Toolkit people who have still not saved a seat.
7. Everyone who saved a seat gets three reminders: **Email 4** the day before, **Email 5** one hour before, **Email 6** at the start.
8. Every join button in the emails goes to our own address, `https://www.unretireproject.com/conversation/join`. That address forwards to Zoom. The real Zoom link is never in an email.
9. When the webinar starts, the page stops taking sign-ups by itself.

**After the webinar**

10. You put the recording link into Vercel and click **Redeploy**. The replay page, `https://www.unretireproject.com/conversation/replay`, then shows the recording and the offer with its deadline and its code.
11. The next morning, **Email 7 (Replay and offer)** goes to everyone who saved a seat.
12. Four days after the webinar, **Email 8 (Your questions, answered)** goes out. On the offer's last day, **Email 9 (Last day)** goes out. Both go only to people who saved a seat and have **not** bought.
13. When someone buys the course or Premium on the site, the site adds the tag `purchased-course`. Mailchimp then leaves them out of Emails 8 and 9. This works only if they buy with the same email address they signed up with.
14. At the deadline, the replay page changes to "This offer has now closed." by itself.

**Who gets which email**

| This person                           | Gets                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| Saves a seat                          | 1, 4, 5, 6, 7 — then 8 and 9, unless they buy                    |
| Asks for the Toolkit only             | 2, then 3                                                        |
| Asks for the Toolkit, then saves seat | 2 (and 3, if it went out before they saved the seat), then 1, 4, 5, 6, 7 — then 8 and 9, unless they buy          |
| Buys the course or Premium            | Stops getting 8 and 9 (if still to be sent when they buy)        |

Each email goes only to the people who are in its group at the moment it is sent. Someone who signs up late does not get the emails that already went out.

**What switches it on and off**

- Five settings in Vercel hold the details: the date and time, the Zoom link, the replay link, the offer deadline and the offer code. With no date set, every `/conversation` address answers "not found". That is how the live site is today.
- Emails 1 and 2 are sent by Mailchimp itself, the moment a tag is added.
- Emails 3 to 9 are seven ordinary emails. You schedule each one once, for the real dates.
- Nothing I built ever sends or schedules an email. You do.

## Part 2 — What to do now (the test build)

The live page is switched off, so nothing here reaches real people. Allow about 80 minutes.

**Three things to know first**

- Use the files in the folder `UnRetire_Emails_READY_TO_PASTE` in your Downloads. They are your nine emails with the links already filled in (all but the workbook link in Email 7). Do not use the originals, and do not follow `START_HERE.txt` steps 2, 3 and 4.
- Never paste the real Zoom link into a file or into Mailchimp. Never click **Send** or **Schedule** on `conv1-03` to `conv1-09`. (**Send a test email** and **Send Test** are fine.)
- If a screen does not match a step, stop and send me a screenshot.

**The list**

- [ ] 1. **The one-minute try.** Check that Mailchimp lets you paste your own HTML, on the draft `conv1-03` — runbook §5.0, the last part, headed "Before anything else — the 1-minute try". If it does not, stop and send me a screenshot.
- [ ] 2. **Paste the seven files into the seven drafts**, and send yourself a test of each — runbook §6.

  | File                                   | Goes into draft |
  | -------------------------------------- | --------------- |
  | `Email_3_Join_us_on_Thursday.html`     | `conv1-03`      |
  | `Email_4_See_you_tomorrow.html`        | `conv1-04`      |
  | `Email_5_Starting_in_1_hour.html`      | `conv1-05`      |
  | `Email_6_Were_live.html`               | `conv1-06`      |
  | `Email_7_Replay_and_offer.html`        | `conv1-07`      |
  | `Email_8_Your_questions_answered.html` | `conv1-08`      |
  | `Email_9_Last_day.html`                | `conv1-09`      |

- [ ] 3. **Build flow `conv1-01`** with `Email_1_Youre_in.html`, and turn it on — runbook §5.2.
- [ ] 4. **Build flow `conv1-02`** with `Email_2_Your_free_Toolkit.html`, and turn it on — runbook §5.3.
- [ ] 5. **Tell me "emails are in".** I run the check and confirm the seven drafts are right.
- [ ] 6. **Save a seat on the test site** with your address plus `+ur-test-seat1` — runbook §7.1. Use the test-site address I gave you in chat.
- [ ] 7. **Ask for the Toolkit on the test site** with your address plus `+ur-test-kit1` — runbook §7.2.
- [ ] 8. **Check that Email 1 and Email 2 arrive** — runbook §7.3.
- [ ] 9. **Read the seven test emails** you sent yourself in step 2 — runbook §7.4.
- [ ] 10. **Do the one practice change** — runbook §7.5.
- [ ] 11. **Reply "pass"**, or tell me what looked wrong.

**What you will see in the test emails, and it is correct for now**

- The sample date "Thursday 10 December" and blanks such as `[time]`. They are replaced for the real webinar.
- The join, calendar, sign-up and replay buttons open "not found" on the live site. The live funnel is off until the real webinar. The other buttons open real pages. "Download your workbook" in Email 7 does not work yet.

**After your "pass"**

- [ ] 12. I send you **"ready for the Codex review"**. You run the review and paste the result back.
- [ ] 13. When the review says APPROVE and I say the checks are green, you merge the pull request.
- [ ] 14. I send you **"staging is ready"**. You make one pretend purchase — runbook §8 — and reply **"bought"**.

## Part 3 — The real webinar: tick list

Do the blocks in order. Email 3 goes out three days before the webinar, so finish blocks A and B well before that.

**Do not announce the webinar, and give nobody the page's address, until every line of block B is ticked.** From the moment the live page is on, anyone who signs up gets Email 1 at once.

### A. Decide the details

- [ ] The date and the start time, in South African time. The minutes must be 00, 15, 30 or 45.
- [ ] The offer: what it gives, the code word, and its last day.
- [ ] One line on what the course is, three benefits, and the time it takes each week (the blanks in Emails 7 and 8).
- [ ] The workbook: either a link to the file, or the workbook lines come out of Emails 1 and 7.
- [ ] The last day the replay can be watched, or "it stays up" (Email 7).
- [ ] If the webinar is not in December: your own words for "This festive season" (Email 3) and the year-end sentence (Email 9).
- [ ] **Send me all of these in one message, before block B.** I return the nine final files while you do the first three lines of block B.

### B. Set up — runbook §9, in this order

- [ ] The privacy page mentions webinar sign-ups, Zoom and the purchase tag — §9.1.
- [ ] The Zoom meeting exists and its link is copied — §9.2.
- [ ] The Stripe code exists and the price drops when you try it — §9.3.
- [ ] All nine emails say the real date, day, time and offer — §9.5. I return nine final files from the details in block A, and you paste each one again. Do Email 1 and Email 2 before the next line.
- [ ] The subject and the preview text of the seven drafts have no square brackets left, and neither do the Subject of flow `conv1-01` and the Preview text of flow `conv1-02` — §9.5.
- [ ] The Vercel values are set for **Production**, you clicked **Redeploy**, and the live page shows the right date and time — §9.4.
- [ ] People who already bought carry the tag `purchased-course` — §9.6.
- [ ] The live test passed: Email 1 and Email 2 arrive with the real date, and **Join on Zoom** opens the real meeting — §9.7.
- [ ] The seven emails are scheduled at the times the check prints — §9.8.
- [ ] The job in mode `launch-check` ends with `RESULT: PASS (launch-check)` — §9.8.
- [ ] The job in mode `cleanup` ends with `RESULT: PASS (cleanup)` — §9.8.
- [ ] Ask me whether the old `/webinar` page should point to the new page. That is a small developer change — runbook §13.

### C. Webinar week — runbook §10

- [ ] Three days before, 10:00: Email 3 goes out by itself.
- [ ] The day before, at the start time: Email 4 goes out by itself.
- [ ] One hour before: Email 5 goes out. Open Zoom and start the meeting early.
- [ ] At the start: Email 6 goes out. Check that the recording is running.

### D. After the webinar

- [ ] The next morning, **before 09:00**: the recording link is in Vercel, you clicked **Redeploy**, and the replay plays — runbook §11. Email 7 goes out at 09:00.
- [ ] The morning Email 8 goes out (four days after): tag anyone who bought since — §9.6.
- [ ] The morning Email 9 goes out (the offer's last day): tag anyone who bought since — §9.6.
- [ ] After the deadline: the replay page says "This offer has now closed."
- [ ] When the replay is no longer needed: switch the funnel off — the last paragraph of runbook §11.
- [ ] Before the next webinar: read runbook §12 first. Changing the date alone is wrong.
