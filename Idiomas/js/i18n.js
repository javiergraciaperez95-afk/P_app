// Idioma de la interfaz. El contenido de las lecciones conserva su propio idioma.
// - t('clave', { n: 3 }): textos de la aplicación (están en i18n/<idioma>.js).
// - tr(valor): textos del contenido de las lecciones. Pueden ser un texto
//   (igual en los dos idiomas) o un grupo { "en": "…", "vi": "…" }.

import { ajuste, cambiarAjuste, idiomaDispositivo } from './ajustes.js';
import en from './i18n/en.js';
import vi from './i18n/vi.js';
import zh from './i18n/zh.js';
import es from './i18n/es.js';
import pt from './i18n/pt.js';
import fr from './i18n/fr.js';
import ja from './i18n/ja.js';
import it from './i18n/it.js';
import ko from './i18n/ko.js';
import de from './i18n/de.js';
import ru from './i18n/ru.js';
import id from './i18n/id.js';
import { TEXTOS_SITIO, COPIAS_SITIO } from './i18n/sitio.js';
import { curso, nombreDelCurso, nombreTutora, saludo } from './curso.js';

export const IDIOMAS = [
  { clave: 'en', nombre: 'English', corto: 'EN', locale: 'en-GB' },
  { clave: 'vi', nombre: 'Tiếng Việt', corto: 'VI', locale: 'vi-VN' },
  { clave: 'zh', nombre: '中文', corto: '中', locale: 'zh-CN' },
  { clave: 'es', nombre: 'Español', corto: 'ES', locale: 'es-ES' },
  { clave: 'pt', nombre: 'Português', corto: 'PT', locale: 'pt-BR' },
  { clave: 'fr', nombre: 'Français', corto: 'FR', locale: 'fr-FR' },
  { clave: 'ja', nombre: '日本語', corto: 'JA', locale: 'ja-JP' },
  { clave: 'it', nombre: 'Italiano', corto: 'IT', locale: 'it-IT' },
  { clave: 'ko', nombre: '한국어', corto: 'KO', locale: 'ko-KR' },
  { clave: 'ru', nombre: 'Русский', corto: 'RU', locale: 'ru-RU' },
  { clave: 'de', nombre: 'Deutsch', corto: 'DE', locale: 'de-DE' },
  { clave: 'id', nombre: 'Bahasa Indonesia', corto: 'ID', locale: 'id-ID' },
];

const BASE_TEXTOS = { en, vi, zh, es, pt, fr, ja, it, ko, de, ru, id };
const TEXTOS = Object.fromEntries(Object.entries(BASE_TEXTOS).map(([clave, textos]) => [
  clave, { ...textos, ...(TEXTOS_SITIO[clave] ?? {}) },
]));

export function idioma() {
  const i = ajuste('idioma');
  return TEXTOS[i] ? i : idiomaDispositivo();
}

/** Para fechas y horas: 'en-GB' o 'vi-VN'. */
export function locale() {
  return IDIOMAS.find(i => i.clave === idioma()).locale;
}

function textoEn(i, clave, vars) {
  // Un texto puede tener una versión solo para un curso: «clave@es» gana a «clave» en el curso de español
  // (bromas con palabras en español, ejemplos…).
  const delCursoActual = `${clave}@${curso.id}`;
  const propio = TEXTOS[i][delCursoActual] ?? TEXTOS[i][clave];
  const v = propio ?? TEXTOS.en[delCursoActual] ?? TEXTOS.en[clave];
  if (v === undefined) {
    console.warn(`Falta el texto «${clave}»`);
    return clave;
  }
  // {L} es el nombre del idioma que se estudia, dicho en el idioma de la interfaz.
  // (Si el texto sale en inglés porque falta su traducción, el nombre del idioma también va en inglés.)
  const todas = { L: nombreDelCurso(propio === undefined ? 'en' : i), ...vars };
  if (typeof v === 'function') return delCurso(v(todas));
  const poner = texto => delCurso(texto.replace(/\{(\w+)\}/g, (_, k) => (todas[k] ?? `{${k}}`)));
  return Array.isArray(v) ? v.map(x => (typeof x === 'string' ? poner(x) : x)) : poner(v);
}

/** Los textos se escribieron para el curso de español y saludan con «¡Hola!»; cada curso saluda en su idioma. */
function delCurso(texto) {
  if (typeof texto !== 'string' || curso.campo === 'es' || !saludo) return texto;
  return texto.replace(/¡Hola(, hola)?/g, saludo);
}

/** Texto de la interfaz en el idioma actual. Si es una lista (frases al azar), devuelve la lista. */
export function t(clave, vars = {}) {
  if (clave === 'tutora.nombrePropio') return nombreTutora ?? textoEn(idioma(), 'tutora.nombre', vars);
  return textoEn(idioma(), clave, vars);
}

