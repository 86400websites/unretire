# UnRetire — Webinar Registration — Handoff

Adds the free-live-webinar registration machine to UnRetire, mirroring the
Bouncing Forward pattern, adapted to UnRetire's own code (flat routes, inline
Mailchimp, navy/orange brand).

## Final URL for the ads team (Roelien / Randa)

**`https://<unretire-domain>/webinar`**  — this repo uses **flat routes** (no
`/unretire/` prefix), so the landing page is `/webinar`, not `/unretire/webinar`.
This is the click-through destination for every social post and the ad.

## Files in this bundle (apply over the repo, paths preserved)

| File | New/changed | What |
|---|---|---|
| `src/app/webinar/page.tsx` | NEW | Registration landing page (server component): title/host/date, ad artwork beside the form, og:image. |
| `src/app/webinar/WebinarForm.tsx` | NEW | Client form island: first/last name, email, country (select, default South Africa), hidden honeypot. Keeps typed values on failure. Single session — no session chooser. |
| `src/app/api/webinar/route.ts` | NEW | Server endpoint: validates, honeypot pretends success, Mailchimp upsert (FNAME/LNAME + COUNTRY with graceful retry-without), tags `webinar` + `webinar-nov4-1900`, honest 503 when Mailchimp isn't configured. |
| `src/app/page.tsx` | CHANGED | Homepage webinar promo band (graphic + details + "Reserve your seat →"). Clearly marked and movable. |
| `src/app/unretire.css` | CHANGED | Spacing shim regenerated from a full `src/app` rescan (superset of the old shim + the new pages' utilities). |

Nothing else is touched. No main-site / globals / root-layout changes.

## Verification done here

- **typecheck** `pnpm exec tsc --noEmit` → **PASS**
- **format** `pnpm exec prettier --check` (the 5 files) → **PASS**
- **lint** `pnpm exec eslint` on the 5 files → **PASS** (exit 0)
  - ⚠️ Repo-wide `pnpm lint` fails on ONE **pre-existing, unrelated** error:
    `src/app/premium/page.tsx:182` uses `<a href="/learn/course/">` instead of
    `<Link>`. Not part of this work; it will fail the CI `lint` gate until fixed
    (one-line swap to `next/link`). Say the word and I'll include the fix.
- **running-server smoke** (`next dev`, grepped every claim) → **PASS**
  - `/webinar` renders: title, "A live conversation", Maher Kaddoura,
    Wednesday 4 November 2026, 19:00 SAST, "One live session", the honeypot,
    and `og:image` resolving to an absolute URL.
  - `/` renders the promo band and links to `/webinar`.
  - API paths: honeypot→`200 {success:true}` (no Mailchimp call) · invalid
    email→`400` · missing first name→`400` · valid submit with Mailchimp
    **unconfigured → honest 503** (never a fake "you're registered").
- **build** `pnpm build` — **run it locally / let Code Check run it.** It
  could not complete in my sandbox because the network blocks Google Fonts
  (`next/font` in `layout.tsx`, which I didn't touch) — environmental, affects
  every route. The new code compiles cleanly (typecheck + live render prove it).

## Before it can ship — needs you / the team

1. **Ad artwork asset (blocker for the visual + og:image).** Drop the approved
   ad image at:
   `public/assets/unretire/images/webinar/unretire-webinar.png`
   and **commit it.** (Known gotcha on this repo: `public/` images have gone
   missing from commits before — if `git status` doesn't show it, `git add -f`.)
   Until it's there, the page/promo show an empty image box and the social
   preview has no picture. If you give me the file I'll place and reference it.
2. **Heather's copy.** All page/form wording is **adapted, pending her
   blessing** (see "Copy flagged for Heather" below). If she sends an UnRetire
   registration HTML/doc, it's verbatim law and I'll swap it in.
3. **"Workbook" word.** The privacy line currently reads *"We'll only use your
   details to send you the joining link and reminders for this webinar."* I
   **dropped "workbook"** because none is confirmed for this event. If there is
   one, I'll add it back.
4. **Mailchimp COUNTRY merge field.** Confirm the UnRetire audience has a
   `COUNTRY` text merge field. If it does, country is stored. If not, the code
   **gracefully retries without it** (registration still succeeds) — but country
   won't be saved. Add the merge field if you want to keep it.
5. **Verified From address + domain auth (blocker for the confirmation email).**
   Confirm UnRetire sends from a verified From address and its sending domain is
   authenticated in Mailchimp (DKIM CNAMEs + DMARC) — the same hurdle BF cleared.
   If not authenticated, the journey email won't deliver reliably.

## Mailchimp — Sozana's tasks (UnRetire audience)

- **ONE journey.** Trigger: *Tag added* → **`webinar-nov4-1900`** → one immediate
  email. Subject: **"You're in: What's still ahead… when work is behind you?"**,
  host Maher Kaddoura, Wednesday 4 November 2026, 19:00 SAST, `Hi *|FNAME|*,`,
  **no joining link**, UnRetire sign-off. (Draft copy in `confirmation-email-draft.md`.)
- **Turn the journey ON before the PR merges** — journeys are not retroactive.
- **Reminder (3 Nov)** and the **joining-link email** = scheduled campaigns to
  the `webinar-nov4-1900` tag segment, not journey steps.
- **STANDING RULE:** every broad UnRetire send must **exclude the `webinar`
  tag** — these people opted in for this event only.

The site applies BOTH tags on registration: `webinar` (standing audience tag)
and `webinar-nov4-1900` (the journey trigger).

## Copy flagged for Heather (adapted — needs her blessing)

- H1: "What's still ahead… when work is behind you?" + "A live conversation" (from the ad — verbatim).
- Hero sub: "With Maher Kaddoura" / date line / "Your joining link will be emailed closer to the day."
- "What to expect" 3 bullets (adapted — placeholder).
- Form heading: "Save your spot — it's free." / button "Reserve your seat".
- Registered state: "Thank you, [name]. Your seat is reserved. We've sent a confirmation to [email]. Your joining link will follow closer to the day." (from the brief — verbatim).
- Failure: "Sorry, something went wrong. Please try again in a moment." (from the brief — verbatim).
- Privacy line (see #3 above).
- Homepage promo band headline + blurb.

## Decisions left open (not done — your call)

- **No nav link added.** The webinar is a campaign landing page reached from the
  ad + homepage promo. If you want it in the top nav, say so.
- **Thin announcement band under the hero** — optional in the brief; not added.
  The promo band (required by the brief) is in place.
- Promo-band **placement** — currently right after the homepage signature quote.
  Easy to move; it's one self-contained `<section>`.

## Delivery

Branch → PR → green Code Check → merge. Local gates:
`pnpm exec tsc --noEmit` · `pnpm lint` · `pnpm exec prettier --check .` · `pnpm build`

## Note on the blueprint

The `bouncing-forward.zip` I had is an Aug-30 snapshot that **predates** the BF
webinar feature — it has no `webinar/` page, `api/webinar/` route, or
registration form. So I reconstructed the machine from UnRetire's own
`/api/subscribe` + `EmailCaptureForm` conventions plus the event facts, rather
than porting the exact BF files. If you can send the real BF webinar files
(`webinar-registration.zip`), I'll diff against them to catch any drift.
