import { Link } from 'react-router'

export default function TarjetaEspacio({ espacio }) {
  return (
    <li>
      <article className="tarjeta-espacio">
        <h2>{espacio.nombre}</h2>
        <dl>
          <dt>Tipo</dt><dd>{espacio.tipo}</dd>
          <dt>Capacidad</dt><dd>{espacio.capacidad} personas</dd>
          <dt>Ubicación</dt><dd>{espacio.ubicacion}</dd>
        </dl>
        <Link to={`/reservar?espacio=${espacio.id}`}>Reservar {espacio.nombre}</Link>
      </article>
    </li>
  )
}