/** Copia localizada para páginas públicas; se mantiene el par es/en como fuente. */
export function copiarUI(es, en) {
  const i = idioma();
  const dinamico = traducirCopiaDinamica(i, en);
  if (dinamico !== undefined) return dinamico;
  return i === 'es' ? es : i === 'en' ? en : COPIAS_SITIO[en]?.[i] ?? en;
}

function traducirCopiaDinamica(i, texto) {
  if (i === 'es' || i === 'en') return undefined;
  let m = texto.match(/^(\d+) (idea|ideas)$/);
  if (m) {
    const n = Number(m[1]);
    const palabras = {
      fr: n === 1 ? 'idée' : 'idées', de: n === 1 ? 'Idee' : 'Ideen', it: n === 1 ? 'idea' : 'idee', pt: n === 1 ? 'ideia' : 'ideias',
      ja: '件のアイデア', ko: '개 아이디어', ru: n === 1 ? 'идея' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'идеи' : 'идей',
      id: 'ide', vi: 'ý tưởng', zh: '个想法',
    };
    return `${n}${i === 'ja' ? palabras[i] : ` ${palabras[i] ?? m[2]}`}`;
  }
  m = texto.match(/^Quick check: what is (\d+) \+ (\d+)\?$/);
  if (m) {
    const frases = {
      fr: `Petit calcul : combien font ${m[1]} + ${m[2]} ?`, de: `Kurze Rechenfrage: Wie viel ist ${m[1]} + ${m[2]}?`, it: `Calcolo veloce: quanto fa ${m[1]} + ${m[2]}?`,
      pt: `Conta rápida: quanto é ${m[1]} + ${m[2]}?`, ja: `かんたんな確認：${m[1]} + ${m[2]} はいくつ？`, ko: `간단한 확인: ${m[1]} + ${m[2]}은 얼마인가요?`,
      ru: `Быстрая проверка: сколько будет ${m[1]} + ${m[2]}?`, id: `Cek cepat: berapa ${m[1]} + ${m[2]}?`, vi: `Kiểm tra nhanh: ${m[1]} + ${m[2]} bằng bao nhiêu?`, zh: `快速验证：${m[1]} + ${m[2]} 等于多少？`,
    };
    return frases[i];
  }
  m = texto.match(/^My bag: (\d+) items$/);
  if (m) {
    const n = m[1];
    const frases = { fr: `Mon panier : ${n} article${n === '1' ? '' : 's'}`, de: `Mein Warenkorb: ${n} Artikel`, it: `Il mio carrello: ${n} articoli`, pt: `O meu cesto: ${n} artigos`, ja: `カート：${n}点`, ko: `장바구니: ${n}개`, ru: `Корзина: ${n} шт.`, id: `Keranjang saya: ${n} barang`, vi: `Giỏ hàng: ${n} món`, zh: `我的购物袋：${n} 件` };
    return frases[i];
  }
  m = texto.match(/^Quantity of (.+)$/);
  if (m) {
    const frases = { fr: `Quantité de ${m[1]}`, de: `Menge: ${m[1]}`, it: `Quantità di ${m[1]}`, pt: `Quantidade de ${m[1]}`, ja: `${m[1]}の数量`, ko: `${m[1]} 수량`, ru: `Количество: ${m[1]}`, id: `Jumlah ${m[1]}`, vi: `Số lượng ${m[1]}`, zh: `${m[1]}数量` };
    return frases[i];
  }
  m = texto.match(/^Remove (.+)$/);
  if (m) {
    const frases = { fr: `Retirer ${m[1]}`, de: `${m[1]} entfernen`, it: `Rimuovi ${m[1]}`, pt: `Remover ${m[1]}`, ja: `${m[1]}を削除`, ko: `${m[1]} 삭제`, ru: `Убрать: ${m[1]}`, id: `Hapus ${m[1]}`, vi: `Xóa ${m[1]}`, zh: `移除${m[1]}` };
    return frases[i];
  }
  m = texto.match(/^(View|Choose) (.+)$/);
  if (m) {
    const verb = m[1] === 'View' ? { fr: 'Voir', de: 'Ansehen', it: 'Vedi', pt: 'Ver', ja: '表示', ko: '보기', ru: 'Посмотреть', id: 'Lihat', vi: 'Xem', zh: '查看' } : { fr: 'Choisir', de: 'Auswählen', it: 'Scegli', pt: 'Escolher', ja: '選択', ko: '선택', ru: 'Выбрать', id: 'Pilih', vi: 'Chọn', zh: '选择' };
    return `${verb[i]} ${m[2]}`;
  }
  m = texto.match(/^(.+) book$/);
  if (m) {
    const suffix = { fr: `Livre ${m[1]}`, de: `${m[1]}-Buch`, it: `Libro di ${m[1]}`, pt: `Livro de ${m[1]}`, ja: `${m[1]}の本`, ko: `${m[1]} 책`, ru: `Книга по языку: ${m[1]}`, id: `Buku ${m[1]}`, vi: `Sách ${m[1]}`, zh: `${m[1]}语书籍` };
    return suffix[i];
  }
  m = texto.match(/^(\d+) little discoveries$/);
  if (m) {
    const n = m[1];
    const frases = { fr: `${n} petites découvertes`, de: `${n} kleine Fundstücke`, it: `${n} piccole scoperte`, pt: `${n} pequenas descobertas`, ja: `${n}件のおすすめ`, ko: `${n}개의 작은 발견`, ru: `${n} находок`, id: `${n} temuan kecil`, vi: `${n} món đồ thú vị`, zh: `${n} 件精选` };
    return frases[i];
  }
  m = texto.match(/^Open (.+) \(placeholder link, new tab\)$/);
  if (m) {
    const frases = { fr: `Ouvrir ${m[1]} (lien de démonstration, nouvel onglet)`, de: `${m[1]} öffnen (Demolink, neuer Tab)`, it: `Apri ${m[1]} (link demo, nuova scheda)`, pt: `Abrir ${m[1]} (ligação de demonstração, novo separador)`, ja: `${m[1]}を開く（デモリンク、新しいタブ）`, ko: `${m[1]} 열기(데모 링크, 새 탭)`, ru: `Открыть ${m[1]} (демоссылка, новая вкладка)`, id: `Buka ${m[1]} (tautan demo, tab baru)`, vi: `Mở ${m[1]} (liên kết minh họa, tab mới)`, zh: `打开${m[1]}（演示链接，新标签页）` };
    return frases[i];
  }
  m = texto.match(/^(Remove vote for|Vote for): (.*)\. (\d+) votes$/);
  if (m) {
    const n = m[3];
    const vote = m[1] === 'Vote for';
    const frases = {
      fr: `${vote ? 'Voter pour' : 'Retirer le vote pour'} : ${m[2]}. ${n} vote${n === '1' ? '' : 's'}`,
      de: `${vote ? 'Abstimmen für' : 'Stimme zurückziehen für'}: ${m[2]}. ${n} Stimmen`,
      it: `${vote ? 'Vota per' : 'Ritira il voto per'}: ${m[2]}. ${n} voti`,
      pt: `${vote ? 'Votar em' : 'Retirar voto em'}: ${m[2]}. ${n} votos`,
      ja: `${m[2]}に${vote ? '投票' : '投票を取り消す'}。${n}票`, ko: `${m[2]} ${vote ? '투표하기' : '투표 취소'}. ${n}표`,
      ru: `${vote ? 'Голосовать за' : 'Отозвать голос за'}: ${m[2]}. ${n} голосов`,
      id: `${vote ? 'Pilih' : 'Batalkan suara untuk'}: ${m[2]}. ${n} suara`,
      vi: `${vote ? 'Bình chọn cho' : 'Rút bình chọn cho'}: ${m[2]}. ${n} lượt`, zh: `${vote ? '为' : '取消对'}${m[2]}${vote ? '投票' : '的投票'}。${n} 票`,
    };
    return frases[i];
  }
  return undefined;
}

