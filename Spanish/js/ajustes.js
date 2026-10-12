// Preferencias de este dispositivo: idioma, tema, sonidos y voz.
// No se sincronizan: cada dispositivo puede tener las suyas.

export const CLAVE_AJUSTES = 'espanol-ajustes';

const PREDETERMINADOS = {
  // Idioma de la interfaz: vietnamita si el navegador está en vietnamita; si no, inglés.
  idioma: /^vi\b/i.test(navigator.language ?? '') ? 'vi' : /^zh\b/i.test(navigator.language ?? '') ? 'zh' : 'en',
  tema: 'auto',       // auto · oscuro · claro
  efectos: true,      // sonidos 8-bit de la interfaz
  vozTutora: true,    // pitidos mientras habla la tutora
  velocidadVoz: 0.9,  // velocidad de la voz española
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
