// Preferencias de este dispositivo: idioma, tema, sonidos y voz.
// No se sincronizan: cada dispositivo puede tener las suyas.

export const CLAVE_AJUSTES = 'idiomas-ajustes';
const CLAVE_ANTIGUA = 'espanol-ajustes'; // de cuando la app era solo de español
const IDIOMAS_INTERFAZ = new Set(['en', 'vi', 'zh', 'es', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id']);

/** Idioma preferido por el navegador/WebView (en Capacitor, el del dispositivo Android). */
export function idiomaDispositivo() {
  const preferencias = [...(navigator.languages ?? []), navigator.language ?? ''];
  for (const preferencia of preferencias) {
    const codigo = preferencia.toLowerCase().replaceAll('_', '-').split('-')[0];
    if (IDIOMAS_INTERFAZ.has(codigo)) return codigo;
  }
  return 'en';
}

const PREDETERMINADOS = {
  // Automático sigue el idioma del navegador/WebView hasta que la persona elija uno manualmente.
  idioma: 'auto',
  tema: 'auto',       // auto · oscuro · claro
  efectos: true,      // sonidos 8-bit de la interfaz
  vozTutora: true,    // pitidos mientras habla la tutora
  velocidadVoz: 0.9,  // velocidad de la voz española
};

let ajustes = cargar();

function cargar() {
  try {
    return { ...PREDETERMINADOS, ...JSON.parse(localStorage.getItem(CLAVE_AJUSTES) ?? localStorage.getItem(CLAVE_ANTIGUA)) };
  } catch {
    return { ...PREDETERMINADOS };
  }
}

export function ajuste(nombre) {
  return ajustes[nombre];
}

export function cambiarAjuste(nombre, valor) {
  ajustes = { ...ajustes, [nombre]: valor };
  try { localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes)); } catch { /* sin almacenamiento */ }
  if (nombre === 'tema') aplicarTema();
  if (nombre === 'efectos') window.dispatchEvent(new Event('efectos-cambiado'));
}

const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)');

export function temaActual() {
  if (ajustes.tema === 'auto') return sistemaOscuro.matches ? 'oscuro' : 'claro';
  return ajustes.tema;
}

export function aplicarTema() {
  const tema = temaActual();
  document.documentElement.dataset.tema = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'oscuro' ? '#14111c' : '#efe4cc');
  window.dispatchEvent(new Event('tema-cambiado'));
}

sistemaOscuro.addEventListener('change', () => {
  if (ajustes.tema === 'auto') aplicarTema();
});
