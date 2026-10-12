// components/ErrorBoundary.jsx — red de seguridad ante errores de renderizado.
// Si una pantalla revienta, el usuario ve un mensaje y un botón de recarga
// en vez de una página en blanco.
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error de renderizado:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel" role="alert">
          <h3 className="seccion-titulo">Algo ha fallado en la interfaz</h3>
          <p className="vacio" style={{ border: 'none', padding: '0 0 1rem' }}>
            {this.state.error.message}
          </p>
          <button className="boton" onClick={() => window.location.reload()}>
            Recargar la aplicación
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
