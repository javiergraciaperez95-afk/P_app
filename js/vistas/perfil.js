// Pantalla «Perfil»: nombre, progreso, ajustes, copia de seguridad y reinicio. Todo se guarda solo en este dispositivo.

import { el, poner, enLinea } from '../dom.js';
import { t, locale, IDIOMAS_VISIBLES, idioma, cambiarIdioma } from '../i18n.js';
import {
  nombre, cambiarNombre, resumenLeccion, tarjetas, racha, mejorRacha, actividad, reiniciarProgreso,
  copiaCompleta, importarCopia,
} from '../progress.js';
import { etapa } from '../srs.js';
import { ajuste, cambiarAjuste, modoCalma } from '../ajustes.js';
import { prepararVoces, nombreVoz, pronunciar, sonar, ayudaVoz, abrirInstalacionDeVoces } from '../sonidos.js';
import { decir } from '../tutor.js';
import { curso } from '../curso.js';
import { todasLasEstrellas } from '../../juegos/motor.js';
import { LOGROS, logrosGanados, comprobarLogros } from '../logros.js';
import {
  nubeActiva, nube, alCambiarNube, numeroCuenta, numeroBonito, usarNumero, borrarCuentaNube,
  pedirCodigo, comprobarCodigo, unirCorreo, recuperarConCorreo, correoDeLaCuenta,
} from '../nube.js';

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

