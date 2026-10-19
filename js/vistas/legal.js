// Aviso legal y privacidad (#/legal) y el aviso de almacenamiento que sale la primera vez que se abre la app.
// Los textos están en i18n/ (claves «legal.*» y «aviso.*»); los datos de la persona responsable, en config.js.

import { el, poner, enLinea } from '../dom.js';
import { t } from '../i18n.js';
import { hayCurso } from '../curso.js';
import { sonar } from '../sonidos.js';
import { TITULAR, LEGAL_ACTUALIZADO } from '../config.js';

const CLAVE_AVISO = 'idiomas-aviso-visto';

// TODO lo que Paglot guarda en el dispositivo, por grupos: #/legal lo enseña entero, con el nombre de cada clave
// (decisión del 19-10-2026: «el usuario tiene que saber todos los datos que guardamos sobre él, sin excepciones»).
// «P-» es el nombre de cada curso (espanol-, ingles-, francais-…). _herramientas/comprobar.py avisa si el código guarda
// algo con una clave que no está aquí: al añadir una, se pone en su grupo (o en uno nuevo, con su texto «legal.disp.*»).
export const DATOS_DISPOSITIVO = [
  ['ajustes', ['idiomas-ajustes', 'espanol-ajustes']],
  ['curso', ['idiomas-curso']],
  ['progreso', ['P-datos', 'P-prueba', 'P-logros', 'P-estrellas', 'P-juego', 'P-juego2', 'P-cofres', 'P-camino-abiertos', 'P-dia-completo', 'P-reto-mejor']],
  ['cuaderno', ['P-tarjeta:…']],
  ['vistos', ['idiomas-aviso-visto', 'idiomas-bienvenida-vista', 'idiomas-beta-…', 'paglot_welcome_notification_v5']],
  ['comodidad', ['idiomas-tutora-oculta', 'idiomas-tutora-hoy', 'idiomas-modo-leccion', 'idiomas-juego-musica']],
  ['nombreJuego', ['idiomas-juego-nombre']],
  ['cuenta', ['paglot-cuenta', 'paglot-nube', 'paglot-nube-apagada']],
  ['laboratorio', ['paglot-laboratorio-ideas-v1', 'paglot-laboratorio-votos-v1', 'paglot-laboratorio-quien']],
  ['pestana', ['idiomas-abierta', 'idiomas-desarrollador', 'paglot-sin-terminar', 'paglot-recien', 'paglot-contacto-asunto']],
  ['pruebas', ['paglot-sin-nube', 'paglot-juego-forzado', 'paglot-bienvenida-paso', 'paglot-prueba-almacen']],
  ['copiaApp', ['caché «paglot-» + versión']],
];

const parrafo = clave => el('p', {}, enLinea(t(clave)));

export function pintarLegal(contenedor) {
  const dato = (campo, valor) => el('li', {},
    el('strong', {}, `${t(`legal.titular.${campo}`)}: `),
    valor ? (campo === 'correo' ? el('a', { href: `mailto:${valor}` }, valor) : valor) : el('em', {}, t('legal.pendiente')));
  const bloque = (titulo, ...hijos) => el('section', { class: 'caja' }, el('h2', {}, t(titulo)), ...hijos);

  poner(contenedor,
    el('article', { class: 'legal' },
      el('h1', {}, t('legal.titulo')),
      el('p', { class: 'meta' }, t('legal.actualizado', { fecha: LEGAL_ACTUALIZADO })),
      el('p', { class: 'legal-resumen caja' }, t('legal.resumen')),
      bloque('legal.quien.titulo', parrafo('legal.quien.texto'),
        el('ul', { class: 'legal-titular' },
          dato('nombre', TITULAR.nombre), dato('nif', TITULAR.nif), dato('direccion', TITULAR.direccion), dato('correo', TITULAR.correo))),
      bloque('legal.datos.titulo',
        parrafo('legal.datos.dispositivo'),
        el('ul', { class: 'legal-claves' }, DATOS_DISPOSITIVO.map(([grupo, claves]) => el('li', {},
          enLinea(t(`legal.disp.${grupo}`)),
          el('small', {}, claves.map((c, i) => [i ? ', ' : '', el('code', {}, c)]).flat())))),
        parrafo('legal.datos.nube'),
        parrafo('legal.datos.correo'),
        parrafo('legal.datos.ideas'),
        parrafo('legal.datos.errores'),
        parrafo('legal.datos.contacto'),
        parrafo('legal.datos.nada')),
      bloque('legal.uso.titulo', parrafo('legal.uso.texto')),
      bloque('legal.plazos.titulo', parrafo('legal.plazos.texto')),
      bloque('legal.region.titulo', parrafo('legal.region.texto')),
      bloque('legal.terceros.titulo', parrafo('legal.terceros.supabase'), parrafo('legal.terceros.voz'), parrafo('legal.terceros.avisos')),
      bloque('legal.derechos.titulo', parrafo('legal.derechos.texto'), parrafo('legal.derechos.reclamar')),
      bloque('legal.cookies.titulo', parrafo('legal.cookies.texto'), parrafo('legal.cookies.borrar')),
      bloque('legal.menores.titulo', parrafo('legal.menores.texto')),
      bloque('legal.condiciones.titulo', parrafo('legal.condiciones.texto'),
        el('p', {}, el('a', { href: '#/creditos' }, t('creditos.titulo')))),
      bloque('legal.cambios.titulo', parrafo('legal.cambios.texto')),
      el('p', {}, el('a', { class: 'boton boton-mini', href: hayCurso ? '#/lecciones' : '#/inicio' }, t('creditos.volver')))));
}

/**
 * Aviso de almacenamiento («cookies»): sale abajo hasta que se pulsa «Entendido». Solo informa (sin cookies ni nada que
 * necesite permiso) y cuenta lo que sale del dispositivo de serie: la copia en la nube y los avisos de errores.
 * Se vuelve a llamar al cambiar de idioma para cambiar sus textos.
 */
export function pintarAvisoDeDatos() {
  document.querySelector('.aviso-datos')?.remove();
  try {
    if (localStorage.getItem(CLAVE_AVISO)) return;
  } catch {
    return; // sin almacenamiento no se podría recordar que ya se ha visto
  }
  const cerrar = () => {
    try { localStorage.setItem(CLAVE_AVISO, '1'); } catch { /* sin almacenamiento */ }
    aviso.remove();
  };
  const aviso = el('aside', { class: 'aviso-datos caja', role: 'region', 'aria-label': t('legal.cookies.titulo') },
    el('p', {}, t('aviso.texto')),
    el('div', { class: 'aviso-datos-botones' },
      el('a', { class: 'boton boton-mini', href: '#/legal' }, t('aviso.mas')),
      el('button', { type: 'button', class: 'boton boton-mini boton-principal', onclick: () => { sonar('clic'); cerrar(); } }, t('aviso.ok'))));
  document.body.append(aviso);
}
