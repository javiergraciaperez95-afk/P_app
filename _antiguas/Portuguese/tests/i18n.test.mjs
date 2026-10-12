// Archivos de idioma: los dos tienen las mismas claves, las mismas variables {x},
// y todas las claves que usa el código existen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ponerTextos, cambiarIdioma, t, tr, lista, idioma } from '../js/i18n.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(await readFile(path.join(raiz, 'locales/en.json'), 'utf8'));
const vi = JSON.parse(await readFile(path.join(raiz, 'locales/vi.json'), 'utf8'));

const FORMAS_PLURAL = ['zero', 'one', 'two', 'few', 'many', 'other'];
const esPlural = v => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).every(k => FORMAS_PLURAL.includes(k));
const hojas = (o, p = '') => Object.entries(o).flatMap(([k, v]) =>
  (v && typeof v === 'object' && !Array.isArray(v) && !esPlural(v) ? hojas(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
const variables = v => new Set(JSON.stringify(v).match(/\{\w+\}/g) ?? []);
const buscar = (o, clave) => clave.split('.').reduce((n, x) => n?.[x], o);

async function archivosJs(carpeta) {
  const lista = [];
  for (const e of await readdir(path.join(raiz, carpeta), { withFileTypes: true })) {
    const ruta = path.join(carpeta, e.name);
    if (e.isDirectory()) lista.push(...await archivosJs(ruta));
    else if (e.name.endsWith('.js')) lista.push(ruta);
  }
  return lista;
}

test('en.json y vi.json tienen exactamente las mismas claves', () => {
  const a = new Set(hojas(en).map(([k]) => k));
  const b = new Set(hojas(vi).map(([k]) => k));
  assert.deepEqual([...a].filter(k => !b.has(k)), [], 'faltan en vi.json');
  assert.deepEqual([...b].filter(k => !a.has(k)), [], 'faltan en en.json');
});

test('las traducciones usan las mismas variables {x} y no están vacías', () => {
  const mapaVi = new Map(hojas(vi));
  for (const [clave, valor] of hojas(en)) {
    const otro = mapaVi.get(clave);
    if (!Array.isArray(valor)) assert.deepEqual(variables(otro), variables(valor), `variables distintas en «${clave}»`);
    assert.ok(JSON.stringify(otro).replace(/"/g, '').trim(), `«${clave}» vacía en vi.json`);
  }
});

test('todas las claves que usa el código existen en los dos idiomas', async () => {
  const archivos = [...await archivosJs('js'), 'index.html'];
  const claves = new Set();
  const familias = ['account', 'analysis', 'app', 'backup', 'cloud', 'common', 'errors', 'exercise', 'grammar', 'header', 'lesson', 'lessons',
    'nav', 'notFound', 'notebook', 'phrases', 'practice', 'profile', 'reset', 'review', 'settings', 'srs', 'tutor', 'validation', 'voice', 'word'];
  for (const archivo of archivos) {
    const codigo = await readFile(path.join(raiz, archivo), 'utf8');
    for (const m of codigo.matchAll(/['"]([a-zA-Z]+(?:\.[a-zA-Z0-9-]+)+)['"]/g)) {
      if (familias.includes(m[1].split('.')[0])) claves.add(m[1]);
    }
  }
  // Claves que se construyen en tiempo de ejecución.
  const dinamicas = [
    ...['test', 'traduccion', 'huecos', 'escribir', 'ordenar'].flatMap(x => [`exercise.type.${x}`, `exercise.defaultQuestion.${x}`]),
    ...['nueva', 'curso', 'terminada'].map(x => `lessons.status.${x}`),
    ...['nueva', 'aprendiendo', 'repaso', 'dominada'].map(x => `srs.stage.${x}`),
    ...['desactivada', 'sin-sesion', 'sincronizando'].map(x => `account.state.${x}`),
    ...['m', 'f', 'mf'].map(x => `grammar.gender.${x}`),
    ...['calm', 'thinking', 'happy', 'flustered', 'surprised', 'confused'].map(x => `tutor.mood.${x}`),
  ];
  const { GRAMATICA } = await import('../js/lessons.js');
  dinamicas.push(...GRAMATICA.map(x => `grammar.${x}`));
  const faltan = [...claves, ...dinamicas].filter(k => buscar(en, k) === undefined || buscar(vi, k) === undefined);
  assert.deepEqual(faltan, []);
  assert.ok(claves.size > 300, `se esperaban muchas claves, hay ${claves.size}`);
});

test('t(): idioma, plurales, variables y reserva en inglés', () => {
  ponerTextos({ en, vi });
  cambiarIdioma('en', { guardar: false });
  assert.equal(t('nav.lessons'), 'Lessons');
  assert.equal(t('lessons.warnings', { n: 1 }), '1 warning');
  assert.equal(t('lessons.warnings', { n: 3 }), '3 warnings');
  cambiarIdioma('vi', { guardar: false });
  assert.equal(idioma(), 'vi');
  assert.equal(t('nav.lessons'), 'Bài học');
  assert.equal(t('lessons.warnings', { n: 3 }), '3 cảnh báo');
  assert.ok(lista('tutor.praise').length >= 3);
  assert.equal(t('no.existe'), 'no.existe');
  assert.equal(tr({ en: 'hello', vi: 'xin chào' }), 'xin chào');
  assert.equal(tr({ en: 'only english' }), 'only english');
  assert.equal(tr('Olá'), 'Olá');
  cambiarIdioma('es', { guardar: false }); // no es un idioma de interfaz: se ignora
  assert.equal(idioma(), 'vi');
  cambiarIdioma('en', { guardar: false });
});

test('la interfaz dice que se aprende portugués (nunca otro idioma)', () => {
  assert.match(en.app.name, /Portuguese/);
  assert.match(vi.app.name, /Bồ Đào Nha/);
  const todo = JSON.stringify([en, vi]);
  assert.doesNotMatch(todo, /Spanish|Español|español|Spain|España|Tây Ban Nha|Danish|danés|Đan Mạch/);
});
