// Imagenes del sitio.
//
// Convencion para las fotos de los espacios:
//   frontend/public/img/espacios/<nombre-del-espacio>.jpg
//   "Sala Mac" -> sala-mac.jpg · "Laboratorio Redes" -> laboratorio-redes.jpg
//
// Orden de busqueda para cada tarjeta:
//   1. espacios.imagen, si el administrador la definio (ruta img/... o https://)
//   2. la foto por convencion de nombre
//   3. la ilustracion segun el tipo (siempre existe)
const BASE = import.meta.env.BASE_URL

const ILUSTRACION = {
  'Sala de reuniones': 'img/espacios/sala.svg',
  Laboratorio: 'img/espacios/laboratorio.svg',
  Auditorio: 'img/espacios/auditorio.svg',
  Cancha: 'img/espacios/cancha.svg',
}

export const rutaPublica = (ruta) => (ruta.startsWith('https://') ? ruta : `${BASE}${ruta}`)

// "Sala Múltiple 2" -> "sala-multiple-2"
export const aNombreDeArchivo = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Lista de candidatas, de la mas especifica a la de respaldo
export function imagenesDeEspacio(espacio) {
  const candidatas = []
  if (espacio.imagen) candidatas.push(rutaPublica(espacio.imagen))
  candidatas.push(rutaPublica(`img/espacios/${aNombreDeArchivo(espacio.nombre)}.jpg`))
  candidatas.push(rutaPublica(ILUSTRACION[espacio.tipo] ?? 'img/espacios/sala.svg'))
  return candidatas
}

export const BANNER_INICIO = rutaPublica('img/banner/inicio.jpg')
