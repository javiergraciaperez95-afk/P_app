// Pantalla de entrada (#/entrar): iniciar sesión o crear cuenta con correo y contraseña, o seguir sin cuenta.
// Es una escena: la plaza de la academia Paglot (de día o de noche, como el tema), con su puerta iluminada,
// dos cerezos, farolas y la ficha de entrada sobre un caballete. Tres tutoras están pendientes de la ficha:
// la de la izquierda «apunta» lo que escribes, la de la derecha se tapa los ojos con la contraseña (y espía si
// la enseñas) y la que está sentada encima de la ficha es la que habla. Todas celebran cuando entras.
// Quien sigue sin cuenta ve antes el aviso de la tutora. Con el enlace del correo para cambiar la contraseña
// (nube.recuperando) se usa el formulario de «Perfil».

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { nombre, cambiarNombre } from '../progress.js';
import {
  nubeConfigurada, nube, usuarioActual, alCambiarNube, entrar, crearCuenta, reenviarConfirmacion, recuperarContrasena, salir,
} from '../sync.js';
import { seccionCuenta } from './perfil.js';
import { sol, luna, nubes, maceta, dibujoPixel, conContorno } from './inicio-decorado.js';

// ---------------------------------------------------------------------------
// Los dibujos de la plaza (rejillas de letras; los colores, en css/entrar.css)
// ---------------------------------------------------------------------------

function lienzo(W, H) {
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < W && j >= 0 && j < H) g[j][i] = c;
  };
  return { g, R, filas: () => g.map(f => f.join('')) };
}

// La academia: piedra (s/S), cornisas (c/C), tejados (r/R), ventanas (w se enciende de noche, W no), marcos (f),
// la puerta abierta con su luz (g/G) y sus hojas de madera (d), el reloj (o), banderolas (b/B), hiedra (v/V),
// escalones (e) y banderitas en las torres.
function rejillaAcademia() {
  const W = 300;
  const H = 150;
  const { g, R: pintar, filas } = lienzo(W, H);
  let bajar = 30; // todo 30 filas más abajo (el cielo de encima queda libre)
  const R = (x, y, w, h, c) => pintar(x, y + bajar, w, h, c);
  const piedra = (x0, y0, w, h) => {
    R(x0, y0, w, h, 's');
    for (let y = y0 + 5, fila = 0; y < y0 + h; y += 6, fila++) {
      R(x0, y, w, 1, 'S');
      for (let x = x0 + (fila % 2 ? 6 : 0); x < x0 + w; x += 12) R(x, y - 5, 1, 5, 'S');
    }
  };
  const ventana = (x, y, luz) => {
    R(x + 2, y, 6, 1, luz); R(x + 1, y + 1, 8, 1, luz); R(x, y + 2, 10, 13, luz);
    R(x + 5, y + 1, 1, 14, 'f'); R(x, y + 7, 10, 1, 'f');
    R(x - 1, y + 15, 12, 2, 'c');
  };
  const arco = (cx, cy, r, abajo, c) => {
    for (let y = cy - r; y < abajo; y++) {
      const hw = y < cy ? Math.floor(Math.sqrt(r * r - (cy - y) ** 2)) : r;
      R(cx - hw, y, hw * 2, 1, c);
    }
  };

  // el cuerpo, el tejado a escalones y la cornisa
  piedra(24, 50, 252, 70);
  for (let i = 0; i < 10; i++) R(26 + i * 3, 48 - i * 2, 248 - i * 6, 2, i % 2 ? 'R' : 'r');
  R(20, 48, 260, 3, 'c'); R(20, 51, 260, 1, 'C');

  // las dos torres, con su aguja y su banderita
  for (const x0 of [6, 260]) {
    piedra(x0, 32, 34, 88);
    R(x0 - 3, 30, 40, 3, 'c'); R(x0 - 3, 33, 40, 1, 'C');
    for (let i = 0; i < 19; i++) R(x0 - 2 + i, 29 - i, 38 - i * 2, 1, i % 3 === 2 ? 'R' : 'r');
    R(x0 + 16, 0, 1, 12, 'k'); R(x0 + 17, 1, 8, 5, 'b'); R(x0 + 17, 6, 5, 1, 'b');
    arco(x0 + 17, 47, 6, 53, 'w'); R(x0 + 16, 41, 1, 12, 'f'); R(x0 + 11, 47, 12, 1, 'f');
    ventana(x0 + 12, 66, 'w');
    ventana(x0 + 12, 92, 'W');
  }

  // las ventanas de los dos pisos (menos donde va la puerta)
  for (const [fila, y] of [[0, 62], [1, 90]]) {
    for (let x = 52, n = 0; x <= 238; x += 22, n++) {
      if (x > 104 && x < 186) continue;
      ventana(x, y, (n + fila) % 3 === 1 ? 'W' : 'w');
    }
  }

  // (la torre del reloj va aparte, detrás de la ficha: rejillaTorre)
  // la puerta: marco de piedra oscura, la luz de dentro y las hojas abiertas
  arco(150, 82, 30, 114, 'f');
  arco(150, 82, 26, 114, 'g');
  arco(150, 86, 16, 114, 'G');
  R(124, 82, 7, 32, 'd'); R(169, 82, 7, 32, 'd');
  R(125, 84, 5, 1, 'D'); R(125, 98, 5, 1, 'D'); R(170, 84, 5, 1, 'D'); R(170, 98, 5, 1, 'D');
  R(112, 114, 76, 3, 'e'); R(106, 117, 88, 3, 'e');

  // dos banderolas a los lados de la puerta
  for (const x of [98, 192]) {
    R(x, 60, 10, 28, 'b'); R(x, 60, 10, 2, 'B'); R(x + 4, 66, 2, 10, 'B');
    R(x, 88, 4, 2, 'b'); R(x + 6, 88, 4, 2, 'b'); R(x, 90, 2, 2, 'b'); R(x + 8, 90, 2, 2, 'b');
  }

  // la hiedra, que sube por la piedra (no tapa ventanas)
  bajar = 0;
  let semilla = 11;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  for (const [x0, ancho, alto] of [[24, 16, 46], [44, 6, 22], [234, 10, 30], [252, 22, 52], [112, 6, 26], [184, 6, 30], [6, 10, 34], [284, 10, 40]]) {
    for (let y = H - 1; y > H - alto; y--) {
      const sube = (H - y) / alto;
      for (let x = x0; x < x0 + ancho; x++) {
        if (azar() > 0.95 - sube * 0.6) continue;
        if (g[y][x] === 's' || g[y][x] === 'S') g[y][x] = azar() < 0.3 ? 'V' : 'v';
      }
    }
  }
  return conContorno(filas());
}

