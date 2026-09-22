import { useState } from 'react'
import { listarEspacios, listarTipos } from '../services/espacios'
import { useDatos } from '../components/useDatos'
import Estado from '../components/Estado'
import TarjetaEspacio from '../components/TarjetaEspacio'

export default function Espacios() {
  const [tipo, setTipo] = useState('')
  const [capacidadMin, setCapacidadMin] = useState('')
  const tipos = useDatos(listarTipos)
  const espacios = useDatos(
    () => listarEspacios({ tipo, capacidadMin: Number(capacidadMin) || 0 }),
    [tipo, capacidadMin]
  )

  return (
    <>
      <h1>Espacios disponibles</h1>
      <p>Consulte los espacios de la institución y su disponibilidad antes de reservar.</p>

      <form className="filtros" aria-label="Filtrar espacios" onSubmit={(e) => e.preventDefault()}>
        <div className="campo">
          <label htmlFor="filtro-tipo">Tipo de espacio</label>
          <select id="filtro-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.datos?.map((t) => <option key={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="filtro-capacidad">Capacidad mínima</label>
          <input id="filtro-capacidad" type="number" min="1" inputMode="numeric"
                 value={capacidadMin} onChange={(e) => setCapacidadMin(e.target.value)} />
        </div>
      </form>

      {espacios.cargando && <Estado tipo="cargando" />}
      {espacios.error && <Estado tipo="error" mensaje={espacios.error} />}
      {espacios.datos?.length === 0 && <Estado tipo="vacio" mensaje="Ningún espacio cumple ese filtro." />}
      {espacios.datos?.length > 0 && (
        <ul className="lista-espacios">
          {espacios.datos.map((e) => <TarjetaEspacio key={e.id} espacio={e} />)}
        </ul>
      )}
    </>
  )
}
