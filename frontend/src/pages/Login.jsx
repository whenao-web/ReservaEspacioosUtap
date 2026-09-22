import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { iniciarSesion } from '../services/auth'
import { traducirError } from '../lib/errores'

export default function Login() {
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()
  const destino = useLocation().state?.desde ?? '/espacios'

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setMensaje('')
    try {
      await iniciarSesion(Object.fromEntries(new FormData(evento.currentTarget)))
      navegar(destino, { replace: true })
    } catch (e) {
      setMensaje(traducirError(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <h1>Iniciar sesión</h1>
      <form className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="correo">Correo</label>
          <input id="correo" name="correo" type="email" autoComplete="email" required />
        </div>
        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <p className="estado error" aria-live="polite">{mensaje}</p>
        <button type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <p>¿No tiene cuenta? <Link to="/registro">Regístrese</Link></p>
      </form>
    </>
  )
}
