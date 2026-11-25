/** Administrator-only user management using email/password Supabase Auth.
 * Secret key stays in Netlify Functions; caller's Supabase user JWT is verified.
 * Live two-user tests and API-key compatibility are a production blocker. */
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer'
}});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const normalizeEmail=(value)=>String(value||'').trim().toLowerCase();
const validEmail=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword = p => typeof p==='string' && p.length>=12 && p.length<=128;

export default async function handler(request){
  const base=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
  if(!/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(base)||!secret||!anon)
    return json({error:'Servera konfigurācija nav pabeigta'},503);
  if(!['GET','POST','PATCH'].includes(request.method))return json({error:'Metode nav atļauta'},405);
  const bearer=(request.headers.get('authorization')||'').match(/^Bearer ([A-Za-z0-9._\-]+)$/);
  if(!bearer)return json({error:'Nepieciešama autorizācija'},401);
  // New sb_secret keys are NOT JWTs. Send on apikey only. Legacy JWT requires Bearer.
  const serviceHeaders={'apikey':secret,'Content-Type':'application/json',...(secret.startsWith('sb_secret_')?{}:{'Authorization':`Bearer ${secret}`})};
  const service=async(path,opts={})=>{
    const r=await fetch(base+path,{...opts,headers:{...serviceHeaders,...(opts.headers||{})},cache:'no-store'});
    let d;try{d=await r.json();}catch{d={error:'Nederīga servera atbilde'}}
    if(!r.ok)throw Object.assign(new Error(d.msg||d.message||d.error_description||d.error||'Supabase kļūda'),{http:r.status});
    return d;
  };
  const asUser=async(jwt,path,body)=>{
    const r=await fetch(base+path,{method:'POST',headers:{apikey:anon,Authorization:`Bearer ${jwt}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
    let v;try{v=await r.json()}catch{v={}}
    if(!r.ok)throw Object.assign(new Error(v.message||v.error||'Profila saglabāšana neizdevās'),{http:r.status});
    return v;
  };
  try{
    const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:`Bearer ${bearer[1]}`},cache:'no-store'});
    if(!auth.ok)return json({error:'Nederīga sesija'},401);
    const self=await auth.json();
    if(!UUID.test(self.id||''))return json({error:'Nederīga sesija'},401);
    const roles=await service('/rest/v1/user_profiles?select=id,role,active&id=eq.'+encodeURIComponent(self.id));
    if(roles[0]?.role!=='admin'||roles[0]?.active!==true)return json({error:'Tikai administratoram'},403);

    if(request.method==='GET'){
      const profiles=await service('/rest/v1/user_profiles?select=id,email_address,display_name,role,active&order=created_at.asc&limit=200');
      return json({users:profiles});
    }
    const size=Number(request.headers.get('content-length')||0);
    if(size>10000)return json({error:'Pārāk liels pieprasījums'},413);
    let payload;
    try{payload=await request.json()}catch{return json({error:'Nepareizs pieprasījuma saturs'},400)}
    if(!payload||typeof payload!=='object')return json({error:'Nepareizi dati'},400);

    if(request.method==='POST'){
      const email=normalizeEmail(payload.email),name=String(payload.display_name||'').trim();
      if(!validEmail(email)||!validPassword(payload.password)||!name||name.length>120||!['staff','admin'].includes(payload.role))
        return json({error:'Pārbaudiet e-pastu, vārdu, paroli (12–128) un lomu'},400);
      // Supabase Auth enforces unique emails. Public signup must remain disabled.
      const created=await service('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({
        email,password:payload.password,email_confirm:true,
        app_metadata:{account_type:'inventory_internal'}
      })});
      const id=created.id||created.user?.id;
      if(!UUID.test(id||''))return json({error:'Auth lietotājs izveidots, bet ID nav iegūstams; pārbaudiet Supabase'},500);
      try{
        // The RPC checks the caller's real admin JWT and writes an immutable audit event.
        await asUser(bearer[1],'/rest/v1/rpc/admin_register_email_profile',{p_id:id,p_email:email,p_name:name,p_role:payload.role});
      }catch(e){
        // Avoid leaving an untracked, usable Auth account after failed profile creation.
        // If cleanup itself fails, make the partial failure conspicuous to the operator.
        try{await service('/auth/v1/admin/users/'+encodeURIComponent(id),{method:'DELETE'});}catch{
          return json({error:'Nepilnīgi izveidots konts Supabase Auth; administratoram jāpārbauda konts!'},500);
        }
        throw e;
      }
      return json({message:'Lietotājs izveidots',id},201);
    }

    const id=String(payload.id||''),name=String(payload.display_name||'').trim();
    if(!UUID.test(id)||!['staff','admin'].includes(payload.role)||typeof payload.active!=='boolean'||name.length>120)
      return json({error:'Nepareizi lietotāja dati'},400);
    if(id===self.id && (payload.role!=='admin'||payload.active===false))
      return json({error:'Administrators nevar sev atņemt administrēšanas tiesības'},400);
    if(payload.password!==undefined&&!validPassword(payload.password))
      return json({error:'Jaunajai parolei jābūt 12–128 rakstzīmju garai'},400);
    // Independent password change is performed via Supabase Auth Admin API.
    // The password itself is never persisted in application tables or audit events.
    if(payload.password!==undefined){
      await service('/auth/v1/admin/users/'+encodeURIComponent(id),{
        method:'PUT',body:JSON.stringify({password:payload.password})
      });
    }
    await asUser(bearer[1],'/rest/v1/rpc/admin_save_profile',{
      p_id:id,p_name:name,p_role:payload.role,p_active:payload.active
    });
    return json({message:'Lietotāja dati saglabāti'});
  }catch(e){
    // Do not send internal trace or raw payload to browser.
    const status=e?.http===409||e?.http===422?409:e?.http===400?400:500;
    if(status===409)return json({error:'E-pasts jau izmantots vai kontu nevar izveidot'},409);
    return json({error:status===400?'Nepareizi dati':'Darbība neizdevās; pārbaudiet Supabase administrācijas žurnālu'},status);
  }
}
