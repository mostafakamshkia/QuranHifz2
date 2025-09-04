const CACHE_NAME = 'wardad-quran-cache-v4'; // غيرنا الإصدار لـ v4 عشان نضمن التحديث

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/surah.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Amiri+Quran&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        self.skipWaiting(); 
        return cache.addAll(CORE_ASSETS);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // الرد من الكاش
        }
        return fetch(event.request).then(response => {
            if(!response || response.status !== 200) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });
            return response;
          }
        );
      })
  );
});

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
    }).then(() => self.clients.claim())
  );
});