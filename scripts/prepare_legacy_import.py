#!/usr/bin/env python3
"""Prepare exact legacy data for a separate PRIVATE import and local UI review.

Reads the user's MySQL ZIP. Never imports passwords, database config/secrets or SQL
statements from the original dump into the browser or public repository.
Produces three files OUTSIDE the publish directory. Works with Python stdlib only.
The original database is never accessed or modified.
"""
import argparse, collections, datetime, decimal, hashlib, json, os, pathlib, re, sys, uuid, zipfile

D=decimal.Decimal
NAMESPACE=uuid.UUID('b4308224-f5ca-4704-944f-198b4f44228b')

def rows(sql,table):
    # The specific mysqldump layout in the supplied source; not a general SQL parser.
    result=[]; needle='INSERT INTO `'+table+'` VALUES '
    for match in re.finditer(re.escape(needle),sql):
        i=match.end(); inside=False; in_string=False; escape=False; token=''; row=[]; quoted=False
        while i < len(sql):
            ch=sql[i]
            if not inside:
                if ch=='(': inside=True;row=[];token='';quoted=False
                elif ch==';':break
            elif escape: token+=ch;escape=False
            elif in_string:
                if ch=='\\':escape=True
                elif ch=="'":
                    if i+1 < len(sql) and sql[i+1]=="'": token+="'";i+=1
                    else:in_string=False
                else:token+=ch
            elif ch=="'":in_string=True;quoted=True
            elif ch==',':row.append(token if quoted else token.strip());token='';quoted=False
            elif ch==')':
                row.append(token if quoted else token.strip());result.append(row);inside=False
            else:token+=ch
            i+=1
    return result

def q(x):
    if x is None:return 'NULL'
    if isinstance(x,bool):return 'true' if x else 'false'
    return "'"+str(x).replace("'","''").replace('\x00','')+"'"

def insert_batches(handle, table, columns, entries, batch_size=250):
    handle.write('-- '+table+' : '+str(len(entries))+' rows\n')
    for st in range(0,len(entries),batch_size):
        block=entries[st:st+batch_size]
        handle.write('INSERT INTO public.'+table+'('+','.join(columns)+') VALUES\n')
        handle.write(',\n'.join('('+','.join(q(x) for x in entry)+')' for entry in block))
        handle.write(' ON CONFLICT DO NOTHING;\n')

def summarise(inventory,catalogue,staged,src_hash,configured_year):
    counts=collections.Counter(); grouped=collections.defaultdict(set); qty=collections.defaultdict(lambda:D('0'))
    inv=collections.defaultdict(lambda:D('0')); shelf=collections.defaultdict(lambda:D('0'))
    year_zero_pl=collections.Counter()
    for r in inventory:
        year=int(r[11]);counts[year]+=1
        grouped[year].add((r[1],r[2],r[5],r[6],r[9]))
        qty[year]+=D(r[3]);inv[year]+=D(r[7]);shelf[year]+=D(r[8])
        if D(r[6])==0:year_zero_pl[year]+=1
    years={str(year):dict(rows=counts[year],groups=len(grouped[year]),quantity=str(qty[year]),invoice_sum=str(inv[year].quantize(D('0.01'))),shelf_sum=str(shelf[year].quantize(D('0.01'))),difference=str((shelf[year]-inv[year]).quantize(D('0.01'))),zero_shelf_count=year_zero_pl[year]) for year in sorted(counts)}
    return dict(source_sha256=src_hash, configured_year=configured_year,inventory_rows=len(inventory),catalogue_rows=len(catalogue),invoice_stage_rows=len(staged),years=years)