// ----- La cuenta (al estilo Mullvad): el número, entrar con otro y, si se quiere, un correo -----
function seccionCuenta(repintar) {
  if (!nubeActiva) return null;
  const numero = numeroCuenta();
  const estado = el('p', { class: 'cu-estado', 'aria-live': 'polite' });
  const pintarEstado = () => {
    estado.className = `cu-estado cu-${nube.estado}`;
    estado.textContent = t(`cuenta2.estado.${nube.estado}`);
  };
  pintarEstado();
  const quitar = alCambiarNube(() => { if (!estado.isConnected) { quitar(); return; } pintarEstado(); });

  // el número, tapado hasta que se toca (como en Mullvad)
  const cifras = el('button', { type: 'button', class: 'cu-numero tapado', 'data-sonido': 'voltear', 'aria-label': t('cuenta2.ver') }, numeroBonito(numero));
  cifras.addEventListener('click', () => cifras.classList.toggle('tapado'));
  const copiar = el('button', { type: 'button', class: 'boton boton-mini', 'data-sonido': 'guardar' }, t('cuenta2.copiar'));
  copiar.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(numero); decir(t('cuenta2.copiado'), 'contenta'); }
    catch { cifras.classList.remove('tapado'); decir(t('cuenta2.copiaAMano'), 'pensando'); }
  });
  const caduca = el('p', { class: 'aprox cu-caduca' }, t('cuenta2.caduca'));

  // entrar con el número de otro dispositivo
  const otro = el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: '1234 5678 9012 3456', 'aria-label': t('cuenta2.otroNumero'), maxlength: '24' });
  const entrar = el('button', { type: 'submit', class: 'boton' }, t('cuenta2.entrar'));
  const formEntrar = el('form', { class: 'formulario en-linea' }, el('div', { class: 'campo' }, el('label', {}, t('cuenta2.otroNumero')), otro), entrar);
  formEntrar.addEventListener('submit', async e => {
    e.preventDefault();
    entrar.disabled = true;
    try {
      await usarNumero(otro.value);
      sonar('fanfarria');
      decir(t('cuenta2.dentro'), 'contenta');
      repintar();
    } catch (error) {
      sonar('mal');
      decir(t(error.motivo === 'formato' ? 'cuenta2.malFormato' : error.motivo === 'noExiste' ? 'cuenta2.noExiste' : 'cuenta2.sinConexion'), 'confundida');
    } finally { entrar.disabled = false; }
  });

  // el correo: un código de 6 cifras; sirve para que no caduque o para recuperar el número
  const zonaCorreo = el('div', { class: 'cu-correo' });
  const pintarCorreo = (unido = null) => {
    if (unido) {
      caduca.textContent = t('cuenta2.noCaduca');
      poner(zonaCorreo, el('p', {}, '✉️ ', t('cuenta2.correoUnido', { correo: unido })));
      return;
    }
    const correo = el('input', { type: 'email', autocomplete: 'email', placeholder: t('cuenta2.correoEjemplo'), 'aria-label': t('cuenta2.correo') });
    const codigo = el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '8', placeholder: '123456', 'aria-label': t('cuenta2.codigo'), hidden: true });
    const enviar = el('button', { type: 'button', class: 'boton' }, t('cuenta2.enviarCodigo'));
    const unir = el('button', { type: 'button', class: 'boton boton-principal', hidden: true }, t('cuenta2.unir'));
    const recuperar = el('button', { type: 'button', class: 'boton', hidden: true }, t('cuenta2.recuperar'));
    const ayuda = el('p', { class: 'aprox' }, t('cuenta2.correoAyuda'));
    enviar.addEventListener('click', async () => {
      if (!correo.checkValidity() || !correo.value.trim()) { correo.focus(); return; }
      enviar.disabled = true;
      try {
        await pedirCodigo(correo.value);
        codigo.hidden = false; unir.hidden = false; recuperar.hidden = false;
        ayuda.textContent = t('cuenta2.codigoEnviado', { correo: correo.value.trim() });
        codigo.focus();
        sonar('buzon');
      } catch { sonar('mal'); decir(t('cuenta2.sinConexion'), 'confundida'); }
      finally { enviar.disabled = false; }
    });
    const conCodigo = accion => async () => {
      if (!codigo.value.trim()) { codigo.focus(); return; }
      unir.disabled = true; recuperar.disabled = true;
      try {
        const pase = await comprobarCodigo(correo.value, codigo.value);
        if (accion === 'unir') {
          await unirCorreo(pase);
          sonar('fanfarria');
          decir(t('cuenta2.unidoTutora'), 'contenta');
        } else {
          await recuperarConCorreo(pase);
          sonar('fanfarria');
          decir(t('cuenta2.recuperadoTutora'), 'contenta');
        }
        repintar();
      } catch (error) {
        sonar('mal');
        decir(t(error.motivo === 'sinCuenta' ? 'cuenta2.sinCuentaCorreo' : 'cuenta2.codigoMal'), 'confundida');
      } finally { unir.disabled = false; recuperar.disabled = false; }
    };
    unir.addEventListener('click', conCodigo('unir'));
    recuperar.addEventListener('click', conCodigo('recuperar'));
    poner(zonaCorreo,
      el('h3', {}, t('cuenta2.correoTitulo')),
      ayuda,
      el('div', { class: 'cu-fila' }, correo, enviar),
      el('div', { class: 'cu-fila' }, codigo, unir, recuperar));
  };
  pintarCorreo();
  correoDeLaCuenta().then(c => { if (c && zonaCorreo.isConnected) pintarCorreo(c); });

  const borrar = el('button', { type: 'button', class: 'boton boton-mini boton-peligro' }, t('cuenta2.borrar'));
  borrar.addEventListener('click', async () => {
    if (!confirm(t('cuenta2.borrarConfirmar'))) return;
    try { await borrarCuentaNube(); sonar('quitar'); decir(t('cuenta2.borrada'), 'sorprendida'); repintar(); }
    catch { sonar('mal'); decir(t('cuenta2.sinConexion'), 'confundida'); }
  });

  return el('section', { class: 'caja cu-cuenta' },
    el('h2', {}, t('cuenta2.titulo')),
    el('p', { class: 'aprox' }, t('cuenta2.intro')),
    el('div', { class: 'cu-fila' }, cifras, copiar),
    caduca,
    estado,
    formEntrar,
    zonaCorreo,
    el('div', { class: 'botonera' }, borrar));
}

