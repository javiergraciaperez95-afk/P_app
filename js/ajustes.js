// Preferencias de este dispositivo: idioma, tema, sonidos y voz.
// No se sincronizan: cada dispositivo puede tener las suyas.

export const CLAVE_AJUSTES = 'idiomas-ajustes';
const CLAVE_ANTIGUA = 'espanol-ajustes'; // de cuando la app era solo de español
// Idiomas ofrecidos de momento (el resto de traducciones existe, pero está oculto).
const IDIOMAS_INTERFAZ = new Set(['en', 'vi']);

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
  // calma: sin valor sigue a «reducir movimiento» del sistema; true/false si la persona lo elige
  texto: 'normal',    // normal · grande
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
  if (nombre === 'calma' || nombre === 'texto') aplicarComodidad();
}

const pideQuietud = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Modo calma: sin animaciones ni sonidos de adorno. Si no se ha elegido, sigue a «reducir movimiento». */
export function modoCalma() {
  return ajustes.calma ?? pideQuietud.matches;
}

/** Pone html.modo-calma y html.texto-grande (index.html ya lo hace antes de pintar; esto es para los cambios). */
export function aplicarComodidad() {
  const raiz = document.documentElement;
  raiz.classList.toggle('modo-calma', modoCalma());
  raiz.classList.toggle('texto-grande', ajustes.texto === 'grande');
}

pideQuietud.addEventListener?.('change', () => {
  if (ajustes.calma == null) aplicarComodidad();
});

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
