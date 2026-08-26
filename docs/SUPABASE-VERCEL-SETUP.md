# SUPABASE-VERCEL-SETUP.md — Optional Vercel + Supabase Profile

Use Part A only when `[HOSTING_PROVIDER]` is Vercel. Use Part B only when `[DATABASE_PROVIDER]` or `[AUTH_PROVIDER]` is Supabase. Other providers must implement the equivalent isolation, Preview, access-control, and recovery rules in `TECH-ARCHITECTURE.md`. Names and steps only — **no real values ever go into this or another committed file**.

> Connecting a coding agent to Supabase via **MCP**? Read `SUPABASE-MCP-SAFETY.md` first — non-production only by default; production MCP stays disconnected unless a recorded read-only exception is approved.


> ## (Un)Retire project values — added 2026-08-25 (Sprint S1.1) · **reconciled 2026-08-25**
>
> This file is the SOP guide copied verbatim; its `[BRACKETS]` are the generic slots. For this project they resolve to:
>
> | Slot | Value |
> |---|---|
> | `[HOSTING_PROVIDER]` | Vercel — **both Parts A and B apply to this project** |
> | `[DATABASE_PROVIDER]` / `[AUTH_PROVIDER]` | Supabase (Postgres + Supabase Auth) |
> | `[REPO_NAME]` | `86400websites/unretire` (default branch `master` — see Open decision D-1) |
> | `[VERCEL_PROJECT]` | ~~⚠ Owner to confirm the Vercel project name~~ → **`unretire`**, in the Vercel scope `86400-s-projects`. Production deploys from `master`; Preview URLs follow `https://unretire-git-<branch>-86400-s-projects.vercel.app` |
> | `[DOMAIN]` | ~~⚠ TBC — Open decision D-2~~ → **D-2 resolved: `unretireproject.com`** (apex; `www` also registered). ⚠ **Not yet live** — the domain is added in Vercel but DNS is still parked at GoDaddy, so the application is currently served at **`https://unretire.vercel.app`**. Read `[DOMAIN]` in Part A as that host until the DNS cutover (Known issue 27) |
> | `[SUPABASE_PROJECT]` | ~~⚠ Owner to confirm. A **non-production** project is required before the Launch Gate~~ → **D-8 resolved: both projects exist.** PROD `unretire-prod` · ref `hcjivvlwxltyiycfbttc` · eu-west-1. TEST `unretire-test` · ref `dtdadtggahjsrmevwvbu` · ap-south-1 (free tier — it auto-pauses when idle). Refs are public identifiers and safe to record |
>
> **Branch-name override — added 2026-08-26 (stage-gate Round 3, Finding 7).** The generic SOP body below
> says **`main`** in its Part A3 deployment-flow steps ("merges to `main` deploy Production"; "Protect
> `main` on GitHub"). This repository's default branch is **`master`** — read **every bare `main` in the
> body below as `master`** until Open decision D-1 (the optional rename) is resolved. The body itself stays
> byte-identical to the SOP source on purpose; this override governs. Concretely: Production deploys from
> `master`, and the branch the owner protects in Sprint S2.1 is `master`.
>
> **B6 wiring status — done 2026-08-25.** Vercel **Preview** now points at the **TEST** project and
> **Production** at the **PROD** project: the three Supabase entries are split per environment, and the four
> Stripe entries in Preview hold **sandbox-account** values. The B6 verification step below (sign up on a
> Preview, confirm the user appears in TEST and not PROD) is **not yet performed** — it is proof **P2** in
> `docs/ENVIRONMENT-PARITY.md` §8, owned by Sprint S2.5. Treat the wiring as *configured*, not *verified*.
>
> **B3 auth URL status — configured 2026-08-25.** `unretire-prod` now has **Site URL `https://unretire.vercel.app`**
> and a redirect allow-list of `http://localhost:3000/**`, `https://www.unretireproject.com/**`,
> `https://unretireproject.com/**`, `https://unretire.vercel.app/**`, `https://*-86400-s-projects.vercel.app/**`
> — replacing an empty list and a `http://localhost:3000` Site URL that had been breaking every production
> confirmation and password-reset email. Two stale third-party hosts were removed at the same time.
> ~~**`unretire-test` has not been configured yet.**~~ **Both projects are now configured (2026-08-25):**
> `unretire-test` **is configured** (verified 2026-08-25 from the owner's dashboard): Site URL `http://localhost:3000`, allow-list `http://localhost:3000/**` and `https://*-86400-s-projects.vercel.app/**`. Two caveats before this is called finished: the last two
> production entries are broader than B3's "no broad wildcards" rule and are retained knowingly for now, and
> **a correct allow-list here does not make the application's own redirect handling safe** — see
> `docs/ENVIRONMENT-PARITY.md` §5.3b.
>
> Retrofit note: this site is already deployed, so Part A is a **reconciliation** checklist (confirm what is
> already configured) rather than a from-scratch setup. Values are set by the owner in the provider
> dashboards — never in this or any committed file. The per-variable state, and every proof still outstanding,
> live in `docs/ENVIRONMENT-PARITY.md`; that file is the source of truth for this project's environments and
> this block only points at it.


## Part A — Only if using Vercel

### A1. Create the project

- [ ] Make `[REPO_NAME]` available on GitHub through the owner-authorized setup workflow — GitHub is the source of truth.
- [ ] In Vercel: **Add New Project** → import `[REPO_NAME]` → confirm the framework preset and install/build commands match `TECH-ARCHITECTURE.md` and the repository manifest.
- [ ] Name the Vercel project `[VERCEL_PROJECT]`; leave the root directory as the repo root unless the app lives in a subfolder.

### A2. Environment variables (per environment)

Vercel has three environments: **Production**, **Preview**, **Development**. Set every variable per environment — same names everywhere, environment-specific values.

- [ ] The authorized owner adds each name from the project's architecture/env list with the correct environment scope; agents never handle or echo values.
- [ ] Mark every server-only value as **Sensitive**.
- [ ] Never copy a Production value into Preview — especially the site URL and any database credentials.
- [ ] After adding or changing any variable: **redeploy**. Existing deployments do not pick up new values; public-prefixed values are baked in at build time.

Why this matters: one shared value across environments is how Preview testing quietly mutates production data.

### A3. Deployment flow

- [ ] Confirm: every PR gets an isolated **Preview** deployment; merges to `main` deploy **Production**.
- [ ] Protect `main` on GitHub (PR + CI green required) so nothing reaches Production without: branch → build → local checks → PR → deployed Preview → Codex review → merge → Production smoke test.

### A4. Custom domain + SSL

- [ ] Add `[DOMAIN]` in Vercel → Domains; follow the DNS instructions shown (Vercel's dashboard is authoritative for the records).
- [ ] Wait for SSL to issue automatically; confirm `https://[DOMAIN]` loads and `http://` redirects to `https://`.
- [ ] Update the site-URL env var (e.g. `NEXT_PUBLIC_SITE_URL`) in **Production only** to `https://[DOMAIN]`, then redeploy.

### A5. Verify on the deployed site

- [ ] `curl -I https://[DOMAIN]` — confirm the security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are present on the live response, not just in config.
- [ ] Click through the deployed site desktop + mobile; check the browser console for errors.

## Part B — Only if using Supabase

### B0. Decide first

Many websites need no database. Select Supabase only when the approved architecture needs its auth, stored data, or gated-content capabilities; otherwise skip this part and record `None` or the chosen provider.

### B1. Create TWO projects

- [ ] Create `[SUPABASE_PROJECT]-test` (development + Preview) and `[SUPABASE_PROJECT]-prod` (Production). **Never share one database across environments.**
- [ ] Record project names/refs (never keys) in the project status doc.

### B2. The key boundary

The **only** values that may ever appear in frontend code or public env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only secrets—the secret key (`sb_secret_*` / `service_role`), database password, JWT secret, or connection string—may be read only in trusted server contexts defined by the selected framework. Most sites never need them in app code at all.

**Never do this:**
- Never put any of those behind a `NEXT_PUBLIC_*` name.
- Never import them into browser/client code or pass them through serialized props.
- Never write them into any committed file, doc, PR, or screenshot.
- If one is ever exposed: rotate it immediately — do not try to scrub git history.

### B3. Auth & sessions

- [ ] Use Supabase's current integration pattern for the locked framework (for example, its SSR package where server rendering is used): separate public/browser and trusted server clients, with correct session refresh.
- [ ] In the Supabase dashboard (each project): set the Site URL and a **tight** redirect allow-list — localhost, your Preview URL pattern, and Production only. No broad wildcards.
- [ ] Confirm auth emails use the template's dynamic redirect variable, not a hardcoded site URL — otherwise Preview signups get sent to Production.

### B4. RLS from day one

- [ ] Enable Row Level Security **default-deny on every user-reachable table before any user data lands**. Then add minimum-grant, owner-scoped policies.

Why this matters: RLS is the last line of defense when application code gets a check wrong.

### B5. Migration workflow

- [ ] Every schema change lives in the repo as numbered SQL: up-SQL + a paired `.down.sql` + the RLS policies, all in the same PR.
- [ ] Apply through the project's approved migration procedure: **TEST first → verify per role → owner approval → PROD**. Do not let an AI agent apply a Production migration without explicit authorization.
- [ ] Keep changes backwards-compatible so code and schema can deploy independently — a hosting rollback does NOT roll back the database.

### B6. Wire Vercel env vars to Supabase

| Env var name | Value | Production | Preview / Development | Public or server-only |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | *(never write here)* | PROD project URL | TEST project URL | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | *(never write here)* | PROD publishable key | TEST publishable key | Public |
| `NEXT_PUBLIC_SITE_URL` | *(never write here)* | `https://[DOMAIN]` | Preview origin (or unset) | Public |
| `SUPABASE_SECRET_KEY` *(only if truly needed)* | *(never write here)* | PROD secret | TEST secret | Server-only, Sensitive |

⚠️ **The Value column stays blank forever.** Real values live only in an ignored local env file and the Vercel dashboard. Agents do not open or copy them. Never fill values into this or any committed file.

- [ ] Preview + Development point at the **TEST** project; Production points at the **PROD** project.
- [ ] After wiring: sign up on a Preview deploy and confirm the confirmation email links back to the **Preview** origin, and the new user appears in the **TEST** project — not PROD.

Next step → read `docs/ENV-VARS-SAFETY.md` before handling any secret, then run `docs/SECURITY-CHECKLIST.md` before launch.
