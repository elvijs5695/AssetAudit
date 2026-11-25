#!/usr/bin/env python3
"""Independent DECIMAL reconciliation of supplied private history; read-only."""
import json,collections,sys,pathlib,decimal,hashlib
D=decimal.Decimal
path=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else pathlib.Path(__file__).parents[1]/'private-data'/'legacy_snapshot.json')
source=json.loads(path.read_text(encoding='utf-8'))
expected=json.loads(path.with_name('reconciliation_expected.json').read_text())
assert source['readonly'] is True and source['source_sha256']==expected['source_sha256']
rows=source['inventory_rows'];cats=source['catalogue_rows']; assert len(rows)==expected['inventory_rows'];assert len(cats)==expected['catalogue_rows']
count=collections.Counter();groups=collections.defaultdict(set);qty=collections.defaultdict(lambda:D('0'));pz=collections.defaultdict(lambda:D('0'));pl=collections.defaultdict(lambda:D('0'));anomalies=[];mixed_units=collections.defaultdict(set)
for r in rows:
    year=int(r[11]);count[year]+=1
    group=(r[1],r[2],r[5],r[6],r[9]);groups[year].add(group);mixed_units[(year,group)].add(r[4])
    qty[year]+=D(r[3]);pz[year]+=D(r[7]);pl[year]+=D(r[8])
    for amount,price,label in [(r[7],r[5],'PZ'),(r[8],r[6],'PL')]:
        exact=(D(r[3])*D(price)).quantize(D('.01'),rounding=decimal.ROUND_HALF_UP)
        if exact!=D(amount): anomalies.append({'legacy_id':int(r[0]),'year':year,'kind':label,'stored':str(amount),'recalculated_half_up':str(exact)})
for year,exp in expected['years'].items():
    y=int(year)
    assert count[y]==exp['rows'],(year,'count',count[y],exp['rows'])
    assert len(groups[y])==exp['groups'],(year,'grouping')
    assert qty[y]==D(exp['quantity']),(year,'quantity')
    assert pz[y]==D(exp['invoice_sum']),(year,'pz')
    assert pl[y]==D(exp['shelf_sum']),(year,'pl')
    assert (pl[y]-pz[y])==D(exp['difference']),(year,'difference')
print('PASS: 8 year counts, exact stored sums, grouping and differences match historical expected results.')
print('Inventory:',len(rows),'catalogue:',len(cats),'row arithmetic variations:',len(anomalies))
print('Cross-unit grouping collisions:',sum(1 for v in mixed_units.values() if len(v)>1))
for a in anomalies[:20]:print('VARIATION:',a)
report={'status':'passed','source_sha256':expected['source_sha256'],'rows':len(rows),'catalogue':len(cats),'years':expected['years'],'row_arithmetic_variations':anomalies,'mixed_unit_group_count':sum(1 for v in mixed_units.values() if len(v)>1)}
path.with_name('reconciliation_verified.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
