// Pantalla «Repaso»: tarjetas del cuaderno, como en Anki.
// Se ve la palabra → «Mostrar respuesta» → Otra vez / Difícil / Bien / Fácil.
// Teclado: espacio o Enter para mostrar; 1, 2, 3, 4 para responder; Z para deshacer.

import { esc, alAzar } from './util.js';
import * as cuaderno from './cuaderno.js';
import { etiquetaRespuesta, enAprendizaje, inicioDia } from './srs.js';
import { htmlContadores } from './vista-cuaderno.js';
import { decir, ponerExpresion, bocadillo } from './tutora.js';
import { sonido } from './sonido.js';
import { T } from './textos.js';
import { htmlAltavoz } from './voz.js';

const BOTONES = [
  { r: 1, texto: 'Otra vez', clase: 'r-otra' },
  { r: 2, texto: 'Difícil', clase: 'r-dificil' },
  { r: 3, texto: 'Bien', clase: 'r-bien' },
  { r: 4, texto: 'Fácil', clase: 'r-facil' },
];
const MAX_DESHACER = 20;

export function vistaRepaso(raiz) {
  let actual = null;
  let mostrada = false;
  let hechas = 0;
  let reloj = null;
  const historial = []; // fotos de antes de cada respuesta, para deshacer

  const htmlDeshacer = () => (historial.length
    ? '<button type="button" class="btn btn-peq tr-deshacer" data-accion="deshacer">↶ Deshacer <kbd>Z</kbd></button>'
    : '');

  function pintar(forzada = null) {
    clearInterval(reloj);
    actual = forzada || cuaderno.siguiente();
    mostrada = false;

    if (!cuaderno.lista().length) {
      raiz.innerHTML = `
        <section class="repaso">
          <h1 class="portada-titulo">Repaso</h1>
          <div class="caja"><p>Todavía no has guardado palabras. Márcalas con ☆ en las lecciones y aquí aparecerán.</p>
          <a class="btn" href="#/">Ir a las lecciones</a></div>
        </section>`;
      return;
    }

    if (!actual) {
      raiz.innerHTML = `
        <section class="repaso">
          <h1 class="portada-titulo">Repaso</h1>
          <div class="caja repaso-fin">
            <p><strong>¡Has terminado por hoy!</strong></p>
            <p>${esc(textoProximo())}</p>
            <div class="pie-botones repaso-fin-botones">
              <a class="btn" href="#/cuaderno">Ver mi cuaderno</a>
              ${htmlDeshacer()}
            </div>
          </div>
        </section>`;
      if (hechas) { sonido.fanfarria(); decir(T.repasoFin, 'contenta'); }
      // Si hay tarjetas en aprendizaje para dentro de un rato, vuelve a mirar solo.
      reloj = setInterval(() => { if (cuaderno.siguiente()) pintar(); }, 15000);
      return;
    }

    const t = actual;
    const c = cuaderno.contar();
    const tipo = t.srs.estado === 'nueva' ? 'c-nuevas' : enAprendizaje(t.srs) ? 'c-aprendiendo' : 'c-repaso';
    raiz.innerHTML = `
      <section class="repaso">
        <div class="repaso-cabecera">
          <h1 class="portada-titulo">Repaso</h1>
          ${htmlDeshacer()}
        </div>
        <div class="repaso-contadores" data-actual="${tipo}">${htmlContadores(c)}</div>
        <div class="caja tarjeta-repaso" aria-live="polite">
          <p class="tr-vi" lang="vi">${esc(t.vi)} ${htmlAltavoz(t.vi, t.vi)}</p>
          <div class="tr-respuesta" hidden>
            <hr class="tr-linea">
            ${t.pron ? `<p class="tr-pron">[${esc(t.pron)}]</p>` : ''}
            <p class="tr-es">${esc(t.es)}</p>
            ${t.nota ? `<p class="tr-nota">${esc(t.nota)}</p>` : ''}
            ${t.ejemplo?.vi ? `
              <div class="tr-ejemplo">
                <p class="tr-ejemplo-vi" lang="vi">${htmlAltavoz(t.ejemplo.vi, t.ejemplo.vi)}${resaltar(t.ejemplo.vi, t.vi)}</p>
                ${t.ejemplo.es ? `<p class="tr-ejemplo-es">${esc(t.ejemplo.es)}</p>` : ''}
              </div>` : ''}
            ${t.leccion ? `<p class="pista">${/^\d+$/.test(t.leccion) ? 'De la lección ' : 'De '}${esc(t.leccion)}</p>` : ''}
          </div>
        </div>
        <div class="tr-botones">
          <button type="button" class="btn btn-acento tr-mostrar" data-accion="mostrar">Mostrar respuesta <kbd>espacio</kbd></button>
        </div>
      </section>`;
    raiz.querySelector('.tr-mostrar').focus({ preventScroll: true });
    ponerExpresion('pensando');
  }

  function mostrar() {
    if (!actual || mostrada) return;
    mostrada = true;
    sonido.pagina();
    raiz.querySelector('.tr-respuesta').hidden = false;
    raiz.querySelector('.tr-botones').innerHTML = BOTONES.map((b) => `
      <button type="button" class="btn tr-resp ${b.clase}" data-r="${b.r}">
        <span class="tr-intervalo">${esc(etiquetaRespuesta(actual.srs, b.r))}</span>
        <span>${b.texto}</span>
        <kbd>${b.r}</kbd>
      </button>`).join('');
    raiz.querySelector('.r-bien').focus({ preventScroll: true });
    ponerExpresion('normal');
  }

  function responder(r) {
    if (!actual || !mostrada) return;
    const foto = cuaderno.responderTarjeta(actual.id, r);
    if (foto) {
      historial.push(foto);
      if (historial.length > MAX_DESHACER) historial.shift();
    }
    hechas++;
    if (r === 1) { sonido.fallo(); ponerExpresion('apurada'); }
    else if (r === 2) { sonido.clic(); ponerExpresion('pensando'); }
    else { sonido.acierto(); ponerExpresion('contenta'); }
    if (hechas % 10 === 0) decir(alAzar(T.repasoAnimo), 'contenta');
    pintar();
  }

  function deshacer() {
    const foto = historial.pop();
    if (!foto || !cuaderno.deshacerRespuesta(foto)) return;
    hechas = Math.max(0, hechas - 1);
    sonido.pagina();
    bocadillo('Vale, como si no hubiera pasado. Otra oportunidad.', 'guino');
    pintar(cuaderno.tarjeta(foto.id));
  }

  function textoProximo() {
    const futuras = cuaderno.lista().filter((t) => t.srs.estado !== 'nueva');
    const aprendiendo = futuras.filter((t) => enAprendizaje(t.srs));
    if (aprendiendo.length) {
      const min = Math.max(1, Math.ceil((Math.min(...aprendiendo.map((t) => t.srs.vence)) - Date.now()) / 60000));
      return `Te quedan palabras en aprendizaje: vuelve en ${min} min (esta pantalla se actualiza sola).`;
    }
    if (cuaderno.lista().some((t) => t.srs.estado === 'nueva')) {
      return 'Ya has visto las palabras nuevas de hoy (máximo 20 al día). Mañana más.';
    }
    if (!futuras.length) return '';
    const dias = Math.round((Math.min(...futuras.map((t) => t.srs.vence)) - inicioDia(Date.now())) / 86400000);
    return dias <= 1 ? 'El próximo repaso es mañana.' : `El próximo repaso es dentro de ${dias} días.`;
  }

  const alClic = (e) => {
    const accion = e.target.closest('[data-accion]')?.dataset.accion;
    if (accion === 'mostrar') mostrar();
    else if (accion === 'deshacer') deshacer();
    const r = e.target.closest('[data-r]');
    if (r) responder(Number(r.dataset.r));
  };
  const alTeclear = (e) => {
    const el = e.target instanceof Element ? e.target : document.body;
    if (el.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    const sobreOtroBoton = el.closest('button, a') && !el.closest('.tr-mostrar');
    if (!mostrada && (e.key === ' ' || e.key === 'Enter')) {
      if (sobreOtroBoton) return; // que el botón enfocado (p. ej. el altavoz) haga lo suyo
      e.preventDefault();
      mostrar();
    } else if (mostrada && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      responder(Number(e.key));
    } else if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      deshacer();
    }
  };

  raiz.addEventListener('click', alClic);
  document.addEventListener('keydown', alTeclear);
  pintar();
  if (actual) decir(T.repasoInicio);

  return () => {
    clearInterval(reloj);
    raiz.removeEventListener('click', alClic);
    document.removeEventListener('keydown', alTeclear);
    ponerExpresion('normal');
  };
}

/** Pone en negrita la palabra dentro de la frase de ejemplo. */
function resaltar(frase, palabra) {
  const i = frase.toLowerCase().indexOf(palabra.toLowerCase());
  if (i < 0) return esc(frase);
  return `${esc(frase.slice(0, i))}<strong>${esc(frase.slice(i, i + palabra.length))}</strong>${esc(frase.slice(i + palabra.length))}`;
}
