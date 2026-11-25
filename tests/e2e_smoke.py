"""Read-only browser smoke + mocked user interaction (no external network writes).
Private legacy_snapshot.json is REQUIRED locally and excluded from distributable ZIP.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json
P=Path(__file__).resolve().parents[1]
SITE=P/'site'
PVT=P/'private-data/legacy_snapshot.json'
OUT=P/'private-data/qa'
if not PVT.is_file():
 raise SystemExit('UNTESTED: private-data/legacy_snapshot.json missing. Do not report PASS.')
OUT.mkdir(parents=True,exist_ok=True)
HTML=(SITE/'index.html').read_text()
HTML=re.sub(r'<link rel="stylesheet"[^>]+>', '', HTML)
HTML=re.sub(r'<script[^>]+src="/config.js"[^>]*></script>', '', HTML)
HTML=re.sub(r'<script[^>]+src="/js/app.js"[^>]*></script>', '', HTML)
modules=[]
for name in ['util','legacy','api','app']:
 s=(SITE/'js'/f'{name}.js').read_text()
 s=re.sub(r'^import\s+\{[^\n]+\n','',s,flags=re.M)
 s=re.sub(r'^export\s+','',s,flags=re.M)
 modules.append(s)
BUNDLE='window.APP_CONFIG={supabaseUrl:"",supabaseAnonKey:""};\nif (!crypto.randomUUID) Object.defineProperty(crypto, "randomUUID", {value:()=>"33333333-3333-4333-8333-333333333333"});\n'+'\n'.join(modules)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--no-proxy-server'])
 def init(viewport,is_mobile=False):
  context=browser.new_context(viewport=viewport,device_scale_factor=1,is_mobile=is_mobile,has_touch=is_mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML,wait_until='domcontentloaded')
  page.add_style_tag(content=(SITE/'styles.css').read_text())
  page.add_script_tag(content=BUNDLE)
  page.locator('#login-email').wait_for()
  return context,page,errors
 def start_preview(page):
  page.locator('#legacy-file').set_input_files(str(PVT))
  page.locator('#entry-search').wait_for(timeout=55000)
 desk,page,errs=init({'width':1440,'height':900})
 assert page.get_by_text('E-pasts',exact=True).is_visible()
 page.screenshot(path=str(OUT/'login_desktop.png'))
 start_preview(page)
 assert page.locator('.sidebar nav [data-action="nav"]').count()==5
 assert page.locator('h1').first.inner_text()=='Datu ievade'
 assert page.locator('button[data-action="scan-entry"]').is_visible()
 assert page.locator('#e-qty').input_value()=='1.00'
 page.locator('[data-action="qty-plus"]').click();assert page.locator('#e-qty').input_value()=='2.00'
 page.locator('[data-action="qty-minus"]').click();assert page.locator('#e-qty').input_value()=='1.00'
 page.locator('#e-qty').fill('3,50');assert page.locator('#e-qty').input_value()=='3,50'
 # Search should return CATALOGUE results, not inventory rows.
 cat=json.loads(PVT.read_text())['catalogue_rows']
 term=next((str(r[2])[:6] for r in cat if len(str(r[2]).strip())>=7),None)
 assert term is not None
 page.locator('#entry-search').fill(term)
 page.locator('.lookup-row').first.wait_for(timeout=15000)
 assert page.locator('#entry-results .lookup-row').count()>=1
 first_name=page.locator('.lookup-row-name').first.inner_text()
 page.locator('.lookup-row').first.click()
 assert page.locator('#e-name').input_value()==first_name
 assert page.locator('#e-qty').input_value()=='3,50'  # catalogue selection never overwrites qty
 assert not page.locator('#quick-entry-form button[type="submit"]').is_enabled()  # read only preview
 page.screenshot(path=str(OUT/'entry_desktop.png'),full_page=True)
 page.locator('[data-action="scan-entry"]').click()
 page.locator('#scan-manual').wait_for()
 page.locator('#scan-manual').fill('0001234567890')
 page.locator('[data-action="scan-manual-search"]').click()
 page.locator('#e-barcode').wait_for()
 assert page.locator('#e-barcode').input_value()=='0001234567890'
 # Scanner unknown must not carry stale product identity or prices.
 assert page.locator('#e-name').input_value()==''
 assert page.locator('#e-code').input_value()==''
 assert page.locator('#e-pz').input_value()==''
 assert page.locator('#e-pl').input_value()==''
 page.locator('nav [data-id="inventory"]').click()
 page.locator('text=Ievadītās preces').first.wait_for(timeout=55000)
 assert page.locator('tbody tr').count()>0
 page.screenshot(path=str(OUT/'inventory_desktop.png'),full_page=True)
 page.locator('tbody tr [data-action=details]').first.click()
 page.get_by_text('Atsevišķie ievades ieraksti',exact=False).wait_for()
 assert not page.locator('[data-action="edit-entry"]').count()
 page.locator('[data-action="close"]').first.click()
 page.locator('nav [data-id="catalogue"]').click()
 page.get_by_text('Preču katalogs').first.wait_for()
 assert page.locator('tbody tr').count()>0
 page.locator('nav [data-id="stats"]').click()
 page.get_by_text('Pavadzīmju summa').first.wait_for()
 page.locator('nav [data-id="admin"]').click()
 page.get_by_text('Inventarizācijas konfigurācija').wait_for()
 assert not errs,errs
 # Simulate staff API in memory: never issue a network write.
 page.evaluate("""async () => {
  controller.mode='remote'; controller.me={role:'staff',display_name:'Testa lietotājs'};
  controller.config.active_year=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Riga',year:'numeric'}).format(new Date()));
  controller.year=Number(controller.config.active_year);
  controller.section='entry';controller.entryQuery='';controller.entryResults=[];
  controller.entryDraft={code:'',name:'',barcode:'',quantity:'1.00',unit:'gabali',invoice_price:'',shelf_price:'',cash:'1.stāvs',note:''};
  window.__saved=[];
  controller.api.inventorySubmit=async payload=>{window.__saved.push(payload);return {event_id:'mock'}};
  controller.api.catalogueByBarcode=async barcode=>[{item_id:'mock',code:'T-1',name:'Testa prece',invoice_price:'12.50',shelf_price:'15.00',barcode}];
  await controller.loadSection();
 }""")
 assert page.locator('.sidebar nav [data-action=nav]').count()==3
 page.locator('[data-action="scan-entry"]').click()
 page.locator('#scan-manual').fill('0001234567890')
 page.locator('[data-action="scan-manual-search"]').click()
 page.locator('#e-name').wait_for()
 assert page.locator('#e-name').input_value()=='Testa prece'
 assert page.locator('#e-code').input_value()=='T-1'
 assert page.locator('#e-pz').input_value()=='12.50'
 assert page.locator('#e-pl').input_value()=='15.00'
 page.locator('#e-qty').fill('2,50')
 page.locator('#e-note').fill('Testa piezīme')
 page.locator('#quick-entry-form button[type=submit]').click()
 page.wait_for_function('window.__saved.length===1')
 payload=page.evaluate('window.__saved[0]')
 assert payload['p_action']=='create' and payload['p_code']=='T-1'
 assert payload['p_barcode']=='0001234567890' and payload['p_quantity']=='2.50'
 assert payload['p_invoice_price']=='12.50' and payload['p_shelf_price']=='15.00'
 assert payload['p_cash']=='1.stāvs' and payload['p_unit']=='gabali'
 assert len(payload['p_request_id'])==36
 print('STAFF_MOCK_PASS: 3 tabs, exact barcode autofill, decimal payload, single append-only submission')
 print('DESKTOP_PASS: entry catalogue, selection, manual quantity, unknown barcode, 5 tabs, inventory and admin pages')
 desk.close()
 mob,pg,errm=init({'width':390,'height':844},is_mobile=True)
 start_preview(pg)
 assert pg.locator('.mobile-nav [data-action="nav"]').count()==5
 pg.locator('#entry-search').fill(term)
 pg.locator('.lookup-row').first.wait_for(timeout=15000)
 pg.locator('.lookup-row').first.click()
 assert pg.locator('#e-name').input_value()!=''
 pg.screenshot(path=str(OUT/'entry_mobile.png'),full_page=True)
 pg.locator('.mobile-nav [data-id="inventory"]').click()
 pg.locator('.mobile-card').first.wait_for()
 pg.screenshot(path=str(OUT/'inventory_mobile.png'),full_page=True)
 assert not errm,errm
 print('MOBILE_PASS: five tabs, catalogue search and entry form, inventory list')
 mob.close();browser.close()
