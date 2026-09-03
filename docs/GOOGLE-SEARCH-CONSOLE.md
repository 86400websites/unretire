# Google Search Console — Setup & Standard Operating Procedure

> The repeatable process for getting (Un)Retire indexed by Google, and for every project after it.
> Companion to `docs/LAUNCH-CHECKLIST.md` (Phase 3 "Search console" line) and `docs/TECH-ARCHITECTURE.md` (§6 env vars).
> This is the whole path — from an empty console to "indexed and monitored" — written so a fresh session or a
> non-technical owner can run it without guesswork.

## 0. What this is (and the "MCP" question)

Google Search Console (GSC) is Google's free dashboard for how a site appears in Google Search: it verifies you
own the domain, accepts your `sitemap.xml`, shows which pages are indexed, and reports crawl or indexing errors.

**There is no first-party "Google Search Console MCP" server.** Two honest options exist for automation, and this
document covers both:

- **Manual (default, and all that launch needs):** the GSC web UI at <https://search.google.com/search-console>.
  Fifteen minutes, once. Everything in §2–§4 is manual.
- **Programmatic (optional, post-launch):** the **Search Console API** (`searchconsole.googleapis.com`) via a
  Google Cloud service account. This is what any "MCP" wrapper would call under the hood. Documented in §6 so the
  option is on record; it is **not** required to launch and is not wired up in this repo.

The site-side prerequisites — `sitemap.xml`, `robots.txt`, a canonical URL, no accidental `noindex` — are already
in the codebase (`src/app/sitemap.ts`, `src/app/robots.ts`, `metadataBase` in `src/app/layout.tsx`). GSC is the
external half.

## 1. Project facts (fill once per project)

| Slot | (Un)Retire value |
|---|---|
| Canonical production URL | `https://www.unretireproject.com` (apex 308-redirects to www — D-2) |
| Sitemap URL | `https://www.unretireproject.com/sitemap.xml` |
| Robots URL | `https://www.unretireproject.com/robots.txt` |
| Registrar (DNS) | GoDaddy |
| Host | Vercel |
| Canonical env var | `NEXT_PUBLIC_SITE_URL` (Production-scoped) — drives the sitemap/robots host and `metadataBase` |
| Google account for GSC | Owner's Google account (record WHICH one — indexing history lives with it) |

> Never launch GSC verification against `unretire.vercel.app` or a Preview URL — verify the **canonical domain only**,
> or the indexed URLs will be pinned to the wrong host.

## 2. One-time setup — verify domain ownership (~10 min)

Two property types. **Use a Domain property** — it covers `http`, `https`, apex and `www` in one, which matches
this site's apex→www redirect exactly.

1. Sign in to <https://search.google.com/search-console> with the owner's Google account (§1).
2. **Add property → Domain →** enter `unretireproject.com` (the bare domain, no `https://`, no `www`).
3. Google shows a **TXT record** to add to DNS. Copy it (`google-site-verification=…`).
4. In **GoDaddy → the `unretireproject.com` domain → DNS → Add record:**
   - Type: **TXT** · Name/Host: **@** · Value: the string from step 3 · TTL: default (1 hour).
   - Save. (This does not touch the existing Vercel A/CNAME records — a TXT record is additive.)
5. Wait for DNS to propagate (often minutes; allow up to an hour), then click **Verify** in GSC.
   - If it fails, wait longer and retry — do **not** delete the record. Verify against propagation with
     `nslookup -type=TXT unretireproject.com` (or `dig txt unretireproject.com`).
6. Verified. **Leave the TXT record in place forever** — removing it un-verifies the property.

> **Alternative if DNS is not available:** the **URL-prefix property** for `https://www.unretireproject.com` with the
> **HTML tag** method (a `<meta name="google-site-verification">` in `<head>`). If ever used, the tag goes in
> `src/app/layout.tsx` `metadata`, never hand-edited on the server.

### 2b. The method actually used for this project — HTML file (recorded 2026-09-03)

The owner chose the **URL-prefix property** `https://www.unretireproject.com/` with the **HTML file** method.
Google supplies a file named `google<token>.html` whose entire body is one line
(`google-site-verification: google<token>.html`) and requires it to answer at the site root.

**🔴 The one thing that makes this fail: where the file lives.** This is a Next.js App Router project, so a file
committed at the **repository root is not served at all** — only `public/` is published as static assets. The
verification file therefore belongs at:

```
public/google<token>.html      →  served at  https://www.unretireproject.com/google<token>.html
```

