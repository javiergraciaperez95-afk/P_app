// Pantalla «Perfil»: nombre, progreso, cuenta, ajustes y reinicio.

import { el, poner } from '../dom.js';
import {
  nombre, cambiarNombre, resumenLeccion, tarjetas, racha, actividad, reiniciarProgreso,
  todosLosDatos, importarCopia,
} from '../progress.js';
import { etapa } from '../srs.js';
import { ajuste, cambiarAjuste } from '../ajustes.js';
import { prepararVoces, nombreVozPortuguesa, pronunciar, sonar, ayudaVoz } from '../sonidos.js';
import {
  nubeConfigurada, nube, usuarioActual, entrar, crearCuenta, salir, sincronizar, alCambiarNube,
  recuperarContrasena, cambiarContrasena, borrarDatosNube,
} from '../sync.js';
import { decir } from '../tutor.js';
import { t, IDIOMAS, idioma, cambiarIdioma, horaCorta } from '../i18n.js';
import { textoAviso } from '../lessons.js';

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
  const dominadas = cartas.filter(c => etapa(c.srs).clave === 'dominada').length;
  const repasos = Object.values(actividad()).reduce((suma, d) => suma + (d.repasos ?? 0), 0);
  const porcentaje = aciertos + errores ? Math.round((aciertos / (aciertos + errores)) * 100) : null;
  return { lecciones: lecciones.length, terminadas, ejercicios, completados, aciertos, errores, porcentaje, cartas: cartas.length, dominadas, repasos };
}

function dato(titulo, valor, detalle) {
  return el('div', { class: 'dato' },
    el('dt', {}, titulo),
    el('dd', {}, el('span', { class: 'dato-valor' }, valor), detalle && el('span', { class: 'dato-detalle' }, detalle)));
}

function seccionNombre() {
  const entrada = el('input', { id: 'perfil-nombre', type: 'text', value: nombre(), maxlength: '40', autocomplete: 'nickname' });
  const form = el('form', { class: 'formulario en-linea' },
    el('div', { class: 'campo' }, el('label', { for: 'perfil-nombre' }, t('profile.whatName')), entrada),
    el('button', { type: 'submit', class: 'boton' }, t('common.save')));
  form.addEventListener('submit', e => {
    e.preventDefault();
    cambiarNombre(entrada.value);
    sonar('guardar');
    document.querySelector('#app h1').textContent = nombre() ? t('profile.titleWithName', { nombre: nombre() }) : t('profile.title');
    decir(entrada.value.trim() ? t('tutor.niceName', { nombre: entrada.value.trim() }) : t('tutor.noName'), 'contenta');
  });
  return el('section', { class: 'caja' }, el('h2', {}, t('profile.yourName')), form);
}

function seccionProgreso(resultados) {
  const s = estadisticas(resultados);
  const r = racha();
  return el('section', { class: 'caja' },
    el('h2', {}, t('profile.yourProgress')),
    el('dl', { class: 'datos' },
      dato(t('profile.lessonsFinished'), `${s.terminadas}/${s.lecciones}`),
      dato(t('profile.exercisesDone'), `${s.completados}/${s.ejercicios}`),
      dato(t('profile.correct'), String(s.aciertos), s.porcentaje !== null ? t('profile.accuracy', { n: s.porcentaje }) : null),
      dato(t('profile.mistakes'), String(s.errores)),
      dato(t('profile.inNotebook'), String(s.cartas), t('profile.mastered', { n: s.dominadas })),
      dato(t('profile.reviewsDone'), String(s.repasos)),
      dato(t('profile.streak'), t('profile.days', { n: r }), t('profile.streakDetail'))));
}

// ---------------------------------------------------------------------------
// Cuenta: registro, inicio de sesión, recuperar contraseña…
// ---------------------------------------------------------------------------

let pestanaCuenta = 'entrar'; // entrar · crear · recuperar

function campo(id, texto, atributos) {
  const entrada = el('input', { id, ...atributos });
  return { entrada, nodo: el('div', { class: 'campo' }, el('label', { for: id }, texto), entrada) };
}

/** Campo de contraseña con botón para verla. */
function campoContrasena(id, texto, autocompletar) {
  const c = campo(id, texto, { type: 'password', required: true, minlength: '6', autocomplete: autocompletar });
  const ver = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false', 'aria-controls': id }, t('account.showPassword'));
  ver.addEventListener('click', () => {
    const visible = c.entrada.type === 'password';
    c.entrada.type = visible ? 'text' : 'password';
    ver.setAttribute('aria-pressed', String(visible));
    ver.textContent = t(visible ? 'account.hidePassword' : 'account.showPassword');
  });
  c.nodo.append(el('div', { class: 'campo-extra' }, ver));
  return c;
}

