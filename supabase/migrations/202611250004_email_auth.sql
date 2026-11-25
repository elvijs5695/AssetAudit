-- v0.2.3: switch to administrator-created Supabase Auth email+password users.
-- Apply ONCE after migrations 001-003 in the TEST Supabase project.
-- No inventory, catalogue, audit or historical data are updated/deleted.
BEGIN;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email_address text;
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_unique
ON public.user_profiles (lower(email_address)) WHERE email_address IS NOT NULL;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profile_email_format CHECK (
    email_address IS NULL OR (length(email_address)<=254 AND position('@' in email_address)>1)
  );

CREATE OR REPLACE FUNCTION public.admin_register_email_profile(p_id uuid,p_email text,p_name text,p_role text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_actor uuid; v_email text;
BEGIN
 v_actor:=public.require_active_user(true);
 v_email:=lower(btrim(coalesce(p_email,'')));
 IF p_id IS NULL OR length(v_email)>254 OR position('@' in v_email)<2 OR
    p_name IS NULL OR btrim(p_name)='' OR length(p_name)>120 OR
    p_role NOT IN ('admin','staff') THEN
   RAISE EXCEPTION 'Invalid account data';
 END IF;
 IF EXISTS(SELECT 1 FROM public.user_profiles WHERE id=p_id) THEN
   RAISE EXCEPTION 'Profile already exists';
 END IF;
 INSERT INTO public.user_profiles(id,email_address,display_name,role,active)
 VALUES(p_id,v_email,btrim(p_name),p_role,true);
 INSERT INTO public.administration_events(actor_id,event_type,subject_id,previous_value,next_value)
 VALUES(v_actor,'user_created',p_id,NULL,
        jsonb_build_object('email',v_email,'name',btrim(p_name),'role',p_role,'active',true));
 RETURN p_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_register_email_profile(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_register_email_profile(uuid,text,text,text) TO authenticated;
-- Exact barcode lookup; must not return a similar product code or name.
CREATE INDEX IF NOT EXISTS catalogue_event_barcode_lookup_idx
ON public.catalogue_events(barcode) WHERE barcode IS NOT NULL;
CREATE OR REPLACE FUNCTION public.catalogue_by_barcode(p_barcode text)
RETURNS TABLE(item_id uuid,revision integer,code text,name text,invoice_price numeric,shelf_price numeric,barcode text,source_year integer,source text,legacy_id integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(false);
 IF p_barcode IS NULL OR length(btrim(p_barcode))>100 OR btrim(p_barcode)='' THEN
   RETURN;
 END IF;
 RETURN QUERY
 WITH latest AS (
   SELECT DISTINCT ON(e.item_id) e.*
   FROM public.catalogue_events e ORDER BY e.item_id,e.revision DESC
 )
 SELECT e.item_id,e.revision,e.code,e.name,e.invoice_price,e.shelf_price,e.barcode,e.source_year,e.source,e.legacy_id
 FROM latest e WHERE e.action<>'hide' AND e.barcode=btrim(p_barcode)
 ORDER BY lower(e.name),e.invoice_price,e.shelf_price NULLS LAST LIMIT 100;
END $$;
REVOKE ALL ON FUNCTION public.catalogue_by_barcode(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.catalogue_by_barcode(text) TO authenticated;
-- Retire previous username-only creation path; data and username column remain intact.
REVOKE ALL ON FUNCTION public.admin_register_profile(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
COMMIT;
