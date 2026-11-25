# Selected stack: Netlify + Supabase + GitHub

**Version:** v0.1.6 — 2026-11-25. **State:** SELECTED BY USER, **NOT DEPLOYED**. Original statement `SRC-CHAT-STACK-SELECT` is preserved verbatim. Main decision: `DEC-035`. This document supersedes preceding platform *candidate* guidance for subsequent development, but does not erase the historical alternatives.

## What is chosen

```text
Private GitHub repository
    | versioned source, migrations, docs, tests; CI (proposed)
    v
Netlify: PWA/static frontend + optional server functions
    | Auth session, constrained requests; no elevated secrets in browser
    v
Supabase: PostgreSQL / Auth / security (RLS and server-side RPC)
    | immutable inventory events, catalogue/version history, imports
    v
Controlled audit views, current inventory, historical balance

Recovery proposal (NOT YET ACCEPTED/VERIFIED):
Scheduled secure export via GitHub Actions or controlled trusted runner
    -> client-side encrypt -> private Netlify Blobs, versioned store
    -> periodic separate offline encrypted copy and tested clean-room restore
```

The chosen 3 providers do not imply a fourth mandatory commercial service. The build must never rely on public access to inventory data merely because the PWA HTML is public. Back-end authorization belongs in Supabase policies and atomic operations; Netlify server functions must independently check privilege for any actions they mediate.

## What is not chosen or decided

- Cloudflare D1/R2/Workers are historical evaluated options, **not** the selected production architecture (`DEC-028` superseded by `DEC-035`).
- Netlify **Blobs Beta** remains a *proposed* encrypted backup store (`DEC-036`), not a guaranteed or only recovery copy. Confirm the storage service availability, data residency, privacy of the objects, integrity checks, retention, restore quality and the ability to recover after Netlify-account compromise.
- Supabase **Free** is not a promise of uninterrupted yearly service. A free project may pause for low activity; there are no managed automatic Free backups. A production operating process is required.
- Netlify Free's 300 monthly credits and hard cap mean it is not an unlimited hosting resource. Before real deployment, establish cost/usage alarms and a contingency if operations are interrupted when credits run out. Free pricing may change.
- Do **not** link billing or a credit card or upgrade plans without a separate explicit user authorization. The user objected to billing-subscription exposure (`SRC-CHAT-NO-BILLING`).
- Do not invent a final application framework (React/Vue/Svelte etc.), schema, pricing algorithm, or administrator UI until separately decided; stack provider choice alone is not a design specification.

## Netlify and GitHub Free compatibility gate

As of the 2026-11-25 official Netlify documentation: Netlify Git-based deployment supports **private repositories owned by a personal GitHub account** on Free. Git-connected **private organization-owned repositories** need an eligible paid Netlify plan (Core Pro/Enterprise, depending on provider). Determine repository ownership **before** setting up an auto-deploy. If the owner is an organization, explore/test a compliant GitHub Actions CLI/API deploy from the private org repository, without making source public or assuming it avoids Netlify plan restrictions.

Official references:
- https://docs.netlify.com/build/git-workflows/overview/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/backups

## Implementation sequence (each stage independently verified)

1. **Ownership and tenancy**: agree whether GitHub private repository is personal or organization-owned, and assign durable admin ownership and recovery contacts for all three services. Activate MFA; audit repository team permissions. No secrets in Git history.
2. **Safe repository**: commit only sanitized new code, documentation and migrations; `.gitignore` and automated secret checks. **Never** commit legacy PHP archive, SQL dumps, old passwords, real catalogue, `.env` or backups.
3. **Supabase test instance**: use synthetic records, versioned Postgres migrations, least privilege, RLS from day one, security tests using an ordinary employee and an admin. Transactional append-only ledger; no float/double for money; catalogue import rules matched to legacy after tests.
4. **Netlify preview deployment**: deploy static PWA with public/publishable Supabase client values only, and test login/logout, barcode permissions, error handling and staff access. Server-only Netlify Functions use scoped secrets; no administrative secret in client bundle.
5. **Recovery prototype**: encrypted full backup (including data/schema/Auth/roles; separately assess storage files), store privately with retention/versioning, restore to a different test project, compare exact financial totals and historical event hashes. Verify that private keys can be recovered without access to the original cloud accounts. Only then confirm backup medium and frequency.
6. **Production gate**: measure traffic/credits and ensure seasonal availability, monitoring, incident response, access controls, two-user tests, legacy-matching accounting regression, and tested restore. Deploy real data only after explicit authorization and evidence.

## Acceptance gates (NOT_RUN)

- `TC-061`: selected 3-provider topology and Netlify Free repo ownership compatibility.
- `TC-062`: authenticated PWA deployment with public versus secret configuration separation.
- `TC-063`: two-user RLS, append-only and transactional catalogue/ledger writes.
- `TC-064`: encrypted backup outside Supabase plus full clean-room restore, no unprotected SQL dumps.
- `TC-065`: no billing activation, Netlify credit visibility and Supabase pause scenario.

**Open questions:** `Q-030` repository owner, `Q-032` Netlify Blobs Beta for backups, `Q-033` recovery key custodian, `Q-034` Netlify Free actual production readiness and capacity. Note: selecting the providers does not answer them.

**Evidence state:** public vendor docs inspected 2026-11-25; none of the cloud accounts were connected; no Git repository, Netlify site, Supabase project, encrypted dump, RLS policy, migration or restore was created or tested. The legacy archive was not included in this documentation package.
