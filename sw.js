// Guarda una copia de lo que se va abriendo para que la app instalada funcione sin conexión.
// Siempre intenta primero la red (así nunca enseña una versión vieja); la copia solo se usa si no hay conexión.
const COPIA = 'idiomas-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', evento => evento.waitUntil(self.clients.claim()));

self.addEventListener('fetch', evento => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== location.origin) return;
  evento.respondWith(
    fetch(peticion)
      .then(respuesta => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(COPIA).then(c => c.put(peticion, copia));
        }
        return respuesta;
      })
      .catch(() => caches.match(peticion, { ignoreSearch: peticion.mode === 'navigate' }).then(r => r || Response.error())),
  );
});
