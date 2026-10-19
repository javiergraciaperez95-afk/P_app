// Acceso de desarrollador (#/desarrollador): mientras dure la pestaña, todas las lecciones y todos sus pasos
// se ven como hechos, para poder saltar entre ellos y revisarlos. No se guarda nada: el progreso de verdad sigue intacto.

const CLAVE = 'idiomas-desarrollador';

export function esDesarrollador() {
  try { return Boolean(sessionStorage.getItem(CLAVE)); } catch { return false; }
}

export function activarDesarrollador() {
  try { sessionStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento */ }
}
