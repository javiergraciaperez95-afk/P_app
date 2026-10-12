// Pantalla «Perfil»: nombre, progreso, cuenta, ajustes y reinicio.

import { el, poner } from '../dom.js';
import {
  nombre, cambiarNombre, resumenLeccion, tarjetas, racha, actividad, reiniciarProgreso,
  todosLosDatos, importarCopia,
} from '../progress.js';
import { etapa } from '../srs.js';
import { ajuste, cambiarAjuste } from '../ajustes.js';
import { prepararVoces, nombreVozTailandesa, pronunciar, sonar, AYUDA_VOZ } from '../sonidos.js';
import {
  nubeConfigurada, nube, usuarioActual, entrar, crearCuenta, salir, sincronizar, alCambiarNube,
  recuperarContrasena, cambiarContrasena, borrarDatosNube,
} from '../sync.js';
import { decir } from '../tutor.js';

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
    el('div', { class: 'campo' }, el('label', { for: 'perfil-nombre' }, '¿Cómo quieres que te llame?'), entrada),
    el('button', { type: 'submit', class: 'boton' }, 'Guardar'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    cambiarNombre(entrada.value);
    sonar('guardar');
    document.querySelector('#app h1').textContent = nombre() ? `Perfil de ${nombre()}` : 'Perfil';
    decir(entrada.value.trim()
      ? `¡Encantada, ${entrada.value.trim()}! Un nombre precioso. Casi tanto como el mío.`
      : 'Vale, seguiré sin saber tu nombre. Misteriosa elección.', 'contenta');
  });
  return el('section', { class: 'caja' }, el('h2', {}, 'Tu nombre'), form);
}

function seccionProgreso(resultados) {
  const s = estadisticas(resultados);
  const r = racha();
  return el('section', { class: 'caja' },
    el('h2', {}, 'Tu progreso'),
    el('dl', { class: 'datos' },
      dato('Lecciones terminadas', `${s.terminadas}/${s.lecciones}`),
      dato('Ejercicios hechos', `${s.completados}/${s.ejercicios}`),
      dato('Aciertos', String(s.aciertos), s.porcentaje !== null ? `${s.porcentaje} % de acierto` : null),
      dato('Errores', String(s.errores)),
      dato('En el cuaderno', String(s.cartas), `${s.dominadas} dominadas`),
      dato('Repasos hechos', String(s.repasos)),
      dato('Racha', `${r} ${r === 1 ? 'día' : 'días'}`, 'días seguidos estudiando')));
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
  const ver = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false', 'aria-controls': id }, 'Ver');
  ver.addEventListener('click', () => {
    const visible = c.entrada.type === 'password';
    c.entrada.type = visible ? 'text' : 'password';
    ver.setAttribute('aria-pressed', String(visible));
    ver.textContent = visible ? 'Ocultar' : 'Ver';
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
        ? 'Escribe un correo electrónico válido.'
        : invalido.type === 'password' || invalido.minLength > 0
          ? 'La contraseña debe tener al menos 6 caracteres.'
          : 'Rellena todos los campos.';
      invalido.focus();
      return;
    }
    if (!nubeConfigurada) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = 'Las cuentas aún no están conectadas a Supabase. Cuando se configure, este formulario funcionará.';
      return;
    }
    enviar.disabled = true;
    mensaje.className = 'mensaje-formulario';
    mensaje.textContent = 'Un momento…';
    try {
      const resultado = await accion();
      mensaje.className = 'mensaje-formulario bien';
      mensaje.textContent = resultado ?? '';
    } catch (error) {
      mensaje.className = 'mensaje-formulario error';
      mensaje.textContent = error.message;
      sonar('mal');
      decir('Uy, algo no ha ido bien. Mira el mensaje del formulario.', 'confundida');
    } finally {
      enviar.disabled = false;
    }
  });
  return form;
}

function formularioEntrar() {
  const correo = campo('cuenta-correo', 'Correo electrónico', { type: 'email', required: true, autocomplete: 'email' });
  const clave = campoContrasena('cuenta-clave', 'Contraseña', 'current-password');
  return formulario([correo.nodo, clave.nodo], 'Iniciar sesión', async () => {
    await entrar(correo.entrada.value.trim(), clave.entrada.value);
    sonar('bien');
    decir('¡Sesión iniciada! Junto tu progreso de este navegador con el de la nube.', 'contenta');
    return 'Sesión iniciada.';
  });
}

