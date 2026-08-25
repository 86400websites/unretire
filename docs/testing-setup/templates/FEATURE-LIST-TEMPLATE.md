# Feature List — [PROJECT_NAME]

> Everything the site does, one plain-English line each. **Everything on this list gets tested; nothing off this list does.** Drafted by Claude Code from a full scan of the code plus the predevelopment docs; approved by the owner before any test is written.

- Source scan date: [DATE] · Repo head: [SHA]
- Test users (non-production only): [visitor@example.test] · [member@example.test] · [admin@example.test]
- **Owner approval: [NAME], [DATE]** ← no tests are written until this line is filled.

**How to read a line:** `ID | Who can do what | What proves it worked`. If a plain-English line here is wrong or missing, the tests will be too — this list is where your ten minutes matter most.

---

## A. Pages & content

| ID | Feature | Proof of PASS |
|---|---|---|
| PG-001 | Every public page loads with no errors, on desktop and mobile | Page renders, zero console errors |
| PG-002 | Every link on every page goes somewhere real | No 404s, no dead anchors |
| PG-003 | A wrong URL shows the site's own 404 page | Branded 404, not a blank error |
| PG-… | [Page-specific content promise, e.g. "Home shows the three pricing tiers"] | [Visible proof] |

## B. Accounts & access *(skip section if the site has no accounts)*

| ID | Feature | Proof of PASS |
|---|---|---|
| AC-001 | A visitor can create an account | Account exists, confirmation flow completes |
| AC-002 | A member can log in and log out | Lands on [route]; session ends on logout |
| AC-003 | Password reset works end to end | Reset email arrives (test hook) and the link works on THIS environment |
| AC-010 | **A non-member cannot open any members-only page, even by typing the URL directly** | Redirect or denied — never the content |
| AC-011 | **A member cannot open admin pages** | Denied |
| AC-… | [One allowed + one denied line per role boundary] | |

## C. Forms & email

| ID | Feature | Proof of PASS |
|---|---|---|
| FM-001 | [Form name] rejects bad input with a clear message | Inline error, no submission |
| FM-002 | [Form name] valid submission works end to end | Success state + delivery recorded (test hook) + second capture path |
| FM-003 | [Triggered email] is sent with the right content and links | Captured via provider test hook — never a real inbox |

## D. Payments *(Stripe test mode only)*

| ID | Feature | Proof of PASS |
|---|---|---|
| PY-001 | [Product/tier] can be purchased with the test card | Success page + test-mode record exists |
| PY-002 | A declined test card shows an honest failure, not a fake success | Clear error, no access granted |
| PY-003 | Paying unlocks exactly what it should — and nothing before payment | Access flips only after test-mode payment confirms |
| PY-004 | Double-clicking Buy does not create two charges | One test-mode charge, one record |

## E. Protection *(being blocked is the PASS — per SECURITY-CHECKLIST §5)*

| ID | Feature | Proof of PASS |
|---|---|---|
| PR-001 | Hammering login with wrong passwords gets blocked | Rate limit engages |
| PR-002 | Rapid-fire submissions to [public form] get rejected | Rate limit / bot check rejects |
| PR-003 | Submitting [form] without the human-check token is rejected | Server-side rejection |

## F. Integrations & everything else

| ID | Feature | Proof of PASS |
|---|---|---|
| IN-… | [Analytics fires on key pages / Mailchimp tag applied / etc.] | [Observable proof, test hooks only] |

## G. Manual checks *(real but not robot-testable — still on the list, still need evidence)*

| ID | Feature | How a human verifies |
|---|---|---|
| MN-001 | [e.g. Waitlist email renders correctly in Gmail and Outlook] | [Exact steps + screenshot evidence] |

---

## Cross-check findings (docs vs code)

- **Promised in predevelopment docs but missing in code:** [none / list — each is a finding before any test runs]
- **Found in code but not in docs:** [none / list — included above, marked "(found in code, not in docs)"]

## Change log

Approved lines are never silently edited. Every later addition or change: [DATE — ID — what changed — re-approved by].
