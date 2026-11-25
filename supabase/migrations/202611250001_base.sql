-- Inventarizacija v0.2.0: append-only source of truth, read-only legacy evidence.
-- Apply on a NEW empty Supabase project. Never run against the original MySQL database.
-- REVIEW GATE: financial/catalogue rules still require accountant sign-off.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','staff')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.app_config (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  active_year integer NOT NULL CHECK (active_year BETWEEN 2000 AND 2200),
  locale text NOT NULL DEFAULT 'lv-LV',
  timezone text NOT NULL DEFAULT 'Europe/Riga'
);
INSERT INTO public.app_config(singleton,active_year) VALUES(true,2026);

CREATE TABLE public.legacy_import_metadata (
  source_sha256 text PRIMARY KEY,
  imported_at timestamptz NOT NULL DEFAULT now(),
  source_label text NOT NULL,
  inventory_count integer NOT NULL,
  catalogue_count integer NOT NULL,
  import_count integer NOT NULL,
  invoice_stage_count integer NOT NULL,
  configured_year integer NOT NULL
);
CREATE TABLE public.legacy_inventory_raw (
  legacy_id integer PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  quantity numeric(18,2) NOT NULL,
  unit text NOT NULL,
  invoice_price numeric(18,2) NOT NULL,
  shelf_price numeric(18,2) NOT NULL,
  invoice_total numeric(20,2) NOT NULL,
  shelf_total numeric(20,2) NOT NULL,
  cash text NOT NULL,
  note text NOT NULL,
  year integer NOT NULL,
  legacy_user integer NOT NULL,
  legacy_created_unix bigint NOT NULL,
  legacy_edited_by integer NOT NULL,
  legacy_edited_unix bigint NOT NULL
);
CREATE TABLE public.legacy_catalogue_raw (
  legacy_id integer PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  invoice_price numeric(18,2) NOT NULL,
  shelf_price numeric(18,2) NOT NULL,
  source_year integer NOT NULL,
  legacy_user integer NOT NULL,
  legacy_edited_by integer NOT NULL
);
CREATE TABLE public.legacy_import_raw (
  legacy_id integer PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  invoice_price numeric(18,2) NOT NULL,
  shelf_price numeric(18,2) NOT NULL,
  source_year integer NOT NULL,
  legacy_user integer NOT NULL,
  legacy_edited_by integer NOT NULL
);
CREATE TABLE public.legacy_invoice_stage_raw (
  row_number integer PRIMARY KEY,
  code text,
  name text,
  invoice_price numeric(18,2)
);
CREATE TABLE public.legacy_user_labels (
  legacy_user_id integer PRIMARY KEY,
  legacy_username text NOT NULL
);

CREATE TABLE public.inventory_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL,
  revision integer NOT NULL CHECK (revision >= 1),
  action text NOT NULL CHECK (action IN ('create','replace','void')),
  year integer NOT NULL,
  code text NOT NULL DEFAULT '',
  name text NOT NULL,
  quantity numeric(18,2) NOT NULL,
  unit text NOT NULL DEFAULT 'gabali',
  barcode text,
  invoice_price numeric(18,2) NOT NULL,
  shelf_price numeric(18,2),
  invoice_total numeric(20,2) NOT NULL,
  shelf_total numeric(20,2),
  cash text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  actor_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  legacy_user integer,
  legacy_id integer REFERENCES public.legacy_inventory_raw(legacy_id),
  legacy_created_unix bigint,
  legacy_edited_unix bigint,
  source text NOT NULL DEFAULT 'interactive',
  request_id uuid NOT NULL UNIQUE,
  request_fingerprint text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entry_id, revision),
  UNIQUE(legacy_id,revision)
);
CREATE INDEX inventory_events_year_entry_revision_idx ON public.inventory_events(year,entry_id,revision DESC);
CREATE INDEX inventory_events_recorded_idx ON public.inventory_events(recorded_at);

CREATE TABLE public.catalogue_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  revision integer NOT NULL CHECK (revision>=1),
  action text NOT NULL CHECK(action IN ('create','update','hide')),
  code text NOT NULL DEFAULT '',
  name text NOT NULL,
  invoice_price numeric(18,2) NOT NULL,
  shelf_price numeric(18,2),
  barcode text,
  source_year integer NOT NULL,
  source text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  legacy_id integer REFERENCES public.legacy_catalogue_raw(legacy_id),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id,revision),
  UNIQUE(legacy_id,revision)
);
CREATE INDEX catalogue_events_item_rev_idx ON public.catalogue_events(item_id,revision DESC);
CREATE INDEX catalogue_events_recorded_idx ON public.catalogue_events(recorded_at);

