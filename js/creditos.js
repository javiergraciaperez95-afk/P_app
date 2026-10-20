// A quién le debemos las piezas gratuitas de la app.
// La app no lleva audios grabados: lee con la voz del dispositivo, así que no hay voces que agradecer.
// Si algún día se graban audios con una voz, se apunta aquí: varias licencias obligan a citar a sus autores.

/** Voces grabadas: una por línea, { curso, voz, autor, licencia, url }. curso = id del curso (js/cursos.js). */
export const VOCES = [];

/** Lo demás que hace posible la app: letras, la app de Android, los servicios y las herramientas con las que se
 *  prepararon las lecciones (las licencias CC BY y CC BY-SA obligan a citarlas). Revisado el 20-10-2026. */
const LETRA_PIXEL = { en: 'pixel typeface', es: 'letra de píxeles', vi: 'phông chữ pixel' };
export const OTROS = [
  { nombre: 'Pixelify Sans', que: LETRA_PIXEL, autor: 'Stefie Justprince', licencia: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Pixelify+Sans' },
  { nombre: 'Tiny5', que: LETRA_PIXEL, autor: 'Stefan Schmidt', licencia: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Tiny5' },
  { nombre: 'Be Vietnam Pro', que: { en: 'text typeface', es: 'letra del texto', vi: 'phông chữ văn bản' }, autor: 'Lâm Bảo, Tony Le, ViệtAnh Nguyễn', licencia: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Be+Vietnam+Pro' },
  { nombre: 'Capacitor', que: { en: 'the Android app', es: 'la app de Android', vi: 'ứng dụng Android' }, autor: 'Ionic', licencia: 'MIT', url: 'https://capacitorjs.com' },
  { nombre: 'Capacitor Text-to-Speech', que: { en: 'the phone voice in the app', es: 'la voz del teléfono en la app', vi: 'giọng đọc của điện thoại trong ứng dụng' }, autor: 'Capacitor Community', licencia: 'MIT', url: 'https://github.com/capacitor-community/text-to-speech' },
  { nombre: 'Supabase', que: { en: 'cloud copy and email codes', es: 'copia en la nube y códigos por correo', vi: 'bản sao đám mây và mã qua email' }, autor: 'Supabase Inc.', licencia: 'Apache 2.0', url: 'https://supabase.com' },
  { nombre: 'Cloudflare Turnstile', que: { en: 'anti-bot check', es: 'comprobación anti-robots', vi: 'kiểm tra chống robot' }, autor: 'Cloudflare Inc.', licencia: 'Cloudflare ToS', url: 'https://www.cloudflare.com/products/turnstile/' },
  { nombre: 'Argos Translate', que: { en: 'first drafts of translations, reviewed afterwards', es: 'primeros borradores de traducciones, revisados después', vi: 'bản dịch nháp đầu tiên, được rà soát sau' }, autor: 'Argos Open Technologies', licencia: 'MIT', url: 'https://github.com/argosopentech/argos-translate' },
  { nombre: 'OPUS-MT', que: { en: 'translation models', es: 'modelos de traducción', vi: 'mô hình dịch' }, autor: 'Helsinki-NLP (Universidad de Helsinki)', licencia: 'CC BY 4.0', url: 'https://github.com/Helsinki-NLP/Opus-MT' },
  { nombre: 'spaCy', que: { en: 'sentence analysis for lessons', es: 'análisis de frases para las lecciones', vi: 'phân tích câu cho bài học' }, autor: 'Explosion AI', licencia: 'MIT', url: 'https://spacy.io' },
  { nombre: 'Wiktionary', que: { en: 'word data (meanings, gender, plurals)', es: 'datos de palabras (significados, género, plurales)', vi: 'dữ liệu từ (nghĩa, giống, số nhiều)' }, autor: 'Wiktionary contributors', licencia: 'CC BY-SA 4.0', url: 'https://www.wiktionary.org' },
];
