# docs/content/ — Canonical content source for (Un)Retire

This folder is the build's canonical content source: the frozen approved copy
(`page-copy/*.md`) and the exact approved claims (`locked-facts.md`). Agents implement
both **verbatim** — no paraphrasing, no "improvements", no invented facts.

## Retrofit content policy

This is a **retrofit**: the site was already built and shipped into guest preview before
the Website-Development-System was adopted. There is no separately-approved launch copy
deck. Per the system's own retrofit rule (`Website-Development-System/development/templates/sprint-prompt.md`:
"the **shipped site is the approved baseline** for any copy already live";
`templates/close.md`: "the shipped site is the approved source for live copy"):

> **The SHIPPED SITE is the approved copy baseline.** What the live pages say today is
> the approved copy, exactly as it appears in the code — with the specific exceptions
> flagged in `locked-facts.md` (inconsistent or unverified claims awaiting owner
> resolution).

## What lives here

| File | Role |
|---|---|
| `page-copy/*.md` | Frozen per-page copy, extracted **verbatim** from the shipped pages (headings, body, CTAs, section order, alt text). Starts with `home.md`. |
| `locked-facts.md` | Exact approved claims (prices, counts, taglines, names) with their source in code, each verified against the code before locking. Also carries the **Flagged** list of claims that must NOT be treated as locked. |

## Extraction schedule

`page-copy/` starts with the home page only (Sprint S1.1). Every further page gets its copy
extracted verbatim into `page-copy/[page].md` **in the sprint that first touches that
page** — before that sprint edits it. Until a page is extracted, its shipped code remains
its approved copy source (the same baseline rule applies).

## How copy changes work

Per `docs/TECH-ARCHITECTURE.md` §8 ("Approved launch copy is the baseline. Later
editorial changes follow this workflow rather than silently editing frozen source
files"):

1. The change is made **first** in the relevant `page-copy/*.md` file (and in
   `locked-facts.md` if it touches an exact claim), with owner approval.
2. **Then** the code is updated to match, verbatim, in an authorized sprint task.

Never edit copy in the code and back-fill these files afterwards, and never let the two
drift: if code and these files disagree, report the mismatch — do not silently pick one.

New strings that have no approved source (error messages, labels, empty states) are added
via the copy file first, following the brand-voice rules in `docs/DESIGN.md`, rather than
invented inline in code.