/** Formulario genérico: muestra «Un momento…», los errores y el resultado. */
function formulario(hijos, textoBoton, accion, { principal = true } = {}) {
  const mensaje = el('p', { class: 'mensaje-formulario', role: 'status' });
  const enviar = el('button', { type: 'submit', class: `boton ${principal ? 'boton-principal' : ''}` }, textoBoton);
  const form = el('form', { class: 'formulario', novalidate: true }, hijos, mensaje, el('div', { class: 'botonera' }, enviar));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const invalido = [...form.querySelectorAll('input')].find(i => !i.checkValidity());
    if (invalido) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = invalido.type === 'email'
        ? t('account.error.email')
        : invalido.type === 'password' || invalido.minLength > 0
          ? t('account.error.passwordShort')
          : t('account.error.fillAll');
      invalido.focus();
      return;
    }
    if (!nubeConfigurada) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = t('account.notConnectedForm');
      return;
    }
    enviar.disabled = true;
    mensaje.className = 'mensaje-formulario';
    mensaje.textContent = t('common.oneMoment');
    try {
      const resultado = await accion();
      mensaje.className = 'mensaje-formulario bien';
      mensaje.textContent = resultado ?? '';
    } catch (error) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = error.message;
      sonar('mal');
      decir(t('tutor.formError'), 'confundida');
    } finally {
      enviar.disabled = false;
    }
  });
  return form;
}

function formularioEntrar() {
  const correo = campo('cuenta-correo', t('account.email'), { type: 'email', required: true, autocomplete: 'email' });
  const clave = campoContrasena('cuenta-clave', t('account.password'), 'current-password');
  return formulario([correo.nodo, clave.nodo], t('account.signIn'), async () => {
    await entrar(correo.entrada.value.trim(), clave.entrada.value);
    sonar('bien');
    decir(t('tutor.signedIn'), 'contenta');
    return t('account.signedIn');
  });
}

function formularioCrear() {
  const nombreCampo = campo('cuenta-nombre', t('account.nameOptional'), { type: 'text', autocomplete: 'nickname', value: nombre(), maxlength: '40' });
  const correo = campo('cuenta-correo-nuevo', t('account.email'), { type: 'email', required: true, autocomplete: 'email' });
  const clave = campoContrasena('cuenta-clave-nueva', t('account.passwordNew'), 'new-password');
  const repetir = campoContrasena('cuenta-clave-repetir', t('account.passwordRepeat'), 'new-password');
  return formulario([nombreCampo.nodo, correo.nodo, clave.nodo, repetir.nodo], t('account.create'), async () => {
    if (clave.entrada.value !== repetir.entrada.value) throw new Error(t('account.error.passwordsDiffer'));
    if (nombreCampo.entrada.value.trim()) cambiarNombre(nombreCampo.entrada.value);
    const confirmar = await crearCuenta(correo.entrada.value.trim(), clave.entrada.value, nombreCampo.entrada.value.trim());
    sonar('bien');
    decir(t(confirmar ? 'tutor.accountCreatedConfirm' : 'tutor.accountCreated'), 'contenta');
    return t(confirmar ? 'account.createdConfirm' : 'account.created');
  });
}

function formularioRecuperar() {
  const correo = campo('cuenta-correo-recuperar', t('account.yourEmail'), { type: 'email', required: true, autocomplete: 'email' });
  return formulario([
    el('p', { class: 'aprox' }, t('account.recoverHelp')),
    correo.nodo,
  ], t('account.sendLink'), async () => {
    await recuperarContrasena(correo.entrada.value.trim());
    decir(t('tutor.recoverSent'));
    return t('account.recoverSent');
  });
}

function formularioNuevaContrasena(titulo) {
  const clave = campoContrasena('cuenta-clave-cambio', t('account.passwordNew'), 'new-password');
  const repetir = campoContrasena('cuenta-clave-cambio-repetir', t('account.passwordRepeat'), 'new-password');
  return el('div', {},
    el('h3', {}, titulo),
    formulario([clave.nodo, repetir.nodo], t('account.savePassword'), async () => {
      if (clave.entrada.value !== repetir.entrada.value) throw new Error(t('account.error.passwordsDiffer'));
      await cambiarContrasena(clave.entrada.value);
      sonar('guardar');
      decir(t('tutor.passwordChanged'), 'contenta');
      return t('account.passwordChanged');
    }, { principal: false }));
}

