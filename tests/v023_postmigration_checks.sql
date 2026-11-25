-- v0.2.3 read-only structural checks. Run AFTER applying migration 004 in the TEST Supabase project.
-- This DOES NOT validate actual two-user RLS or password login behavior.
DO $$
BEGIN
 IF NOT EXISTS (
   SELECT 1 FROM information_schema.columns
   WHERE table_schema='public' AND table_name='user_profiles' AND column_name='email_address'
 ) THEN RAISE EXCEPTION 'v0.2.3 email_address column is absent'; END IF;
 IF to_regprocedure('public.admin_register_email_profile(uuid,text,text,text)') IS NULL THEN
   RAISE EXCEPTION 'v0.2.3 email admin register RPC absent';
 END IF;
 IF to_regprocedure('public.catalogue_by_barcode(text)') IS NULL THEN
   RAISE EXCEPTION 'v0.2.3 exact barcode RPC absent';
 END IF;
 IF has_function_privilege('anon','public.admin_register_email_profile(uuid,text,text,text)','EXECUTE') OR
    has_function_privilege('anon','public.catalogue_by_barcode(text)','EXECUTE') OR
    has_function_privilege('authenticated','public.admin_register_profile(uuid,text,text,text)','EXECUTE') THEN
   RAISE EXCEPTION 'v0.2.3 forbidden admin/barcode/legacy-username RPC grant';
 END IF;
 IF NOT has_function_privilege('authenticated','public.admin_register_email_profile(uuid,text,text,text)','EXECUTE') OR
    NOT has_function_privilege('authenticated','public.catalogue_by_barcode(text)','EXECUTE') THEN
   RAISE EXCEPTION 'v0.2.3 missing authenticated RPC grant';
 END IF;
END $$;
-- Success. No rows returned = PASS for THESE structural conditions only.
