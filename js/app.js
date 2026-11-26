import {SupabaseAPI} from './api.js?v=0.2.7';
import {esc,dec2,fromDec2,formatMoney,formatQty,localYear,icon,debounce} from './util.js?v=0.2.7';
import {parseCatalogueXlsx} from './xlsx.js?v=0.2.7';
const APP_VERSION='0.2.8';
const root=document.getElementById('app');
const currentYear=localYear();
const years=Array.from({length:11},(_,i)=>currentYear+1-i);
const cashOptions=['1.stāvs','2.stāvs','Tirgus'];
const cashLabel=v=>v==='1.stāvs'?'1. stāvs':v==='2.stāvs'?'2. stāvs':v;
const units=['gabali','komplekti','metri','kg'];
const nav=[['entry','Datu ievade','edit'],['inventory','Preču saraksts','list'],['catalogue','Katalogs','box'],['stats','Statistika','chart'],['admin','Administrācija','settings']];
const safeNum=(v)=>String(v??'').trim().replace(',','.');
const money=(v)=>formatMoney(v);
const inputMoney=v=>v===null||v===undefined||v===''?'':Number(String(v).replace(',','.')).toFixed(2);
const dateLV=v=>v?new Intl.DateTimeFormat('lv-LV',{timeZone:'Europe/Riga',dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'Nav datuma';
const actionLV={create:'Pievienots',replace:'Labots',void:'Anulēts',update:'Labots',hide:'Izņemts no kataloga'};
const cashFilter=[{value:'',label:'Visas'},...cashOptions.map(v=>({value:v,label:cashLabel(v)}))];
const eattr=esc;
const options=(arr,selected)=>arr.map(x=>{const item=x!==null&&typeof x==='object';const val=item?x.value:x;const label=item?x.label:x;return `<option value="${eattr(val)}" ${String(val)===String(selected)?'selected':''}>${esc(label)}</option>`}).join('');
const fields=(id,label,value='',type='text',extra='')=>`<div class="form-field"><label for="${id}">${esc(label)}</label><input class="field" id="${id}" type="${type}" value="${eattr(value)}" ${extra}></div>`;
const fieldSelect=(id,label,values,selected)=>`<div class="form-field"><label for="${id}">${esc(label)}</label><select class="field" id="${id}">${options(values,selected)}</select></div>`;
class InventoryApp{
 constructor(){
  this.api=new SupabaseAPI(window.APP_CONFIG||{});this.me=null;
  this.section='entry';this.year=currentYear;this.config={active_year:currentYear,year_closed:false};this.search='';this.cash='';this.statsCash='';this.offset=0;this.invPageSize=50;this.catPageSize=50;this.expandedRow=-1;this.expandedDetails=[];this.inlineHistory={};this.xlsxRows=[];this.xlsxPreview=null;this.xlsxFileName='';this.nextYearPreview=null;this.modalStack=[];this.daily=[];
  this.catalogue=[];this.inventory=[];this.entryResults=[];this.entryQuery='';this.entryDraft={code:'',name:'',barcode:'',quantity:'1.00',unit:'gabali',invoice_price:'',shelf_price:'',cash:'1.stāvs',note:''};this.entryRequestId=null;this.entrySeq=0;this.entryCatalogueOpen=false;this.entrySearchEnabled=true;this.entrySearchState='idle';this.entryNoMatchAwaitNext=false;this.entryUnitManual=false;this.scanSource='entry';this.detail=null;this.stats=null;this.users=[];this.userStatusFilter='all';this.userSearch='';this.modal=null;this.suggest=[];this.busy=false;this.scanner=null;this.flash='';
  this.navHistoryReady=false;this.navigationSequence=0;
  window.addEventListener('popstate',e=>this.onBrowserBack(e));
  this.debouncedSearch=debounce(()=>this.section==='entry'?this.lookupEntry():this.loadSection(true),380);
  root.addEventListener('click',e=>this.click(e));root.addEventListener('focusout',e=>this.blur(e));root.addEventListener('submit',e=>{if(e.target.id==='quick-entry-form'){e.preventDefault();this.saveQuickEntry().catch(err=>this.toast(err.message,'error'))}else if(e.target.id==='user-form'){e.preventDefault();this.saveUser().catch(err=>this.toast(err.message,'error'))}});root.addEventListener('change',e=>this.change(e));root.addEventListener('input',e=>this.input(e));root.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.modal)this.closeModal();if((e.key==='Enter'||e.key===' ')&&e.target.matches('tr.group-row[data-action=details]')){e.preventDefault();e.target.click()}});
 }
 get isAdmin(){return this.me?.role==='admin'}
 get current(){return !this.config.year_closed&&(this.section!=='inventory'||this.year===Number(this.config.active_year))}
 restoreViewYear(){const active=Number(this.config.active_year);let selected=active;try{if(this.isAdmin)selected=Number(localStorage.getItem('inventory_view_year_'+this.me.id))||active}catch{}this.year=this.isAdmin&&[...new Set([active,...years])].includes(selected)?selected:active}
async boot(){
  if(this.api.configured&&this.api.session?.access_token){
   try{this.me=await this.api.me();this.config=await this.api.config();this.restoreViewYear();this.initialiseNavigation();await this.loadSection()}
   catch(e){
     if(e.status===401){this.api.session=null;this.api.store();this.me=null;this.login('Sesija ir beigusies. Pieslēdzieties vēlreiz.');}
     else this.startupProblem(e);
   }
  }else this.login();
 }
 login(message='',email=''){
  this.modal=null;this.stopScan();this.modalStack=[];
  root.innerHTML=`<div class="login-screen"><section class="login-form-area"><div class="login-form"><h1>Inventarizācija</h1>${message?`<div role="alert" class="notice error">${esc(message)}</div>`:''}${!this.api.configured?`<div class="notice error">Supabase konfigurācija nav pieejama.</div>`:''}<form id="login-form" class="layout-stack"><div class="form-field"><label for="login-email">E-pasts</label><input class="field" id="login-email" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(email)}" required></div><div class="form-field"><label for="login-pass">Parole</label><input class="field" id="login-pass" type="password" autocomplete="current-password" required></div><button class="btn primary block" type="submit" ${!this.api.configured?'disabled':''}>Pieslēgties</button></form></div></section></div>`;
  root.querySelector('#login-form')?.addEventListener('submit',e=>{e.preventDefault();this.loginNow()});
  root.querySelector('#login-email')?.focus();
 }
  async loginNow(){
    let email='';
    try{
      this.setBusy(true);
      email=root.querySelector('#login-email')?.value.trim();
      const pass=root.querySelector('#login-pass')?.value;
      this.me=await this.api.login(email,pass);
    }catch(e){this.login(e.message,email);this.busy=false;return;}
    try{
      this.config=await this.api.config();
      this.restoreViewYear();
      this.section='entry';
      this.initialiseNavigation();
      await this.loadSection();
    }catch(e){this.startupProblem(e);}
    finally{this.busy=false;}
  }
  startupProblem(error){
    this.modal=null;this.stopScan();this.modalStack=[];
    const setup=error?.code==='MIGRATIONS_REQUIRED';
    const title=setup?'Nepieciešams datubāzes atjauninājums':'Neizdevās atvērt inventarizāciju';
    const detail=setup
      ?'Pieslēgšanās izdevās, taču inventarizācijas gada statusa funkcija nav pieejama. Pārbaudiet, vai Supabase datubāzē ir izpildītas migrācijas 005 un 006. Ja ir, atjaunojiet API shēmas kešatmiņu. Līdz tam datu ievade ir apturēta.'
      :'Pieslēgšanās sesija ir saglabāta. Pārbaudiet savienojumu vai datubāzes iestatījumus un mēģiniet vēlreiz.';
    root.innerHTML=`<div class="login-screen"><section class="login-form-area startup-problem" role="alert"><h1>${esc(title)}</h1><p>${esc(detail)}</p>${!setup?`<p class="startup-detail">${esc(error?.message||'Nezināma kļūda')}</p>`:''}<div class="startup-actions"><button type="button" class="btn primary" id="retry-startup">Pārbaudīt vēlreiz</button><button type="button" class="btn secondary" id="leave-startup">Izrakstīties</button></div></section></div>`;
    root.querySelector('#retry-startup')?.addEventListener('click',()=>this.boot());
    root.querySelector('#leave-startup')?.addEventListener('click',async()=>{await this.api.logout();this.me=null;this.login();});
  }
 initialiseNavigation(){
  // Keep a history entry for every app section, not a full page navigation.
  const target=new URL(location.href);target.hash='section='+encodeURIComponent(this.section);
  history.replaceState({assetAuditSection:this.section},'',target);
  this.navHistoryReady=true;
 }
 async navigateSection(id,{fromHistory=false}={}){
  if(!nav.some(([name])=>name===id)||(id==='admin'||id==='stats')&&!this.isAdmin)return;
  if(this.section==='entry')this.readQuickDraft();
  this.section=id;this.search='';this.cash='';this.offset=0;this.expandedRow=-1;this.expandedDetails=[];this.inlineHistory={};
  if(!fromHistory&&this.navHistoryReady){const target=new URL(location.href);target.hash='section='+encodeURIComponent(id);history.pushState({assetAuditSection:id},'',target)}
  const seq=++this.navigationSequence;
  await this.loadSection();
  if(seq!==this.navigationSequence)return;
 }
 onBrowserBack(event){
  if(!this.me)return;
  const state=event.state;
  const fromHash=location.hash.startsWith('#section=')?decodeURIComponent(location.hash.slice(9)):null;
  const next=state?.assetAuditSection||fromHash;
  if(this.modal){this.modal=null;this.modalStack=[];this.stopScan();this.renderModal()}
  if(next&&next!==this.section)this.navigateSection(next,{fromHistory:true}).catch(e=>this.toast(e.message,'error'));
 }
 navButton(id,title,ico){return `<button class="nav-item ${this.section===id?'active':''}" data-action="nav" data-id="${id}" aria-current="${this.section===id?'page':'false'}"><span class="nav-icon">${icon(ico)}</span><span class="nav-label">${title}</span></button>`}
