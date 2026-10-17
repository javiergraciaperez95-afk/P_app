// Solo dentro de la APK. Dentro de una app Android el navegador interno no trae la voz que usa la web
// (speechSynthesis), así que aquí se sustituye por la voz del propio teléfono, con la misma forma de uso.
// La app no lleva audios grabados: esta es la única voz. Si el teléfono no tiene voz para el idioma del curso,
// la app lo nota (idiomaDisponible) y queda en modo de solo lectura.
// La app web no se entera: sigue llamando a speechSynthesis como siempre.
(() => {
  // El puente se incluye solo en la APK, nunca en la versión web.
  if (window.Capacitor?.isNativePlatform?.()) {
    // Capacitor inyecta las APIs nativas estáticas en Plugins; registerPlugin
    // solo existe en la integración con módulos/bundlers de la web.
    const notificaciones = window.Capacitor?.Plugins?.LocalNotifications;
    if (notificaciones) {
      window.PaglotLocalNotifications = notificaciones;

      // Bienvenida de primer inicio. La marca se guarda antes de solicitar
      // permiso para no volver a interrumpir al usuario en aperturas posteriores.
      const clavePrimerAviso = 'paglot_welcome_notification_v3';
      try {
        if (!localStorage.getItem(clavePrimerAviso)) {
          localStorage.setItem(clavePrimerAviso, 'attempted');
          void (async () => {
            try {
              let permiso = await notificaciones.checkPermissions();
              if (permiso.display !== 'granted') {
                permiso = await notificaciones.requestPermissions();
              }
              if (permiso.display !== 'granted') return;

              await notificaciones.schedule({
                notifications: [{
                  id: 730002,
                  title: '¡Bienvenido a Paglot! ✨',
                  body: 'Tu próxima aventura empieza aquí. Elige un idioma y da hoy tu primer paso.',
                  largeBody: 'Tu próxima aventura empieza aquí. Elige un idioma, conoce a tu tutora pixelada y disfruta de tu primera lección. ¡Cada palabra nueva cuenta!',
                  schedule: { at: new Date(Date.now() + 1000) },
                  isExactNotification: false,
                }],
              });
            } catch (error) {
              localStorage.removeItem(clavePrimerAviso);
              console.warn('No se pudo mostrar la notificación de prueba.', error);
            }
          })();
        }
      } catch (error) {
        console.warn('No se pudo guardar el estado de la notificación de prueba.', error);
      }
    }
  }

  const voz = window.Capacitor?.Plugins?.TextToSpeech;
  if (!window.Capacitor?.isNativePlatform?.() || !voz) return;

  let voces = [];
  let cola = [];
  let turno = 0; // cambia al cancelar, para ignorar lo que estuviera sonando
  let hablando = false;
  const oyentes = new Set();

  window.SpeechSynthesisUtterance = function (texto) {
    this.text = texto; this.lang = 'es-ES'; this.rate = 1; this.pitch = 1; this.volume = 1; this.voice = null;
    this.onstart = null; this.onend = null; this.onerror = null;
  };

  async function siguiente() {
    if (hablando || !cola.length) return;
    const f = cola.shift();
    const mio = turno;
    hablando = true;
    f.onstart?.();
    let fallo = false;
    try {
      await voz.speak({ text: f.text, lang: f.lang || 'es-ES', rate: f.rate || 1, pitch: f.pitch || 1, volume: f.volume ?? 1 });
    } catch { fallo = true; }
    if (mio !== turno) return; // se canceló mientras sonaba
    hablando = false;
    if (fallo) {
      // El teléfono no ha podido leerlo: se avisa a la app y se deja lo que quedara en cola.
      cola = [];
      f.onerror?.({ error: 'synthesis-failed' });
      return;
    }
    f.onend?.();
    siguiente();
  }

  const avisar = () => oyentes.forEach(fn => { try { fn(); } catch { /* cada oyente, lo suyo */ } });

  /** Pregunta al teléfono qué idiomas sabe leer y prepara una «voz» por cada uno. */
  function cargarVoces() {
    return voz.getSupportedLanguages().then(({ languages }) => {
      voces = languages.map(l => ({ name: 'Android', lang: l.replace('_', '-'), localService: true }));
      avisar();
    }).catch(() => {});
  }

  const sintesis = {
    getVoices: () => voces,
    speak(f) { cola.push(f); siguiente(); },
    cancel() { turno++; cola = []; hablando = false; voz.stop().catch(() => {}); },
    get speaking() { return hablando; },
    addEventListener(tipo, fn) { if (tipo === 'voiceschanged') oyentes.add(fn); },
    removeEventListener(tipo, fn) { oyentes.delete(fn); },
    /** ¿Puede el teléfono leer este idioma ahora mismo (voz instalada)? Lo usa js/sonidos.js. */
    idiomaDisponible: idioma => cargarVoces()
      .then(() => voz.isLanguageSupported({ lang: idioma }))
      .then(r => Boolean(r?.supported)),
    /** Abre la pantalla del teléfono donde se instalan las voces. */
    instalarVoces: () => voz.openInstall().catch(() => {}),
  };
  Object.defineProperty(window, 'speechSynthesis', { value: sintesis, configurable: true });

  cargarVoces();
})();
