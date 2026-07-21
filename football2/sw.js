// ============================================================
// SERVICE WORKER ДЛЯ PWA
// ============================================================

const CACHE_NAME = 'predictions-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/data/matches.json',
  '/data/predictions.json',
  '/data/users.json',
  '/data/real-scores.json'
];

// Установка - кэшируем файлы
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Кэширование файлов...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// Активация - удаляем старый кэш
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(function() {
      return self.clients.claim();
    })
  );
});

// Перехват запросов - отдаём из кэша, если есть
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Если есть в кэше - отдаём
        if (response) {
          return response;
        }
        // Иначе идём в сеть
        return fetch(event.request)
          .then(function(response) {
            // Проверяем, что ответ валидный
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Кэшируем новый файл
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(function() {
            // Если офлайн и файла нет в кэше
            return new Response('Страница недоступна офлайн', {
              status: 503,
              statusText: 'Offline'
            });
          });
      })
  );
});

// Сообщение об обновлении
self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});