// Офлайн-кеш для всего сайта: Steppe Manager, ЗОНА, Neon Cube, Modern Front.
// Один service worker в корне сайта — он управляет всеми страницами.
// Версию меняем при каждом обновлении сайта, чтобы старый кеш не остался.
const CACHE = 'steppe-site-v4';
const FILES = [
  './', './index.html', './manifest.webmanifest', './play.html',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './neon-cube.html', './Neon_Cube.html', './neon-cube.webmanifest',
  './neon-cube-icon-192.png', './neon-cube-icon-512.png', './neon-cube-apple-touch-icon.png',
  './modern-front.html', './modern-front-game.html', './modern-front.webmanifest',
  './modern-front-icon-192.png', './modern-front-icon-512.png', './modern-front-apple-touch-icon.png',
  './modern-front-game.png', './modern-front-start.png'
];

self.addEventListener('install', e => {
  // каждый файл кешируем отдельно: если один недоступен, остальные всё равно сохранятся
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // удаляем старые кеши (включая прежний кеш Neon Cube и Steppe Manager)
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// сначала сеть (свежая версия), если её нет — сохранённая копия
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // шрифты и внешние скрипты — напрямую
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
