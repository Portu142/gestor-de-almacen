// features/productos/ProductosPage.jsx — 02 Inventario: buscador, filtros y CRUD.
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { useApi } from '../../hooks/useApi'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Estado, { estadoDeProducto } from '../../components/Estado'
import { Cargando, ErrorNota, Vacio } from '../../components/Mensajes'
import { Entrada, Selector } from '../../components/Campo'
import { dinero } from '../../components/formato'
import ProductoForm from './ProductoForm'

const VACIO = { nombre: '', sku: '', categoria: '', cantidad: 0, stock_minimo: 0, precio_coste: 0 }

export default function ProductosPage() {
  // Los filtros viven en la URL: son enlazables (el resumen enlaza a ?agotados=1).
  const [params, setParams] = useSearchParams()
  const filtros = {
    q: params.get('q') ?? '',
    categoria: params.get('categoria') ?? '',
    agotados: params.get('agotados') === '1',
  }

  const obtenerProductos = useCallback(
    () => api.productos.listar(filtros),
    [filtros.q, filtros.categoria, filtros.agotados]
  )
  const obtenerCategorias = useCallback(() => api.productos.categorias(), [])

  const { datos: productos, cargando, error, recargar } = useApi(
    obtenerProductos,
    [filtros.q, filtros.categoria, filtros.agotados],
    []
  )
  const { datos: categorias } = useApi(obtenerCategorias, [], [])

  const [editando, setEditando] = useState(null) // 'nuevo' | id | null

  // El producto en edición puede quedar fuera del filtro activo (p. ej. filtrar
  // «agotados» mientras se edita). En ese caso se cierra el formulario en vez
  // de enviar una edición sobre un producto inexistente.
  useEffect(() => {
    if (
      editando !== null &&
      editando !== 'nuevo' &&
      productos &&
      !productos.some((p) => p.id === editando)
    ) {
      setEditando(null)
    }
  }, [editando, productos])

  function cambiarFiltro(cambios) {
    const siguiente = new URLSearchParams(params)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === '' || valor === false || valor == null) siguiente.delete(clave)
      else siguiente.set(clave, valor === true ? '1' : valor)
    }
    setParams(siguiente)
  }

  async function borrar(p) {
    if (!window.confirm(`¿Borrar «${p.nombre}»? También se eliminarán sus movimientos.`)) return
    try {
      await api.productos.borrar(p.id)
      recargar()
    } catch (e) {
      window.alert(e.message)
    }
  }

  return (
    <>
      <EncabezadoPagina
        kicker="02 — Inventario"
        titulo="Productos"
        acciones={
          <button className="boton" onClick={() => setEditando('nuevo')}>
            Añadir producto
          </button>
        }
      />

      <div className="filtros">
        <label className="campo">
          <span className="campo-etiqueta">Buscar</span>
          <Entrada
            type="search"
            placeholder="Nombre o SKU"
            value={filtros.q}
            onChange={(e) => cambiarFiltro({ q: e.target.value })}
          />
        </label>
        <label className="campo">
          <span className="campo-etiqueta">Categoría</span>
          <Selector
            value={filtros.categoria}
            onChange={(e) => cambiarFiltro({ categoria: e.target.value })}
          >
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </Selector>
        </label>
        <label className="filtro-check">
          <input
            type="checkbox"
            checked={filtros.agotados}
            onChange={(e) => cambiarFiltro({ agotados: e.target.checked })}
          />
          Bajo mínimo / agotados
        </label>
      </div>

      {editando !== null && (
        <ProductoForm
          modo={editando === 'nuevo' ? 'crear' : 'editar'}
          producto={editando === 'nuevo' ? null : productos.find((p) => p.id === editando)}
          categorias={categorias}
          onGuardar={() => { setEditando(null); recargar() }}
          onCancelar={() => setEditando(null)}
        />
      )}

      <div className="panel">
        <ErrorNota error={error} />
        {cargando ? (
          <Cargando />
        ) : productos.length === 0 ? (
          <Vacio
            texto="Ningún producto coincide con los filtros. "
            accion={
              <button className="boton--enlace" onClick={() => setEditando('nuevo')}>
                Dar de alta el primero
              </button>
            }
          />
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="num">Stock</th>
                  <th className="num">Mínimo</th>
                  <th className="num">Coste</th>
                  <th>Estado</th>
                  <th>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.nombre}
                      <br />
                      <span className="sku">{p.sku}</span>
                    </td>
                    <td>{p.categoria}</td>
                    <td className="num">{p.cantidad}</td>
                    <td className="num">{p.stock_minimo}</td>
                    <td className="num">{dinero(p.precio_coste)}</td>
                    <td><Estado estado={estadoDeProducto(p)} /></td>
                    <td>
                      <div className="acciones-fila">
                        <button
                          className="boton boton--secundario boton--menudo"
                          onClick={() => setEditando(p.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="boton boton--peligro boton--menudo"
                          onClick={() => borrar(p)}
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
