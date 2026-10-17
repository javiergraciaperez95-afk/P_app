// Pantalla «Perfil»: nombre, progreso, cuenta, ajustes y reinicio.

import { el, poner, enLinea } from '../dom.js';
import { t, locale, IDIOMAS, idioma, cambiarIdioma } from '../i18n.js';
import {
  nombre, cambiarNombre, resumenLeccion, tarjetas, racha, actividad, reiniciarProgreso,
  todosLosDatos, importarCopia,
} from '../progress.js';
import { etapa } from '../srs.js';
import { ajuste, cambiarAjuste } from '../ajustes.js';
import { prepararVoces, nombreVoz, pronunciar, sonar, ayudaVoz, abrirInstalacionDeVoces } from '../sonidos.js';
import {
  nubeConfigurada, nube, usuarioActual, entrar, crearCuenta, salir, sincronizar, alCambiarNube,
  recuperarContrasena, cambiarContrasena, borrarDatosNube, pedirCodigo, entrarConCodigo, entrarConGoogle,
  reenviarConfirmacion,
} from '../sync.js';
import { googleDisponible, botonGoogle } from '../google.js';
import { decir } from '../tutor.js';
import { curso } from '../curso.js';

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

function seccionProgreso(resultados) {
  const s = estadisticas(resultados);
  const r = racha();
  return el('section', { class: 'caja' },
    el('h2', {}, t('perfil.tuProgreso')),
    el('dl', { class: 'datos' },
      dato(t('perfil.leccionesTerminadas'), `${s.terminadas}/${s.lecciones}`),
      dato(t('perfil.ejerciciosHechos'), `${s.completados}/${s.ejercicios}`),
      dato(t('perfil.aciertos'), String(s.aciertos), s.porcentaje !== null ? t('perfil.porcentaje', { n: s.porcentaje }) : null),
      dato(t('perfil.errores'), String(s.errores)),
      dato(t('perfil.enCuaderno'), String(s.cartas), t('perfil.dominadas', { n: s.dominadas })),
      dato(t('perfil.repasos'), String(s.repasos)),
      dato(t('perfil.racha'), t('srs.dias', { n: r }), t('perfil.rachaDetalle'))));
}

// ---------------------------------------------------------------------------
// Cuenta: registro, inicio de sesión, recuperar contraseña…
// ---------------------------------------------------------------------------

let pestanaCuenta = 'entrar'; // con contraseña: entrar · crear · recuperar
let correoDelCodigo = '';     // a qué correo se ha mandado el código (paso 2 del formulario del código)

function campo(id, texto, atributos) {
  const entrada = el('input', { id, ...atributos });
  return { entrada, nodo: el('div', { class: 'campo' }, el('label', { for: id }, texto), entrada) };
}

/** Campo de contraseña con botón para verla. */
function campoContrasena(id, texto, autocompletar) {
  const c = campo(id, texto, { type: 'password', required: true, minlength: '8', autocomplete: autocompletar });
  const ver = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false', 'aria-controls': id }, t('form.ver'));
  ver.addEventListener('click', () => {
    const visible = c.entrada.type === 'password';
    c.entrada.type = visible ? 'text' : 'password';
    ver.setAttribute('aria-pressed', String(visible));
    ver.textContent = t(visible ? 'form.ocultar' : 'form.ver');
  });
  c.nodo.append(el('div', { class: 'campo-extra' }, ver));
  return c;
}

/** Formulario genérico: muestra «Un momento…», los errores y el resultado. */
function formulario(hijos, textoBoton, accion, { principal = true, extra = null } = {}) {
  const mensaje = el('p', { class: 'mensaje-formulario', role: 'status' });
  const enviar = el('button', { type: 'submit', class: `boton ${principal ? 'boton-principal' : ''}` }, textoBoton);
  const form = el('form', { class: 'formulario', novalidate: true }, hijos, mensaje, el('div', { class: 'botonera' }, enviar, extra));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const invalido = [...form.querySelectorAll('input')].find(i => !i.checkValidity());
    if (invalido) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = invalido.type === 'email'
        ? t('form.correoValido')
        : invalido.dataset.codigo
          ? t('nube.err.codigo')
          : invalido.type === 'password' || invalido.minLength > 0
            ? t('form.contrasenaCorta')
            : t('form.rellena');
      invalido.focus();
      return;
    }
    if (!nubeConfigurada) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = t('form.sinSupabase');
      return;
    }
    enviar.disabled = true;
    mensaje.className = 'mensaje-formulario';
    mensaje.textContent = t('form.unMomento');
    try {
      const resultado = await accion();
      if (!form.isConnected) return; // ha abierto sesión y la sección ya se ha repintado
      mensaje.className = 'mensaje-formulario bien';
      mensaje.textContent = resultado ?? '';
    } catch (error) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = error.message;
      sonar('mal');
      decir(t('form.algoMal'), 'confundida');
    } finally {
      enviar.disabled = false;
    }
  });
  return form;
}

