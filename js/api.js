/** Inventarizācija v0.3.0 — browser client. Publishable key only; privileged operations remain server-side.
 * localStorage deliberately persists Supabase sessions across browser restarts (not passwords).
 * Strict CSP, no untrusted HTML rendering, and audit/RLS enforcement remain essential.
 */
export class SupabaseAPI {
  constructor({supabaseUrl,supabasePublishableKey}={}) {
    this.url=String(supabaseUrl||'').replace(/\/$/,'');
    this.key=supabasePublishableKey||'';this.session=null;this.refreshPromise=null;
    try {const s=localStorage.getItem('assetaudit_session_v2')||sessionStorage.getItem('inv_session');if(s)this.session=JSON.parse(s);}catch{}
    try{sessionStorage.removeItem('inv_session')}catch{}
  }
  get configured(){return this.url.startsWith('https://')&&this.key.startsWith('sb_publishable_')}
  store(){try{if(this.session)localStorage.setItem('assetaudit_session_v2',JSON.stringify(this.session));else localStorage.removeItem('assetaudit_session_v2');}catch{}}
  async request(path,{method='GET',body,auth=true,headers={}}={}){
    if(!this.configured)throw new Error('Supabase konfigurācija nav pieejama');
    if(auth)await this.refreshIfNeeded();
    const token=auth?this.session?.access_token:null;
    if(auth&&!token)throw new Error('Sesija beigusies. Pieslēdzieties vēlreiz.');
    const h={'apikey':this.key,'Content-Type':'application/json',...headers};
    if(token)h.Authorization=`Bearer ${token}`;
    let res;
    try{res=await fetch(this.url+path,{method,cache:'no-store',headers:h,body:body===undefined?undefined:JSON.stringify(body)});}
    catch{throw new Error('Nav savienojuma ar Supabase. Pārbaudiet internetu. Sesija saglabāta.');}
    const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null;}catch{data=raw;}
    if(!res.ok){
      if(auth&&auth!==false&&(data?.error_code==='session_not_found'||data?.code==='session_not_found'||/session from session_id claim in jwt does not exist/i.test(String(data?.msg||data?.message||'')))){this.session=null;this.store();const err=new Error('Iepriekšējā sesija ir atsaukta (piemēram, pēc paroles maiņas vai izrakstīšanās citā ierīcē). Pieslēdzieties vēlreiz.');err.status=401;err.code='session_not_found';throw err;}
      const error=data?.msg||data?.message||data?.error_description||data?.error||data?.hint||`Servera kļūda (${res.status})`;
      if((data?.code==='PGRST202'||data?.error_code==='PGRST202')&&/(catalogue_search_fields|catalogue_search_with_unit|catalogue_by_barcode_with_unit|catalogue_change_with_unit)/i.test(String(error))){const setup=new Error('Supabase datubāzē vēl nav migrācijas 007. Kataloga funkcijas nav pieejamas.');setup.code='MIGRATIONS_REQUIRED';throw setup;}
      if((data?.code==='PGRST202'||data?.error_code==='PGRST202')&&/(remote_scanner_)/i.test(String(error))){const setup=new Error('Nepieciešama Supabase migrācija 012 attālinātajam svītrkoda skenerim.');setup.code='MIGRATIONS_REQUIRED';throw setup;}
      if((data?.code==='PGRST202'||data?.error_code==='PGRST202')&&/(inventory_list_v035|inventory_feed_page|inventory_feed_head|inventory_view_state|inventory_mark_seen|inventory_mark_one_seen)/i.test(String(error))){const setup=new Error('Trūkst datubāzes migrācijas 011. Nepieciešama inventarizācijas saraksta un apskates atzīmju atjaunināšana.');setup.code='MIGRATIONS_REQUIRED';throw setup;}
      const ex=new Error(String(error));ex.status=res.status;ex.code=data?.error_code||data?.code||'';throw ex;
    }
    return data;
  }
  async login(email,password){
    email=String(email||'').trim().toLowerCase();
    if(!email.includes('@')||email.length>254)throw new Error('Ievadiet korektu e-pasta adresi');
    let s;
    try{s=await this.request('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:{email,password}});}
    catch(e){if(e.code==='invalid_credentials')throw new Error('Nepareizs e-pasts vai parole');throw e;}
    this.session={...s,expires_at:Math.floor(Date.now()/1000)+Number(s.expires_in||3600)};this.store();
    return this.me();
  }
  async refreshIfNeeded(){
    if(!this.session?.refresh_token)throw new Error('Jāpieslēdzas no jauna');
    if(Number(this.session.expires_at||0)-120>Date.now()/1000)return;
    if(this.refreshPromise)return this.refreshPromise;
    this.refreshPromise=(async()=>{
      try{
        const data=await this.request('/auth/v1/token?grant_type=refresh_token',{method:'POST',auth:false,body:{refresh_token:this.session.refresh_token}});
        this.session={...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)};this.store();
      }catch(e){
        // Do not discard tokens for transient network/server errors.
        if(e.status===400||e.status===401){this.session=null;this.store();}
        throw e;
      }
    })();
    try{await this.refreshPromise}finally{this.refreshPromise=null}
  }
  async me(){
    if(!this.session?.access_token)throw new Error('Jāpieslēdzas no jauna');
    const self=await this.request('/auth/v1/user');
    const profiles=await this.request('/rest/v1/user_profiles?select=id,display_name,role,active&id=eq.'+encodeURIComponent(self.id));
    if(!Array.isArray(profiles)||!profiles[0]?.active){this.session=null;this.store();throw new Error('Lietotāja profils nav aktivizēts. Sazinieties ar administratoru.');}
    return profiles[0];
  }
  async config(){
    let response;
    try {
      response=await this.request('/rest/v1/rpc/admin_year_status',{method:'POST',body:{}});
    } catch(error){
      // The login has succeeded. Missing database migrations must not look like bad credentials.
      if(error.code==='PGRST202' && /admin_year_status/i.test(error.message)){
        const problem=new Error('Nav pieejama gada statusa funkcija. Pārbaudiet migrācijas 005 un 006 un Supabase shēmas kešatmiņu.');
        problem.code='MIGRATIONS_REQUIRED';
        throw problem;
      }
      throw error;
    }
    if(!Array.isArray(response)||response.length!==1||!Number.isInteger(Number(response[0].active_year))||typeof response[0].year_closed!=='boolean'){
      const problem=new Error('Neizdevās nolasīt inventarizācijas gada iestatījumus. Datu ievade ir apturēta.');
      problem.code='CONFIG_INVALID';
      throw problem;
    }
    return response[0];
  }
  async rpc(fn,body={}){return this.request('/rest/v1/rpc/'+fn,{method:'POST',body});}
  async inventoryList({year,search='',cash='',sort='recent',user='',limit=50,offset=0}){return this.rpc('inventory_list_v035',{p_year:year,p_search:search,p_cash:cash,p_sort:sort,p_user_id:user||null,p_limit:limit,p_offset:offset});}
  async inventoryViewState(year){const rows=await this.rpc('inventory_view_state',{p_year:year});return rows?.[0]||{seen_feed_id:0,snapshot_feed_id:0};}
  async inventoryMarkSeen(year,snapshot){return this.rpc('inventory_mark_seen',{p_year:year,p_snapshot_feed_id:snapshot});}
  async inventoryMarkOneSeen(year,id){return this.rpc('inventory_mark_one_seen',{p_year:year,p_entry_id:id});}
  async inventoryFeedHead(year){return this.rpc('inventory_feed_head',{p_year:year});}
  async inventoryFeedPage(year,{after=0,before=null,limit=50,ascending=true}={}){return this.rpc('inventory_feed_page',{p_year:year,p_after:after,p_before:before,p_limit:limit,p_ascending:ascending});}
  async inventoryDetails(group,year,user=''){return this.rpc(user?'inventory_details_by_user':'inventory_details_readable',{p_year:year,p_code:group.code,p_name:group.name,p_invoice_price:group.invoice_price,p_shelf_price:group.shelf_price,p_cash:group.cash,p_unit:group.unit,...(user?{p_user_id:user}:{})});}
  async catalogueSearch(search='',offset=0,limit=50){return this.rpc('catalogue_search_with_unit',{p_search:search,p_offset:offset,p_limit:limit});}
  async catalogueSearchSorted(search='',offset=0,limit=50,sort='alpha'){return this.rpc('catalogue_search_sorted',{p_search:search,p_offset:offset,p_limit:limit,p_sort:sort});}
  async adminUserCounts(year){return this.rpc('admin_user_entry_counts',{p_year:year});}
  async catalogueSearchFields({code='',name='',barcode}={}){return this.rpc('catalogue_search_fields',{p_code:code,p_name:name,p_barcode:barcode||'',p_limit:25});}
  async catalogueByBarcode(barcode){return this.rpc('catalogue_by_barcode_with_unit',{p_barcode:barcode});}
  async remoteScannerActivate(requestId){return this.rpc('remote_scanner_activate',{p_request_id:requestId});}
  async remoteScannerMobileState(){return this.rpc('remote_scanner_mobile_state',{});}
  async remoteScannerSend(requestId,barcode){return this.rpc('remote_scanner_send',{p_request_id:requestId,p_barcode:barcode});}
  async remoteScannerReceive(requestId){return this.rpc('remote_scanner_receive',{p_request_id:requestId});}
  async remoteScannerCancel(requestId){return this.rpc('remote_scanner_cancel',{p_request_id:requestId});}
  async inventorySubmit(payload){return this.rpc('inventory_submit',payload);}
  async catalogueChange(payload){return this.rpc('catalogue_change_with_unit',payload);}
  async adminStats(year,cash=''){const r=await this.rpc('admin_stats_by_cash',{p_year:year,p_cash:cash});return r?.[0]||{};}
  async adminDaily(year,from,to,cash=''){return this.rpc('admin_daily_entries',{p_year:year,p_from:from,p_to:to,p_cash:cash});}
  async adminHistory(entryId){return this.rpc('admin_history_readable',{p_entry_id:entryId});}
  async adminCatalogueHistory(itemId){return this.rpc('admin_catalogue_history_readable',{p_item_id:itemId});}
  async adminAuditList(limit=100){return this.rpc('admin_audit_list',{p_limit:limit});}
  async adminUsers(method='GET',body){
    if(method==='GET')return {users:await this.rpc('admin_profile_list',{})};
    if(!this.configured)throw new Error('Supabase nav konfigurēts');
    await this.refreshIfNeeded();
    let res;
    try{res=await fetch(this.url+'/functions/v1/users',{method,headers:{'apikey':this.key,'Authorization':'Bearer '+this.session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});}
    catch{throw new Error('Lietotāju administrācijas funkcija nav sasniedzama. Supabase → Edge Functions jābūt izvietotai funkcijai “users”.');}
    let r;try{r=await res.json();}catch{r={error:'Servera atbilde nav salasāma'};}
    if(!res.ok){if(res.status===404)throw new Error('Supabase Edge Function “users” vēl nav izvietota.');
      if(res.status===401)throw new Error('Supabase noraidīja “users” funkcijas pieprasījumu (401). Pārbaudiet tās JWT konfigurāciju.');
      throw new Error(r.error||r.message||`Administrācijas kļūda (${res.status})`);
    }return r;
  }
  async adminCatalogueBatch(rows,dry=true){return this.rpc('admin_catalogue_batch',{p_rows:rows,p_dry_run:dry});}
  async verifyYearPassword(action,password){
    if(!['close_year','start_year'].includes(action)||!password)throw new Error('Ievadiet administratora paroli');
    await this.refreshIfNeeded();
    let res;
    try{res=await fetch(this.url+'/functions/v1/year-operations',{
      method:'POST',cache:'no-store',headers:{apikey:this.key,Authorization:'Bearer '+this.session.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({action,password})
    });}catch{throw new Error('Paroles apstiprin\u0101\u0161anas pakalpojums nav sasniedzams');}
    let data;try{data=await res.json();}catch{data={};}
    if(!res.ok){if(res.status===404)throw new Error('Supabase funkcija year-operations nav izvietota');
      if(res.status===403)throw new Error('Nepareiza parole vai nav administratora ties\u012bbu');
      throw new Error(data.error||'Paroles apstiprin\u0101\u0161ana neizdev\u0101s');}
    if(!/^[0-9a-f-]{36}$/i.test(data?.proof||''))throw new Error('Neder\u012bga paroles apstiprin\u0101\u0161ana');
    return data.proof;
  }
  async adminCloseYear(year,password){
    const proof=await this.verifyYearPassword('close_year',password);
    return this.rpc('admin_close_year_verified',{p_year:year,p_proof:proof});
  }
  async adminPrepareNextYear(year,rows,dry=true,password=''){
    if(dry)return this.rpc('admin_prepare_next_year_preview',{p_year:year,p_rows:rows});
    const proof=await this.verifyYearPassword('start_year',password);
    return this.rpc('admin_prepare_next_year_verified',{p_year:year,p_rows:rows,p_proof:proof});
  }
  async logout(){try{if(this.session?.access_token)await this.request('/auth/v1/logout?scope=local',{method:'POST'});}catch{}this.session=null;this.store();}
}
