// Preferencias de este dispositivo: tema, sonidos y voz.
// No se sincronizan: cada dispositivo puede tener las suyas.

const CLAVE = 'noruego-ajustes';

const PREDETERMINADOS = {
  tema: 'auto',       // auto · oscuro · claro
  efectos: true,      // sonidos 8-bit de la interfaz
  vozTutora: true,    // pitidos mientras habla la tutora
  velocidadVoz: 0.9,  // velocidad de la voz noruega
};

let ajustes = cargar();

function cargar() {
  try {
    return { ...PREDETERMINADOS, ...JSON.parse(localStorage.getItem(CLAVE)) };
  } catch {
    return { ...PREDETERMINADOS };
  }
}

export function ajuste(nombre) {
  return ajustes[nombre];
}

export function cambiarAjuste(nombre, valor) {
  ajustes = { ...ajustes, [nombre]: valor };
  try { localStorage.setItem(CLAVE, JSON.stringify(ajustes)); } catch { /* sin almacenamiento */ }
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
