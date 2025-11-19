const CACHE_NAME = 'alertas-viales-v2';
const RUNTIME_CACHE = 'alertas-runtime-v2';
const IMAGE_CACHE = 'alertas-images-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install - cache static resources
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('Cache install failed:', err))
  );
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Origins del backend donde NO queremos interceptar las peticiones API.
// De esta forma, las llamadas al backend (Render, localhost) van directo a la red
// y no devolvemos respuestas "offline" falsas para /api/**.
const API_BACKEND_ORIGINS = [
  'https://roadwarningsnarino-backend.onrender.com',
  'http://localhost:8080',
];

// Fetch - Network First para API del propio origen, Cache First para recursos estáticos.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Si la petición va al backend externo (Render o localhost:8080), no la interceptamos.
  // Dejamos que el navegador la maneje normalmente para evitar respuestas 503 "Sin conexión".
  if (API_BACKEND_ORIGINS.includes(url.origin) && url.pathname.startsWith('/api/')) {
    return;
  }

  // API requests del MISMO origen - Network First with cache fallback
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline page for failed API requests
            return new Response(
              JSON.stringify({ error: 'Sin conexión a internet' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Images - Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Static resources - Cache First with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        // Cache new resources
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Background sync for offline alert creation
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncAlerts());
  }
});

async function syncAlerts() {
  // Retrieve pending alerts from IndexedDB and sync when online
  console.log('Background sync: syncing alerts...');
  // Implementation would go here
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Nueva Alerta Vial';
  const options = {
    body: data.body || 'Se ha reportado una nueva alerta',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'view', title: 'Ver alerta' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