function formularioCrear() {
  const nombreCampo = campo('cuenta-nombre', 'Tu nombre (opcional)', { type: 'text', autocomplete: 'nickname', value: nombre(), maxlength: '40' });
  const correo = campo('cuenta-correo-nuevo', 'Correo electrónico', { type: 'email', required: true, autocomplete: 'email' });
  const clave = campoContrasena('cuenta-clave-nueva', 'Contraseña (mínimo 6 caracteres)', 'new-password');
  const repetir = campoContrasena('cuenta-clave-repetir', 'Repite la contraseña', 'new-password');
  return formulario([nombreCampo.nodo, correo.nodo, clave.nodo, repetir.nodo], 'Crear cuenta', async () => {
    if (clave.entrada.value !== repetir.entrada.value) throw new Error('Las dos contraseñas no coinciden.');
    if (nombreCampo.entrada.value.trim()) cambiarNombre(nombreCampo.entrada.value);
    const confirmar = await crearCuenta(correo.entrada.value.trim(), clave.entrada.value, nombreCampo.entrada.value.trim());
    sonar('bien');
    decir(confirmar ? '¡Cuenta creada! Revisa tu correo para confirmarla.' : '¡Cuenta creada! Tu progreso ya se guarda en la nube.', 'contenta');
    return confirmar
      ? 'Cuenta creada. Te hemos enviado un correo: pulsa el enlace para confirmarla y después inicia sesión. Mira también en la carpeta de spam.'
      : 'Cuenta creada y sesión iniciada.';
  });
}

function formularioRecuperar() {
  const correo = campo('cuenta-correo-recuperar', 'Correo de tu cuenta', { type: 'email', required: true, autocomplete: 'email' });
  return formulario([
    el('p', { class: 'aprox' }, 'Te enviaremos un correo con un enlace para poner una contraseña nueva.'),
    correo.nodo,
  ], 'Enviar enlace', async () => {
    await recuperarContrasena(correo.entrada.value.trim());
    decir('Te he mandado un correo. Pulsa el enlace y vuelve aquí para poner la contraseña nueva.');
    return 'Correo enviado. Si no llega en unos minutos, mira en la carpeta de spam.';
  });
}

function formularioNuevaContrasena(titulo) {
  const clave = campoContrasena('cuenta-clave-cambio', 'Contraseña nueva (mínimo 6 caracteres)', 'new-password');
  const repetir = campoContrasena('cuenta-clave-cambio-repetir', 'Repite la contraseña nueva', 'new-password');
  return el('div', {},
    el('h3', {}, titulo),
    formulario([clave.nodo, repetir.nodo], 'Guardar contraseña', async () => {
      if (clave.entrada.value !== repetir.entrada.value) throw new Error('Las dos contraseñas no coinciden.');
      await cambiarContrasena(clave.entrada.value);
      sonar('guardar');
      decir('Contraseña cambiada. Esta vez, ¡apúntala en un sitio seguro!', 'contenta');
      return 'Contraseña cambiada.';
    }, { principal: false }));
}

