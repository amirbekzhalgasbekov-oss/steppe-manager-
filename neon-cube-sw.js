// Офлайн-кеш для Neon Cube. Отдельный от sw.js (Steppe Manager), чтобы не мешать ему.
// Версию меняем при каждом обновлении игры.
const CACHE = 'neon-cube-v2';
const FILES = ['./Neon_Cube.html', './neon-cube.html', './neon-cube.webmanifest', './neon-cube-icon-192.png', './neon-cube-icon-512.png', './neon-cube-apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // удаляем только свои старые кеши, чужие (Steppe Manager) не трогаем
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('neon-cube-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// сначала сеть (свежая версия), если её нет — сохранённая копия
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./Neon_Cube.html')))
  );
});
