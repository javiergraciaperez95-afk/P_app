// Solo dentro de la APK. Dentro de una app Android el navegador interno no trae la voz que usa la web
// (speechSynthesis), así que aquí se sustituye por la voz del propio teléfono, con la misma forma de uso.
// La app no lleva audios grabados: esta es la única voz (las palabras, los diálogos y los audios del DELE).
// Si el teléfono no tiene voz para el español, la app lo nota (idiomaDisponible) y enseña el texto.
// Los avisos diarios ya no van aquí: los programa la app (js/avisos.js) con el complemento de notificaciones.
(() => {
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