// ----- La actividad de las últimas 12 semanas, como un calendario de cuadritos -----
const claveDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function seccionActividad() {
  const dias = actividad() ?? {};
  const SEMANAS = 12;
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);
  // empieza en lunes, para que cada fila sea un día de la semana
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7) - (SEMANAS - 1) * 7);
  const cuanto = d => (d?.ejercicios ?? 0) + (d?.repasos ?? 0);
  const nivel = n => (n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 40 ? 3 : 4);
  const celdas = [];
  let activos = 0;
  for (let k = 0; k < SEMANAS * 7; k++) {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + k);
    const futuro = d > hoy;
    const datos = dias[claveDia(d)];
    const n = cuanto(datos);
    if (n) activos += 1;
    const fecha = d.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
    const celda = el('button', {
      type: 'button',
      class: `ac-dia ac-${futuro ? 'futuro' : nivel(n)}${claveDia(d) === claveDia(hoy) ? ' hoy' : ''}`,
      disabled: futuro,
      'aria-label': `${fecha}: ${t('perfil.diaResumen', { pasos: datos?.ejercicios ?? 0, repasos: datos?.repasos ?? 0 })}`,
      'data-sonido': n ? 'moneda' : 'nada',
    });
    celda.addEventListener('click', () => {
      decir(n
        ? t('perfil.diaTutora', { fecha, pasos: datos?.ejercicios ?? 0, repasos: datos?.repasos ?? 0, lecciones: datos?.lecciones ?? 0 })
        : t('perfil.diaVacio', { fecha }), n ? 'contenta' : 'pensando');
    });
    celdas.push(celda);
  }
  return el('section', { class: 'caja' },
    el('h2', {}, t('perfil.actividad')),
    el('div', { class: 'ac-datos' },
      el('span', {}, '🔥 ', t('perfil.rachaAhora', { n: racha() })),
      el('span', {}, '🏆 ', t('perfil.rachaMejor', { n: mejorRacha() })),
      el('span', {}, '📅 ', t('perfil.diasActivos', { n: activos }))),
    el('div', { class: 'ac-calendario', style: `--semanas:${SEMANAS}` }, celdas),
    el('p', { class: 'ac-leyenda aprox' }, t('perfil.menos'), ' ',
      [0, 1, 2, 3, 4].map(k => el('i', { class: `ac-dia ac-${k}`, 'aria-hidden': 'true' })), ' ', t('perfil.mas')));
}

// ----- Cuánto llevas de cada nivel (A1, A2, B1, B2) -----
function seccionNiveles(resultados, capitulos) {
  const nivelDe = new Map(capitulos.map(c => [String(c.numero), c.nivel]));
  const cuenta = {};
  for (const { leccion } of resultados.filter(r => r.leccion)) {
    const n = nivelDe.get(String(leccion.capitulo));
    if (!n) continue;
    cuenta[n] ??= { hechas: 0, total: 0 };
    cuenta[n].total += 1;
    if (resumenLeccion(leccion.id, leccion.idsEjercicios).terminada) cuenta[n].hechas += 1;
  }
  const niveles = Object.keys(cuenta).sort();
  if (!niveles.length) return null;
  return el('section', { class: 'caja' },
    el('h2', {}, t('perfil.niveles')),
    el('ul', { class: 'nv-lista' }, niveles.map(n => {
      const { hechas, total } = cuenta[n];
      const parte = total ? hechas / total : 0;
      return el('li', { class: `nv-fila nivel-${n.toLowerCase()}` },
        el('span', { class: 'nv-insignia' }, n),
        el('span', { class: 'nv-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${parte}` })),
        el('span', { class: 'nv-cuenta' }, `${hechas}/${total}`, parte === 1 ? ' ✔' : ''));
    })));
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

  // comodidad: el modo calma (de serie sigue a «reducir movimiento») y el tamaño del texto
  const calma = interruptor('ajuste-calma', t('ajustes.calma'), 'calma');
  calma.querySelector('input').checked = modoCalma();
  const texto = el('div', { class: 'filtros', role: 'group', 'aria-labelledby': 'titulo-texto' },
    [['normal', t('ajustes.textoNormal')], ['grande', t('ajustes.textoGrande')]].map(([valor, nombre]) => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(ajuste('texto') === valor) }, nombre);
      b.addEventListener('click', () => {
        cambiarAjuste('texto', valor);
        sonar('interruptor');
        texto.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
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
    el('h3', {}, t('ajustes.comodidad')),
    calma,
    el('h3', { id: 'titulo-texto' }, t('ajustes.texto')),
    texto,
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

export function pintarPerfil(app, { resultados, capitulos = [] }) {
  const repintar = () => pintarPerfil(app, { resultados, capitulos });
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, nombre() ? t('perfil.de', { nombre: nombre() }) : t('menu.perfil'))),
    seccionNombre(),
    seccionCuenta(repintar),
    seccionProgreso(resultados),
    seccionActividad(),
    seccionNiveles(resultados, capitulos),
    seccionLogros(),
    seccionAjustes(),
    seccionCopia(repintar),
    seccionReinicio(repintar));
  decir(nombre() ? t('perfil.tutora', { nombre: nombre() }) : t('perfil.tutoraSinNombre'));
}
