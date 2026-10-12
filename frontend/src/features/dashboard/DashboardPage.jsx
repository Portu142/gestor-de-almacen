// features/dashboard/DashboardPage.jsx — 01 Resumen.
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useApi } from '../../hooks/useApi'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Estado from '../../components/Estado'
import { Cargando, ErrorNota, Vacio } from '../../components/Mensajes'
import { dinero, fechaHora } from '../../components/formato'

export default function DashboardPage() {
  const obtener = useCallback(() => api.dashboard(), [])
  const { datos, cargando, error, recargar } = useApi(obtener, [])

  if (cargando) return <Cargando texto="Leyendo el almacén…" />
  if (error) return <ErrorNota error={`No se pudo cargar el resumen: ${error}`} />
  if (!datos) return null

  const { totales, bajo_minimo, ultimos_movimientos, por_categoria } = datos
  const valorMaximo = Math.max(...por_categoria.map((c) => c.valor), 1)

  return (
    <>
      <EncabezadoPagina
        kicker="01 — Resumen"
        titulo="Estado del almacén"
        acciones={<button className="boton boton--secundario" onClick={recargar}>Actualizar</button>}
      />

      <div className="cifras">
        <Cifra valor={totales.total_productos} etiqueta="Referencias" />
        <Cifra valor={totales.unidades_totales} etiqueta="Unidades en stock" />
        <Cifra valor={dinero(totales.valor_inventario)} etiqueta="Valor a coste" />
        <Cifra
          valor={totales.productos_bajo_minimo}
          etiqueta="Bajo el mínimo"
          alerta={totales.productos_bajo_minimo > 0}
        />
      </div>

      <div className="columnas">
        <section className="seccion">
          <h3 className="seccion-titulo">Reposición pendiente</h3>
          <div className="panel">
            {bajo_minimo.length === 0 ? (
              <Vacio texto="Ningún producto por debajo del mínimo." />
            ) : (
              <div className="tabla-wrap">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="num">Stock</th>
                      <th className="num">Mínimo</th>
                      <th className="num">Faltan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bajo_minimo.map((p) => (
                      <tr key={p.id} className="tabla-fila--alerta">
                        <td>
                          {p.nombre}
                          <br />
                          <span className="sku">{p.sku}</span>
                        </td>
                        <td className="num">{p.cantidad}</td>
                        <td className="num">{p.stock_minimo}</td>
                        <td className="num"><strong>{p.unidades_faltantes}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ marginTop: '0.9rem' }}>
              <Link className="enlace-senal" to="/productos?agotados=1">
                Ver el inventario filtrado por mínimos →
              </Link>
            </p>
          </div>
        </section>

        <section className="seccion">
          <h3 className="seccion-titulo">Valor por categoría</h3>
          <div className="panel">
            {por_categoria.length === 0 ? (
              <Vacio texto="Sin datos: todavía no hay productos." />
            ) : (
              <div className="barra-lista">
                {por_categoria.map((c) => (
                  <div className="barra-fila" key={c.categoria}>
                    <span className="barra-nombre">{c.categoria}</span>
                    <span className="barra-valor">{dinero(c.valor)}</span>
                    <span className="barra-rail">
                      <span
                        className="barra-relleno"
                        style={{ width: `${Math.max((c.valor / valorMaximo) * 100, 2)}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="seccion">
        <h3 className="seccion-titulo">Últimos movimientos</h3>
        <div className="panel">
          {ultimos_movimientos.length === 0 ? (
            <Vacio texto="Todavía no se ha registrado ningún movimiento." />
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
                  {ultimos_movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="sku">{fechaHora(m.fecha)}</td>
                      <td>{m.producto_nombre}</td>
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

function Cifra({ valor, etiqueta, alerta = false }) {
  return (
    <div className={`cifra ${alerta ? 'cifra--alerta' : ''}`}>
      <span className="cifra-valor">{valor}</span>
      <span className="cifra-etiqueta">{etiqueta}</span>
    </div>
  )
}
