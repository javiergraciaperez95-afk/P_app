// Saca la rejilla de colores de Lucía (48 × 60) con el mismo código que la dibuja en la app, para hacer los iconos.
// Uso: node _herramientas/tutora_rejilla.mjs (escribe _herramientas/tutora.json, que lee _herramientas/iconos.py)
globalThis.window = { matchMedia: () => ({ matches: false, addEventListener() {} }) };
globalThis.document = { documentElement: { classList: { add() {}, contains: () => false } }, styleSheets: [] };
const { fabricar } = await import('../js/tutora-base.js');
const diseno = (await import('../cursos/es/tutora.js')).default;
const dibujo = fabricar(diseno);
const salida = {};
for (const expresion of ['normal', 'contenta']) salida[expresion] = dibujo.rejilla(expresion);
salida.saludo = dibujo.rejilla('contenta', 0, 'saludar', 0.45);
(await import('node:fs')).writeFileSync(new URL('./tutora.json', import.meta.url), JSON.stringify(salida));
