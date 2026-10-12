// Frases de la tutora. Personalidad: segura de sí misma, algo vanidosa,
// cariñosa y didáctica. Nunca humilla. (Evitamos adjetivos con género para el alumno.)

export const NOMBRE_TUTORA = 'Cô Mai';

export const T = {
  bienvenida: [
    { texto: `Xin chào! Soy ${NOMBRE_TUTORA}, tu profesora de vietnamita. Sí, la más guapa y la más lista: ya lo irás comprobando.`, expresion: 'contenta' },
    { texto: 'Elige una lección y empezamos. Conmigo vas a aprender rápido, te lo prometo.', expresion: 'normal' },
  ],
  inicio: [
    '¿Seguimos? Elige una lección. Yo ya estoy lista… como siempre.',
    'Qué bien verte por aquí. ¿Qué lección abrimos hoy?',
    'Un poquito cada día y en nada hablas vietnamita. Palabra de profesora.',
  ],
  leccion: (lec) => [
    { texto: `Lección ${lec.id}: «${lec.titulo}». ${lec.tituloEs}.`, expresion: 'contenta' },
    { texto: 'Pulsa el sello rojo (?) de una frase y te la explico enterita. Pasa el ratón o toca una palabra para ver qué significa.', expresion: 'normal' },
  ],
  acierto: [
    '¡Exacto! Se nota quién es tu profesora.',
    '¡Muy bien! Estoy orgullosa de ti… y un poquito de mí también.',
    '¡Correcto! Así me gusta.',
    '¡Eso es! Ni yo lo habría dicho mejor. Bueno, quizá sí.',
  ],
  fallo: [
    'Uy, casi. No pasa nada: para eso estoy yo.',
    'Esa no es, pero lo vemos juntos en un momento.',
    '¡Ay! Por poco. Mira por qué:',
  ],
  repasoInicio: 'A repasar. Responde con sinceridad: si dudaste, «Difícil»; si no te acordabas, «Otra vez». Yo no miro… bueno, un poquito.',
  repasoAnimo: [
    '¡Vas como un cohete! Sigue así.',
    'Diez más. Tu memoria y yo hacemos un equipo estupendo.',
    'Qué constancia. Me recuerdas a mí cuando estudiaba.',
  ],
  repasoFin: '¡Repaso terminado por hoy! Mañana te pregunto justo lo que estés a punto de olvidar. Soy así de lista.',
  terminada: '¡Lección terminada! Tienes una profesora estupenda, pero el mérito también es tuyo. Un poco.',
  errores: 'Ay, ay… Hay algo mal escrito en alguna lección. Te lo he marcado en rojo con el sitio exacto.',
  roto: 'Este archivo tiene un error de escritura y no puedo leerlo. Mira el recuadro rojo: te digo la línea exacta.',
  sinLecciones: 'No encuentro ninguna lección en la carpeta «lecciones». ¿Has abierto la web con iniciar.cmd?',
};
