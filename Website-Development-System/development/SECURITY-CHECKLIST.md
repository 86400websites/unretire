# SECURITY-CHECKLIST.md — Pre-Merge & Pre-Launch Security Gate

Run the relevant sections before merging any risky change (auth, database, forms, env handling, headers, routing). Run the **full checklist** before launch and after every production deploy. Items marked 🔴 are **blocking — never merge with one unresolved**. Verify each claim against the repo and the live site; never tick from memory.

## 1. Secrets & repo hygiene

- [ ] 🔴 No secret (API key, token, password, connection string, private URL) is hardcoded anywhere in the code. — *Verify: search the repo for key-like strings and every provider name you use.*
- [ ] 🔴 `.env.local` is gitignored and has never been committed. — *Verify: `git check-ignore .env.local` succeeds and `git log --all -- .env.local` returns nothing.*
- [ ] `.env.example` contains variable NAMES and safe placeholders only — never a real value. — *Verify: open the file and read every line.*
- [ ] Before every commit: run `git status` and confirm no env file or secret is staged. — *Verify: make it a ritual; CI secret scan (e.g. gitleaks over full history) backs it up.*
- [ ] Secrets are referenced by env-var name only — never by value, even in comments, docs, PRs, or screenshots. — *Verify: read the PR diff and description.*

**Never do this:** if a secret leaks, never try to scrub git history as the fix. **ROTATE FIRST** — the key is compromised the moment it was exposed. Then clean up, update all environments, and redeploy.

## 2. Env boundary

- [ ] 🔴 No server-only secret sits behind the framework's public prefix (e.g. `NEXT_PUBLIC_*`). — *Verify: list every public-prefixed var and confirm each is genuinely world-safe.*
- [ ] Public vars contain only URLs, publishable keys, and site config — nothing sensitive. — *Verify: assume everything public-prefixed ships in the browser bundle.*
- [ ] Server-only vars are read only in trusted contexts defined by the locked framework — never imported into browser code, serialized props, HTML, logs, or client-visible errors. — *Verify: search each server-only var name and inspect every read without printing its value.*

Why this matters: public-prefixed values are inlined into the client bundle at build time — they are world-readable forever.

## 3. Auth & access *(skip if the site has no login)*

- [ ] 🔴 Every gated route checks the session (and any role/approval flag) **server-side**. File location is not access control. — *Verify: open each gated route and find the explicit server check.*
- [ ] 🔴 Admin routes additionally verify admin rights server-side against a dedicated role/table — a logged-in user is not an admin. — *Verify: read the admin route code, per request.*
- [ ] No public endpoint reveals whether an email or account exists (enumeration oracle). — *Verify: submit a known and unknown email to signup/reset/apply flows and compare responses.*
- [ ] Redirect targets are validated same-origin; any origin derived from `host`/`x-forwarded-host` is checked against an allow-list. — *Verify: read the redirect code; try a forged `next=` parameter.*
- [ ] Auth email links resolve to the origin that generated them — Preview never sends users to Production. — *Verify: trigger a signup/reset email from a Preview deploy and inspect the link.*

## 4. Database *(skip entirely if the site has no database)*