function seccionCuenta() {
  const seccion = el('section', { class: 'caja', id: 'cuenta' });

  function textoEstado() {
    const mensaje = nube.mensaje ? textoAviso(nube.mensaje, t) : '';
    if (nube.estado === 'sincronizada') {
      const hora = nube.ultima ? ` (${horaCorta(nube.ultima)})` : '';
      return `✔ ${t('account.state.synced', { hora })}${mensaje ? ` ⚠ ${mensaje}` : ''}`;
    }
    if (nube.estado === 'error') return `⚠ ${mensaje}`;
    return t(`account.state.${nube.estado}`);
  }

  function pintarConSesion(usuario, estado) {
    const borrar = el('button', { type: 'button', class: 'boton boton-peligro' }, t('account.deleteCloudData'));
    borrar.addEventListener('click', async () => {
      if (!confirm(t('account.deleteCloudConfirm'))) return;
      try {
        await borrarDatosNube();
        await salir();
        decir(t('tutor.cloudDeleted'), 'sorprendida');
      } catch (error) {
        decir(error.message, 'confundida');
      }
    });
    poner(seccion,
      el('h2', {}, t('account.title')),
      el('p', {}, `${t('account.signedInAs')} `, el('strong', {}, usuario.email)),
      estado,
      el('div', { class: 'botonera' },
        el('button', { type: 'button', class: 'boton', onclick: () => sincronizar() }, `⟳ ${t('account.syncNow')}`),
        el('button', {
          type: 'button',
          class: 'boton',
          onclick: async () => { await salir(); sonar('clic'); decir(t('tutor.signedOut')); },
        }, t('account.signOut'))),
      el('details', { class: 'plegable' },
        el('summary', {}, t('account.changePassword')),
        formularioNuevaContrasena(t('account.newPassword'))),
      el('details', { class: 'plegable' },
        el('summary', {}, t('account.deleteCloudData')),
        el('p', { class: 'aprox' }, t('account.deleteCloudHelp')),
        borrar));
  }

  function pintarSinSesion(estado) {
    const pestanas = [['entrar', 'account.signIn'], ['crear', 'account.create'], ['recuperar', 'account.forgot']];
    const barra = el('div', { class: 'filtros pestanas', role: 'group', 'aria-label': t('account.options') },
      pestanas.map(([clave, texto]) => el('button', {
        type: 'button',
        class: 'boton boton-mini',
        'aria-pressed': String(pestanaCuenta === clave),
        onclick: () => {
          pestanaCuenta = clave;
          sonar('clic');
          pintar();
          seccion.querySelector('input')?.focus();
        },
      }, t(texto))));
    const form = { entrar: formularioEntrar, crear: formularioCrear, recuperar: formularioRecuperar }[pestanaCuenta]();
    poner(seccion,
      el('h2', {}, t('account.title')),
      !nubeConfigurada && el('p', { class: 'aviso-nube', role: 'note' }, `⚠ ${t('account.notConnected')}`),
      estado,
      el('p', { class: 'aprox' }, t('account.why')),
      barra,
      form);
  }

  function pintar() {
    const usuario = usuarioActual();
    const estado = el('p', { class: `estado-nube nube-${nube.estado}`, role: 'status' }, textoEstado());
    if (nube.recuperando && usuario) {
      poner(seccion, el('h2', {}, t('account.title')), formularioNuevaContrasena(t('account.setNewPassword')));
      decir(t('tutor.setNewPassword'), 'normal');
    } else if (usuario) {
      pintarConSesion(usuario, estado);
    } else {
      pintarSinSesion(estado);
    }
  }

  pintar();
  let ultimoEstado = `${nube.estado}|${Boolean(usuarioActual())}|${nube.recuperando}`;
  const dejar = alCambiarNube(() => {
    if (!seccion.isConnected) {
      dejar();
      return;
    }
    // Solo se repinta si cambia algo importante, para no borrar lo que se está escribiendo.
    const ahora = `${nube.estado}|${Boolean(usuarioActual())}|${nube.recuperando}`;
    const soloEstado = ahora.split('|').slice(1).join() === ultimoEstado.split('|').slice(1).join();
    ultimoEstado = ahora;
    const estadoEl = seccion.querySelector('.estado-nube');
    if (soloEstado && estadoEl) {
      estadoEl.className = `estado-nube nube-${nube.estado}`;
      estadoEl.textContent = textoEstado();
    } else {
      pintar();
    }
  });
  return seccion;
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

function grupoBotones(idTitulo, opciones, actual, alElegir) {
  const grupo = el('div', { class: 'filtros', role: 'group', 'aria-labelledby': idTitulo },
    opciones.map(([valor, texto, lang]) => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', lang, 'aria-pressed': String(actual === valor) }, texto);
      b.addEventListener('click', () => {
        sonar('clic');
        grupo.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        alElegir(valor);
      });
      return b;
    }));
  return grupo;
}

