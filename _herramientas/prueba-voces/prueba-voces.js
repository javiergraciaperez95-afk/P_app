// Herramienta de pruebas (botón 🔧 de la cabecera): comprueba, idioma por idioma, si este dispositivo
// o navegador puede leer en voz alta, y saca un informe de texto para copiarlo o guardarlo.
// Es para el desarrollo: se puede quitar borrando este archivo, el botón de index.html y su línea en app.js.
// Los textos van en español a propósito (no pasan por las traducciones).

import { el } from './dom.js';
import { CURSOS } from './cursos.js';

const voces = window.speechSynthesis;
const instalada = Boolean(window.Capacitor?.isNativePlatform?.());

const etiqueta = v => (v.lang ?? '').replace('_', '-').toLowerCase();
const bases = voz => { const b = voz.toLowerCase().split('-')[0]; return b === 'nb' || b === 'no' ? ['nb', 'no'] : [b]; };

/** Espera a que el navegador tenga cargada la lista de voces (algunos tardan). */
function listaDeVoces() {
  return new Promise(resolver => {
    if (!voces) { resolver([]); return; }
    if (voces.getVoices().length) { resolver(voces.getVoices()); return; }
    const acabar = () => resolver(voces.getVoices());
    voces.addEventListener('voiceschanged', acabar, { once: true });
    setTimeout(acabar, 2000);
  });
}

/** Lee un texto sin volumen y dice qué ha pasado: «suena», «no arranca» o el error. */
function probar(texto, voz) {
  return new Promise(resolver => {
    let empezo = false;
    let hecho = false;
    const acabar = resultado => { if (hecho) return; hecho = true; voces.cancel(); resolver(resultado); };
    const f = new SpeechSynthesisUtterance(texto);
    f.voice = voz; f.lang = voz.lang; f.volume = 0; f.rate = 1.4;
    f.onstart = () => { empezo = true; };
    f.onend = () => acabar('suena');
    f.onerror = e => acabar(`error: ${e?.error ?? 'desconocido'}`);
    voces.cancel();
    voces.speak(f);
    setTimeout(() => acabar(empezo ? 'suena (no avisó del final)' : 'no arranca'), 6000);
  });
}

async function informe(alAvanzar) {
  const todas = await listaDeVoces();
  const lineas = [
    'PRUEBA DE VOCES',
    `Fecha: ${new Date().toLocaleString('es-ES')}`,
    `Dónde: ${instalada ? 'app instalada (APK)' : 'navegador'}`,
    `Navegador: ${navigator.userAgent}`,
    `Conexión: ${navigator.onLine === false ? 'no' : 'sí'}`,
    `Función de voz: ${voces ? 'sí' : 'NO EXISTE'}`,
    `Voces en total: ${todas.length}`,
    '',
    'cód | idioma | resultado | voces | detalle',
  ];
  let bien = 0;
  for (const [i, c] of CURSOS.entries()) {
    alAvanzar(`Probando ${c.nombre.es} (${i + 1} de ${CURSOS.length})…`);
    const suyas = todas.filter(v => bases(c.voz).includes(etiqueta(v).split('-')[0]));
    let telefono = '';
    let resultado = 'SIN VOZ';
    if (voces?.idiomaDisponible) {
      const ok = await voces.idiomaDisponible(c.voz).catch(() => null);
      telefono = `el teléfono dice: ${ok === null ? 'error al preguntar' : ok ? 'disponible' : 'no disponible'}`;
      if (ok) resultado = await probar(c.hola || c.nativo, suyas[0] ?? { name: 'Android', lang: c.voz });
    } else if (suyas.length) {
      const utiles = suyas.filter(v => v.localService !== false || navigator.onLine !== false);
      resultado = utiles.length ? await probar(c.hola || c.nativo, utiles[0]) : 'SIN VOZ (solo en línea y no hay conexión)';
    }
    if (resultado.startsWith('suena')) bien += 1;
    const nombres = suyas.slice(0, 4).map(v => `${v.name}${v.localService === false ? ' [en línea]' : ''} (${v.lang})`).join('; ');
    lineas.push(`${c.id} | ${c.nombre.es} | ${resultado.toUpperCase()} | ${suyas.length} | ${[telefono, nombres].filter(Boolean).join(' · ')}`);
  }
  lineas.push('', `Resumen: ${bien} de ${CURSOS.length} idiomas con voz que funciona.`);
  return lineas.join('\n');
}

export async function probarVoces() {
  if (document.querySelector('.prueba-voces')) return;
  const estado = el('p', {}, 'Preparando…');
  const texto = el('textarea', { readonly: true, rows: '12', style: 'width:100%;font:12px monospace;white-space:pre;', hidden: true });
  const aviso = el('p', { class: 'aprox' }, 'Tarda cerca de un minuto. No debería oírse nada; si en algún aparato se oye un saludo, es normal.');
  const cerrar = el('button', { type: 'button', class: 'boton', onclick: () => { voces?.cancel(); capa.remove(); } }, 'Cerrar');
  const copiar = el('button', { type: 'button', class: 'boton boton-principal', hidden: true }, 'Copiar');
  const guardar = el('button', { type: 'button', class: 'boton', hidden: true }, 'Guardar .txt');
  const capa = el('div', { class: 'pregunta-capa prueba-voces', role: 'dialog', 'aria-modal': 'true' },
    el('div', { class: 'pregunta caja', style: 'max-width:640px;width:100%;text-align:left;' },
      el('h2', {}, 'Prueba de voces'), estado, aviso, texto,
      el('div', { class: 'pregunta-botones' }, copiar, guardar, cerrar)));
  document.body.append(capa);

  const resultado = await informe(paso => { estado.textContent = paso; }).catch(e => `La prueba ha fallado: ${e?.message ?? e}`);
  if (!capa.isConnected) return;
  estado.textContent = resultado.split('\n').at(-1);
  aviso.textContent = 'Pulsa «Copiar» y pega el texto en el chat, o guarda el archivo.';
  texto.value = resultado;
  texto.hidden = false; copiar.hidden = false; guardar.hidden = instalada; // dentro de la APK no hay descargas

  copiar.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(resultado); }
    catch { texto.select(); document.execCommand('copy'); }
    copiar.textContent = 'Copiado';
  });
  guardar.addEventListener('click', () => {
    const donde = instalada ? 'apk' : (/Edg\//.test(navigator.userAgent) ? 'edge' : /Firefox\//.test(navigator.userAgent) ? 'firefox' : /Chrome\//.test(navigator.userAgent) ? 'chrome' : 'navegador');
    const enlace = el('a', { href: URL.createObjectURL(new Blob([resultado], { type: 'text/plain' })), download: `prueba-voces-${donde}.txt` });
    document.body.append(enlace); enlace.click(); enlace.remove();
  });
}
