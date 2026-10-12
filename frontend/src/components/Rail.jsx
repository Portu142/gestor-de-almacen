// components/Rail.jsx — raíl lateral: marca, navegación y pie de estado.
import { NavLink } from 'react-router-dom'
import RailPie from './RailPie'

const NAV = [
  { num: '01', to: '/', etiqueta: 'Resumen', fin: true },
  { num: '02', to: '/productos', etiqueta: 'Inventario' },
  { num: '03', to: '/movimientos', etiqueta: 'Movimientos' },
]

export default function Rail() {
  return (
    <aside className="rail">
      <div className="marca">
        <span className="marca-sigla" aria-hidden="true">GA</span>
        <span className="marca-texto">
          <span className="marca-nombre">Gestor de almacén</span>
          <span className="marca-version">Tienda · MVP</span>
        </span>
      </div>

      <nav className="nav" aria-label="Principal">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.fin} className="nav-enlace">
            <span className="nav-num">{item.num}</span>
            <span className="nav-etiqueta">{item.etiqueta}</span>
          </NavLink>
        ))}
      </nav>

      <RailPie />
    </aside>
  )
}
