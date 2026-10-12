// Perfil del alumno (nombre y foto), guardado en el navegador.
// "mod" = fecha del último cambio, para saber qué versión gana al unir con la nube.

const CLAVE = 'vietlibro.perfil';
const MAX_FOTO = 30000; // caracteres, el mismo límite que la tabla de la nube

function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE));
    if (d && typeof d === 'object') return { nombre: String(d.nombre || ''), foto: String(d.foto || ''), mod: Number(d.mod) || 0 };
  } catch { /* sin datos */ }
  return { nombre: '', foto: '', mod: 0 };
}

let datos = cargar();

/** Devuelve false si no se pudo guardar (p. ej. sin espacio). */
function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    return false;
  }
  document.dispatchEvent(new CustomEvent('perfil-cambio'));
  return true;
}

export function perfil() {
  return { ...datos };
}

export function guardarNombre(nombre) {
  datos.nombre = String(nombre).trim().slice(0, 30);
  datos.mod = Date.now();
  return guardar();
}

export function guardarFoto(dataUrl) {
  const antes = { ...datos };
  datos.foto = dataUrl;
  datos.mod = Date.now();
  if (!guardar()) { datos = antes; return false; }
  return true;
}

/** Sustituye el perfil (al unir con la nube). */
export function importar(nuevo) {
  datos = { nombre: String(nuevo.nombre || ''), foto: String(nuevo.foto || ''), mod: Number(nuevo.mod) || 0 };
  guardar();
}

/** Recorta la imagen al centro, la reduce y la devuelve como texto (data URL) de menos de 30 000 caracteres. */
export function prepararFoto(archivo) {
  return new Promise((resolve, reject) => {
    if (!archivo || !archivo.type.startsWith('image/')) { reject(new Error('no-imagen')); return; }
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const lado = Math.min(img.width, img.height);
      for (const [tam, calidad] of [[160, 0.85], [160, 0.7], [128, 0.7], [112, 0.6], [96, 0.5]]) {
        const c = document.createElement('canvas');
        c.width = tam; c.height = tam;
        c.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, tam, tam);
        const dato = c.toDataURL('image/jpeg', calidad);
        if (dato.length <= MAX_FOTO) { resolve(dato); return; }
      }
      reject(new Error('demasiado-grande'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('no-imagen')); };
    img.src = url;
  });
}
