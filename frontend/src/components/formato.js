// components/formato.js — formato de números y fechas en español.
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const fecha = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const dinero = (valor) => eur.format(Number(valor) || 0)

// La API devuelve fechas «AAAA-MM-DD HH:MM:SS» (UTC de SQLite).
export function fechaHora(texto) {
  if (!texto) return '—'
  const fechaLimpia = String(texto).replace(' ', 'T') + 'Z'
  const date = new Date(fechaLimpia)
  return Number.isNaN(date.getTime()) ? texto : fecha.format(date)
}
