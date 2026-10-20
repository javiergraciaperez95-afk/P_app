// El curso de Phuong App: siempre español, explicado en vietnamita (cursos/es/vi/). Aquí sale todo lo del curso: la
// carpeta de contenido, la tutora, la voz y el nombre con el que se guarda el progreso en el dispositivo.

import { CURSOS } from './cursos.js';

/** Siempre hay curso (es el único). Se deja para el código que antes elegía idioma. */
export const hayCurso = true;

export const curso = CURSOS.find(c => c.id === 'es');

// Nombre propio de cada tutora: Lucía es la de español; las demás son sus compañeras en los minijuegos.
export const NOMBRES_TUTORAS = {
  en: 'Emily', es: 'Lucía', fr: 'Camille', de: 'Anna', ja: 'Yui',
  it: 'Sofia', ko: '민지', zh: '小雨', pt: 'Inês', ru: 'Анна',
  tr: 'Elif', nl: 'Sophie', sv: 'Elsa', el: 'Ελένη', pl: 'Zofia',
  no: 'Nora', vi: 'Linh', id: 'Sari', da: 'Freja', ro: 'Ana', th: 'มะลิ',
};

export const nombreTutora = NOMBRES_TUTORAS.es;

/** Código del idioma que se estudia, para el atributo lang de sus textos. */
export const LANG = curso.lang;

/** Nombre con el que el curso guarda algo en el dispositivo. */
export const clave = nombre => `${curso.prefijo}-${nombre}`;

/** Ruta de un archivo de contenido del curso. */
export const ruta = archivo => `${curso.carpeta}/${archivo}`;

/** Nombre del idioma estudiado, en el idioma de la interfaz. */
export function nombreCurso(c, idioma) {
  return c.nombre?.[idioma] ?? c.nombre?.es ?? c.nativo;
}
export const nombreDelCurso = idioma => nombreCurso(curso, idioma);

/** El saludo del idioma sin signos, para frases como «¡Hola, Ana!». */
export const saludo = curso.hola.replace(/^[¡¿\s]+|[!！.。\s]+$/gu, '');

/** La lengua en la que se explican las lecciones: siempre vietnamita (la interfaz puede ir en vietnamita o español). */
export const LENGUA_DEL_ALUMNO = 'vi';
