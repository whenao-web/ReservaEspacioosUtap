// Resuelve la imagen de un espacio.
//  - URL completa (https://...)            -> se usa tal cual
//  - ruta relativa (img/espacios/x.jpg)    -> se le antepone la base del sitio,
//                                             que en GitHub Pages es /REPOSITORIO/
//  - vacio                                 -> ilustracion segun el tipo
const BASE = import.meta.env.BASE_URL

const ILUSTRACION = {
  'Sala de reuniones': 'img/espacios/sala.svg',
  Laboratorio: 'img/espacios/laboratorio.svg',
  Auditorio: 'img/espacios/auditorio.svg',
  Cancha: 'img/espacios/cancha.svg',
}

export const rutaPublica = (ruta) => (ruta.startsWith('https://') ? ruta : `${BASE}${ruta}`)

export function imagenDeEspacio(espacio) {
  if (espacio.imagen) return { src: rutaPublica(espacio.imagen), real: true }
  return { src: rutaPublica(ILUSTRACION[espacio.tipo] ?? 'img/espacios/sala.svg'), real: false }
}
