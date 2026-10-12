// A quién le debemos las voces y las demás piezas gratuitas de la app.
// Cuando se añada o cambie una voz (ver _audio/), hay que apuntarla aquí: varias licencias obligan a citar a sus autores.

/** Voces: una por línea. curso = id del curso (js/cursos.js). */
export const VOCES = [
  { curso: 'es', voz: 'sharvard', autor: 'Sharvard Corpus · V. Aubanel, M. L. García Lecumberri, M. Cooke', licencia: 'CC BY 3.0', url: 'https://datashare.ed.ac.uk/handle/10283/574' },
  { curso: 'en', voz: 'cori', autor: 'LibriVox · Cori Samuel', licencia: 'Public domain', url: 'https://librivox.org' },
  { curso: 'en', voz: 'vctk', autor: 'CSTR VCTK Corpus · University of Edinburgh', licencia: 'CC BY 4.0', url: 'https://datashare.ed.ac.uk/handle/10283/3443' },
  { curso: 'fr', voz: 'siwis', autor: 'SIWIS French Speech Synthesis Database · Idiap, University of Edinburgh', licencia: 'CC BY 4.0', url: 'https://datashare.ed.ac.uk/handle/10283/2353' },
  { curso: 'fr', voz: 'mls', autor: 'Multilingual LibriSpeech · Meta AI, LibriVox', licencia: 'CC BY 4.0', url: 'http://openslr.org/94/' },
  { curso: 'de', voz: 'thorsten', autor: 'Thorsten-Voice · Thorsten Müller', licencia: 'CC0', url: 'https://github.com/thorstenMueller/Thorsten-Voice' },
  { curso: 'de', voz: 'mls', autor: 'Multilingual LibriSpeech · Meta AI, LibriVox', licencia: 'CC BY 4.0', url: 'http://openslr.org/94/' },
  { curso: 'it', voz: 'serena', autor: 'serena-synthetic-it-27h · committa', licencia: 'CC BY 4.0', url: 'https://huggingface.co/datasets/committa/serena-synthetic-it-27h' },
  { curso: 'pt', voz: 'tugão', autor: 'Open Home Foundation voice datasets', licencia: 'CC0', url: 'https://github.com/OHF-Voice/voice-datasets' },
  { curso: 'nl', voz: 'mls', autor: 'Multilingual LibriSpeech · Meta AI, LibriVox', licencia: 'CC BY 4.0', url: 'http://openslr.org/94/' },
  { curso: 'da', voz: 'talesyntese', autor: 'Språkbanken · Nasjonalbiblioteket', licencia: 'CC0', url: 'https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-21/' },
  { curso: 'no', voz: 'talesyntese', autor: 'Språkbanken · Nasjonalbiblioteket', licencia: 'CC0', url: 'https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-15/' },
  { curso: 'no', voz: 'nvcc', autor: 'Språkbanken · Nasjonalbiblioteket', licencia: 'CC0', url: 'https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-75/' },
  { curso: 'sv', voz: 'nst', autor: 'Språkbanken · Nasjonalbiblioteket', licencia: 'CC0', url: 'https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-17/' },
  { curso: 'pl', voz: 'gosia', autor: 'Open Home Foundation voice datasets', licencia: 'CC0', url: 'https://github.com/OHF-Voice/voice-datasets' },
  { curso: 'pl', voz: 'darkman', autor: 'Open Home Foundation voice datasets', licencia: 'CC0', url: 'https://github.com/OHF-Voice/voice-datasets' },
  { curso: 'ro', voz: 'mihai', autor: 'Open Home Foundation voice datasets', licencia: 'CC0', url: 'https://github.com/OHF-Voice/voice-datasets' },
  { curso: 'el', voz: 'rapunzelina', autor: 'Greek Single Speaker Speech Dataset · Kyubyong Park, LibriVox', licencia: 'CC0', url: 'https://www.kaggle.com/datasets/bryanpark/greek-single-speaker-speech-dataset' },
  { curso: 'ru', voz: 'denis', autor: 'Open Home Foundation voice datasets', licencia: 'CC0', url: 'https://github.com/OHF-Voice/voice-datasets' },
  { curso: 'ru', voz: 'dmitri', autor: 'Open Home Foundation voice datasets', licencia: 'CC0', url: 'https://github.com/OHF-Voice/voice-datasets' },
  { curso: 'vi', voz: 'vais1000', autor: 'VAIS-1000 · Vietnam Artificial Intelligence System', licencia: 'CC BY 4.0', url: 'https://ieee-dataport.org/documents/vais-1000-vietnamese-speech-synthesis-corpus' },
];

/** Lo demás que hace posible la app. */
export const OTROS = [
  { nombre: 'Piper', que: { en: 'the program that turns text into these voices', es: 'el programa que convierte el texto en estas voces' }, autor: 'Michael Hansen · Rhasspy · Open Home Foundation', licencia: 'MIT', url: 'https://github.com/rhasspy/piper' },
  { nombre: 'Pixelify Sans', que: { en: 'pixel typeface', es: 'letra de píxeles' }, autor: 'Stefie Justprince', licencia: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Pixelify+Sans' },
  { nombre: 'Tiny5', que: { en: 'pixel typeface', es: 'letra de píxeles' }, autor: 'Stefan Schmidt', licencia: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Tiny5' },
  { nombre: 'Be Vietnam Pro', que: { en: 'text typeface', es: 'letra del texto' }, autor: 'Lâm Bảo, Tony Le, ViệtAnh Nguyễn', licencia: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Be+Vietnam+Pro' },
];
