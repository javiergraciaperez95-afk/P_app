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

/** false mientras no se ha elegido idioma: se enseña la pantalla «Elige el idioma». */
export const hayCurso = Boolean(elegido);

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

/** Nombre del idioma del curso en el idioma de la interfaz («French», «francés», «tiếng Pháp»…). */
export const nombreDelCurso = idioma => curso.nombre[idioma] ?? curso.nombre.en ?? curso.nativo;

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
