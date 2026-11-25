from pathlib import Path
p=Path('/mnt/data/inventarizacija_app_v0.2.0/supabase/migrations/202611250001_base.sql')
s=p.read_text()
s=s.replace('v_fingerprint:=md5(jsonb_build_object',"-- Same submitted request cannot race into two records; lock before idempotency lookup.\n PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 42));\n v_fingerprint:=md5(jsonb_build_object")
s=s.replace(" IF p_quantity IS NULL OR p_invoice_price IS NULL OR abs(p_quantity)"," IF p_quantity IS NULL OR p_invoice_price IS NULL OR (p_action <> 'void' AND p_shelf_price IS NULL) OR abs(p_quantity)")
s=s.replace(" IF v_exists THEN RETURN; END IF;", " IF v_exists THEN RETURN; END IF;")
s=s.replace(" -- Preserve observed legacy tuple matching and placeholder hiding. Accountant review pending.\n SELECT EXISTS(", " -- Serialize catalogue tuple resolution across simultaneous data entry.\n PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(p_code,'')||chr(31)||p_name||chr(31)||p_invoice_price::text,17));\n -- Preserve observed legacy tuple matching and placeholder hiding. Accountant review pending.\n SELECT EXISTS(")
# race allowed if 2 distinct shelf prices with same key; this lock serialises both
# supplementary admin configuration + history RPCs
s += '''

-- Administrator sets the year explicitly; all updates are restricted to SECURITY DEFINER.
CREATE FUNCTION public.admin_set_year(p_year integer) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  PERFORM public.require_active_user(true);
  IF p_year < 2000 OR p_year > 2200 THEN RAISE EXCEPTION 'Invalid year'; END IF;
  UPDATE public.app_config SET active_year=p_year WHERE singleton;
  RETURN p_year;
END $$;
CREATE FUNCTION public.admin_catalogue_history(p_item_id uuid)
RETURNS TABLE(event_id uuid,revision integer,action text,code text,name text,invoice_price numeric,shelf_price numeric,barcode text,source text,actor_id uuid,recorded_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  PERFORM public.require_active_user(true);
  RETURN QUERY SELECT e.event_id,e.revision,e.action,e.code,e.name,e.invoice_price,e.shelf_price,e.barcode,e.source,e.actor_id,e.recorded_at
   FROM public.catalogue_events e WHERE e.item_id=p_item_id ORDER BY e.revision DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_year(integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_catalogue_history(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_year(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_catalogue_history(uuid) TO authenticated;
'''
p.write_text(s)
