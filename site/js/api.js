/** Minimal no-dependency Supabase Auth and PostgREST client.
 *  The browser contains ONLY the publishable ANON key; service role is NEVER here.
 */
// Supabase Auth still expects an email/phone identifier internally. Staff never
// provide an address: we use an undeliverable, RFC 2606 reserved internal alias.
// MUST be validated against a live Supabase test project before production use.
export const USERNAME_RE = /^[a-z][a-z0-9._-]{2,31}$/;
export function identityForUsername(value){
  const username=String(value||'').trim().toLowerCase();
  if(!USERNAME_RE.test(username)||username.includes('..')||username.endsWith('.'))throw new Error('Lietotājvārdam jābūt 3–32 latīņu burtiem/cipariem; atļauti arī . _ -');
  return username+'@accounts.inventory.invalid';
}
export class SupabaseAPI {
  constructor({supabaseUrl,supabaseAnonKey}){
    this.url=(supabaseUrl||'').replace(/\/$/,'');this.key=supabaseAnonKey||'';
    this.session=null;
    try{const s=sessionStorage.getItem('inv_session');if(s)this.session=JSON.parse(s);}catch{}
  }
  get configured(){return this.url.startsWith('https://')&&this.key.length>15&&!this.key.startsWith('sb_publishable_');}
  store(){try{if(this.session)sessionStorage.setItem('inv_session',JSON.stringify(this.session));else sessionStorage.removeItem('inv_session');}catch{}}
  async request(path,{method='GET',body,auth=true,headers={}}={}){
    if(!this.configured)throw new Error('Supabase vēl nav konfigurēts');
    if(auth)await this.refreshIfNeeded();
    const res=await fetch(this.url+path,{method,cache:'no-store',headers:{'apikey':this.key,'Authorization':`Bearer ${auth?(this.session?.access_token||this.key):this.key}`,'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});
    const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null;}catch{data=raw;}
    if(!res.ok)throw new Error(data?.message||data?.error_description||data?.error||data?.hint||`Servera kļūda (${res.status})`);
    return data;
  }
  async login(username,password){
    const email=identityForUsername(username);
    let s;
    try{s=await this.request('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:{email,password}});}
    catch{throw new Error('Nepareizs lietotājvārds vai parole');}
    this.session={...s,expires_at:Math.floor(Date.now()/1000)+Number(s.expires_in||3600)};this.store();
    return this.me();
  }
  async refreshIfNeeded(){
    if(!this.session?.refresh_token)throw new Error('Jāpieslēdzas no jauna');
    if((this.session.expires_at||0)-90>Date.now()/1000)return;
    const data=await this.request('/auth/v1/token?grant_type=refresh_token',{method:'POST',auth:false,body:{refresh_token:this.session.refresh_token}});
    this.session={...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)};this.store();
  }
  async me(){
    if(!this.session?.access_token)throw new Error('Jāpieslēdzas no jauna');
    const me=await this.request('/auth/v1/user');
    const p=await this.request('/rest/v1/user_profiles?select=id,display_name,role,active&id=eq.'+encodeURIComponent(me.id));
    if(!Array.isArray(p)||!p[0]?.active){this.session=null;this.store();throw new Error('Lietotāja profils nav aktivizēts. Sazinieties ar administratoru.');}
    return {...p[0]};
  }
  async config(){const rows=await this.request('/rest/v1/app_config?select=active_year,locale,timezone');return rows?.[0]||{active_year:2026};}
  async rpc(fn,body){return this.request('/rest/v1/rpc/'+fn,{method:'POST',body});}
  async inventoryList({year,search='',cash='',limit=60,offset=0}){return this.rpc('inventory_list',{p_year:year,p_search:search,p_cash:cash,p_limit:limit,p_offset:offset});}
  async inventoryDetails(group,year){return this.rpc('inventory_details',{p_year:year,p_code:group.code,p_name:group.name,p_invoice_price:group.invoice_price,p_shelf_price:group.shelf_price,p_cash:group.cash});}
  async catalogueSearch(search='',offset=0,limit=80){return this.rpc('catalogue_search',{p_search:search,p_offset:offset,p_limit:limit});}
  async inventorySubmit(payload){return this.rpc('inventory_submit',payload);}
  async catalogueChange(payload){return this.rpc('catalogue_change',payload);}
  async adminStats(year,asof=null){const r=await this.rpc('admin_stats',{p_year:year,p_asof:asof});return r[0];}
  async adminHistory(entryId){return this.rpc('admin_history',{p_entry_id:entryId});}
  async adminCatalogueHistory(itemId){return this.rpc('admin_catalogue_history',{p_item_id:itemId});}
  async adminSetYear(year){return this.rpc('admin_set_year',{p_year:year});}
  async adminAuditList(limit=100){return this.rpc('admin_audit_list',{p_limit:limit});}
  async adminUsers(method='GET',body){
    await this.refreshIfNeeded();
    const res=await fetch('/.netlify/functions/users',{method,headers:{'Authorization':'Bearer '+this.session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});
    let r;try{r=await res.json();}catch{r={error:'Servera atbilde nav salasāma'};}
    if(!res.ok)throw new Error(r.error||'Administrācijas servera kļūda');return r;
  }
  async logout(){try{if(this.session?.access_token)await this.request('/auth/v1/logout',{method:'POST'});}catch{}this.session=null;this.store();}
}
