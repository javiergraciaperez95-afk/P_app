// Pantalla «Perfil»: nombre, foto y progreso.

import { esc, htmlBarra } from './util.js';
import * as perfil from './perfil.js';
import * as progreso from './progreso.js';
import * as cuaderno from './cuaderno.js';
import { claveDia } from './srs.js';
import { decir, bocadillo } from './tutora.js';
import { sonido } from './sonido.js';
import { montarCuenta } from './vista-cuenta.js';

let limpiarCuenta = null;

export function vistaPerfil(raiz, lecciones) {
  if (limpiarCuenta) { limpiarCuenta(); limpiarCuenta = null; }
  const p = perfil.perfil();
  const s = estadisticas(lecciones);

  raiz.innerHTML = `
    <section class="perfil">
      <h1 class="portada-titulo">Mi perfil</h1>

      <div class="caja perfil-cabecera">
        <div class="perfil-foto">${htmlFoto(p, 'grande')}</div>
        <div class="perfil-datos">
          <label class="etiqueta" for="perfil-nombre">Tu nombre</label>
          <input id="perfil-nombre" class="campo" type="text" maxlength="30" autocomplete="nickname" value="${esc(p.nombre)}" placeholder="¿Cómo te llamas?">
          <div class="pie-botones">
            <input id="perfil-archivo" class="sr-only" type="file" accept="image/*">
            <label class="btn btn-peq" for="perfil-archivo">Cambiar foto</label>
            ${p.foto ? '<button type="button" class="btn btn-peq" data-accion="quitar-foto">Quitar foto</button>' : ''}
          </div>
          <p class="perfil-mensaje pista" role="status"></p>
        </div>
      </div>

      <div class="caja cuenta" id="cuenta"></div>

      <div class="caja">
        <h2>Lecciones</h2>
        <p>${s.leccionesHechas} de ${s.leccionesTotal} terminadas</p>
        ${htmlBarra(s.leccionesHechas, s.leccionesTotal, 'Lecciones terminadas')}
        <p>Ejercicios resueltos: ${s.ejResueltos} de ${s.ejTotal} · a la primera: ${s.ejPrimera} (${s.ejResueltos ? Math.round((s.ejPrimera / s.ejResueltos) * 100) : 0} %)</p>
        ${htmlBarra(s.ejResueltos, s.ejTotal, 'Ejercicios resueltos')}
      </div>

      <div class="caja">
        <h2>Cuaderno y repaso</h2>
        <ul class="perfil-cifras">
          <li><strong>${s.palabras}</strong><span>palabras guardadas</span></li>
          <li><strong>${s.nuevas}</strong><span>sin estudiar</span></li>
          <li><strong>${s.aprendiendo}</strong><span>aprendiendo</span></li>
          <li><strong>${s.jovenes}</strong><span>jóvenes</span></li>
          <li><strong>${s.maduras}</strong><span>maduras (+21 días)</span></li>
          <li><strong>${s.repasosHoy}</strong><span>repasos hoy</span></li>
          <li><strong>${s.repasosTotal}</strong><span>repasos en total</span></li>
          <li><strong>${s.acierto} %</strong><span>de aciertos al repasar</span></li>
          <li><strong>${s.racha}</strong><span>${s.racha === 1 ? 'día seguido' : 'días seguidos'} repasando</span></li>
        </ul>
      </div>

      <div class="caja">
        <h2>Copia de seguridad</h2>
        <p class="pista">Guarda en un archivo todo tu progreso, tu cuaderno y tu perfil. Al cargar una copia se une con lo que ya tienes: no se borra nada.</p>
        <div class="pie-botones">
          <button type="button" class="btn btn-peq" data-accion="descargar-copia">Descargar copia</button>
          <input id="perfil-copia" class="sr-only" type="file" accept=".json,application/json">
          <label class="btn btn-peq" for="perfil-copia">Cargar una copia</label>
        </div>
        <p class="copia-mensaje pista" role="status"></p>
      </div>
    </section>`;

  limpiarCuenta = montarCuenta(raiz.querySelector('#cuenta'));
  const mensaje = raiz.querySelector('.perfil-mensaje');
  const nombre = raiz.querySelector('#perfil-nombre');

  nombre.addEventListener('change', () => {
    perfil.guardarNombre(nombre.value);
    const n = perfil.perfil().nombre;
    mensaje.textContent = 'Nombre guardado.';
    if (n) bocadillo(`¡Encantada, ${n}! Qué nombre tan bonito. Casi tanto como el mío.`, 'guino');
  });

  raiz.querySelector('#perfil-archivo').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try {
      const foto = await perfil.prepararFoto(archivo);
      if (!perfil.guardarFoto(foto)) { mensaje.textContent = 'No se pudo guardar la foto (el navegador no tiene espacio).'; return; }
      sonido.acierto();
      bocadillo('¡Qué foto tan bonita! Aunque yo salgo mejor, claro.', 'contenta');
      vistaPerfil(raiz, lecciones);
    } catch (err) {
      mensaje.textContent = err.message === 'demasiado-grande'
        ? 'No he podido reducir esa foto lo suficiente. Prueba con otra.'
        : 'Ese archivo no es una imagen. Prueba con una foto JPG o PNG.';
    }
  });

  const mensajeCopia = raiz.querySelector('.copia-mensaje');
  raiz.querySelector('#perfil-copia').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    try {
      cargarCopia(JSON.parse(await archivo.text()));
      sonido.acierto();
      bocadillo('¡Copia cargada! Todo en su sitio, como debe ser.', 'contenta');
      vistaPerfil(raiz, lecciones);
    } catch (err) {
      sonido.fallo();
      mensajeCopia.textContent = err.message === 'no-es-copia'
        ? 'Ese archivo no es una copia de esta web.'
        : 'No se pudo leer el archivo. ¿Es una copia descargada desde aquí?';
    }
  });

  raiz.querySelector('.perfil').addEventListener('click', (e) => {
    const accion = e.target.closest('[data-accion]')?.dataset.accion;
    if (accion === 'quitar-foto') {
      perfil.guardarFoto('');
      sonido.clic();
      vistaPerfil(raiz, lecciones);
    } else if (accion === 'descargar-copia') {
      descargarCopia();
      sonido.clic();
      mensajeCopia.textContent = 'Copia descargada. Guárdala en un sitio seguro.';
    }
  });

  decir(p.nombre
    ? `Hola, ${p.nombre}. Aquí tienes tu progreso. Con una profesora como yo, normal que vaya tan bien.`
    : 'Este es tu perfil. Dime cómo te llamas y ponte una foto, que quiero saber a quién estoy enseñando.');

  return () => { if (limpiarCuenta) { limpiarCuenta(); limpiarCuenta = null; } };
}