-- Immutability is enforced in PostgreSQL independently of the client and RLS.
CREATE FUNCTION public.deny_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'Append-only event / preserved legacy source may not be updated or deleted';
END $$;
CREATE TRIGGER no_inventory_event_mutation BEFORE UPDATE OR DELETE ON public.inventory_events FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();
CREATE TRIGGER no_catalogue_event_mutation BEFORE UPDATE OR DELETE ON public.catalogue_events FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();
CREATE TRIGGER no_legacy_inventory_mutation BEFORE UPDATE OR DELETE ON public.legacy_inventory_raw FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();
CREATE TRIGGER no_legacy_catalogue_mutation BEFORE UPDATE OR DELETE ON public.legacy_catalogue_raw FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();
CREATE TRIGGER no_legacy_import_mutation BEFORE UPDATE OR DELETE ON public.legacy_import_raw FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();
CREATE TRIGGER no_legacy_invoice_mutation BEFORE UPDATE OR DELETE ON public.legacy_invoice_stage_raw FOR EACH ROW EXECUTE FUNCTION public.deny_event_mutation();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_self_read ON public.user_profiles FOR SELECT TO authenticated USING (id=auth.uid());
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY config_read ON public.app_config FOR SELECT TO authenticated USING (true);
ALTER TABLE public.inventory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_import_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_inventory_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_catalogue_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_import_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_invoice_stage_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_user_labels ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inventory_events,public.catalogue_events,public.legacy_inventory_raw,public.legacy_catalogue_raw,public.legacy_import_raw,public.legacy_invoice_stage_raw,public.legacy_user_labels,public.legacy_import_metadata FROM anon,authenticated;
REVOKE INSERT,UPDATE,DELETE ON public.user_profiles,public.app_config FROM anon,authenticated;
GRANT SELECT ON public.user_profiles,public.app_config TO authenticated;

CREATE FUNCTION public.require_active_user(p_admin boolean DEFAULT false) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_id uuid:=auth.uid(); v_admin boolean;
BEGIN
 IF v_id IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='28000'; END IF;
 SELECT role='admin' INTO v_admin FROM public.user_profiles WHERE id=v_id AND active;
 IF v_admin IS NULL OR (p_admin AND NOT v_admin) THEN
   RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
 END IF;
 RETURN v_id;
END $$;

