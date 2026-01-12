const CACHE_NAME = 'cvc-spin-game-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/src/main.js',
  '/src/config.js',
  '/src/data/rimes.js',
  '/src/integration/inputHandlers.js',
  '/src/integration/statePersistence.js',
  '/src/models/GameState.js',
  '/src/models/Question.js',
  '/src/models/Rime.js',
  '/src/models/Word.js',
  '/src/services/achievementService.js',
  '/src/services/audioService.js',
  '/src/services/feedbackService.js',
  '/src/services/gameSettings.js',
  '/src/services/gameStateStore.js',
  '/src/services/questionFactory.js',
  '/src/services/wheelAnimation.js',
  '/src/ui/domBindings.js',
  '/src/ui/viewController.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
