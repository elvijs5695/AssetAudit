# Candidate architecture: Cloudflare hosting + R2 backup + Supabase PostgreSQL

**2026-11-25; v0.1.4; status: PREFERENCE_NOT_FINAL / architectural proposal.** User source: `SRC-CHAT-HYBRID-STACK`, prompted in part by `SRC-CHAT-SUPABASE-LIMITS`. Requirements: `REQ-048..050` (with existing `REQ-001/002/024/037/038/045/046/047`). Related decisions: `DEC-028..031`. Acceptance scenarios: `TC-052..056` (**NOT_RUN**). Nothing has been deployed or changed in any account.

## Intent and justification
The user wants to minimize providers without compromising exact accounting semantics, data privacy or recoverability. Earlier two-provider Cloudflare+D1 was attractive for simplicity, but D1's Free daily rows-read quota and SQLite number semantics complicate this ledger. A three-provider compromise would use GitHub for private source, Cloudflare for PWA/API plus private backup object storage, and Supabase for managed Postgres/Auth. Provider count stays three; it is not four (no separate backup SaaS).

```text
PRIVATE GITHUB REPOSITORY [source/docs/migrations; no production DB data]
       | git integration / deployment
       v
CLOUDFLARE [Workers static assets + API]
       |                                  \
       | authenticated client API/Worker   \
       v                                    v
SUPABASE [PostgreSQL + Auth + RLS]      R2 PRIVATE BUCKET
  |  append-only ledger                       ^
  |  catalogue/versioned prices               | encrypted backup artifacts
  |  users and grants                          |
  +---- GITHUB ACTIONS (scheduled, secret-bearing ephemeral runner)
        pg_dump / Supabase CLI staged export + encryption + S3-compatible R2 upload
```

## Application routing (two acceptable variants; NOT YET DECIDED)
**Simpler candidate:** Cloudflare serves the frontend, and the PWA accesses the Supabase Data API with a **publishable** key and a user access token. Every table and function exposed to the client must have least-privilege grants and tested RLS. Protected administrator functions use Cloudflare Workers with server-held secrets and explicit authorization before accessing Supabase or R2.

**Strict API gateway candidate:** PWA calls a Cloudflare Worker API, which forwards the validated user identity and performs Postgres operations. This can centralize authorization and avoid direct Data API clients, but adds complexity, operational cost and potential 10 ms CPU limits on Workers Free. Whichever path is chosen, high-risk multi-table business transitions must remain atomic in PostgreSQL, not in separate client HTTP calls.

Do NOT expose `service_role`, Supabase DB passwords, R2 S3 credentials or backup encryption private keys in frontend bundles, Git commits, or public preview environments. A privately hosted Git repository does not automatically make a deployed PWA URL private; all data/API access must be enforced, and previews must not access production data.

## Why the backup runner uses GitHub Actions (already one of the three providers)
A standard Cloudflare Worker cannot directly run a traditional `pg_dump` executable. A Worker Cron can launch scheduled workflows and query APIs, but a row-by-row JSON export is **not** automatically a consistent PostgreSQL disaster-recovery dump. Since GitHub is already used for source control, a scheduled GitHub Actions runner can execute a properly versioned Postgres/CLI toolchain, encrypt output **before** upload, and write it to private R2 through its S3-compatible endpoint. Alternatively a paid or separate runtime could run the export; do not add it without need.

GitHub scheduled workflows can be delayed or dropped and therefore **must not be the only success monitor**. Track last valid backup and age, send alerts on gaps, verify checksums and periodically conduct a real restoration. Because the DB is tiny, full logical exports daily *during active inventory* and less frequently outside the season are a reasonable **PROPOSAL**, not a committed schedule. No reason to implement incremental WAL/PITR on day one unless RPO demands it.

