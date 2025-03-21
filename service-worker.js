// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";  // Assurez-vous que ce fichier existe dans votre projet

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        // Cache the offline page during install
        return cache.add(offlineFallbackPage);
      })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        // Si une réponse préchargée existe, on la retourne
        if (preloadResp) {
          return preloadResp;
        }

        // Sinon, on fait une tentative de récupération réseau
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // En cas d'erreur (hors ligne), on retourne la page hors ligne depuis le cache
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        if (cachedResp) {
          return cachedResp;
        }

        // Si la page hors ligne n'est pas dans le cache, renvoyer une réponse d'erreur
        return new Response('Page non disponible, veuillez vérifier votre connexion.', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })());
  }
});
