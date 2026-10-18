// El curso de la app: solo español. Se edita a mano; el número de lecciones lo pone al día
// _herramientas/contar_lecciones.py (y compilar.py, con el curso que compila).
// campo: clave bajo la que va el texto del idioma en sus archivos · voz: idioma de la voz · prefijo: con qué nombre
// guarda su progreso en el dispositivo · letras: teclas de ayuda al escribir.

export const CURSOS = [
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
      "zh": "西班牙语",
      "pt": "espanhol"
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
    "lecciones": 320,
    "audio": false
  }
];