/** Lo que dice la tutora al entrar, según si la cuenta es nueva. */
function celebrarEntrada(nueva) {
  sonar('bien');
  decir(t(nueva ? 'cuenta.creadaTutora' : 'cuenta.sesionIniciadaTutora'), 'contenta');
}

/**
 * Entrar con un código por correo, en dos pasos: el correo y, cuando llega, las 6 cifras.
 * Si no había cuenta, se crea al entrar: no hay que elegir entre «entrar» y «crear».
 */
function formularioCodigo(repintar) {
  if (!correoDelCodigo) {
    const correo = campo('cuenta-correo-codigo', t('form.correo'), { type: 'email', required: true, autocomplete: 'email', inputmode: 'email' });
    return formulario([el('p', { class: 'aprox' }, t('cuenta.codigoTexto')), correo.nodo], t('cuenta.enviarCodigo'), async () => {
      const direccion = correo.entrada.value.trim();
      await pedirCodigo(direccion);
      correoDelCodigo = direccion;
      sonar('volar');
      decir(t('cuenta.codigoEnviadoTutora'), 'contenta');
      repintar();
      document.getElementById('cuenta-codigo')?.focus();
    });
  }
  // Seis cifras: en el móvil sale el teclado numérico y el sistema puede ofrecer el código del correo.
  const codigo = campo('cuenta-codigo', t('form.codigo'), {
    type: 'text', required: true, inputmode: 'numeric', autocomplete: 'one-time-code', pattern: '\\s*(\\d\\s*){6}', maxlength: '9',
    'data-codigo': '1', class: 'campo-codigo',
  });
  const otroCorreo = el('button', { type: 'button', class: 'boton boton-mini' }, t('cuenta.otroCorreo'));
  otroCorreo.addEventListener('click', () => { correoDelCodigo = ''; sonar('elegir'); repintar(); });
  const reenviar = el('button', { type: 'button', class: 'boton boton-mini' }, t('cuenta.reenviar'));
  reenviar.addEventListener('click', async () => {
    try {
      await pedirCodigo(correoDelCodigo);
      sonar('volar');
      decir(t('cuenta.codigoEnviadoTutora'), 'contenta');
    } catch (error) {
      decir(error.message, 'confundida');
    }
  });
  return formulario([
    el('p', { class: 'aprox' }, t('cuenta.codigoEnviado', { correo: correoDelCodigo })),
    codigo.nodo,
  ], t('cuenta.entrarCodigo'), async () => {
    const nueva = await entrarConCodigo(correoDelCodigo, codigo.entrada.value, nombre());
    correoDelCodigo = '';
    celebrarEntrada(nueva);
    return t('cuenta.sesionIniciada');
  }, { extra: el('span', { class: 'botonera-secundaria' }, reenviar, otroCorreo) });
}

function formularioEntrar() {
  const correo = campo('cuenta-correo', t('form.correo'), { type: 'email', required: true, autocomplete: 'email' });
  const clave = campoContrasena('cuenta-clave', t('form.contrasena'), 'current-password');
  clave.entrada.minLength = 1; // al entrar no se juzga la contraseña: lo dice el servidor
  const reenvio = el('p', { class: 'aprox', hidden: true });
  return formulario([correo.nodo, clave.nodo, reenvio], t('cuenta.iniciarSesion'), async () => {
    try {
      await entrar(correo.entrada.value.trim(), clave.entrada.value);
    } catch (error) {
      // Sin confirmar: se ofrece mandar otra vez el enlace.
      if (error.codigo === 'sin_confirmar') {
        const boton = el('button', { type: 'button', class: 'boton boton-mini' }, t('cuenta.reenviarConfirmacion'));
        boton.addEventListener('click', async () => {
          await reenviarConfirmacion(correo.entrada.value.trim()).catch(() => {});
          sonar('bien');
          poner(reenvio, t('cuenta.enlaceEnviado'));
        });
        poner(reenvio, boton);
        reenvio.hidden = false;
      }
      throw error;
    }
    celebrarEntrada(false);
    return t('cuenta.sesionIniciada');
  });
}

