// Las estrellas de una lección: según la proporción de fallos, no su número (una lección larga no sale peor que una
// corta con la misma soltura). 3 si se falla poco (un fallo, o hasta el 15 % de los pasos), 2 hasta el 40 % y 1 si
// cuesta más. La usan los juegos (juegos/motor.js) y el modo libro (js/juego/escenas.js).
export const estrellasPorFallos = (fallos, pasos) => {
  const tasa = fallos / Math.max(1, pasos);
  return fallos <= 1 || tasa <= 0.15 ? 3 : tasa <= 0.4 ? 2 : 1;
};