shell(){
  const selected=nav.filter(n=>this.isAdmin||!['stats','admin'].includes(n[0]));
  const title=nav.find(n=>n[0]===this.section)?.[1]||'Inventarizācija';
  root.innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><strong>Inventarizācija</strong></div><nav aria-label="Galvenā navigācija">${selected.map(n=>this.navButton(...n)).join('')}</nav><div class="sidebar-spacer"></div><div class="side-year">Inventarizācija: <strong>${esc(this.config.active_year)}${this.config.year_closed?' · noslēgta':''}</strong></div><div class="side-user"><div class="side-user-main"><strong>${esc(this.me?.display_name||'Lietotājs')}</strong><span>${this.isAdmin?'Administrators':'Lietotājs'}</span></div><button class="icon-btn side-logout" data-action="logout" title="Iziet" aria-label="Iziet">${icon('logout')}</button></div></aside><main class="main"><header class="topbar"><h1>${esc(title)}</h1><div class="top-actions"><span class="small-status">Pieslēgts</span>${this.section==='entry'?'':`<button class="btn secondary" data-action="refresh" title="Pārlādēt datus" aria-label="Pārlādēt datus">${icon('reload',17)}</button>`}</div></header><div id="workspace"></div></main><div class="mobile-nav" style="--nav-count:${selected.length}" aria-label="Mobilā navigācija">${selected.map(n=>this.navButton(...n)).join('')}</div></div><div id="overlay-host"></div><div class="toast-holder" id="toast-host"></div>`;
 }
 banners(){
  if(this.section==='entry'&&this.config.year_closed)return `<div class="notice warn-strong" role="alert">${icon('alert')}<div><strong>Datu ievade nav atļauta.</strong>${this.config.active_year}. gada inventarizācija ir noslēgta.</div></div>`;
  return '';
 }
 async loadSection(keepInput=false){
  try{
   if(this.section==='entry'){this.shell();this.displaySection();if(this.entrySearchEnabled&&this.entryCatalogueOpen&&this.entryHasSufficientQuery()&&this.current)await this.lookupEntry();return;}
   if(this.section==='inventory'){if(!this.isAdmin)this.year=Number(this.config.active_year);this.inventory=await this.api.inventoryList({year:Number(this.year),search:this.search,cash:this.cash,limit:this.invPageSize,offset:this.offset});}
   else if(this.section==='catalogue')this.catalogue=await this.api.catalogueSearch(this.search,this.offset,this.catPageSize);
   else if(this.section==='stats'&&this.isAdmin){
    this.stats=await this.api.adminStats(this.year,this.statsCash);
    const y=Number(this.year);this.daily=await this.api.adminDaily(y,`${y}-01-01`,`${y}-12-31`,this.statsCash);
   }
   else if(this.section==='admin'&&this.isAdmin)this.users=(await this.api.adminUsers()).users||[];
   this.shell();this.displaySection();
   if(keepInput){const f=root.querySelector('#search-input');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length)}}
  }catch(e){this.shell();this.displaySection();this.toast(e.message,'error')}
 }
  displaySection(){const host=root.querySelector('#workspace');if(!host)return;
  host.innerHTML=this.banners()+(this.section==='entry'?this.entryView():this.section==='inventory'?this.inventoryView():this.section==='catalogue'?this.catalogueView():this.section==='stats'?this.statsView():this.adminView());
 }
entryView(){
  const x=this.entryDraft,disabled=!this.current?'disabled':'';
  const searchInput=(id,label,value,placeholder,maxlength)=>`<div class="form-field search-entry-field"><label for="${id}">${esc(label)}</label><div class="clearable-input"><input class="field" id="${id}" value="${eattr(value)}" placeholder="${esc(placeholder)}" maxlength="${maxlength}" autocomplete="off" ${disabled}><button class="clear-entry-field" type="button" data-action="clear-entry-field" data-field="${id}" title="Notīrīt ${esc(label.toLowerCase())}" aria-label="Notīrīt ${esc(label.toLowerCase())}" ${disabled}>${icon('close',14)}</button></div></div>`;
  return `<div class="entry-workspace">
    <section class="entry-search-sticky card" aria-label="Preces meklēšana un ievade">
      <div class="entry-heading"><h2>Preces identificēšana</h2><div class="entry-heading-actions"><label class="search-switch" title="Ieslēgt vai izslēgt kataloga meklēšanu"><input type="checkbox" id="entry-search-toggle" ${this.entrySearchEnabled?'checked':''} ${disabled}><span>Meklēt katalogā</span></label></div></div>
      <div class="entry-search-fields">${searchInput('e-code','Preces kods',x.code,'Kods',50)}${searchInput('e-name','Nosaukums *',x.name,'Nosaukums',200)}<div class="form-field search-entry-field"><label for="e-barcode">Svītrkods</label><div class="clearable-input barcode-search"><input class="field" id="e-barcode" value="${eattr(x.barcode)}" maxlength="100" autocomplete="off" placeholder="Svītrkods" ${disabled}><button class="clear-entry-field" type="button" data-action="clear-entry-field" data-field="e-barcode" aria-label="Notīrīt svītrkodu" ${disabled}>${icon('close',14)}</button><button class="btn secondary scan-sticky" type="button" data-action="scan-entry" ${disabled}>${icon('scan',17)} Skenēt</button></div></div></div>
    </section>
    <section class="card entry-catalogue" id="entry-catalogue-panel" ${!this.entryCatalogueOpen||!this.entrySearchEnabled?'hidden':''} aria-label="Kataloga meklēšanas rezultāti"><header class="entry-catalogue-heading"><h2>Kataloga rezultāti</h2></header><div class="entry-results" id="entry-results" role="status" aria-live="polite">${this.renderEntryResults()}</div></section>
    <section class="card entry-form"><form id="quick-entry-form" autocomplete="off"><div class="entry-heading"><h2>Inventarizācijas ieraksts</h2></div><fieldset ${disabled} class="entry-fieldset"><div class="entry-fields">
      <div class="form-field entry-price"><label for="e-pz">Pavadzīmes cena, € *</label><div class="clearable-input"><input class="field" id="e-pz" inputmode="decimal" value="${eattr(inputMoney(x.invoice_price))}" required><button class="clear-entry-field" type="button" data-action="clear-entry-field" data-field="e-pz" aria-label="Notīrīt pavadzīmes cenu">${icon('close',14)}</button></div></div>
      <div class="form-field entry-price"><label for="e-pl">Plaukta cena, € *</label><div class="clearable-input"><input class="field" id="e-pl" inputmode="decimal" value="${eattr(inputMoney(x.shelf_price))}" required><button class="clear-entry-field" type="button" data-action="clear-entry-field" data-field="e-pl" aria-label="Notīrīt plaukta cenu">${icon('close',14)}</button></div></div>
      <div class="form-field"><label for="e-qty">Daudzums *</label><div class="qty-control"><button type="button" class="qty-btn" data-action="qty-minus" aria-label="Samazināt daudzumu">−</button><input class="field qty-input" id="e-qty" inputmode="decimal" value="${eattr(x.quantity)}" required><button type="button" class="qty-btn" data-action="qty-plus" aria-label="Palielināt daudzumu">+</button></div></div>
      <div class="form-field"><label for="e-unit">Mērvienība</label><select class="field" id="e-unit">${options(units,x.unit)}</select></div>
      <div class="form-field entry-floor"><label for="e-cash">Kase</label><select class="field" id="e-cash">${options(cashOptions.map(v=>({value:v,label:cashLabel(v)})),x.cash)}</select></div>
      <div class="form-field entry-comment"><label for="e-note">Komentārs</label><div class="clearable-input"><input class="field" id="e-note" value="${eattr(x.note)}" maxlength="255"><button class="clear-entry-field" type="button" data-action="clear-entry-field" data-field="e-note" aria-label="Notīrīt komentāru">${icon('close',14)}</button></div></div>
    </div><div class="entry-bottom"><div class="inline-msg" id="quick-entry-warning"></div><div class="entry-actions"><button class="btn secondary" type="button" data-action="clear-entry">Notīrīt</button><button class="btn primary" type="submit">Saglabāt</button></div></div></fieldset></form></section>
  </div>`;
 }
 entryHasSufficientQuery(){return ['code','name','barcode'].some(k=>String(this.entryDraft[k]||'').trim().length>=2)}
 renderEntryResults(){
  if(this.entrySearchState==='loading')return '<div class="lookup-empty lookup-loading" role="status">Meklējam katalogā…</div>';
  if(this.entrySearchState==='error')return '<div class="lookup-empty">Meklēšana neizdevās. Pārbaudi savienojumu un mēģini vēlreiz.</div>';
  if(this.entrySearchState==='empty')return '<div class="lookup-empty">Katalogā nekas nav atrasts. Nākamā rakstzīme pārslēgs uz manuālo ievadi, vai izslēdz meklēšanu pats.</div>';
  if(this.entrySearchState!=='results')return '<div class="lookup-empty">Ievadi vismaz divas rakstzīmes vienā meklēšanas laukā.</div>';
  return (this.entryResults||[]).map((r,i)=>`<button type="button" class="lookup-row compact-lookup" data-action="pick-entry-catalogue" data-i="${i}" title="${eattr(r.name)}"><span class="lookup-code mono">${esc(r.code||'—')}</span><span class="lookup-row-name">${esc(r.name)}</span><span class="lookup-row-meta mono"><span>${esc(r.source_year??'—')}</span><span>PZ ${money(r.invoice_price)}</span><span>PL ${r.shelf_price==null?'-':money(r.shelf_price)}</span>${r.unit?`<span>${esc(r.unit)}</span>`:''}</span></button>`).join('');
 }
 async lookupEntry(){
  const seq=++this.entrySeq;
  if(!this.entrySearchEnabled||!this.entryHasSufficientQuery()||this.section!=='entry'){this.entrySearchState='idle';this.entryCatalogueOpen=false;this.updateEntryResults();return}
  const params={code:this.entryDraft.code.trim(),name:this.entryDraft.name.trim(),barcode:this.entryDraft.barcode.trim()};
  this.entrySearchState='loading';this.entryCatalogueOpen=true;this.updateEntryResults();
  try{
   const results=await this.api.catalogueSearchFields(params);
   if(seq!==this.entrySeq||this.section!=='entry'||!this.entrySearchEnabled)return;
   if(['code','name','barcode'].some(k=>params[k]!==String(this.entryDraft[k]||'').trim()))return;
   this.entryResults=Array.isArray(results)?results:[];
   this.entrySearchState=this.entryResults.length?'results':'empty';this.entryNoMatchAwaitNext=!this.entryResults.length;this.updateEntryResults();
  }catch(e){if(seq===this.entrySeq){this.entrySearchState='error';this.entryNoMatchAwaitNext=false;this.updateEntryResults();this.toast(e.message||'Kataloga meklēšana neizdevās','error')}}
 }
 updateEntryResults(){const panel=root.querySelector('#entry-catalogue-panel');if(panel)panel.hidden=!this.entryCatalogueOpen||!this.entrySearchEnabled;const target=root.querySelector('#entry-results');if(target)target.innerHTML=this.renderEntryResults()}
 handleEntrySearchChange({clearing=false}={}){
  this.entrySeq++;this.entryQuery=[this.entryDraft.code,this.entryDraft.name,this.entryDraft.barcode].map(v=>v.trim()).filter(Boolean).join(' ');
  if(this.entryNoMatchAwaitNext&&!clearing){this.entrySearchEnabled=false;this.entryNoMatchAwaitNext=false;this.entryCatalogueOpen=false;this.entrySearchState='idle';const toggle=root.querySelector('#entry-search-toggle');if(toggle)toggle.checked=false;this.updateEntryResults();return}
  this.entryNoMatchAwaitNext=false;
  if(!this.entrySearchEnabled||!this.entryHasSufficientQuery()){this.entryCatalogueOpen=false;this.entrySearchState='idle';this.updateEntryResults();return}
  this.entrySearchState='loading';this.entryCatalogueOpen=true;this.updateEntryResults();this.debouncedSearch();
 }
 readQuickDraft(){
  const map={code:'e-code',barcode:'e-barcode',name:'e-name',invoice_price:'e-pz',shelf_price:'e-pl',cash:'e-cash',unit:'e-unit',quantity:'e-qty',note:'e-note'};
  for(const [k,id] of Object.entries(map)){const f=root.querySelector('#'+id);if(f)this.entryDraft[k]=f.value}
 }
 fillQuickDraft(values){
  this.entryDraft={...this.entryDraft,...values};
  const map={code:'e-code',barcode:'e-barcode',name:'e-name',invoice_price:'e-pz',shelf_price:'e-pl',cash:'e-cash',unit:'e-unit',quantity:'e-qty',note:'e-note'};
  for(const [k,id] of Object.entries(map)){const f=root.querySelector('#'+id);if(f)f.value=this.entryDraft[k]??''}
  this.entryRequestId=null;this.quickPriceWarning();
 }
 pickEntryProduct(item){
  this.readQuickDraft();
  const x=this.entryDraft;
  const sameIdentity=String(x.code||'').trim()===String(item.code||'').trim()&&String(x.name||'').trim()===String(item.name||'').trim()&&(!x.barcode||String(x.barcode).trim()===String(item.barcode||'').trim());
  const keepPrice=sameIdentity&&Boolean(x.invoice_price||x.shelf_price);
  this.fillQuickDraft({code:item.code??'',name:item.name??'',invoice_price:keepPrice&&x.invoice_price?x.invoice_price:inputMoney(item.invoice_price),shelf_price:keepPrice&&x.shelf_price?x.shelf_price:inputMoney(item.shelf_price),barcode:item.barcode||x.barcode||'',...(item.unit&&!this.entryUnitManual?{unit:item.unit}:{})});
  // Quantity is always user-owned and is never changed when choosing a catalogue item.
  this.entryCatalogueOpen=false;this.entrySearchState='idle';this.entryNoMatchAwaitNext=false;this.entrySeq++;this.updateEntryResults();root.querySelector('#e-qty')?.focus();
 }
 quickPriceWarning(){
  const f=root.querySelector('#quick-entry-warning');if(!f)return;
  const pz=this.entryDraft.invoice_price,pl=this.entryDraft.shelf_price;
  f.textContent=(['0','0.0','0.00','0,0','0,00'].includes(pz)||['0','0.0','0.00','0,0','0,00'].includes(pl))?'Uzmanību: cena ir 0,00 €.':'';
 }
inventoryView(){return `<div class="layout-stack"><div class="toolbar"><div class="search-field">${icon('search',18)}<input id="search-input" autocomplete="off" placeholder="Kods un/vai nosaukums" value="${eattr(this.search)}" aria-label="Meklēt ievadītās preces"></div><select class="field" id="cash-select" aria-label="Kase">${options(cashFilter,this.cash)}</select><label class="page-size">Rindas lapā <select class="field" id="inventory-page-size">${options([25,50,100],this.invPageSize)}</select></label></div>${this.inventoryTable()}</div>`}
 detailsMarkup(){const arr=this.expandedDetails||[];
  if(!arr.length)return '<div class="inline-empty">Nav atsevišķu ierakstu.</div>';
  return `<div class="expanded-wrap"><div class="expanded-title">Atsevišķās ievades (${arr.length})</div><div class="detail-grid">${arr.map((d,i)=>`<div class="detail-record"><div class="detail-inline"><strong class="mono">${formatQty(d.quantity)} ${esc(d.unit)}</strong><span class="mono">PZ: ${money(d.invoice_total)}</span><span>${esc(d.author_name||'Nav norādīts')}</span><span class="mono">${dateLV(d.recorded_at)}</span>${d.note?`<span title="${eattr(d.note)}" class="detail-note">${esc(d.note)}</span>`:''}<div class="detail-actions">${this.current?`<button class="btn small secondary" data-action="edit-inline-entry" data-i="${i}">${icon('edit',14)} Labot</button><button class="btn small danger" data-action="void-inline-entry" data-i="${i}" title="Anulēt">${icon('trash',14)} Anulēt</button>`:''}${this.isAdmin?`<button class="btn small secondary" data-action="history-inline-entry" data-i="${i}">${icon('clock',14)} Vēsture</button>`:''}</div></div>${this.inlineHistory[d.entry_id]?`<div class="detail-history">${this.historyMarkup(this.inlineHistory[d.entry_id])}</div>`:''}</div>`).join('')}</div></div>`;
 }
 historyMarkup(items){return (items||[]).map(r=>`<div class="history-record"><strong>${esc(actionLV[r.action]||r.action||'Izmaiņa')} · ${dateLV(r.recorded_at)}</strong><div>${esc(r.author_name||'Nav norādīts')}${r.source_name?' · '+esc(r.source_name):''}</div><div>Daudzums: ${formatQty(r.quantity)} ${esc(r.unit||'')} · PZ: ${money(r.invoice_price)} · PL: ${money(r.shelf_price)}${r.cash?' · Kase: '+esc(r.cash):''}${r.note?' · Komentārs: '+esc(r.note):''}</div>${r.code||r.name?`<div>${esc(r.code||'')} ${esc(r.name||'')}</div>`:''}</div>`).join('')||'<p>Vēsture nav pieejama.</p>'}
 inventoryTable(){const arr=Array.isArray(this.inventory)?this.inventory:[];
  const rows=arr.map((r,i)=>`<tr class="group-row ${this.expandedRow===i?'expanded':''}" data-action="details" data-i="${i}" role="button" tabindex="0" aria-expanded="${this.expandedRow===i}"><td class="expand-cell"><span class="expand-icon">${icon('chevron',15)}</span></td><td class="code mono">${esc(r.code||'—')}</td><td class="name-cell" title="${eattr(r.name)}">${esc(r.name)}</td><td class="right mono strong">${formatQty(r.quantity)}</td><td>${esc(r.unit||'')}</td><td class="right mono">${money(r.invoice_price)}</td><td class="right mono">${money(r.shelf_price)}</td><td class="right mono">${money(r.invoice_total)}</td><td class="right mono">${money(r.shelf_total)}</td><td class="cash-cell">${esc(cashLabel(r.cash))}</td></tr>${this.expandedRow===i?`<tr class="details-row"><td colspan="10">${this.detailsMarkup()}</td></tr>`:''}`).join('');
  return `<section class="card"><div class="panel-title"><h2>Ievadītās preces</h2><span class="tag">${this.year}. gads</span></div>${arr.length?`<div class="table-wrap"><table class="data-table inventory-table"><colgroup><col style="width:30px"><col style="width:126px"><col><col style="width:88px"><col style="width:72px"><col style="width:96px"><col style="width:96px"><col style="width:108px"><col style="width:108px"><col style="width:112px"></colgroup><thead><tr><th aria-label="Izvērst"></th><th>ID / kods</th><th>Nosaukums</th><th class="right">Daudzums</th><th>Vien.</th><th class="right">PZ cena</th><th class="right">PL cena</th><th class="right">PZ summa</th><th class="right">PL summa</th><th>Kase</th></tr></thead><tbody>${rows}</tbody></table></div><div class="mobile-rows"><div class="mobile-list">${arr.map((r,i)=>`<div><button class="mobile-card compact-mobile-row" data-action="details" data-i="${i}" aria-expanded="${this.expandedRow===i}"><span class="compact-code mono">${esc(r.code||'—')}</span><span class="compact-name" title="${eattr(r.name)}">${esc(r.name)}</span><span class="compact-qty mono">${formatQty(r.quantity)} ${esc(r.unit||'')}</span><span class="compact-money mono">${money(r.invoice_price)} / ${money(r.shelf_price)}</span><span class="compact-chevron">${icon('chevron',13)}</span></button>${this.expandedRow===i?this.detailsMarkup():''}</div>`).join('')}</div></div>`:`<div class="empty-state"><strong>Šajā atlasē nav ierakstu.</strong></div>`}<div class="table-footer"><span>${arr.length?this.offset+1:0}–${this.offset+arr.length} (rādītas ${arr.length})</span><div class="field-row"><button class="btn secondary small" data-action="page-prev" ${this.offset===0?'disabled':''}>Iepriekšējā</button><button class="btn secondary small" data-action="page-next" ${arr.length<this.invPageSize?'disabled':''}>Nākamā ${icon('chevron',15)}</button></div></div></section>`;
 }
 catalogueView(){const arr=Array.isArray(this.catalogue)?this.catalogue:[];return `<div class="layout-stack"><div class="toolbar"><div class="search-field">${icon('search',18)}<input id="search-input" autocomplete="off" value="${eattr(this.search)}" placeholder="Kods un/vai nosaukums, svītrkods" aria-label="Meklēt preču katalogā"></div><label class="page-size">Rindas lapā <select class="field" id="catalogue-page-size">${options([25,50,100],this.catPageSize)}</select></label>${this.isAdmin?`<button class="btn secondary" data-action="xlsx-import">${icon('upload',17)} Pievienot kataloga preces no faila</button><button class="btn primary" data-action="new-cat">${icon('plus')} Jauna prece</button>`:''}</div><div class="card"><div class="panel-title"><h2>Preču katalogs</h2></div>${arr.length?`<div class="table-wrap"><table class="data-table catalogue-table"><colgroup><col style="width:128px"><col><col style="width:95px"><col style="width:95px"><col style="width:178px"><col style="width:115px"><col style="width:69px"><col style="width:80px"></colgroup><thead><tr><th>Kods</th><th>Nosaukums</th><th class="right">PZ cena</th><th class="right">PL cena</th><th>Svītrkods</th><th>Mērvienība</th><th>Gads</th><th></th></tr></thead><tbody>${arr.map((r,i)=>`<tr><td class="code mono">${esc(r.code||'—')}</td><td class="name-cell">${esc(r.name)}</td><td class="right mono">${money(r.invoice_price)}</td><td class="right mono">${r.shelf_price==null?'-':money(r.shelf_price)}</td><td class="mono">${esc(r.barcode||'—')}</td><td>${esc(r.unit||'—')}</td><td>${esc(r.source_year||'—')}</td><td><button class="row-action" data-action="${this.isAdmin?'edit-cat':'see-cat'}" data-i="${i}">${this.isAdmin?'Labot':'Skatīt'}</button></td></tr>`).join('')}</tbody></table></div><div class="mobile-rows"><div class="mobile-list">${arr.map((r,i)=>`<button class="mobile-card compact-mobile-row catalogue-mobile-row" data-action="${this.isAdmin?'edit-cat':'see-cat'}" data-i="${i}"><span class="compact-code mono">${esc(r.code||'—')}</span><span class="compact-name" title="${eattr(r.name)}">${esc(r.name)}</span><span class="compact-money mono">${money(r.invoice_price)} / ${r.shelf_price==null?'-':money(r.shelf_price)}</span><span class="compact-year mono">${esc(r.source_year??'—')}</span><span class="compact-chevron">${icon('chevron',13)}</span></button>`).join('')}</div></div>`:`<div class="empty-state"><strong>Nav atrastu preču</strong><span>Mēģiniet citu nosaukumu vai kodu.</span></div>`}<div class="table-footer"><span>${arr.length?this.offset+1:0}–${this.offset+arr.length} (rādītas ${arr.length})</span><div class="field-row"><button class="btn secondary small" data-action="page-prev" ${this.offset===0?'disabled':''}>Iepriekšējā</button><button class="btn secondary small" data-action="page-next" ${arr.length<this.catPageSize?'disabled':''}>Nākamā ${icon('chevron',15)}</button></div></div></div></div>`;}
 dailyLineMarkup(rows){
  if(!rows.length)return '<p class="lookup-empty">Šim gadam nav datu.</p>';
  const max=Math.max(1,...rows.map(r=>Number(r.entry_count)||0)),width=Math.max(760,rows.length*16),height=220,left=40,right=18,top=15,bottom=36;
  const tickStep=Math.max(1,Math.ceil(max/4)),axisMax=Math.ceil(max/tickStep)*tickStep;
  const x=i=>left+i*(width-left-right)/Math.max(1,rows.length-1),y=n=>top+(height-top-bottom)*(1-Number(n)/axisMax);
  const pts=rows.map((r,i)=>`${x(i).toFixed(1)},${y(r.entry_count||0).toFixed(1)}`).join(' ');
  const step=Math.max(1,Math.ceil(rows.length/8));
  const ticks=Array.from({length:axisMax/tickStep+1},(_,i)=>i*tickStep).map(n=>{const yy=y(n);return `<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" stroke="#e1e8ec"/><text x="${left-9}" y="${yy+4}" text-anchor="end" font-size="11" fill="#65727b">${n}</text>`}).join('');
  const dates=rows.map((r,i)=>(i%step===0||i===rows.length-1)?`<text x="${x(i)}" y="${height-12}" text-anchor="middle" font-size="11" fill="#65727b">${esc(String(r.day).slice(5))}</text>`:'').join('');
  const points=rows.map((r,i)=>`<circle cx="${x(i)}" cy="${y(r.entry_count||0)}" r="3.3" fill="#406f8a"><title>${esc(r.day)}: ${esc(r.entry_count)} ieraksti</title></circle>`).join('');
  return `<div class="daily-line-scroll"><svg class="daily-line" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Līnijas diagramma — dienā ievadīto ierakstu skaits">${ticks}<polyline fill="none" stroke="#406f8a" stroke-width="2.4" stroke-linejoin="round" points="${pts}"/>${points}${dates}</svg></div>`;
 }
 statsView(){if(!this.isAdmin)return `<div class="notice error">Tikai administratoram.</div>`;const s=this.stats||{},allDays=this.daily||[];const first=allDays.findIndex(d=>Number(d.entry_count)>0),last=allDays.findLastIndex(d=>Number(d.entry_count)>0),daily=first<0?[]:allDays.slice(first,last+1);
  return `<div class="layout-stack"><div class="toolbar"><label class="page-size">Kase <select class="field" id="stats-cash">${options(cashFilter,this.statsCash)}</select></label><span class="tag">${this.year}. gads</span></div><div class="kpi-row stats-kpi-row" aria-label="Inventarizācijas rādītāji"><section class="card kpi stats-kpi-count"><div class="meta">Ievades ieraksti</div><div class="value mono">${esc(s.entry_count??'—')}</div></section><section class="card kpi stats-kpi-count"><div class="meta">Unikālās pozīcijas</div><div class="value mono">${esc(s.group_count??'—')}</div></section><section class="card kpi stats-kpi-money"><div class="meta">Pavadzīmju summa</div><div class="value mono">${money(s.invoice_total)}</div></section><section class="card kpi stats-kpi-money"><div class="meta">Plauktu summa</div><div class="value mono">${money(s.shelf_total)}</div></section><section class="card kpi stats-kpi-money"><div class="meta">Starpība (PL − PZ)</div><div class="value mono">${money(s.difference)}</div></section></div><p class="stats-kpi-note">Summas aprēķinātas no saglabātajiem ierakstiem. Dažādu mērvienību daudzumi netiek summēti savā starpā.</p><section class="card panel"><div class="panel-title"><h2>Dienā pievienoto ierakstu skaits</h2></div><div class="chart-period">${daily.length?`${esc(daily[0].day)} – ${esc(daily[daily.length-1].day)}`:`${esc(this.year)}. gadā nav ievadītu ierakstu`}</div><p class="tip">Katras dienas ievades ierakstu skaits (nevis summētais daudzums). Datumi pēc Latvijas laika.</p>${this.dailyLineMarkup(daily)}</section></div>`;
 }
 filteredUsers(){
  const term=this.userSearch.trim().toLocaleLowerCase('lv-LV');
  return this.users.map((user,index)=>({user,index})).filter(({user})=>{
   if(this.userStatusFilter==='active'&&!user.active)return false;
   if(this.userStatusFilter==='inactive'&&user.active)return false;
   const haystack=`${user.display_name||''} ${user.email_address||''}`.toLocaleLowerCase('lv-LV');
   return !term||haystack.includes(term);
  });
 }
 userTableRows(){
  const users=this.filteredUsers();
  if(!users.length)return '<tr><td colspan="5" class="empty-users">Nav lietotāju, kas atbilst izvēlētajiem filtriem.</td></tr>';
  return users.map(({user:u,index:i})=>`<tr><td><strong>${esc(u.display_name||'—')}</strong>${u.id===this.me?.id?' <span class="user-self">Tavs konts</span>':''}</td><td>${esc(u.email_address||'—')}</td><td>${u.role==='admin'?'Administrators':'Lietotājs'}</td><td><span class="user-status ${u.active?'is-active':'is-inactive'}">${u.active?'Aktīvs':'Deaktivizēts'}</span></td><td class="user-actions"><button type="button" class="btn small secondary" data-action="edit-user" data-i="${i}">Labot</button>${u.id!==this.me?.id?`<button type="button" class="btn small ${u.active?'danger':'secondary'}" data-action="toggle-user" data-i="${i}">${u.active?'Deaktivizēt':'Aktivizēt'}</button>`:''}</td></tr>`).join('');
 }
  userMobileCards(){
  const users=this.filteredUsers();
  if(!users.length)return '<div class="empty-users" role="status">Nav lietotāju, kas atbilst izvēlētajiem filtriem.</div>';
  return `<div class="users-mobile-list">${users.map(({user:u,index:i})=>`<article class="user-mobile-card" aria-label="Lietotājs ${eattr(u.display_name||u.email_address||'bez vārda')}"><div class="user-mobile-top"><div class="user-mobile-identity"><strong>${esc(u.display_name||'—')}</strong>${u.id===this.me?.id?' <span class="user-self">Tavs konts</span>':''}<div class="user-mobile-email">${esc(u.email_address||'—')}</div></div><span class="user-status ${u.active?'is-active':'is-inactive'}">${u.active?'Aktīvs':'Deaktivizēts'}</span></div><div class="user-mobile-bottom"><span class="user-mobile-role">${u.role==='admin'?'Administrators':'Lietotājs'}</span><div class="user-actions"><button type="button" class="btn small secondary" data-action="edit-user" data-i="${i}">Labot</button>${u.id!==this.me?.id?`<button type="button" class="btn small ${u.active?'danger':'secondary'}" data-action="toggle-user" data-i="${i}">${u.active?'Deaktivizēt':'Aktivizēt'}</button>`:''}</div></div></article>`).join('')}</div>`;
 }
 refreshUserRows(){
  const body=root.querySelector('#users-table-body');if(body)body.innerHTML=this.userTableRows();
  const mobile=root.querySelector('#users-mobile-list');if(mobile)mobile.innerHTML=this.userMobileCards();
  const count=root.querySelector('#users-count');if(count)count.textContent=`Rādīti ${this.filteredUsers().length} no ${this.users.length} lietotājiem`;
 }
 adminView(){
  if(!this.isAdmin)return '<div class="notice error">Tikai administratoram.</div>';
  return `<div class="layout-stack"><div class="settings-grid"><section class="card panel"><div class="panel-title"><h2>Inventarizācijas gads</h2></div><div class="key-value"><span>Aktīvais gads</span><strong>${this.config.active_year}</strong></div><div class="key-value"><span>Statuss</span><strong>${this.config.year_closed?'Noslēgts':'Atvērts'}</strong></div><div class="form-field admin-view-year"><label for="view-year-select">Skata gads (tikai administratoram)</label><select class="field" id="view-year-select">${options([...new Set([this.config.active_year,...years])],this.year)}</select><small class="tip">Attiecas tikai uz Preču sarakstu un Statistiku. Datu ievade un Katalogs vienmēr strādā aktīvajā gadā.</small></div><div class="admin-buttons">${!this.config.year_closed?`<button class="btn danger" data-action="close-year">Noslēgt šī gada inventarizāciju</button>`:''}<button class="btn secondary" data-action="new-year-wizard">Konfigurēt jaunu inventarizāciju</button></div></section><section class="card panel"><div class="panel-title"><h2>Lietotāja konts</h2></div><p class="tip">Paroles var iestatīt tikai administrators. Iepriekšējās paroles netiek glabātas lietotnes datubāzē.</p><p class="tip">Konta datus un paroli var mainīt tikai administrators.</p></section></div><section class="card panel"><div class="panel-title"><h2>Lietotāju administrēšana</h2><button class="btn primary" data-action="new-user">${icon('plus')} Pievienot lietotāju</button></div><div class="user-toolbar"><div class="form-field"><label for="user-status-filter">Kontu statuss</label><select class="field" id="user-status-filter">${options([{value:'all',label:'Visi'},{value:'active',label:'Aktīvie'},{value:'inactive',label:'Deaktivizētie'}],this.userStatusFilter)}</select></div><div class="form-field"><label for="user-search">Meklēt lietotāju</label><input class="field" id="user-search" type="search" autocomplete="off" placeholder="Vārds vai e-pasts" value="${eattr(this.userSearch)}"></div><div class="users-count" id="users-count">Rādīti ${this.filteredUsers().length} no ${this.users.length} lietotājiem</div></div><div class="table-wrap users-desktop-table"><table class="data-table"><thead><tr><th>Lietotājs</th><th>E-pasts</th><th>Loma</th><th>Statuss</th><th>Darbības</th></tr></thead><tbody id="users-table-body">${this.userTableRows()}</tbody></table></div><div class="mobile-rows users-mobile" id="users-mobile-list">${this.userMobileCards()}</div><p class="tip">Deaktivizēšana bloķē piekļuvi aplikācijas datiem, bet saglabā visas lietotāja darbības un inventarizācijas vēsturi. Kontu vēlāk var aktivizēt. Izmaiņas tiek auditētas.</p></section><section class="card panel"><div class="panel-title"><h2>Datu drošība</h2></div><p class="tip">Ierakstu izmaiņas tiek reģistrētas kā atsevišķi notikumi. Automātisku rezerves kopiju un visu grāmatvedības noteikumu apstiprinājuma vēl nav — šī ir testa vide.</p></section><footer class="app-version" aria-label="Aplikācijas versija">Versija <span class="mono">v${esc(APP_VERSION)}</span> · Testa vide</footer></div>`;
 }

  renderModal(){const h=root.querySelector('#overlay-host');if(!h)return;if(!this.modal){h.innerHTML='';return}const m=this.modal;
 let body='',title='',sub='';
 if(m.type==='entry'){
  const x=m.data||{};const edit=!!m.edit;title=edit?'Labot inventarizācijas ierakstu':'Jauna preces ievade';sub=edit?`Iepriekšējā versija #${x.revision||1} tiks saglabāta vēsturē.`:`${this.year}. gada inventarizācija`;
  body=`<div class="form-grid">${fields('f-code','Preces kods (var būt tukšs)',x.code||'')}${fields('f-barcode','Svītrkods (ja pieejams)',x.barcode||'')}<div class="form-field full"><label for="f-name">Nosaukums *</label><input class="field" id="f-name" value="${eattr(x.name||'')}" autocomplete="off" maxlength="200" placeholder="Ievadiet vai meklējiet preci"><div id="suggestions" class="suggestions hidden"></div></div>${fields('f-qty','Daudzums *',x.quantity??'1.00','text','inputmode="decimal"')}${fieldSelect('f-unit','Mērvienība',units,x.unit||'gabali')}${fields('f-pz','Pavadzīmes cena, € *',inputMoney(x.invoice_price),'text','inputmode="decimal"')}${fields('f-pl','Plaukta cena, € *',inputMoney(x.shelf_price),'text','inputmode="decimal"')}${fieldSelect('f-cash','Kase',cashOptions,x.cash||cashOptions[0])}<div class="form-field"><label>Svītrkoda nolasīšana</label><button class="btn secondary" type="button" data-action="scan">${icon('scan')} Atvērt kameru</button></div><div class="form-field full"><label for="f-note">Komentārs</label><textarea class="field" id="f-note" maxlength="255">${esc(x.note||'')}</textarea></div></div><div id="entry-warning" class="inline-msg"></div><div class="modal-actions"><button class="btn secondary" data-action="close">Atcelt</button><button class="btn primary" data-action="save-entry" ${this.busy?'disabled':''}>${icon('check')} ${edit?'Saglabāt labojumu':'Saglabāt ierakstu'}</button></div>`;
 } else if(m.type==='details'){
  title=m.group.name;sub=`${m.group.code||'Bez koda'} · ${m.group.cash} · ${this.year}. gads`;
  body=`<div class="key-value"><span class="k">Pavadzīmes cena</span><span class="v">${money(m.group.invoice_price)}</span></div><div class="key-value"><span class="k">Plaukta cena</span><span class="v">${money(m.group.shelf_price)}</span></div><div class="key-value"><span class="k">Kopējais daudzums</span><span class="v">${formatQty(m.group.quantity)} ${esc(m.group.unit||'')}</span></div><h3 style="margin:20px 0 10px">Atsevišķie ievades ieraksti (${m.items.length})</h3><div class="mini-list">${m.items.map((r,i)=>`<div class="mini-line"><div><div class="title">${formatQty(r.quantity)} ${esc(r.unit)} · ${money(r.invoice_total)}</div><small>${r.legacy_id?'ID '+esc(r.legacy_id):'Versija '+esc(r.revision)} ${r.note?' · '+esc(r.note):''}</small></div>${true?`<div class="field-row">${this.current?`<button class="btn small secondary" data-action="edit-entry" data-i="${i}">${icon('edit',15)} Labot</button><button class="btn small danger" data-action="void-entry" data-i="${i}" title="Anulēt">${icon('trash',15)}</button>`:''}${this.isAdmin?`<button class="btn small secondary" data-action="history-entry" data-i="${i}" title="Vēsture">${icon('clock',15)}</button>`:''}</div>`:''}</div>`).join('')}</div>${this.isAdmin?`<div class="modal-actions"><button class="btn secondary" data-action="close">Aizvērt</button></div>`:''}`;
 } else if(m.type==='catalogue'){
  const x=m.data||{};title=m.edit?'Labot kataloga preci':m.readonly?'Kataloga ieraksts':'Jauna kataloga prece';sub=m.edit?'Labojumi saglabā vēsturisko versiju.':'Preces cenas tiek uzskaitītas atsevišķi.';
  const disabled=m.readonly?'disabled':'';
  body=`<div class="form-grid">${fields('c-code','Preces kods (neobligāts)',x.code||'','text',disabled)}${fields('c-barcode','Svītrkods',x.barcode||'','text',disabled)}<div class="form-field full"><label for="c-name">Preces nosaukums *</label><input class="field" id="c-name" value="${eattr(x.name||'')}" ${disabled}></div>${fields('c-pz','Pavadzīmes cena, € *',inputMoney(x.invoice_price),'text',`${disabled} inputmode="decimal"`)}${fields('c-pl','Plaukta cena, € (ja zināma)',inputMoney(x.shelf_price),'text',`${disabled} inputmode="decimal"`)}<div class="form-field"><label for="c-unit">Mērvienība</label><select class="field" id="c-unit" ${disabled}>${options([{value:'',label:'Nav norādīta'},...units.map(u=>({value:u,label:u}))],x.unit||'')}</select></div></div>${m.readonly?`<div class="modal-actions"><button class="btn secondary" data-action="close">Aizvērt</button></div>`:`<div class="modal-actions">${m.edit?`<button class="btn secondary" data-action="history-cat">${icon('clock',15)} Vēsture</button><button class="btn danger" data-action="hide-cat">${icon('trash',15)} Izņemt no kataloga</button>`:''}<button class="btn secondary" data-action="close">Atcelt</button><button class="btn primary" data-action="save-cat">${icon('check')} Saglabāt</button></div>`}`;
}else if(m.type==='history'){
   title=m.heading||'Izmaiņu vēsture';sub='Izmaiņu secība, jaunākā augšā.';
   body=`<div class="detail-history">${this.historyMarkup(m.items)}</div><div class="modal-actions"><button class="btn secondary" data-action="close">${this.modalStack.length?'Atpakaļ':'Aizvērt'}</button></div>`;
 }else if(m.type==='barcode-options'){
   title='Precizēt svītrkodu';sub='Šim svītrkodam ir vairākas cenu versijas. Izvēlies pareizo — nevienu neizvēlamies automātiski.';
   body=`<div class="entry-results">${(m.items||[]).map((r,i)=>`<button type="button" class="lookup-row" data-action="pick-scan-variant" data-i="${i}"><strong>${esc(r.name)}</strong><span>${esc(r.code||'Bez koda')} · ${money(r.invoice_price)} / ${money(r.shelf_price)}</span></button>`).join('')}</div><div class="modal-actions"><button class="btn secondary" data-action="close">Aizvērt</button></div>`;
 }else if(m.type==='scan'){
   title='Nolasīt svītrkodu';sub='Novietojiet preces svītrkodu kameras rāmī.';
   body=`<div class="barcode-view" id="barcode-view"><span>Sagatavojam kameru...</span><video id="scan-video" autoplay muted playsinline></video><div class="barcode-target"></div></div><div class="scan-manual"><label for="scan-manual">Svītrkods</label><div class="inline-lookup"><input class="field" id="scan-manual" autocomplete="off"><button class="btn secondary" type="button" data-action="scan-manual-search">Meklēt</button></div></div><div class="modal-actions"><button class="btn secondary" data-action="scan-stop">Atcelt</button></div>`;
 }else if(m.type==='confirm'){
   title='Apstiprināt darbību';sub='Darbība tiks reģistrēta audita vēsturē.';
   body=`<p class="confirm-text">${esc(m.message||'Vai apstiprināt?')}</p><div class="modal-actions"><button class="btn secondary" data-action="close">Atcelt</button><button class="btn danger" data-action="confirmed">Apstiprināt</button></div>`;
}else if(m.type==='user'){
   const x=m.data||{};title=m.edit?'Labot lietotāju':'Izveidot lietotāju';sub='Kontu var mainīt tikai administrators.';
   body=`<div class="form-grid"><div class="form-field full"><label for="u-email">E-pasts *</label><input class="field" id="u-email" type="email" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="254" value="${eattr(x.email_address||'')}" ${m.edit?'disabled':'required'}></div>${fields('u-name','Vārds',x.display_name||'')}${fieldSelect('u-role','Loma',[{value:'staff',label:'Lietotājs'},{value:'admin',label:'Administrators'}],x.role||'staff')}<div class="form-field full"><label for="u-password">${m.edit?'Iestatīt jaunu paroli (neobligāti)':'Sākotnējā parole *'}</label><input class="field" id="u-password" type="text" autocomplete="off" spellcheck="false" minlength="8" maxlength="128" ${m.edit?'':'required'}><small class="muted">Parole redzama tikai ievadīšanas laikā. Pēc saglabāšanas administrators to vairs nevar apskatīt. Vismaz 8 rakstzīmes; Supabase drošības iestatījumi var prasīt vairāk.</small></div>${m.edit?`<div class="form-field full"><label class="switches"><input type="checkbox" id="u-active" ${x.active?'checked':''}> Lietotājs ir aktīvs</label></div>`:''}</div><div class="modal-actions"><button class="btn secondary" type="button" data-action="close">Atcelt</button><button class="btn primary" type="submit">Saglabāt</button></div>`;
 }else if(m.type==='self-password'){
  title='Mainīt savu paroli';sub='Tikai administrators var iestatīt jaunu paroli.';
  body=`<div class="form-field"><label for="self-new-password">Jaunā parole</label><input class="field" id="self-new-password" type="text" autocomplete="off" minlength="8" maxlength="128" spellcheck="false" required></div><div class="modal-actions"><button class="btn secondary" data-action="close">Atcelt</button><button class="btn primary" data-action="save-self-password">Iestatīt paroli</button></div>`;
 }else if(m.type==='xlsx'||m.type==='year-wizard'){
  const isYear=m.type==='year-wizard';title=isYear?'Jauna inventarizācijas gada konfigurēšana':'Pavadzīmju preču XLSX imports';
  sub=isYear?`Sagatavot ${Number(this.config.active_year)+1}. gada katalogu no iepriekšējā gada aktivitātes un XLSX faila.`:'Pievienot jaunas kataloga preces, saglabājot esošās cenu versijas.';
  body=`<div class="layout-stack"><p>Fails satur <strong>vienu darblapu un tikai četras kolonnas</strong> ar precīzām galvenēm. Nekādu papildu rindu, kolonnu, formulu vai makro.</p><div class="table-wrap always-visible"><table class="data-table sample-table"><thead><tr><th>KODS</th><th>NOSAUKUMS</th><th>PZ_CENA</th><th>SVITRU_KODS</th></tr></thead><tbody><tr><td>1-45</td><td>Sēklas</td><td>2.35</td><td>4770012345679</td></tr><tr><td>2-08</td><td>Augu pods</td><td>4.20</td><td>4770012345686</td></tr></tbody></table></div><p class="tip">Parauga rindas pirms faktiskās ielādes izdzēs. Svītrkoda kolonnu Excel formātā uzturi kā tekstu, lai nepazaudētu nulles.</p><a class="btn secondary template-link" href="./assets/Kataloga_importa_paraugs.xlsx" download>Lejupielādēt XLSX paraugu</a><div class="form-field"><label for="xlsx-file">Izvēlieties XLSX failu (līdz 1000 preču rindām)</label><input class="field" id="xlsx-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></div><div class="notice info">Pilnīgi sakrītošas pozīcijas izlaižam. Ja pie tā paša koda/nosaukuma atšķiras pavadzīmes cena, importu apturam pārskatīšanai. Esošās plauktu cenas netiek pārrakstītas.</div>${this.xlsxPreview?`<div class="import-result"><strong>${esc(this.xlsxFileName)}</strong><div>Jaunas: <strong>${this.xlsxPreview.import?.added??this.xlsxPreview.added??0}</strong> · Esošas: <strong>${this.xlsxPreview.import?.skipped??this.xlsxPreview.skipped??0}</strong> · Konflikti: <strong>${this.xlsxPreview.import?.conflict_count??this.xlsxPreview.conflict_count??0}</strong></div>${this.xlsxPreview.carried!==undefined?`<div>No iepriekšējā gada pārnesamas: <strong>${this.xlsxPreview.carried}</strong></div>`:''}${(this.xlsxPreview.import?.conflicts||this.xlsxPreview.conflicts||[]).map(r=>`<div class="import-conflict">${esc(r.row)}. rinda: ${esc(r.code)} · ${esc(r.name)} · ${money(r.invoice_price)} — jāpārskata ar grāmatvedi</div>`).join('')}</div>`:''}${isYear?`<div class="notice warn-strong">${this.config.year_closed?'Pašreizējais gads ir noslēgts.':'Pirms jaunā gada atvēršanas jānoslēdz pašreizējā gada inventarizācija. Pārbaudi var veikt jau tagad.'}</div>`:''}<div class="modal-actions"><button class="btn secondary" data-action="close">Atcelt</button><button class="btn secondary" data-action="xlsx-preview">Pārbaudīt failu</button><button class="btn primary" data-action="xlsx-commit" ${!this.xlsxPreview||(this.xlsxPreview.import?.conflict_count??this.xlsxPreview.conflict_count??0)>0||(isYear&&!this.config.year_closed)?'disabled':''}>${isYear?'Atvērt nākamo gadu':'Importēt preces'}</button></div></div>`;
 }
  h.innerHTML=`<div class="modal-backdrop"><section class="modal ${['details','xlsx','year-wizard'].includes(m.type)?'wide':''}" role="dialog" aria-modal="true" aria-label="${eattr(title)}"><header class="modal-header"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div><button class="icon-btn" data-action="close" aria-label="Aizvērt">${icon('close')}</button></header>${m.type==='user'?`<form id="user-form" autocomplete="off">${body}</form>`:body}</section></div>`;
 if(m.type==='scan')this.startScan();
 if(m.type==='entry'&&!m.edit)root.querySelector('#f-name')?.focus();
 }
 showModal(m){this.modal=m;this.renderModal()}
 closeModal(){this.stopScan();this.modal=this.modalStack.pop()||null;this.renderModal()}
 toast(text,type=''){const host=root.querySelector('#toast-host')||document.body;const b=document.createElement('div');b.className='toast '+type;b.textContent=text;host.appendChild(b);setTimeout(()=>b.remove(),4900)}
 setBusy(b){this.busy=b;root.querySelectorAll('[data-action="save-entry"],[data-action="save-cat"],#user-form button[type=submit],#quick-entry-form button[type=submit]').forEach(x=>x.disabled=b)}
 async click(e){const btn=e.target.closest('[data-action]');if(!btn)return;const action=btn.dataset.action;try{
   if(action==='nav'){if(this.busy)return;await this.navigateSection(btn.dataset.id)}
   else if(action==='logout'){await this.api.logout();this.me=null;this.login()}
   else if(action==='refresh'){await this.loadSection();this.toast('Dati atjaunoti')}
   else if(action==='new-entry'){await this.navigateSection('entry')}
   else if(action==='details'){const i=Number(btn.dataset.i);if(this.expandedRow===i){this.expandedRow=-1;this.expandedDetails=[];}else{const g=this.inventory[i];if(!g)return;this.expandedDetails=await this.api.inventoryDetails(g,this.year);this.expandedRow=i;this.inlineHistory={};}this.displaySection()}
   else if(action==='new-cat'){if(!this.isAdmin)return;this.showModal({type:'catalogue',edit:false,data:{shelf_price:null}})}
   else if(action==='edit-cat'||action==='see-cat'){const d=this.catalogue[Number(btn.dataset.i)];if(d)this.showModal({type:'catalogue',edit:action==='edit-cat',readonly:action==='see-cat',data:d})}
   else if(action==='page-next'||action==='page-prev'){const size=this.section==='inventory'?this.invPageSize:this.catPageSize;this.offset=Math.max(0,this.offset+(action==='page-next'?size:-size));this.expandedRow=-1;this.expandedDetails=[];await this.loadSection()}
   else if(action==='close'){this.closeModal()}
   else if(action==='history-entry'){const d=this.modal?.items?.[Number(btn.dataset.i)];if(d&&this.isAdmin){const rows=await this.api.adminHistory(d.entry_id);this.showModal({type:'history',heading:'Inventarizācijas ieraksta vēsture',items:rows})}}
   else if(action==='history-cat'){const d=this.modal?.data;if(d&&this.isAdmin){const rows=await this.api.adminCatalogueHistory(d.item_id);this.modalStack.push(this.modal);this.showModal({type:'history',heading:'Kataloga izmaiņu vēsture',items:rows})}}
   else if(action==='edit-entry'){const d=this.modal?.items?.[Number(btn.dataset.i)],g=this.modal?.group;if(!d||!g)return;this.showModal({type:'entry',edit:true,data:{...g,...d,quantity:d.quantity,barcode:d.barcode||''}})}
   else if(action==='void-entry'){const d=this.modal?.items?.[Number(btn.dataset.i)],g=this.modal?.group;if(!d||!g)return;this.showModal({type:'confirm',message:`Anulēt ierakstu ${d.legacy_id||d.entry_id} (${g.name}; ${formatQty(d.quantity)} ${d.unit})? Ieraksts netiks fiziski dzēsts.`,callback:()=>this.voidEntry(d,g)})}
   else if(action==='confirmed'){const fn=this.modal?.callback;this.closeModal();if(fn)await fn()}
   else if(action==='save-entry'){await this.saveEntry()}
   else if(action==='save-quick'){await this.saveQuickEntry()}
   else if(action==='save-cat'){await this.saveCatalogue()}
   else if(action==='hide-cat'){const d=this.modal.data;this.showModal({type:'confirm',message:`Izņemt no kataloga: ${d.name}? Vēsturiskie dati paliks nemainīgi.`,callback:()=>this.saveCatalogue('hide',d)})}
   else if(action==='scan-entry'){this.readQuickDraft();this.scanSource='entry';this.showModal({type:'scan'})}
   else if(action==='scan'){this.scanSource='edit';this.scanReturn={...this.modal.data,_scan_edit:!!this.modal.edit,...Object.fromEntries([['code','f-code'],['name','f-name'],['quantity','f-qty'],['unit','f-unit'],['invoice_price','f-pz'],['shelf_price','f-pl'],['cash','f-cash'],['note','f-note'],['barcode','f-barcode']].map(([key,id])=>[key,root.querySelector('#'+id)?.value||'']))};this.showModal({type:'scan',returnTo:'entry'})}
   else if(action==='scan-stop'){this.stopScan();if(this.scanSource==='entry'){this.closeModal()}else{this.showModal({type:'entry',edit:!!this.scanReturn?._scan_edit,data:this.scanReturn||{}});this.scanReturn=null}}
   else if(action==='scan-manual-search'){const barcode=root.querySelector('#scan-manual')?.value.trim();if(!barcode)throw Error('Ievadiet svītrkodu');await this.handleScannedBarcode(barcode)}
   else if(action==='clear-entry-field'){const f=root.querySelector('#'+btn.dataset.field);if(f){f.value='';f.dispatchEvent(new Event('input',{bubbles:true,detail:{clearing:true}}));}}
   else if(action==='dismiss-entry-catalogue'){this.entrySearchEnabled=false;this.entryCatalogueOpen=false;this.entrySeq++;this.entrySearchState='idle';this.updateEntryResults()}
   else if(action==='open-entry-catalogue'){this.entrySearchEnabled=true;this.entryNoMatchAwaitNext=false;this.handleEntrySearchChange({clearing:true});root.querySelector('#e-code')?.focus()}
   else if(action==='pick-entry-catalogue'){const item=this.entryResults[Number(btn.dataset.i)];if(item)this.pickEntryProduct(item)}
   else if(action==='pick-scan-variant'){const item=this.modal?.items?.[Number(btn.dataset.i)];if(item){this.closeModal();this.pickEntryProduct(item)}}
   else if(action==='qty-plus'||action==='qty-minus'){this.readQuickDraft();const original=dec2(this.entryDraft.quantity||'0');const next=original+(action==='qty-plus'?100n:-100n);this.fillQuickDraft({quantity:fromDec2(next<0n?0n:next)})}
   else if(action==='clear-entry'){this.fillQuickDraft({code:'',name:'',barcode:'',quantity:'1.00',unit:'gabali',invoice_price:'',shelf_price:'',note:''});this.entryQuery='';this.entryResults=[];this.entryCatalogueOpen=false;this.entrySearchEnabled=true;this.entrySearchState='idle';this.entryNoMatchAwaitNext=false;this.entryUnitManual=false;this.entrySeq++;this.updateEntryResults();this.entryRequestId=null}
   else if(action==='close-year'){this.showModal({type:'confirm',message:`Noslēgt ${this.config.active_year}. gada inventarizāciju? Pēc noslēgšanas ievade būs bloķēta; lai sāktu nākamo gadu, būs jāizmanto konfigurēšanas vednis.`,callback:async()=>{await this.api.adminCloseYear(Number(this.config.active_year));this.config=await this.api.config();await this.loadSection();this.toast('Gads noslēgts')}})}
   else if(action==='new-year-wizard'){this.xlsxRows=[];this.xlsxPreview=null;this.xlsxFileName='';this.showModal({type:'year-wizard'})}
   else if(action==='xlsx-import'){this.xlsxRows=[];this.xlsxPreview=null;this.xlsxFileName='';this.showModal({type:'xlsx'})}
   else if(action==='xlsx-preview'){await this.previewXlsx()}
   else if(action==='xlsx-commit'){await this.commitXlsx()}
   else if(action==='self-password'){this.showModal({type:'self-password'})}
   else if(action==='save-self-password'){await this.saveSelfPassword()}
   else if(action==='new-user'){this.showModal({type:'user',edit:false,data:{role:'staff'}})}
   else if(action==='edit-inline-entry'){const d=this.expandedDetails[Number(btn.dataset.i)],g=this.inventory[this.expandedRow];if(d&&g&&this.current)this.showModal({type:'entry',edit:true,data:{...g,...d}})}
   else if(action==='void-inline-entry'){const d=this.expandedDetails[Number(btn.dataset.i)],g=this.inventory[this.expandedRow];if(d&&g&&this.current)this.showModal({type:'confirm',message:`Anulēt ${g.name}, ${formatQty(d.quantity)} ${d.unit}? Ieraksts paliks audita vēsturē.`,callback:()=>this.voidEntry(d,g)})}
   else if(action==='history-inline-entry'){const d=this.expandedDetails[Number(btn.dataset.i)];if(d&&this.isAdmin){if(this.inlineHistory[d.entry_id])delete this.inlineHistory[d.entry_id];else this.inlineHistory[d.entry_id]=await this.api.adminHistory(d.entry_id);this.displaySection()}}
   else if(action==='edit-user'){const d=this.users[Number(btn.dataset.i)];if(d)this.showModal({type:'user',edit:true,data:d})}
   else if(action==='toggle-user'){const d=this.users[Number(btn.dataset.i)];if(!d||d.id===this.me?.id||this.busy)return;const active=!d.active;this.showModal({type:'confirm',message:`${active?'Atkārtoti aktivizēt':'Deaktivizēt'} lietotāju ${d.display_name||d.email_address}? ${active?'Lietotājs atkal varēs pieslēgties un izmantot aplikāciju.':'Piekļuve aplikācijas datiem tiks bloķēta, bet vēsturiskie ieraksti tiks saglabāti.'}`,callback:async()=>{this.setBusy(true);try{await this.api.adminUsers('PATCH',{id:d.id,display_name:d.display_name||'',role:d.role,active});await this.loadSection();this.toast(active?'Lietotājs aktivizēts':'Lietotājs deaktivizēts');}finally{this.setBusy(false)}}})}

  }catch(err){this.toast(err.message||'Darbība neizdevās','error');this.setBusy(false)}
 }
 async voidEntry(d,g){if(!this.current)return;const payload={p_request_id:crypto.randomUUID(),p_action:'void',p_year:this.year,p_entry_id:d.entry_id,p_expected_event:d.event_id,p_code:g.code,p_name:g.name,p_quantity:d.quantity,p_unit:d.unit,p_invoice_price:g.invoice_price,p_shelf_price:g.shelf_price,p_cash:g.cash,p_note:d.note||'',p_barcode:d.barcode||null};const result=await this.api.inventorySubmit(payload);await this.loadSection();this.toast('Ieraksts anulēts (audita vēsture saglabāta)')}
 async saveEntry(){if(this.busy||!this.current)return;const g=id=>root.querySelector('#'+id)?.value.trim()??'';const m=this.modal;if(m.type!=='entry')return;
  if(!g('f-name'))throw Error('Norādiet preces nosaukumu');if(!g('f-qty')||!g('f-pz')||!g('f-pl'))throw Error('Daudzums un abas cenas ir obligātas');
  const qty=safeNum(g('f-qty')),pz=safeNum(g('f-pz')),pl=safeNum(g('f-pl'));dec2(qty);dec2(pz);dec2(pl);
  if((dec2(pz)===0n||dec2(pl)===0n)&&!window.confirm('Brīdinājums: precei ir ievadīta cena 0,00 €. Vai tiešām saglabāt šo vērtību?'))return;
  const payload={p_request_id:m.requestId||(m.requestId=crypto.randomUUID()),p_action:m.edit?'replace':'create',p_year:Number(this.year),p_entry_id:m.edit?m.data.entry_id:null,p_expected_event:m.edit?m.data.event_id:null,p_code:g('f-code'),p_name:g('f-name'),p_quantity:qty,p_unit:g('f-unit'),p_invoice_price:pz,p_shelf_price:pl,p_cash:g('f-cash'),p_note:g('f-note'),p_barcode:g('f-barcode')||null};
  this.setBusy(true);try{await this.api.inventorySubmit(payload);this.closeModal();this.search='';this.offset=0;await this.loadSection();this.toast(m.edit?'Labojums saglabāts ar audita vēsturi':'Ieraksts saglabāts')}finally{this.setBusy(false)}
 }
 async saveCatalogue(forceAction=null,data=null){if(this.busy||!this.isAdmin||this.config.year_closed)return;const m=this.modal,d=data||m.data,action=forceAction||(m.edit?'update':'create');const g=id=>root.querySelector('#'+id)?.value.trim()??'';
  if(action!=='hide'&&!g('c-name'))throw Error('Norādiet nosaukumu');if(action==='create'&&!g('c-unit'))throw Error('Izvēlies mērvienību');let pz=action==='hide'?d.invoice_price:safeNum(g('c-pz'));let pl=action==='hide'?d.shelf_price:(g('c-pl')===''?null:safeNum(g('c-pl')));dec2(pz);if(pl!==null)dec2(pl);if(action!=='hide'&&pz==='')throw Error('Norādiet cenu');
  if(action!=='hide'&&(dec2(pz)===0n||(pl!==null&&dec2(pl)===0n))&&!window.confirm('Preces cena ir 0,00 €. Pārbaudiet, vai tā nav ievades kļūda. Vai saglabāt?'))return;
  const body={p_action:action,p_item_id:action==='create'?null:d.item_id,p_expected_revision:action==='create'?null:d.revision,p_code:action==='hide'?d.code:g('c-code'),p_name:action==='hide'?d.name:g('c-name'),p_invoice_price:pz,p_shelf_price:pl,p_barcode:action==='hide'?d.barcode:g('c-barcode')||null,p_unit:action==='hide'?(d.unit||null):(g('c-unit')||null)};
  this.setBusy(true);try{await this.api.catalogueChange(body);this.closeModal();await this.loadSection();this.toast(action==='hide'?'Prece izņemta no kataloga':'Kataloga izmaiņas saglabātas')}finally{this.setBusy(false)}
 }
 async saveUser(){if(this.busy)return;const d=this.modal.data,m=this.modal,g=id=>root.querySelector('#'+id)?.value.trim()??'';const password=root.querySelector('#u-password')?.value||'';if((!m.edit||password)&& (password.length<8||password.length>128))throw Error('Parolei jābūt 8–128 rakstzīmju garai');const payload=m.edit?{id:d.id,display_name:g('u-name'),role:g('u-role'),active:!!root.querySelector('#u-active')?.checked,...(password?{password}:{})}:{email:g('u-email'),password,display_name:g('u-name'),role:g('u-role')};this.setBusy(true);try{const res=await this.api.adminUsers(m.edit?'PATCH':'POST',payload);this.closeModal();await this.loadSection();this.toast(res.message||'Saglabāts')}finally{this.setBusy(false)}}
