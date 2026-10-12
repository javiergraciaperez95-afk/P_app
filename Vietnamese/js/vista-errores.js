// Recuadros rojos con los errores de una lección (sitio exacto incluido).

import { esc } from './util.js';

export function htmlErrores(lec, errores = lec.errores) {
  if (!errores?.length) return '';
  const titulo = lec.roto ? 'No se puede abrir' : 'Hay que revisar';
  return `
    <section class="caja errores bloque" role="alert">
      <h2>⚠ ${titulo}: lecciones/${esc(lec.id)}.json</h2>
      ${htmlLista(errores)}
    </section>`;
}

export function htmlBloqueError(b) {
  return `
    <section class="caja errores bloque">
      <h2>⚠ El bloque ${b.n} no se puede mostrar</h2>
      ${htmlLista(b.errores)}
    </section>`;
}

export function htmlAvisos(lec) {
  if (!lec.avisos?.length) return '';
  return `
    <details class="caja avisos bloque">
      <summary>Notas para quien escribe la lección (${lec.avisos.length})</summary>
      <ul>${lec.avisos.map((a) => `<li><strong>${esc(a.donde)}:</strong> ${esc(a.mensaje)}</li>`).join('')}</ul>
    </details>`;
}

function htmlLista(errores) {
  return `<ul>${errores.map((e) => `
    <li>
      <strong>${esc(e.donde)}:</strong> ${esc(e.mensaje)}
      ${e.extracto ? htmlExtracto(e.extracto) : ''}
      ${e.tecnico ? `<details><summary>Mensaje técnico</summary><code>${esc(e.tecnico)}</code></details>` : ''}
    </li>`).join('')}</ul>`;
}

function htmlExtracto(x) {
  const ancho = String(x.linea).length;
  const filas = [];
  if (x.anterior != null) filas.push(`${String(x.linea - 1).padStart(ancho)} │ ${x.anterior}`);
  filas.push(`${String(x.linea).padStart(ancho)} │ ${x.texto}`);
  filas.push(`${' '.repeat(ancho)} │ ${' '.repeat(Math.max(0, x.col - 1))}^ aquí`);
  return `<pre class="extracto">${esc(filas.join('\n'))}</pre>
    <p class="pista">El fallo suele estar justo en ese punto o al final de la línea anterior.</p>`;
}
