// features/movimientos/MovimientosPage.jsx — 03 Movimientos: registro e historial.
import { useCallback, useState } from 'react'
import { api } from '../../api'
import { useApi } from '../../hooks/useApi'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Estado from '../../components/Estado'
import { Cargando, ErrorNota, Vacio } from '../../components/Mensajes'
import { Selector } from '../../components/Campo'
import { fechaHora } from '../../components/formato'
import MovimientoForm from './MovimientoForm'

export default function MovimientosPage() {
  const [filtroTipo, setFiltroTipo] = useState('')

  const obtenerMovimientos = useCallback(
    () => api.movimientos.listar({ tipo: filtroTipo || undefined }),
    [filtroTipo]
  )
  const obtenerProductos = useCallback(() => api.productos.listar(), [])

  const { datos: movimientos, cargando, error, recargar } = useApi(
    obtenerMovimientos,
    [filtroTipo],
    []
  )
  const { datos: productos } = useApi(obtenerProductos, [], [])

  return (
    <>
      <EncabezadoPagina
        kicker="03 — Movimientos"
        titulo="Entradas y salidas"
        acciones={
          <label className="campo">
            <span className="campo-etiqueta">Filtrar por tipo</span>
            <Selector value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
            </Selector>
          </label>
        }
      />

      <MovimientoForm productos={productos} onRegistrar={recargar} />

      <section className="seccion">
        <h3 className="seccion-titulo">Historial</h3>
        <div className="panel">
          <ErrorNota error={error} />
          {cargando ? (
            <Cargando />
          ) : movimientos.length === 0 ? (
            <Vacio texto="Sin movimientos registrados con este filtro." />
          ) : (
            <div className="tabla-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th className="num">Cantidad</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="sku">{fechaHora(m.fecha)}</td>
                      <td>
                        {m.producto_nombre}
                        <br />
                        <span className="sku">{m.producto_sku}</span>
                      </td>
                      <td><Estado estado={m.tipo} /></td>
                      <td className="num">
                        {m.tipo === 'entrada' ? '+' : '−'}{m.cantidad}
                      </td>
                      <td>{m.motivo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
