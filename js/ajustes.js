// Preferencias de este dispositivo: idioma, tema, sonidos y voz.
// No se sincronizan: cada dispositivo puede tener las suyas.

export const CLAVE_AJUSTES = 'phuong-ajustes';
// Idiomas de la interfaz: vietnamita (el de siempre) o español (para practicar «en inmersión»).
const IDIOMAS_INTERFAZ = new Set(['vi', 'es']);

/** Idioma preferido por el navegador/WebView (en Capacitor, el del dispositivo Android); si no es ninguno de los dos, vietnamita. */
export function idiomaDispositivo() {
  const preferencias = [...(navigator.languages ?? []), navigator.language ?? ''];
  for (const preferencia of preferencias) {
    const codigo = preferencia.toLowerCase().replaceAll('_', '-').split('-')[0];
    if (IDIOMAS_INTERFAZ.has(codigo)) return codigo;
  }
  return 'vi';
}

const PREDETERMINADOS = {
  // La app es para una estudiante vietnamita: empieza en vietnamita (se cambia en Ajustes).
  idioma: 'vi',
  tema: 'auto',       // auto · oscuro · claro
  efectos: true,      // sonidos 8-bit de la interfaz
  vozTutora: true,    // pitidos mientras habla la tutora
  velocidadVoz: 0.9,  // velocidad de la voz española
  // calma: sin valor sigue a «reducir movimiento» del sistema; true/false si la persona lo elige
  texto: 'normal',    // normal · grande
  recordatorio: null,  // la hora del aviso diario de la APK ('19:00'…), 'no', o null si aún no se ha preguntado
};

let ajustes = cargar();

function cargar() {
  try {
    return { ...PREDETERMINADOS, ...JSON.parse(localStorage.getItem(CLAVE_AJUSTES)) };
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
  window.dispatchEvent(new Event('comodidad-cambiada'));
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
