// Estadísticas del perfil (de pago: Plus o Max). Todo sale de lo guardado en el dispositivo; nada se envía.
//   · los últimos 30 días: ejercicios y repasos de cada día (una barra por día);
//   · la memoria del cuaderno: cuántas tarjetas están nuevas, aprendiéndose, en repaso o dominadas;
//   · los repasos que tocan los próximos 7 días;
//   · el ritmo: días activos del mes, media por día activo y el día de la semana que más estudias;
//   · lo que más cuesta: las tarjetas que más se han olvidado.
// En el plan gratis se ve el título, lo que trae y el enlace a los planes (sin datos dibujados detrás).
import { el } from '../dom.js';
import { t, locale } from '../i18n.js';
import { LANG } from '../curso.js';
import { actividad, tarjetas } from '../progress.js';
import { etapa, esNueva } from '../srs.js';
import { tienePlan } from '../planes.js';

const DIA = 24 * 60 * 60 * 1000;
const claveDeDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const masDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Una gráfica de barras de una sola serie: cada barra con su texto al pasar (title) y para los lectores (aria-label). */
function barras(puntos, { etiqueta, clase = '' }) {
  const maximo = Math.max(1, ...puntos.map(p => p.valor));
  return el('div', { class: `es-barras ${clase}`, role: 'img', 'aria-label': etiqueta },
    puntos.map(p => el('span', { class: 'es-barra', title: `${p.texto}: ${p.valor}`, style: `--alto:${(p.valor / maximo).toFixed(3)}` },
      el('i', {}), p.marca ? el('small', {}, p.marca) : null)));
}

