// Las tutoras que salen de adorno (portada, pie, entrar, minijuegos…). La app solo enseña español:
// Lucía es la tutora del curso y las demás son sus compañeras de clase, que también aprenden español
// y por eso saludan en español. Sus dibujos están en tutoras/<id>/tutora.js.

import { curso } from './curso.js';

const IDS = ['en', 'zh', 'fr', 'de', 'ja', 'it', 'ko', 'pt', 'ru', 'tr', 'nl', 'sv', 'el', 'pl', 'no', 'vi', 'id', 'da', 'ro', 'th'];

const compannera = id => ({ id, carpeta: `tutoras/${id}`, lang: 'es', hola: '¡Hola!', nativo: '', nombre: {}, bandera: '' });

/** Todas las que pueden salir en una escena: primero Lucía, luego sus compañeras. */
export const TUTORAS = [curso, ...IDS.map(compannera)];

/** Una por su id (la del curso es «es»). */
export const tutoraPorId = id => TUTORAS.find(c => c.id === id);
