// Pequeñas utilidades compartidas.

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para meterlo en HTML sin riesgos. */
export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);
}

/** Normaliza a NFC: así "ệ" siempre es un único carácter, venga de donde venga el texto. */
export function nfc(texto) {
  return String(texto ?? '').normalize('NFC');
}

/** Texto de explicación con un mínimo de formato: **negrita**. */
export function formatear(texto) {
  return esc(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Devuelve una copia desordenada de la lista. */
export function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function alAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Barra de progreso pixel. */
export function htmlBarra(hechos, total, etiqueta) {
  const pct = total ? Math.round((hechos / total) * 100) : 0;
  return `<div class="barra" role="progressbar" aria-label="${esc(etiqueta)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${hechos}"><span style="width:${pct}%"></span></div>`;
}