export function seccionEstadisticas() {
  const caja = el('section', { class: 'caja estadisticas' }, el('h2', {}, t('est.titulo'), ' ', el('span', { class: 'est-sello' }, 'PLUS')));
  if (!tienePlan('plus')) {
    caja.append(
      el('p', {}, t('est.bloqueado')),
      el('ul', { class: 'est-lista-bloqueo' }, ['est.b1', 'est.b2', 'est.b3', 'est.b4'].map(k => el('li', {}, t(k)))),
      el('a', { class: 'boton boton-principal', href: '#/precios' }, t('est.verPlanes')));
    caja.classList.add('bloqueada');
    return caja;
  }

  const dias = actividad() ?? {};
  const hoy = new Date();
  const fmtCorto = d => d.toLocaleDateString(locale(), { day: 'numeric', month: 'short' });

  // 1. los últimos 30 días
  const ultimos = Array.from({ length: 30 }, (_, i) => {
    const d = masDias(hoy, i - 29);
    const a = dias[claveDeDia(d)] ?? {};
    return { valor: (a.ejercicios ?? 0) + (a.repasos ?? 0), texto: fmtCorto(d), marca: i % 7 === 2 ? String(d.getDate()) : '' };
  });
  const activos30 = ultimos.filter(p => p.valor > 0).length;
  const total30 = ultimos.reduce((s, p) => s + p.valor, 0);

  // 2. la memoria del cuaderno, de nueva a dominada (un solo tono, de claro a oscuro)
  const cartas = tarjetas().filter(c => c.es);
  const ORDEN = ['nueva', 'aprendiendo', 'repaso', 'dominada'];
  const porEtapa = Object.fromEntries(ORDEN.map(k => [k, 0]));
  for (const c of cartas) porEtapa[etapa(c.srs).clave] += 1;
  const memoria = el('div', { class: 'est-memoria', role: 'img', 'aria-label': ORDEN.map(k => `${t(`srs.etapa.${k}`)}: ${porEtapa[k]}`).join(', ') },
    ORDEN.filter(k => porEtapa[k]).map(k => el('span', { class: `est-tramo est-${k}`, style: `flex-grow:${porEtapa[k]}`, title: `${t(`srs.etapa.${k}`)}: ${porEtapa[k]}` })));
  const leyenda = el('ul', { class: 'est-leyenda' }, ORDEN.map(k => el('li', {}, el('i', { class: `est-${k}` }), `${t(`srs.etapa.${k}`)} `, el('b', {}, String(porEtapa[k])))));

  // 3. los repasos de los próximos 7 días (lo que vence ese día; hoy también lo atrasado)
  const manana = new Date(hoy); manana.setHours(0, 0, 0, 0);
  const prevision = Array.from({ length: 7 }, (_, i) => {
    const desde = manana.getTime() + i * DIA;
    const hasta = desde + DIA;
    const valor = cartas.filter(c => !esNueva(c.srs) && (i === 0 ? c.srs.vence < hasta : c.srs.vence >= desde && c.srs.vence < hasta)).length;
    const d = new Date(desde);
    return { valor, texto: i === 0 ? t('est.hoy') : d.toLocaleDateString(locale(), { weekday: 'long' }), marca: i === 0 ? t('est.hoy') : d.toLocaleDateString(locale(), { weekday: 'narrow' }) };
  });

  // 4. el ritmo
  const fechas = Object.entries(dias).filter(([, a]) => (a.ejercicios ?? 0) + (a.repasos ?? 0) > 0);
  const media = fechas.length ? Math.round(fechas.reduce((s, [, a]) => s + (a.ejercicios ?? 0) + (a.repasos ?? 0), 0) / fechas.length) : 0;
  const porSemana = [0, 0, 0, 0, 0, 0, 0];
  for (const [f, a] of fechas) porSemana[new Date(`${f}T12:00:00`).getDay()] += (a.ejercicios ?? 0) + (a.repasos ?? 0);
  const mejorDia = fechas.length ? porSemana.indexOf(Math.max(...porSemana)) : -1;
  const nombreDia = n => new Date(2026, 0, 4 + n).toLocaleDateString(locale(), { weekday: 'long' }); // 4-1-2026 fue domingo
  const delMes = fechas.filter(([f]) => f.startsWith(claveDeDia(hoy).slice(0, 7))).length;

  // 5. lo que más cuesta
  const cuestan = cartas.filter(c => (c.srs.lapsos ?? 0) > 0).sort((a, b) => b.srs.lapsos - a.srs.lapsos).slice(0, 6);

  const dato = (valor, texto) => el('div', { class: 'est-dato' }, el('strong', {}, String(valor)), el('span', {}, texto));
  caja.append(
    el('div', { class: 'est-datos' },
      dato(activos30, t('est.diasActivos30')),
      dato(delMes, t('est.diasMes')),
      dato(media, t('est.mediaDia')),
      dato(mejorDia >= 0 ? nombreDia(mejorDia) : '—', t('est.mejorDia'))),
    el('h3', {}, t('est.ultimos30'), ' ', el('small', { class: 'aprox' }, t('est.total', { n: total30 }))),
    barras(ultimos, { etiqueta: t('est.ultimos30Aria', { n: total30, dias: activos30 }) }),
    el('h3', {}, t('est.memoria'), ' ', el('small', { class: 'aprox' }, t('est.tarjetas', { n: cartas.length }))),
    ...(cartas.length ? [memoria, leyenda] : [el('p', { class: 'aprox' }, t('est.sinTarjetas'))]),
    el('h3', {}, t('est.prevision')),
    barras(prevision, { etiqueta: prevision.map(p => `${p.texto}: ${p.valor}`).join(', '), clase: 'est-prevision' }),
    el('h3', {}, t('est.cuestan')),
    cuestan.length
      ? el('ol', { class: 'est-cuestan' }, cuestan.map(c => el('li', {}, el('span', { lang: LANG }, c.es), el('small', { class: 'aprox' }, t('est.olvidada', { n: c.srs.lapsos })))))
      : el('p', { class: 'aprox' }, t('est.nadaCuesta')),
    el('p', { class: 'aprox est-nota' }, t('est.nota')));
  return caja;
}
