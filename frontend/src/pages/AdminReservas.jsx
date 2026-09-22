import { useState } from 'react'
import { todasLasReservas } from '../services/reservas'
import { listarEspacios } from '../services/espacios'
import { useDatos } from '../components/useDatos'
import { fechaLarga, hora } from '../lib/fechas'
import Estado from '../components/Estado'

export default function AdminReservas() {
  const [fecha, setFecha] = useState('')
  const [espacioId, setEspacioId] = useState('')
  const espacios = useDatos(() => listarEspacios())
  const reservas = useDatos(() => todasLasReservas({ fecha, espacioId }), [fecha, espacioId])

  return (
    <>
      <h1>Todas las reservas</h1>
      <form className="filtros" aria-label="Filtrar reservas" onSubmit={(e) => e.preventDefault()}>
        <div className="campo">
          <label htmlFor="f-fecha">Fecha</label>
          <input id="f-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="f-espacio">Espacio</label>
          <select id="f-espacio" value={espacioId} onChange={(e) => setEspacioId(e.target.value)}>
            <option value="">Todos</option>
            {espacios.datos?.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
      </form>
      {reservas.cargando && <Estado tipo="cargando" />}
      {reservas.error && <Estado tipo="error" mensaje={reservas.error} />}
      {reservas.datos?.length === 0 && <Estado tipo="vacio" mensaje="No hay reservas con ese filtro." />}
      {reservas.datos?.length > 0 && (
        <table className="tabla">
          <caption className="oculto">Reservas filtradas</caption>
          <thead><tr><th scope="col">Espacio</th><th scope="col">Fecha</th><th scope="col">Horario</th><th scope="col">Estado</th><th scope="col">Motivo</th></tr></thead>
          <tbody>
            {reservas.datos.map((r) => (
              <tr key={r.id}>
                <td>{r.espacios?.nombre}</td>
                <td>{fechaLarga(r.fecha)}</td>
                <td>{hora(r.hora_inicio)} a {hora(r.hora_fin)}</td>
                <td>{r.estado}</td>
                <td>{r.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