-- Staff see only current entries through these definer RPCs, never the underlying event log.
CREATE FUNCTION public.inventory_list(p_year integer,p_search text DEFAULT '',p_cash text DEFAULT '',p_limit integer DEFAULT 60,p_offset integer DEFAULT 0)
RETURNS TABLE(code text,name text,invoice_price numeric,shelf_price numeric,cash text,unit text,quantity numeric,invoice_total numeric,shelf_total numeric,entry_count bigint,latest_legacy_id integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(false);
 RETURN QUERY
 WITH current_events AS (
   SELECT DISTINCT ON (e.entry_id) e.*
   FROM public.inventory_events e WHERE e.year=p_year ORDER BY e.entry_id,e.revision DESC
 )
 SELECT e.code,e.name,e.invoice_price,e.shelf_price,e.cash,MIN(e.unit) AS unit,
   SUM(e.quantity),SUM(e.invoice_total),SUM(e.shelf_total),COUNT(*) AS entry_count,MAX(e.legacy_id)
 FROM current_events e
 WHERE e.action<>'void' AND (coalesce(p_cash,'')='' OR e.cash=p_cash)
 AND (coalesce(p_search,'')='' OR e.name ILIKE '%'||left(p_search,150)||'%' OR e.code ILIKE '%'||left(p_search,150)||'%' OR e.legacy_id::text=p_search)
 GROUP BY e.code,e.name,e.invoice_price,e.shelf_price,e.cash
 ORDER BY lower(e.name),e.invoice_price,e.shelf_price NULLS LAST,e.code
 LIMIT LEAST(GREATEST(p_limit,1),100) OFFSET LEAST(GREATEST(p_offset,0),100000);
END $$;

CREATE FUNCTION public.inventory_details(p_year integer,p_code text,p_name text,p_invoice_price numeric,p_shelf_price numeric,p_cash text)
RETURNS TABLE(entry_id uuid,event_id uuid,revision integer,legacy_id integer,quantity numeric,unit text,invoice_total numeric,shelf_total numeric,note text,barcode text,actor_id uuid,legacy_user integer,recorded_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(false);
 RETURN QUERY
 WITH latest AS (SELECT DISTINCT ON(e.entry_id) e.* FROM public.inventory_events e WHERE e.year=p_year ORDER BY e.entry_id,e.revision DESC)
 SELECT e.entry_id,e.event_id,e.revision,e.legacy_id,e.quantity,e.unit,e.invoice_total,e.shelf_total,e.note,e.barcode,e.actor_id,e.legacy_user,e.recorded_at
 FROM latest e WHERE e.action<>'void' AND e.code=p_code AND e.name=p_name AND e.invoice_price=p_invoice_price
 AND e.shelf_price IS NOT DISTINCT FROM p_shelf_price AND e.cash=p_cash
 ORDER BY e.legacy_id DESC NULLS LAST,e.recorded_at DESC LIMIT 250;
END $$;

CREATE FUNCTION public.catalogue_search(p_search text DEFAULT '',p_limit integer DEFAULT 80,p_offset integer DEFAULT 0)
RETURNS TABLE(item_id uuid,revision integer,code text,name text,invoice_price numeric,shelf_price numeric,barcode text,source_year integer,source text,legacy_id integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(false);
 RETURN QUERY
 WITH latest AS (SELECT DISTINCT ON(e.item_id) e.* FROM public.catalogue_events e ORDER BY e.item_id,e.revision DESC)
 SELECT e.item_id,e.revision,e.code,e.name,e.invoice_price,e.shelf_price,e.barcode,e.source_year,e.source,e.legacy_id
 FROM latest e WHERE e.action<>'hide' AND (coalesce(p_search,'')='' OR e.name ILIKE '%'||left(p_search,150)||'%' OR e.code ILIKE '%'||left(p_search,150)||'%' OR e.barcode=p_search)
 ORDER BY lower(e.name),e.invoice_price,e.code LIMIT LEAST(GREATEST(p_limit,1),100) OFFSET LEAST(GREATEST(p_offset,0),100000);
END $$;

CREATE FUNCTION public.ensure_catalogue_variant(p_code text,p_name text,p_invoice_price numeric,p_shelf_price numeric,p_year integer,p_actor uuid,p_barcode text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_exists boolean; v_old record;
BEGIN
 -- Serialize catalogue tuple resolution across simultaneous data entry.
 PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(p_code,'')||chr(31)||p_name||chr(31)||p_invoice_price::text,17));
 -- Preserve observed legacy tuple matching and placeholder hiding. Accountant review pending.
 SELECT EXISTS(
 WITH latest AS(SELECT DISTINCT ON(item_id) * FROM public.catalogue_events ORDER BY item_id,revision DESC)
 SELECT 1 FROM latest WHERE action<>'hide' AND code=p_code AND name=p_name AND invoice_price=p_invoice_price
 AND shelf_price IS NOT DISTINCT FROM p_shelf_price
 ) INTO v_exists;
 IF v_exists THEN
   -- A newly scanned barcode can enrich a known exact-price variant without overwriting history.
   IF nullif(trim(coalesce(p_barcode,'')),'') IS NOT NULL THEN
     FOR v_old IN SELECT * FROM (
       SELECT DISTINCT ON(item_id) * FROM public.catalogue_events ORDER BY item_id,revision DESC
     ) e WHERE e.action<>'hide' AND e.code=p_code AND e.name=p_name AND e.invoice_price=p_invoice_price
          AND e.shelf_price IS NOT DISTINCT FROM p_shelf_price
          AND e.barcode IS NULL LOOP
       INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id,legacy_id)
       VALUES(v_old.item_id,v_old.revision+1,'update',v_old.code,v_old.name,v_old.invoice_price,v_old.shelf_price,p_barcode,v_old.source_year,'inventory_barcode',p_actor,v_old.legacy_id);
     END LOOP;
   END IF;
   RETURN;
 END IF;
 INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id)
 VALUES(gen_random_uuid(),1,'create',p_code,p_name,p_invoice_price,p_shelf_price,nullif(trim(p_barcode),''),p_year,'inventory',p_actor);
 IF p_shelf_price IS NOT NULL THEN
   FOR v_old IN SELECT * FROM (
     SELECT DISTINCT ON(item_id) * FROM public.catalogue_events ORDER BY item_id,revision DESC
   ) e WHERE e.action<>'hide' AND e.code=p_code AND e.name=p_name AND e.invoice_price=p_invoice_price AND e.shelf_price IS NULL LOOP
     INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id,legacy_id)
     VALUES(v_old.item_id,v_old.revision+1,'hide',v_old.code,v_old.name,v_old.invoice_price,v_old.shelf_price,v_old.barcode,v_old.source_year,'inventory_placeholder_replaced',p_actor,v_old.legacy_id);
   END LOOP;
 END IF;