For this project the file is **`public/google777f049a86d5990c.html`** (moved there from the repo root in S5.1c,
2026-09-03 — at the root it would have 404'd and verification would have failed with no obvious reason why).

Two consequences worth knowing:

- **It only works after a deploy.** The file ships in the build, so Google cannot fetch it until the branch is
  merged and Production has redeployed. Verify in Search Console *after* the deploy, not before.
- **Never delete it.** Google re-checks periodically; removing the file un-verifies the property. It is committed
  to the repo, so it survives every future deploy on its own.

Confirm it is live before pressing **VERIFY**:

```bash
curl -s https://www.unretireproject.com/google777f049a86d5990c.html
# expected, exactly:  google-site-verification: google777f049a86d5990c.html
```

`robots.txt` allows this path (only `/api/` and `/account` are disallowed), so nothing blocks Google from
fetching it.

## 3. Submit the sitemap (~2 min, after §2)

1. GSC → left nav → **Sitemaps**.
2. Under "Add a new sitemap", enter **`sitemap.xml`** (the box is prefixed with the domain) → **Submit**.
3. Status should read **Success** within minutes to a day, with the discovered-URL count matching the sitemap
   (currently **32 URLs** — 20 marketing pages + 12 blog articles; confirm with the check in §5).
4. If it reads "Couldn't fetch", open `https://www.unretireproject.com/sitemap.xml` in a browser first — it must
   return XML, not a 404. (It is a static route generated at build; a missing one means the deploy predates this
   sprint.)

## 4. Request indexing (~5 min, optional but recommended)

Submitting a sitemap tells Google the pages exist; it still crawls on its own schedule (days to weeks). To nudge
the pages that matter:

1. GSC → **URL Inspection** (top search bar) → paste `https://www.unretireproject.com/`.
2. If it says "URL is not on Google", click **Request Indexing**. Repeat for the key money/marketing pages:
   `/`, `/book`, `/premium`, `/learn/course`, `/about`, `/assess`.
3. Do **not** mass-request every URL — Google rate-limits this and the sitemap already covers the long tail.

## 5. Verify the site side is correct (before and after submission)

Run these read-only checks against the live domain — all must pass, or GSC will index the wrong thing or nothing:

```bash
# Sitemap is served and lists the canonical host (not localhost / not a preview URL)
curl -s https://www.unretireproject.com/sitemap.xml | head -5

# Robots allows crawling and points at the sitemap
curl -s https://www.unretireproject.com/robots.txt

# No accidental noindex on a key page (header or meta) — this must return NOTHING
curl -sI https://www.unretireproject.com/           | grep -i "x-robots-tag"
curl -s  https://www.unretireproject.com/           | grep -i 'name="robots"'

# Canonical / og:url show the www host
curl -s https://www.unretireproject.com/ | grep -iE 'og:url|rel="canonical"'
```

Expected: sitemap XML with `https://www.unretireproject.com/...` locs; robots `Allow: /` with the sitemap line;
**no** `x-robots-tag: noindex` and **no** `<meta name="robots" content="noindex">`; og:url = the www host.

> These map directly to `docs/LAUNCH-CHECKLIST.md` Phase 1 "SEO basics" and Phase 3 "No accidental `noindex`" +
> "Search console: property added, ownership verified, sitemap submitted."

## 6. Optional — programmatic access (post-launch, not required to launch)

For automated indexing status or sitemap resubmission (e.g. a scheduled check), use the **Search Console API**:

1. Google Cloud Console → create/choose a project → **Enable** "Google Search Console API".
2. Create a **service account** → download its JSON key. **Store the key as a secret** (Vercel/GitHub Actions
   secret or a local file that is gitignored) — never commit it, never paste it anywhere in this repo. Treat it
   exactly like `SUPABASE_SECRET_KEY` per `docs/SECURITY-CHECKLIST.md`.
3. In GSC → property → **Settings → Users and permissions** → add the service account's e-mail as a user.
4. Call `webmasters.sitemaps.submit` / `urlInspection.index.inspect` from a server-only context with the key.

If a "GSC MCP" tool is ever adopted, it wraps exactly this API and this service-account credential. The safety
rules are the same as `docs/SUPABASE-MCP-SAFETY.md`: read-only where possible, credentials never in the repo,
manual approval on writes.

## 7. Ongoing monitoring (after launch)

- **Weekly for the first month, then monthly:** GSC → **Pages** (indexed vs not indexed, with reasons) and
  **Performance** (impressions/clicks — the first real "is anyone finding us" signal).
- **On any content/structure change:** re-run §5, and if routes were added/removed the next deploy regenerates
  `sitemap.xml` automatically — no manual resubmission needed unless GSC reports a fetch error.
- **Coverage errors** (404s Google found, redirect issues) → log to `docs/POST-LAUNCH-BACKLOG.md` and fix via the
  normal workflow.

## 8. Repeatable checklist (copy per launch)

- [ ] Canonical domain confirmed; `NEXT_PUBLIC_SITE_URL` set Production-scoped and deployed.
- [ ] `sitemap.xml` and `robots.txt` return correct content on the live domain (§5).
- [ ] Ownership **verified** — either the Domain property via DNS TXT (§2), or the URL-prefix property via the
      HTML file in **`public/`**, confirmed live with `curl` after the deploy (§2b). Never remove the proof.
- [ ] Sitemap **submitted** and reads **Success** with the expected URL count (§3).
- [ ] Key pages **Request Indexing**-ed (§4).
- [ ] No accidental `noindex` anywhere (§5).
- [ ] Monitoring cadence set with a named owner (§7).

Next step → run `docs/LAUNCH-CHECKLIST.md` Phase 3; log anything GSC flags to `docs/POST-LAUNCH-BACKLOG.md`.