change(e){
  if(e.target.id==='view-year-select'&&this.section==='admin'&&this.isAdmin){this.year=Number(e.target.value);try{localStorage.setItem('inventory_view_year_'+this.me.id,String(this.year))}catch{}this.offset=0;this.expandedRow=-1;this.expandedDetails=[];this.search='';this.displaySection();return}
  if(e.target.id==='entry-search-toggle'){this.readQuickDraft();this.entrySearchEnabled=e.target.checked;this.entrySeq++;this.entryNoMatchAwaitNext=false;if(this.entrySearchEnabled)this.handleEntrySearchChange({clearing:true});else{this.entryCatalogueOpen=false;this.entrySearchState='idle';this.updateEntryResults()}return}
  if(e.target.id==='e-unit'){this.entryUnitManual=true;this.readQuickDraft();this.entryRequestId=null;return}
  if(e.target.id==='cash-select'){this.cash=e.target.value;this.offset=0;this.expandedRow=-1;this.loadSection();return}
  if(e.target.id==='stats-cash'){this.statsCash=e.target.value;this.loadSection();return}
  if(e.target.id==='user-status-filter'){this.userStatusFilter=e.target.value;this.refreshUserRows();return}
  if(e.target.id==='inventory-page-size'){this.invPageSize=Number(e.target.value);this.offset=0;this.expandedRow=-1;this.loadSection();return}
  if(e.target.id==='catalogue-page-size'){this.catPageSize=Number(e.target.value);this.offset=0;this.loadSection();return}
  if(e.target.id.startsWith('e-')){this.readQuickDraft();this.entryRequestId=null;this.quickPriceWarning();return}
 }
 blur(e){
  if(['e-pz','e-pl','c-pz','c-pl','f-pz','f-pl'].includes(e.target.id)){
   const raw=e.target.value.trim().replace(',','.');
   if(raw&&/^\d+(\.\d{1,2})?$/.test(raw)){e.target.value=inputMoney(raw);if(e.target.id.startsWith('e-'))this.readQuickDraft();}
  }
 }
 input(e){
  if(e.target.id.startsWith('e-')){
   const k={'e-code':'code','e-name':'name','e-barcode':'barcode'}[e.target.id];const previous=k?String(this.entryDraft[k]||''):'';
   this.readQuickDraft();this.entryRequestId=null;this.quickPriceWarning();
   if(k)this.handleEntrySearchChange({clearing:!!e.detail?.clearing||String(this.entryDraft[k]||'').length<=previous.length});
   return;
  }
  if(e.target.id==='user-search'){this.userSearch=e.target.value;this.refreshUserRows();return}
  if(e.target.id==='search-input'){this.search=e.target.value;this.offset=0;this.expandedRow=-1;this.debouncedSearch();return}
  if(this.modal?.type==='entry'&&e.target.id==='f-name'){this.searchSuggestions(e.target.value);this.modal.requestId=null;return}
  if(this.modal?.type==='entry'&&e.target.id.startsWith('f-'))this.modal.requestId=null;
 }
  async searchSuggestions(term){if(!term||term.trim().length<2){root.querySelector('#suggestions')?.classList.add('hidden');return}const q=term.trim();try{const arr=await this.api.catalogueSearch(q,0,8);if(this.modal?.type!=='entry'||root.querySelector('#f-name')?.value!==term)return;this.suggest=arr;const box=root.querySelector('#suggestions');if(!box)return;box.classList.toggle('hidden',!arr.length);box.innerHTML=arr.map((r,i)=>`<button class="suggestion" data-action="choose-suggestion" data-i="${i}"><b>${esc(r.name)}</b><span>${esc(r.code||'Bez koda')} · PZ ${money(r.invoice_price)} · PL ${money(r.shelf_price)}</span></button>`).join('');}catch{}}
 async startScan(){
  this.stopScan();const view=root.querySelector('#barcode-view');if(!view)return;
  const video=view.querySelector('video');
  if(!navigator.mediaDevices?.getUserMedia||!('BarcodeDetector' in window)){
   view.innerHTML='<div class="scan-unavailable">Kameras automātiskais lasītājs šajā pārlūkā nav pieejams. Ievadiet kodu zemāk.</div>';return;
  }
  try{
   const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
   if(this.modal?.type!=='scan'){stream.getTracks().forEach(t=>t.stop());return}
   this.scanner={stream,active:true};video.srcObject=stream;await video.play();
   const detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','code_39','upc_a','upc_e','itf']});
   const scan=async()=>{if(!this.scanner?.active||this.modal?.type!=='scan')return;
    try{const found=await detector.detect(video);if(found[0]?.rawValue){const code=found[0].rawValue;try{await this.handleScannedBarcode(code)}catch{this.toast('Svītrkoda meklēšana neizdevās','error')}return}}catch{}
    if(this.scanner?.active)this.scannerTimer=setTimeout(scan,180);
   };scan();
  }catch{this.stopScan();if(view.isConnected)view.innerHTML='<div class="scan-unavailable">Kamera nav pieejama. Ievadiet kodu zemāk.</div>'}
 }
 async handleScannedBarcode(barcode){
  this.stopScan();
  if(this.scanSource==='edit'){
   this.showModal({type:'entry',edit:!!this.scanReturn?._scan_edit,data:{...this.scanReturn,barcode}});
   this.scanReturn=null;
   try{const found=await this.api.catalogueByBarcode(barcode);if(found.length===1)this.applyProduct(found[0]);else if(found.length>1)this.showEditSuggestions(found)}catch{}
  }else{
   this.closeModal();this.fillQuickDraft({barcode});await this.handleBarcodeLookup(barcode);
  }
 }
 async handleBarcodeLookup(barcode){
  const code=String(barcode||'').trim();if(!code)return;
  const matches=await this.api.catalogueByBarcode(code);
  if(matches.length===1){this.pickEntryProduct(matches[0]);this.toast('Prece atrasta katalogā')}
  else if(matches.length>1){this.fillQuickDraft({barcode:code});this.showModal({type:'barcode-options',items:matches});}
  else{this.fillQuickDraft({barcode:code});this.toast('Katalogā nav atbilstoša svītrkoda');}
 }
 showEditSuggestions(matches){this.suggest=matches;const box=root.querySelector('#suggestions');if(box){box.classList.remove('hidden');box.innerHTML=matches.map((r,i)=>`<button class="suggestion" data-action="choose-suggestion" data-i="${i}"><b>${esc(r.name)}</b><span>PZ ${money(r.invoice_price)} · PL ${money(r.shelf_price)}</span></button>`).join('')}}
 applyProduct(r){
  if(this.modal?.type==='entry'){
   for(const [id,val] of [['f-code',r.code],['f-name',r.name],['f-pz',inputMoney(r.invoice_price)],['f-pl',inputMoney(r.shelf_price)],['f-barcode',r.barcode]]){const f=root.querySelector('#'+id);if(f)f.value=val??''}
   root.querySelector('#suggestions')?.classList.add('hidden');
  }else this.pickEntryProduct(r);
 }
 stopScan(){if(this.scannerTimer)clearTimeout(this.scannerTimer);if(this.scanner?.stream)this.scanner.stream.getTracks().forEach(t=>t.stop());this.scanner=null;this.scannerTimer=null}
 async saveQuickEntry(){
  if(this.busy)return;
  if(!this.current)throw Error('Skata gads neatbilst atvērtajam inventarizācijas gadam');
  this.readQuickDraft();const d=this.entryDraft;
  if(!d.name.trim())throw Error('Norādiet nosaukumu');
  if(!d.quantity.trim()||!d.invoice_price.trim()||!d.shelf_price.trim())throw Error('Daudzums un abas cenas ir obligātas');
  const q=String(d.quantity).replace(',','.'),pz=String(d.invoice_price).replace(',','.'),pl=String(d.shelf_price).replace(',','.');
  dec2(q);dec2(pz);dec2(pl);
  if((dec2(pz)===0n||dec2(pl)===0n)&&!window.confirm('Cena ir 0,00 €. Vai saglabāt?'))return;
  const id=this.entryRequestId||(this.entryRequestId=crypto.randomUUID());
  const payload={p_request_id:id,p_action:'create',p_year:Number(this.config.active_year),p_entry_id:null,p_expected_event:null,p_code:d.code.trim(),p_name:d.name.trim(),p_quantity:q,p_unit:d.unit,p_invoice_price:pz,p_shelf_price:pl,p_cash:d.cash,p_note:d.note.trim(),p_barcode:d.barcode.trim()||null};
  this.setBusy(true);
  try{
   await this.api.inventorySubmit(payload);
   this.entryRequestId=null;
   const cash=d.cash,unit=d.unit;
   this.fillQuickDraft({code:'',name:'',barcode:'',quantity:'1.00',unit,invoice_price:'',shelf_price:'',cash,note:''});
   this.entryQuery='';this.entryResults=[];this.entryCatalogueOpen=false;this.entrySearchEnabled=true;this.entrySearchState='idle';this.entryNoMatchAwaitNext=false;this.entryUnitManual=false;this.entrySeq++;this.updateEntryResults();const toggle=root.querySelector('#entry-search-toggle');if(toggle)toggle.checked=true;root.querySelector('#e-code')?.focus();this.toast('Ieraksts saglabāts');
  }finally{this.setBusy(false)}
 }

 async previewXlsx(){
  const file=root.querySelector('#xlsx-file')?.files?.[0];
  if(!file)throw Error('Izvēlies XLSX failu');
  this.xlsxRows=await parseCatalogueXlsx(file);this.xlsxFileName=file.name;
  this.xlsxPreview=this.modal?.type==='year-wizard'
   ?await this.api.adminPrepareNextYear(Number(this.config.active_year)+1,this.xlsxRows,true)
   :await this.api.adminCatalogueBatch(this.xlsxRows,true);
  const type=this.modal.type;this.showModal({type});
  const conflicts=Number(this.xlsxPreview.import?.conflict_count??this.xlsxPreview.conflict_count??0);
  this.toast(conflicts?`${conflicts} cenu/kodu konflikti — nevar importēt bez pārskatīšanas`:'Fails pārbaudīts; vari apstiprināt importu',conflicts?'warn':'');
 }
 async commitXlsx(){
  if(!this.xlsxRows.length||!this.xlsxPreview)throw Error('Vispirms pārbaudi XLSX failu');
  const conflicts=Number(this.xlsxPreview.import?.conflict_count??this.xlsxPreview.conflict_count??0);
  if(conflicts)throw Error('Konflikti jāizskata ar grāmatvedi pirms importa');
  const isYear=this.modal?.type==='year-wizard';
  if(isYear&&!this.config.year_closed)throw Error('Pirms jaunā gada atvēršanas noslēdz pašreizējo gadu');
  const rows=this.xlsxRows;
  this.showModal({type:'confirm',message:isYear?`Atvērt ${Number(this.config.active_year)+1}. gadu ar iepriekšējā gada katalogu un ${rows.length} XLSX rindām?`:`Pievienot jaunas kataloga pozīcijas no ${rows.length} XLSX rindām?`,callback:async()=>{
   this.setBusy(true);
   try{
    const result=isYear?await this.api.adminPrepareNextYear(Number(this.config.active_year)+1,rows,false):await this.api.adminCatalogueBatch(rows,false);
    this.xlsxPreview=null;this.xlsxRows=[];
    if(isYear){this.config=await this.api.config();this.year=Number(this.config.active_year);try{localStorage.setItem('inventory_view_year_'+this.me.id,String(this.year))}catch{}}
    await this.loadSection();
    this.toast(`Pievienotas ${result.import?.added??result.added??0} jaunas kataloga preces; izlaistas ${result.import?.skipped??result.skipped??0}.`);
   }finally{this.setBusy(false)}
  }});
 }
 async saveSelfPassword(){
  const password=root.querySelector('#self-new-password')?.value||'';
  if(password.length<8||password.length>128)throw Error('Parolei jābūt 8–128 rakstzīmju garai');
  const self=this.users.find(u=>u.id===this.me.id)||{...this.me,active:true};
  this.setBusy(true);
  try{
   await this.api.adminUsers('PATCH',{id:self.id,display_name:self.display_name,role:'admin',active:true,password});
   this.closeModal();this.toast('Parole nomainīta. Turpmāk izmanto jauno paroli.');
  }finally{this.setBusy(false)}
 }

}
const controller=new InventoryApp();
// Delegate suggestions separately to avoid placing product text inside executable markup.
root.addEventListener('click',e=>{const b=e.target.closest('[data-action="choose-suggestion"]');if(!b)return;e.stopImmediatePropagation();const p=controller.suggest[Number(b.dataset.i)];if(p)controller.applyProduct(p)},true);
controller.boot();

// Installable PWA on GitHub Pages; all requests stay online, including Supabase API.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  });
}