// La torre del reloj, que asoma por encima de la ficha (va detrás de ella, centrada): aguja con banderita,
// cornisa, piedra y un reloj grande.
function rejillaTorre() {
  const { R, filas } = lienzo(44, 46);
  R(21, 0, 1, 7, 'k'); R(22, 1, 7, 3, 'B'); R(22, 4, 4, 1, 'B');
  for (let i = 0; i < 5; i++) R(1 + i * 4, 13 - i * 2, 42 - i * 8, 2, i % 2 ? 'R' : 'r');
  R(0, 15, 44, 3, 'c'); R(0, 18, 44, 1, 'C');
  R(2, 19, 40, 27, 's');
  for (let y = 24, fila = 0; y < 46; y += 6, fila++) {
    R(2, y, 40, 1, 'S');
    for (let x = 2 + (fila % 2 ? 6 : 0); x < 42; x += 12) R(x, y - 5, 1, 5, 'S');
  }
  const circulo = (cx, cy, r, c) => {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) R(x, y, 1, 1, c);
  };
  circulo(22, 31, 12, 'C');
  circulo(22, 31, 10, 'o');
  for (const [dx, dy] of [[0, -8], [0, 7], [-8, 0], [7, 0]]) R(22 + dx, 31 + dy, 1, 1, 'k');
  R(22, 25, 1, 6, 'k'); R(22, 31, 5, 1, 'k'); R(21, 30, 3, 3, 'k');
  return conContorno(filas()).slice(0, -1);
}