function formularioCrear() {
  const nombreCampo = campo('cuenta-nombre', t('form.nombreOpcional'), { type: 'text', autocomplete: 'nickname', value: nombre(), maxlength: '40' });
  const correo = campo('cuenta-correo-nuevo', t('form.correo'), { type: 'email', required: true, autocomplete: 'email' });
  const clave = campoContrasena('cuenta-clave-nueva', t('form.contrasenaMinimo'), 'new-password');
  const repetir = campoContrasena('cuenta-clave-repetir', t('form.repiteContrasena'), 'new-password');
  return formulario([nombreCampo.nodo, correo.nodo, clave.nodo, repetir.nodo], t('cuenta.crear'), async () => {
    if (clave.entrada.value !== repetir.entrada.value) throw new Error(t('form.noCoinciden'));
    if (nombreCampo.entrada.value.trim()) cambiarNombre(nombreCampo.entrada.value);
    await crearCuenta(correo.entrada.value.trim(), clave.entrada.value, nombreCampo.entrada.value.trim());
    sonar('bien');
    decir(t('cuenta.creadaConfirmaTutora'), 'contenta');
    return t('cuenta.creadaConfirma');
  });
}

function formularioRecuperar() {
  const correo = campo('cuenta-correo-recuperar', t('form.correoCuenta'), { type: 'email', required: true, autocomplete: 'email' });
  return formulario([
    el('p', { class: 'aprox' }, t('cuenta.recuperarTexto')),
    correo.nodo,
  ], t('cuenta.enviarEnlace'), async () => {
    await recuperarContrasena(correo.entrada.value.trim());
    decir(t('cuenta.enlaceEnviadoTutora'));
    return t('cuenta.enlaceEnviado');
  });
}

/** Contraseña nueva: desde el enlace del correo, para cambiarla o para poner la primera (cuentas de código o Google). */
function formularioNuevaContrasena(titulo, { pedirActual = false } = {}) {
  const actual = pedirActual ? campoContrasena('cuenta-clave-actual', t('form.contrasenaActual'), 'current-password') : null;
  if (actual) actual.entrada.minLength = 1;
  const clave = campoContrasena('cuenta-clave-cambio', t('form.contrasenaNuevaMinimo'), 'new-password');
  const repetir = campoContrasena('cuenta-clave-cambio-repetir', t('form.repiteContrasenaNueva'), 'new-password');
  return el('div', {},
    el('h3', {}, titulo),
    formulario([actual?.nodo, clave.nodo, repetir.nodo].filter(Boolean), t('cuenta.guardarContrasena'), async () => {
      if (clave.entrada.value !== repetir.entrada.value) throw new Error(t('form.noCoinciden'));
      await cambiarContrasena(clave.entrada.value, actual?.entrada.value ?? '');
      sonar('guardar');
      decir(t('cuenta.contrasenaCambiadaTutora'), 'contenta');
      return t('cuenta.contrasenaCambiada');
    }, { principal: false }));
}

/** El botón de Google (si está configurado), con su mensaje de error debajo. */
function bloqueGoogle() {
  if (!nubeConfigurada || !googleDisponible()) return null;
  const mensaje = el('p', { class: 'mensaje-formulario', role: 'status' });
  const boton = botonGoogle(async credencial => {
    mensaje.className = 'mensaje-formulario';
    mensaje.textContent = t('form.unMomento');
    const nueva = await entrarConGoogle(credencial);
    celebrarEntrada(nueva);
  }, error => {
    mensaje.className = 'mensaje-formulario error';
    mensaje.textContent = error?.message || t('nube.err.google');
    sonar('mal');
  });
  return el('div', { class: 'cuenta-google' }, boton, mensaje, el('p', { class: 'separador-o' }, el('span', {}, t('cuenta.oCorreo'))));
}

