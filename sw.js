const V='aiet-v5';
const FONTS='https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
const PRE=['https://cdn.tailwindcss.com','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
const CDN=['cdn.tailwindcss.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.allSettled(['./','./index.html','./library.json','./manifest.webmanifest','./icon-192.png','./icon-512.png','./kelimeler.xlsx','./yapilar.xlsx','./yapilar-b1.xlsx'].map(u=>c.add(u)));
    await Promise.allSettled(PRE.map(async u=>{const q=new Request(u,{mode:'no-cors'});c.put(q,await fetch(q));}));
    try{
      const r=await fetch(FONTS);const css=await r.clone().text();await c.put(FONTS,r);
      await Promise.allSettled([...css.matchAll(/url\((https:[^)]+)\)/g)].map(async m=>{const f=await fetch(m[1]);if(f.ok)await c.put(m[1],f);}));
    }catch(_){}
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url),same=u.origin===location.origin;
  if(!same&&!CDN.includes(u.hostname))return;   // API istekleri (Gemini/Claude) hiç dokunulmaz
  e.respondWith(same?netFirst(r):cacheFirst(r));
});
async function netFirst(r){
  const c=await caches.open(V);
  try{const n=await fetch(r);if(n.ok)c.put(r,n.clone());return n;}
  catch(_){return (await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('./index.html'):Response.error());}
}
async function cacheFirst(r){
  const c=await caches.open(V),m=await c.match(r);if(m)return m;
  const n=await fetch(r);if(n.ok||n.type==='opaque')c.put(r,n.clone());return n;
}
