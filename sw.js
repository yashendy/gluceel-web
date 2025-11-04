const CACHE='gluceel-v1';
const CORE=['./','./index.html','./css/base.css','./js/app.config.js','./js/modules/state.js','./js/modules/ui.js','./js/modules/api.js','./js/modules/auth.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{const url=new URL(e.request.url); if(url.origin===location.origin){ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return res;}).catch(()=>r))); }});
