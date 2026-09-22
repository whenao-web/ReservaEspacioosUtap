import { useState } from 'react'
import { reporteOcupacion } from '../services/reservas'
import { traducirError } from '../lib/errores'
import { hoyLocal } from '../lib/fechas'
import Estado from '../components/Estado'

const haceTreintaDias = () => {
  const d = new Date(); d.setDate(d.getDate() - 30)
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export default function Reporte() {
  const [filas, setFilas] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function consultar(evento) {
    evento.preventDefault()
    const { desde, hasta } = Object.fromEntries(new FormData(evento.currentTarget))
    setCargando(true); setError('')
    try { setFilas(await reporteOcupacion(desde, hasta)) }
    catch (e) { setError(traducirError(e)); setFilas(null) }
    finally { setCargando(false) }
  }

  const maximo = Math.max(1, ...(filas ?? []).map((f) => Number(f.horas_reservadas)))

  return (
    <>
      <h1>Reporte de ocupación</h1>
      <form className="filtros" onSubmit={consultar}>
        <div className="campo">
          <label htmlFor="desde">Desde</label>
          <input id="desde" name="desde" type="date" required defaultValue={haceTreintaDias()} />
        </div>
        <div className="campo">
          <label htmlFor="hasta">Hasta</label>
          <input id="hasta" name="hasta" type="date" required defaultValue={hoyLocal()} />
        </div>
        <button type="submit">Consultar</button>
      </form>

      {cargando && <Estado tipo="cargando" />}
      {error && <Estado tipo="error" mensaje={error} />}
      {filas && (
        <table className="tabla">
          <caption className="oculto">Horas reservadas y canceladas por espacio</caption>
          <thead><tr><th scope="col">Espacio</th><th scope="col">Reservas</th><th scope="col">Horas reservadas</th><th scope="col">Horas canceladas</th></tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.espacio}>
                <td>{f.espacio}</td>
                <td>{f.reservas}</td>
                <td>
                  <span className="barra" style={{ width: `${(Number(f.horas_reservadas) / maximo) * 100}%` }} aria-hidden="true" />
                  {f.horas_reservadas}
                </td>
                <td>{f.horas_canceladas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