- [ ] 🔴 Row Level Security (or the provider's equivalent) is enabled **default-deny** on every user-reachable table before any user data lands. — *Verify: list all tables and their policies in the dashboard.*
- [ ] Policies are minimum-grant and owner-scoped (users read/write only their own rows). — *Verify: read each policy; test as a second user.*
- [ ] Controlled cross-user reads/writes use hardened stored procedures: pinned search path, authorization from the session (never trusting arguments), narrow returns, revoke-then-grant execution. — *Verify: read each function definition against all four parts.*
- [ ] Public data projections expose only safe metadata — never emails or other PII. — *Verify: call each public read path unauthenticated and inspect the response.*
- [ ] Migrations were reviewed under the chosen tool's strategy, classified additive/reversible/destructive, and applied to non-production first; destructive work has an approved backup/PITR and restore plan. — *Verify: check migration records and recovery evidence; a down migration does not restore lost data.*

## 5. Public forms & writes

- [ ] Every public write is validated server-side with a schema (client validation is UX, not security). — *Verify: read each handler; POST malformed data directly.*
- [ ] Public writes use the anti-abuse controls required by `TECH-ARCHITECTURE.md` (normally rate limiting plus server-verified bot protection for internet-facing submissions). Any exception is risk-assessed and recorded. — *Verify each configured control directly, including rejection without its proof/token.*
- [ ] House standard for these controls (a different choice requires a logged decision): **Upstash** rate limiting on public writes and auth endpoints, **Cloudflare Turnstile** server-verified bot check on internet-facing forms — both free-tier at this scale. The Launch Gate's Protection tests (`docs/testing-setup/`) verify them automatically by exceeding the limit / omitting the token and confirming rejection.
- [ ] 🔴 **Any internet-facing public form ships with at least one enforced abuse control at launch** — a server-verified bot check and/or a rate limit. Basic abuse protection is **launch-blocking, not deferrable to "required before scale"**; only *advanced* hardening may be deferred, and only with a logged decision. An unprotected public form floods the client's inbox, burns email quota, and can blacklist the sending domain (which then breaks deliverability). — *Verify: submit without the bot token / exceed the rate limit on the deployed site and confirm rejection.*
- [ ] 🔴 In Production, anti-abuse and delivery dependencies **fail CLOSED**: if a required key is missing, the form refuses the submission with an honest error — it never silently drops data. No-op is acceptable only in local/Preview. — *Verify: read the env-absence branch of each handler and check which environment signal it keys on.*

Why this matters: a form that "works" but silently loses submissions in production is worse than one that's down.

## 6. Headers & transport

- [ ] Security headers are set in framework config on a catch-all rule: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. — *Verify: read the config.*
- [ ] 🔴 Headers are **verified on the deployed site**, not just in config. — *Verify: `curl -I` the production URL (or use browser devtools / an online header scanner) and confirm each header is present.*
- [ ] CSP allow-list contains only origins the site actually loads; every extension is the narrowest origin, added per recorded decision. — *Verify: diff the CSP against the third parties actually in use.*
- [ ] HTTPS everywhere, no mixed content; external `_blank` links carry `rel="noopener noreferrer"`. — *Verify: browser console + a crawl of external links.*

## 7. Error hygiene

- [ ] No stack trace, internal path, credential, or raw upstream error body is ever returned to the user. — *Verify: force an error on each public handler/endpoint (bad input, provider down) and inspect the response.*
- [ ] Logs and error tracking contain no secrets and minimal PII. — *Verify: inspect a sample of real log/tracker events.*

## 8. Dependencies

- [ ] No known-critical vulnerability in anything that ships to production. — *Verify: run the package manager's audit and check the repo's dependency alerts; triage everything critical/high.*
- [ ] Every new dependency was justified; the lockfile is committed and in sync. — *Verify: PR review + a frozen-lockfile install passing in CI.*

## 9. Project-specific security rules 🔴

**Blocking: never merge a PR with one of these unresolved.** Each project writes its own invariants here — the concrete access rules its architecture promises. Mirror them from the architecture doc so the two cannot drift, and date each one when it's set. Make them concrete and checkable, not abstract.

Generic examples of the shape:

- [ ] 🔴 Gated content is never readable by an anonymous or unapproved user through any path — UI, API, or database projection. *(set [DATE])*
- [ ] 🔴 Private files are served only via short-lived server-issued signed URLs to authorized users; public files are explicitly enumerated. *(set [DATE])*

---

**Quick pre-merge gate:** 1. no secrets / live env file in diff (§1) → 2. env boundary clean (§2) → 3. trusted-boundary auth checks on anything gated (§3) → 4. selected data-access controls on new/changed stores (§4) → 5. public writes validated + protected + fail-closed as designed (§5) → 6. headers untouched or re-verified (§6) → 7. project invariants intact (§9).

Next step → after the security gate passes, run `docs/QA-CHECKLIST.md`, then `docs/LAUNCH-CHECKLIST.md` before going live.
