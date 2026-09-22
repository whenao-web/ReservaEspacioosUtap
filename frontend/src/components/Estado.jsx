// Los tres estados de toda pantalla que carga datos: cargando, vacio, error.
export default function Estado({ tipo, mensaje }) {
  const textos = {
    cargando: 'Cargando…',
    vacio: mensaje ?? 'No hay nada que mostrar.',
    error: mensaje ?? 'Ocurrió un error.',
  }
  return (
    <p className={`estado ${tipo === 'error' ? 'error' : ''}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {textos[tipo]}
    </p>
  )
}
