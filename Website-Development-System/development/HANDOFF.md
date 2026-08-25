# Handoff

How to hand [PROJECT_NAME] over to [CLIENT_NAME] (or an incoming team) so they own everything,
nothing depends on you personally, and the site stays maintainable.

## 1. Accounts and access inventory

Fill this table first. Every row must end up owned by the client.

| Service | Account | Owner after handoff | How transferred |
|---|---|---|---|
| GitHub — [REPO_NAME] | | [CLIENT_NAME] | Transfer repo / add client as owner, downgrade yourself |
| Hosting — [HOSTING_PROVIDER] / [HOST_PROJECT] | | [CLIENT_NAME] | Provider transfer/invite flow |
| Domain registrar — [DOMAIN] | | [CLIENT_NAME] | Registrar's own transfer flow (domain = client property) |
| Database/auth — [PROVIDER_OR_NONE] | | [CLIENT_NAME] | Transfer org/project ownership; delete row if none |
| Email provider (transactional/forms) | | [CLIENT_NAME] | Invite client as admin, remove yourself |
| Analytics / error tracking (if used) | | [CLIENT_NAME] | Transfer property ownership |

- [ ] Every service used by the site appears in the table — check env vars for ones you forgot.
- [ ] Each row states WHO owns it and HOW it was transferred or shared.

**Why this matters:** the most common post-handoff failure is a renewal or password owned by someone who left.

## 2. Credentials handling

- [ ] Never email or message passwords in plain text — use a password manager share or the provider's own invite/transfer flow.
- [ ] The client owns their accounts. You are removed, or downgraded to the minimum agreed role, at handoff.
- [ ] Rotate anything that was shared during the build: API keys, tokens, any password more than one person saw.
- [ ] After rotation, update the values in the host's env vars (and redeploy) — never in committed files.
- [ ] Confirm billing on every service points at the client's payment method, not yours.

**Never do this:**
- Never keep silent admin access "just in case" — access after handoff is agreed in writing or removed.
- Never hand over a key that was ever pasted into a chat without rotating it first.

## 3. Docs handoff — the repo docs pack IS the manual

There is no separate manual to write. Walk the client (or their next developer) through:

- [ ] `README.md` — what the project is, how to run it, where everything lives.
- [ ] `docs/PROJECT-STATUS.md` — the current state and the decision log (why things are the way they are).
- [ ] `docs/ROADMAP.md` — the post-launch backlog: what was deliberately deferred and where it's tracked.
- [ ] `docs/WORKFLOW.md` — how changes are made safely (their next developer starts here).
- [ ] **Predevelopment rationale** — copy or transfer the approved predevelopment pack, especially `00-START-HERE.md` decision log and files 02-07, into `docs/predev/` or the client handoff location. The reasoning behind scope, design, routes, copy, and wireframes must remain available after handoff.
- [ ] Env vars: `.env.example` lists every name; values live only in approved local/host secret stores and are never shown during the walkthrough.
- [ ] 30–60 minute walkthrough call: run the site locally, make a trivial change on a branch, open a PR, show the Preview.

## 4. Maintenance notes (leave these in writing)

- [ ] **How to request changes:** one change = one branch = one PR — even post-handoff, even for a typo.
      The workflow chain still applies: branch → build → local checks → PR → deployed Preview (Vercel or approved equivalent) → Codex review → merge → Production smoke test.
- [ ] **Dependency updates:** agree a cadence (e.g. monthly), always on a branch, always Preview-tested before merge.
- [ ] **When Production breaks:** who to call (name + channel), the host rollback action, the Git revert path, and database recovery limits in `docs/ROLLBACK.md`.
- [ ] **Monitoring & renewals:** who receives the uptime / primary-conversion / SSL / domain-expiry alerts, and what they do when one fires. Confirm the alerts point at a real, monitored person — a silent failure nobody is paged for is the same as no monitoring.
- [ ] **Content edits:** canonical source, editor roles, draft/review/publish flow, media ownership, redirects, and backup/export process. Approved launch copy changes deliberately, not ad hoc in components.
- [ ] **Locked facts/numbers:** hand over the list of exact claims the site makes so future edits keep them consistent.

## 5. Final checklist and sign-off

- [ ] All accounts transferred per §1; your access removed or downgraded as agreed.
- [ ] All shared credentials rotated per §2.
- [ ] Docs walkthrough completed; client knows where the manual lives.
- [ ] Maintenance notes delivered in writing.
- [ ] Open items from the backlog reviewed with the client — nothing surprising left.

**Sign-off**

| | Name | Date | Signature |
|---|---|---|---|
| Delivered by | | [DATE] | |
| Accepted by ([CLIENT_NAME]) | | [DATE] | |

Next step → project closed. Future work re-enters through `docs/WORKFLOW.md`, one branch at a time.
