import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { disponibilidad, listarEspacios } from '../services/espacios'
import { crearReserva } from '../services/reservas'
import { useDatos } from '../components/useDatos'
import { traducirError } from '../lib/errores'
import { hoyLocal, hora } from '../lib/fechas'
import Estado from '../components/Estado'

// Validacion en el navegador: solo para avisar rapido.
// La que manda es la de la base de datos; esta se puede saltar, aquella no.
function validar(d) {
  const errores = []
  if (!d.espacio_id) errores.push('Seleccione un espacio.')
  if (!d.fecha) errores.push('Indique la fecha.')
  else if (d.fecha < hoyLocal()) errores.push('La fecha no puede estar en el pasado.')
  if (!d.hora_inicio || !d.hora_fin) errores.push('Indique el horario completo.')
  else {
    const min = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
    const duracion = min(d.hora_fin) - min(d.hora_inicio)
    if (duracion <= 0) errores.push('La hora de fin debe ser posterior a la de inicio.')
    else if (duracion < 30 || duracion > 240) errores.push('La reserva debe durar entre 30 minutos y 4 horas.')
  }
  return errores
}

export default function Reservar() {
  const [params] = useSearchParams()
  const [espacioId, setEspacioId] = useState(params.get('espacio') ?? '')
  const [fecha, setFecha] = useState(hoyLocal())
  const [mensaje, setMensaje] = useState({ texto: '', error: false })
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  const espacios = useDatos(() => listarEspacios())
  const ocupadas = useDatos(
    () => (espacioId && fecha ? disponibilidad(Number(espacioId), fecha) : Promise.resolve([])),
    [espacioId, fecha]
  )

  async function enviar(evento) {
    evento.preventDefault()
    const datos = Object.fromEntries(new FormData(evento.currentTarget))
    const errores = validar(datos)
    if (errores.length) { setMensaje({ texto: errores.join(' '), error: true }); return }

    setEnviando(true)
    try {
      await crearReserva(datos)
      navegar('/mis-reservas', { state: { aviso: 'Reserva creada.' } })
    } catch (e) {
      setMensaje({ texto: traducirError(e), error: true })
      ocupadas.recargar()     // si otro la ocupo, se ve de inmediato
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <h1>Reservar un espacio</h1>
      <p>Las reservas duran entre 30 minutos y 4 horas.</p>

      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="espacio">Espacio</label>
          <select id="espacio" name="espacio_id" required value={espacioId} onChange={(e) => setEspacioId(e.target.value)}>
            <option value="">Seleccione un espacio</option>
            {espacios.datos?.map((e) => <option key={e.id} value={e.id}>{e.nombre} ({e.capacidad} personas)</option>)}
          </select>
        </div>

        <fieldset>
          <legend>Fecha y horario</legend>
          <div className="campo">
            <label htmlFor="fecha">Fecha</label>
            <input id="fecha" name="fecha" type="date" min={hoyLocal()} required value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="hora-inicio">Hora de inicio</label>
            <input id="hora-inicio" name="hora_inicio" type="time" step="1800" required />
          </div>
          <div className="campo">
            <label htmlFor="hora-fin">Hora de fin</label>
            <input id="hora-fin" name="hora_fin" type="time" step="1800" required />
          </div>
        </fieldset>

        {espacioId && (
          <section aria-labelledby="titulo-ocupadas">
            <h2 id="titulo-ocupadas">Franjas ya ocupadas ese día</h2>
            {ocupadas.cargando && <Estado tipo="cargando" />}
            {ocupadas.error && <Estado tipo="error" mensaje={ocupadas.error} />}
            {ocupadas.datos?.length === 0 && <Estado tipo="vacio" mensaje="Todo el día está libre." />}
            {ocupadas.datos?.length > 0 && (
              <ul className="franjas">
                {ocupadas.datos.map((f) => <li key={f.hora_inicio}>{hora(f.hora_inicio)} a {hora(f.hora_fin)}</li>)}
              </ul>
            )}
          </section>
        )}

        <div className="campo">
          <label htmlFor="motivo">Motivo de la reserva</label>
          <textarea id="motivo" name="motivo" rows="3" maxLength={200} />
        </div>

        <p className={`estado ${mensaje.error ? 'error' : ''}`} aria-live="polite">{mensaje.texto}</p>
        <button type="submit" disabled={enviando}>{enviando ? 'Reservando…' : 'Reservar'}</button>
      </form>
    </>
  )
}
