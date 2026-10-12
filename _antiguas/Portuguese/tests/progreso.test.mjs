// Progreso local, unión de dispositivos y filas de Supabase.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ponerTextos } from '../js/i18n.js';
import {
  marcarAbierta, marcarTerminada, registrarRespuesta, resumenLeccion, todosLosDatos, unirDatos, guardarEnCuaderno,
  quitarDelCuaderno, reiniciarProgreso, completar, importarCopia,
} from '../js/progress.js';
import { datosAFilas, filasADatos, filasCambiadas, ORDEN } from '../js/filas.js';
import { programar, nuevaTarjeta } from '../js/srs.js';

ponerTextos({ en: {}, vi: {} });
const USUARIO = '11111111-1111-1111-1111-111111111111';
const copia = x => JSON.parse(JSON.stringify(x));

test('terminar una lección dos veces no cambia nada (ni la fecha)', () => {
  marcarAbierta('sample-u1-l1');
  registrarRespuesta('sample-u1-l1', 'boa-tarde', false);
  registrarRespuesta('sample-u1-l1', 'boa-tarde', true);
  marcarTerminada('sample-u1-l1');
  const antes = copia(todosLosDatos().lecciones['sample-u1-l1']);
  marcarTerminada('sample-u1-l1');
  marcarAbierta('sample-u1-l1');
  assert.deepEqual(todosLosDatos().lecciones['sample-u1-l1'], antes);
  const r = resumenLeccion('sample-u1-l1', ['boa-tarde', 'otro']);
  assert.deepEqual({ ...r }, { total: 2, completados: 1, aciertos: 1, errores: 1, terminada: true, estado: 'terminada' });
});

test('unir dos dispositivos: gana el ejercicio con más intentos y nada se pierde', () => {
  const a = completar({ lecciones: { l1: { terminada: false, abierta: true, t: 10, ejercicios: { e1: { intentos: 1, aciertos: 1, errores: 0, completado: true, t: 10 } } } } });
  const b = completar({ lecciones: {
    l1: { terminada: true, terminadaEn: 20, abierta: true, t: 20, ejercicios: { e1: { intentos: 3, aciertos: 2, errores: 1, completado: true, t: 20 }, e2: { intentos: 1, aciertos: 0, errores: 1, completado: true, t: 20 } } },
    l2: { terminada: false, abierta: true, t: 5, ejercicios: {} },
  } });
  const u = unirDatos(a, b);
  assert.equal(u.lecciones.l1.terminada, true);
  assert.equal(u.lecciones.l1.ejercicios.e1.intentos, 3);
  assert.ok(u.lecciones.l1.ejercicios.e2);
  assert.ok(u.lecciones.l2);
  assert.deepEqual(unirDatos(u, u), u, 'unir consigo mismo no cambia nada');
});

test('filas de Supabase: ida y vuelta sin pérdidas', () => {
  guardarEnCuaderno({ pt: 'Obrigado', trad: { en: 'thank you', vi: 'cảm ơn' }, tipo: 'palabra', origen: 'x' });
  guardarEnCuaderno({ pt: 'Até logo', trad: { en: 'see you later', vi: 'hẹn gặp lại' }, tipo: 'frase' });
  quitarDelCuaderno('Até logo');
  const datos = copia(todosLosDatos());
  const { filas } = datosAFilas(datos, USUARIO, { idiomaInterfaz: 'vi' });
  assert.equal(filas.perfil[0].ui_language, 'vi');
  assert.equal(filas.progresoLecciones.length, 1);
  assert.equal(filas.progresoEjercicios.length, 1);
  assert.equal(filas.cuaderno.length, 2);
  assert.equal(filas.cuaderno.find(f => f.card_id === 'até logo').deleted, true);
  const vuelta = filasADatos(filas);
  const unido = unirDatos(datos, vuelta);
  assert.deepEqual(unido.lecciones, completar(datos).lecciones);
  assert.deepEqual(unido.cuaderno, completar(datos).cuaderno);
});

test('cambiar el idioma de la interfaz solo cambia el perfil, nunca el progreso', () => {
  const datos = copia(todosLosDatos());
  const en = datosAFilas(datos, USUARIO, { idiomaInterfaz: 'en' }).filas;
  const vi = datosAFilas(datos, USUARIO, { idiomaInterfaz: 'vi' }).filas;
  const cambios = filasCambiadas(vi, en);
  assert.equal(cambios.perfil.length, 1);
  for (const tabla of ORDEN.filter(x => x !== 'perfil')) assert.equal(cambios[tabla].length, 0, tabla);
  // Volver a subir lo mismo no genera ninguna escritura (ni duplicados).
  for (const tabla of ORDEN) assert.equal(filasCambiadas(en, en)[tabla].length, 0, tabla);
});

test('las lecciones que no están en el catálogo no se suben (se quedan en local)', () => {
  registrarRespuesta('leccion-nueva', 'e', true);
  const { filas, omitidas } = datosAFilas(todosLosDatos(), USUARIO, { leccionesConocidas: new Set(['sample-u1-l1']) });
  assert.deepEqual(omitidas, ['leccion-nueva']);
  assert.ok(filas.progresoLecciones.every(f => f.lesson_id === 'sample-u1-l1'));
  assert.ok(filas.progresoEjercicios.every(f => f.lesson_id === 'sample-u1-l1'));
});

test('reiniciar descarta lo anterior al reinicio al unir con la nube', async () => {
  const nube = copia(todosLosDatos());
  await new Promise(r => setTimeout(r, 5)); // que el reinicio sea claramente posterior
  reiniciarProgreso();
  const unido = unirDatos(todosLosDatos(), nube);
  assert.deepEqual(unido.lecciones, {});
  assert.ok(unido.reiniciado > 0);
  assert.ok(Object.values(unido.cuaderno).some(c => c.pt === 'Obrigado'), 'el cuaderno se conserva');
});

test('las copias de seguridad de otra app (p. ej. la de danés) se rechazan', () => {
  assert.equal(importarCopia({ version: 2, lecciones: {} }), false);
  assert.equal(importarCopia({ app: 'ola-portugues', version: 1, lecciones: {} }), true);
});

test('repetición espaciada', () => {
  const bien = programar(nuevaTarjeta(), 3, 0);
  assert.equal(bien.intervalo, 1);
  const otraVez = programar(bien, 1, 0);
  assert.equal(otraVez.repeticiones, 0);
  assert.equal(otraVez.lapsos, 1);
});
