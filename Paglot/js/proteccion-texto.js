// Bloqueo de copia desde la interfaz compartida por la web y la APK.
// No sustituye el control de acceso del servidor ni protege datos descargados.
(() => {
  const editable = nodo => {
    const elemento = nodo?.nodeType === 1 ? nodo : nodo?.parentElement;
    return !!elemento && (!!elemento.closest('input, textarea') || elemento.isContentEditable);
  };
  const bloquear = evento => evento.preventDefault();

  // Sin avisos ni diálogos. Pegar y escribir siguen disponibles en formularios.
  for (const tipo of ['copy', 'cut', 'contextmenu']) {
    document.addEventListener(tipo, bloquear, true);
  }
  document.addEventListener('selectstart', evento => {
    if (!editable(evento.target)) bloquear(evento);
  }, true);
  document.addEventListener('dragstart', evento => {
    if (!editable(evento.target)) bloquear(evento);
  }, true);
  document.addEventListener('keydown', evento => {
    if (!evento.ctrlKey && !evento.metaKey) return;
    const tecla = evento.key.toLowerCase();
    if (tecla === 'c' || tecla === 'x' || (tecla === 'a' && !editable(evento.target))) {
      bloquear(evento);
    }
  }, true);
  document.addEventListener('selectionchange', () => {
    const seleccion = window.getSelection();
    if (seleccion && !seleccion.isCollapsed && !editable(seleccion.anchorNode)) {
      seleccion.removeAllRanges();
    }
  });
})();
