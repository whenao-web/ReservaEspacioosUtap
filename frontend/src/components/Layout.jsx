import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useSesion } from '../context/sesion'
import { cerrarSesion } from '../services/auth'
import { rutaPublica } from '../lib/imagenes'

// Si existe frontend/public/img/logo.png se muestra; si no, el nombre en texto.
// El logo oficial se usa solo con autorizacion de la institucion.
function Marca() {
  const [sinLogo, setSinLogo] = useState(false)
  return (
    <NavLink to="/" className="marca" aria-label="Reservas de Espacios, inicio">
      {!sinLogo && <img src={rutaPublica('img/logo.png')} alt="" onError={() => setSinLogo(true)} />}
      <span className="marca-texto">
        <strong>Reservas de Espacios</strong>
        <small>Fundación Tecnológica Autónoma del Pacífico</small>
      </span>
    </NavLink>
  )
}

export default function Layout() {
  const { sesion, perfil, esAdmin } = useSesion()
  const navegar = useNavigate()

  async function salir() {
    await cerrarSesion()
    navegar('/')
  }

  return (
    <>
      <div className="barra-superior">
        <p>Sistema institucional de reserva de salas, laboratorios y auditorios</p>
      </div>
      <header className="encabezado">
        <div className="contenedor encabezado-interior">
          <Marca />
          <nav aria-label="Navegación principal">
            <ul>
              <li><NavLink to="/espacios">Espacios</NavLink></li>
              {sesion && <li><NavLink to="/mis-reservas">Mis reservas</NavLink></li>}
              {esAdmin && <li><NavLink to="/admin/espacios">Administrar</NavLink></li>}
              {esAdmin && <li><NavLink to="/admin/reservas">Reservas</NavLink></li>}
              {esAdmin && <li><NavLink to="/admin/reporte">Reporte</NavLink></li>}
              {sesion
                ? <li><button type="button" className="enlace" onClick={salir}>Salir ({perfil?.nombre?.split(' ')[0] ?? '...'})</button></li>
                : <li><NavLink to="/login" className="boton boton-acento">Iniciar sesión</NavLink></li>}
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="pie">
        <div className="contenedor">
          <p><strong>Reservas de Espacios</strong> · Oficina de recursos físicos</p>
          <p>Proyecto académico del curso de opción de grado Desarrollo Web Full Stack con IA.</p>
        </div>
      </footer>
    </>
  )
}