// Un cerezo en flor: copa rosa (p, P claro, d sombra) y tronco (q, Q sombra).
function rejillaCerezo() {
  const W = 72;
  const H = 82;
  const { g, R, filas } = lienzo(W, H);
  R(33, 46, 6, 36, 'q'); R(37, 46, 2, 36, 'Q'); R(30, 76, 12, 6, 'q'); R(31, 74, 10, 2, 'q');
  for (let i = 0; i < 12; i++) { R(33 - i, 46 - i, 3, 2, 'q'); R(37 + i, 46 - i, 3, 2, 'q'); }
  const copas = [[36, 22, 18], [19, 32, 14], [53, 31, 15], [26, 14, 11], [46, 13, 12], [36, 38, 12], [10, 40, 8], [62, 40, 8]];
  for (const [cx, cy, r] of copas) {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H || Math.hypot(x - cx, y - cy) > r) continue;
      g[y][x] = 'p';
    }
  }
  for (const [cx, cy, r] of copas) {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H || g[y][x] !== 'p' || Math.hypot(x - cx, y - cy) > r) continue;
      if ((x - cx) + (y - cy) < -r * 0.75) g[y][x] = 'P';
      else if (y - cy > r * 0.6) g[y][x] = 'd';
    }
  }
  // florecitas sueltas más claras y algún hueco entre las flores
  let semilla = 5;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  for (let n = 0; n < 140; n++) {
    const x = Math.floor(azar() * W);
    const y = Math.floor(azar() * 52);
    if (g[y][x] === 'p' || g[y][x] === 'd') { g[y][x] = 'P'; if (azar() < 0.5 && g[y][x + 1] === 'p') g[y][x + 1] = 'P'; }
  }
  for (const [x, y] of [[30, 26], [44, 30], [22, 38], [50, 20], [14, 34], [58, 36]]) R(x, y, 2, 2, 'd');
  return conContorno(filas());
}

// Una farola de la plaza: hierro (l, L brillo) y el farol (y).
function rejillaFarola() {
  const { R, filas } = lienzo(11, 46);
  R(3, 0, 5, 1, 'l'); R(2, 1, 7, 1, 'l');
  R(1, 2, 9, 8, 'l'); R(2, 2, 3, 8, 'y'); R(6, 2, 3, 8, 'y');
  R(1, 10, 9, 1, 'l'); R(3, 11, 5, 1, 'l');
  R(4, 12, 3, 30, 'l'); R(4, 12, 1, 30, 'L');
  R(2, 42, 7, 2, 'l'); R(1, 44, 9, 2, 'l');
  return conContorno(filas());
}

// ---------------------------------------------------------------------------
// La pantalla
// ---------------------------------------------------------------------------

