// Pantalla «Perfil»: nombre, progreso, ajustes, copia de seguridad y reinicio. Todo se guarda solo en este dispositivo.

import { el, poner, enLinea } from '../dom.js';
import { t, locale, IDIOMAS_VISIBLES, idioma, cambiarIdioma } from '../i18n.js';
import {
  nombre, cambiarNombre, resumenLeccion, tarjetas, racha, actividad, reiniciarProgreso,
  copiaCompleta, importarCopia,
} from '../progress.js';
import { etapa } from '../srs.js';
import { ajuste, cambiarAjuste } from '../ajustes.js';
import { prepararVoces, nombreVoz, pronunciar, sonar, ayudaVoz, abrirInstalacionDeVoces } from '../sonidos.js';
import { decir } from '../tutor.js';
import { curso } from '../curso.js';
import { todasLasEstrellas } from '../../juegos/motor.js';
import { LOGROS, logrosGanados, comprobarLogros } from '../logros.js';

function estadisticas(resultados) {
  const lecciones = resultados.filter(r => r.leccion);
  let terminadas = 0, ejercicios = 0, completados = 0, aciertos = 0, errores = 0;
  for (const { leccion } of lecciones) {
    const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
    if (r.terminada) terminadas += 1;
    ejercicios += r.total;
    completados += r.completados;
    aciertos += r.aciertos;
    errores += r.errores;
  }
  const cartas = tarjetas();
  const dominadas = cartas.filter(t => etapa(t.srs).clave === 'dominada').length;
  const repasos = Object.values(actividad()).reduce((suma, d) => suma + (d.repasos ?? 0), 0);
  const porcentaje = aciertos + errores ? Math.round((aciertos / (aciertos + errores)) * 100) : null;
  const notas = Object.values(todasLasEstrellas());
  const estrellas = notas.reduce((suma, n) => suma + n, 0);
  const perfectas = notas.filter(n => n >= 3).length;
  return { lecciones: lecciones.length, terminadas, ejercicios, completados, aciertos, errores, porcentaje, cartas: cartas.length, dominadas, repasos, estrellas, perfectas };
}

function dato(titulo, valor, detalle) {
  return el('div', { class: 'dato' },
    el('dt', {}, titulo),
    el('dd', {}, el('span', { class: 'dato-valor' }, valor), detalle && el('span', { class: 'dato-detalle' }, detalle)));
}

function seccionNombre() {
  const entrada = el('input', { id: 'perfil-nombre', type: 'text', value: nombre(), maxlength: '40', autocomplete: 'nickname' });
  const form = el('form', { class: 'formulario en-linea' },
    el('div', { class: 'campo' }, el('label', { for: 'perfil-nombre' }, t('perfil.comoTeLlamo')), entrada),
    el('button', { type: 'submit', class: 'boton' }, t('comun.guardar')));
  form.addEventListener('submit', e => {
    e.preventDefault();
    cambiarNombre(entrada.value);
    sonar('guardar');
    document.querySelector('#app h1').textContent = nombre() ? t('perfil.de', { nombre: nombre() }) : t('menu.perfil');
    decir(entrada.value.trim()
      ? t('perfil.encantada', { nombre: entrada.value.trim() })
      : t('perfil.sinNombre'), 'contenta');
  });
  return el('section', { class: 'caja' }, el('h2', {}, t('perfil.tuNombre')), form);
}

/** La vitrina de logros: los ganados con su medalla y su fecha; los demás, a oscuras y con lo que hay que hacer. */
function seccionLogros() {
  comprobarLogros();
  const ganados = logrosGanados();
  const n = LOGROS.filter(l => ganados[l.id]).length;
  const fecha = ms => new Date(ms).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
  const vitrina = el('ul', { class: 'lg-vitrina' }, LOGROS.map(l => {
    const tiene = Boolean(ganados[l.id]);
    const medalla = el('button', {
      type: 'button',
      class: `lg-pieza${tiene ? ' ganado' : ''}`,
      'aria-label': `${t(`logros.${l.id}.nombre`)}: ${t(`logros.${l.id}.desc`)}${tiene ? ` · ${fecha(ganados[l.id])}` : ` · ${t('logros.bloqueado')}`}`,
      'data-sonido': tiene ? 'moneda' : 'nada',
    },
    el('span', { class: 'lg-pieza-medalla', 'aria-hidden': 'true' }, tiene ? l.icono : '🔒'),
    el('span', { class: 'lg-pieza-nombre', 'aria-hidden': 'true' }, tiene ? t(`logros.${l.id}.nombre`) : '???'));
    medalla.addEventListener('click', () => {
      medalla.classList.remove('gira'); void medalla.offsetWidth; medalla.classList.add('gira');
      decir(tiene
        ? t('logros.tutoraGanado', { nombre: t(`logros.${l.id}.nombre`), fecha: fecha(ganados[l.id]) })
        : t('logros.tutoraFalta', { desc: t(`logros.${l.id}.desc`) }), tiene ? 'contenta' : 'pensando');
    });
    return el('li', {}, medalla);
  }));
  return el('section', { class: 'caja' },
    el('h2', {}, t('logros.titulo'), ' ', el('span', { class: 'lg-cuenta' }, `${n}/${LOGROS.length}`)),
    el('p', { class: 'aprox' }, t('logros.intro')),
    vitrina);
}