/** La cuenta: entrar o crearla (código, Google o contraseña); o los datos de la sesión. */
export function seccionCuenta(pestana) {
  if (pestana === 'crear' || pestana === 'recuperar') pestanaCuenta = pestana;
  const seccion = el('section', { class: 'caja', id: 'cuenta' });

  function textoEstado() {
    if (nube.estado === 'error') return `⚠ ${nube.mensaje()}`;
    if (nube.estado === 'sincronizada') {
      return nube.ultima
        ? t('nube.guardadoHora', { hora: nube.ultima.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) })
        : t('nube.guardado');
    }
    return t(`nube.estado.${nube.estado}`);
  }

  function pintarConSesion(usuario, estado) {
    // Las cuentas con contraseña la piden para borrar; las de código o Google, no (basta la sesión).
    const claveBorrar = usuario.contrasena ? campoContrasena('cuenta-clave-borrar', t('form.contrasena'), 'current-password') : null;
    const borrar = el('button', { type: 'button', class: 'boton boton-peligro' }, t('cuenta.borrarMisDatos'));
    borrar.addEventListener('click', async () => {
      if (claveBorrar && !claveBorrar.entrada.value) { claveBorrar.entrada.focus(); return; }
      if (!confirm(t('cuenta.borrarConfirmar'))) return;
      try {
        await borrarDatosNube(claveBorrar?.entrada.value ?? '');
        await salir();
        decir(t('cuenta.borradoTutora'), 'sorprendida');
      } catch (error) {
        decir(error.message, 'confundida');
      }
    });
    poner(seccion,
      el('h2', {}, t('cuenta.titulo')),
      el('p', {}, `${t('cuenta.sesionComo')} `, el('strong', {}, usuario.email)),
      estado,
      el('div', { class: 'botonera' },
        el('button', { type: 'button', class: 'boton', onclick: () => sincronizar() }, t('cuenta.sincronizar')),
        el('button', {
          type: 'button',
          class: 'boton',
          onclick: async () => { await salir(); sonar('puerta'); decir(t('cuenta.sesionCerradaTutora')); },
        }, t('cuenta.cerrarSesion'))),
      el('details', { class: 'plegable' },
        el('summary', {}, t(usuario.contrasena ? 'cuenta.cambiarContrasena' : 'cuenta.ponerContrasena')),
        !usuario.contrasena && el('p', { class: 'aprox' }, t('cuenta.ponerContrasenaTexto')),
        formularioNuevaContrasena(t('cuenta.contrasenaNueva'), { pedirActual: usuario.contrasena })),
      el('details', { class: 'plegable' },
        el('summary', {}, t('cuenta.borrarNube')),
        el('p', { class: 'aprox' }, t('cuenta.borrarNubeTexto')),
        claveBorrar?.nodo,
        borrar));
  }

  function pintarSinSesion(estado) {
    // Con contraseña (plegado, para quien la prefiera): entrar, crear la cuenta o recuperar la contraseña.
    const pestanas = [['entrar', t('cuenta.iniciarSesion')], ['crear', t('cuenta.crear')], ['recuperar', t('cuenta.olvidada')]];
    const barra = el('div', { class: 'filtros pestanas', role: 'group', 'aria-label': t('cuenta.opciones') },
      pestanas.map(([clave, texto]) => el('button', {
        type: 'button',
        class: 'boton boton-mini',
        'aria-pressed': String(pestanaCuenta === clave),
        onclick: () => {
          pestanaCuenta = clave;
          sonar('elegir');
          pintar();
          seccion.querySelector('.cuenta-contrasena input')?.focus();
        },
      }, texto)));
    const conContrasena = { entrar: formularioEntrar, crear: formularioCrear, recuperar: formularioRecuperar }[pestanaCuenta]();
    const plegable = el('details', { class: 'plegable cuenta-contrasena' },
      el('summary', {}, t('cuenta.conContrasena')),
      barra,
      conContrasena);
    if (abiertaContrasena) plegable.open = true;
    plegable.addEventListener('toggle', () => { abiertaContrasena = plegable.open; });
    poner(seccion,
      el('h2', {}, t('cuenta.titulo')),
      !nubeConfigurada && el('p', { class: 'aviso-nube', role: 'note' }, t('cuenta.sinConfigurar')),
      estado,
      el('p', { class: 'aprox' }, t('cuenta.ventajas')),
      bloqueGoogle(),
      formularioCodigo(pintar),
      plegable);
  }

  // Al repintar (p. ej. tras cambiar de pestaña), el bloque de la contraseña sigue abierto si lo estaba.
  let abiertaContrasena = pestana === 'crear' || pestana === 'recuperar';

  function pintar() {
    const usuario = usuarioActual();
    const estado = el('p', { class: `estado-nube nube-${nube.estado}`, role: 'status' }, textoEstado());
    if (nube.recuperando) {
      poner(seccion, el('h2', {}, t('cuenta.titulo')), formularioNuevaContrasena(t('cuenta.ponNueva')));
      decir(t('cuenta.ponNuevaTutora'), 'normal');
    } else if (usuario) {
      pintarConSesion(usuario, estado);
    } else {
      pintarSinSesion(estado);
    }
  }

  const huella = () => `${nube.estado}|${Boolean(usuarioActual())}|${Boolean(nube.recuperando)}|${usuarioActual()?.contrasena}`;
  pintar();
  let ultimoEstado = huella();
  const dejar = alCambiarNube(() => {
    if (!seccion.isConnected) {
      dejar();
      return;
    }
    // Solo se repinta si cambia algo importante, para no borrar lo que se está escribiendo.
    const ahora = huella();
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

function seccionAjustes() {
  const idiomas = el('div', { class: 'filtros', role: 'group', 'aria-labelledby': 'titulo-idioma' },
    [el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(ajuste('idioma') === 'auto') }, t('ajustes.automatico')),
      ...IDIOMAS.map(i => {
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
    const archivo = new Blob([JSON.stringify(todosLosDatos(), null, 2)], { type: 'application/json' });
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
    seccionCuenta(),
    seccionAjustes(),
    seccionCopia(repintar),
    seccionReinicio(repintar));
  decir(nombre() ? t('perfil.tutora', { nombre: nombre() }) : t('perfil.tutoraSinNombre'));
}
