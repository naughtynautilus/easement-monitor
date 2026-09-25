/* Service worker: makes the app load with no signal.
   To push an update, change CACHE_VERSION below and re-upload. */
const CACHE_VERSION = 'easement-monitor-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const OPTIONAL = ['https://cdnjs.cloudflare.com/ajax/libs/piexifjs/1.0.6/piexif.min.js'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_VERSION);
    await c.addAll(CORE);
    for (const u of OPTIONAL) { try { await c.add(new Request(u, { mode: 'no-cors' })); } catch (_) {} }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE_VERSION) await caches.delete(k);
    self.clients.claim();
  })());
});
// Cache first, then refresh the cache in the background when online.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE_VERSION);
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response('Offline and not cached', { status: 503 });
  })());
});