function seccionCuenta() {
  const seccion = el('section', { class: 'caja', id: 'cuenta' });

  function textoEstado() {
    return {
      desactivada: 'Tu progreso se guarda solo en este navegador.',
      'sin-sesion': 'No has iniciado sesión. Tu progreso se guarda solo en este navegador.',
      sincronizando: '⟳ Guardando en la nube…',
      sincronizada: `✔ Progreso guardado en la nube${nube.ultima ? ` (${nube.ultima.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})` : ''}.`,
      error: `⚠ ${nube.mensaje}`,
    }[nube.estado];
  }

  function pintarConSesion(usuario, estado) {
    const borrar = el('button', { type: 'button', class: 'boton boton-peligro' }, 'Borrar mis datos de la nube');
    borrar.addEventListener('click', async () => {
      if (!confirm('Se borrará la copia de tu progreso guardada en la nube y se cerrará la sesión. Los datos de este navegador se conservan. ¿Seguir?')) return;
      try {
        await borrarDatosNube();
        await salir();
        decir('Datos de la nube borrados y sesión cerrada.', 'sorprendida');
      } catch (error) {
        decir(error.message, 'confundida');
      }
    });
    poner(seccion,
      el('h2', {}, 'Cuenta'),
      el('p', {}, 'Sesión iniciada como ', el('strong', {}, usuario.email)),
      estado,
      el('div', { class: 'botonera' },
        el('button', { type: 'button', class: 'boton', onclick: () => sincronizar() }, '⟳ Sincronizar ahora'),
        el('button', {
          type: 'button',
          class: 'boton',
          onclick: async () => { await salir(); sonar('clic'); decir('Sesión cerrada. Tu progreso sigue guardado en este navegador.'); },
        }, 'Cerrar sesión')),
      el('details', { class: 'plegable' },
        el('summary', {}, 'Cambiar la contraseña'),
        formularioNuevaContrasena('Contraseña nueva')),
      el('details', { class: 'plegable' },
        el('summary', {}, 'Borrar datos de la nube'),
        el('p', { class: 'aprox' }, 'Borra la copia guardada en la nube. Lo que hay en este navegador no se toca.'),
        borrar));
  }

  function pintarSinSesion(estado) {
    const pestanas = [['entrar', 'Iniciar sesión'], ['crear', 'Crear cuenta'], ['recuperar', 'He olvidado la contraseña']];
    const barra = el('div', { class: 'filtros pestanas', role: 'group', 'aria-label': 'Opciones de cuenta' },
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
      }, texto)));
    const form = { entrar: formularioEntrar, crear: formularioCrear, recuperar: formularioRecuperar }[pestanaCuenta]();
    poner(seccion,
      el('h2', {}, 'Cuenta'),
      !nubeConfigurada && el('p', { class: 'aviso-nube', role: 'note' },
        '⚠ Las cuentas aún no están conectadas: falta configurar Supabase (ver README). Puedes ver los formularios, pero todavía no funcionan.'),
      estado,
      el('p', { class: 'aprox' }, 'Con una cuenta, tu progreso y tu cuaderno se guardan en la nube y puedes usarlos en otros dispositivos.'),
      barra,
      form);
  }

  function pintar() {
    const usuario = usuarioActual();
    const estado = el('p', { class: `estado-nube nube-${nube.estado}`, role: 'status' }, textoEstado());
    if (nube.recuperando && usuario) {
      poner(seccion, el('h2', {}, 'Cuenta'), formularioNuevaContrasena('Pon tu contraseña nueva'));
      decir('Ya casi está: escribe tu contraseña nueva.', 'normal');
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

function seccionAjustes() {
  const tema = el('div', { class: 'filtros', role: 'group', 'aria-labelledby': 'titulo-tema' },
    [['auto', 'Automático'], ['oscuro', 'Oscuro'], ['claro', 'Diurno']].map(([valor, texto]) => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(ajuste('tema') === valor) }, texto);
      b.addEventListener('click', () => {
        cambiarAjuste('tema', valor);
        sonar('clic');
        tema.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
      return b;
    }));

  const velocidad = el('input', { id: 'velocidad-voz', type: 'range', min: '0.5', max: '1.2', step: '0.1', value: String(ajuste('velocidadVoz')) });
  velocidad.addEventListener('change', () => cambiarAjuste('velocidadVoz', Number(velocidad.value)));

  const estadoVoz = el('p', { class: 'aprox' }, 'Buscando voz tailandesa…');
  prepararVoces().then(() => {
    const voz = nombreVozTailandesa();
    estadoVoz.textContent = voz ? `✔ Voz tailandesa encontrada: ${voz}` : '⚠ No hay ninguna voz tailandesa instalada en este dispositivo.';
  });

  return el('section', { class: 'caja' },
    el('h2', {}, 'Ajustes'),
    el('h3', { id: 'titulo-tema' }, 'Tema'),
    tema,
    el('h3', {}, 'Sonido'),
    interruptor('ajuste-efectos', 'Efectos de sonido 8-bit', 'efectos', activo => activo && sonar('bien')),
    interruptor('ajuste-voz-tutora', 'Pitidos de la tutora al hablar', 'vozTutora'),
    el('h3', {}, 'Voz tailandesa'),
    estadoVoz,
    el('div', { class: 'campo' }, el('label', { for: 'velocidad-voz' }, 'Velocidad de la voz'), velocidad),
    el('button', {
      type: 'button',
      class: 'boton',
      onclick: () => { if (!pronunciar('สวัสดี! สบายดีไหม?')) decir(AYUDA_VOZ, 'apurada'); },
    }, '🔊 Probar la voz'));
}

function seccionCopia(repintar) {
  const descargar = el('button', { type: 'button', class: 'boton' }, '⬇ Descargar copia');
  descargar.addEventListener('click', () => {
    const fecha = new Date().toISOString().slice(0, 10);
    const archivo = new Blob([JSON.stringify(todosLosDatos(), null, 2)], { type: 'application/json' });
    const enlace = el('a', { href: URL.createObjectURL(archivo), download: `tailandes-progreso-${fecha}.json` });
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    sonar('guardar');
    decir('Copia descargada. Guárdala en un sitio seguro, como yo guardo mis apuntes.', 'contenta');
  });

  const selector = el('input', { id: 'cargar-copia', type: 'file', accept: '.json,application/json', class: 'solo-lector' });
  const cargar = el('label', { for: 'cargar-copia', class: 'boton', tabindex: '0', role: 'button' }, '⬆ Cargar copia');
  cargar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selector.click(); } });
  selector.addEventListener('change', async () => {
    const archivo = selector.files?.[0];
    if (!archivo) return;
    try {
      const ok = importarCopia(JSON.parse(await archivo.text()));
      if (!ok) throw new Error();
      sonar('bien');
      repintar();
      decir('¡Copia cargada! He juntado ese progreso con el que ya tenías.', 'contenta');
    } catch {
      sonar('mal');
      decir('Ese archivo no parece una copia de esta app. Busca uno que se llame «tailandes-progreso-…json».', 'confundida');
    }
    selector.value = '';
  });

  return el('section', { class: 'caja' },
    el('h2', {}, 'Copia de seguridad'),
    el('p', {}, 'Descarga un archivo con todo tu progreso y tu cuaderno. Al cargarlo, se junta con lo que ya tienes: no se borra nada.'),
    el('div', { class: 'botonera' }, descargar, cargar, selector));
}

