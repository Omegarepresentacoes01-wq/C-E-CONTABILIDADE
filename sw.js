const CACHE_NAME = 'ce-contabilidade-v2';

// Recursos estáticos fundamentais (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// URLs externas conhecidas que devem ser cacheadas para funcionamento offline
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/2910/2910795.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Domínios permitidos para cache dinâmico (Imports do React, Lucide, etc)
const ALLOWED_DOMAINS = [
  'aistudiocdn.com',
  'fonts.gstatic.com',
  'cdn-icons-png.flaticon.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tenta cachear os assets estáticos e externos conhecidos
        return cache.addAll([...STATIC_ASSETS, ...EXTERNAL_ASSETS]);
      })
      .then(() => self.skipWaiting())
  );
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Estratégia: Cache First, Network Fallback para recursos estáticos e CDNs conhecidos
  if (
    STATIC_ASSETS.includes(url.pathname) || 
    EXTERNAL_ASSETS.includes(event.request.url) ||
    ALLOWED_DOMAINS.some(domain => url.hostname.includes(domain))
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          // Se não estiver no cache, busca na rede e salva no cache
          return fetch(event.request)
            .then((networkResponse) => {
              // Verifica se a resposta é válida antes de cachear
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                return networkResponse;
              }

              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return networkResponse;
            })
            .catch(() => {
              // Fallback opcional para quando estiver offline e sem cache (ex: imagem placeholder)
              return new Response('Offline');
            });
        })
    );
  } else {
    // Estratégia Network First para outras requisições (API, etc, se houver)
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});