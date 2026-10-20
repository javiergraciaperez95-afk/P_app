// La Hucha (#/hucha): quien no puede pagar ve anuncios cuando quiere (nunca en medio de una lección) y cada anuncio
// echa unos céntimos; con lo ahorrado se compra un mes de Plus o de Max. El saldo lo lleva el servidor: cada
// recompensa la confirma la red de anuncios directamente al servidor (api/?r=hucha/recompensa, firmada), así que
// la app no puede inventarse monedas. Mientras no haya red de anuncios conectada, el botón de ver uno dice «Muy pronto».
import { el, poner } from '../dom.js';
import { t, locale } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { haySesion, huchaEstado, huchaGastar, textoDeError } from '../servidor.js';
import { zonaDeSuPais } from '../region.js';
import { conCartel } from './carteles.js';

const euros = c => (c / 100).toLocaleString(locale(), { style: 'currency', currency: 'EUR' });

export async function pintarHucha(app) {
  const cabeza = conCartel(el('section', { class: 'intro-vista' }, el('h1', {}, t('pr.hucha.titulo')), el('p', {}, t('pr.hucha.texto'))), 'repaso');
  if (!haySesion()) {
    poner(app, cabeza, el('section', { class: 'caja hucha' },
      el('p', {}, t('hucha.conCuenta')),
      el('a', { class: 'boton boton-principal', href: '#/entrar/crear', onclick: () => { try { sessionStorage.setItem('paglot-tras-entrar', '#/hucha'); } catch { /* sin almacenamiento */ } } }, t('cuenta3.crear'))));
    return;
  }
  poner(app, cabeza, el('p', { class: 'cargando' }, t('html.cargando')));
  const zona = zonaDeSuPais();
  let e;
  try { e = await huchaEstado(zona); } catch (error) { poner(app, cabeza, el('p', { class: 'caja' }, textoDeError(error))); return; }
  const meta = e.precios?.['plus-mes'] ?? 0;
  const avance = meta ? Math.min(1, e.saldo / meta) : 0;
  const mensaje = el('p', { class: 'hucha-mensaje', role: 'status' });

  // ver un anuncio: en la app de Android lo pondrá la red de anuncios (window.PaglotAnuncio); en la web, aún no
  const puedeAnuncio = typeof window.PaglotAnuncio === 'function' && !e.local && e.anunciosHoy < e.anunciosMax;
  const anuncio = el('button', { type: 'button', class: 'boton boton-principal', disabled: !puedeAnuncio }, puedeAnuncio ? t('hucha.verAnuncio') : t('precios.pronto'));
  anuncio.addEventListener('click', async () => {
    anuncio.disabled = true;
    try { await window.PaglotAnuncio(); sonar('moneda'); mensaje.textContent = t('hucha.gracias'); setTimeout(() => pintarHucha(app), 2500); }
    catch { mensaje.textContent = t('hucha.sinAnuncio'); anuncio.disabled = false; }
  });

  const gastar = producto => {
    const precio = e.precios?.[producto] ?? Infinity;
    const b = el('button', { type: 'button', class: 'boton', disabled: e.saldo < precio }, t(`hucha.gastar.${producto}`, { precio: euros(precio === Infinity ? 0 : precio) }));
    b.addEventListener('click', async () => {
      b.disabled = true;
      try { await huchaGastar(producto, zona); sonar('fanfarria'); mensaje.textContent = t('hucha.comprado'); setTimeout(() => pintarHucha(app), 2000); }
      catch (error) { sonar('mal'); mensaje.textContent = textoDeError(error); b.disabled = false; }
    });
    return b;
  };

  poner(app, cabeza,
    el('section', { class: 'caja hucha' },
      el('p', { class: 'hucha-saldo' }, el('span', {}, t('hucha.ahorrado')), el('strong', {}, euros(e.saldo))),
      el('div', { class: 'hucha-barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(avance * 100)), 'aria-label': t('hucha.hastaPlus') },
        el('i', { style: `--avance:${avance}` })),
      el('p', { class: 'aprox' }, t('hucha.hastaPlusTexto', { falta: euros(Math.max(0, meta - e.saldo)) })),
      el('div', { class: 'botonera' }, anuncio),
      el('p', { class: 'aprox' }, e.local ? t('hucha.soloHosting') : t('hucha.hoy', { n: e.anunciosHoy, max: e.anunciosMax })),
      el('h2', {}, t('hucha.gastarTitulo')),
      el('div', { class: 'botonera' }, gastar('plus-mes'), gastar('max-mes')),
      mensaje,
      el('p', { class: 'aprox' }, t('pr.hucha.regla'))));
}
