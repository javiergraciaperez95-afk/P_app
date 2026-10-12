// Los cursos de la app: uno por idioma. Se genera con _herramientas/montar_cursos.py (los datos están allí).
// campo: clave bajo la que va el texto del idioma en sus archivos · voz: idioma de la voz · prefijo: con qué nombre
// guarda su progreso en el dispositivo · tabla: su tabla en Supabase · letras: teclas de ayuda al escribir.

export const CURSOS = [
  {
    "id": "en",
    "carpeta": "cursos/en",
    "campo": "en",
    "lang": "en",
    "voz": "en-GB",
    "prefijo": "ingles",
    "tabla": "ingles_progreso",
    "nativo": "English",
    "nombre": {
      "en": "English",
      "es": "inglés",
      "vi": "tiếng Anh",
      "zh": "英语"
    },
    "hola": "Hello!",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 60 30\" aria-hidden=\"true\"><clipPath id=\"uk-campo\"><path d=\"M0 0h60v30H0z\"/></clipPath><clipPath id=\"uk-diag\"><path d=\"M30 15h30v15zv15H0zH0V0h30z\"/></clipPath><g clip-path=\"url(#uk-campo)\"><path d=\"M0 0v30h60V0z\" fill=\"#012169\"/><path d=\"m0 0 60 30m0-30L0 30\" stroke=\"#fff\" stroke-width=\"6\"/><path d=\"m0 0 60 30m0-30L0 30\" stroke=\"#C8102E\" stroke-width=\"4\" clip-path=\"url(#uk-diag)\"/><path d=\"M30 0v30M0 15h60\" stroke=\"#fff\" stroke-width=\"10\"/><path d=\"M30 0v30M0 15h60\" stroke=\"#C8102E\" stroke-width=\"6\"/></g></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "es",
    "carpeta": "cursos/es",
    "campo": "es",
    "lang": "es",
    "voz": "es-ES",
    "prefijo": "espanol",
    "tabla": "espanol_progreso",
    "nativo": "Español",
    "nombre": {
      "en": "Spanish",
      "es": "español",
      "vi": "tiếng Tây Ban Nha",
      "zh": "西班牙语"
    },
    "hola": "¡Hola!",
    "letras": [
      "á",
      "é",
      "í",
      "ó",
      "ú",
      "ü",
      "ñ",
      "¿",
      "¡"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 30 20\" aria-hidden=\"true\"><rect width=\"30\" height=\"20\" fill=\"#c60b1e\"/><rect y=\"5\" width=\"30\" height=\"10\" fill=\"#ffc400\"/></svg>",
    "sprite": "propio",
    "lecciones": 293,
    "audio": true
  },
  {
    "id": "fr",
    "carpeta": "cursos/fr",
    "campo": "fr",
    "lang": "fr",
    "voz": "fr-FR",
    "prefijo": "francais",
    "tabla": "francais_progreso",
    "nativo": "Français",
    "nombre": {
      "en": "French",
      "es": "francés",
      "vi": "tiếng Pháp",
      "zh": "法语"
    },
    "hola": "Bonjour !",
    "letras": [
      "é",
      "è",
      "ê",
      "ë",
      "à",
      "â",
      "ç",
      "ù",
      "û",
      "î",
      "ï",
      "ô",
      "œ"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 30 20\" aria-hidden=\"true\"><rect width=\"10\" height=\"20\" fill=\"#0055A4\"/><rect x=\"10\" width=\"10\" height=\"20\" fill=\"#fff\"/><rect x=\"20\" width=\"10\" height=\"20\" fill=\"#EF4135\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "de",
    "carpeta": "cursos/de",
    "campo": "de",
    "lang": "de",
    "voz": "de-DE",
    "prefijo": "aleman",
    "tabla": "aleman_progreso",
    "nativo": "Deutsch",
    "nombre": {
      "en": "German",
      "es": "alemán",
      "vi": "tiếng Đức",
      "zh": "德语"
    },
    "hola": "Hallo!",
    "letras": [
      "ä",
      "ö",
      "ü",
      "ß"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 5 3\" aria-hidden=\"true\"><rect width=\"5\" height=\"1\" fill=\"#000\"/><rect y=\"1\" width=\"5\" height=\"1\" fill=\"#DD0000\"/><rect y=\"2\" width=\"5\" height=\"1\" fill=\"#FFCE00\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "ja",
    "carpeta": "cursos/ja",
    "campo": "ja",
    "lang": "ja",
    "voz": "ja-JP",
    "prefijo": "japones",
    "tabla": "japones_progreso",
    "nativo": "日本語",
    "nombre": {
      "en": "Japanese",
      "es": "japonés",
      "vi": "tiếng Nhật",
      "zh": "日语"
    },
    "hola": "こんにちは！",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 900 600\" aria-hidden=\"true\"><rect width=\"900\" height=\"600\" fill=\"#2b1d1a\"/><rect x=\"16\" y=\"16\" width=\"868\" height=\"568\" fill=\"#fff\"/><circle cx=\"450\" cy=\"300\" r=\"180\" fill=\"#BC002D\"/></svg>",
    "lecciones": 3,
    "audio": false
  },
  {
    "id": "it",
    "carpeta": "cursos/it",
    "campo": "it",
    "lang": "it",
    "voz": "it-IT",
    "prefijo": "italiano",
    "tabla": "italiano_progreso",
    "nativo": "Italiano",
    "nombre": {
      "en": "Italian",
      "es": "italiano",
      "vi": "tiếng Ý",
      "zh": "意大利语"
    },
    "hola": "Ciao!",
    "letras": [
      "à",
      "è",
      "é",
      "ì",
      "ò",
      "ù"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 30 20\" aria-hidden=\"true\"><rect width=\"10\" height=\"20\" fill=\"#009246\"/><rect x=\"10\" width=\"10\" height=\"20\" fill=\"#fff\"/><rect x=\"20\" width=\"10\" height=\"20\" fill=\"#CE2B37\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "ko",
    "carpeta": "cursos/ko",
    "campo": "ko",
    "lang": "ko",
    "voz": "ko-KR",
    "prefijo": "coreano",
    "tabla": "coreano_progreso",
    "nativo": "한국어",
    "nombre": {
      "en": "Korean",
      "es": "coreano",
      "vi": "tiếng Hàn",
      "zh": "韩语"
    },
    "hola": "안녕하세요!",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 900 600\" aria-hidden=\"true\"><rect width=\"900\" height=\"600\" fill=\"#2b1d1a\"/><rect x=\"12\" y=\"12\" width=\"876\" height=\"576\" fill=\"#fff\"/><g transform=\"translate(450 300)\"><path fill=\"#CD2E3A\" d=\"M0-150a150 150 0 0 1 0 300 75 75 0 0 1 0-150 75 75 0 0 0 0-150\"/><path fill=\"#0047A0\" d=\"M0 150a150 150 0 0 1 0-300 75 75 0 0 1 0 150 75 75 0 0 0 0 150\"/></g><g fill=\"#14111c\"><g transform=\"translate(200 140) rotate(-32)\"><rect x=\"-62\" y=\"-24\" width=\"124\" height=\"14\"/><rect x=\"-62\" y=\"-5\" width=\"124\" height=\"14\"/><rect x=\"-62\" y=\"14\" width=\"124\" height=\"14\"/></g><g transform=\"translate(700 140) rotate(32)\"><rect x=\"-62\" y=\"-24\" width=\"50\" height=\"14\"/><rect x=\"12\" y=\"-24\" width=\"50\" height=\"14\"/><rect x=\"-62\" y=\"-5\" width=\"124\" height=\"14\"/><rect x=\"-62\" y=\"14\" width=\"50\" height=\"14\"/><rect x=\"12\" y=\"14\" width=\"50\" height=\"14\"/></g><g transform=\"translate(200 460) rotate(32)\"><rect x=\"-62\" y=\"-24\" width=\"124\" height=\"14\"/><rect x=\"-62\" y=\"-5\" width=\"50\" height=\"14\"/><rect x=\"12\" y=\"-5\" width=\"50\" height=\"14\"/><rect x=\"-62\" y=\"14\" width=\"124\" height=\"14\"/></g><g transform=\"translate(700 460) rotate(-32)\"><rect x=\"-62\" y=\"-24\" width=\"50\" height=\"14\"/><rect x=\"12\" y=\"-24\" width=\"50\" height=\"14\"/><rect x=\"-62\" y=\"-5\" width=\"50\" height=\"14\"/><rect x=\"12\" y=\"-5\" width=\"50\" height=\"14\"/><rect x=\"-62\" y=\"14\" width=\"50\" height=\"14\"/><rect x=\"12\" y=\"14\" width=\"50\" height=\"14\"/></g></g></svg>",
    "lecciones": 3,
    "audio": false
  },
  {
    "id": "zh",
    "carpeta": "cursos/zh",
    "campo": "zh",
    "lang": "zh",
    "voz": "zh-CN",
    "prefijo": "chino",
    "tabla": "chino_progreso",
    "nativo": "中文",
    "nombre": {
      "en": "Chinese",
      "es": "chino",
      "vi": "tiếng Trung",
      "zh": "中文"
    },
    "hola": "你好！",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 30 20\" aria-hidden=\"true\" shape-rendering=\"crispEdges\"><rect width=\"30\" height=\"20\" fill=\"#de2910\"/><g fill=\"#ffde00\"><path d=\"M5 2h1v2h2v1h-1v1h1v1h-2v-1h-1v1h-2v-1h1v-1h-1v-1h2z\"/><rect x=\"10\" y=\"1\" width=\"1\" height=\"1\"/><rect x=\"9\" y=\"2\" width=\"3\" height=\"1\"/><rect x=\"12\" y=\"3\" width=\"1\" height=\"1\"/><rect x=\"11\" y=\"4\" width=\"3\" height=\"1\"/><rect x=\"12\" y=\"6\" width=\"1\" height=\"1\"/><rect x=\"11\" y=\"7\" width=\"3\" height=\"1\"/><rect x=\"10\" y=\"9\" width=\"1\" height=\"1\"/><rect x=\"9\" y=\"10\" width=\"3\" height=\"1\"/></g></svg>",
    "sprite": "propio",
    "proximamente": true,
    "lecciones": 0,
    "audio": false
  },
  {
    "id": "pt",
    "carpeta": "cursos/pt",
    "campo": "pt",
    "lang": "pt",
    "voz": "pt-PT",
    "prefijo": "portugues",
    "tabla": "portugues_progreso",
    "nativo": "Português",
    "nombre": {
      "en": "Portuguese",
      "es": "portugués",
      "vi": "tiếng Bồ Đào Nha",
      "zh": "葡萄牙语"
    },
    "hola": "Olá!",
    "letras": [
      "á",
      "à",
      "â",
      "ã",
      "é",
      "ê",
      "í",
      "ó",
      "ô",
      "õ",
      "ú",
      "ç"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 30 20\" aria-hidden=\"true\"><rect width=\"12\" height=\"20\" fill=\"#046a38\"/><rect x=\"12\" width=\"18\" height=\"20\" fill=\"#da291c\"/><circle cx=\"12\" cy=\"10\" r=\"4.2\" fill=\"#ffe900\"/><circle cx=\"12\" cy=\"10\" r=\"2.6\" fill=\"none\" stroke=\"#046a38\" stroke-width=\"0.8\"/></svg>",
    "lecciones": 6,
    "audio": true
  },
  {
    "id": "ru",
    "carpeta": "cursos/ru",
    "campo": "ru",
    "lang": "ru",
    "voz": "ru-RU",
    "prefijo": "ruso",
    "tabla": "ruso_progreso",
    "nativo": "Русский",
    "nombre": {
      "en": "Russian",
      "es": "ruso",
      "vi": "tiếng Nga",
      "zh": "俄语"
    },
    "hola": "Привет!",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 900 600\" aria-hidden=\"true\"><rect width=\"900\" height=\"200\" fill=\"#fff\"/><rect y=\"200\" width=\"900\" height=\"200\" fill=\"#0039A6\"/><rect y=\"400\" width=\"900\" height=\"200\" fill=\"#D52B1E\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "tr",
    "carpeta": "cursos/tr",
    "campo": "tr",
    "lang": "tr",
    "voz": "tr-TR",
    "prefijo": "turco",
    "tabla": "turco_progreso",
    "nativo": "Türkçe",
    "nombre": {
      "en": "Turkish",
      "es": "turco",
      "vi": "tiếng Thổ Nhĩ Kỳ",
      "zh": "土耳其语"
    },
    "hola": "Merhaba!",
    "letras": [
      "ç",
      "ğ",
      "ı",
      "İ",
      "ö",
      "ş",
      "ü"
    ],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 1200 800\" aria-hidden=\"true\"><rect width=\"1200\" height=\"800\" fill=\"#E30A17\"/><circle cx=\"425\" cy=\"400\" r=\"200\" fill=\"#fff\"/><circle cx=\"475\" cy=\"400\" r=\"160\" fill=\"#E30A17\"/><path fill=\"#fff\" d=\"m583.334 400 180.901 58.779-118.804-153.885v190.212l118.804-153.885z\"/></svg>",
    "lecciones": 3,
    "audio": false
  },
  {
    "id": "nl",
    "carpeta": "cursos/nl",
    "campo": "nl",
    "lang": "nl",
    "voz": "nl-NL",
    "prefijo": "holandes",
    "tabla": "holandes_progreso",
    "nativo": "Nederlands",
    "nombre": {
      "en": "Dutch",
      "es": "neerlandés",
      "vi": "tiếng Hà Lan",
      "zh": "荷兰语"
    },
    "hola": "Hallo!",
    "letras": [
      "é",
      "ë",
      "ï",
      "ó"
    ],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 900 600\" aria-hidden=\"true\"><rect width=\"900\" height=\"200\" fill=\"#AE1C28\"/><rect y=\"200\" width=\"900\" height=\"200\" fill=\"#fff\"/><rect y=\"400\" width=\"900\" height=\"200\" fill=\"#21468B\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "sv",
    "carpeta": "cursos/sv",
    "campo": "sv",
    "lang": "sv",
    "voz": "sv-SE",
    "prefijo": "sueco",
    "tabla": "sueco_progreso",
    "nativo": "Svenska",
    "nombre": {
      "en": "Swedish",
      "es": "sueco",
      "vi": "tiếng Thụy Điển",
      "zh": "瑞典语"
    },
    "hola": "Hej!",
    "letras": [
      "å",
      "ä",
      "ö"
    ],
    "bandera": "<svg class=\"bandera\" width=\"16\" height=\"10\" viewBox=\"0 0 16 10\" aria-hidden=\"true\"><rect width=\"16\" height=\"10\" fill=\"#006AA7\"/><rect x=\"5\" width=\"2\" height=\"10\" fill=\"#FECC00\"/><rect y=\"4\" width=\"16\" height=\"2\" fill=\"#FECC00\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "el",
    "carpeta": "cursos/el",
    "campo": "el",
    "lang": "el",
    "voz": "el-GR",
    "prefijo": "griego",
    "tabla": "griego_progreso",
    "nativo": "Ελληνικά",
    "nombre": {
      "en": "Greek",
      "es": "griego",
      "vi": "tiếng Hy Lạp",
      "zh": "希腊语"
    },
    "hola": "Γεια!",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"27\" height=\"18\" viewBox=\"0 0 27 18\" aria-hidden=\"true\"><rect width=\"27\" height=\"18\" fill=\"#0D5EAF\"/><rect y=\"2\" width=\"27\" height=\"2\" fill=\"#fff\"/><rect y=\"6\" width=\"27\" height=\"2\" fill=\"#fff\"/><rect y=\"10\" width=\"27\" height=\"2\" fill=\"#fff\"/><rect y=\"14\" width=\"27\" height=\"2\" fill=\"#fff\"/><rect width=\"10\" height=\"10\" fill=\"#0D5EAF\"/><rect x=\"4\" width=\"2\" height=\"10\" fill=\"#fff\"/><rect y=\"4\" width=\"10\" height=\"2\" fill=\"#fff\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "pl",
    "carpeta": "cursos/pl",
    "campo": "pl",
    "lang": "pl",
    "voz": "pl-PL",
    "prefijo": "polaco",
    "tabla": "polaco_progreso",
    "nativo": "Polski",
    "nombre": {
      "en": "Polish",
      "es": "polaco",
      "vi": "tiếng Ba Lan",
      "zh": "波兰语"
    },
    "hola": "Cześć!",
    "letras": [
      "ą",
      "ć",
      "ę",
      "ł",
      "ń",
      "ó",
      "ś",
      "ź",
      "ż"
    ],
    "bandera": "<svg class=\"bandera\" width=\"16\" height=\"10\" viewBox=\"0 0 8 5\" aria-hidden=\"true\"><rect width=\"8\" height=\"5\" fill=\"#14111c\"/><rect x=\"0.15\" y=\"0.15\" width=\"7.7\" height=\"2.35\" fill=\"#fff\"/><rect x=\"0.15\" y=\"2.5\" width=\"7.7\" height=\"2.35\" fill=\"#DC143C\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "no",
    "carpeta": "cursos/no",
    "campo": "no",
    "lang": "nb",
    "voz": "nb-NO",
    "prefijo": "noruego",
    "tabla": "noruego_progreso",
    "nativo": "Norsk",
    "nombre": {
      "en": "Norwegian",
      "es": "noruego",
      "vi": "tiếng Na Uy",
      "zh": "挪威语"
    },
    "hola": "Hei!",
    "letras": [
      "æ",
      "ø",
      "å"
    ],
    "bandera": "<svg class=\"bandera\" width=\"22\" height=\"16\" viewBox=\"0 0 22 16\" aria-hidden=\"true\"><rect width=\"22\" height=\"16\" fill=\"#BA0C2F\"/><rect x=\"6\" width=\"4\" height=\"16\" fill=\"#fff\"/><rect y=\"6\" width=\"22\" height=\"4\" fill=\"#fff\"/><rect x=\"7\" width=\"2\" height=\"16\" fill=\"#00205B\"/><rect y=\"7\" width=\"22\" height=\"2\" fill=\"#00205B\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "vi",
    "carpeta": "cursos/vi",
    "campo": "vi",
    "lang": "vi",
    "voz": "vi-VN",
    "prefijo": "vietnamita",
    "tabla": "vietnamita_progreso",
    "nativo": "Tiếng Việt",
    "nombre": {
      "en": "Vietnamese",
      "es": "vietnamita",
      "vi": "tiếng Việt",
      "zh": "越南语"
    },
    "hola": "Xin chào!",
    "letras": [
      "ă",
      "â",
      "đ",
      "ê",
      "ô",
      "ơ",
      "ư"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 30 20\" aria-hidden=\"true\"><rect width=\"30\" height=\"20\" fill=\"#da251d\"/><polygon fill=\"#ff0\" points=\"15,4 16.76,9.43 22.37,9.43 17.82,12.79 19.56,18.21 15,14.86 10.44,18.21 12.18,12.79 7.63,9.43 13.24,9.43\"/></svg>",
    "lecciones": 263,
    "audio": true
  },
  {
    "id": "id",
    "carpeta": "cursos/id",
    "campo": "ind",
    "lang": "id",
    "voz": "id-ID",
    "prefijo": "indonesio",
    "tabla": "indonesio_progreso",
    "nativo": "Bahasa Indonesia",
    "nombre": {
      "en": "Indonesian",
      "es": "indonesio",
      "vi": "tiếng Indonesia",
      "zh": "印尼语"
    },
    "hola": "Halo!",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 900 600\" aria-hidden=\"true\"><rect width=\"900\" height=\"300\" fill=\"#CE1126\"/><rect y=\"300\" width=\"900\" height=\"300\" fill=\"#fff\"/></svg>",
    "lecciones": 3,
    "audio": false
  },
  {
    "id": "da",
    "carpeta": "cursos/da",
    "campo": "da",
    "lang": "da",
    "voz": "da-DK",
    "prefijo": "dansk",
    "tabla": "dansk_progreso",
    "nativo": "Dansk",
    "nombre": {
      "en": "Danish",
      "es": "danés",
      "vi": "tiếng Đan Mạch",
      "zh": "丹麦语"
    },
    "hola": "Hej!",
    "letras": [
      "æ",
      "ø",
      "å"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 37 28\" aria-hidden=\"true\"><rect width=\"37\" height=\"28\" fill=\"#c8102e\"/><rect x=\"12\" width=\"4\" height=\"28\" fill=\"#fff\"/><rect y=\"12\" width=\"37\" height=\"4\" fill=\"#fff\"/></svg>",
    "lecciones": 69,
    "audio": true
  },
  {
    "id": "ro",
    "carpeta": "cursos/ro",
    "campo": "ro",
    "lang": "ro",
    "voz": "ro-RO",
    "prefijo": "rumano",
    "tabla": "rumano_progreso",
    "nativo": "Română",
    "nombre": {
      "en": "Romanian",
      "es": "rumano",
      "vi": "tiếng Romania",
      "zh": "罗马尼亚语"
    },
    "hola": "Salut!",
    "letras": [
      "ă",
      "â",
      "î",
      "ș",
      "ț"
    ],
    "bandera": "<svg class=\"bandera\" width=\"21\" height=\"14\" viewBox=\"0 0 3 2\" aria-hidden=\"true\"><rect width=\"1\" height=\"2\" fill=\"#002B7F\"/><rect x=\"1\" width=\"1\" height=\"2\" fill=\"#FCD116\"/><rect x=\"2\" width=\"1\" height=\"2\" fill=\"#CE1126\"/></svg>",
    "lecciones": 3,
    "audio": true
  },
  {
    "id": "th",
    "carpeta": "cursos/th",
    "campo": "th",
    "lang": "th",
    "voz": "th-TH",
    "prefijo": "tailandes",
    "tabla": "tailandes_progreso",
    "nativo": "ไทย",
    "nombre": {
      "en": "Thai",
      "es": "tailandés",
      "vi": "tiếng Thái",
      "zh": "泰语"
    },
    "hola": "สวัสดี!",
    "letras": [],
    "bandera": "<svg class=\"bandera\" width=\"30\" height=\"20\" viewBox=\"0 0 900 600\" aria-hidden=\"true\"><rect width=\"900\" height=\"100\" fill=\"#A51931\"/><rect y=\"100\" width=\"900\" height=\"100\" fill=\"#fff\"/><rect y=\"200\" width=\"900\" height=\"200\" fill=\"#2D2A4A\"/><rect y=\"400\" width=\"900\" height=\"100\" fill=\"#fff\"/><rect y=\"500\" width=\"900\" height=\"100\" fill=\"#A51931\"/></svg>",
    "lecciones": 3,
    "audio": false
  }
];