function seccionProgreso(resultados) {
  const s = estadisticas(resultados);
  const r = racha();
  return el('section', { class: 'caja' },
    el('h2', {}, t('perfil.tuProgreso')),
    el('dl', { class: 'datos' },
      dato(t('perfil.leccionesTerminadas'), `${s.terminadas}/${s.lecciones}`),
      dato(t('perfil.estrellas'), `${s.estrellas}/${s.lecciones * 3}`, t('perfil.perfectas', { n: s.perfectas })),
      dato(t('perfil.aciertos'), String(s.aciertos), s.porcentaje !== null ? t('perfil.porcentaje', { n: s.porcentaje }) : null),
      dato(t('perfil.errores'), String(s.errores)),
      dato(t('perfil.enCuaderno'), String(s.cartas), t('perfil.dominadas', { n: s.dominadas })),
      dato(t('perfil.repasos'), String(s.repasos)),
      dato(t('perfil.racha'), t('srs.dias', { n: r }), t('perfil.rachaDetalle'))));
}

function interruptor(id, texto, nombreAjuste, alCambiar) {
  const casilla = el('input', { id, type: 'checkbox' });
  casilla.checked = Boolean(ajuste(nombreAjuste));
  casilla.addEventListener('change', () => {
    cambiarAjuste(nombreAjuste, casilla.checked);
    alCambiar?.(casilla.checked);
  });
  return el('div', { class: 'campo-casilla' }, casilla, el('label', { for: id }, texto));
}

function seccionAjustes() {
  const idiomas = el('div', { class: 'filtros', role: 'group', 'aria-labelledby': 'titulo-idioma' },
    [el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(ajuste('idioma') === 'auto') }, t('ajustes.automatico')),
      ...IDIOMAS_VISIBLES.map(i => {
        const b = el('button', {
          type: 'button', class: 'boton boton-mini', lang: i.clave,
          'aria-pressed': String(ajuste('idioma') !== 'auto' && idioma() === i.clave),
        }, i.nombre);
        b.addEventListener('click', () => {
          sonar('elegir');
          cambiarIdioma(i.clave);
        });
        return b;
      })]);
  idiomas.firstElementChild.addEventListener('click', () => {
    sonar('elegir');
    cambiarIdioma('auto');
  });
  const tema = el('div', { class: 'filtros', role: 'group', 'aria-labelledby': 'titulo-tema' },
    [['auto', t('ajustes.automatico')], ['oscuro', t('ajustes.oscuro')], ['claro', t('ajustes.diurno')]].map(([valor, texto]) => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(ajuste('tema') === valor) }, texto);
      b.addEventListener('click', () => {
        cambiarAjuste('tema', valor);
        sonar('interruptor');
        tema.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
      return b;
    }));

  const velocidad = el('input', { id: 'velocidad-voz', type: 'range', min: '0.5', max: '1.2', step: '0.1', value: String(ajuste('velocidadVoz')) });
  velocidad.addEventListener('change', () => cambiarAjuste('velocidadVoz', Number(velocidad.value)));

  const enOrdenadorSinEdge = !window.Capacitor?.isNativePlatform?.() && !/Edg\/|Android|iPhone|iPad/.test(navigator.userAgent);
  // La voz es la del dispositivo. Si no hay, se dice aquí y se ofrece la explicación de cómo instalarla.
  const estadoVoz = el('p', { class: 'aprox' }, t('ajustes.buscandoVoz'));
  const pintarVoz = () => {
    const voz = nombreVoz();
    estadoVoz.textContent = voz ? t('ajustes.vozEncontrada', { voz }) : t('ajustes.sinVoz');
  };
  const alCambiarVoz = () => {
    if (estadoVoz.isConnected) pintarVoz();
    else window.removeEventListener('voz-cambiada', alCambiarVoz);
  };
  prepararVoces().then(pintarVoz);
  window.addEventListener('voz-cambiada', alCambiarVoz);

  return el('section', { class: 'caja' },
    el('h2', {}, t('ajustes.titulo')),
    el('h3', { id: 'titulo-idioma' }, t('ajustes.idioma')),
    el('p', { class: 'aprox' }, t('ajustes.idiomaAyuda')),
    idiomas,
    el('h3', { id: 'titulo-tema' }, t('ajustes.tema')),
    tema,
    el('h3', {}, t('ajustes.sonido')),
    interruptor('ajuste-efectos', t('ajustes.efectos'), 'efectos', activo => activo && sonar('bien')),
    interruptor('ajuste-voz-tutora', t('ajustes.pitidos'), 'vozTutora'),
    el('h3', {}, t('ajustes.voz')),
    estadoVoz,
    // En un ordenador con otro navegador, Edge es la forma más fácil de tener voz en todos los idiomas.
    enOrdenadorSinEdge && el('p', { class: 'aprox sin-voz' }, enLinea(t('ajustes.mejorEdge'))),
    el('button', { type: 'button', class: 'boton boton-mini sin-voz', onclick: () => { decir(ayudaVoz(), 'apurada'); abrirInstalacionDeVoces(); } }, t('ajustes.comoInstalarVoz')),
    el('div', { class: 'campo con-voz' }, el('label', { for: 'velocidad-voz' }, t('ajustes.velocidad')), velocidad),
    el('button', {
      type: 'button',
      class: 'boton con-voz',
      onclick: () => pronunciar(curso.hola || curso.nativo),
    }, t('ajustes.probarVoz')));
}

