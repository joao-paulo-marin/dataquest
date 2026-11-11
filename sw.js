/* DATAQUEST: service worker para uso offline.
   O app e as bibliotecas ficam em cache; os dados do Supabase sempre vão pela rede. */
const VERSION = '20261111193650';
const CACHE = 'dataquest-' + VERSION;
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];
const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.108.1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(SHELL);
    try { await cache.add(CDN); } catch (e) { /* sem internet na instalação: a biblioteca entra no cache depois */ }
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dataquest-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => { if (event.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/\.supabase\.(co|in)$/.test(url.hostname)) return; // dados e login: sempre pela rede

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }

  const cacheable = url.origin === self.location.origin || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
  if (!cacheable) return;
  event.respondWith(caches.match(req).then((hit) => {
    const network = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || network;
  }));
});