END $$;

CREATE FUNCTION public.inventory_submit(
 p_request_id uuid,p_action text,p_year integer,p_entry_id uuid,p_expected_event uuid,
 p_code text,p_name text,p_quantity numeric,p_unit text,p_invoice_price numeric,p_shelf_price numeric,p_cash text,p_note text,p_barcode text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_actor uuid; v_year integer; v_previous public.inventory_events%ROWTYPE;
 v_id uuid; v_ev uuid; v_rev integer; v_fingerprint text; v_old public.inventory_events%ROWTYPE;
BEGIN
 v_actor:=public.require_active_user(false);
 SELECT active_year INTO v_year FROM public.app_config WHERE singleton=true FOR SHARE;
 IF p_year IS DISTINCT FROM v_year THEN RAISE EXCEPTION 'Inactive inventory year' USING ERRCODE='22023'; END IF;
 IF p_request_id IS NULL OR p_action NOT IN ('create','replace','void') THEN RAISE EXCEPTION 'Invalid command'; END IF;
 -- Same submitted request cannot race into two records; lock before idempotency lookup.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 42));
 v_fingerprint:=md5(jsonb_build_object('a',p_action,'y',p_year,'i',p_entry_id,'x',p_expected_event,'c',p_code,'n',p_name,'q',p_quantity,'u',p_unit,'p',p_invoice_price,'s',p_shelf_price,'k',p_cash,'t',p_note,'b',p_barcode)::text);
 SELECT * INTO v_old FROM public.inventory_events WHERE request_id=p_request_id;
 IF FOUND THEN
   IF v_old.request_fingerprint<>v_fingerprint THEN RAISE EXCEPTION 'Request ID reused with different data'; END IF;
   RETURN jsonb_build_object('event_id',v_old.event_id,'entry_id',v_old.entry_id,'revision',v_old.revision,'duplicate',true);
 END IF;
 IF p_action='create' THEN
   IF p_entry_id IS NOT NULL OR p_expected_event IS NOT NULL THEN RAISE EXCEPTION 'Create may not reference old entry'; END IF;
   v_id:=gen_random_uuid();v_rev:=1;
 ELSE
   IF p_entry_id IS NULL OR p_expected_event IS NULL THEN RAISE EXCEPTION 'Missing optimistic concurrency guard'; END IF;
   PERFORM pg_advisory_xact_lock(hashtextextended(p_entry_id::text,0));
   SELECT * INTO v_previous FROM public.inventory_events WHERE entry_id=p_entry_id ORDER BY revision DESC LIMIT 1;
   IF NOT FOUND OR v_previous.year<>p_year OR v_previous.event_id<>p_expected_event OR v_previous.action='void' THEN
     RAISE EXCEPTION 'Record changed; reload before editing' USING ERRCODE='40001';
   END IF;
   v_id:=p_entry_id;v_rev:=v_previous.revision+1;
 END IF;
 IF p_action='void' THEN
   p_code:=v_previous.code;p_name:=v_previous.name;p_quantity:=v_previous.quantity;p_unit:=v_previous.unit;
   p_invoice_price:=v_previous.invoice_price;p_shelf_price:=v_previous.shelf_price;p_cash:=v_previous.cash;p_note:=v_previous.note;p_barcode:=v_previous.barcode;
 END IF;
 IF nullif(trim(p_name),'') IS NULL OR length(p_name)>200 OR length(coalesce(p_code,''))>50 OR length(coalesce(p_note,''))>255 OR length(coalesce(p_barcode,''))>100 THEN RAISE EXCEPTION 'Invalid item data'; END IF;
 IF p_quantity IS NULL OR p_invoice_price IS NULL OR (p_action <> 'void' AND p_shelf_price IS NULL) OR abs(p_quantity)>100000000 OR abs(p_invoice_price)>10000000 OR (p_shelf_price IS NOT NULL AND abs(p_shelf_price)>10000000) THEN RAISE EXCEPTION 'Amount out of range'; END IF;
 IF scale(p_quantity)>2 OR scale(p_invoice_price)>2 OR (p_shelf_price IS NOT NULL AND scale(p_shelf_price)>2) THEN RAISE EXCEPTION 'Precision exceeds 2 decimal places'; END IF;
 INSERT INTO public.inventory_events(entry_id,revision,action,year,code,name,quantity,unit,barcode,invoice_price,shelf_price,invoice_total,shelf_total,cash,note,actor_id,legacy_user,legacy_id,legacy_created_unix,legacy_edited_unix,source,request_id,request_fingerprint)
 VALUES(v_id,v_rev,p_action,p_year,coalesce(p_code,''),p_name,p_quantity,coalesce(p_unit,'gabali'),nullif(trim(p_barcode),''),p_invoice_price,p_shelf_price,
 round(p_quantity*p_invoice_price,2),CASE WHEN p_shelf_price IS NULL THEN NULL ELSE round(p_quantity*p_shelf_price,2) END,
 coalesce(p_cash,''),coalesce(p_note,''),v_actor,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_user END,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_id END,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_created_unix END,CASE WHEN p_action='create' THEN NULL ELSE v_previous.legacy_edited_unix END,'interactive',p_request_id,v_fingerprint)
 RETURNING event_id INTO v_ev;
 IF p_action<>'void' THEN
   PERFORM public.ensure_catalogue_variant(coalesce(p_code,''),p_name,p_invoice_price,p_shelf_price,p_year,v_actor,p_barcode);
 END IF;
 RETURN jsonb_build_object('event_id',v_ev,'entry_id',v_id,'revision',v_rev,'duplicate',false);
