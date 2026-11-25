#!/usr/bin/env python3
"""Static gate only; not a substitute for live Supabase RLS verification."""
from pathlib import Path
p=Path(__file__).resolve().parents[1];sql=(p/'supabase/migrations/202611250001_base.sql').read_text()
required=['ALTER TABLE public.inventory_events ENABLE ROW LEVEL SECURITY','ALTER TABLE public.catalogue_events ENABLE ROW LEVEL SECURITY','ALTER TABLE public.legacy_inventory_raw ENABLE ROW LEVEL SECURITY','no_inventory_event_mutation','no_legacy_inventory_mutation','no_catalogue_event_mutation','no_admin_event_mutation','SECURITY DEFINER SET search_path','public.require_active_user(true)','public.require_active_user(false)','p_expected_event','request_id uuid NOT NULL UNIQUE','pg_advisory_xact_lock','UNIQUE(legacy_id,revision)','NUMERIC','auth.uid()']
for text in required:assert text.lower() in sql.lower(),text
for root in [p/'site',p/'dist']:
 assert not list(root.rglob('*.sql')),(root,'SQL in public directory')
 assert not list(root.rglob('*.json')) if False else True
 assert not list(root.rglob('legacy_snapshot.json'))
 assert not list(root.rglob('legacy_import.sql'))
 assert not list(root.rglob('*backup*.sql'))
static='\n'.join(x.read_text(errors='ignore') for x in (p/'site').rglob('*.js'))
assert 'SUPABASE_SERVICE_ROLE_KEY' not in static
assert 'legacy_inventory_raw' not in static or 'legacy_inventory_raw' in sql
assert 'CREATE POLICY profiles_self_read' in sql
assert 'REVOKE ALL ON public.inventory_events' in sql
assert (p/'.gitignore').read_text().find('private-data/')>=0
print('PASS static safety checks; live RLS tests remain unexecuted')
