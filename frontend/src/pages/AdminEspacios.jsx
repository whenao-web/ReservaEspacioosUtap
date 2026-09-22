import { useState } from 'react'
import { actualizarEspacio, cambiarEstadoEspacio, crearEspacio, eliminarEspacio, listarEspacios, listarTipos } from '../services/espacios'
import { useDatos } from '../components/useDatos'
import { traducirError } from '../lib/errores'
import Estado from '../components/Estado'

const VACIO = { nombre: '', tipo_espacio_id: '', capacidad: '', ubicacion: '' }

export default function AdminEspacios() {
  const espacios = useDatos(() => listarEspacios())    // como admin, RLS devuelve tambien los inactivos
  const tipos = useDatos(listarTipos)
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState({ texto: '', error: false })

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const avisar = (texto, error = false) => setMensaje({ texto, error })

  async function guardar(evento) {
    evento.preventDefault()
    const datos = { ...form, tipo_espacio_id: Number(form.tipo_espacio_id), capacidad: Number(form.capacidad) }
    try {
      if (editando) await actualizarEspacio(editando, datos)
      else await crearEspacio(datos)
      avisar(editando ? 'Espacio actualizado.' : 'Espacio creado.')
      setForm(VACIO); setEditando(null); espacios.recargar()
    } catch (e) { avisar(traducirError(e), true) }
  }

  async function accion(fn, texto) {
    try { await fn(); avisar(texto); espacios.recargar() }
    catch (e) { avisar(traducirError(e), true) }
  }

  function editar(e) {
    setEditando(e.id)
    setForm({ nombre: e.nombre, tipo_espacio_id: String(e.tipo_espacio_id), capacidad: String(e.capacidad), ubicacion: e.ubicacion ?? '' })
  }

  return (
    <>
      <h1>Administrar espacios</h1>

      <form className="formulario" onSubmit={guardar}>
        <h2>{editando ? 'Editar espacio' : 'Nuevo espacio'}</h2>
        <fieldset>
          <legend className="oculto">Datos del espacio</legend>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" required value={form.nombre} onChange={cambiar} />
          </div>
          <div className="campo">
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo_espacio_id" required value={form.tipo_espacio_id} onChange={cambiar}>
              <option value="">Seleccione</option>
              {tipos.datos?.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="capacidad">Capacidad</label>
            <input id="capacidad" name="capacidad" type="number" min="1" max="500" required value={form.capacidad} onChange={cambiar} />
          </div>
          <div className="campo">
            <label htmlFor="ubicacion">Ubicación</label>
            <input id="ubicacion" name="ubicacion" value={form.ubicacion} onChange={cambiar} />
          </div>
        </fieldset>
        <p className={`estado ${mensaje.error ? 'error' : ''}`} aria-live="polite">{mensaje.texto}</p>
        <div className="acciones">
          <button type="submit">{editando ? 'Guardar cambios' : 'Crear espacio'}</button>
          {editando && <button type="button" className="secundario" onClick={() => { setEditando(null); setForm(VACIO) }}>Cancelar edición</button>}
        </div>
      </form>

      {espacios.cargando && <Estado tipo="cargando" />}
      {espacios.error && <Estado tipo="error" mensaje={espacios.error} />}
      {espacios.datos?.length > 0 && (
        <table className="tabla">
          <caption className="oculto">Espacios registrados</caption>
          <thead>
            <tr><th scope="col">Nombre</th><th scope="col">Tipo</th><th scope="col">Capacidad</th><th scope="col">Estado</th><th scope="col"><span className="oculto">Acciones</span></th></tr>
          </thead>
          <tbody>
            {espacios.datos.map((e) => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.tipo}</td>
                <td>{e.capacidad}</td>
                <td>{e.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="acciones">
                  <button type="button" className="secundario" onClick={() => editar(e)}>Editar</button>
                  <button type="button" className="secundario"
                          onClick={() => accion(() => cambiarEstadoEspacio(e.id, !e.activo), e.activo ? 'Espacio desactivado.' : 'Espacio activado.')}>
                    {e.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button type="button" className="peligro"
                          onClick={() => window.confirm(`¿Eliminar ${e.nombre}?`) && accion(() => eliminarEspacio(e.id), 'Espacio eliminado.')}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
