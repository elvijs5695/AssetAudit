import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../netlify/functions/users.mjs';
const originalFetch=globalThis.fetch;
const originalEnv={...process.env};
const ids={staff:'11111111-1111-4111-8111-111111111111',admin:'22222222-2222-4222-8222-222222222222',new:'33333333-3333-4333-8333-333333333333'};
function mock(role){
 process.env.SUPABASE_URL='https://example.supabase.co';
 process.env.SUPABASE_ANON_KEY='PUBLIC_TEST_KEY';
 process.env.SUPABASE_SERVICE_ROLE_KEY='PRIVATE_TEST_KEY';
 const calls=[];
 globalThis.fetch=async(url,opt={})=>{
  calls.push({url,headers:opt.headers,method:opt.method||'GET'});
  let body={};let status=200;
  if(url.endsWith('/auth/v1/user'))body={id:ids[role],email:role+'@example.test'};
  else if(url.includes('/rest/v1/user_profiles?select=id,role,active'))body=[{id:ids[role],role,active:true}];
  else if(url.includes('/auth/v1/admin/users'))body={users:[{id:ids.admin,email:'admin@example.test'}]};
  else if(url.includes('/rest/v1/user_profiles?select=id,display_name'))body=[{id:ids.admin,role:'admin',active:true,display_name:'Admin'}];
  else if(url.includes('/auth/v1/invite'))body={id:ids.new};
  else if(url.includes('/rest/v1/rpc/admin_save_profile'))body=ids.new;
  else {status=404;body={error:'Unexpected mocked request '+url}};
  return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 };
 return calls;
}
function call(method,token='admin',body){return handler(new Request('https://sample.netlify.app/.netlify/functions/users',{method,headers:{authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}));}
test('anonymous cannot request user listing',async()=>{const calls=mock('admin');const r=await handler(new Request('https://sample.netlify.app/.netlify/functions/users'));assert.equal(r.status,401);assert.equal(calls.length,0)});
test('staff token cannot list users or create admins',async()=>{const calls=mock('staff');const r=await call('GET','staff');assert.equal(r.status,403);assert.equal(calls.length,2)});
test('admin receives only server-authorized user list',async()=>{const calls=mock('admin');const r=await call('GET');assert.equal(r.status,200);const data=await r.json();assert.equal(data.users.length,1);assert.equal(data.users[0].email,'admin@example.test');assert.equal(calls.length,4)});
test('admin invitation uses audit-recording RPC with calling JWT',async()=>{const calls=mock('admin');const r=await call('POST','admin',{email:'new@example.test',display_name:'Jauns',role:'staff'});assert.equal(r.status,201);assert.equal(calls.at(-1).url,'https://example.supabase.co/rest/v1/rpc/admin_save_profile');assert.equal(calls.at(-1).headers.Authorization,'Bearer admin')});
test('no service secret returns 503',async()=>{mock('admin');delete process.env.SUPABASE_SERVICE_ROLE_KEY;const r=await call('GET');assert.equal(r.status,503)});
process.on('exit',()=>{globalThis.fetch=originalFetch;Object.assign(process.env,originalEnv)});
