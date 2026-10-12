// Estrellas ☆/★ para guardar palabras en el cuaderno.
// Cualquier botón .estrella de la página funciona solo (un único escuchador para todos).

import { esc } from './util.js';
import { clave } from './frases.js';
import { estaGuardada, alternar } from './cuaderno.js';
import { bocadillo } from './tutora.js';
import { sonido } from './sonido.js';

/**
 * HTML de una estrella. conTexto: muestra «Guardar» / «Guardada» al lado.
 * ejemplo: { vi, es } de la frase donde aparece la palabra (opcional).
 */
export function htmlEstrella(e, leccion = '', conTexto = false, ejemplo = null) {
  let atributos = `data-clave="${esc(clave(e.vi))}" data-vi="${esc(e.vi)}" data-es="${esc(e.es)}" data-pron="${esc(e.pron || '')}" data-nota="${esc(e.nota || '')}" data-leccion="${esc(leccion)}"`;
  if (ejemplo?.vi) atributos += ` data-ejemplo-vi="${esc(ejemplo.vi)}" data-ejemplo-es="${esc(ejemplo.es || '')}"`;
  return `<button type="button" class="estrella${conTexto ? ' estrella-texto' : ''}" ${atributos}></button>`;
}

export function iniciarMarcado() {
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest?.('.estrella');
    if (!btn) return;
    ev.stopPropagation();
    const d = btn.dataset;
    const ejemplo = d.ejemploVi ? { vi: d.ejemploVi, es: d.ejemploEs } : null;
    const guardada = alternar({ vi: d.vi, es: d.es, pron: d.pron, nota: d.nota }, d.leccion, ejemplo);
    if (guardada) {
      sonido.acierto();
      bocadillo(`«${d.vi}» apuntada en tu cuaderno. Ya me encargo yo de que no se te olvide.`, 'contenta');
    } else {
      sonido.clic();
      bocadillo(`He quitado «${d.vi}» del cuaderno.`, 'normal');
    }
  }, true);
  document.addEventListener('cuaderno-cambio', refrescarEstrellas);
  // Pinta las estrellas nuevas que aparezcan (cambios de pantalla, globo…)
  const observador = new MutationObserver(refrescarEstrellas);
  for (const id of ['principal', 'globo']) {
    observador.observe(document.getElementById(id), { childList: true, subtree: true });
  }
}

let pendiente = false;
function refrescarEstrellas() {
  if (pendiente) return;
  pendiente = true;
  queueMicrotask(() => {
    pendiente = false;
    for (const btn of document.querySelectorAll('.estrella')) {
      const si = estaGuardada(btn.dataset.vi);
      const texto = btn.classList.contains('estrella-texto');
      const nuevo = si ? (texto ? '★ En el cuaderno' : '★') : (texto ? '☆ Guardar' : '☆');
      if (btn.textContent !== nuevo) btn.textContent = nuevo;
      btn.setAttribute('aria-pressed', String(si));
      btn.setAttribute('aria-label', si ? `Quitar «${btn.dataset.vi}» del cuaderno` : `Guardar «${btn.dataset.vi}» en el cuaderno`);
    }
  });
}
