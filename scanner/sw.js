// Offline copy of the Heartbeat Scanner page. Lives in /watch/scanner/, so its scope
// is /watch/scanner/ only: it never handles the Watch MK1 page at /watch/, and it
// only ever deletes its OWN old caches ("hbscan-..."), never the watch's.
// Bump VERSION whenever a file here changes so phones pick up the new copy.
// v3: install fetches every file from the network ('reload'), never from the browser's HTTP cache, so a new
// version can not be filled with the old files; the page shows a "new version" prompt when this worker takes over.
// v4: page-open auto-reconnect; no change to what is cached.
// v5: Brightness drives the real backlight on a screen that has a backlight pin (page note follows GET "backlight"); no change to what is cached.
const VERSION = 'hbscan-v6';
const PREFIX = 'hbscan-';
// Only the app's own page is ever kept as the offline page (v2: before this ANY page in scope was, so a 404
// or an odd address replaced it).
const isAppPage = u => { const x = new URL(u); return x.origin + x.pathname === self.registration.scope || x.origin + x.pathname === self.registration.scope + 'index.html'; };
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
    // tell the pages this worker now controls which version it is: a page that is older than that offers a reload
    .then(() => self.clients.matchAll()).then(cs => cs.forEach(c => c.postMessage({ type: 'sw-version', version: VERSION.slice(PREFIX.length) }))));
});
// Page: network first (so updates arrive), cache when offline. Everything else: cache first.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  if (req.mode === 'navigate') {
    if (!isAppPage(req.url)) return;                 // anything else is a plain network request
    e.respondWith(fetch(req).then(r => {
      if (r.ok && r.type === 'basic') { const copy = r.clone(); e.waitUntil(caches.open(VERSION).then(c => c.put('./index.html', copy))); }
      return r;
    }).catch(() => caches.open(VERSION).then(c => c.match('./index.html', { ignoreSearch: true }))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true })).then(hit => hit || fetch(req)));
});