END $$;

CREATE FUNCTION public.catalogue_change(
 p_action text,p_item_id uuid,p_expected_revision integer,p_code text,p_name text,
 p_invoice_price numeric,p_shelf_price numeric,p_barcode text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_actor uuid; v_year integer; v_current public.catalogue_events%ROWTYPE;v_item uuid;v_revision integer;v_event uuid;
BEGIN
 v_actor:=public.require_active_user(true);
 SELECT active_year INTO v_year FROM public.app_config WHERE singleton;
 IF p_action='create' THEN
  IF p_item_id IS NOT NULL THEN RAISE EXCEPTION 'Create must not supply item id'; END IF;
  v_item:=gen_random_uuid();v_revision:=1;
 ELSIF p_action IN ('update','hide') THEN
  IF p_item_id IS NULL OR p_expected_revision IS NULL THEN RAISE EXCEPTION 'Version guard missing'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_item_id::text,0));
  SELECT * INTO v_current FROM public.catalogue_events WHERE item_id=p_item_id ORDER BY revision DESC LIMIT 1;
  IF NOT FOUND OR v_current.revision<>p_expected_revision OR v_current.action='hide' THEN RAISE EXCEPTION 'Catalogue entry changed; reload'; END IF;
  v_item:=p_item_id;v_revision:=p_expected_revision+1;
  IF p_action='hide' THEN
   p_code:=v_current.code;p_name:=v_current.name;p_invoice_price:=v_current.invoice_price;p_shelf_price:=v_current.shelf_price;p_barcode:=v_current.barcode;
  END IF;
 ELSE RAISE EXCEPTION 'Invalid catalogue action'; END IF;
 IF nullif(trim(p_name),'') IS NULL OR p_invoice_price IS NULL OR scale(p_invoice_price)>2 OR (p_shelf_price IS NOT NULL AND scale(p_shelf_price)>2) OR abs(p_invoice_price)>10000000 OR (p_shelf_price IS NOT NULL AND abs(p_shelf_price)>10000000) OR length(p_name)>200 OR length(coalesce(p_code,''))>50 OR length(coalesce(p_barcode,''))>100 THEN RAISE EXCEPTION 'Invalid catalogue data'; END IF;
 INSERT INTO public.catalogue_events(item_id,revision,action,code,name,invoice_price,shelf_price,barcode,source_year,source,actor_id,legacy_id)
 VALUES(v_item,v_revision,p_action,coalesce(p_code,''),p_name,p_invoice_price,p_shelf_price,nullif(trim(p_barcode),''),v_year,'administrator',v_actor,CASE WHEN p_action='create' THEN NULL ELSE v_current.legacy_id END)
 RETURNING event_id INTO v_event;
 RETURN jsonb_build_object('item_id',v_item,'event_id',v_event,'revision',v_revision);
END $$;

