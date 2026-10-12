// features/movimientos/MovimientoForm.jsx — registro de entradas y salidas.
import { useState } from 'react'
import { api } from '../../api'
import Campo, { Entrada, Selector } from '../../components/Campo'
import { ErrorNota } from '../../components/Mensajes'

const VACIO = { producto_id: '', tipo: 'entrada', cantidad: 1, motivo: '' }

export default function MovimientoForm({ productos, onRegistrar }) {
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })
  const producto = productos.find((p) => p.id === Number(form.producto_id))
  const delta = form.tipo === 'entrada' ? 1 : -1
  const resultado = producto ? producto.cantidad + delta * Number(form.cantidad || 0) : null

  async function registrar(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      await api.movimientos.crear({ ...form, producto_id: Number(form.producto_id), cantidad: Number(form.cantidad) })
      setForm({ ...VACIO, tipo: form.tipo })
      onRegistrar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="panel" onSubmit={registrar}>
      <h3 className="seccion-titulo">Registrar movimiento</h3>
      <ErrorNota error={error} />
      <div className="campos">
        <Campo etiqueta="Producto">
          <Selector required value={form.producto_id} onChange={set('producto_id')}>
            <option value="">— Elegir —</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.sku}) · stock {p.cantidad}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Tipo">
          <Selector value={form.tipo} onChange={set('tipo')}>
            <option value="entrada">Entrada — recepción</option>
            <option value="salida">Salida — venta o rotura</option>
          </Selector>
        </Campo>
        <Campo etiqueta="Cantidad">
          <Entrada type="number" min="1" required value={form.cantidad} onChange={set('cantidad')} />
        </Campo>
        <Campo etiqueta="Motivo">
          <Entrada
            placeholder="Pedido #1004, venta mostrador…"
            value={form.motivo}
            onChange={set('motivo')}
          />
        </Campo>
      </div>

      {producto && (
        <p className="campo-ayuda" style={{ marginTop: '0.9rem' }}>
          Stock de {producto.nombre}: {producto.cantidad} → {resultado}
        </p>
      )}

      <div className="panel-acciones">
        <button type="submit" className="boton" disabled={guardando || !producto}>
          {guardando ? 'Registrando…' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}
