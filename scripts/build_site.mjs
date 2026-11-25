import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();const from=path.join(root,'site'),to=path.join(root,'dist');
fs.rmSync(to,{recursive:true,force:true});fs.cpSync(from,to,{recursive:true});
const url=(process.env.SUPABASE_URL||'').trim();const anon=(process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||'').trim();
if((url&&!/^https:\/\/[A-Za-z0-9.-]+\.supabase\.co$/.test(url))|| (anon&&(!/^[A-Za-z0-9_.-]+$/.test(anon)||anon.startsWith('sb_secret_'))))throw new Error('Invalid public Supabase settings');
fs.writeFileSync(path.join(to,'config.js'),`window.APP_CONFIG=${JSON.stringify({supabaseUrl:url,supabaseAnonKey:anon})};\n`);
console.log('Built static application (public anon key only, no private data). Configured:',Boolean(url&&anon));
