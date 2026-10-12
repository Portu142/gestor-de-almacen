// features/productos/ProductoForm.jsx — alta y edición de productos.
import { useState } from 'react'
import { api } from '../../api'
import Campo, { Entrada } from '../../components/Campo'
import { ErrorNota } from '../../components/Mensajes'

const VACIO = { nombre: '', sku: '', categoria: '', cantidad: 0, stock_minimo: 0, precio_coste: 0 }

export default function ProductoForm({ modo, producto, categorias, onGuardar, onCancelar }) {
  const [form, setForm] = useState(
    producto
      ? {
          nombre: producto.nombre,
          sku: producto.sku,
          categoria: producto.categoria,
          cantidad: producto.cantidad,
          stock_minimo: producto.stock_minimo,
          precio_coste: producto.precio_coste,
        }
      : VACIO
  )
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      if (modo === 'crear') await api.productos.crear(form)
      else await api.productos.actualizar(producto.id, form)
      onGuardar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="panel" onSubmit={guardar}>
      <h3 className="seccion-titulo">
        {modo === 'crear' ? 'Nuevo producto' : `Editar — ${producto?.nombre}`}
      </h3>
      <ErrorNota error={error} />
      <div className="campos">
        <Campo etiqueta="Nombre">
          <Entrada required value={form.nombre} onChange={set('nombre')} />
        </Campo>
        <Campo etiqueta="SKU">
          <Entrada required value={form.sku} onChange={set('sku')} />
        </Campo>
        <Campo etiqueta="Categoría">
          <Entrada list="categorias-existente" value={form.categoria} onChange={set('categoria')} />
          <datalist id="categorias-existente">
            {categorias.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Campo>
        <Campo etiqueta="Cantidad">
          <Entrada type="number" min="0" required value={form.cantidad} onChange={set('cantidad')} />
        </Campo>
        <Campo etiqueta="Stock mínimo">
          <Entrada type="number" min="0" required value={form.stock_minimo} onChange={set('stock_minimo')} />
        </Campo>
        <Campo etiqueta="Precio de coste" ayuda="€">
          <Entrada type="number" min="0" step="0.01" required value={form.precio_coste} onChange={set('precio_coste')} />
        </Campo>
      </div>
      <div className="panel-acciones">
        <button type="button" className="boton boton--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
