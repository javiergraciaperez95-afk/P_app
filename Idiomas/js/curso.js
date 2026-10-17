// El curso (el idioma que se estudia) elegido en este dispositivo.
// La app es una sola para todos los idiomas: el programa es el mismo y lo que cambia es la carpeta
// de contenido (cursos/<id>/), la tutora, la voz y dónde se guarda el progreso. Todo eso sale de aquí.
// Cambiar de curso recarga la página, así el resto del programa puede leer «curso» como algo fijo.

import { CURSOS } from './cursos.js';

const CLAVE_CURSO = 'idiomas-curso';

function leerElegido() {
  try {
    const id = localStorage.getItem(CLAVE_CURSO);
    return CURSOS.find(c => c.id === id && !c.proximamente) ?? null;
  } catch {
    return null;
  }
}

const elegido = leerElegido();

// Nombre propio de cada tutora, elegido según el idioma que se está aprendiendo.
// Se mantienen en escritura local cuando existe, para que suenen naturales en cada curso.
export const NOMBRES_TUTORAS = {
  en: 'Emily', es: 'Lucía', fr: 'Camille', de: 'Anna', ja: 'Yui',
  it: 'Sofia', ko: '민지', zh: '小雨', pt: 'Inês', ru: 'Анна',
  tr: 'Elif', nl: 'Sophie', sv: 'Elsa', el: 'Ελένη', pl: 'Zofia',
  no: 'Nora', vi: 'Linh', id: 'Sari', da: 'Freja', ro: 'Ana', th: 'มะลิ',
};

/** false mientras no se ha elegido idioma: se enseña la pantalla «Elige el idioma». */
export const hayCurso = Boolean(elegido);

/** Nombre de la tutora del idioma elegido, o null antes de elegir un curso. */
export const nombreTutora = NOMBRES_TUTORAS[elegido?.id] ?? null;

export const curso = elegido ?? {
  id: '', carpeta: 'cursos/_ninguno', campo: 'es', lang: 'es', voz: 'es-ES', prefijo: 'idiomas', tabla: '',
  nativo: '', nombre: {}, hola: '', letras: [], sprite: '',
};

/** Código del idioma que se estudia, para el atributo lang de sus textos. */
export const LANG = curso.lang;

/** Nombre con el que este curso guarda algo en el dispositivo: cada curso tiene lo suyo. */
export const clave = nombre => `${curso.prefijo}-${nombre}`;

/** Ruta de un archivo de contenido de este curso. */
export const ruta = archivo => `${curso.carpeta}/${archivo}`;

/** Nombre del idioma estudiado, adaptado al idioma de la interfaz cuando es posible. */
export function nombreCurso(c, idioma) {
  if (c.nombre[idioma]) return c.nombre[idioma];
  // cursos.js trae los nombres en inglés, español, portugués, vietnamita y chino; para el resto lo dice el navegador.
  try { return new Intl.DisplayNames([idioma], { type: 'language' }).of(c.lang) ?? c.nombre.en ?? c.nativo; }
  catch { return c.nombre.en ?? c.nativo; } // navegador sin Intl.DisplayNames
}
export const nombreDelCurso = idioma => nombreCurso(curso, idioma);

/** El saludo del idioma sin signos, para frases como «¡Hola, Ana!». */
export const saludo = curso.hola.replace(/^[¡¿\s]+|[!！.。\s]+$/gu, '');

export function elegirCurso(id) {
  try { localStorage.setItem(CLAVE_CURSO, id); } catch { /* sin almacenamiento */ }
  location.hash = '#/lecciones';
  location.reload();
}

export function cambiarDeCurso() {
  try { localStorage.removeItem(CLAVE_CURSO); } catch { /* sin almacenamiento */ }
  location.hash = '#/';
  location.reload();
}
