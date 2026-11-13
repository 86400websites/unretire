# WEBINAR-FUNNEL.md — The webinar funnel: your runbook

> Everything you need to build the Mailchimp side, test it, and later run a real webinar — without help.
> Written for the owner. One action per line. Copy the names; do not retype them.
> Companions: `docs/content/email-copy/conv1.md` (the nine emails — "the paste sheet"),
> `docs/content/page-copy/conversation.md` (every word on the page), `docs/OWNER-ACTIONS.md` Part 9
> (what this sprint needs from you, in order). Built in Sprint S6.1 (`docs/sprint-prompts/S6.1-webinar-funnel.md`).
>
> **Vendor screens change.** Every Mailchimp, Vercel, GitHub, Zoom and Stripe click path below was checked
> against that vendor's own help page on **2026-11-13**, and nine of those pages were read again on
> **2026-11-14**; the pages are listed in §15. Where a label could not be confirmed it says
> **(label not confirmed — look for something similar)**.
>
> **Short on time?** "Where you are today" in §0 is the whole list: what is done, and what is next.

## 0. Read this first (2 minutes)

**Six words used on every page of this runbook:**

| Word | Means |
|---|---|
| **Tag** | A label Mailchimp sticks on a contact. |
| **Segment** | A saved group of contacts in Mailchimp. What we called "lists" in our chats are **Segments** in Mailchimp. |
| **Flow** | An email Mailchimp sends by itself when a tag is added. |
| **Draft** | An email that exists in Mailchimp but is not scheduled. |
| **Vercel value** | A setting stored in Vercel, the service that hosts the site. Vercel calls it an "environment variable". |
| **Redeploy** | Rebuild the site so it picks up a changed value. One button. About 2 minutes. |

Two more: **Preview** = a private test copy of the site. **Dormant** = switched off: the page answers "not found".

**Four rules. Never break them.**

1. **A changed Vercel value does nothing until you Redeploy.** Edit the value, then Redeploy. Always both.
2. **Never paste a Preview address into Mailchimp.** One Mailchimp audience serves the live site and every test, so emails go to real people. Every link in an email starts with `https://www.unretireproject.com`.
3. **Use a new plus-address for every test.** An address that was used before does not get Email 1 again (§7).
4. **Never paste the Zoom link into an email, a chat or a document.** It goes into Vercel only. Emails link to `https://www.unretireproject.com/conversation/join`, which forwards to Zoom.

### Where you are today (written 2026-11-14)

**Done. Do not do these again.**

- [x] The two GitHub secrets `MAILCHIMP_API_KEY` and `MAILCHIMP_LIST_ID`. You added them on 2026-11-13.
- [x] `WEBINAR_ZOOM_URL` in Vercel, for Production, Preview and Development. You added it on 2026-11-13.
- [x] Your answers to my questions (Gate 0 and Gate A), 2026-11-13. Your reply is quoted in full in `docs/OWNER-ACTIONS.md` Part 9.
- [x] The four Preview-only values `WEBINAR_STARTS_AT`, `WEBINAR_OFFER_ENDS_AT`, `WEBINAR_OFFER_CODE` and `WEBINAR_REPLAY_URL`. You added them in Vercel for **Preview** on 2026-11-14 (your screenshot). Your words the day before: *"if they are essential then I have no issues - I'll add the details then redeploy"*.
- [x] The three new privacy-page sentences (webinar sign-ups, Zoom, the tag added when someone buys). You approved them on 2026-11-14. Your words: *"privacy ok"*. They are in `docs/content/page-copy/privacy.md`, section 13, and they reach the live page when this work is merged.

About the four Preview values:

- Leave them there for good (§2.4).
- You do not need to Redeploy for them. My next push builds a new Preview, and it picks them up.
- If one is in the wrong shape, that build stops and names it (§3.3). I will tell you which one.

**Still to do, in this order.**

1. Wait for my message **"Mailchimp is ready"**.
2. Build the two flows — §5. 20 minutes.
3. Paste the seven email bodies — §6. 25 minutes.
4. Run the test — §7. 30 minutes.
5. Reply **"pass"**.
6. Wait for my message **"ready for the Codex review"**.
7. Run the review with the prompt I hand you, as for the earlier sprints.
8. Paste the result back to me.
9. When the review says APPROVE and I tell you the checks are green, merge the pull request.
10. Wait for my message **"staging is ready"**.
11. Make one pretend purchase — §8. 5 minutes.
12. Later, when the real webinar has a date: the go-live checklist — §9. About 90 minutes.

The same list, with the decisions behind it, is `docs/OWNER-ACTIONS.md` Part 9.

## 1. How it works

**In six lines:**

1. A visitor opens `/conversation` and fills in one of two forms: save a seat, or ask for the Toolkit.
2. The site adds one tag to that contact in Mailchimp: `conv1-registered` or `conv1-toolkit`.
3. The tag starts one of your two flows. Email 1 or Email 2 goes out at once.
4. Emails 3 to 9 are seven ordinary scheduled emails. Each goes to one of three Segments. The Segments fill themselves from the tags.
5. When someone buys the course or Premium, the site adds the tag `purchased-course`. That takes them out of the Segment that gets the last two sales emails (8 and 9).
6. The date, the Zoom link, the replay link, the offer deadline and the offer code are five Vercel values. With no start date the whole funnel is dormant. That is how the live site is today.

**Who does what:**

| I do (the builder) | You do |
|---|---|
| The page, the two forms, the join link, the calendar file, the replay page | Build the two flows in Mailchimp — §5 |
| Create the tags, the three Segments and the seven empty drafts (the "Webinar Funnel" job) | Paste the seven email bodies into the drafts — §6 |
| The check that reads Mailchimp and reports what is wrong — §4 | Run the test and reply "pass" — §7 |
| The purchase tag that keeps buyers out of Emails 8 and 9 | Set the Vercel values and Redeploy — §3 |
| Any change to the page's wording (a small developer change) | The Zoom meeting and the Stripe code — §9 |
| | **Every send and every schedule.** Nothing I build ever sends or schedules an email. |

## 2. The facts (copy from here)

### 2.1 Tags

