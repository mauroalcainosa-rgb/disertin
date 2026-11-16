/* Disertín · service worker: la app funciona sin internet.
   Al publicar una nueva versión, cambia VERSION para que los equipos descarguen los archivos nuevos. */
const VERSION = 'disertin-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/fonts.css', './politica-privacidad.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png',
  './fonts/fredoka-latin-400-normal.woff2', './fonts/fredoka-latin-500-normal.woff2',
  './fonts/fredoka-latin-600-normal.woff2', './fonts/fredoka-latin-700-normal.woff2',
  './fonts/baloo-2-latin-500-normal.woff2', './fonts/baloo-2-latin-700-normal.woff2',
  './fonts/patrick-hand-latin-400-normal.woff2',
  './fonts/comic-neue-latin-400-normal.woff2', './fonts/comic-neue-latin-700-normal.woff2',
  './lib/html2canvas.min.js', './lib/jspdf.umd.min.js', './lib/jszip.min.js', './lib/pptxgen.bundle.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // La página principal: primero la red (para recibir actualizaciones), si no hay internet, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