function seccionReinicio(repintar) {
  const conCuaderno = el('input', { id: 'reinicio-cuaderno', type: 'checkbox' });
  const boton = el('button', { type: 'button', class: 'boton boton-peligro' }, 'Reiniciar progreso');
  boton.addEventListener('click', () => {
    const texto = conCuaderno.checked
      ? '¿Seguro? Se borrará el progreso de las lecciones, los repasos Y todo tu cuaderno. No se puede deshacer.'
      : '¿Seguro? Se borrará el progreso de las lecciones y de los repasos. Tu cuaderno se conserva (sus tarjetas vuelven a ser nuevas).';
    if (!confirm(texto)) return;
    reiniciarProgreso({ vaciarCuaderno: conCuaderno.checked });
    sonar('quitar');
    repintar();
    decir('Hecho: empezamos de cero. Yo me acuerdo de todo, pero no se lo diré a nadie.', 'sorprendida');
  });
  return el('section', { class: 'caja zona-peligro' },
    el('h2', {}, 'Reiniciar'),
    el('p', {}, 'Empieza otra vez desde cero. Si tienes la sesión iniciada, también se reinicia en la nube.'),
    el('div', { class: 'campo-casilla' }, conCuaderno, el('label', { for: 'reinicio-cuaderno' }, 'Vaciar también el cuaderno')),
    boton);
}

export function pintarPerfil(app, { resultados }) {
  const repintar = () => pintarPerfil(app, { resultados });
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, nombre() ? `Perfil de ${nombre()}` : 'Perfil')),
    seccionNombre(),
    seccionProgreso(resultados),
    seccionCuenta(),
    seccionAjustes(),
    seccionCopia(repintar),
    seccionReinicio(repintar));
  decir(nombre()
    ? `Aquí tienes tu ficha, ${nombre()}. Mira qué progreso… con una tutora así, normal.`
    : 'Este es tu perfil. Dime cómo te llamas y así te puedo felicitar como es debido.');
}
