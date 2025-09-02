// Service Worker เป็นไฟล์ที่ทำให้เว็บแอปทำงานแบบออฟไลน์ได้
const CACHE_NAME = 'maps-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// เหตุการณ์เมื่อ Service Worker ถูกติดตั้ง
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// เหตุการณ์เมื่อมีการร้องขอจากเครือข่าย
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // คืนค่าจาก cache หากพบ
                if (response) {
                    return response;
                }
                // ถ้าไม่พบ ให้ไปดึงจากเครือข่าย
                return fetch(event.request);
            })
    );
});

// เหตุการณ์เมื่อ Service Worker ใหม่เข้ามาแทนที่
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
