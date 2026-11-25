# TEST Supabase privilege hardening — v0.2.2 (2026-11-25)

## Symptom and source
User reported the exact error from `tests/security_checks.sql`: `ERROR: P0001: Security defect: forbidden direct table privilege` at PL/pgSQL inline block line 8. The previous test combined five effective grants in a single OR condition; this message does not identify the precise failing object.

Code inspection found that `202611250001_base.sql` lines 158–159 revoke only INSERT, UPDATE and DELETE on `public.user_profiles` / `public.app_config` from `anon` and `authenticated`, then grant authenticated SELECT. They do not revoke `anon` SELECT, nor TRUNCATE/REFERENCES/TRIGGER where a Supabase project granted those by default. The strong hypothesis is `has_table_privilege('anon','public.user_profiles','SELECT')` returned true. **This is inferred from code and Supabase documented defaults, not a confirmed database diagnosis.**

This is not proof of data exfiltration because RLS is enabled with an authenticated-only self-read policy. Nevertheless the effective grant violates this project's least-privilege rule.

## Safe recovery on new test project
1. **Do not** re-run `202611250001_base.sql` or `202611250002_username_accounts.sql`; do not drop tables or disable RLS.
2. (Optional) Run `tests/diagnose_table_privileges.sql`; it is read-only and reports permissions that disagree with the expected model.
3. Execute `supabase/migrations/202611250003_privilege_hardening.sql` in Supabase SQL Editor of the **same TEST project**. It only REVOKEs grants for `PUBLIC`,`anon`,`authenticated` on named application tables, then GRANTs SELECT on `user_profiles` and `app_config` only to `authenticated`. It is atomic and idempotent. PostgreSQL owner and service_role grants are intentionally unchanged.
4. Re-run `tests/diagnose_table_privileges.sql`: expected **0 rows**. Re-run `tests/security_checks.sql`: expected **PASS** notice.
5. If there is any SQL error, stop and retain the exact error. Do not try ad-hoc broader GRANTs or remove RLS.
6. SQL Editor execution does not automatically register the migration in CLI's migration history. Reconcile before enabling automatic migrations; in this project production auto-deploy remains OFF.

## Change trace
- BUG-SEC-001 / REQ-063 (user demanded secure architecture from version one): least privilege on profiles and config tables.
- Files: `supabase/migrations/202611250003_privilege_hardening.sql`, `tests/security_checks.sql`, `tests/diagnose_table_privileges.sql`, `tests/test_static_safety.py`.
- Historical inventory values, prices, and catalogue logic: **unchanged**.
- Tests: static verification is run locally. Supabase live patch verification and two-real-user RLS/API tests are **NOT YET CONFIRMED**.
- Production status: **NO-GO** until real credential/RLS, grants, backup/restore, financial comparison and accountant signoff.

## Further prevention
Future migrations must use explicit grant/revoke rules for each new object and must run SQL privilege checks after deployment. Review Supabase's Data API setting `Automatically expose new tables`, and assess PostgreSQL default privileges *only in the controlled test environment*, rather than changing unrelated system schemas or global grants ad hoc.
