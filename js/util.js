export function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function dec2(value){let s=String(value??'0').replace(',','.').trim();if(!/^-?\d+(\.\d{0,2})?$/.test(s))throw new Error('Nepareizs skaitlis (līdz 2 cipariem aiz komata)');let neg=s.startsWith('-');if(neg)s=s.slice(1);const [a,b='']=s.split('.');const n=BigInt(a)*100n+BigInt((b+'00').slice(0,2));return neg?-n:n;}
export function fromDec2(v){const n=BigInt(v);return `${n<0n?'-':''}${(n<0n?-n:n)/100n}.${String((n<0n?-n:n)%100n).padStart(2,'0')}`;}
// Display fixed-scale decimal monetary values without floating-point arithmetic.
export function formatMoney(v){
 if(v===null||v===undefined||v==='')return '—';
 try{const cents=dec2(v),abs=cents<0n?-cents:cents;
  return `${cents<0n?'-':''}${new Intl.NumberFormat('lv-LV').format(abs/100n)},${String(abs%100n).padStart(2,'0')} €`;
 }catch{return String(v)+' €'}
}
export function formatQty(v){
 if(v===null||v===undefined||v==='')return '—';
 try{const cents=dec2(v),abs=cents<0n?-cents:cents;
 const tail=String(abs%100n).padStart(2,'0').replace(/0+$/,'');
 return `${cents<0n?'-':''}${new Intl.NumberFormat('lv-LV').format(abs/100n)}${tail?','+tail:''}`;
 }catch{return String(v)}
}
// Interpret administrator's historical timestamp strictly in Latvia's time zone.
// Reject nonexistent/ambiguous wall times during DST transitions rather than guessing.
export function rigaWallToIso(value){
 const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
 if(!match)throw new Error('Ievadiet korektu datumu un laiku.');
 const [y,mo,d,h,mi]=match.slice(1).map(Number);
 const base=Date.UTC(y,mo-1,d,h,mi);
 const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Riga',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const matches=[];
 for(const offset of [1,2,3,4]){
  const candidate=new Date(base-offset*3600000);
  const parts=Object.fromEntries(formatter.formatToParts(candidate).map(x=>[x.type,x.value]));
  if(Number(parts.year)===y&&Number(parts.month)===mo&&Number(parts.day)===d&&Number(parts.hour)===h&&Number(parts.minute)===mi) matches.push(candidate.toISOString());
 }
 if(matches.length!==1)throw new Error('Šajā datumā izvēlētais laiks Rīgā nav viennozīmīgs (pāreja starp vasaras un ziemas laiku). Izvēlieties citu laiku.');
 return matches[0];
}
export function localYear(){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Riga',year:'numeric'}).format(new Date()));}
export function icon(name,size=19){const paths={
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4Z"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  box:'<path d="M3 7 12 3l9 4v10l-9 4-9-4Z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  chart:'<path d="M4 20V8m6 12V4m6 16v-8m5 8H3"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="m19 13 2-1-2-1-.5-2 1-2-2-2-2 1-2-.5-1-2-1 2-2 .5-2-1-2 2 1 2L5 11l-2 1 2 1 .5 2-1 2 2 2 2-1 2 .5 1 2 1-2 2-.5 2 1 2-2-1-2Z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  scan:'<path d="M4 9V5h4m8 0h4v4M4 15v4h4m8 0h4v-4M8 12h8M8 9v6m4-6v6m4-6v6"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5m5 5H9"/>',
  alert:'<path d="m12 3 10 18H2Z"/><path d="M12 9v4m0 4h.01"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  close:'<path d="M5 5l14 14M19 5 5 19"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  shield:'<path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6Z"/><path d="m8 12 3 3 5-5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  trash:'<path d="M4 7h16m-3 0-.8 14H7.8L7 7m3-3h4"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2"/>',
  arrow:'<path d="m5 12 14 0m-6-6 6 6-6 6"/>'
};return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.info}</svg>`;}
export function debounce(fn,ms=250){let id;return (...args)=>{clearTimeout(id);id=setTimeout(()=>fn(...args),ms);};}
