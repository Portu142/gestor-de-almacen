// tests/movimientos.service.test.js
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { limpiar } from './helpers.js';

const movimientos = await import('../src/services/movimientos.service.js');
const productos = await import('../src/services/productos.service.js');
const { AppError } = await import('../src/lib/errors.js');

function crearProducto(cantidad = 10) {
  return productos.crear({
    nombre: 'HDMI 2 m',
    sku: `CAB-${Math.random().toString(36).slice(2, 7)}`,
    categoria: 'Cables',
    cantidad,
    stock_minimo: 3,
    precio_coste: 4.2,
  });
}

beforeEach(limpiar);

test('una entrada aumenta el stock y registra el movimiento', () => {
  const p = crearProducto(10);

  const movimiento = movimientos.registrar({
    producto_id: p.id,
    tipo: 'entrada',
    cantidad: 5,
    motivo: 'Recepción de pedido',
  });

  assert.equal(movimiento.tipo, 'entrada');
  assert.equal(movimiento.producto_nombre, 'HDMI 2 m');
  assert.equal(productos.porId(p.id).cantidad, 15);
});

test('una salida reduce el stock', () => {
  const p = crearProducto(10);
  movimientos.registrar({ producto_id: p.id, tipo: 'salida', cantidad: 4 });
  assert.equal(productos.porId(p.id).cantidad, 6);
});

test('una salida puede dejar el stock en exactamente 0', () => {
  const p = crearProducto(10);
  movimientos.registrar({ producto_id: p.id, tipo: 'salida', cantidad: 10 });
  assert.equal(productos.porId(p.id).cantidad, 0);
});

test('una salida mayor que el stock lanza 409 y NO cambia el stock', () => {
  const p = crearProducto(10);

  assert.throws(
    () => movimientos.registrar({ producto_id: p.id, tipo: 'salida', cantidad: 11 }),
    (e) => e instanceof AppError && e.status === 409 && e.message.includes('10')
  );

  assert.equal(productos.porId(p.id).cantidad, 10);
  assert.equal(movimientos.listar({ producto_id: p.id }).length, 0);
});

test('una cantidad no entera o negativa lanza 400', () => {
  const p = crearProducto();
  for (const cantidad of [0, -3, 2.5, 'x']) {
    assert.throws(
      () => movimientos.registrar({ producto_id: p.id, tipo: 'entrada', cantidad }),
      (e) => e.status === 400
    );
  }
});

test('un tipo distinto de entrada/salida lanza 400', () => {
  const p = crearProducto();
  assert.throws(
    () => movimientos.registrar({ producto_id: p.id, tipo: 'devolución', cantidad: 1 }),
    (e) => e.status === 400
  );
});

test('registrar sobre un producto inexistente lanza 404', () => {
  assert.throws(
    () => movimientos.registrar({ producto_id: 999, tipo: 'entrada', cantidad: 1 }),
    (e) => e.status === 404
  );
});

test('el filtro por tipo separa entradas de salidas', () => {
  const p = crearProducto(10);
  movimientos.registrar({ producto_id: p.id, tipo: 'entrada', cantidad: 5 });
  movimientos.registrar({ producto_id: p.id, tipo: 'salida', cantidad: 2 });

  assert.equal(movimientos.listar({ tipo: 'entrada' }).length, 1);
  assert.equal(movimientos.listar({ tipo: 'salida' }).length, 1);
  assert.equal(movimientos.listar().length, 2);
});