function seccionAjustes() {
  const idiomaGrupo = grupoBotones('titulo-idioma', IDIOMAS.map(i => [i.codigo, i.nombre, i.codigo]), idioma(), cambiarIdioma);
  const tema = grupoBotones('titulo-tema',
    [['auto', t('settings.themeAuto')], ['oscuro', t('settings.themeDark')], ['claro', t('settings.themeLight')]],
    ajuste('tema'), valor => cambiarAjuste('tema', valor));

  const velocidad = el('input', { id: 'velocidad-voz', type: 'range', min: '0.5', max: '1.2', step: '0.1', value: String(ajuste('velocidadVoz')) });
  velocidad.addEventListener('change', () => cambiarAjuste('velocidadVoz', Number(velocidad.value)));

  const estadoVoz = el('p', { class: 'aprox' }, t('settings.lookingForVoice'));
  prepararVoces().then(() => {
    const voz = nombreVozPortuguesa();
    estadoVoz.textContent = voz ? `✔ ${t('settings.voiceFound', { voz })}` : `⚠ ${t('settings.noVoice')}`;
  });

  return el('section', { class: 'caja' },
    el('h2', {}, t('settings.title')),
    el('h3', { id: 'titulo-idioma' }, t('settings.interfaceLanguage')),
    el('p', { class: 'aprox' }, t('settings.languageHelp')),
    idiomaGrupo,
    el('h3', { id: 'titulo-tema' }, t('settings.theme')),
    tema,
    el('h3', {}, t('settings.sound')),
    interruptor('ajuste-efectos', t('settings.effects'), 'efectos', activo => activo && sonar('bien')),
    interruptor('ajuste-voz-tutora', t('settings.tutorBeeps'), 'vozTutora'),
    el('h3', {}, t('settings.portugueseVoice')),
    estadoVoz,
    el('div', { class: 'campo' }, el('label', { for: 'velocidad-voz' }, t('settings.voiceSpeed')), velocidad),
    el('button', {
      type: 'button',
      class: 'boton',
      onclick: () => { if (!pronunciar('Olá! Como está?')) decir(ayudaVoz(), 'apurada'); },
    }, `🔊 ${t('settings.testVoice')}`));
}

function seccionCopia(repintar) {
  const descargar = el('button', { type: 'button', class: 'boton' }, `⬇ ${t('backup.download')}`);
  descargar.addEventListener('click', () => {
    const fecha = new Date().toISOString().slice(0, 10);
    const archivo = new Blob([JSON.stringify(todosLosDatos(), null, 2)], { type: 'application/json' });
    const enlace = el('a', { href: URL.createObjectURL(archivo), download: `ola-portuguese-progress-${fecha}.json` });
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    sonar('guardar');
    decir(t('tutor.backupDownloaded'), 'contenta');
  });

  const selector = el('input', { id: 'cargar-copia', type: 'file', accept: '.json,application/json', class: 'solo-lector' });
  const cargar = el('label', { for: 'cargar-copia', class: 'boton', tabindex: '0', role: 'button' }, `⬆ ${t('backup.load')}`);
  cargar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selector.click(); } });
  selector.addEventListener('change', async () => {
    const archivo = selector.files?.[0];
    if (!archivo) return;
    try {
      const ok = importarCopia(JSON.parse(await archivo.text()));
      if (!ok) throw new Error();
      sonar('bien');
      repintar();
      decir(t('tutor.backupLoaded'), 'contenta');
    } catch {
      sonar('mal');
      decir(t('tutor.backupInvalid'), 'confundida');
    }
    selector.value = '';
  });

  return el('section', { class: 'caja' },
    el('h2', {}, t('backup.title')),
    el('p', {}, t('backup.help')),
    el('div', { class: 'botonera' }, descargar, cargar, selector));
}

function seccionReinicio(repintar) {
  const conCuaderno = el('input', { id: 'reinicio-cuaderno', type: 'checkbox' });
  const boton = el('button', { type: 'button', class: 'boton boton-peligro' }, t('reset.button'));
  boton.addEventListener('click', () => {
    if (!confirm(t(conCuaderno.checked ? 'reset.confirmAll' : 'reset.confirm'))) return;
    reiniciarProgreso({ vaciarCuaderno: conCuaderno.checked });
    sonar('quitar');
    repintar();
    decir(t('tutor.resetDone'), 'sorprendida');
  });
  return el('section', { class: 'caja zona-peligro' },
    el('h2', {}, t('reset.title')),
    el('p', {}, t('reset.help')),
    el('div', { class: 'campo-casilla' }, conCuaderno, el('label', { for: 'reinicio-cuaderno' }, t('reset.alsoNotebook'))),
    boton);
}

export function pintarPerfil(app, { resultados }) {
  const repintar = () => pintarPerfil(app, { resultados });
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, nombre() ? t('profile.titleWithName', { nombre: nombre() }) : t('profile.title'))),
    seccionNombre(),
    seccionProgreso(resultados),
    seccionCuenta(),
    seccionAjustes(),
    seccionCopia(repintar),
    seccionReinicio(repintar));
  decir(nombre() ? t('tutor.profileWithName', { nombre: nombre() }) : t('tutor.profile'));
}
