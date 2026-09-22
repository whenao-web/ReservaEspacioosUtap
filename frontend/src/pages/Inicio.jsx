import { Link } from 'react-router'

export default function Inicio() {
  return (
    <>
      <h1>Reservas de Espacios</h1>
      <p>Consulte la disponibilidad de salas, laboratorios y auditorios de la institución, y reserve sin intermediarios.</p>
      <p><Link className="boton" to="/espacios">Ver espacios disponibles</Link></p>
    </>
  )
}
