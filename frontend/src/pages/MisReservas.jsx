import { useState } from 'react'
import { useLocation } from 'react-router'
import { cancelarReserva, misReservas } from '../services/reservas'
import { useDatos } from '../components/useDatos'
import { traducirError } from '../lib/errores'
import { fechaLarga, hora } from '../lib/fechas'
import Estado from '../components/Estado'

export default function MisReservas() {
  const aviso = useLocation().state?.aviso ?? ''
  const { datos, error, cargando, recargar } = useDatos(misReservas)
  const [mensaje, setMensaje] = useState({ texto: aviso, error: false })

  async function cancelar(id) {
    if (!window.confirm('¿Cancelar esta reserva?')) return
    try {
      await cancelarReserva(id)
      setMensaje({ texto: 'Reserva cancelada.', error: false })
      recargar()
    } catch (e) {
      setMensaje({ texto: traducirError(e), error: true })
    }
  }

  return (
    <>
      <h1>Mis reservas</h1>
      <p className={`estado ${mensaje.error ? 'error' : ''}`} aria-live="polite">{mensaje.texto}</p>
      {cargando && <Estado tipo="cargando" />}
      {error && <Estado tipo="error" mensaje={error} />}
      {datos?.length === 0 && <Estado tipo="vacio" mensaje="Todavía no tiene reservas." />}
      {datos?.length > 0 && (
        <table className="tabla">
          <caption className="oculto">Sus reservas, de la más reciente a la más antigua</caption>
          <thead>
            <tr><th scope="col">Espacio</th><th scope="col">Fecha</th><th scope="col">Horario</th><th scope="col">Estado</th><th scope="col"><span className="oculto">Acción</span></th></tr>
          </thead>
          <tbody>
            {datos.map((r) => (
              <tr key={r.id}>
                <td>{r.espacio_nombre}</td>
                <td>{fechaLarga(r.fecha)}</td>
                <td>{hora(r.hora_inicio)} a {hora(r.hora_fin)}</td>
                <td>{r.estado}</td>
                <td>
                  {/* "cancelable" viene calculado del servidor: la regla de las 2 horas vive alla */}
                  {r.cancelable && <button type="button" className="secundario" onClick={() => cancelar(r.id)}>Cancelar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
