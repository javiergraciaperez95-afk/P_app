// Revisa el curso con las mismas reglas que la app: lessons/curso.json, cada lección y
// phrases/frases.json. Los mensajes salen en inglés (o en vietnamita con --vi).
//
//   npm run validar              → errores = código de salida 1; avisos = solo se muestran
//   npm run validar -- --estricto → también los avisos hacen fallar (útil al convertir materiales)

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ponerTextos, cambiarIdioma, t } from '../js/i18n.js';
import { revisarCurso, revisarLeccion, revisarFrases, interpretarJSON, textoAviso } from '../js/lessons.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = archivo => readFile(path.join(raiz, archivo), 'utf8');
const estricto = process.argv.includes('--estricto');

ponerTextos({
  en: JSON.parse(await leer('locales/en.json')),
  vi: JSON.parse(await leer('locales/vi.json')),
});
cambiarIdioma(process.argv.includes('--vi') ? 'vi' : 'en', { guardar: false });

let errores = 0;
let avisos = 0;
const texto = a => (a?.codigo !== undefined ? `    ${a.codigo}` : textoAviso(a, t));

function informarError(archivo, error) {
  errores += 1;
  console.log(`✘ ${archivo}: ${texto(error.titulo)}`);
  for (const d of error.detalles) console.log(`    ${texto(d)}`);
}

function informarAvisos(archivo, lista) {
  for (const a of lista) {
    avisos += 1;
    console.log(`⚠ ${archivo}: ${texto(a)}`);
  }
}

async function leerJSON(archivo) {
  try {
    return interpretarJSON(await leer(archivo), archivo);
  } catch {
    return { error: { titulo: { k: 'validation.fileNotFound', v: { archivo } }, detalles: [] } };
  }
}

const curso = await leerJSON('lessons/curso.json');
if (curso.error) {
  informarError('lessons/curso.json', curso.error);
} else {
  const { unidades, avisos: avisosCurso, fatal } = revisarCurso(curso.json);
  if (fatal) informarError('lessons/curso.json', { titulo: { k: 'validation.loadFailed', v: { archivo: 'lessons/curso.json' } }, detalles: fatal });
  informarAvisos('lessons/curso.json', avisosCurso ?? []);

  for (const unidad of unidades ?? []) {
    for (const id of unidad.lecciones) {
      const archivo = `lessons/${id}.json`;
      const r = await leerJSON(archivo);
      if (r.error) {
        informarError(archivo, r.error);
        continue;
      }
      const revision = revisarLeccion(id, r.json);
      if (revision.fatal) {
        informarError(archivo, { titulo: { k: 'validation.lessonFailed', v: { id } }, detalles: revision.fatal });
        continue;
      }
      informarAvisos(archivo, revision.avisos);
      for (const b of revision.leccion.bloques.filter(x => x.error)) {
        errores += 1;
        console.log(`✘ ${archivo}: ${texto(b.error)}`);
      }
      const ejercicios = revision.leccion.idsEjercicios.length;
      console.log(`✔ ${archivo} · ${revision.leccion.titulo} · ${revision.leccion.bloques.length} blocks, ${ejercicios} exercises`);
    }
  }
}

const frases = await leerJSON('phrases/frases.json');
if (frases.error) informarError('phrases/frases.json', frases.error);
else {
  const r = revisarFrases(frases.json);
  informarAvisos('phrases/frases.json', r.avisos);
  console.log(`✔ phrases/frases.json · ${r.categorias.length} categories`);
}

console.log(`\n${errores} error(s), ${avisos} warning(s).`);
process.exit(errores || (estricto && avisos) ? 1 : 0);
