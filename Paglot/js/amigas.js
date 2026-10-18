// Las tutoras que salen de adorno (portada, pie, entrar, minijuegos…): una por curso. La del curso elegido va
// primero; las demás son sus compañeras. Sus dibujos están en cursos/<id>/tutora.js.

import { curso } from './curso.js';
import { CURSOS } from './cursos.js';

/** Todas las que pueden salir en una escena: primero la del curso (si hay uno elegido), luego las demás. */
export const TUTORAS = [...(curso.id ? [curso] : []), ...CURSOS.filter(c => !c.proximamente && c.id !== curso.id)];

/** Una por su id. */
export const tutoraPorId = id => TUTORAS.find(c => c.id === id);
