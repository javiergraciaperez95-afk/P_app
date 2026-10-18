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

      // Los textos, en el idioma de la interfaz (inglés o vietnamita; el puente se carga antes que la app).
      const vietnamita = (() => {
        try {
          const elegido = JSON.parse(localStorage.getItem('idiomas-ajustes') ?? '{}').idioma;
          if (elegido === 'vi' || elegido === 'en') return elegido === 'vi';
        } catch { /* sin ajustes */ }
        return (navigator.language ?? '').toLowerCase().startsWith('vi');
      })();
      const TEXTOS = vietnamita
        ? {
          hola: '¡Hola! Chào mừng em đến với Paglot ✨',
          holaCuerpo: 'Lucía đang chờ em. Hôm nay mình học bài tiếng Tây Ban Nha đầu tiên nhé!',
          diario: '🔥 Giữ lửa nhé!',
          diarioCuerpo: 'Một bài học hoặc vài thẻ ôn tập là đủ để giữ chuỗi ngày học của em.',
        }
        : {
          hola: '¡Hola! Welcome to Paglot ✨',
          holaCuerpo: 'Lucía is waiting for you. Take your first step in Spanish today!',
          diario: '🔥 Keep the flame alive!',
          diarioCuerpo: 'One lesson or a few review cards is enough to keep your streak going.',
        };

      // Bienvenida de primer inicio y recordatorio diario (a las 19:00). La marca se guarda antes de pedir
      // permiso para no volver a interrumpir en aperturas posteriores.
      const clavePrimerAviso = 'paglot_welcome_notification_v4';
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
                  title: TEXTOS.hola,
                  body: TEXTOS.holaCuerpo,
                  schedule: { at: new Date(Date.now() + 1000) },
                  isExactNotification: false,
                }, {
                  id: 730010,
                  title: TEXTOS.diario,
                  body: TEXTOS.diarioCuerpo,
                  schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true },
                }],
              });
            } catch (error) {
              localStorage.removeItem(clavePrimerAviso);
              console.warn('No se pudieron programar las notificaciones.', error);
            }
          })();
        }
      } catch (error) {
        console.warn('No se pudo guardar el estado de las notificaciones.', error);
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
