from pathlib import Path
p=Path('/mnt/data/inventarizacija_app_v0.2.0/supabase/migrations/202611250001_base.sql');s=p.read_text()
s=s.replace('legacy_id integer UNIQUE REFERENCES public.legacy_inventory_raw(legacy_id),','legacy_id integer REFERENCES public.legacy_inventory_raw(legacy_id),')
s=s.replace('legacy_id integer UNIQUE REFERENCES public.legacy_catalogue_raw(legacy_id),','legacy_id integer REFERENCES public.legacy_catalogue_raw(legacy_id),')
s=s.replace('  UNIQUE(entry_id, revision)\n);','  UNIQUE(entry_id, revision),\n  UNIQUE(legacy_id,revision)\n);',1)
s=s.replace('  UNIQUE(item_id,revision)\n);','  UNIQUE(item_id,revision),\n  UNIQUE(legacy_id,revision)\n);',1)
s=s.replace('  recorded_at timestamptz NOT NULL DEFAULT now(),\n  UNIQUE(item_id,revision)', '  recorded_at timestamptz NOT NULL DEFAULT now(),\n  UNIQUE(item_id,revision)')
s=s.replace('INSERT INTO public.inventory_events(entry_id,revision,action,year,code,name,quantity,unit,barcode,invoice_price,shelf_price,invoice_total,shelf_total,cash,note,actor_id,source,request_id,request_fingerprint)', 'INSERT INTO public.inventory_events(entry_id,revision,action,year,code,name,quantity,unit,barcode,invoice_price,shelf_price,invoice_total,shelf_total,cash,note,actor_id,legacy_user,legacy_id,legacy_created_unix,legacy_edited_unix,source,request_id,request_fingerprint)')
s=s.replace("coalesce(p_cash,''),coalesce(p_note,''),v_actor,'interactive',p_request_id,v_fingerprint)","coalesce(p_cash,''),coalesce(p_note,''),v_actor,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_user END,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_id END,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_created_unix END,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_edited_unix END,'interactive',p_request_id,v_fingerprint)")
s=s.replace("IF nullif(trim(p_name),'') IS NULL OR p_invoice_price IS NULL OR length(p_name)>200", "IF nullif(trim(p_name),'') IS NULL OR p_invoice_price IS NULL OR scale(p_invoice_price)>2 OR (p_shelf_price IS NOT NULL AND scale(p_shelf_price)>2) OR abs(p_invoice_price)>10000000 OR (p_shelf_price IS NOT NULL AND abs(p_shelf_price)>10000000) OR length(p_name)>200")
# Preserve original legacy catalogue ID through admin revisions, not only initial event.
s=s.replace('INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id)\n VALUES(v_item,v_revision', 'INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id,legacy_id)\n VALUES(v_item,v_revision')
s=s.replace("p_barcode),''),v_year,'administrator',v_actor)\n RETURNING", "p_barcode),''),v_year,'administrator',v_actor,CASE WHEN p_action='create' THEN NULL ELSE v_current.legacy_id END)\n RETURNING")
s=s.replace("INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id)\n       VALUES(v_old.item_id,v_old.revision+1,'update'", "INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id,legacy_id)\n       VALUES(v_old.item_id,v_old.revision+1,'update'")
s=s.replace("v_old.source_year,'inventory_barcode',p_actor);", "v_old.source_year,'inventory_barcode',p_actor,v_old.legacy_id);")
s=s.replace("INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id)\n     VALUES(v_old.item_id,v_old.revision+1,'hide'", "INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id,legacy_id)\n     VALUES(v_old.item_id,v_old.revision+1,'hide'")
s=s.replace("v_old.source_year,'inventory_placeholder_replaced',p_actor);", "v_old.source_year,'inventory_placeholder_replaced',p_actor,v_old.legacy_id);")
# Appending immutable logs for admin activity. Only functions may write; admin RPC can read.
s += '''

-- Audit administrative rights and configuration changes, without storing passwords.
CREATE TABLE public.administration_events (
 event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
 event_type text NOT NULL CHECK(event_type IN ('year_changed','user_created','user_updated')),
 subject_id uuid,
 previous_value jsonb,
 next_value jsonb,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.administration_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.administration_events FROM PUBLIC,anon,authenticated;
CREATE TRIGGER no_admin_event_mutation BEFORE UPDATE OR DELETE ON public.administration_events
 FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();

-- A separate authenticated RPC handles profile edits atomically with its audit log.
CREATE FUNCTION public.admin_save_profile(p_id uuid,p_name text,p_role text,p_active boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_actor uuid; v_previous public.user_profiles%ROWTYPE;
BEGIN
 v_actor:=public.require_active_user(true);
 IF p_id IS NULL OR p_role NOT IN ('admin','staff') OR p_active IS NULL OR length(coalesce(p_name,''))>120 THEN
  RAISE EXCEPTION 'Invalid profile data'; END IF;
 IF v_actor=p_id AND (p_role<>'admin' OR p_active=false) THEN
  RAISE EXCEPTION 'Current admin cannot deactivate self'; END IF;
 SELECT * INTO v_previous FROM public.user_profiles WHERE id=p_id FOR UPDATE;
 IF FOUND THEN
  UPDATE public.user_profiles SET display_name=coalesce(p_name,''),role=p_role,active=p_active WHERE id=p_id;
 ELSE
  INSERT INTO public.user_profiles(id,display_name,role,active) VALUES(p_id,coalesce(p_name,''),p_role,p_active);
 END IF;
 INSERT INTO public.administration_events(actor_id,event_type,subject_id,previous_value,next_value)
 VALUES(v_actor,CASE WHEN FOUND THEN 'user_updated' ELSE 'user_created' END,p_id,
 CASE WHEN v_previous.id IS NULL THEN NULL ELSE jsonb_build_object('name',v_previous.display_name,'role',v_previous.role,'active',v_previous.active) END,
 jsonb_build_object('name',coalesce(p_name,''),'role',p_role,'active',p_active));
 RETURN p_id;
END $$;

CREATE FUNCTION public.admin_audit_list(p_limit integer DEFAULT 100)
RETURNS TABLE(event_id uuid,event_type text,subject_id uuid,actor_id uuid,previous_value jsonb,next_value jsonb,recorded_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(true);
 RETURN QUERY SELECT e.event_id,e.event_type,e.subject_id,e.actor_id,e.previous_value,e.next_value,e.recorded_at
 FROM public.administration_events e ORDER BY e.recorded_at DESC LIMIT LEAST(GREATEST(p_limit,1),500);
END $$;
REVOKE ALL ON FUNCTION public.admin_save_profile(uuid,text,text,boolean) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_audit_list(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_profile(uuid,text,text,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_audit_list(integer) TO authenticated;
'''
# Need install administrator audit table before admin_set_year function runtime executes; DDL order okay after full migration.
s=s.replace('  UPDATE public.app_config SET active_year=p_year WHERE singleton;\n  RETURN p_year;', "  INSERT INTO public.administration_events(actor_id,event_type,previous_value,next_value)\n  SELECT auth.uid(),'year_changed',jsonb_build_object('active_year',active_year),jsonb_build_object('active_year',p_year)\n  FROM public.app_config WHERE singleton;\n  UPDATE public.app_config SET active_year=p_year WHERE singleton;\n  RETURN p_year;")
# Ensure profile audit event uses separate v_found bool instead of volatile FOUND after insert/update.
s=s.replace('DECLARE v_actor uuid; v_previous public.user_profiles%ROWTYPE;', 'DECLARE v_actor uuid; v_previous public.user_profiles%ROWTYPE; v_existed boolean;')
s=s.replace(' SELECT * INTO v_previous FROM public.user_profiles WHERE id=p_id FOR UPDATE;\n IF FOUND THEN', ' SELECT * INTO v_previous FROM public.user_profiles WHERE id=p_id FOR UPDATE;\n v_existed:=FOUND;\n IF v_existed THEN')
s=s.replace("VALUES(v_actor,CASE WHEN FOUND THEN 'user_updated' ELSE 'user_created' END,p_id,", "VALUES(v_actor,CASE WHEN v_existed THEN 'user_updated' ELSE 'user_created' END,p_id,")
p.write_text(s)
print('saved',len(s),'lines',s.count('\n'))
