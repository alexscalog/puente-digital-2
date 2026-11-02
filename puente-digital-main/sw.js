/**
 * Puente Digital 2.0 - Service Worker (sw.js)
 * Permite el uso offline de cursos, lecciones y simuladores sin conexión a Internet.
 */

const CACHE_NAME = 'puente-digital-v9';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/mobile.css',
  './js/firebase-config.js',
  './js/storage-service.js',
  './js/test-firebase.js',
  './js/ai-service.js',
  './js/courses-data.js',
  './js/app.js',
  './js/mobile.js',
  './assets/favicon.svg',
  './assets/logo-puente-digital.svg',
  './assets/hero-seniors.jpg',
  './assets/team-rony-nueva.jpg',
  './assets/team-tomas.jpg',
  './assets/team-adrian-nueva.jpg',
  './assets/team-alexandro.jpg',
  './assets/team-valeria.jpg'
];

// Instalación y pre-cacheo de recursos estáticos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Puente Digital SW: Cacheando recursos estáticos (v9)...');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Puente Digital SW: Error parcial al cachear recursos:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza inmediata de versiones de caché anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Puente Digital SW: Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listener Fetch: Interceptación exclusiva de recursos locales del mismo origen
self.addEventListener('fetch', (event) => {
  const reqUrl = (event.request && event.request.url) ? event.request.url : '';

  // 1. Exclusión estricta de servicios externos de Firebase, Google Cloud APIs y CDN
  // Bajo ningún concepto el Service Worker debe interceptar canales de streaming o gRPC (/Write/channel, etc.)
  if (
    reqUrl.includes('firestore.googleapis.com') ||
    reqUrl.includes('firebaseio.com') ||
    reqUrl.includes('identitytoolkit.googleapis.com') ||
    reqUrl.includes('securetoken.googleapis.com') ||
    reqUrl.includes('gstatic.com') ||
    reqUrl.includes('googleapis.com')
  ) {
    return; // Dejar que el navegador maneje la petición por red directamente
  }

  // 2. Solo interceptar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Solo interceptar peticiones que pertenezcan estrictamente al mismo origen (self.location.origin)
  let url;
  try {
    url = new URL(reqUrl);
  } catch (e) {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  // Omitir peticiones no HTTP/HTTPS (extensiones del navegador, chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 4. Peticiones locales del mismo origen: Cache-First con fallback a Red
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si existe en caché, retornarlo de inmediato
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en caché, ir a la red
        return fetch(event.request).then((networkResponse) => {
          // Cachear dinámicamente si la respuesta es válida y del mismo origen
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'default')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Bloque catch: fallback solo si la red realmente falló (modo offline)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html').then((fallbackHtml) => {
            return fallbackHtml || new Response('<h1>Sin conexión</h1><p>Estás navegando en modo sin conexión.</p>', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        }

        // Para recursos estáticos locales que fallaron en la red y no estaban en caché:
        // NUNCA retornar undefined para evitar "TypeError: Failed to convert value to 'Response'"
        return new Response('Recurso no disponible sin conexión a internet', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});
