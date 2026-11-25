-- Run against a new TEST Supabase database after migration, never production.
-- Only verifies privilege and trigger structure. Two-user HTTP tests also required.
DO $audit$
BEGIN
 IF has_table_privilege('anon','public.inventory_events','SELECT')
 OR has_table_privilege('authenticated','public.inventory_events','INSERT')
 OR has_table_privilege('authenticated','public.catalogue_events','UPDATE')
 OR has_table_privilege('authenticated','public.legacy_inventory_raw','SELECT')
 OR has_table_privilege('anon','public.user_profiles','SELECT')
 THEN RAISE EXCEPTION 'Security defect: forbidden direct table privilege'; END IF;
 IF has_function_privilege('anon','public.admin_stats(integer,timestamptz)','EXECUTE')
 OR has_function_privilege('anon','public.inventory_submit(uuid,text,integer,uuid,uuid,text,text,numeric,text,numeric,numeric,text,text,text)','EXECUTE')
 OR has_function_privilege('authenticated','public.require_active_user(boolean)','EXECUTE')
 THEN RAISE EXCEPTION 'Security defect: forbidden RPC privilege'; END IF;
 IF (SELECT COUNT(*) FROM pg_trigger WHERE tgname IN ('no_inventory_event_mutation','no_catalogue_event_mutation','no_legacy_inventory_mutation','no_admin_event_mutation') AND NOT tgisinternal)<>4
 THEN RAISE EXCEPTION 'Security defect: missing immutable event triggers'; END IF;
 RAISE NOTICE 'PASS: SQL object privileges and immutable triggers';
END $audit$;
