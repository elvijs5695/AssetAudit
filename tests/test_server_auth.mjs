import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../netlify/functions/users.mjs';
const initialEnv={...process.env};
const origFetch=globalThis.fetch;
const ids={staff:'11111111-1111-4111-8111-111111111111',admin:'22222222-2222-4222-8222-222222222222',new:'33333333-3333-4333-8333-333333333333'};
function mock({role='admin',profileFail=false,deleteFail=false,createFail=false}={}){
 process.env.SUPABASE_URL='https://example.supabase.co';
 process.env.SUPABASE_ANON_KEY='JWT_STYLE_ANON_PUBLIC_TEST_KEY';
 process.env.SUPABASE_SERVICE_ROLE_KEY='JWT_STYLE_PRIVATE_TEST_KEY';
 const calls=[];
 globalThis.fetch=async(url,opt={})=>{
  calls.push({url,headers:opt.headers,method:opt.method||'GET',body:opt.body?JSON.parse(opt.body):undefined});
  let body={};let status=200;
  if(url.endsWith('/auth/v1/user'))body={id:ids[role]};
  else if(url.includes('/rest/v1/user_profiles?select=id,role,active'))body=[{id:ids[role],role,active:true}];
  else if(url.includes('/rest/v1/user_profiles?select=id,username,display_name'))body=[{id:ids.admin,username:'admin',role:'admin',active:true,display_name:'Administrators'}];
  else if(url.endsWith('/auth/v1/admin/users') && opt.method==='POST'){
    if(createFail){status=422;body={msg:'User already registered'}}else body={id:ids.new};
  }
  else if(url.endsWith('/rest/v1/rpc/admin_register_profile')){
    if(profileFail){status=409;body={message:'duplicate username'}}else body=ids.new;
  }
  else if(url.endsWith('/auth/v1/admin/users/'+ids.new) && opt.method==='DELETE'){
    if(deleteFail){status=500;body={error:'cleanup failed'}}else body={};
  }
  else if(url.endsWith('/auth/v1/admin/users/'+ids.new) && opt.method==='PUT')body={id:ids.new};
  else if(url.endsWith('/rest/v1/rpc/admin_save_profile'))body=ids.new;
  else {status=404;body={error:'Unexpected mocked request '+url}};
  return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 };
 return calls;
}
const call=(method,token='admin',body)=>handler(new Request('https://app.netlify.app/.netlify/functions/users',{method,headers:{authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}));
const newUser={username:'JANIS',password:'longUniquePassword#2026',display_name:'Jānis',role:'staff'};
test('unauthenticated request denied without hitting Supabase',async()=>{const calls=mock();const r=await handler(new Request('https://app.netlify.app/.netlify/functions/users'));assert.equal(r.status,401);assert.equal(calls.length,0)});
test('non-admin token cannot list users',async()=>{const calls=mock({role:'staff'});const r=await call('GET','staff');assert.equal(r.status,403);assert.equal(calls.length,2)});
test('admin lists only usernames and never internal Auth addresses',async()=>{const calls=mock();const r=await call('GET');assert.equal(r.status,200);const v=await r.json();assert.equal(v.users[0].username,'admin');assert.ok(!JSON.stringify(v).includes('@'));assert.equal(calls.length,3)});
test('creates user with password, confirmed non-deliverable alias and audited RPC',async()=>{
 const calls=mock();const r=await call('POST','admin',newUser);assert.equal(r.status,201);const create=calls.find(x=>x.url.endsWith('/auth/v1/admin/users'));assert.deepEqual(create.body,{email:'janis@accounts.inventory.invalid',password:newUser.password,email_confirm:true,app_metadata:{account_type:'inventory_internal'}});const profile=calls.find(x=>x.url.endsWith('/rest/v1/rpc/admin_register_profile'));assert.equal(profile.body.p_username,'janis');assert.equal(profile.headers.Authorization,'Bearer admin');
});
test('rejects short passwords and malformed usernames before account creation',async()=>{const calls=mock();const r=await call('POST','admin',{...newUser,password:'weak'});assert.equal(r.status,400);assert.equal(calls.length,2);const r2=await call('POST','admin',{...newUser,username:'illegal@name'});assert.equal(r2.status,400);assert.equal(calls.length,4)});
test('duplicate alias returns generic conflict, no extra profile',async()=>{const calls=mock({createFail:true});const r=await call('POST','admin',newUser);assert.equal(r.status,409);assert.equal(calls.filter(x=>x.url.endsWith('/rest/v1/rpc/admin_register_profile')).length,0)});
test('profile failure triggers delete of not-yet-profiled Auth account',async()=>{const calls=mock({profileFail:true});const r=await call('POST','admin',newUser);assert.equal(r.status,409);assert.ok(calls.some(x=>x.url.endsWith('/auth/v1/admin/users/'+ids.new)&&x.method==='DELETE'))});
test('failed profile cleanup emits operational alarm without disclosing secrets',async()=>{mock({profileFail:true,deleteFail:true});const r=await call('POST','admin',newUser);assert.equal(r.status,500);const response=await r.json();assert.match(response.error,/pārbauda konts/);assert.ok(!JSON.stringify(response).includes('PRIVATE_TEST_KEY'))});
test('PATCH password calls Auth admin; profile updated via caller JWT',async()=>{const calls=mock();const r=await call('PATCH','admin',{id:ids.new,display_name:'Jauns',role:'staff',active:true,password:'aTrulyNewPassword#2026'});assert.equal(r.status,200);const auth=calls.find(x=>x.method==='PUT');assert.equal(auth.body.password,'aTrulyNewPassword#2026');const audit=calls.find(x=>x.url.endsWith('/rest/v1/rpc/admin_save_profile'));assert.equal(audit.headers.Authorization,'Bearer admin')});
test('cannot demote or deactivate current admin',async()=>{const calls=mock();const r=await call('PATCH','admin',{id:ids.admin,display_name:'Admin',role:'staff',active:false});assert.equal(r.status,400);assert.equal(calls.length,2)});
test('rejects new secret key until the API adapter is verified',async()=>{const calls=mock();process.env.SUPABASE_SERVICE_ROLE_KEY='sb_secret_example123';const r=await call('GET');assert.equal(r.status,503);assert.equal(calls.length,0)});
test('missing secret is rejected without network requests',async()=>{const calls=mock();delete process.env.SUPABASE_SERVICE_ROLE_KEY;const r=await call('GET');assert.equal(r.status,503);assert.equal(calls.length,0)});
process.on('exit',()=>{globalThis.fetch=origFetch;for(const k of Object.keys(process.env)) if(!(k in initialEnv))delete process.env[k];Object.assign(process.env,initialEnv)});