// ---------- Copia de seguridad ----------

function descargarCopia() {
  const copia = {
    app: 'vietlibro',
    version: 1,
    fecha: new Date().toISOString(),
    progreso: progreso.exportar(),
    cuaderno: cuaderno.exportar(),
    perfil: perfil.perfil(),
  };
  const blob = new Blob([JSON.stringify(copia, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `copia-vietnamita-${copia.fecha.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Une la copia con lo que hay (mismas reglas que la nube): no se pierde nada. */
function cargarCopia(copia) {
  if (!copia || copia.app !== 'vietlibro' || !copia.progreso || !copia.cuaderno) throw new Error('no-es-copia');
  progreso.importar(progreso.unir(progreso.exportar(), copia.progreso));
  cuaderno.importar(cuaderno.unir(cuaderno.exportar(), copia.cuaderno));
  const actual = perfil.perfil();
  if (copia.perfil && (Number(copia.perfil.mod) || 0) > actual.mod) perfil.importar(copia.perfil);
}

/** Foto del perfil o, si no hay, la inicial del nombre. */
export function htmlFoto(p, tamano) {
  if (p.foto) return `<img class="avatar avatar-${tamano}" src="${esc(p.foto)}" alt="Foto de perfil">`;
  const inicial = (p.nombre.trim()[0] || '?').toUpperCase();
  return `<span class="avatar avatar-${tamano} avatar-vacio" aria-hidden="true">${esc(inicial)}</span>`;
}

function estadisticas(lecciones) {
  let ejTotal = 0, ejResueltos = 0, ejPrimera = 0;
  for (const lec of lecciones) {
    for (const b of lec.bloques || []) {
      if (!b.esEjercicio) continue;
      ejTotal++;
      const st = progreso.estadoEjercicio(lec.id, b.idEj);
      if (st?.resuelto) ejResueltos++;
      if (st?.primeraBien) ejPrimera++;
    }
  }

  const tarjetas = cuaderno.lista();
  const reg = cuaderno.registro();
  const dias = Object.values(reg);
  const repasosTotal = dias.reduce((n, d) => n + (d.total || 0), 0);
  const aciertos = dias.reduce((n, d) => n + (d.aciertos || 0), 0);

  // Racha: días seguidos con algún repaso, contando hacia atrás desde hoy (o ayer)
  let racha = 0;
  let ts = Date.now();
  if (!reg[claveDia(ts)]?.total) ts -= 86400000;
  while (reg[claveDia(ts)]?.total) { racha++; ts -= 86400000; }

  return {
    leccionesTotal: lecciones.length,
    leccionesHechas: lecciones.filter((l) => progreso.estaHecha(l.id)).length,
    ejTotal, ejResueltos, ejPrimera,
    palabras: tarjetas.length,
    nuevas: tarjetas.filter((t) => t.srs.estado === 'nueva').length,
    aprendiendo: tarjetas.filter((t) => t.srs.estado === 'aprendiendo' || t.srs.estado === 'reaprendiendo').length,
    jovenes: tarjetas.filter((t) => t.srs.estado === 'repaso' && t.srs.intervalo < 21).length,
    maduras: tarjetas.filter((t) => t.srs.estado === 'repaso' && t.srs.intervalo >= 21).length,
    repasosHoy: reg[claveDia(Date.now())]?.total || 0,
    repasosTotal,
    acierto: repasosTotal ? Math.round((aciertos / repasosTotal) * 100) : 0,
    racha,
  };
}
