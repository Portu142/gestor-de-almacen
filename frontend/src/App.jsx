// App.jsx — raíz de la aplicación: rutas bajo el raíl lateral.
// Las pantallas se cargan de forma perezosa (React.lazy): el navegador baja
// el JS de cada pantalla solo al visitarla, reduciendo el bundle inicial.
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Rail from './components/Rail'
import ErrorBoundary from './components/ErrorBoundary'
import { Cargando } from './components/Mensajes'

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'))
const ProductosPage = lazy(() => import('./features/productos/ProductosPage'))
const MovimientosPage = lazy(() => import('./features/movimientos/MovimientosPage'))

export default function App() {
  return (
    <div className="app">
      <a className="salto-contenido" href="#contenido">
        Saltar al contenido
      </a>
      <Rail />
      <main className="contenido" id="contenido" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<Cargando texto="Cargando pantalla…" />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/movimientos" element={<MovimientosPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