## Backup scope and security
- Full restore is more than inventory rows: schema, grant/RLS policies, ledger/catalogue and price events, import batches, active configuration, user profile/role records, auth users and password hashes, migrations, referenced external objects, deployment configuration and non-secret recovery instructions.
- `supabase db dump` default excludes some Supabase-managed schemas including `auth` and `storage`, and default output does not include table data or custom roles. Supabase's official backup-and-restore flow requires separate `roles.sql`, `schema.sql`, `data.sql` steps, plus careful handling of auth/storage customization, project settings and encryption root key if Vault/pgsodium is used. Follow the current official procedure at implementation time; never assume one SQL file is a complete working system.
- Keep R2 bucket private; disable public `r2.dev`/public hostname access. Consider R2 bucket lock retention (e.g. a deliberate 30/90 day policy) to prevent accidental overwrites/deletes. Grant backup job credentials only the minimum permitted capabilities for its bucket; manage secrets in protected CI settings.
- Encrypt backups client-side at the ephemeral runner with an independently retained recovery key (not stored in R2 or repository). Apply checksums and a manifest containing backup timestamp, Postgres/tool versions, schema/data artifacts, row counts where safe, and restore instructions. Maintain an occasional encrypted off-account/offline copy for account-loss scenarios.
- Auth recovery requires planned password/session behavior; ensure users can actually log in after restoration. Cloudflare R2 is a separate vendor failure domain from Supabase, but a compromised CI account or shared encryption secret can still jeopardize both.
- Cloudflare R2 Free includes 10 GB-month Standard storage but requires an R2 billing subscription/payment method and is not a hard cost ceiling. Supabase Free may pause for inactivity and does not include managed automatic backups. App frontend continuity does **not** imply DB continuity.

## Separation of three different user-facing concepts
- Business time travel = reconstruct the inventory and valuation as-of an event ordering and selected timestamp; read only.
- Business rollback = append compensating ledger events after administrator preview/approval, never edit historical RAW.
- Disaster restore = reconstruct an entire deployment and database from off-service encrypted recovery artifacts in a controlled, destructive administrative process.

## Minimum proof before selecting platform
1. `TC-052`: stage PWA served by Cloudflare, Supabase Auth+RLS, 2-user access control and correct multi-table atomic writes; never put secret keys in client builds.
2. `TC-053`: full export -> encrypted R2 with private access, manifest, checksum, retention; no real customer data in CI logs or public Git.
3. `TC-054`: deliberately destroy a **test** environment, recover into a clean Supabase project, verify financial totals, actor history, auth login, RLS, catalogue/price history and app operability.
4. `TC-055`: simulate Supabase being paused/unreachable and GitHub schedule missing; show obvious error and alert; never report an unacknowledged write as saved.
5. `TC-056`: estimate billable Cloudflare Workers/R2/Supabase service use during the 2019/2025 peak, estimate storage for retention policy, review billing alerts and cost ceilings.

## Primary references checked 2026-11-25
- Cloudflare static assets/Workers: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Git integration: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/
- Cloudflare R2 S3 interface: https://developers.cloudflare.com/r2/get-started/s3/
- R2 free quota/billing: https://developers.cloudflare.com/r2/pricing/ and https://developers.cloudflare.com/r2/get-started/
- R2 object retention locks: https://developers.cloudflare.com/r2/buckets/bucket-locks/
- Supabase backing up/restoring via CLI: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- Supabase CLI dump exclusions: https://supabase.com/docs/reference/cli/supabase-config
- Supabase backup/Free limits: https://supabase.com/docs/guides/platform/backups and https://supabase.com/pricing
- Supabase frontend RLS/security: https://supabase.com/docs/guides/database/secure-data
- GitHub scheduled job reliability: https://docs.github.com/en/actions/how-tos/troubleshoot-workflows

**Evidence scope:** Official vendor documentation checked; no live accounts, credentials, resource quotas, CI schedules, RLS test, backup, or restore test were executed. All new TC scenarios are NOT_RUN.