/** Pinta la pantalla. Devuelve una función que la apaga: hay que llamarla al salir. */
export function pintarEntrar(contenedor) {
  const apagar = [];
  let encendida = true;
  const despues = (ms, fn) => { const id = setTimeout(() => { if (encendida) fn(); }, ms); apagar.push(() => clearTimeout(id)); };
  const destino = hayCurso ? '#/lecciones' : '#/idiomas';

  // Las tres tutoras: la del curso (o una al azar) se sienta en la ficha; las otras dos, al azar y distintas.
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const barajadas = [...disponibles].sort(() => Math.random() - 0.5);
  const anfitriona = hayCurso ? curso : barajadas[0];
  const [deIzq, deDer] = barajadas.filter(c => c.id !== anfitriona.id);

  function tutora(c, clase) {
    const canvas = el('canvas', { class: 'tutora-lienzo', width: 48, height: 64 });
    const globo = el('span', { class: 'en-globo' });
    const figura = el('div', { class: `en-tutora ${clase}`, 'aria-hidden': 'true' }, globo, canvas);
    const yo = { figura, sprite: null, quieta: false };
    dibujoDe(c).then(d => {
      if (!encendida) return;
      yo.sprite = d.crearSprite(canvas);
      apagar.push(() => yo.sprite?.parar());
    }).catch(() => { figura.hidden = true; });
    yo.gesto = nombre => yo.sprite?.gesto(nombre);
    let callar = null;
    yo.decir = (texto, ms = 3400) => {
      globo.textContent = texto;
      figura.classList.add('habla');
      clearTimeout(callar);
      callar = setTimeout(() => figura.classList.remove('habla'), ms);
    };
    apagar.push(() => clearTimeout(callar));
    figura.addEventListener('click', () => { sonar('saludo'); yo.sprite?.reaccionar('cosquillas', 900); yo.gesto('firma'); });
    return yo;
  }
  const tIzq = tutora(deIzq ?? anfitriona, 'en-izq');
  const tDer = tutora(deDer ?? anfitriona, 'en-der');
  const tFicha = tutora(anfitriona, 'en-sentada');
  const todas = [tIzq, tDer, tFicha];

  // ----- Los campos -----
  let contador = 0;
  function campo(texto, atributos, icono) {
    const id = `entrar-campo-${++contador}`;
    const entrada = el('input', { id, ...atributos });
    const nodo = el('div', { class: 'en-campo' },
      el('label', { for: id }, texto),
      el('div', { class: 'en-caja' }, el('span', { class: `en-icono en-icono-${icono}`, 'aria-hidden': 'true' }), entrada));
    // la de la izquierda va apuntando lo que se escribe
    let apuntando = 0;
    entrada.addEventListener('input', () => {
      if (Date.now() - apuntando < 2200) return;
      apuntando = Date.now();
      tIzq.gesto('escribir');
    });
    return { entrada, nodo };
  }

  // Contraseña: la de la derecha no mira; si se enseña, espía entre los dedos.
  let tapada = false;
  function campoClave(texto, autocompletar) {
    const c = campo(texto, { type: 'password', required: true, minlength: '8', autocomplete: autocompletar }, 'candado');
    const ver = el('button', { type: 'button', class: 'en-ver', 'aria-pressed': 'false', 'aria-controls': c.entrada.id, title: t('form.ver') },
      el('span', { class: 'solo-lector' }, t('form.ver')));
    c.nodo.querySelector('.en-caja').append(ver);
    const mirar = () => {
      const vista = c.entrada.type === 'text';
      tapada = true;
      tDer.gesto(vista ? 'espiar' : 'noMirar');
      tDer.decir(t(vista ? 'entrar.espio' : 'entrar.noMiro'), 2400);
    };
    c.entrada.addEventListener('focus', mirar);
    c.entrada.addEventListener('blur', () => despues(60, () => {
      if (document.activeElement?.type === 'password' || document.activeElement?.classList.contains('en-ver')) return;
      if (tapada) { tapada = false; tDer.gesto('soltar'); }
    }));
    ver.addEventListener('click', () => {
      const mostrar = c.entrada.type === 'password';
      c.entrada.type = mostrar ? 'text' : 'password';
      ver.setAttribute('aria-pressed', String(mostrar));
      ver.title = t(mostrar ? 'form.ocultar' : 'form.ver');
      ver.firstChild.textContent = ver.title;
      sonar(mostrar ? 'abrir' : 'cerrar');
      c.entrada.focus();
      mirar();
    });
    return c;
  }

  /** Formulario: valida, dice «Un momento…», enseña el error o el resultado, y las tutoras reaccionan. */
  function formulario(campos, textoBoton, accion, debajo = []) {
    const mensaje = el('p', { class: 'en-mensaje', role: 'status' });
    const enviar = el('button', { type: 'submit', class: 'en-boton' }, textoBoton);
    const form = el('form', { class: 'en-form', novalidate: true }, campos, mensaje, enviar, debajo);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const invalido = [...form.querySelectorAll('input')].find(i => !i.checkValidity());
      const fallo = texto => {
        mensaje.className = 'en-mensaje error';
        mensaje.textContent = texto;
        sonar('mal');
        tIzq.gesto('rascarse');
        tDer.gesto('negar');
        tFicha.sprite?.reaccionar('agobiada', 1400);
      };
      if (invalido) {
        fallo(invalido.type === 'email' ? t('form.correoValido') : invalido.type === 'password' || invalido.minLength > 0 ? t('form.contrasenaCorta') : t('form.rellena'));
        invalido.focus();
        return;
      }
      if (!nubeConfigurada) { fallo(t('form.sinSupabase')); return; }
      enviar.disabled = true;
      mensaje.className = 'en-mensaje';
      mensaje.textContent = t('form.unMomento');
      tFicha.gesto('pensar');
      try {
        const resultado = await accion(mensaje);
        if (!form.isConnected) return; // ya ha entrado y la ficha se ha repintado
        mensaje.className = 'en-mensaje bien';
        mensaje.textContent = resultado ?? '';
      } catch (error) {
        if (form.isConnected) fallo(error.message);
      } finally {
        enviar.disabled = false;
      }
    });
    return form;
  }

  // ----- La ficha: entrar · crear · recuperar · sin cuenta · dentro -----
  let modo = location.hash === '#/entrar/crear' ? 'crear' : 'entrar';
  const cuerpo = el('div', { class: 'en-ficha-cuerpo' });
  const pestanas = [['entrar', t('cuenta.iniciarSesion')], ['crear', t('cuenta.crear')]].map(([clave, texto]) => {
    const b = el('button', { type: 'button', class: 'en-pestana', 'aria-pressed': 'false' }, texto);
    b.addEventListener('click', () => cambiar(clave));
    return b;
  });
  const barra = el('div', { class: 'en-pestanas', role: 'group', 'aria-label': t('cuenta.opciones') }, pestanas, el('span', { class: 'en-pestanas-marca', 'aria-hidden': 'true' }));

  function cambiar(nuevo, { conSonido = true } = {}) {
    if (conSonido) sonar('elegir');
    modo = nuevo;
    pintarFicha();
    if (modo === 'crear') { tFicha.decir(t('entrar.ficha')); tFicha.gesto('saludar'); tIzq.gesto('invitarDer'); }
    if (modo === 'entrar') { tFicha.decir(t('entrar.tutora')); tFicha.gesto('guino'); tDer.gesto('invitarIzq'); }
    if (modo === 'recuperar') { tFicha.decir(t('entrar.olvido')); tFicha.gesto('pensar'); }
    cuerpo.querySelector('input')?.focus({ preventScroll: true });
  }

  const enlaceA = (texto, a) => {
    const b = el('button', { type: 'button', class: 'en-enlace' }, texto);
    b.addEventListener('click', () => cambiar(a));
    return b;
  };
  const sinCuenta = () => {
    const b = el('button', { type: 'button', class: 'en-boton en-boton-claro' }, t('entrar.sinCuenta'));
    b.addEventListener('click', () => {
      sonar('clic');
      modo = 'sinCuenta';
      pintarFicha();
      tFicha.gesto('respingo');
      tFicha.sprite?.reaccionar('apurada', 1600);
      tIzq.gesto('negar');
    });
    return [el('p', { class: 'en-o', 'aria-hidden': 'true' }, el('span', {}, t('entrar.o'))), b];
  };

  function fichaEntrar() {
    const correo = campo(t('form.correo'), { type: 'email', required: true, autocomplete: 'email', inputmode: 'email' }, 'sobre');
    const clave = campoClave(t('form.contrasena'), 'current-password');
    clave.entrada.minLength = 1; // al entrar no se juzga la contraseña: lo dice el servidor
    const reenvio = el('p', { class: 'en-nota', hidden: true });
    return formulario([correo.nodo, clave.nodo, el('div', { class: 'en-olvido' }, enlaceA(t('cuenta.olvidada'), 'recuperar')), reenvio],
      t('cuenta.iniciarSesion'), async () => {
        try {
          await entrar(correo.entrada.value.trim(), clave.entrada.value);
        } catch (error) {
          // sin confirmar: se ofrece mandar otra vez el enlace
          if (error.codigo === 'sin_confirmar') {
            const boton = el('button', { type: 'button', class: 'en-enlace' }, t('cuenta.reenviarConfirmacion'));
            boton.addEventListener('click', async () => {
              await reenviarConfirmacion(correo.entrada.value.trim()).catch(() => {});
              sonar('volar');
              poner(reenvio, t('cuenta.enlaceEnviado'));
            });
            poner(reenvio, boton);
            reenvio.hidden = false;
          }
          throw error;
        }
        celebrar();
        return t('cuenta.sesionIniciada');
      },
      [...sinCuenta(), el('p', { class: 'en-cambiar' }, t('entrar.noTienes'), ' ', enlaceA(t('cuenta.crear'), 'crear'))]);
  }

  function fichaCrear() {
    const quien = campo(t('form.nombreOpcional'), { type: 'text', autocomplete: 'nickname', value: nombre(), maxlength: '40' }, 'persona');
    const correo = campo(t('form.correo'), { type: 'email', required: true, autocomplete: 'email', inputmode: 'email' }, 'sobre');
    const clave = campoClave(t('form.contrasenaMinimo'), 'new-password');
    const repetir = campoClave(t('form.repiteContrasena'), 'new-password');
    return formulario([quien.nodo, correo.nodo, clave.nodo, repetir.nodo], t('cuenta.crear'), async () => {
      if (clave.entrada.value !== repetir.entrada.value) throw new Error(t('form.noCoinciden'));
      if (quien.entrada.value.trim()) cambiarNombre(quien.entrada.value);
      await crearCuenta(correo.entrada.value.trim(), clave.entrada.value, quien.entrada.value.trim());
      sonar('bien');
      for (const x of todas) x.gesto('aplaudir');
      tFicha.decir(t('cuenta.creadaConfirmaTutora'), 5000);
      return t('cuenta.creadaConfirma');
    }, [...sinCuenta(), el('p', { class: 'en-cambiar' }, t('entrar.yaTienes'), ' ', enlaceA(t('cuenta.iniciarSesion'), 'entrar'))]);
  }

  function fichaRecuperar() {
    const correo = campo(t('form.correoCuenta'), { type: 'email', required: true, autocomplete: 'email', inputmode: 'email' }, 'sobre');
    return formulario([el('p', { class: 'en-nota' }, t('cuenta.recuperarTexto')), correo.nodo], t('cuenta.enviarEnlace'), async () => {
      await recuperarContrasena(correo.entrada.value.trim());
      sonar('volar');
      tFicha.gesto('pulgar');
      tFicha.decir(t('cuenta.enlaceEnviadoTutora'), 5000);
      return t('cuenta.enlaceEnviado');
    }, [el('p', { class: 'en-cambiar' }, enlaceA(t('entrar.volver'), 'entrar'))]);
  }

  function fichaSinCuenta() {
    const mejor = el('button', { type: 'button', class: 'en-boton' }, t('entrar.avisoNo'));
    mejor.addEventListener('click', () => cambiar('crear'));
    return el('div', { class: 'en-aviso', role: 'alert' },
      el('span', { class: 'en-aviso-icono', 'aria-hidden': 'true' }, '!'),
      el('p', {}, t('entrar.aviso')),
      mejor,
      el('a', { class: 'en-boton en-boton-claro', href: destino, onclick: () => sonar('pagina') }, t('entrar.avisoSi')),
      el('p', { class: 'en-cambiar' }, enlaceA(t('entrar.volver'), 'entrar')));
  }

  function fichaDentro(usuario) {
    const estado = el('p', { class: `en-nota estado-nube nube-${nube.estado}`, role: 'status' }, t(`nube.estado.${nube.estado}`));
    const cerrar = el('button', { type: 'button', class: 'en-enlace' }, t('cuenta.cerrarSesion'));
    cerrar.addEventListener('click', async () => {
      await salir();
      sonar('puerta');
      tFicha.decir(t('cuenta.sesionCerradaTutora'));
    });
    return el('div', { class: 'en-dentro' },
      el('span', { class: 'en-sello', 'aria-hidden': 'true' }, '✔'),
      el('p', {}, t('cuenta.sesionComo')),
      el('p', { class: 'en-correo' }, usuario.email),
      estado,
      el('a', { class: 'en-boton', href: destino, onclick: () => sonar('pagina') },
        hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')),
      el('p', { class: 'en-cambiar' }, cerrar));
  }

  function pintarFicha() {
    const usuario = usuarioActual();
    ficha.classList.toggle('en-con-sesion', Boolean(usuario));
    barra.hidden = Boolean(usuario) || Boolean(nube.recuperando) || modo === 'sinCuenta' || modo === 'recuperar';
    pestanas.forEach((b, i) => b.setAttribute('aria-pressed', String((i === 0 && modo !== 'crear') || (i === 1 && modo === 'crear'))));
    barra.style.setProperty('--en', modo === 'crear' ? 1 : 0);
    let contenido;
    if (nube.recuperando) contenido = seccionCuenta();
    else if (usuario) contenido = fichaDentro(usuario);
    else contenido = { entrar: fichaEntrar, crear: fichaCrear, recuperar: fichaRecuperar, sinCuenta: fichaSinCuenta }[modo]();
    poner(cuerpo, contenido);
    ficha.dataset.modo = usuario ? 'dentro' : modo;
  }

  function celebrar() {
    sonar('bien');
    escena.classList.add('en-abierta');
    todas.forEach((x, i) => despues(i * 160, () => x.gesto('celebrar')));
    tFicha.decir(t('entrar.dentro'));
  }

  const ficha = el('div', { class: 'en-ficha' },
    tFicha.figura,
    el('div', { class: 'en-ficha-cabeza' },
      el('span', { class: 'en-marca' }, 'Pa', el('i', {}, 'glot')),
      el('span', { class: 'en-agujero', 'aria-hidden': 'true' })),
    el('h1', { class: 'solo-lector' }, t('entrar.titulo')),
    el('p', { class: 'en-lema' }, t('entrar.lema')),
    !nubeConfigurada && el('p', { class: 'en-nota en-sin-nube', role: 'note' }, t('cuenta.sinConfigurar')),
    barra,
    cuerpo);

  // ----- La escena -----
  const petalos = el('div', { class: 'en-petalos', 'aria-hidden': 'true' }, Array.from({ length: 16 }, (_, i) => el('i', { style: `--n:${i}` })));
  const escena = el('section', { class: 'academia-entrada' },
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
    dibujoPixel(rejillaAcademia(), 'en-academia', 'ac'),
    el('div', { class: 'en-puerta-luz', 'aria-hidden': 'true' }),
    el('div', { class: 'en-plaza', 'aria-hidden': 'true' }),
    dibujoPixel(rejillaCerezo(), 'en-cerezo en-cerezo-izq', 'cz'),
    dibujoPixel(rejillaCerezo(), 'en-cerezo en-cerezo-der', 'cz'),
    el('span', { class: 'en-farola en-farola-izq', 'aria-hidden': 'true' }, dibujoPixel(rejillaFarola(), 'en-farola-dibujo', 'fa'), el('i')),
    el('span', { class: 'en-farola en-farola-der', 'aria-hidden': 'true' }, dibujoPixel(rejillaFarola(), 'en-farola-dibujo', 'fa'), el('i')),
    el('span', { class: 'en-maceta en-maceta-izq', 'aria-hidden': 'true' }, maceta(1)),
    el('span', { class: 'en-maceta en-maceta-der', 'aria-hidden': 'true' }, maceta(2)),
    petalos,
    el('div', { class: 'en-centro' },
      tIzq.figura,
      el('div', { class: 'en-caballete' }, dibujoPixel(rejillaTorre(), 'en-torre en-academia', 'ac'), ficha, el('span', { class: 'en-patas', 'aria-hidden': 'true' })),
      tDer.figura));

  pintarFicha();
  poner(contenedor, escena);

  // Si cambia la sesión (entra, sale, o llega del enlace del correo), se repinta la ficha.
  let huella = `${Boolean(usuarioActual())}|${Boolean(nube.recuperando)}`;
  apagar.push(alCambiarNube(() => {
    const ahora = `${Boolean(usuarioActual())}|${Boolean(nube.recuperando)}`;
    if (ahora === huella) return;
    huella = ahora;
    pintarFicha();
  }));

  // La bienvenida, y de vez en cuando alguna hace algo (si no está tapándose los ojos).
  despues(500, () => {
    tFicha.decir(t(usuarioActual() ? 'entrar.dentro' : modo === 'crear' ? 'entrar.ficha' : 'entrar.tutora'));
    tFicha.gesto('saludar');
    tIzq.gesto('invitarDer');
  });
  const GESTOS = [[tIzq, ['guino', 'mirarLados', 'senalarAbajoDer', 'moverPie']], [tDer, ['pulgar', 'estirarse', 'invitarIzq', 'mirarLados']], [tFicha, ['moverPie', 'pelo', 'guino', 'asentir']]];
  let turno = 0;
  const reloj = setInterval(() => {
    if (document.hidden) return;
    const [quien, lista] = GESTOS[turno % GESTOS.length];
    if (!(quien === tDer && tapada) && !quien.sprite?.ocupada?.()) quien.gesto(lista[Math.floor(turno / GESTOS.length) % lista.length]);
    turno++;
  }, 3200);
  apagar.push(() => clearInterval(reloj));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
