const CACHE='inventarizacija-assets-v023';
const ASSETS=['/','/index.html','/styles.css','/js/app.js','/js/api.js','/js/legacy.js','/js/util.js','/config.js','/assets/mark.svg','/manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 // Never cache authenticated/API traffic, backups, user-selected private data or writes.
 if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/.netlify/')||u.pathname.startsWith('/private'))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&ASSETS.includes(u.pathname)){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));
});
