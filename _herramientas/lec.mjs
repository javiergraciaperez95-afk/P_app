// Compilador de lecciones: un archivo compacto .lec  →  lessons/NNN.json + 12 traducciones.
//
// Uso:
//   node _herramientas/lec.mjs compilar es 041 042     compila _herramientas/fuente/es/NNN.lec y valida
//   node _herramientas/lec.mjs descompilar es 001 002  crea el .lec desde los JSON existentes
//   node _herramientas/lec.mjs probar es 001 002       descompila y recompila en memoria y compara (no escribe)
//   (sin números = todas las que haya)
//
// FORMATO .lec  (ver _herramientas/FORMATO_LEC.txt)
//   id 041 / capitulo 8 / nivel A2
//   palabras                      una por línea:  nombre | pron | cat | genero      (propios:  nombre | propio)
//   bloques                       b1 explicacion · b2 dialogo · b3 vocabulario a; b · b4 gramatica ·
//                                 b5 texto · b6 test 1 0 0 · b7 huecos 1 0 0 · b8 ordenar · b9 escribir A || B
//     dialogo:  quien | b [SUJ Pablo] [PRED [V llega] [CCL [PREP a] [TERM casa.]]]
//     texto:    0 | b ...            (el número es el párrafo)
//     gramatica:  b ...
//   == en                         una sección por idioma, líneas «clave: texto»
//
// ÁRBOL: [FUNC palabras] es una hoja; [FUNC hijo hijo] una rama.
//   FUNC*      núcleo = el propio texto       FUNC:núcleo   núcleo explícito (_ = espacio)
//   La puntuación va pegada a las palabras, como en el texto normal. El texto de cada rama
//   se calcula solo, y la frase en español (bN.fM.texto) también: no se escribe dos veces.
//   «b» = bimembre (el sujeto se deduce: con SUJ es expreso, sin SUJ omitido), «u» = unimembre.
//   Si hace falta que el texto español sea otro, se añade al final:  => texto exacto

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', 'Idiomas');
const FUENTE = join(AQUI, 'fuente');
const IDIOMAS = ['en', 'es', 'vi', 'zh', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id'];

const soloPalabras = t => String(t ?? '')
  .toLowerCase()
  .replace(/[«»"'“”‘’]/g, '')
  .replace(/[.,;:¿?¡!()—–-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// ---------------------------------------------------------------------------
// Árbol compacto  <->  unidades JSON
// ---------------------------------------------------------------------------
function parsearArbol(src, donde) {
  const toks = src.match(/\[|\]|[^\s\[\]]+/g) ?? [];
  let i = 0;
  const unidad = () => {
    if (toks[i] !== '[') throw new Error(`${donde}: se esperaba «[» y hay «${toks[i] ?? 'fin'}»`);
    i++;
    const cab = toks[i++] ?? '';
    const m = /^([A-Z]+)(\*)?(?::(.+))?$/.exec(cab);
    if (!m) throw new Error(`${donde}: cabecera de unidad no válida «${cab}»`);
    const hijos = [], palabras = [];
    while (i < toks.length && toks[i] !== ']') {
      if (toks[i] === '[') hijos.push(unidad()); else palabras.push(toks[i++]);
    }
    if (toks[i] !== ']') throw new Error(`${donde}: falta «]» en «${cab}»`);
    i++;
    if (hijos.length && palabras.length) throw new Error(`${donde}: «${cab}» mezcla palabras y subunidades`);
    if (!hijos.length && !palabras.length) throw new Error(`${donde}: «${cab}» está vacía`);
    const nuc = m[3] ? m[3].replace(/_/g, ' ') : undefined;
    if (hijos.length) {
      if (m[2]) throw new Error(`${donde}: «${cab}»: «*» solo vale en hojas`);
      const u = { funcion: m[1], texto: hijos.map(h => h.texto).join(' ') };
      if (nuc !== undefined) u.nucleo = nuc;
      u.partes = hijos;
      return u;
    }
    const texto = palabras.join(' ');
    const u = { funcion: m[1], texto };
    if (m[2]) u.nucleo = texto; else if (nuc !== undefined) u.nucleo = nuc;
    return u;
  };
  const unidades = [];
  while (i < toks.length) unidades.push(unidad());
  return unidades;
}

/** «b [..] [..] => texto» → { sintaxis, texto } */
function parsearOracion(spec, donde) {
  let over = null;
  const k = spec.indexOf(' => ');
  if (k >= 0) { over = spec.slice(k + 4).trim(); spec = spec.slice(0, k); }
  const m = /^\s*([bu])\s+(\[[\s\S]*)$/.exec(spec);
  if (!m) throw new Error(`${donde}: la oración debe empezar por «b» o «u» y un árbol`);
  const unidades = parsearArbol(m[2], donde);
  const s = { oracion: m[1] === 'b' ? 'bimembre' : 'unimembre' };
  if (m[1] === 'b') s.sujeto = unidades.some(u => u.funcion === 'SUJ') ? 'expreso' : 'omitido';
  s.unidades = unidades;
  return { sintaxis: s, texto: over ?? unidades.map(u => u.texto).join(' ') };
}

const hojas = us => us.flatMap(u => (u.partes ? hojas(u.partes) : [u]));

/** Reparte los tokens de la frase (con su puntuación) entre las hojas; null si no encaja. */
function repartirPuntuacion(unidades, catalogo) {
  const tokens = String(catalogo ?? '').trim().split(/\s+/).filter(Boolean);
  const salida = [];
  let j = 0, pendiente = '';
  for (const h of hojas(unidades)) {
    const pal = [];
    for (const w of h.texto.split(' ')) {
      while (j < tokens.length && soloPalabras(tokens[j]) === '') {
        if (pal.length) pal[pal.length - 1] += ' ' + tokens[j]; else if (salida.length) salida[salida.length - 1][salida[salida.length - 1].length - 1] += ' ' + tokens[j]; else pendiente += tokens[j] + ' ';
        j++;
      }
      if (j >= tokens.length || soloPalabras(tokens[j]) !== soloPalabras(w)) return null;
      pal.push(pendiente + tokens[j]); pendiente = ''; j++;
    }
    salida.push(pal);
  }
  while (j < tokens.length) {
    if (soloPalabras(tokens[j]) !== '' || !salida.length) return null;
    salida[salida.length - 1][salida[salida.length - 1].length - 1] += ' ' + tokens[j]; j++;
  }
  return salida;
}

function dibujarArbol(u, alto) {
  if (u.partes) {
    const cab = u.funcion + (u.nucleo !== undefined ? ':' + u.nucleo.replace(/ /g, '_') : '');
    return `[${cab} ${u.partes.map(p => dibujarArbol(p, alto)).join(' ')}]`;
  }
  const palabras = alto.next().value;
  const texto = palabras.join(' ');
  let cab = u.funcion;
  if (u.nucleo !== undefined) cab += u.nucleo === u.texto ? '*' : ':' + u.nucleo.replace(/ /g, '_');
  return `[${cab} ${texto}]`;
}

function oracionALec(sintaxis, catalogo) {
  const reparto = repartirPuntuacion(sintaxis.unidades, catalogo);
  const palabrasPorHoja = reparto ?? hojas(sintaxis.unidades).map(h => h.texto.split(' '));
  const it = palabrasPorHoja[Symbol.iterator]();
  const arbol = sintaxis.unidades.map(u => dibujarArbol(u, it)).join(' ');
  let linea = (sintaxis.oracion === 'bimembre' ? 'b ' : 'u ') + arbol;
  if (!reparto) linea += ' => ' + catalogo;
  return linea;
}

// ---------------------------------------------------------------------------
// Lectura del .lec
// ---------------------------------------------------------------------------
function decodificarValor(v) { return v.startsWith('"') ? JSON.parse(v) : v; }
function codificarValor(v) {
  const s = String(v);
  return (/[\n\r\\]/.test(s) || s !== s.trim() || s.startsWith('"') || s.startsWith('#')) ? JSON.stringify(s) : s;
}

function parsearLec(texto, nombre) {
  const L = { cab: {}, palabras: [], bloques: [], idiomas: {} };
  let seccion = 'cab', bloque = null, idioma = null;
  const lineas = texto.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (const [n, raw] of lineas.entries()) {
    const lin = raw.trim();
    const donde = `${nombre} línea ${n + 1}`;
    if (!lin || lin.startsWith('#')) continue;
    const mi = /^==\s*([a-z]{2})\s*$/.exec(lin);
    if (mi) { idioma = mi[1]; seccion = 'trad'; L.idiomas[idioma] ??= []; continue; }
    if (seccion !== 'trad') {
      if (lin === 'palabras') { seccion = 'pal'; continue; }
      if (lin === 'bloques') { seccion = 'blq'; continue; }
    }
    if (seccion === 'cab') {
      const [k, ...r] = lin.split(/\s+/);
      L.cab[k] = r.join(' ');
    } else if (seccion === 'pal') {
      const p = lin.split(' | ').map(s => s.trim());
      if (p[1] === 'propio') L.palabras.push([p[0], { propio: true }]);
      else {
        const e = { pron: p[1], cat: p[2] };
        if (p[3]) e.genero = p[3];
        L.palabras.push([p[0], e]);
      }
    } else if (seccion === 'blq') {
      const m = /^b(\d+)\s+(\w+)\s*(.*)$/.exec(lin);
      if (m) { bloque = { id: 'b' + m[1], tipo: m[2], resto: m[3], items: [], donde }; L.bloques.push(bloque); }
      else if (bloque) bloque.items.push({ lin, donde });
      else throw new Error(`${donde}: línea fuera de un bloque`);
    } else {
      const k = lin.indexOf(': ');
      if (k < 0 && !lin.endsWith(':')) throw new Error(`${donde}: se esperaba «clave: texto»`);
      const clave = k < 0 ? lin.slice(0, -1) : lin.slice(0, k);
      L.idiomas[idioma].push([clave, k < 0 ? '' : decodificarValor(lin.slice(k + 2))]);
    }
  }
  return L;
}

// ---------------------------------------------------------------------------
// Compilación
// ---------------------------------------------------------------------------
function ordenClave(palabras) {
  const prio = r => r === 'titulo' ? '0' : r === 'texto' ? '1' : (r === 'pregunta' || r === 'traduccion') ? '2' : r === 'frase' ? '3' : '4' + r;
  const rango = k => {
    if (k === 'titulo') return [0, 0, ''];
    if (k === 'intro') return [1, 0, ''];
    let m = /^b(\d+)\.(.*)$/.exec(k);
    if (m) return [2, +m[1], prio(m[2])];
    m = /^p\.(.*)\.(glosa|consejo)$/.exec(k);
    if (m) return [3, palabras.indexOf(m[1]), m[2]];
    return [4, 0, k];
  };
  return (a, b) => {
    const x = rango(a), y = rango(b);
    return x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2], 'en', { numeric: true });
  };
}

function compilarLec(L, nombre) {
  const id = L.cab.id;
  if (!id) throw new Error(`${nombre}: falta «id»`);
  const leccion = { esquema: 2, id, capitulo: Number(L.cab.capitulo), nivel: L.cab.nivel, palabras: Object.fromEntries(L.palabras), bloques: [] };
  const autoEs = {};

  for (const b of L.bloques) {
    const base = { id: b.id, tipo: b.tipo };
    const partir = (lin, donde) => {
      const k = lin.indexOf(' | ');
      if (k < 0) throw new Error(`${donde}: se esperaba «dato | oración»`);
      return [lin.slice(0, k).trim(), lin.slice(k + 3)];
    };
    switch (b.tipo) {
      case 'explicacion': case 'ordenar': break;
      case 'dialogo':
        base.frases = b.items.map((it, n) => {
          const [quien, spec] = partir(it.lin, it.donde);
          const o = parsearOracion(spec, it.donde);
          autoEs[`${b.id}.f${n}.texto`] = o.texto;
          return { quien, sintaxis: o.sintaxis };
        });
        break;
      case 'vocabulario':
        base.palabras = b.resto.split(';').map(s => s.trim()).filter(Boolean);
        break;
      case 'gramatica':
        base.ejemplos = b.items.map((it, n) => {
          const o = parsearOracion(it.lin, it.donde);
          autoEs[`${b.id}.e${n}.texto`] = o.texto;
          return { sintaxis: o.sintaxis };
        });
        break;
      case 'texto':
        base.registro = 'literario';
        base.frases = b.items.map((it, n) => {
          const [parrafo, spec] = partir(it.lin, it.donde);
          const o = parsearOracion(spec, it.donde);
          autoEs[`${b.id}.f${n}.texto`] = o.texto;
          return { parrafo: Number(parrafo), sintaxis: o.sintaxis };
        });
        break;
      case 'test': case 'huecos':
        base.opciones = b.resto.split(/\s+/).filter(Boolean).map(x => ({ correcta: x === '1' }));
        break;
      case 'escribir':
        base.respuestas = b.resto.split(' || ').map(s => s.trim());
        break;
      default: throw new Error(`${b.donde}: tipo de bloque desconocido «${b.tipo}»`);
    }
    leccion.bloques.push(base);
  }

  const nombresPalabras = L.palabras.map(([n]) => n);
  const cmp = ordenClave(nombresPalabras);
  const traducciones = {};
  for (const idioma of Object.keys(L.idiomas)) {
    if (!IDIOMAS.includes(idioma)) throw new Error(`${nombre}: idioma desconocido «${idioma}»`);
    const t = {};
    for (const [k, v] of L.idiomas[idioma]) {
      if (k in t) throw new Error(`${nombre} [${idioma}]: clave repetida «${k}»`);
      t[k] = v;
    }
    if (idioma === 'es') {
      for (const [k, v] of Object.entries(autoEs)) {
        if (k in t) throw new Error(`${nombre} [es]: «${k}» se calcula sola desde el árbol; quítala`);
        t[k] = v;
      }
    }
    const ordenado = {};
    for (const k of Object.keys(t).sort(cmp)) ordenado[k] = t[k];
    traducciones[idioma] = { idioma, leccion: id, ...ordenado };
  }
  return { leccion, traducciones };
}

// ---------------------------------------------------------------------------
// Descompilación (JSON existentes → .lec)
// ---------------------------------------------------------------------------
const leerJson = ruta => JSON.parse(readFileSync(ruta, 'utf8').replace(/^\uFEFF/, ''));

function descompilar(curso, id) {
  const j = leerJson(join(RAIZ, 'cursos', curso, 'lessons', `${id}.json`));
  const trad = {};
  for (const idioma of IDIOMAS) {
    const r = join(RAIZ, 'cursos', curso, 'traducciones', idioma, `${id}.json`);
    if (existsSync(r)) trad[idioma] = leerJson(r);
  }
  const catalogo = trad[curso] ?? {};
  const auto = new Set();
  const out = [`id ${j.id}`, `capitulo ${j.capitulo}`, `nivel ${j.nivel}`, '', 'palabras'];
  for (const [n, e] of Object.entries(j.palabras ?? {})) {
    out.push(e.propio ? `${n} | propio` : [n, e.pron, e.cat, e.genero].filter(x => x !== undefined).join(' | '));
  }
  out.push('', 'bloques');
  for (const b of j.bloques) {
    const cab = `${b.id} ${b.tipo}`;
    if (b.tipo === 'vocabulario') out.push(`${cab} ${b.palabras.join('; ')}`);
    else if (b.tipo === 'test' || b.tipo === 'huecos') out.push(`${cab} ${b.opciones.map(o => (o.correcta ? 1 : 0)).join(' ')}`);
    else if (b.tipo === 'escribir') out.push(`${cab} ${b.respuestas.join(' || ')}`);
    else out.push(cab);
    if (b.tipo === 'dialogo') b.frases.forEach((f, n) => { auto.add(`${b.id}.f${n}.texto`); out.push(`  ${f.quien} | ${oracionALec(f.sintaxis, catalogo[`${b.id}.f${n}.texto`])}`); });
    if (b.tipo === 'gramatica') b.ejemplos.forEach((e, n) => { auto.add(`${b.id}.e${n}.texto`); out.push(`  ${oracionALec(e.sintaxis, catalogo[`${b.id}.e${n}.texto`])}`); });
    if (b.tipo === 'texto') b.frases.forEach((f, n) => { auto.add(`${b.id}.f${n}.texto`); out.push(`  ${f.parrafo} | ${oracionALec(f.sintaxis, catalogo[`${b.id}.f${n}.texto`])}`); });
  }
  for (const idioma of IDIOMAS) {
    if (!trad[idioma]) continue;
    out.push('', `== ${idioma}`);
    for (const [k, v] of Object.entries(trad[idioma])) {
      if (k === 'idioma' || k === 'leccion') continue;
      if (idioma === curso && auto.has(k)) continue;
      out.push(`${k}: ${codificarValor(v)}`);
    }
  }
  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Comparación tolerante a puntuación (como el validador) para «probar»
// ---------------------------------------------------------------------------
function difer(a, b, ruta, difs) {
  if (difs.length > 5) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ks = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of ks) {
      if (!(k in a) || !(k in b)) { difs.push(`${ruta}.${k}: ${k in a ? 'sobra' : 'falta'}`); continue; }
      if ((k === 'texto' || k === 'nucleo') && ruta.includes('sintaxis')) {
        if (soloPalabras(a[k]) !== soloPalabras(b[k])) difs.push(`${ruta}.${k}: «${a[k]}» ≠ «${b[k]}»`);
      } else difer(a[k], b[k], `${ruta}.${k}`, difs);
    }
  } else if (a !== b) difs.push(`${ruta}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const [orden, curso, ...resto] = process.argv.slice(2);
if (!['compilar', 'descompilar', 'probar', 'claves'].includes(orden) || !curso) {
  console.log('Uso: node _herramientas/lec.mjs compilar|descompilar|probar|claves <curso> [NNN ...]');
  process.exit(2);
}
const dirLecc = join(RAIZ, 'cursos', curso, 'lessons');
const dirFuente = join(FUENTE, curso);
let ids = resto.filter(a => /^\d+$/.test(a)).map(a => a.padStart(3, '0'));
if (!ids.length) {
  const dir = orden === 'compilar' ? dirFuente : dirLecc;
  ids = existsSync(dir) ? readdirSync(dir).filter(f => /^\d+\.(lec|json)$/.test(f)).map(f => f.slice(0, 3)).sort() : [];
  if (orden !== 'compilar') ids = ids.filter(id => { try { return leerJson(join(dirLecc, `${id}.json`)).esquema === 2; } catch { return false; } });
}

let fallos = 0;
if (orden === 'claves') {
  for (const id of ids) {
    const ruta = join(dirFuente, `${id}.lec`);
    if (!existsSync(ruta)) { console.log(`✗ ${id}: no existe ${ruta}`); fallos++; continue; }
    try {
      const { leccion } = compilarLec(parsearLec(readFileSync(ruta, 'utf8'), id), id);
      const estudio = new Set(), automaticas = new Set(), ayuda = new Set(['titulo', 'intro']);
      for (const b of leccion.bloques) {
        ayuda.add(`${b.id}.titulo`);
        if (b.tipo === 'dialogo') b.frases.forEach((_, n) => { estudio.add(`${b.id}.f${n}.texto`); automaticas.add(`${b.id}.f${n}.texto`); });
        if (b.tipo === 'gramatica') b.ejemplos.forEach((_, n) => { estudio.add(`${b.id}.e${n}.texto`); automaticas.add(`${b.id}.e${n}.texto`); });
        if (b.tipo === 'texto') b.frases.forEach((_, n) => { estudio.add(`${b.id}.f${n}.texto`); automaticas.add(`${b.id}.f${n}.texto`); });
        if (b.tipo === 'test' || b.tipo === 'huecos') b.opciones.forEach((_, n) => { estudio.add(`${b.id}.o${n}`); ayuda.add(`${b.id}.o${n}.refuerzo`); });
        if (b.tipo === 'huecos' || b.tipo === 'ordenar') estudio.add(`${b.id}.frase`);
        if (b.tipo === 'explicacion' || b.tipo === 'gramatica') ayuda.add(`${b.id}.texto`);
        if (['test', 'huecos', 'escribir'].includes(b.tipo)) ayuda.add(`${b.id}.pregunta`);
        if (b.tipo === 'ordenar') ayuda.add(`${b.id}.traduccion`);
      }
      for (const [p, e] of Object.entries(leccion.palabras)) if (!e.propio) { ayuda.add(`p.${p}.glosa`); ayuda.add(`p.${p}.consejo`); }
      const cmp = ordenClave(Object.keys(leccion.palabras));
      const lista = s => [...s].sort(cmp);
      console.log(`== ${id}: claves que van en CADA uno de los 12 idiomas (${ayuda.size + estudio.size - automaticas.size} a escribir; ${automaticas.size} frases analizadas son la traducción en los 11 no-es)`);
      console.log('AYUDA (cada idioma en el suyo):\n  ' + lista(ayuda).join('\n  '));
      console.log('ESTUDIO (frase en ese idioma; en «es» las analizadas salen del árbol y NO se escriben):\n  ' + lista(estudio).map(k => k + (automaticas.has(k) ? '   [en es: automática]' : '')).join('\n  '));
    } catch (e) { fallos++; console.log(`✗ ${id}: ${e.message}`); }
  }
} else if (orden === 'descompilar') {
  mkdirSync(dirFuente, { recursive: true });
  for (const id of ids) { writeFileSync(join(dirFuente, `${id}.lec`), descompilar(curso, id), 'utf8'); }
  console.log(`${ids.length} lecciones descompiladas en ${dirFuente}`);
} else if (orden === 'probar') {
  let bytesLec = 0, bytesJson = 0;
  for (const id of ids) {
    try {
      const lec = descompilar(curso, id);
      const { leccion, traducciones } = compilarLec(parsearLec(lec, id), id);
      const difs = [];
      difer(leerJson(join(dirLecc, `${id}.json`)), leccion, 'lesson', difs);
      for (const [idioma, t] of Object.entries(traducciones)) {
        const orig = leerJson(join(RAIZ, 'cursos', curso, 'traducciones', idioma, `${id}.json`));
        difer(orig, t, idioma, difs);
      }
      bytesLec += Buffer.byteLength(lec);
      bytesJson += ['lessons', ...IDIOMAS.map(i => 'traducciones/' + i)].reduce((s, d) => s + (existsSync(join(RAIZ, 'cursos', curso, d, `${id}.json`)) ? readFileSync(join(RAIZ, 'cursos', curso, d, `${id}.json`)).length : 0), 0);
      if (difs.length) { fallos++; console.log(`✗ ${id}\n   ${difs.join('\n   ')}`); }
    } catch (e) { fallos++; console.log(`✗ ${id}: ${e.message}`); }
  }
  console.log(`${ids.length - fallos}/${ids.length} lecciones idénticas tras el viaje de ida y vuelta · .lec ${(bytesLec / 1024).toFixed(0)} KB frente a ${(bytesJson / 1024).toFixed(0)} KB de JSON`);
} else {
  for (const id of ids) {
    const ruta = join(dirFuente, `${id}.lec`);
    if (!existsSync(ruta)) { console.log(`✗ ${id}: no existe ${ruta}`); fallos++; continue; }
    try {
      const { leccion, traducciones } = compilarLec(parsearLec(readFileSync(ruta, 'utf8'), id), id);
      if (leccion.id !== id) throw new Error(`el «id» (${leccion.id}) no coincide con el nombre del archivo`);
      const faltan = IDIOMAS.filter(i => !traducciones[i]);
      if (faltan.length) throw new Error(`faltan idiomas: ${faltan.join(', ')}`);
      writeFileSync(join(dirLecc, `${id}.json`), JSON.stringify(leccion, null, 2) + '\n', 'utf8');
      for (const [idioma, t] of Object.entries(traducciones)) {
        const d = join(RAIZ, 'cursos', curso, 'traducciones', idioma);
        mkdirSync(d, { recursive: true });
        writeFileSync(join(d, `${id}.json`), JSON.stringify(t, null, 2) + '\n', 'utf8');
      }
      console.log(`✓ ${id} compilada (13 archivos)`);
    } catch (e) { fallos++; console.log(`✗ ${id}: ${e.message}`); }
  }
  if (ids.length) {
    const r = spawnSync(process.execPath, [join(AQUI, 'validar_v2.mjs'), curso, ...ids, '-v'], { stdio: 'inherit' });
    if (r.status) fallos++;
  }
}
process.exit(fallos ? 1 : 0);
