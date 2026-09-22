import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Espacios from './pages/Espacios'
import Reservar from './pages/Reservar'
import MisReservas from './pages/MisReservas'
import AdminEspacios from './pages/AdminEspacios'
import AdminReservas from './pages/AdminReservas'
import Reporte from './pages/Reporte'
import NoEncontrada from './pages/NoEncontrada'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="espacios" element={<Espacios />} />
        <Route path="reservar" element={<RutaProtegida><Reservar /></RutaProtegida>} />
        <Route path="mis-reservas" element={<RutaProtegida><MisReservas /></RutaProtegida>} />
        <Route path="admin/espacios" element={<RutaProtegida soloAdmin><AdminEspacios /></RutaProtegida>} />
        <Route path="admin/reservas" element={<RutaProtegida soloAdmin><AdminReservas /></RutaProtegida>} />
        <Route path="admin/reporte" element={<RutaProtegida soloAdmin><Reporte /></RutaProtegida>} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
