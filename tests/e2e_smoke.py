"""Browser UI smoke test using a self-contained page because CI may block localhost navigation."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import re
BASE=Path(__file__).parents[1];SITE=BASE/'site';OUT=BASE/'private-data'/'qa';OUT.mkdir(parents=True,exist_ok=True);PVT=BASE/'private-data'/'legacy_snapshot.json'
html=(SITE/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]+>', '', html)
html=re.sub(r'<script[^>]+src="/config.js"[^>]*></script>', '', html)
html=re.sub(r'<script[^>]+src="/js/app.js"[^>]*></script>', '', html)
mods=[]
for name in ['util','legacy','api','app']:
 s=(SITE/'js'/f'{name}.js').read_text()
 s=re.sub(r'^import\s+\{[^\n]+\n','',s,flags=re.M)
 s=re.sub(r'^export\s+','',s,flags=re.M)
 mods.append(s)
bundle='window.APP_CONFIG={supabaseUrl:"",supabaseAnonKey:""};\n'+'\n'.join(mods)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--no-proxy-server'])
 def init(context):
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded');page.add_style_tag(content=(SITE/'styles.css').read_text());page.add_script_tag(content=bundle)
  return page,errors
 desk=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
 page,errs=init(desk);page.get_by_text('Pieslēgties sistēmai').wait_for()
 page.screenshot(path=str(OUT/'login_desktop.png'),full_page=True)
 page.locator('#legacy-file').set_input_files(str(PVT))
 page.get_by_text('Inventarizācijas pozīcijas').wait_for(timeout=55000)
 assert page.locator('tbody tr').count()>0
 page.screenshot(path=str(OUT/'preview_desktop.png'),full_page=True)
 page.locator('tbody tr [data-action=details]').first.click()
 page.get_by_text('Atsevišķie ievades ieraksti',exact=False).wait_for()
 assert page.locator('[data-action=edit-entry]').count()==0
 page.locator('[data-action=close]').first.click()
 page.locator('nav [data-id=catalogue]').click()
 page.get_by_text('Preču katalogs').first.wait_for()
 assert page.locator('tbody tr').count()>0
 page.locator('nav [data-id=stats]').click();page.get_by_text('Pavadzīmju summa').first.wait_for()
 assert '45' in page.locator('.kpi-row').inner_text()
 page.screenshot(path=str(OUT/'stats_desktop.png'),full_page=True)
 assert not errs,errs
 print('DESKTOP PASS')
 desk.close()
 mob=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 pg,err2=init(mob);pg.locator('#legacy-file').set_input_files(str(PVT))
 pg.get_by_text('Inventarizācijas pozīcijas').wait_for(timeout=55000)
 assert pg.locator('.mobile-card').count()>0
 assert pg.locator('.mobile-nav .nav-item').count()==4
 pg.screenshot(path=str(OUT/'preview_mobile.png'),full_page=True)
 pg.locator('.mobile-card').first.click();assert pg.locator('.modal').is_visible()
 pg.screenshot(path=str(OUT/'detail_mobile.png'),full_page=True)
 assert not err2,err2
 print('MOBILE PASS')
 browser.close()
