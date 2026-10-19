const CACHE_NAME = 'egat-map-cache-v11';

const urlsToCache = [
  './',
  './index.html'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ลบ Cache รุ่นเก่า
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// โหลดหน้าเว็บใหม่ก่อน หากมีอินเทอร์เน็ต
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ไฟล์อื่นใช้ Cache ก่อน ถ้าไม่มีจึงโหลดจาก Network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
