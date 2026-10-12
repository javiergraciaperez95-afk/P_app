// Solo dentro de la APK. Dentro de una app Android el navegador interno no trae la voz que usa la web
// (speechSynthesis), así que aquí se sustituye por la voz del propio teléfono, con la misma forma de uso.
// Solo se usa de reserva: lo normal es que la app reproduzca los audios grabados de cada curso.
// La app web no se entera: sigue llamando a speechSynthesis como siempre.
(() => {
  const voz = window.Capacitor?.Plugins?.TextToSpeech;
  if (!window.Capacitor?.isNativePlatform?.() || !voz) return;

  let voces = [];
  let cola = [];
  let turno = 0; // cambia al cancelar, para ignorar lo que estuviera sonando
  let hablando = false;
  const oyentes = new Set();

  window.SpeechSynthesisUtterance = function (texto) {
    this.text = texto; this.lang = 'es-ES'; this.rate = 1; this.pitch = 1; this.voice = null;
    this.onstart = null; this.onend = null;
  };

  async function siguiente() {
    if (hablando || !cola.length) return;
    const f = cola.shift();
    const mio = turno;
    hablando = true;
    f.onstart?.();
    try {
      await voz.speak({ text: f.text, lang: f.lang || 'es-ES', rate: f.rate || 1, pitch: f.pitch || 1, volume: 1 });
    } catch { /* sin voz o interrumpida */ }
    if (mio !== turno) return;
    hablando = false;
    f.onend?.();
    siguiente();
  }

  const sintesis = {
    getVoices: () => voces,
    speak(f) { cola.push(f); siguiente(); },
    cancel() { turno++; cola = []; hablando = false; voz.stop().catch(() => {}); },
    get speaking() { return hablando; },
    addEventListener(tipo, fn) { if (tipo === 'voiceschanged') oyentes.add(fn); },
    removeEventListener(tipo, fn) { oyentes.delete(fn); },
  };
  Object.defineProperty(window, 'speechSynthesis', { value: sintesis, configurable: true });

  // ¿Qué idiomas sabe leer la voz del teléfono?
  voz.getSupportedLanguages().then(({ languages }) => {
    // Una «voz» por cada idioma que el teléfono sabe leer; la app elige la del curso.
    voces = languages.map(l => ({ name: 'Android', lang: l.replace('_', '-') }));
    oyentes.forEach(fn => fn());
    oyentes.clear();
  }).catch(() => {});
})();
