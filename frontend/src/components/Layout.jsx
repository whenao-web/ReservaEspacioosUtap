import { NavLink, Outlet, useNavigate } from 'react-router'
import { useSesion } from '../context/sesion'
import { cerrarSesion } from '../services/auth'

export default function Layout() {
  const { sesion, perfil, esAdmin } = useSesion()
  const navegar = useNavigate()

  async function salir() {
    await cerrarSesion()
    navegar('/')
  }

  return (
    <>
      <header>
        <NavLink to="/" className="marca">Reservas de Espacios</NavLink>
        <nav aria-label="Navegación principal">
          <ul>
            <li><NavLink to="/espacios">Espacios</NavLink></li>
            {sesion && <li><NavLink to="/mis-reservas">Mis reservas</NavLink></li>}
            {esAdmin && <li><NavLink to="/admin/espacios">Administrar</NavLink></li>}
            {esAdmin && <li><NavLink to="/admin/reservas">Reservas</NavLink></li>}
            {esAdmin && <li><NavLink to="/admin/reporte">Reporte</NavLink></li>}
            {sesion
              ? <li><button type="button" className="enlace" onClick={salir}>Salir ({perfil?.nombre ?? '...'})</button></li>
              : <li><NavLink to="/login">Iniciar sesión</NavLink></li>}
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>Fundación Tecnológica Autónoma del Pacífico · Oficina de recursos físicos</p>
      </footer>
    </>
  )
}