| Tag | Who gets it | What it does |
|---|---|---|
| `conv1-registered` | Anyone who saves a seat | Starts flow `conv1-01` (Email 1) |
| `conv1-toolkit` | Anyone who asks for the Toolkit | Starts flow `conv1-02` (Email 2) |
| `purchased-course` | Anyone who buys the course or Premium **and is already in your Mailchimp audience under that email** | Keeps them out of Emails 8 and 9 |
| `premium` | Premium buyers (this tag existed before this funnel) | Also keeps them out of Emails 8 and 9. Do not rename it. |

Only the site adds the first three. Nobody can give themselves one through the newsletter form.

### 2.2 Segments

| Segment name | Who is in it |
|---|---|
| `Conv1 - Registered` | Has `conv1-registered` |
| `Conv1 - Toolkit, not registered` | Has `conv1-toolkit` and does not have `conv1-registered` |
| `Conv1 - Registered, not bought` | Has `conv1-registered` and has neither `purchased-course` nor `premium` |

Do not rename or edit a Segment. The check (§4) fails if a definition changes.

### 2.3 The nine emails

All times are South African time (SAST). "Start" is the webinar's start.

| Mailchimp name | What it is | Sent by | Goes to | When |
|---|---|---|---|---|
| `conv1-01` | Email 1 · You’re in | Flow `conv1-01` | Tag `conv1-registered` | At once |
| `conv1-02` | Email 2 · Your free Toolkit | Flow `conv1-02` | Tag `conv1-toolkit` | At once |
| `conv1-03` | Email 3 · Join us on Thursday | Scheduled email | `Conv1 - Toolkit, not registered` | Start date − 3 days, at 10:00 |
| `conv1-04` | Email 4 · See you tomorrow | Scheduled email | `Conv1 - Registered` | Start − 24 h |
| `conv1-05` | Email 5 · Starting in 1 hour | Scheduled email | `Conv1 - Registered` | Start − 1 h |
| `conv1-06` | Email 6 · We’re live | Scheduled email | `Conv1 - Registered` | Start |
| `conv1-07` | Email 7 · Replay and offer | Scheduled email | `Conv1 - Registered` | Start date + 1 day, at 09:00 |
| `conv1-08` | Email 8 · Your questions, answered | Scheduled email | `Conv1 - Registered, not bought` | Start date + 4 days, at 09:00 |
| `conv1-09` | Email 9 · Last day | Scheduled email | `Conv1 - Registered, not bought` | Offer-end date, at 09:00 |

The words of each email, its subject, its preview text and its buttons are in the paste sheet:
`docs/content/email-copy/conv1.md`. This runbook never repeats them.

### 2.4 The five Vercel values — what each one is for

You asked where these are used. Here is every place.

| Name | What you put in it | Where the site uses it | Shape — copy the example and change the numbers | Type in Vercel |
|---|---|---|---|---|
| `WEBINAR_STARTS_AT` | The webinar's start date and time | **The on/off switch.** Empty = the funnel is dormant. Set = the page is open. It is also the date and time shown on the page, the time in the "Add to calendar" file, and the moment registration closes by itself. | `2029-12-13T16:00:00+02:00` — minutes must be `00`, `15`, `30` or `45`. `+02:00` means South African time. | **Config** |
| `WEBINAR_ZOOM_URL` | The Zoom meeting's invite link | Where "Join on Zoom" sends people. It is never shown on a page or in an email. Required whenever the start is set. | Starts with `https://` and is on `zoom.us` | **Secret** |
| `WEBINAR_OFFER_ENDS_AT` | The moment the offer closes | The deadline shown on the replay page, and the moment the offer block changes to "This offer has now closed." Empty = the replay page shows no offer at all. The offer also stays hidden until the replay link is set. | `2029-12-20T23:59:00+02:00` — always `23:59` on the last day, never `00:00` the next day | **Config** |
| `WEBINAR_OFFER_CODE` | The discount code | Shown on the replay page as "Use code … at checkout." **It only shows the code.** The discount itself is the Stripe code you create in §9.3; the two must be the same word. | Letters, digits and hyphens only. 3 to 40 characters. Example: `TESTCODE` | **Config** |
| `WEBINAR_REPLAY_URL` | The link to the recording | The "Watch the replay" link on the replay page. Empty = the replay page says "Coming Soon". | Starts with `https://` | **Config** |

**Config** = you can read the value again later. **Secret** = write-only; Vercel never shows it again.

**Yes — adding or editing a value and then Redeploying is all there is to it.** No code. No developer.

**Two sets, never mixed:**

| Where | What it holds | Rule |
|---|---|---|
| **Preview** (the test copy) | `WEBINAR_ZOOM_URL`, plus the four test values you added on 2026-11-14. The values I recommended: a start date years away (`2029-12-13T16:00:00+02:00`), an offer end a week after it (`2029-12-20T23:59:00+02:00`), the code `TESTCODE`, any public video link. | **They stay for good.** The automated tests need an open sign-up page on every Preview. A near date would close the forms and turn the tests red by calendar alone. |
| **Production** (the live site) | Empty today, except `WEBINAR_ZOOM_URL` | Empty start date = the live funnel is dormant. You fill these only at go-live (§9.4). |

### 2.5 Addresses

| What | Address |
|---|---|
| The sign-up page | `https://www.unretireproject.com/conversation` |
| The replay page | `https://www.unretireproject.com/conversation/replay` |
| The join link for emails and buttons | `https://www.unretireproject.com/conversation/join` |
| The calendar file | `https://www.unretireproject.com/conversation/calendar.ics` |
| The "Webinar Funnel" job | `https://github.com/86400websites/unretire/actions` |

Until go-live the first four answer "not found" on the live site. That is correct.

## 3. Change a detail (2 minutes each)

### 3.1 What to change, where

| Detail | Where | Who | How long |
|---|---|---|---|
| Date and time | Vercel value `WEBINAR_STARTS_AT`, then Redeploy | You | 2 minutes |
| Zoom link | Vercel value `WEBINAR_ZOOM_URL`, then Redeploy | You | 2 minutes |
| Replay link | Vercel value `WEBINAR_REPLAY_URL`, then Redeploy | You | 2 minutes |
| Offer deadline | Vercel value `WEBINAR_OFFER_ENDS_AT`, then Redeploy | You | 2 minutes |
| Offer code | Vercel value `WEBINAR_OFFER_CODE`, then Redeploy — and the same word in Stripe (§9.3) | You | 2 minutes |
| Dates, times and season wording in the nine emails | Edit the email in Mailchimp (§5.4 for Emails 1 and 2, §6 for 3 to 9) | You | A few minutes each |
| The title, any wording on the page, the session length, the "SAST" label | A small developer change: one reviewed pull request, not a sprint | Developer | — |
| Adding the page to the sitemap; what the old `/webinar` page does | A small developer change | Developer | — |
| A second webinar's tags | A small developer change — see §12 | Developer | — |

