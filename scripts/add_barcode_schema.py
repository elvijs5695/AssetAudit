from pathlib import Path
p=Path('/mnt/data/inventarizacija_app_v0.2.0/supabase/migrations/202611250001_base.sql');s=p.read_text()
s=s.replace("  unit text NOT NULL DEFAULT 'gabali',\n  invoice_price", "  unit text NOT NULL DEFAULT 'gabali',\n  barcode text,\n  invoice_price")
s=s.replace('RETURNS TABLE(entry_id uuid,event_id uuid,revision integer,legacy_id integer,quantity numeric,unit text,invoice_total numeric,shelf_total numeric,note text,actor_id uuid,legacy_user integer,recorded_at timestamptz)',
            'RETURNS TABLE(entry_id uuid,event_id uuid,revision integer,legacy_id integer,quantity numeric,unit text,invoice_total numeric,shelf_total numeric,note text,barcode text,actor_id uuid,legacy_user integer,recorded_at timestamptz)')
s=s.replace('e.shelf_total,e.note,e.actor_id,e.legacy_user,e.recorded_at\n FROM latest',
            'e.shelf_total,e.note,e.barcode,e.actor_id,e.legacy_user,e.recorded_at\n FROM latest')
s=s.replace('p_year integer,p_actor uuid)\nRETURNS void', 'p_year integer,p_actor uuid,p_barcode text)\nRETURNS void')
s=s.replace(' IF v_exists THEN RETURN; END IF;\n INSERT INTO public.catalogue_events', ''' IF v_exists THEN
   -- A newly scanned barcode can enrich a known exact-price variant without overwriting history.
   IF nullif(trim(coalesce(p_barcode,'')),'') IS NOT NULL THEN
     FOR v_old IN SELECT * FROM (
       SELECT DISTINCT ON(item_id) * FROM public.catalogue_events ORDER BY item_id,revision DESC
     ) e WHERE e.action<>'hide' AND e.code=p_code AND e.name=p_name AND e.invoice_price=p_invoice_price
          AND e.shelf_price IS NOT DISTINCT FROM p_shelf_price
          AND e.barcode IS NULL LOOP
       INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id)
       VALUES(v_old.item_id,v_old.revision+1,'update',v_old.code,v_old.name,v_old.invoice_price,v_old.shelf_price,p_barcode,v_old.source_year,'inventory_barcode',p_actor);
     END LOOP;
   END IF;
   RETURN;
 END IF;
 INSERT INTO public.catalogue_events''')
s=s.replace('INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,source_year,source,actor_id)\n VALUES(gen_random_uuid(),1,\'create\',p_code,p_name,p_invoice_price,p_shelf_price,p_year,\'inventory\',p_actor);',
            "INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id)\n VALUES(gen_random_uuid(),1,'create',p_code,p_name,p_invoice_price,p_shelf_price,nullif(trim(p_barcode),''),p_year,'inventory',p_actor);")
s=s.replace('p_code text,p_name text,p_quantity numeric,p_unit text,p_invoice_price numeric,p_shelf_price numeric,p_cash text,p_note text\n)', 'p_code text,p_name text,p_quantity numeric,p_unit text,p_invoice_price numeric,p_shelf_price numeric,p_cash text,p_note text,p_barcode text DEFAULT NULL\n)')
s=s.replace("'k',p_cash,'t',p_note)::text", "'k',p_cash,'t',p_note,'b',p_barcode)::text")
s=s.replace('p_cash:=v_previous.cash;p_note:=v_previous.note;', 'p_cash:=v_previous.cash;p_note:=v_previous.note;p_barcode:=v_previous.barcode;')
s=s.replace("OR length(coalesce(p_note,''))>255 THEN", "OR length(coalesce(p_note,''))>255 OR length(coalesce(p_barcode,''))>100 THEN")
s=s.replace('INSERT INTO public.inventory_events(entry_id,revision,action,year,code,name,quantity,unit,invoice_price,shelf_price,invoice_total,shelf_total,cash,note,actor_id,source,request_id,request_fingerprint)', 'INSERT INTO public.inventory_events(entry_id,revision,action,year,code,name,quantity,unit,barcode,invoice_price,shelf_price,invoice_total,shelf_total,cash,note,actor_id,source,request_id,request_fingerprint)')
s=s.replace('VALUES(v_id,v_rev,p_action,p_year,coalesce(p_code,\'\'),p_name,p_quantity,coalesce(p_unit,\'gabali\'),p_invoice_price,p_shelf_price,',"VALUES(v_id,v_rev,p_action,p_year,coalesce(p_code,''),p_name,p_quantity,coalesce(p_unit,'gabali'),nullif(trim(p_barcode),''),p_invoice_price,p_shelf_price,")
s=s.replace('p_year,v_actor);', 'p_year,v_actor,p_barcode);')
s=s.replace('public.ensure_catalogue_variant(text,text,numeric,numeric,integer,uuid)', 'public.ensure_catalogue_variant(text,text,numeric,numeric,integer,uuid,text)')
s=s.replace('public.inventory_submit(uuid,text,integer,uuid,uuid,text,text,numeric,text,numeric,numeric,text,text)', 'public.inventory_submit(uuid,text,integer,uuid,uuid,text,text,numeric,text,numeric,numeric,text,text,text)')
# simple sanity: no signature leftovers
if 'p_year,v_actor);' in s:raise ValueError('ensure signature mismatch')
p.write_text(s)
