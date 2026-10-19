// Pantalla de la cuenta (#/entrar), al estilo Mullvad: no hay correo ni contraseña obligatorios. Cada dispositivo tiene
// un número de cuenta de 16 cifras (js/nube.js); aquí se ve y se copia, se entra con el de otro dispositivo, o se une un
// correo (con un código de 6 cifras) para que no caduque y para recuperar el número.
// Es una escena: la plaza de la academia Paglot (de día o de noche, como el tema), con su puerta iluminada,
// dos cerezos, farolas y la ficha de entrada sobre un caballete. Tres tutoras están pendientes de la ficha:
// la de la izquierda «apunta» lo que escribes, la de la derecha se tapa los ojos mientras se ve el número (y espía si
// lo enseñas) y la que está sentada encima de la ficha es la que habla. Todas celebran cuando entras.

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import {
  nubeActiva, nube, alCambiarNube, numeroCuenta, numeroBonito, limpiarNumero, usarNumero,
  pedirCodigo, comprobarCodigo, unirCorreo, recuperarConCorreo, correoDeLaCuenta,
} from '../nube.js';
import { sol, luna, nubes, maceta, dibujoPixel, conContorno, conHalo } from './inicio-decorado.js';

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

  /** Formulario: valida, dice «Un momento…», enseña el error o el resultado, y las tutoras reaccionan. */
  function formulario(campos, textoBoton, accion, debajo = []) {
    const mensaje = el('p', { class: 'en-mensaje', role: 'status' });
    const enviar = el('button', { type: 'submit', class: 'en-boton' }, textoBoton);
    const form = el('form', { class: 'en-form', novalidate: true }, campos, mensaje, enviar, debajo);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fallo = texto => {
        mensaje.className = 'en-mensaje error';
        mensaje.textContent = texto;
        sonar('mal');
        tIzq.gesto('rascarse');
        tDer.gesto('negar');
        tFicha.sprite?.reaccionar('agobiada', 1400);
      };
      if (!nubeActiva) { fallo(t('cuenta2.sinConexion')); return; }
      enviar.disabled = true;
      mensaje.className = 'en-mensaje';
      mensaje.textContent = t('form.unMomento');
      tFicha.gesto('pensar');
      try {
        const resultado = await accion(mensaje, fallo);
        if (!form.isConnected || resultado === false) return;
        mensaje.className = 'en-mensaje bien';
        mensaje.textContent = resultado ?? '';
      } catch (error) {
        if (!form.isConnected) return;
        const motivo = error.motivo === 'formato' ? 'cuenta2.malFormato' : error.motivo === 'noExiste' ? 'cuenta2.noExiste'
          : error.motivo === 'sinCuenta' ? 'cuenta2.sinCuentaCorreo' : error.estado ? null : 'cuenta2.sinConexion';
        fallo(motivo ? t(motivo) : error.message);
      } finally {
        enviar.disabled = false;
      }
    });
    return form;
  }

  // ----- La ficha: mi número · ya tengo uno · con correo -----
  let modo = location.hash === '#/entrar/numero' ? 'numero' : location.hash === '#/entrar/correo' ? 'correo' : 'cuenta';
  const cuerpo = el('div', { class: 'en-ficha-cuerpo' });
  const MODOS = [['cuenta', t('entrar.miNumero')], ['numero', t('entrar.yaTengo')], ['correo', t('entrar.conCorreo')]];
  const pestanas = MODOS.map(([clave, texto]) => {
    const b = el('button', { type: 'button', class: 'en-pestana', 'aria-pressed': 'false' }, texto);
    b.addEventListener('click', () => cambiar(clave));
    return b;
  });
  const barra = el('div', { class: 'en-pestanas en-pestanas-3', role: 'group', 'aria-label': t('cuenta.opciones') }, pestanas, el('span', { class: 'en-pestanas-marca', 'aria-hidden': 'true' }));

  function cambiar(nuevo, { conSonido = true } = {}) {
    if (conSonido) sonar('elegir');
    modo = nuevo;
    pintarFicha();
    if (modo === 'cuenta') { tFicha.decir(t('entrar.tutora')); tFicha.gesto('saludar'); tIzq.gesto('invitarDer'); }
    if (modo === 'numero') { tFicha.decir(t('entrar.tutoraNumero')); tFicha.gesto('guino'); tDer.gesto('invitarIzq'); }
    if (modo === 'correo') { tFicha.decir(t('cuenta2.correoAyuda')); tFicha.gesto('pensar'); }
    cuerpo.querySelector('input')?.focus({ preventScroll: true });
  }

  // El número de este dispositivo: tapado hasta que se toca (la de la derecha no mira; si se enseña, espía).
  function fichaCuenta() {
    const numero = numeroCuenta();
    let visible = false;
    const cifras = el('button', { type: 'button', class: 'en-numero tapado', 'aria-pressed': 'false', 'aria-label': t('cuenta2.ver'), title: t('cuenta2.ver') },
      numeroBonito(numero));
    cifras.addEventListener('click', () => {
      visible = !visible;
      cifras.classList.toggle('tapado', !visible);
      cifras.setAttribute('aria-pressed', String(visible));
      sonar(visible ? 'abrir' : 'cerrar');
      tDer.gesto(visible ? 'espiar' : 'noMirar');
      tDer.decir(t(visible ? 'entrar.espio' : 'entrar.noMiro'), 2400);
    });
    const aviso = el('p', { class: 'en-nota', role: 'status' });
    const copiar = el('button', { type: 'button', class: 'en-boton en-boton-claro' }, t('cuenta2.copiar'));
    copiar.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(numero);
        aviso.textContent = t('cuenta2.copiado');
        sonar('guardar');
        tIzq.gesto('escribir');
      } catch {
        aviso.textContent = `${t('cuenta2.copiaAMano')} ${numeroBonito(numero)}`;
        sonar('pagina');
      }
    });
    const estado = el('p', { class: `en-nota estado-nube nube-${nube.estado}`, role: 'status' }, t(`cuenta2.estado.${nube.estado}`));
    const caduca = el('p', { class: 'en-nota' }, t('cuenta2.caduca'));
    correoDeLaCuenta().then(correo => {
      if (correo && caduca.isConnected) poner(caduca, t('cuenta2.noCaduca'), ' ', t('cuenta2.correoUnido', { correo }));
    });
    return el('div', { class: 'en-dentro' },
      el('p', {}, t('cuenta2.intro')),
      cifras,
      el('div', { class: 'en-botones' }, copiar),
      aviso,
      estado,
      caduca,
      el('a', { class: 'en-boton', href: destino, onclick: () => sonar('pagina') },
        hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')));
  }

  // Entrar con el número de otro dispositivo: se juntan los dos progresos.
  function fichaNumero() {
    const c = campo(t('cuenta2.otroNumero'), { type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: '24', placeholder: '0000 0000 0000 0000' }, 'candado');
    c.entrada.addEventListener('input', () => {
      const n = limpiarNumero(c.entrada.value).slice(0, 16);
      const bonito = numeroBonito(n);
      if (bonito !== c.entrada.value) c.entrada.value = bonito;
    });
    return formulario([c.nodo], t('cuenta2.entrar'), async () => {
      await usarNumero(c.entrada.value);
      celebrar();
      despues(1800, () => { modo = 'cuenta'; pintarFicha(); });
      return t('cuenta2.dentro');
    });
  }

  // El correo: se pide un código y, con él, se une a esta cuenta o se recupera la que ya tenía.
  function fichaCorreo() {
    const correo = campo(t('cuenta2.correo'), { type: 'email', required: true, autocomplete: 'email', inputmode: 'email', placeholder: t('cuenta2.correoEjemplo') }, 'sobre');
    const codigo = campo(t('cuenta2.codigo'), { type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' }, 'candado');
    codigo.nodo.hidden = true;
    let enviado = false;
    const form = formulario([el('p', { class: 'en-nota' }, t('cuenta2.correoAyuda')), correo.nodo, codigo.nodo], t('cuenta2.enviarCodigo'), async (mensaje, fallo) => {
      const direccion = correo.entrada.value.trim();
      if (!correo.entrada.checkValidity() || !direccion) { fallo(t('form.correoValido')); return false; }
      if (!enviado) {
        await pedirCodigo(direccion);
        enviado = true;
        codigo.nodo.hidden = false;
        form.querySelector('button[type="submit"]').textContent = t('cuenta2.unir');
        codigo.entrada.focus();
        sonar('volar');
        tFicha.gesto('pulgar');
        return t('cuenta2.codigoEnviado', { correo: direccion });
      }
      let token;
      try { token = await comprobarCodigo(direccion, codigo.entrada.value); } catch { fallo(t('cuenta2.codigoMal')); return false; }
      // si ese correo ya tenía una cuenta, se recupera; si no, se une a la de este dispositivo
      try {
        await recuperarConCorreo(token);
        celebrar();
        tFicha.decir(t('cuenta2.recuperadoTutora'), 5000);
      } catch (e) {
        if (e.motivo !== 'sinCuenta') throw e;
        await unirCorreo(token);
        celebrar();
        tFicha.decir(t('cuenta2.unidoTutora'), 5000);
      }
      despues(2200, () => { modo = 'cuenta'; pintarFicha(); });
      return t('cuenta2.correoUnido', { correo: direccion });
    });
    return form;
  }

  function pintarFicha() {
    pestanas.forEach((b, i) => b.setAttribute('aria-pressed', String(MODOS[i][0] === modo)));
    barra.style.setProperty('--en', MODOS.findIndex(m => m[0] === modo));
    poner(cuerpo, { cuenta: fichaCuenta, numero: fichaNumero, correo: fichaCorreo }[modo]());
    ficha.dataset.modo = modo;
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

    barra,
    cuerpo);

  // ----- La escena -----
  const petalos = el('div', { class: 'en-petalos', 'aria-hidden': 'true' }, Array.from({ length: 16 }, (_, i) => el('i', { style: `--n:${i}` })));
  const escena = el('section', { class: 'academia-entrada' },
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
    // de noche las ventanas, la puerta abierta y las farolas alumbran (conHalo: solo de noche, sin animación)
    conHalo(dibujoPixel(rejillaAcademia(), 'en-academia', 'ac'), ['ac-w', 'ac-g']),
    el('div', { class: 'en-puerta-luz', 'aria-hidden': 'true' }),
    el('div', { class: 'en-plaza', 'aria-hidden': 'true' }),
    dibujoPixel(rejillaCerezo(), 'en-cerezo en-cerezo-izq', 'cz'),
    dibujoPixel(rejillaCerezo(), 'en-cerezo en-cerezo-der', 'cz'),
    el('span', { class: 'en-farola en-farola-izq', 'aria-hidden': 'true' }, conHalo(dibujoPixel(rejillaFarola(), 'en-farola-dibujo', 'fa'), ['fa-y'], { radio: 3 }), el('i')),
    el('span', { class: 'en-farola en-farola-der', 'aria-hidden': 'true' }, conHalo(dibujoPixel(rejillaFarola(), 'en-farola-dibujo', 'fa'), ['fa-y'], { radio: 3 }), el('i')),
    el('span', { class: 'en-maceta en-maceta-izq', 'aria-hidden': 'true' }, maceta(1)),
    el('span', { class: 'en-maceta en-maceta-der', 'aria-hidden': 'true' }, maceta(2)),
    petalos,
    el('div', { class: 'en-centro' },
      tIzq.figura,
      el('div', { class: 'en-caballete' }, dibujoPixel(rejillaTorre(), 'en-torre en-academia', 'ac'), ficha, el('span', { class: 'en-patas', 'aria-hidden': 'true' })),
      tDer.figura));

  pintarFicha();
  poner(contenedor, escena);

  // El estado de la nube (guardada, sin conexión…) se pone al día en la ficha del número.
  apagar.push(alCambiarNube(() => {
    const estado = cuerpo.querySelector('.estado-nube');
    if (!estado) return;
    estado.className = `en-nota estado-nube nube-${nube.estado}`;
    estado.textContent = t(`cuenta2.estado.${nube.estado}`);
  }));

  // La bienvenida, y de vez en cuando alguna hace algo (si no está tapándose los ojos).
  despues(500, () => {
    tFicha.decir(t(modo === 'numero' ? 'entrar.tutoraNumero' : modo === 'correo' ? 'cuenta2.correoAyuda' : 'entrar.tutora'));
    tFicha.gesto('saludar');
    tIzq.gesto('invitarDer');
  });
  const GESTOS = [[tIzq, ['guino', 'mirarLados', 'senalarAbajoDer', 'moverPie']], [tDer, ['pulgar', 'estirarse', 'invitarIzq', 'mirarLados']], [tFicha, ['moverPie', 'pelo', 'guino', 'asentir']]];
  let turno = 0;
  const reloj = setInterval(() => {
    if (document.hidden) return;
    const [quien, lista] = GESTOS[turno % GESTOS.length];
    if (!quien.sprite?.ocupada?.()) quien.gesto(lista[Math.floor(turno / GESTOS.length) % lista.length]);
    turno++;
  }, 3200);
  apagar.push(() => clearInterval(reloj));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
