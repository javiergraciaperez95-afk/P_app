// Vista de una lección: los bloques uno detrás de otro, como páginas de un libro.

import { esc, formatear, barajar, alAzar, htmlBarra } from './util.js';
import { htmlFrase, htmlAnalisis, htmlPronunciacion, paginasFrase, paginasPalabra } from './frases.js';
import { htmlAltavoz, hablar } from './voz.js';
import { explicarPalabra } from './pronunciacion.js';
import * as progreso from './progreso.js';
import { htmlErrores, htmlBloqueError, htmlAvisos } from './vista-errores.js';
import { decir, bocadillo, abrirTutora } from './tutora.js';
import { T } from './textos.js';
import { sonido } from './sonido.js';
import { htmlEstrella } from './marcar.js';

const NOMBRE_EJERCICIO = { test: 'Test', traducir: 'Traduce', hueco: 'Completa el hueco', escucha: 'Escucha' };

export function vistaLeccion(raiz, lec, siguiente, { saludar = true } = {}) {
  const migas = '<p class="migas"><a href="#/" class="btn btn-peq">← Lecciones</a></p>';

  if (lec.roto) {
    raiz.innerHTML = `<article class="leccion">${migas}${htmlErrores(lec)}</article>`;
    decir(T.roto, 'apurada');
    return;
  }

  raiz.innerHTML = `
    <article class="leccion" data-leccion="${esc(lec.id)}">
      ${migas}
      <header class="caja leccion-cabecera">
        <p class="leccion-num">Lección ${esc(lec.id)}</p>
        <h1 lang="vi">${esc(lec.titulo)}</h1>
        <p class="leccion-es">${esc(lec.tituloEs)}</p>
      </header>
      ${htmlErrores(lec, lec.errores.filter((e) => !e.bloque))}
      ${htmlIndice(lec.bloques)}
      ${lec.bloques.map((b, i) => {
        // Cada tanda de ejercicios va en una rejilla (dos columnas en pantallas anchas)
        const empieza = b.esEjercicio && !lec.bloques[i - 1]?.esEjercicio;
        const acaba = b.esEjercicio && !lec.bloques[i + 1]?.esEjercicio;
        return (empieza ? `${htmlSeparadorEjercicios(lec.bloques, i)}<div class="ejercicios-rejilla">` : '')
          + htmlBloque(b, lec.id)
          + (acaba ? '</div>' : '');
      }).join('')}
      <footer class="caja leccion-pie bloque" id="pie"></footer>
      ${htmlAvisos(lec)}
    </article>`;

  const articulo = raiz.querySelector('.leccion');
  const pie = raiz.querySelector('#pie');
  const ejercicios = lec.bloques.filter((b) => b.esEjercicio);
  const bloque = (n) => lec.bloques.find((b) => b.n === Number(n));

  for (const b of ejercicios) {
    if (progreso.estadoEjercicio(lec.id, b.idEj)?.resuelto) {
      pintarResuelto(articulo.querySelector(`.ejercicio[data-b="${b.n}"]`), b);
    }
  }
  pintarPie();
  if (saludar) decir(T.leccion(lec));

  articulo.addEventListener('click', (e) => {
    const ir = e.target.closest('[data-ir]');
    if (ir) {
      sonido.clic();
      articulo.querySelector(`#${ir.dataset.ir}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const sello = e.target.closest('.sello');
    if (sello) {
      sonido.clic();
      abrirTutora();
      decir(paginasFrase(bloque(sello.dataset.b).frases[sello.dataset.f]));
      return;
    }
    const silaba = e.target.closest('.silaba');
    if (silaba) {
      const s = silaba.dataset;
      hablar(s.silaba);
      const tonos = explicarPalabra(s.silaba).tonos.map((t) => `${t.flecha} ${t.nombre}`).join(' · ');
      bocadillo(`«${s.silaba}»${s.es ? ` = ${s.es}` : ''}${tonos ? `\nTono: ${tonos}` : ''}`, 'normal');
      return;
    }
    const vocab = e.target.closest('.vocab-item');
    if (vocab) {
      sonido.clic();
      abrirTutora();
      decir(paginasPalabra(bloque(vocab.dataset.b).entradas[vocab.dataset.i]));
      return;
    }
    const trad = e.target.closest('.ver-trad');
    if (trad) {
      sonido.clic();
      const caja = trad.closest('.dialogo');
      const ver = caja.classList.toggle('con-trad');
      trad.setAttribute('aria-pressed', String(ver));
      trad.textContent = ver ? 'Ocultar análisis' : 'Ver análisis';
      return;
    }
    const opcion = e.target.closest('.opcion');
    if (opcion) {
      const sec = opcion.closest('.ejercicio');
      responder(sec, bloque(sec.dataset.b), opcion);
      return;
    }
    const accion = e.target.closest('[data-accion]')?.dataset.accion;
    if (accion === 'hecha') {
      const ahora = !progreso.estaHecha(lec.id);
      progreso.marcarHecha(lec.id, ahora);
      pintarPie();
      if (ahora) { sonido.fanfarria(); decir(T.terminada, 'contenta'); } else sonido.clic();
    } else if (accion === 'reiniciar') {
      if (confirm('¿Borrar las respuestas de los ejercicios de esta lección?')) {
        progreso.reiniciarEjercicios(lec.id);
        vistaLeccion(raiz, lec, siguiente, { saludar: false });
        decir('Hecho. Ejercicios como nuevos. A ver si esta vez me sorprendes.', 'normal');
      }
    }
  });

  function responder(sec, b, boton) {
    if (boton.getAttribute('aria-disabled') === 'true') return;
    if (progreso.estadoEjercicio(lec.id, b.idEj)?.resuelto) return;
    const op = b.opciones[Number(boton.dataset.i)];
    progreso.registrarRespuesta(lec.id, b.idEj, op.ok);

    if (!op.ok) {
      boton.classList.add('mal');
      boton.setAttribute('aria-disabled', 'true');
      sonido.fallo();
      decir(`${alAzar(T.fallo)}\n${op.por || 'Esa no es la buena.'}`, 'apurada');
      return;
    }

    pintarResuelto(sec, b);
    sonido.acierto();
    const paginas = [{ texto: `${alAzar(T.acierto)}\n${op.por}`.trim(), expresion: 'contenta' }];
    const todos = ejercicios.every((x) => progreso.estadoEjercicio(lec.id, x.idEj)?.resuelto);
    if (todos && !progreso.estaHecha(lec.id)) {
      progreso.marcarHecha(lec.id, true);
      sonido.fanfarria();
      paginas.push({ texto: T.terminada, expresion: 'contenta' });
    }
    decir(paginas);
    pintarPie();
  }

  function pintarPie() {
    const estados = ejercicios.map((b) => progreso.estadoEjercicio(lec.id, b.idEj));
    const resueltos = estados.filter((s) => s?.resuelto).length;
    const primera = estados.filter((s) => s?.primeraBien).length;
    const hecha = progreso.estaHecha(lec.id);
    pie.innerHTML = `
      <p><strong>Ejercicios:</strong> ${resueltos} de ${ejercicios.length} resueltos · ${primera} a la primera</p>
      ${htmlBarra(resueltos, ejercicios.length, 'Ejercicios resueltos')}
      <div class="pie-botones">
        <button type="button" class="btn ${hecha ? '' : 'btn-acento'}" data-accion="hecha">${hecha ? '✓ Terminada (desmarcar)' : 'Marcar como terminada'}</button>
        <button type="button" class="btn" data-accion="reiniciar">Reiniciar ejercicios</button>
        ${siguiente ? `<a class="btn" href="#/leccion/${esc(siguiente.id)}">Siguiente lección →</a>` : ''}
      </div>`;
  }
}

function pintarResuelto(sec, b) {
  if (!sec) return;
  sec.classList.add('resuelto');
  const buena = b.opciones.findIndex((o) => o.ok);
  for (const btn of sec.querySelectorAll('.opcion')) {
    btn.setAttribute('aria-disabled', 'true');
    if (Number(btn.dataset.i) === buena) btn.classList.add('ok');
  }
  const hueco = sec.querySelector('.hueco');
  if (hueco) {
    hueco.textContent = b.opciones[buena].texto;
    hueco.classList.add('lleno');
    hueco.removeAttribute('aria-label');
    // Con la palabra ya puesta, la frase completa se puede escuchar
    const frase = sec.querySelector('.frase-ejercicio');
    if (frase && !frase.querySelector('.altavoz')) {
      const completa = b.frase.vi.replace(/_{2,}/, b.opciones[buena].texto);
      frase.insertAdjacentHTML('afterbegin', htmlAltavoz(completa, completa));
    }
  }
}

// ---------- HTML de cada tipo de bloque ----------

function htmlBloque(b, idLeccion) {
  switch (b.tipo) {
    case 'error': return htmlBloqueError(b);
    case 'explicacion': return htmlExplicacion(b);
    case 'dialogo': return htmlDialogo(b);
    case 'vocabulario': return htmlVocabulario(b, idLeccion);
    case 'practica': return htmlPractica(b);
    default: return htmlEjercicio(b);
  }
}

const TIPO_BLOQUE = { explicacion: 'Explicación', dialogo: 'Frases', vocabulario: 'Vocabulario', practica: 'Pronunciación' };

/** Índice de la lección: un botón por apartado (los ejercicios van juntos al final de cada tanda). */
function htmlIndice(bloques) {
  const entradas = [];
  bloques.forEach((b, i) => {
    if (b.esEjercicio) {
      if (!bloques[i - 1]?.esEjercicio) entradas.push({ ir: `ej-${b.n}`, tipo: 'ejercicios', texto: `Ejercicios (${contarTanda(bloques, i)})` });
    } else if (TIPO_BLOQUE[b.tipo]) {
      entradas.push({ ir: `b-${b.n}`, tipo: b.tipo, texto: b.titulo || TIPO_BLOQUE[b.tipo] });
    }
  });
  if (entradas.length < 4) return '';
  return `
    <nav class="caja indice" aria-label="Índice de la lección">
      <h2>En esta lección</h2>
      <ol>${entradas.map((e) => `
        <li><button type="button" class="indice-enlace indice-${e.tipo}" data-ir="${e.ir}">${esc(e.texto)}</button></li>`).join('')}
      </ol>
    </nav>`;
}

function contarTanda(bloques, i) {
  let n = 0;
  while (bloques[i + n]?.esEjercicio) n++;
  return n;
}

function htmlSeparadorEjercicios(bloques, i) {
  const n = contarTanda(bloques, i);
  return `<h2 class="separador" id="ej-${bloques[i].n}">✎ Ejercicios <small>${n} ${n === 1 ? 'pregunta' : 'preguntas'}</small></h2>`;
}

/**
 * Explicación maquetada:
 *  - «**término**: texto» seguidos → fichas en rejilla (término destacado + explicación)
 *  - «• texto» seguidos → lista
 *  - el resto → párrafos normales
 */
function htmlExplicacion(b) {
  const trozos = [];
  for (const p of b.parrafos) {
    // «**x**: …», «**x** = …» o «**x** texto» con un término corto (no «**x** y **z** …»)
    const def = /^\*\*([^*]{1,40})\*\*\s*(?:[:=—–→]\s*)(.+)$/s.exec(p)
      || /^\*\*([^*]{1,14})\*\*\s+(?![yoe]\s|[,.])(.+)$/s.exec(p);
    const vineta = /^•\s*(.+)$/s.exec(p);
    const tipo = def ? 'def' : vineta ? 'vineta' : 'p';
    const ultimo = trozos[trozos.length - 1];
    if (tipo !== 'p' && ultimo?.tipo === tipo) ultimo.items.push(def || vineta);
    else trozos.push({ tipo, items: [def || vineta || p] });
  }
  const html = trozos.map((t) => {
    // Una sola ficha suelta queda mejor como párrafo normal
    if (t.tipo === 'def' && t.items.length < 2) return `<p>${formatear(t.items[0][0])}</p>`;
    if (t.tipo === 'def') {
      return `<dl class="fichas">${t.items.map((m) => `
        <div class="ficha"><dt>${formatear(`**${m[1]}**`)}</dt><dd>${formatear(m[2])}</dd></div>`).join('')}</dl>`;
    }
    if (t.tipo === 'vineta') return `<ul class="vinetas">${t.items.map((m) => `<li>${formatear(m[1])}</li>`).join('')}</ul>`;
    return `<p>${formatear(t.items[0])}</p>`;
  }).join('');
  return `
    <section class="caja bloque explicacion" id="b-${b.n}">
      ${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}
      ${html}
    </section>`;
}

function htmlDialogo(b) {
  return `
    <section class="caja bloque dialogo" id="b-${b.n}">
      <div class="bloque-cabecera">
        <h2>${esc(b.titulo || 'Diálogo')}</h2>
        <button type="button" class="btn btn-peq ver-trad" aria-pressed="false">Ver análisis</button>
      </div>
      <ol class="frases">${b.frases.map((f, i) => `
        <li class="frase" data-ejemplo-vi="${esc(f.vi)}" data-ejemplo-es="${esc(f.es)}">
          <div class="frase-botones">
            <button type="button" class="sello" data-b="${b.n}" data-f="${i}" aria-label="Que la tutora explique: ${esc(f.vi)}">?</button>
            ${htmlAltavoz(f.vi, f.vi)}
          </div>
          <div class="frase-vi">
            ${f.quien ? `<span class="quien">${esc(f.quien)}</span>` : ''}
            <p class="vi" lang="vi">${htmlFrase(f.segmentos)}</p>
          </div>
          <p class="es">${esc(f.es)}</p>
          ${f.analisis?.length ? `<div class="frase-analisis">${htmlAnalisis(f.analisis)}</div>` : ''}
        </li>`).join('')}
      </ol>
    </section>`;
}

function htmlVocabulario(b, idLeccion) {
  return `
    <section class="caja bloque vocabulario" id="b-${b.n}">
      <div class="bloque-cabecera">
        <h2>${esc(b.titulo || 'Vocabulario')}</h2>
        <span class="pista">altavoz = escuchar · ☆ = guardar en tu cuaderno</span>
      </div>
      <ul class="vocab-lista">${b.entradas.map((e, i) => `
        <li class="vocab-celda">
          <span class="vocab-acciones">${htmlAltavoz(e.vi, e.vi)}${htmlEstrella(e, idLeccion)}</span>
          <button type="button" class="btn vocab-item" data-b="${b.n}" data-i="${i}">
            <span class="vocab-vi" lang="vi">${esc(e.vi)}</span>
            ${e.pron ? `<span class="vocab-pron">[${esc(e.pron)}]</span>` : ''}
            <span class="vocab-es">${esc(e.es)}</span>
          </button>
          ${htmlPronunciacion(e)}
        </li>`).join('')}
      </ul>
    </section>`;
}

function htmlPractica(b) {
  return `
    <section class="caja bloque practica" id="b-${b.n}">
      <div class="bloque-cabecera">
        <h2>${esc(b.titulo || 'Practica la pronunciación')}</h2>
        <span class="pista">Pulsa cada sílaba para oírla</span>
      </div>
      ${b.texto ? `<p>${formatear(b.texto)}</p>` : ''}
      <ol class="practica-lineas">${b.lineas.map((l) => `
        <li${l.length > 5 || l.some((x) => x.es || x.vi.includes(' ')) ? ' class="ancha"' : ''}>
          ${htmlAltavoz(l.map((x) => x.vi).join(', '), 'toda la fila')}
          ${l.map((x) => `<button type="button" class="silaba" lang="vi" data-silaba="${esc(x.vi)}" data-es="${esc(x.es)}">${esc(x.vi)}${x.es ? `<small>${esc(x.es)}</small>` : ''}</button>`).join('')}
        </li>`).join('')}
      </ol>
    </section>`;
}

function htmlEjercicio(b) {
  const orden = barajar(b.opciones.map((_, i) => i));
  const lang = b.tipo === 'hueco' || b.tipo === 'escucha' ? ' lang="vi"' : '';
  let frase = '';
  if (b.tipo === 'escucha') {
    frase = `<p class="escucha-audio">${htmlAltavoz(b.audio, 'el audio del ejercicio')}<span class="pista">Pulsa para escuchar · otra vez = más despacio</span></p>`;
  }
  if (b.frase) {
    // En «completar el hueco» no hay altavoz: leería la frase sin la palabra que falta
    const altavoz = b.tipo === 'traducir' ? htmlAltavoz(b.frase.vi, b.frase.vi) : '';
    frase = `<p class="vi frase-ejercicio" lang="vi">${altavoz}${htmlFrase(b.frase.segmentos)}</p>`;
    if (b.frase.es) frase += `<p class="es">(${esc(b.frase.es)})</p>`;
  }
  return `
    <section class="caja bloque ejercicio" data-b="${b.n}">
      <p class="etiqueta">✎ Ejercicio · ${NOMBRE_EJERCICIO[b.tipo]}</p>
      <p class="pregunta">${esc(b.pregunta)}</p>
      ${frase}
      <div class="opciones" role="group" aria-label="Opciones">
        ${orden.map((i) => `<button type="button" class="btn opcion" data-i="${i}"${lang}>${esc(b.opciones[i].texto)}</button>`).join('')}
      </div>
    </section>`;
}
