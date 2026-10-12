// Linter (ESLint 9+, configuración plana). Se ejecuta con: npm run lint
// No hace falta instalar nada si ESLint ya está disponible (npx eslint).
import js from '@eslint/js';

const navegador = {
  window: 'readonly', document: 'readonly', localStorage: 'readonly', location: 'readonly', navigator: 'readonly',
  fetch: 'readonly', console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly',
  requestAnimationFrame: 'readonly', performance: 'readonly', CustomEvent: 'readonly', Event: 'readonly', URL: 'readonly',
  Blob: 'readonly', Node: 'readonly', Intl: 'readonly', SpeechSynthesisUtterance: 'readonly', confirm: 'readonly',
  globalThis: 'readonly', matchMedia: 'readonly',
};
const node = { process: 'readonly', console: 'readonly', URL: 'readonly', globalThis: 'readonly', setTimeout: 'readonly' };

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: navegador },
  },
  {
    files: ['tools/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...node, ...navegador } },
  },
];
