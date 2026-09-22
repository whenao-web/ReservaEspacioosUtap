import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { registrar } from '../services/auth'
import { traducirError } from '../lib/errores'

export default function Registro() {
  const [mensaje, setMensaje] = useState({ texto: '', error: false })
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  async function enviar(evento) {
    evento.preventDefault()
    const datos = Object.fromEntries(new FormData(evento.currentTarget))
    if (datos.password.length < 8) {
      setMensaje({ texto: 'La contraseña debe tener al menos 8 caracteres.', error: true })
      return
    }
    setEnviando(true)
    try {
      const { session } = await registrar(datos)
      if (session) navegar('/espacios')
      else setMensaje({ texto: 'Cuenta creada. Revise su correo para confirmarla antes de iniciar sesión.', error: false })
    } catch (e) {
      setMensaje({ texto: traducirError(e), error: true })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="acceso">
      <h1>Crear cuenta</h1>
      <form className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="nombre">Nombre completo</label>
          <input id="nombre" name="nombre" autoComplete="name" minLength={2} maxLength={100} required />
        </div>
        <div className="campo">
          <label htmlFor="correo">Correo</label>
          <input id="correo" name="correo" type="email" autoComplete="email" required />
        </div>
        <div className="campo">
          <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <p className={`estado ${mensaje.error ? 'error' : ''}`} aria-live="polite">{mensaje.texto}</p>
        <button type="submit" disabled={enviando}>{enviando ? 'Creando…' : 'Crear cuenta'}</button>
        <p>¿Ya tiene cuenta? <Link to="/login">Inicie sesión</Link></p>
      </form>
    </div>
  )
}
