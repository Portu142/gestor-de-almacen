// src/routes/index.js — montaje de todas las rutas de la API.
import { Router } from 'express';
import { asyncHandler } from '../lib/errors.js';
import * as productos from '../services/productos.service.js';
import * as movimientos from '../services/movimientos.service.js';
import * as dashboard from '../services/dashboard.service.js';

export const api = Router();

api.get('/salud', (_req, res) => res.json({ ok: true }));
api.get('/dashboard', (_req, res) => res.json(dashboard.resumen()));

// ----- Productos -----
api.get('/productos', (req, res) => {
  const { q, categoria, agotados } = req.query;
  res.json(productos.listar({ q, categoria, agotados: agotados === 'true' }));
});

api.get('/productos/categorias', (_req, res) => res.json(productos.categorias()));

api.get('/productos/:id', (req, res) => res.json(productos.porId(req.params.id)));

api.post(
  '/productos',
  asyncHandler(async (req, res) => res.status(201).json(productos.crear(req.body)))
);

api.put(
  '/productos/:id',
  asyncHandler(async (req, res) =>
    res.json(productos.actualizar(Number(req.params.id), req.body))
  )
);

api.delete(
  '/productos/:id',
  asyncHandler(async (req, res) => {
    productos.borrar(Number(req.params.id));
    res.status(204).end();
  })
);

// ----- Movimientos -----
api.get('/movimientos', (req, res) => {
  const { producto_id, tipo, limite } = req.query;
  res.json(movimientos.listar({ producto_id, tipo, limite }));
});

api.post(
  '/movimientos',
  asyncHandler(async (req, res) => res.status(201).json(movimientos.registrar(req.body)))
);

// Cualquier otra ruta /api/* → 404
api.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