def main():
    a=argparse.ArgumentParser(description=__doc__)
    a.add_argument('--zip',required=True,help='Original private inventarizacija.zip')
    a.add_argument('--output',required=True,help='Private output folder (NEVER Netlify publish or public Git)')
    args=a.parse_args()
    out=pathlib.Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(args.zip) as z:
        matches=[name for name in z.namelist() if name.lower().endswith('.sql')]
        if len(matches)!=1:raise SystemExit('Expected exactly one SQL file in input archive')
        raw=z.read(matches[0]);source_hash=hashlib.sha256(raw).hexdigest()
        sql=raw.decode('utf-8-sig','replace')
    r_inv=rows(sql,'preces');r_cat=rows(sql,'precu_katalogs');r_imp=rows(sql,'import');r_stage=rows(sql,'table6');r_users=rows(sql,'users');r_maint=rows(sql,'maintenance')
    widths={'preces':(r_inv,16),'precu_katalogs':(r_cat,8),'import':(r_imp,8),'table6':(r_stage,3),'users':(r_users,3),'maintenance':(r_maint,3)}
    for name,(part,width) in widths.items():
        if not part or any(len(r)!=width for r in part):raise SystemExit('Unexpected table contents: '+name)
    configured=int(r_maint[0][2]);expect=summarise(r_inv,r_cat,r_stage,source_hash,configured)
    # Never copy plaintext passwords. User labels are only for the private admin-only import.
    preview={
        'format':'inventory-legacy-preview-v1','readonly':True,
        'note':'Vēsturiskā MySQL eksporta dati. Pārlūka priekšskatījums; neveic servera rakstīšanu.',
        'source_sha256':source_hash,'configured_year':configured,
        'columns':{'inventory':['id','code','name','qty','unit','pz_price','pl_price','pz_total','pl_total','cash','note','year','user','tstamp','euser','etstamp'],
                   'catalogue':['id','code','name','pz_price','pl_price','year','user','euser']},
        'inventory_rows':r_inv,'catalogue_rows':r_cat
    }
    (out/'legacy_snapshot.json').write_text(json.dumps(preview,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    (out/'reconciliation_expected.json').write_text(json.dumps(expect,ensure_ascii=False,indent=2),encoding='utf-8')
    fpath=out/'legacy_import.sql'
    with fpath.open('w',encoding='utf-8',newline='\n') as f:
        f.write('-- SENSITIVE, PRIVATE. DO NOT COMMIT OR DEPLOY.\n')
        f.write('-- Run only AFTER supabase/migrations/202611250001_base.sql on NEW TEST PostgreSQL DB.\n')
        f.write('BEGIN;\n')
        f.write('''DO $verify_empty$ BEGIN
 IF EXISTS (SELECT 1 FROM public.legacy_inventory_raw LIMIT 1)
  OR EXISTS (SELECT 1 FROM public.inventory_events LIMIT 1)
  OR EXISTS (SELECT 1 FROM public.catalogue_events LIMIT 1)
 THEN RAISE EXCEPTION 'Import target must be EMPTY to preserve forensic provenance'; END IF;
END $verify_empty$;\n''')
        insert_batches(f,'legacy_inventory_raw',('legacy_id','code','name','quantity','unit','invoice_price','shelf_price','invoice_total','shelf_total','cash','note','year','legacy_user','legacy_created_unix','legacy_edited_by','legacy_edited_unix'),r_inv)
        insert_batches(f,'legacy_catalogue_raw',('legacy_id','code','name','invoice_price','shelf_price','source_year','legacy_user','legacy_edited_by'),r_cat)
        insert_batches(f,'legacy_import_raw',('legacy_id','code','name','invoice_price','shelf_price','source_year','legacy_user','legacy_edited_by'),r_imp)
        insert_batches(f,'legacy_invoice_stage_raw',('row_number','code','name','invoice_price'),[
            (i+1,None if r[0]=='NULL' else r[0],None if r[1]=='NULL' else r[1],None if r[2]=='NULL' else r[2]) for i,r in enumerate(r_stage)])
        insert_batches(f,'legacy_user_labels',('legacy_user_id','legacy_username'),[(r[0],r[1]) for r in r_users])
        inv_events=[]
        for r in r_inv:
            eid=str(uuid.uuid5(NAMESPACE,'inventory-entry-'+r[0]));evt=str(uuid.uuid5(NAMESPACE,'inventory-event-'+r[0]));req=str(uuid.uuid5(NAMESPACE,'legacy-request-'+r[0]))
            inv_events.append((evt,eid,1,'create',r[11],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],r[12],r[0],r[13],r[15],'legacy_snapshot',req,'legacy:'+r[0]))
        insert_batches(f,'inventory_events',('event_id','entry_id','revision','action','year','code','name','quantity','unit','invoice_price','shelf_price','invoice_total','shelf_total','cash','note','legacy_user','legacy_id','legacy_created_unix','legacy_edited_unix','source','request_id','request_fingerprint'),inv_events)
        cat_events=[]
        for r in r_cat:
            eid=str(uuid.uuid5(NAMESPACE,'catalogue-event-'+r[0]));item=str(uuid.uuid5(NAMESPACE,'catalogue-item-'+r[0]))
            # Explicitly preserve raw 0.00 separately; invoice-origin imported unknown shelf is NULL in business catalogue.
            shelf=None if r[5]=='2026' and D(r[4])==0 else r[4]
            cat_events.append((eid,item,1,'create',r[1],r[2],r[3],shelf,r[5],'legacy_catalogue',r[0]))
        insert_batches(f,'catalogue_events',('event_id','item_id','revision','action','code','name','invoice_price','shelf_price','source_year','source','legacy_id'),cat_events)
        insert_batches(f,'legacy_import_metadata',('source_sha256','source_label','inventory_count','catalogue_count','import_count','invoice_stage_count','configured_year'),
                       [(source_hash,'26-11-21_13-06-34.sql',len(r_inv),len(r_cat),len(r_imp),len(r_stage),configured)])
        f.write('''DO $check_import$ BEGIN
 IF (SELECT COUNT(*) FROM public.legacy_inventory_raw) <> '''+str(len(r_inv))+''' THEN
  RAISE EXCEPTION 'Legacy inventory row count mismatch'; END IF;
 IF (SELECT COUNT(*) FROM public.inventory_events) <> '''+str(len(r_inv))+''' THEN
  RAISE EXCEPTION 'Event mirror count mismatch'; END IF;
 IF (SELECT COUNT(*) FROM public.legacy_catalogue_raw) <> '''+str(len(r_cat))+''' THEN
  RAISE EXCEPTION 'Legacy catalogue row count mismatch'; END IF;
 IF (SELECT COUNT(*) FROM public.catalogue_events) <> '''+str(len(r_cat))+''' THEN
  RAISE EXCEPTION 'Catalogue event count mismatch'; END IF;
 IF (SELECT COUNT(*) FROM public.legacy_import_raw) <> '''+str(len(r_imp))+''' THEN
  RAISE EXCEPTION 'Legacy staging row count mismatch'; END IF;
 IF (SELECT COUNT(*) FROM public.legacy_invoice_stage_raw) <> '''+str(len(r_stage))+''' THEN
  RAISE EXCEPTION 'Invoice stage row count mismatch'; END IF;
''')
        for year,control in sorted(expect['years'].items()):
            f.write(f''' IF (SELECT COUNT(*) FROM public.legacy_inventory_raw WHERE year={year}) <> {control['rows']}
    OR (SELECT COALESCE(SUM(invoice_total),0) FROM public.legacy_inventory_raw WHERE year={year}) <> {control['invoice_sum']}
    OR (SELECT COALESCE(SUM(shelf_total),0) FROM public.legacy_inventory_raw WHERE year={year}) <> {control['shelf_sum']}
    OR (SELECT COUNT(*) FROM (SELECT 1 FROM public.legacy_inventory_raw WHERE year={year} GROUP BY code,name,invoice_price,shelf_price,cash) q) <> {control['groups']}
 THEN RAISE EXCEPTION 'Accounting reconciliation failed for {year}'; END IF;
''')
        f.write('END $check_import$;\n')
        f.write('COMMIT;\n')
    # Compare what is reproducible via exact SQL sums, without presenting a premature judgement about recalculated values.
    (out/'README_PRIVATIE_DATI.txt').write_text('VĒSTURISKIE DATI - KONFIDENCIĀLI\n\n'
      'legacy_snapshot.json: atver lietotnes lokālajā priekšskatījumā caur faila izvēli. Neaugšupielādējas tīklā.\n'
      'legacy_import.sql: psql imports JAUNĀ TESTA Supabase PostgreSQL projektā pēc bāzes migrācijas.\n'
      'reconciliation_expected.json: sākotnējās 2018-2025 summas un grupu skaits.\n'
      'NEDRĪKST ievietot publiskajā Netlify katalogā, GitHub repozitorijā vai klienta JavaScript.\n'
      'Vecās paroles nav pārnestas un vecos PHP lietotājus nedrīkst izmantot autorizācijai.\n'
      'Tikai autorizēts administrators drīkst rīkoties ar šo failu komplektu.\n',encoding='utf-8')
    print('Prepared private dataset:',out)
    print('Inventory:',len(r_inv),'Catalogue:',len(r_cat),'staging:',len(r_stage),'SHA256:',source_hash)
    for k,v in expect['years'].items():print(k,v['rows'],v['groups'],v['invoice_sum'],v['shelf_sum'])

if __name__=='__main__':main()