CREATE FUNCTION public.admin_stats(p_year integer,p_asof timestamptz DEFAULT NULL)
RETURNS TABLE(entry_count bigint,group_count bigint,quantity numeric,invoice_total numeric,shelf_total numeric,difference numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(true);
 RETURN QUERY WITH latest AS (
   SELECT DISTINCT ON(e.entry_id) e.* FROM public.inventory_events e
   WHERE e.year=p_year AND (p_asof IS NULL OR e.recorded_at<=p_asof)
   ORDER BY e.entry_id,e.revision DESC
 ), current_rows AS (SELECT * FROM latest WHERE action<>'void')
 SELECT COUNT(*),
   (SELECT COUNT(*) FROM (SELECT 1 FROM current_rows GROUP BY code,name,invoice_price,shelf_price,cash) grouped),
   COALESCE(SUM(c.quantity),0),COALESCE(SUM(c.invoice_total),0),COALESCE(SUM(c.shelf_total),0),
   COALESCE(SUM(c.shelf_total),0)-COALESCE(SUM(c.invoice_total),0)
 FROM current_rows c;
END $$;

CREATE FUNCTION public.admin_history(p_entry_id uuid)
RETURNS TABLE(event_id uuid,revision integer,action text,quantity numeric,invoice_price numeric,shelf_price numeric,actor_id uuid,recorded_at timestamptz,source text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 PERFORM public.require_active_user(true);
 RETURN QUERY SELECT e.event_id,e.revision,e.action,e.quantity,e.invoice_price,e.shelf_price,e.actor_id,e.recorded_at,e.source
 FROM public.inventory_events e WHERE e.entry_id=p_entry_id ORDER BY e.revision DESC;
END $$;

-- Lock down all application RPCs to authenticated sessions; helper remains internal.
REVOKE ALL ON FUNCTION public.require_active_user(boolean) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.ensure_catalogue_variant(text,text,numeric,numeric,integer,uuid,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.deny_event_mutation() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.inventory_list(integer,text,text,integer,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.inventory_details(integer,text,text,numeric,numeric,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.inventory_submit(uuid,text,integer,uuid,uuid,text,text,numeric,text,numeric,numeric,text,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.catalogue_search(text,integer,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.catalogue_change(text,uuid,integer,text,text,numeric,numeric,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.admin_stats(integer,timestamptz) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.admin_history(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.inventory_list(integer,text,text,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inventory_details(integer,text,text,numeric,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inventory_submit(uuid,text,integer,uuid,uuid,text,text,numeric,text,numeric,numeric,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.catalogue_search(text,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.catalogue_change(text,uuid,integer,text,text,numeric,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_stats(integer,timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_history(uuid) TO authenticated;


-- Administrator sets the year explicitly; all updates are restricted to SECURITY DEFINER.
CREATE FUNCTION public.admin_set_year(p_year integer) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  PERFORM public.require_active_user(true);
  IF p_year < 2000 OR p_year > 2200 THEN RAISE EXCEPTION 'Invalid year'; END IF;
  INSERT INTO public.administration_events(actor_id,event_type,previous_value,next_value)
  SELECT auth.uid(),'year_changed',jsonb_build_object('active_year',active_year),jsonb_build_object('active_year',p_year)
  FROM public.app_config WHERE singleton;
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
DECLARE v_actor uuid; v_previous public.user_profiles%ROWTYPE; v_existed boolean;
BEGIN
 v_actor:=public.require_active_user(true);
 IF p_id IS NULL OR p_role NOT IN ('admin','staff') OR p_active IS NULL OR length(coalesce(p_name,''))>120 THEN
  RAISE EXCEPTION 'Invalid profile data'; END IF;
 IF v_actor=p_id AND (p_role<>'admin' OR p_active=false) THEN
  RAISE EXCEPTION 'Current admin cannot deactivate self'; END IF;
 SELECT * INTO v_previous FROM public.user_profiles WHERE id=p_id FOR UPDATE;
 v_existed:=FOUND;
 IF v_existed THEN
  UPDATE public.user_profiles SET display_name=coalesce(p_name,''),role=p_role,active=p_active WHERE id=p_id;
 ELSE
  INSERT INTO public.user_profiles(id,display_name,role,active) VALUES(p_id,coalesce(p_name,''),p_role,p_active);
 END IF;
 INSERT INTO public.administration_events(actor_id,event_type,subject_id,previous_value,next_value)
 VALUES(v_actor,CASE WHEN v_existed THEN 'user_updated' ELSE 'user_created' END,p_id,
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
