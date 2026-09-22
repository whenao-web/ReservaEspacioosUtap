import { Link } from 'react-router'
import { imagenDeEspacio } from '../lib/imagenes'

export default function TarjetaEspacio({ espacio }) {
  const img = imagenDeEspacio(espacio)
  return (
    <li>
      <article className="tarjeta-espacio">
        <div className="tarjeta-imagen">
          {/* La foto real describe el espacio; la ilustracion es decorativa */}
          <img src={img.src} alt={img.real ? `Fotografía de ${espacio.nombre}` : ''} loading="lazy" />
          <span className="etiqueta-tipo">{espacio.tipo}</span>
          <h2>{espacio.nombre}</h2>
        </div>
        <div className="tarjeta-cuerpo">
          <dl>
            <dt>Capacidad</dt><dd>{espacio.capacidad} personas</dd>
            <dt>Ubicación</dt><dd>{espacio.ubicacion}</dd>
          </dl>
          <Link className="boton" to={`/reservar?espacio=${espacio.id}`}>Reservar {espacio.nombre}</Link>
        </div>
      </article>
    </li>
  )
}
