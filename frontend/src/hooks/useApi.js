// hooks/useApi.js — carga de datos asíncronos con estados de carga y error.
// Convención: la función que se pasa debe ir envuelta en useCallback con las
// mismas dependencias que se pasan en `deps`, para que `recargar` se actualice.
// `inicial` evita el null durante la primera carga: pasa [] si la pantalla
// espera una lista, así nunca se llama .map/.find sobre null.
import { useCallback, useEffect, useState } from 'react'

export function useApi(obtener, deps = [], inicial = null) {
  const [datos, setDatos] = useState(inicial)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setDatos(await obtener())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    recargar()
  }, [recargar])

  return { datos, cargando, error, recargar }
}
