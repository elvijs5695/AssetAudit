-- SECURITY PATCH v0.2.2 -- 2026-11-25
-- Apply ONCE after 202611250001_base.sql and 202611250002_username_accounts.sql.
-- Can be re-run safely if the first execution completed; privilege changes are idempotent.
-- Does not drop or alter tables, rows, users, RLS policies or audit events.
-- Why: Supabase default grants can expose new public tables; the base migration
-- failed to explicitly revoke anon SELECT and extra TRUNCATE/REFERENCES/TRIGGER
-- privileges on user_profiles and app_config.
BEGIN;
REVOKE ALL PRIVILEGES ON TABLE
    public.user_profiles,
    public.app_config,
    public.inventory_events,
    public.catalogue_events,
    public.legacy_import_metadata,
    public.legacy_inventory_raw,
    public.legacy_catalogue_raw,
    public.legacy_import_raw,
    public.legacy_invoice_stage_raw,
    public.legacy_user_labels,
    public.administration_events
FROM PUBLIC, anon, authenticated;

-- The application legitimately needs these reads. Row-level policies
-- still restrict authenticated users to their own profile.
GRANT SELECT ON TABLE public.user_profiles, public.app_config TO authenticated;
COMMIT;
