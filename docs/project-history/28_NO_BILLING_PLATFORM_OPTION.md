# Hosting without a billing subscription — Netlify Free candidate

**Version:** 0.1.5 (2026-11-25). **Status:** research/proposal, NOT selected or deployed. **Primary user source:** `SRC-CHAT-NO-BILLING` (verbatim: `sources/USER_INPUT_REGISTER.json`). Requirements `REQ-051..052`, decisions `DEC-032..034`, tests `TC-057..060`, all tests **NOT_RUN**.

## User intent and constraints
- Supabase does not raise an objection; leave PostgreSQL and Auth on Supabase (although its Free plan pausing and lack of backups still apply).
- Avoid activating **Cloudflare R2 billing subscription** to access its 'free' quota; avoid payment-method exposure and surprise charges.
- Retain minimum provider count and private source, sensitive records and backups.
- The preceding GitHub + Cloudflare + Supabase hybrid is NOT final and should be replaced by research where billing-free alternatives exist. Do not mistake rejection of a R2 subscription for blanket rejection of Cloudflare Free hosting products.

## Candidate topology (3 providers)

```text
GitHub (PRIVATE PERSONAL repository; versioned code, docs, CI only)
    | deploy from main / releases
    v
Netlify Free: static PWA + optional secure functions
    | authenticated users / Supabase publishable key, RLS, RPC transactions
    v
Supabase Free: managed PostgreSQL, Auth, immutable ledger, versioned catalogue
    |
    +-- GitHub Actions scheduled pg_dump job (already one of the 3 providers)
          -> encrypt with independently kept recovery key
          -> upload via authenticated protected Netlify endpoint / scoped token
          -> Netlify Blobs (PRIVATE, site-wide, versioned object names)
          -> occasional independently held encrypted offline copy
```

The architecture sketch is NOT an implementation. A normal web page/SPA is publicly downloadable even if source is private; protect every data operation in Supabase with RLS and protected PostgreSQL functions. Never send backup credentials, database passwords, encryption private keys or Supabase service role to client bundles.

## Why Netlify is plausible
- Netlify Free currently includes static hosting, functions and **Netlify Blobs Beta** in one provider, and 300 monthly **hard-limited credits**, with no auto recharge. This is preferable to a metered account with uncapped charges, but usage reaching the hard limit can interrupt the deployed site. Web: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- Current credit model meters production deploys (15 credits each), bandwidth (20/GB), requests (2/10k), and functions/compute. Uncontrolled frequent production deployments during development would consume the monthly allowance even if runtime load is small. Prefer staging previews and deliberate production releases; estimate credits using actual traffic, not only database row count. Web: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- Free Netlify supports automated linking to **private repositories owned by a personal GitHub account**; **organization-owned private repositories** are subject to paid Git integration restrictions. This needs explicit checking for the actual owner. One workaround to assess without revealing code: automated authenticated CLI deploy from a private org GitHub Actions repo (needs secure Netlify token); do not assume it is available/allowed without a test. Web: https://docs.netlify.com/build/git-workflows/overview/
- The Netlify original Free launch announcement described no credit card required and allowed commercial sites; current credit-based docs confirm hard caps and included features. Confirm no card at account setup rather than relying only on this announcement. Web: https://www.netlify.com/blog/introducing-netlify-free-plan/

## Backup security and exact limits
- Netlify Blobs is currently **Beta**, optimized for frequent reads and infrequent writes, supports up to 5 GB per individual blob, and manages storage per site. It provides storage encryption in transit/at rest, but backups should additionally be **client-side encrypted** so that a compromised hosting account does not directly expose accounting data. Only server-side functions or Netlify credentials should access the backup store; no public read endpoint.
- Use **site-wide** (`getStore`) rather than deploy-specific (`getDeployStore`) backup storage; the latter may be deleted with an old deploy. Do not let preview/branch deploys obtain production backup write/delete access.
- Each new backup uses an immutable *logical name* including timestamp and digest. Netlify Blobs uses last-write-wins; merely creating unique names does not guarantee provider-level WORM/retention lock. Test accidental deletion protections, separate upload vs delete permissions, and maintain an offline independent copy.
- `getStore` by default uses region `us-east-2`, **not** the function runtime region. For EU data-location requirements pass the same explicit region on every read/write (e.g. `eu-central-1`). Confirm legal/data-residency obligations before storing company records. Web: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- A SQL dump of selected tables is **not** a full recovery. Include schema/privileges/migrations, ledger/catalogue/price history, registered users and auth identities, RLS, import metadata and references to all external files/configuration. Follow the latest Supabase CLI database backup-and-restore guidance; run a clean-room restore before production use.
- A CI scheduled job can be delayed/missed; display last *verified* backup age and alert the administrator. A backup that was never successfully restored is not proven reliable. A periodic offline encrypted export on company-controlled media adds an independent failure domain without another cloud provider.

## What remains open
1. Does a private GitHub repository belong to a personal user or an organization? This affects Netlify Free auto-build integration.
2. How much does actual seasonal activity consume in Netlify Free's 300-credit budget? Test production previews, network traffic, API calls and storage.
3. Will Netlify Blobs Beta be acceptable as one backup store, or is an established independent storage provider needed? It is not yet validated as long-term archival storage.
4. How is the backup encryption/decryption key recovered if Netlify, GitHub or Supabase account access is lost?
5. Can a Supabase Free project be unpaused reliably before the annual inventory period without a billing subscription? The user accepts Supabase generally; the seasonal operational risk still needs a documented procedure.

## Evidentiary status and guardrails
Official vendor docs consulted on 2026-11-25; no account creation, pricing activation, cloud test, upload, restore or sensitive data migration performed. Treat feature documentation and pricing as subject to change. The user has **not chosen Netlify**. Next agent: conduct TC-057..060 with *synthetic* data, verify cards/subscriptions/credits and provider privacy before any real record is uploaded. Do not bury the R2 rejection or reintroduce billing inadvertently.
