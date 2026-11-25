/** Server-only user management. Service key MUST be a Netlify Functions secret.
 *  Do not expose this module in the static site. Caller is independently verified
 *  through Supabase Auth and the SQL user_profiles admin flag.
 */
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@]{1,120}@[^\s@]{1,160}\.[^\s@]{2,}$/;
export default async function handler(request){
  const base=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon=process.env.SUPABASE_ANON_KEY;
  if(!base.startsWith('https://')||!secret||!anon) return json({error:'Servera konfigurācija nav pabeigta'},503);
  if(!['GET','POST','PATCH'].includes(request.method))return json({error:'Metode nav atļauta'},405);
  const bearer=(request.headers.get('authorization')||'').match(/^Bearer ([A-Za-z0-9._\-]+)$/);
  if(!bearer)return json({error:'Nepieciešama autorizācija'},401);
  const serviceHeaders={'apikey':secret,'Authorization':`Bearer ${secret}`,'Content-Type':'application/json'};
  const service=async(path,opts={})=>{
    const r=await fetch(base+path,{...opts,headers:{...serviceHeaders,...(opts.headers||{})},cache:'no-store'});
    const body=await r.text();let d;try{d=JSON.parse(body)}catch{d={error:body.slice(0,160)}};
    if(!r.ok)throw Object.assign(new Error(d.msg||d.message||d.error_description||d.error||'Supabase kļūda'),{http:r.status});
    return d;
  };
  const saveProfile=async(jwt,body)=>{
    const r=await fetch(base+'/rest/v1/rpc/admin_save_profile',{
      method:'POST',headers:{apikey:anon,Authorization:`Bearer ${jwt}`,'Content-Type':'application/json'},
      body:JSON.stringify(body),cache:'no-store'
    });
    if(!r.ok){let v;try{v=await r.json()}catch{v={}}throw Object.assign(new Error(v.message||'Profila saglabāšana neizdevās'),{http:r.status})}
  };
  try{
    const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:`Bearer ${bearer[1]}`},cache:'no-store'});
    if(!auth.ok)return json({error:'Nederīga sesija'},401);
    const self=await auth.json();if(!self.id||!UUID.test(self.id))return json({error:'Nederīga sesija'},401);
    const roles=await service('/rest/v1/user_profiles?select=id,role,active&id=eq.'+encodeURIComponent(self.id));
    if(roles[0]?.role!=='admin'||roles[0]?.active!==true)return json({error:'Tikai administratoram'},403);
    if(request.method==='GET'){
      const [authUsers,profiles]=await Promise.all([
        service('/auth/v1/admin/users?page=1&per_page=200'),
        service('/rest/v1/user_profiles?select=id,display_name,role,active&order=created_at.asc')
      ]);
      const byId=new Map((authUsers.users||[]).map(u=>[u.id,u.email]));
      return json({users:profiles.map(u=>({...u,email:byId.get(u.id)||''}))});
    }
    if(Number(request.headers.get('content-length')||0)>10000)return json({error:'Pārāk liels pieprasījums'},413);
    const payload=await request.json();
    if(request.method==='POST'){
      const email=String(payload.email||'').trim().toLowerCase(),name=String(payload.display_name||'').trim();
      if(!EMAIL.test(email)||name.length>120||!['staff','admin'].includes(payload.role))return json({error:'Nepareizi lietotāja dati'},400);
      const invited=await service('/auth/v1/invite',{method:'POST',body:JSON.stringify({email,data:{invited_via:'inventory_app'}})});
      if(!UUID.test(invited.id||''))throw new Error('Ielūgums izveidots, bet lietotāja ID netika saņemts. Pārbaudiet Supabase Authentication sadaļu.');
      // This RPC verifies the requesting admin again and atomically records role changes.
      await saveProfile(bearer[1],{p_id:invited.id,p_name:name,p_role:payload.role,p_active:true});
      return json({message:'Ielūgums nosūtīts. Lietotājs izveidots.',id:invited.id},201);
    }
    const id=String(payload.id||'');
    if(!UUID.test(id)||!['staff','admin'].includes(payload.role)||typeof payload.active!=='boolean'||String(payload.display_name||'').length>120) return json({error:'Nepareizi lietotāja dati'},400);
    if(id===self.id && (payload.role!=='admin'||payload.active===false))return json({error:'Administrators nevar atņemt sev vienīgās piekļuves tiesības'},400);
    await saveProfile(bearer[1],{p_id:id,p_name:String(payload.display_name||'').trim(),p_role:payload.role,p_active:payload.active});
    return json({message:'Lietotāja tiesības saglabātas'});
  }catch(e){return json({error:'Darbība neizdevās: '+(e?.message||'servera kļūda')},e?.http>=400&&e.http<500?e.http:500)}
}
