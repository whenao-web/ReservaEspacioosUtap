// Fecha de HOY en hora local, como AAAA-MM-DD.
// new Date().toISOString() da la fecha en UTC: en Colombia, despues de las
// 7 p. m. ya seria "manana". Por eso se corrige con el desfase local.
export function hoyLocal() {
  const ahora = new Date()
  return new Date(ahora - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

// '14:00:00' -> '14:00'
export const hora = (h) => (h ? h.slice(0, 5) : '')

// '2026-10-15' -> '15 oct. 2026' (sin pasar por UTC)
export function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}
