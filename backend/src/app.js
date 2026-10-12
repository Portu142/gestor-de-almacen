// src/app.js — construcción de la aplicación Express.
// Separada de server.js para poder testear la API sin abrir el puerto.
import express from 'express';
import cors from 'cors';
import { api } from './routes/index.js';

// Orígenes permitidos: el frontend de desarrollo. En producción se sobreescribe
// con la variable CORS_ORIGINS (p. ej. https://almacen.mitienda.com).
const ORIGENES_PERMITIDOS = (
  process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export function createApp() {
  const app = express();

  app.disable('x-powered-by'); // no publicamos la versión de Express

  // Cabeceras de seguridad mínimas (sin dependencias externas).
  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store', // datos de inventario siempre frescos
    });
    next();
  });

  app.use(cors({ origin: ORIGENES_PERMITIDOS }));

  // Límite de cuerpo explícito: un formulario de producto nunca pesa más de 200 kB.
  app.use(express.json({ limit: '200kb' }));

  app.use('/api', api);

  // Manejador global de errores: nunca devolvemos un stack trace al cliente.
  // El orden importa: los tipos de error de body-parser se traducen ANTES de
  // mirar err.status, si no, se colaría el mensaje crudo de Express en inglés.
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Cuerpo de la petición demasiado grande' });
    }
    if (err instanceof Error && err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}
