const CACHE_NAME = 'egat-map-cache-v1';
const urlsToCache = [
  './',
  './index.html'
];

// ติดตั้ง Service Worker และจำลองเก็บหน้าเว็บพื้นฐาน
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// เรียกใช้งานไฟล์จากระบบ Cache เพื่อความรวดเร็ว
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
