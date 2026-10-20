// Pequeñas ayudas para crear elementos HTML sin escribir HTML a mano.

/**
 * Crea un elemento.
 * el('p', { class: 'x', onclick: fn }, 'texto', otroElemento)
 */
export function el(etiqueta, atributos = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (clave.startsWith('on') && typeof valor === 'function') {
      nodo.addEventListener(clave.slice(2), valor);
    } else if (clave === 'class') {
      nodo.className = valor;
    } else if (valor === true) {
      nodo.setAttribute(clave, '');
    } else {
      nodo.setAttribute(clave, valor);
    }
  }
  for (const hijo of hijos.flat()) {
    if (hijo === undefined || hijo === null || hijo === false) continue;
    nodo.append(hijo instanceof Node ? hijo : String(hijo));
  }
  return nodo;
}

/** Convierte «**negrita**» en <strong>. Devuelve una lista de nodos. */
export function enLinea(texto) {
  const partes = String(texto).split(/\*\*(.+?)\*\*/g);
  return partes.flatMap((parte, i) => (i % 2 === 1 ? [el('strong', {}, parte)] : cursivas(parte)));
}
// *así* (un asterisco a cada lado, pegado a la palabra) va en cursiva: son los ejemplos dentro de una explicación
function cursivas(texto) {
  const trozos = texto.split(/(?<![\p{L}\p{N}*])\*([^*\s](?:[^*]*?[^*\s])?)\*(?![\p{L}\p{N}*])/gu);
  return trozos.map((t, i) => (i % 2 === 1 ? el('em', { class: 'cursiva' }, t) : t)).filter(t => t !== '');
}

/**
 * Texto con formato mínimo:
 * - una línea en blanco separa párrafos;
 * - las líneas que empiezan por «- » forman una lista;
 * - **así** se escribe en negrita y *así* en cursiva.
 */
export function textoConFormato(texto) {
  const fragmento = document.createDocumentFragment();
  const parrafos = Array.isArray(texto) ? texto : String(texto).split(/\n\s*\n/);
  for (const parrafo of parrafos) {
    const lineas = String(parrafo).split('\n').map(l => l.trim()).filter(Boolean);
    // las líneas seguidas que empiezan por «- » son una lista y las demás, un párrafo. Pueden ir en el mismo bloque
    // («Así:» y debajo la lista): antes todo se juntaba en un párrafo con los guiones dentro
    let texto = [];
    let lista = [];
    const cerrarTexto = () => { if (texto.length) fragmento.append(el('p', {}, enLinea(texto.join(' ')))); texto = []; };
    const cerrarLista = () => { if (lista.length) fragmento.append(el('ul', {}, lista.map(l => el('li', {}, enLinea(l))))); lista = []; };
    for (const l of lineas) {
      if (l.startsWith('- ')) { cerrarTexto(); lista.push(l.slice(2)); } else { cerrarLista(); texto.push(l); }
    }
    cerrarTexto();
    cerrarLista();
  }
  return fragmento;
}

/** Baraja una copia de la lista. */
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

/** Como replaceChildren, pero ignora los huecos (null, false, ''). */
export function poner(nodo, ...hijos) {
  nodo.replaceChildren(...hijos.flat().filter(h => h !== null && h !== undefined && h !== false && h !== ''));
}