If you change the date or the deadline after the seven emails are scheduled, their send times do **not** move. Run the check (§4) and reschedule each one from its table.

### 3.2 Change a Vercel value — the steps

1. Open `https://vercel.com` and sign in.
2. Select the project `unretire`.
3. Open **Environment Variables** in the sidebar. (On some screens it sits under **Settings**.)
4. Find the name in the list. The same name can appear twice: once for **Production**, once for **Preview**. Pick the row for the one you mean.
5. Click the three dots to the right of the name.
6. Click **Edit**.
7. Type the new value.
8. Click **Save**.
9. Open **Deployments** in the sidebar.
10. Find the newest deployment for that environment.
11. Click the ellipsis (…) on its row.
12. Click **Redeploy**.
13. In the **Redeploy to Production** window, click **Redeploy**. (For a Preview the window's title differs — label not confirmed, look for something similar.)
14. Wait about 2 minutes, until the new deployment shows **Ready** (label not confirmed — look for something similar).
15. Open the page and look at it.

**To add a value that is not there yet** — on the same **Environment Variables** screen:

1. Type the **Name**. Copy it from §2.4.
2. Type the **Value**.
3. Tick the environment: **Production** or **Preview**. One, not both.
4. Under **Type**, choose **Config** or **Secret**. §2.4 says which.
5. Click **Save**.
6. Redeploy, as in steps 9 to 15 above.

**To switch something off:**

1. Edit the value (steps 4 to 6 above).
2. Clear it.
3. Click **Save**.
4. Redeploy. An empty value counts as "not set".

### 3.3 What a failed Redeploy looks like

A value in the wrong shape **stops the build on purpose**. Nothing breaks.

- The new deployment shows an error status.
- **The site does not change.** The previous version keeps serving.
- The value is never printed anywhere. Only its **name** is.

To find which value is wrong:

1. Open **Deployments**.
2. Click the deployment with the error.
3. In **Deployment Details**, expand **Building**.
4. Find the line `Webinar configuration is not valid, so this build was stopped`.
5. Read the line under it. It starts with the name, for example `- WEBINAR_STARTS_AT must be …`.
6. Correct that value (§3.2).
7. Redeploy again.

The usual mistakes:

| The build log names | The usual cause |
|---|---|
| `WEBINAR_STARTS_AT` | `+02:00` is missing, or the minutes are not `00`, `15`, `30` or `45`, or the date is typed as words |
| `WEBINAR_OFFER_ENDS_AT` | `+02:00` is missing, or it is earlier than the start |
| `WEBINAR_OFFER_CODE` | A space or a symbol in the code |
| `WEBINAR_ZOOM_URL` | Not a `zoom.us` link, or it is empty while the start date is set |
| `WEBINAR_REPLAY_URL` | Does not start with `https://` |

## 4. Run the "Webinar Funnel" job (2 minutes)

The job is a robot that looks at Mailchimp and tells you what is there. It can never send, schedule or write an email.

**Before the pull request is merged** you cannot start it yourself: GitHub shows the button only for work that is already merged. Until then it runs by itself on the pull request and I read it for you.

**After the merge:**

1. Open `https://github.com/86400websites/unretire/actions`.
2. In the left sidebar, click **Webinar Funnel**.
3. Click the **Run workflow** button.
4. Leave the **Branch** dropdown on `master`.
5. In the drop-down under the words that start "What to do.", choose a mode (table below). It starts on `check`.
6. Click **Run workflow**.
7. Wait about a minute. Refresh the page.

**Read the result:**

1. Click the name of the newest run in the list.
2. Under **Jobs**, click `webinar-funnel`.
3. Open the step **Run the funnel script**.
4. Go to the last line. It starts `RESULT: PASS` or `RESULT: FAIL`, then the mode in brackets, then how many checks passed and failed. A good run of `check` ends `RESULT: PASS (check).` followed by the count and `0 failed.`
5. If it failed, read every line that starts with `FAIL`. Each one says what to do.
6. Lines that start with `NOTE` are things to look at. They do not fail the run.
7. Lines that start with `PASS` are fine. Indented lines are plain facts.
8. Your test addresses are shown masked, like `…+ur-test-seat1@…`. The job never prints a full email address, a key or the Zoom link.

| Mode | What it does | When you use it |
|---|---|---|
| `check` | Reads only. Reports the tags, the Segments, the seven emails with every blank still in them and every link, the test contacts, and — once the live page is on — the send-time table. | Any time. It changes nothing. |
| `launch-check` | `check`, plus hard failures for anything that must stop a go-live. | Once, after you have scheduled the seven emails (§9.8). |
| `setup` | Creates the tags and the three Segments if they are missing. | Only if `check` says one is missing. |
| `drafts` | Creates the seven empty drafts if they are missing. | Only if `check` says one is missing. |
| `selftest` | Creates five test contacts on your own address, proves the Segments, archives the five. | Rarely. I run it during the build. |
| `cleanup` | Archives leftover test contacts: addresses with `+ur-test-` or `+ur-e2e-` that carry `conv1-registered` or `conv1-toolkit`. Archives, never deletes. Refuses to touch anyone else. | I run it once the pretend purchase (§8) is finished. You run it at go-live (§9.8). Never before §8 is finished. |

**Emails 1 and 2 cannot be checked by any job.** Mailchimp does not let a program read a flow. You check those two by eye (§9.5).

## 5. Build the two flows (20 minutes, once)

Start only after I tell you **"Mailchimp is ready"**. The tags must exist first.

### 5.1 The two flows at a glance

| Flow name | Trigger | Filter | Steps | Exit step | "Contacts can re-enter flow" | Last click |
|---|---|---|---|---|---|---|
| `conv1-01` | **Tag added** = `conv1-registered` | None | One **Send email** step: Email 1 | None | Off | **Turn flow on** |
| `conv1-02` | **Tag added** = `conv1-toolkit` | None | One **Send email** step: Email 2 | None | Off | **Turn flow on** |

### 5.2 Flow `conv1-01`

**If your screen does not match a step** — a button has another name, or you cannot find a setting — stop there, take a screenshot and send it to me. I tell you what to click and correct this page. A few labels below are marked "not confirmed": Mailchimp's own help pages did not show them.

Before you start, open the paste sheet `docs/content/email-copy/conv1.md` at the heading "conv1-01 — Email 1 · You’re in", part "PASTE VERSION". You copy three things from it: the Subject, the Preview text and the Body.

**A. Create the flow**

1. In Mailchimp, click the **Automations** icon.
2. Click **Build from scratch**.
3. In **Name**, paste `conv1-01`.
4. In the **Audience** drop-down, choose your audience.

**B. Set the trigger**

1. Click **Choose a trigger**.
2. Under "Contact activity triggers", choose **Tag added**.
3. Choose the tag `conv1-registered`. (The name of the tag box: label not confirmed — look for something similar.)
4. Do **not** click **Filter who can enter this flow**. No filter.
5. Click **Save Trigger**.

**C. Add the email**

1. Click the plus icon (+) under the trigger.
2. Select **Send email**.
3. In the **Send email** pop-up, click **Rename**.
4. Paste `conv1-01`.
5. Leave **To & From** as it is. That is your Mailchimp default sender.
6. Click **Edit** in the **Subject** field.
7. Paste the **Subject** from the paste sheet.
8. Paste the **Preview text** from the paste sheet.
9. Click **Save**.
10. Leave **Schedule** as it is.

**D. Paste the body**

1. Click **Select a template**.
2. If Mailchimp asks, choose **New Builder**.
3. Pick the plainest template. (Its name: label not confirmed — look for something similar.)
4. Click the text block.
5. Paste the **Body** from the paste sheet.
6. Find each place where the paste sheet shows a label with an address on the line under it. Make the label a button or a link that goes to that address.
7. Delete the address line.
8. Leave the square brackets in for now. You replace them at go-live (§9.5).
9. Click **Send a Test Email**.
10. Enter your own address.
11. Click **Send Test**.
12. Read the test email in your inbox.
13. Save the email and go back to the flow. (The button is **Save and exit** in a regular email; inside a flow: label not confirmed — look for something similar.)

**E. Turn it on**

1. Add **no** other step. No delay, no second email, no exit step.
2. Open the flow's settings. (Where they open: not confirmed — look for something similar.)
3. Make sure **Contacts can re-enter flow** is **off**. (Whether it starts off: not confirmed.)
4. Click **Continue**.
5. Click **Turn flow on**.

### 5.3 Flow `conv1-02`

Do §5.2 again with these three changes:

1. Name: `conv1-02`.
2. Tag: `conv1-toolkit`.
3. Paste sheet heading: "conv1-02 — Email 2 · Your free Toolkit".

### 5.4 Edit a flow's email later

1. Click **Automations**.
2. Click **All flows**.
3. Click the drop-down arrow for the flow.
4. Choose **View flow**.
5. Click **Pause & Edit**.
6. In the pop-up, click **Pause**.
7. Click the email.
8. Click the **Edit** links to change the **Subject** or the content.
9. Save.
10. Click **Turn back on**.

**Do not forget step 10.** While a flow is paused, nobody who signs up gets its email.

## 6. Finish the seven drafts (25 minutes, once)

The seven drafts already exist. Each has its name, its Segment, its subject and its preview text. You add the body.

Do this for each of `conv1-03`, `conv1-04`, `conv1-05`, `conv1-06`, `conv1-07`, `conv1-08`, `conv1-09`:

1. In Mailchimp, click **Campaigns**.
2. Click the name of the draft.
3. Look at the **To** section. It must show the Segment from the table in §2.3.
4. If it shows anything else, fix it now with the steps under "Wrong Segment" below.
5. Look at the **From** section. It should show your Mailchimp default sender. If it is empty, fill it with the steps under "Empty From" below.
6. Leave the **Subject** section as it is. It already holds the subject and the preview text, brackets included.
7. Open the **Content** section to design the email. (The button: label not confirmed — look for something similar.)
8. Pick the same plain template as in §5.2.
9. Open the paste sheet at the heading with the same name.
10. Copy the **Body** of the "PASTE VERSION".
11. Click the text block.
12. Paste.
13. Make each label-and-address pair a button or a link, and delete the address line (as in §5.2, part D, steps 6 and 7).
14. Make the lines that start with "- " a bulleted list.
15. Click **Save and exit**.
16. **Do not click Schedule. Do not click Send.**

**Wrong Segment** (only if step 3 showed the wrong one):

1. Click the **To** section.
2. Open the **Send to** drop-down.
3. Expand **Segments**.
4. Tick the right Segment.
5. Click **Save**.

**Empty From** (only if step 5 showed nothing):

1. Click **Add From**.
2. Enter your usual name and address.
3. Click **Save**.

When all seven are done, tell me. I run the check and confirm all seven are on their Segments.

## 7. The test run (30 minutes)

You need: my message "Mailchimp is ready", both flows on (§5), all seven drafts pasted (§6), and the Preview address I gave you.

**Your test addresses.**

- If your address is `name@example.com`, then `name+ur-test-seat1@example.com` is a different contact to Mailchimp. Its mail still lands in your normal inbox.
- Always start the extra part with `+ur-test-`. After it, use letters, digits and hyphens only.
- **Use a new ending for every test** (`seat1`, `seat2`, `kit1`, `kit2` …). The flows do not let the same address in twice, so a used address does not get Email 1 again — even after it is archived.

### 7.1 Save a seat on the Preview

1. Sign in to Vercel in your browser. The Preview is private.
2. Open the Preview address and add `/conversation` to its end.
3. In the form with the button **Save my seat**, enter a first name.
4. Enter your address with `+ur-test-seat1`.
5. Click **Save my seat**.
6. The form is replaced by "Your seat is saved."
7. Under it you see three links: **Join on Zoom**, **Add to calendar**, **Add to Google Calendar**.
8. Click **Add to calendar**. A calendar file downloads.
9. Open the file. The title and the date match the page. The time is the same moment shown in your computer's own time zone, so the clock time differs from the page: for example, 16:00 SAST shows as 19:30 in India. The same is true of **Add to Google Calendar**.

### 7.2 Ask for the Toolkit on the Preview

1. On the same page, find the form with the button **Email it to me**.
2. Enter a first name.
3. Enter your address with `+ur-test-kit1`.
4. Click **Email it to me**.
5. The form is replaced by "Check your inbox".

### 7.3 Check the two emails

1. Open your inbox. Look in spam and promotions too.
2. Email 1 has arrived. Its subject starts "You’re in."
3. Email 2 has arrived. Its subject is "Your Toolkit is here".
4. Hover over every button and link in both. Each address must be the one in the paste sheet's "Buttons and links" table for that email.
5. The `/conversation` links open "not found" on the live site. **That is expected until go-live.** To see those pages, open the same path on the Preview address instead.

If an email did not arrive, go to §14.

### 7.4 Send yourself a test of each of the seven

For each of `conv1-03` to `conv1-09`:

1. Click **Campaigns**.
2. Click the name of the draft.
3. Click **Send a Test Email** in the checklist.
4. Enter your own address.
5. Click **Send Test**.
6. Read it against the paste sheet: subject, preview text, wording, every link.

A test email goes only to the address you type. It does not go to the Segment.

### 7.5 One practice change

This is the whole "change a detail" job, done once so you have seen it.

1. In Vercel, edit `WEBINAR_OFFER_CODE` in the **Preview** row to `PRACTICE1` (§3.2 steps 1 to 8).
2. Redeploy the newest **Preview** deployment (§3.2 steps 9 to 14).
3. Open the new deployment's address and add `/conversation/replay` to its end.
4. The page says "Use code PRACTICE1 at checkout."
5. Now put it back. Edit the value to the code it held before (`TESTCODE`, if you used the one I recommended).
6. Click **Save**.
7. Redeploy the newest **Preview** deployment again.

### 7.6 Optional — one real send

Only if you want to see a real send land. Skip it otherwise.

1. Ask me to run the check. For the Segment `Conv1 - Registered` it must say **"Every member is a test address."** If it says anything else, stop.
2. Click **Campaigns**.
3. Click the three-dot menu under **Actions** next to `conv1-04`.
4. Choose **Replicate**.
5. Rename the copy to `test-copy-04`. (Otherwise the check reports it as a "possible typo".)
6. Send the copy now.
7. It arrives at your `+ur-test-seat1` address.

Never send or schedule one of the seven real drafts during a test.

### 7.7 Tell me

Reply **"pass"**, or tell me what looked wrong. I then read Mailchimp back and confirm your two test contacts carry the right tag and sit in the right Segments.

## 8. After the merge — one pretend purchase (5 minutes)

This proves a buyer drops out of Emails 8 and 9. It uses the test copy of the site and Stripe's test card. No money moves.

1. Wait for my message **"staging is ready"**.
2. Do **not** archive your `+ur-test-seat1` contact before this.
3. Open `https://unretire-git-staging-86400-s-projects.vercel.app/learn/course` (sign in to Vercel if asked).
4. Click **Buy the course — $99**.
5. The site asks you to create an account. Enter **exactly** the `+ur-test-seat1` address from §7.1, and a password.
6. Click **Create account & continue to checkout**. The Stripe payment page opens. (If a confirmation email arrives instead, click the link in it, then do steps 3 and 4 again.)
7. On the Stripe page, enter the card `4242 4242 4242 4242`, any future date such as `12/34`, and any three-digit CVC. Never a real card.
8. Pay.
9. Reply **"bought"**.

I then run the check and confirm that contact now carries `purchased-course` and has left `Conv1 - Registered, not bought`. After that I show you the two clean-up statements for the test account and run them only when you approve.

## 9. Go-live checklist — the real webinar (about 90 minutes, in this order)

Do not skip ahead. Each step depends on the one before.

### 9.1 The privacy page · 1 minute

- [ ] Open `https://www.unretireproject.com/privacy`.
- [ ] It mentions webinar sign-ups, Zoom, and the tag added when someone buys. These are the three sentences you approved on 2026-11-14 (`docs/content/page-copy/privacy.md`, section 13). They reach the live page when this work is merged.
- [ ] **If the page does not mention all three, stop. Do not set the Production values (§9.4) until it does.** Tell me.

### 9.2 The Zoom meeting · 10 minutes

1. Sign in to the Zoom web portal.
2. In the navigation menu, click **Meetings**.
3. Click **+ Schedule a Meeting**.
4. Topic: enter the webinar's title.
5. Date and time: enter the webinar's start.
6. Duration: enter the session plus time for questions.
7. In the **Registration** section, leave **Required** **un-ticked**. People sign up on our page, not on Zoom.
8. In the **Meeting ID** section, select **Generate Automatically**.
9. In the **Security** section, **Waiting Room**: clear the check box — or keep it ticked **only** if someone will be letting people in for the whole session.
10. Next to **Options**, click **Show**.
11. Select the check box next to **Automatically record meeting**.
12. Select **In the cloud**. (Cloud recording needs a paid Zoom plan.)
13. Still in **Options**, tick the box that mutes people as they join. (Label not confirmed — look for something similar. If you cannot find it, use "Mute for every meeting" below after step 15.)
14. Click **Save**.
15. Copy the meeting's invite link. (The button: label not confirmed — look for something similar.) It starts with `https://` and contains `zoom.us`.

**Mute for every meeting** (only if step 13 had no such box):

1. Click your profile picture.
2. Click **Settings**.
3. Click the **Meeting** tab.
4. Under **Schedule Meeting**, turn on **Mute all participants when they join a meeting**.

- [ ] The link is copied. It goes into Vercel in §9.4 and nowhere else.
- [ ] Your Zoom plan allows more people than you expect to register.

### 9.3 The Stripe code · 10 minutes

1. Open the Stripe Dashboard.
2. Make sure you are in **live** mode: there is no sandbox banner at the top.
3. Open the **Products** page. (Your menu may call it **Product catalog**.)
4. Click **Coupons**.
5. Click **+New**.
6. In the **Create a coupon** window, enter a **Name**.
7. Choose the **Type** and the amount. This is your offer.
8. In **Apply to specific products**, add the course. Only the course. Then the code cannot be used on Premium.
9. Click **Use customer-facing promotion codes**.
10. Enter the code. **Exactly the word you will put in `WEBINAR_OFFER_CODE`.**
11. Select **Add an expiration date**.
12. Enter the offer's last day at 23:59. Check which time zone the box uses.
13. Click **Create coupon**.

Test it without paying:

1. On the live site, sign in and start buying the course.
2. On the Stripe page, enter the code in the promotion-code box (label not confirmed — look for something similar).
3. The price drops.
4. Close the tab. Do not pay.

- [ ] The code works on the course and the price is right.

**The same thing in test mode** (only if you want the code to work on a Preview):

1. Click the account picker.
2. Click **Switch to sandbox**.
3. Open your sandbox. A banner at the top shows you are in a sandbox.
4. Repeat steps 3 to 13 above.

Sandbox coupons and live coupons are separate. Making one does not make the other.

### 9.4 The Production values and Redeploy · 5 minutes

Use §3.2. Tick **Production** only. Do not touch the **Preview** rows.

- [ ] `WEBINAR_ZOOM_URL` — **Edit** the Production row. Paste the invite link from §9.2.
- [ ] `WEBINAR_STARTS_AT` — add it. Shape: `2029-12-13T16:00:00+02:00`.
- [ ] `WEBINAR_OFFER_ENDS_AT` — add it. **23:59 on the last day**, for example `2029-12-20T23:59:00+02:00`. Never `00:00` the next day: Email 9 goes out at 09:00 on the offer-end date, and it would then be scheduled after the offer had closed.
- [ ] `WEBINAR_OFFER_CODE` — add it. The same word as in Stripe.
- [ ] Leave `WEBINAR_REPLAY_URL` empty. It comes after the webinar (§11).
- [ ] **Redeploy** the Production deployment.
- [ ] Open `https://www.unretireproject.com/conversation`. The page is there. The date and the time are right.

If the Redeploy fails, go to §3.3. The live site is unaffected.

### 9.5 Every blank in every email · 30 minutes

A blank is anything still inside square brackets. If the words inside are right, delete the two brackets and keep the words.

**Emails 3 to 9 — the job finds the blanks for you:**

- [ ] Run the job in mode `check` (§4). For each email it lists every blank left in the subject, the preview text and the body.
- [ ] Fix each one in Mailchimp: click **Campaigns**, then the name of the email. The paste sheet's "Replace before go-live" table under each email says what goes in each blank.
- [ ] Run `check` again. Repeat until every email says no `[` is left.

**Emails 1 and 2 — by eye, because no job can read a flow.** Open each flow's email (§5.4) and tick each blank. This list is for the emails as pasted; if you rewrote them, read every line for a `[` instead.

Email 1 (`conv1-01`):

- [ ] Subject: `[Thursday 10 December]`
- [ ] Body: `[Thursday 10 December]`
- [ ] Body: `[time]`
- [ ] Body: `[60 minutes, plus 10 optional minutes of questions]`
- [ ] Body: `[Your workbook arrives after the session.]`
- [ ] Body: `[This hour]`
- [ ] **Turn back on** clicked. The flow is running.

Email 2 (`conv1-02`):

- [ ] Preview text: `[one free hour]`
- [ ] Body: `[Thursday 10 December]`
- [ ] Body: `[time]`
- [ ] Body: `[60 minutes]`
- [ ] **Turn back on** clicked. The flow is running.

### 9.6 Mark existing buyers · 10 minutes

The site marks a buyer by itself only when they pay **after** this work was merged and are **already in your audience** under that email. Everyone else you mark by hand.

For each person who has bought the course or Premium:

1. In Stripe, open **Customers** (or **Transactions**).
2. Read the buyer's email.
3. In Mailchimp, click **Audience**.
4. Search for that email.
5. **Not found:** skip this buyer. **Never import them.** Go to the next buyer.
6. **Found:** click the contact.
7. In the **Tags** section, click **Add a tag**.
8. Enter `purchased-course`. Copy it from here; do not retype it.

- [ ] Done today.
- [ ] Done again on the morning Email 8 goes out.
- [ ] Done again on the morning Email 9 goes out.

### 9.7 The live test · 10 minutes

- [ ] On `https://www.unretireproject.com/conversation`, save a seat with a **new** test address (for example `+ur-test-live1`).
- [ ] Ask for the Toolkit with another **new** test address (for example `+ur-test-live2`).
- [ ] Email 1 arrives. It shows the **real** date and time. No square brackets.
- [ ] Email 2 arrives. No square brackets.
- [ ] Click **Join on Zoom** in Email 1. It opens the **real** meeting.
- [ ] If an email does not arrive: open its flow and turn it on (§5.4), then test again with a new address.

### 9.8 Schedule, check, clean up · 20 minutes

- [ ] Check your Mailchimp account's time zone once (steps below). Every time you pick in Mailchimp is in that zone.
- [ ] Run the job in mode `check`. Find the part headed `Send times`.
- [ ] For each of the seven emails it prints the planned time three ways: in SAST, in UTC, and in your Mailchimp account's time zone. **Use the line that ends with your account's time zone.** If that line is missing, work it out from the UTC line.
- [ ] Schedule each email (steps below).
- [ ] Run the job in mode `launch-check`. The last line must start `RESULT: PASS (launch-check)`. If it starts `RESULT: FAIL`, fix what each `FAIL` line names and run it again.
- [ ] Run the job in mode `cleanup`. It archives your test contacts so they receive nothing. The last line must start `RESULT: PASS (cleanup)`.

**To see your Mailchimp account's time zone:**

1. Click your profile icon.
2. Click **Account**.
3. Open the **Settings** drop-down.
4. Click **Details**.
5. Read **Region and Timezone**.

**To schedule one email** (scheduling needs Mailchimp's Essentials plan or higher):

1. Click **Campaigns**.
2. Click the name of the email.
3. In the email checklist, click **Send time**.
4. Click **Schedule**.
5. Click the **Delivery date** calendar and choose the date.
6. Click **Send at a specific time** and choose the time.
7. Click **Save**.
8. Click **Schedule**.
9. In the **Schedule email for sending?** popup, click **Confirm scheduling email**.

**To change a scheduled email** — at least 5 minutes before its send time:

1. Click **Campaigns**.
2. Click **Pause And Edit** next to the email.
3. In the pop-up, click **Pause**.
4. Make your change.
5. Schedule it again with the nine steps above.

## 10. Webinar week

| When | What happens by itself | What you do |
|---|---|---|
| 3 days before, 10:00 | Email 3 goes to people who took the Toolkit and have not registered | Nothing |
| The day before, at the start time | Email 4 goes to everyone registered | Nothing |
| 1 hour before | Email 5 goes out | Open Zoom. Start the meeting early. |
| The start | Email 6 goes out. The page stops taking sign-ups and says "Registration for this webinar has closed." | Check the recording is running. |
| During | — | If the waiting room is on, someone lets people in the whole time. |
| The day after, 09:00 | Email 7 goes out with the replay link | **Before 09:00:** do §11. |
| 4 days after, 09:00 | Email 8 goes to people who have not bought | **That morning:** mark buyers (§9.6). |
| The offer's last day, 09:00 | Email 9 goes to people who have not bought | **That morning:** mark buyers (§9.6). |
| The offer deadline | The replay page changes to "This offer has now closed." | Nothing |

## 11. After the webinar — the replay (10 minutes, before Email 7)

1. Sign in to the Zoom web portal.
2. In the navigation menu, click **Recording & Transcripts**.
3. Click the **Cloud recordings** tab.
4. Click the thumbnail of the recording.
5. Click **Share**.
6. Under **Who can view**, select **Everyone with the recording link**.
7. Click **More settings**.
8. If **Passcode** is on, turn it off. (Or keep it on and be ready to give people the passcode: the replay page shows the link only.)
9. Click **Save**.
10. Click **Copy link and passcode**.
11. Keep only the link — the part that starts with `https://`.
12. In Vercel, add `WEBINAR_REPLAY_URL` for **Production** with that link (§3.2, "To add a value that is not there yet").
13. **Redeploy.**
14. Open `https://www.unretireproject.com/conversation/replay`. The **Watch the replay** link is there.
15. Click it. The recording plays.

If the recording is not ready in time: pause Email 7 at least 5 minutes before 09:00 ("To change a scheduled email" in §9.8), and schedule it again once step 15 works.

You may use any other public video link instead of Zoom's, as long as it starts with `https://`.

**When it is all over** and you want the pages gone: clear `WEBINAR_STARTS_AT` in Production and Redeploy. Every `/conversation` address then answers "not found" — including the replay link in Email 7. Do it only when the replay no longer needs to be watched.

## 12. Running the next webinar

**Changing the date alone is wrong.** Here is why:

- Everyone who registered last time still carries `conv1-registered`. They are still in `Conv1 - Registered`. They would get the new reminders and the new sales emails without signing up.
- Someone from last time who signs up again would **not** get Email 1: the flow does not let the same contact in twice.
- The seven emails are already sent. A sent email cannot be scheduled again.

Two ways to do it properly:

**Way 1 — a new name (recommended).** Ask for a small developer change (one reviewed pull request, not a sprint): the webinar gets a new id, for example `conv2`, with its own tags, Segments and drafts. You then do §5 and §6 again with the new names, and §9. Last time's contacts are left alone.

**Way 2 — reuse `conv1` by hand (no developer, more steps, easy to get wrong).** Before you set the new date:

1. Remove the tags `conv1-registered` and `conv1-toolkit` from every contact who has them.
2. Rename the seven sent emails so their names no longer start with `conv1` (for example `old-conv1-03`).
3. Run the job in mode `drafts` (§4). It creates seven fresh drafts.
4. Build two **new** flows with new names and turn the two old ones off. The old flows remember who has been through them.
5. Paste and check everything again (§6, §9).

If any of those five is missed, people get the wrong emails. When in doubt, use Way 1.

## 13. What this funnel does not do

- **It cannot match a buyer who used a different email.** A buyer who paid with another address, or who was not in your audience when they paid, still gets Emails 8 and 9 unless you mark them by hand (§9.6). You chose not to add anything for this, on 2026-11-13: *"ok no worries - and theres less chances that they will use different emails right? so lets not complicate"*.
- **It never sends, schedules or writes an email.** You do all three.
- **It cannot read your two flows.** Emails 1 and 2 are checked by eye.
- **The join link is not a door.** Anyone who has `…/conversation/join` reaches the meeting, registered or not. The meeting's own settings are the control.
- **It does not email people who unsubscribed.** They see a message on the page saying we can't send email to that address, and they are not resubscribed. One case is different: a contact **you archived** who signs up again is put back on the list, because they have just asked for the emails. If that person had unsubscribed before you archived them, Mailchimp is expected to refuse, and they see the same message; this one case has not been tried against your real account.
- **It does not deliver a Toolkit file or a workbook.** Neither file exists yet. Email 2's link opens `/tools`.
- **It does not count anything.** No analytics, no tracking links. That is a later sprint.
- **It does not change the old `/webinar` page** or add the new page to the sitemap. Both are small developer changes at go-live.

## 14. Troubleshooting

| What you see | Likely cause | What to do |
|---|---|---|
| I changed a value and nothing changed | No Redeploy | Redeploy (§3.2 steps 9 to 14) |
| The Redeploy failed | A value is in the wrong shape | §3.3. The site is unaffected. |
| `/conversation` says "not found" | `WEBINAR_STARTS_AT` is empty in that environment — or the Zoom link is — or you have not Redeployed | §2.4, then §3.2 |
| The page shows the wrong time | `+02:00` is missing or wrong in the value | Fix the value. The page always shows South African time. |
| "Registration for this webinar has closed." before the webinar | The start value is in the past | Fix `WEBINAR_STARTS_AT`, Redeploy |
| Email 1 or 2 did not arrive | The flow is off or paused · the address was used before · it is in spam · the address had unsubscribed | Turn the flow on (§5.4) · test again with a **new** plus-address · look in spam and promotions |
| Email 1 arrived twice | Two flows have the same trigger, or re-entry is on | Keep one flow per tag. Turn **Contacts can re-enter flow** off. |
| Someone signed up while a flow was paused or off | They have the tag but did not get the email | Send them `https://www.unretireproject.com/conversation/join` yourself. Mailchimp's help pages do not say whether adding the tag again re-sends. |
| The form says "We could not sign you up just now. Please try again." | Mailchimp did not answer in time, or answered with an error | Try again. If it keeps happening, tell me. |
| The form says "Too many requests. Please wait a moment and try again." | Too many tries from one place in a minute | Wait a minute |
| A draft goes to the wrong people | Wrong Segment in **To** | §6, "Wrong Segment" |
| The check says a tag, a Segment or a draft is missing | It was deleted or renamed | Run mode `setup`, then mode `drafts` |
| The check says a Segment "is not defined as it should be" | Someone edited the Segment in Mailchimp | Tell me. The job never edits a Segment. |
| The check says "Possible typo" | A tag, a Segment or an email whose name is almost right: an email that starts with `conv1` but is not one of the seven, or a name that differs only in capitals or spaces | Rename or delete it in Mailchimp |
| The check says "no start configured — table skipped" | The live site has no start date yet, so there are no send times to work out | Nothing, until go-live. Then do §9.4 first. |
| The replay page shows no offer | The replay link is not set yet, or `WEBINAR_OFFER_ENDS_AT` is empty | Set the missing value (§3.2), Redeploy |
| `launch-check` fails on a `[` | A blank is still in a subject, a preview text or a body | Replace it (§9.5) |
| `launch-check` fails on a send time | Email 5 is not exactly 1 hour before, Email 6 is not exactly at the start, or another email is on the wrong side of the start, the end of the session or the deadline | Reschedule from the `Send times` table (§9.8) |
| `launch-check` says fewer than seven emails are scheduled | One or more of the seven is still a draft | Schedule it (§9.8) |
| `launch-check` says a link "does not answer 200" | A link in an email points at a page that is not there | Correct the link in that email. The right addresses are in the paste sheet. |
| `launch-check` says the join address "does not forward" | The live funnel is off, or the Zoom value is missing | §9.4, then Redeploy |
| "Join on Zoom" opens the wrong meeting | An old link in `WEBINAR_ZOOM_URL` | Edit the Production value, Redeploy |
| A buyer got Email 8 or 9 | A different email, or not in the audience when they paid (§13) | Add `purchased-course` by hand (§9.6) |
| Test contacts are still in a Segment | Not cleaned up | Run mode `cleanup` — but not before the pretend purchase (§8) is finished |
| GitHub shows no **Run workflow** button | The pull request is not merged yet | I run it on the pull request until then |
| Mailchimp will not let you schedule | Scheduling needs the Essentials plan or higher | Check your plan |

**To archive one contact by hand in Mailchimp:**

1. Click **Audience**.
2. Tick the box next to the contact.
3. Click **Archive**.
4. In the pop-up, enter `ARCHIVE`.
5. Click **Archive**.

Archive, never delete: a deleted contact cannot be added back.

## 15. Sources (vendor help pages, read 2026-11-13)

Nine of these pages were read again on 2026-11-14 and the steps above still match them: the two Mailchimp flow pages (create, and pause and edit), Mailchimp's schedule, tag and archive pages, Vercel's "Managing environment variables", GitHub's "Run a workflow by hand", Zoom's "Share a cloud recording" and Stripe's coupons page. One label changed in §9.3 as a result: Stripe's page says to open the **Products** page.

**Mailchimp**

- Create a flow, Build from scratch, Turn flow on — <https://mailchimp.com/help/create-customer-journey/>
- The "Tag added" trigger — <https://mailchimp.com/help/all-the-starting-points/>
- The Send email step — <https://mailchimp.com/help/use-send-email-actions/>
- Pause & Edit, Turn back on, "Contacts can re-enter flow" — <https://mailchimp.com/help/edit-customer-journey-map/>
- The email checklist (To, From, Subject, Send time, Content) — <https://mailchimp.com/help/create-a-regular-email-campaign/>
- Opening a draft; Subject and Preview text — <https://mailchimp.com/help/edit-your-emails-subject-preview-text-from-name-or-from-email-address/>
- Sending to a saved Segment; where Segments are listed — <https://mailchimp.com/help/create-and-send-to-a-segment/>
- The new email builder, Save and exit — <https://mailchimp.com/help/design-an-email-new-builder/>
- Send a Test Email — <https://mailchimp.com/help/preview-and-test-your-email-campaign/>
- Schedule, Pause And Edit, the plan needed — <https://mailchimp.com/help/schedule-or-pause-a-regular-email-campaign/>
- The account time zone — <https://mailchimp.com/help/set-account-details/>
- Replicate — <https://mailchimp.com/help/replicate-a-campaign/>
- Add a tag to one contact — <https://mailchimp.com/help/create-add-remove-tags/>
- Archive a contact — <https://mailchimp.com/help/archive-unarchive-contacts/>
- Deleted contacts cannot be added back — <https://mailchimp.com/help/delete-contacts/>

**Vercel**

- Add, view and edit an environment variable; changes apply only to new deployments — <https://vercel.com/docs/environment-variables/managing-environment-variables>
- Config and Secret types; editing a value — <https://vercel.com/docs/environment-variables/sensitive-environment-variables>
- Redeploy — <https://vercel.com/docs/deployments/managing-deployments>
- A failed build and its build log — <https://vercel.com/docs/deployments/troubleshoot-a-build>

**GitHub**

- Run a workflow by hand — <https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow>
- Read a run's result — <https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs>

**Zoom**

- Schedule a Meeting; Meeting ID; the Waiting Room check box; Options — <https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0058759>
- The Registration "Required" check box — <https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065026>
- Automatically record meeting, In the cloud — <https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067954>
- Mute all participants when they join a meeting — <https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063916>
- The Waiting Room setting — <https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0059359>
- Share a cloud recording, Copy link and passcode — <https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067567>

**Stripe**

- Create a coupon and a promotion code; limit it to a product; expiry — <https://docs.stripe.com/billing/subscriptions/coupons>
- Discounts on one-time payments — <https://docs.stripe.com/payments/checkout/discounts>
- Sandboxes; Switch to sandbox — <https://docs.stripe.com/sandboxes> and <https://docs.stripe.com/sandboxes/dashboard/manage>
- The Customers and Transactions pages — <https://docs.stripe.com/dashboard/basics>
- The test card — <https://docs.stripe.com/testing>

**What the vendor pages did not confirm** (each is marked in the steps above): the name of the tag box inside the "Tag added" trigger; where a flow's settings open and whether "Contacts can re-enter flow" starts off; the button that saves a flow's email and returns to the flow; the button that opens the designer from a draft's **Content** section; the plain template's name; Vercel's "Ready" status word and the title of the Redeploy window for a Preview; Zoom's per-meeting mute check box and its copy-invite-link button; the label of the promotion-code box on Stripe's payment page. Vercel's pages describe a failed build as an errored deployment but have no single sentence saying the previous deployment keeps serving; that follows from a deployment being "the result of a successful build" and is how this project has always behaved.

Next step → `docs/OWNER-ACTIONS.md` Part 9 lists what this sprint needs from you, in order.
