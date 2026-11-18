// Offline cache for the Watch MK1 settings page. After the first visit the page,
// its manifest and icons come from this cache, so it opens with no internet
// (Bluetooth never needed the internet). Bump VERSION when you change any file
// so phones pick up the new copy (they do on the next visit after an update).
// v5: install fetches every file from the network ('reload'), never from the browser's HTTP cache, so a new
// version can not be filled with the old files; the page shows a "new version" prompt when this worker takes over.
// v6: page-open auto-reconnect, darker button red (contrast); no change to what is cached.
// v7: boot welcome messages (new Welcome section); no change to what is cached.
// v8: unsaved welcome text is kept when the watch reports a change; wrong-PIN lockout (5 minutes) is explained; skip-button wording; no change to what is cached.
const VERSION = 'watchmk1-v8';
const PREFIX = 'watchmk1-';
// The Heartbeat Scanner page lives in scanner/ below this one with its own
// service worker. Leave everything under it alone (v3: before this, the watch
// worker could cache the scanner page as its own offline page, and its cleanup
// deleted the scanner's cache).
const SKIP = new URL('scanner/', self.registration.scope).href;
// Only the app's own page is ever kept as the offline page (v4: before this ANY page in scope was, so
// opening README.md, a 404, or .../watch/scanner without its last slash (a redirect) replaced it).
const isAppPage = u => { const x = new URL(u); return x.origin + x.pathname === self.registration.scope || x.origin + x.pathname === self.registration.scope + 'index.html'; };
const FILES = ['./', './index.html', './manifest.webmanifest', './sounds.js', './icons/icon-192.png', './icons/icon-512.png',
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
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin || req.url.startsWith(SKIP)) return;
  if (req.mode === 'navigate') {
    if (!isAppPage(req.url)) return;                 // anything else is a plain network request
    e.respondWith(fetch(req).then(r => {
      if (r.ok && r.type === 'basic') { const copy = r.clone(); e.waitUntil(caches.open(VERSION).then(c => c.put('./index.html', copy))); }
      return r;
    }).catch(() => caches.match('./index.html', { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