/** El mismo texto en todos los idiomas: { en, vi }. Para guardar datos que se leerán más tarde (p. ej. el origen de una tarjeta). */
export function tTodos(clave, vars = {}) {
  return Object.fromEntries(IDIOMAS.map(({ clave: i }) => [i, textoEn(i, clave, vars)]));
}

/** Resuelve un texto del contenido: un texto normal o { en, vi }. */
export function tr(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor !== 'object' || Array.isArray(valor)) return valor;
  // Si la interfaz y el curso usan el mismo código, ese campo es el texto estudiado,
  // no su traducción. La traducción disponible por defecto está en «en».
  const i = idioma() === curso.campo ? 'en' : idioma();
  return valor[i] ?? valor.en ?? valor.es ?? Object.values(valor).find(v => v !== null && v !== undefined) ?? '';
}

/** Pone en el HTML fijo (index.html) los textos marcados con data-t, data-t-aria y data-t-title. */
export function aplicarIdioma() {
  document.documentElement.lang = idioma();
  for (const nodo of document.querySelectorAll('[data-t]')) nodo.textContent = t(nodo.dataset.t);
  for (const nodo of document.querySelectorAll('[data-t-aria]')) nodo.setAttribute('aria-label', t(nodo.dataset.tAria));
  for (const nodo of document.querySelectorAll('[data-t-title]')) nodo.title = t(nodo.dataset.tTitle);
}

export function cambiarIdioma(clave) {
  if (clave !== 'auto' && !TEXTOS[clave]) return;
  if (ajuste('idioma') === clave) return;
  cambiarAjuste('idioma', clave);
  aplicarIdioma();
  window.dispatchEvent(new Event('idioma-cambiado'));
}

window.addEventListener('languagechange', () => {
  if (ajuste('idioma') !== 'auto') return;
  aplicarIdioma();
  window.dispatchEvent(new Event('idioma-cambiado'));
});