function seccionCopia(repintar) {
  const descargar = el('button', { type: 'button', class: 'boton' }, t('copia.descargar'));
  descargar.addEventListener('click', () => {
    const fecha = new Date().toISOString().slice(0, 10);
    const archivo = new Blob([JSON.stringify(copiaCompleta(), null, 2)], { type: 'application/json' });
    const enlace = el('a', { href: URL.createObjectURL(archivo), download: `${curso.prefijo}-progreso-${fecha}.json` });
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    sonar('guardar');
    decir(t('copia.descargadaTutora'), 'contenta');
  });

  const selector = el('input', { id: 'cargar-copia', type: 'file', accept: '.json,application/json', class: 'solo-lector' });
  const cargar = el('label', { for: 'cargar-copia', class: 'boton', tabindex: '0', role: 'button' }, t('copia.cargar'));
  cargar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selector.click(); } });
  selector.addEventListener('change', async () => {
    const archivo = selector.files?.[0];
    if (!archivo) return;
    try {
      const ok = importarCopia(JSON.parse(await archivo.text()));
      if (!ok) throw new Error();
      sonar('bien');
      repintar();
      decir(t('copia.cargadaTutora'), 'contenta');
    } catch {
      sonar('mal');
      decir(t('copia.noValida'), 'confundida');
    }
    selector.value = '';
  });

  return el('section', { class: 'caja' },
    el('h2', {}, t('copia.titulo')),
    el('p', {}, t('copia.texto')),
    el('div', { class: 'botonera' }, descargar, cargar, selector));
}

function seccionReinicio(repintar) {
  const conCuaderno = el('input', { id: 'reinicio-cuaderno', type: 'checkbox' });
  const boton = el('button', { type: 'button', class: 'boton boton-peligro' }, t('reinicio.boton'));
  boton.addEventListener('click', () => {
    if (!confirm(t(conCuaderno.checked ? 'reinicio.confirmarTodo' : 'reinicio.confirmar'))) return;
    reiniciarProgreso({ vaciarCuaderno: conCuaderno.checked });
    sonar('quitar');
    repintar();
    decir(t('reinicio.tutora'), 'sorprendida');
  });
  return el('section', { class: 'caja zona-peligro' },
    el('h2', {}, t('reinicio.titulo')),
    el('p', {}, t('reinicio.texto')),
    el('div', { class: 'campo-casilla' }, conCuaderno, el('label', { for: 'reinicio-cuaderno' }, t('reinicio.vaciarCuaderno'))),
    boton);
}

export function pintarPerfil(app, { resultados }) {
  const repintar = () => pintarPerfil(app, { resultados });
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, nombre() ? t('perfil.de', { nombre: nombre() }) : t('menu.perfil'))),
    seccionNombre(),
    seccionProgreso(resultados),
    seccionLogros(),
    seccionAjustes(),
    seccionCopia(repintar),
    seccionReinicio(repintar));
  decir(nombre() ? t('perfil.tutora', { nombre: nombre() }) : t('perfil.tutoraSinNombre'));
}
