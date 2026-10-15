const CACHE = "persona-v1";
const CORE = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// network-first for the app (so updates land), cache fallback offline; cache-first for fonts
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(e.request.url);
  e.respondWith(font
    ? caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; }))
    : fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
