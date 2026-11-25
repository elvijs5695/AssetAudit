-- Read-only verification after all three migrations in a NEW TEST project.
-- Must not be used as a substitute for live anon/staff/admin HTTP and RLS tests.
DO $audit$
DECLARE rec record;
BEGIN
  -- Verify least privilege across every application table, not just sample grants.
  FOR rec IN
    WITH protected_tables(name) AS (
      VALUES ('user_profiles'),('app_config'),('inventory_events'),
       ('catalogue_events'),('legacy_import_metadata'),('legacy_inventory_raw'),
       ('legacy_catalogue_raw'),('legacy_import_raw'),('legacy_invoice_stage_raw'),
       ('legacy_user_labels'),('administration_events')
    ), roles(name) AS (VALUES ('anon'),('authenticated')),
    operations(name) AS (
      VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')
    )
    SELECT r.name AS role_name, 'public.'||t.name AS table_name, op.name AS privilege,
      (r.name='authenticated' AND t.name IN ('user_profiles','app_config') AND op.name='SELECT') AS expected
    FROM protected_tables t CROSS JOIN roles r CROSS JOIN operations op
  LOOP
    IF has_table_privilege(rec.role_name,rec.table_name,rec.privilege) IS DISTINCT FROM rec.expected THEN
      RAISE EXCEPTION 'Security defect: unexpected table grant role=% table=% privilege=% expected=%',
        rec.role_name,rec.table_name,rec.privilege,rec.expected;
    END IF;
  END LOOP;
  IF has_function_privilege('anon','public.admin_stats(integer,timestamptz)','EXECUTE')
     OR has_function_privilege('anon','public.inventory_submit(uuid,text,integer,uuid,uuid,text,text,numeric,text,numeric,numeric,text,text,text)','EXECUTE')
     OR has_function_privilege('authenticated','public.require_active_user(boolean)','EXECUTE')
     OR has_function_privilege('authenticated','public.ensure_catalogue_variant(text,text,numeric,numeric,integer,uuid,text)','EXECUTE')
     OR has_function_privilege('anon','public.admin_register_profile(uuid,text,text,text)','EXECUTE')
  THEN RAISE EXCEPTION 'Security defect: forbidden RPC privilege'; END IF;
  IF (SELECT COUNT(*) FROM pg_trigger
      WHERE tgname IN ('no_inventory_event_mutation','no_catalogue_event_mutation',
        'no_legacy_inventory_mutation','no_legacy_catalogue_mutation',
        'no_legacy_import_mutation','no_legacy_invoice_mutation',
        'no_admin_event_mutation') AND NOT tgisinternal AND tgenabled IN ('O','A')) <> 7
  THEN RAISE EXCEPTION 'Security defect: missing or disabled immutable event triggers'; END IF;
  IF (SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public'
        AND c.relname IN ('user_profiles','app_config','inventory_events',
          'catalogue_events','legacy_import_metadata','legacy_inventory_raw',
          'legacy_catalogue_raw','legacy_import_raw','legacy_invoice_stage_raw',
          'legacy_user_labels','administration_events') AND c.relrowsecurity) <> 11
  THEN RAISE EXCEPTION 'Security defect: missing enabled RLS on an application table'; END IF;
  RAISE NOTICE 'PASS: table grants, selected RPC grants, event triggers, and RLS flags';
END $audit$;
