// Recuadro «Cuenta en la nube» (dentro de Perfil): entrar, crear cuenta,
// recuperar contraseña, poner una nueva y ver el estado de la sincronización.

import { esc } from './util.js';
import * as nube from './nube.js';
import { bocadillo } from './tutora.js';
import { sonido } from './sonido.js';

let modoPedido = null; // 'nueva' cuando se llega desde el enlace de recuperar contraseña
let avisoPedido = null; // { tipo: 'ok'|'error', texto }

/** Lo usa app.js al capturar un enlace del correo. */
export function prepararCuenta(modo, aviso) {
  modoPedido = modo;
  avisoPedido = aviso;
}

export function montarCuenta(caja) {
  let modo = modoPedido || 'entrar'; // entrar | crear | recuperar | nueva
  let aviso = avisoPedido;
  let ocupado = false;
  modoPedido = null;
  avisoPedido = null;

  function pintar() {
    const u = nube.usuario();
    if (u && modo !== 'nueva') {
      caja.innerHTML = `
        <h2>Cuenta en la nube</h2>
        <p>Has entrado como <strong>${esc(u.email)}</strong>. Tu progreso y tu cuaderno se guardan solos en la nube.</p>
        <p class="nube-estado nube-${nube.estado.fase}" role="status">${esc(textoEstado())}</p>
        ${htmlAviso()}
        <div class="pie-botones">
          <button type="button" class="btn btn-peq" data-accion="sincronizar">Sincronizar ahora</button>
          <button type="button" class="btn btn-peq" data-accion="modo-nueva">Cambiar contraseña</button>
          <button type="button" class="btn btn-peq" data-accion="salir">Cerrar sesión</button>
        </div>`;
      return;
    }

    if (modo === 'nueva') {
      caja.innerHTML = `
        <h2>Nueva contraseña</h2>
        ${htmlAviso()}
        <form class="form-cuenta" data-form="nueva">
          <label class="etiqueta" for="cu-nueva">Escribe tu nueva contraseña</label>
          <input id="cu-nueva" class="campo" type="password" autocomplete="new-password" required>
          <p class="pista">Si no cumple los requisitos de seguridad, te diré exactamente qué le falta.</p>
          <div class="pie-botones">
            <button type="submit" class="btn btn-acento" ${ocupado ? 'aria-disabled="true"' : ''}>Guardar contraseña</button>
            ${u ? '<button type="button" class="btn btn-peq" data-accion="modo-entrar">Cancelar</button>' : ''}
          </div>
        </form>`;
      return;
    }

    const titulos = { entrar: 'Entrar en tu cuenta', crear: 'Crear una cuenta', recuperar: 'Recuperar la contraseña' };
    caja.innerHTML = `
      <h2>Cuenta en la nube</h2>
      <p class="pista">Opcional. Con una cuenta, tu progreso y tu cuaderno se guardan en la nube y los tienes en cualquier dispositivo. Sirve la misma cuenta que la web de chino.</p>
      <div class="pestanas" role="group" aria-label="Opciones de cuenta">
        <button type="button" class="btn btn-peq" data-accion="modo-entrar" aria-pressed="${modo === 'entrar'}">Entrar</button>
        <button type="button" class="btn btn-peq" data-accion="modo-crear" aria-pressed="${modo === 'crear'}">Crear cuenta</button>
      </div>
      <h3>${titulos[modo]}</h3>
      ${htmlAviso()}
      <form class="form-cuenta" data-form="${modo}">
        <label class="etiqueta" for="cu-email">Email</label>
        <input id="cu-email" class="campo" type="email" autocomplete="email" required>
        ${modo !== 'recuperar' ? `
          <label class="etiqueta" for="cu-clave">Contraseña</label>
          <input id="cu-clave" class="campo" type="password" autocomplete="${modo === 'crear' ? 'new-password' : 'current-password'}" required>` : ''}
        <div class="pie-botones">
          <button type="submit" class="btn btn-acento" ${ocupado ? 'aria-disabled="true"' : ''}>
            ${ocupado ? 'Un momento…' : { entrar: 'Entrar', crear: 'Crear cuenta', recuperar: 'Enviarme un enlace' }[modo]}
          </button>
          ${modo === 'entrar' ? '<button type="button" class="btn btn-peq" data-accion="modo-recuperar">He olvidado mi contraseña</button>' : ''}
          ${modo === 'recuperar' ? '<button type="button" class="btn btn-peq" data-accion="modo-entrar">Volver</button>' : ''}
        </div>
      </form>`;
  }

  function htmlAviso() {
    if (!aviso) return '';
    return `<p class="aviso-cuenta aviso-${aviso.tipo}" role="alert">${esc(aviso.texto)}</p>`;
  }

  function textoEstado() {
    const e = nube.estado;
    if (e.fase === 'sincronizando') return '⟳ Sincronizando…';
    if (e.fase === 'error') return `⚠ ${e.mensaje}`;
    if (e.ultima) return `✓ Guardado en la nube a las ${new Date(e.ultima).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    return 'Esperando para sincronizar…';
  }

  async function ejecutar(accion) {
    if (ocupado) return;
    ocupado = true;
    aviso = null;
    pintar();
    try {
      aviso = await accion();
      sonido.acierto();
    } catch (e) {
      aviso = { tipo: 'error', texto: e.message || 'Algo ha fallado. Revisa tu conexión.' };
      sonido.fallo();
    }
    ocupado = false;
    pintar();
  }

  const alEnviar = (ev) => {
    ev.preventDefault();
    const f = ev.target.closest('[data-form]');
    if (!f) return;
    const email = f.querySelector('#cu-email')?.value.trim();
    const clave = f.querySelector('#cu-clave')?.value;
    const tipo = f.dataset.form;

    if (tipo === 'entrar') {
      ejecutar(async () => {
        await nube.entrar(email, clave);
        bocadillo('¡Ya estás dentro! Desde ahora lo guardo todo en la nube, como una profesora moderna.', 'contenta');
        return null;
      });
    } else if (tipo === 'crear') {
      ejecutar(async () => {
        const d = await nube.crearCuenta(email, clave);
        if (d.access_token) return { tipo: 'ok', texto: '¡Cuenta creada! Ya estás dentro.' };
        modo = 'entrar';
        return { tipo: 'ok', texto: `¡Casi! Te he enviado un correo a ${email}. Pulsa el enlace para confirmar la cuenta y luego entra aquí. (Mira también en spam.)` };
      });
    } else if (tipo === 'recuperar') {
      ejecutar(async () => {
        await nube.recuperarContrasena(email);
        modo = 'entrar';
        return { tipo: 'ok', texto: `Si existe una cuenta con ${email}, te llegará un correo con un enlace para poner una contraseña nueva.` };
      });
    } else if (tipo === 'nueva') {
      const nueva = f.querySelector('#cu-nueva').value;
      ejecutar(async () => {
        await nube.cambiarContrasena(nueva);
        modo = 'entrar';
        return { tipo: 'ok', texto: 'Contraseña cambiada.' };
      });
    }
  };

  const alClic = (ev) => {
    const accion = ev.target.closest('[data-accion]')?.dataset.accion;
    if (!accion) return;
    if (accion.startsWith('modo-')) {
      modo = accion.slice(5);
      aviso = null;
      sonido.clic();
      pintar();
      caja.querySelector('input')?.focus();
    } else if (accion === 'sincronizar') {
      sonido.clic();
      nube.sincronizar();
    } else if (accion === 'salir') {
      ejecutar(async () => {
        await nube.salir();
        modo = 'entrar';
        return { tipo: 'ok', texto: 'Has cerrado la sesión. Lo que hagas ahora se guarda solo en este navegador.' };
      });
    }
  };

  caja.addEventListener('submit', alEnviar);
  caja.addEventListener('click', alClic);
  const alEstado = () => {
    if (ocupado) return;
    // Con sesión abierta: solo se actualiza la línea de estado
    const linea = caja.querySelector('.nube-estado');
    if (linea && nube.usuario() && modo !== 'nueva') {
      linea.className = `nube-estado nube-${nube.estado.fase}`;
      linea.textContent = textoEstado();
      return;
    }
    // Nunca borrar lo que se está escribiendo en un formulario
    if (caja.querySelector('form') && caja.contains(document.activeElement)) return;
    pintar();
  };
  document.addEventListener('nube-estado', alEstado);
  pintar();
  return () => document.removeEventListener('nube-estado', alEstado);
}
