// Guarda una copia de lo que se va abriendo para que la app instalada funcione sin conexión.
// Siempre intenta primero la red (así nunca enseña una versión vieja); la copia solo se usa si no hay conexión.
// El nombre de la copia lleva la versión: al publicar, __VERSION__ se cambia (ver _herramientas/publicar.py)
// y al activarse una versión nueva se borran las copias de las anteriores.
const COPIA = 'paglot-__VERSION__';
// Lo mínimo para abrir la app sin conexión; se guarda al instalar, pidiéndolo de nuevo a la red.
const CAPARAZON = ['./', 'index.html', 'manifest.webmanifest', 'assets/logo.svg', 'assets/favicon.svg'];
// Número máximo de respuestas guardadas; al pasarlo se borran las más antiguas.
const LIMITE = 600;

self.addEventListener('install', evento => evento.waitUntil(
  caches.open(COPIA)
    .then(c => c.addAll(CAPARAZON.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()),
));
self.addEventListener('activate', evento => evento.waitUntil(
  caches.keys()
    .then(nombres => Promise.all(nombres.filter(nombre => nombre !== COPIA).map(nombre => caches.delete(nombre))))
    .then(() => self.clients.claim()),
));

// Guarda una respuesta y, si la copia pasa del límite, borra las entradas más antiguas.
async function guardar(peticion, respuesta) {
  const c = await caches.open(COPIA);
  await c.put(peticion, respuesta);
  const claves = await c.keys();
  for (const vieja of claves.slice(0, Math.max(0, claves.length - LIMITE))) await c.delete(vieja);
}

self.addEventListener('fetch', evento => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== location.origin) return;
  evento.respondWith(
    fetch(peticion)
      .then(respuesta => {
        // si el navegador no deja guardar (por ejemplo, sin espacio), se sigue sin copia
        if (respuesta.ok) guardar(peticion, respuesta.clone()).catch(() => {});
        return respuesta;
      })
      .catch(() => caches.match(peticion, { ignoreSearch: peticion.mode === 'navigate' }).then(r => r || Response.error())),
  );
});
