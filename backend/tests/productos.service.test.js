// tests/productos.service.test.js
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { limpiar } from './helpers.js';

const productos = await import('../src/services/productos.service.js');
const { AppError } = await import('../src/lib/errors.js');

const VALIDO = {
  nombre: 'Café molido 250 g',
  sku: 'CAF-250',
  categoria: 'Alimentación',
  cantidad: 9,
  stock_minimo: 12,
  precio_coste: 3.95,
};

beforeEach(limpiar);

test('crear un producto válido devuelve el registro normalizado', () => {
  const creado = productos.crear({ ...VALIDO, categoria: '  ', nombre: '  Café molido  ' });

  assert.equal(creado.id, 1);
  assert.equal(creado.nombre, 'Café molido');
  assert.equal(creado.categoria, 'Sin categoría');
  assert.equal(creado.cantidad, 9);
});

test('crear sin nombre ni SKU lanza AppError 400', () => {
  assert.throws(
    () => productos.crear({ ...VALIDO, nombre: '  ', sku: '' }),
    (e) => e instanceof AppError && e.status === 400 && /nombre|SKU/.test(e.message)
  );
});

test('crear con cantidad negativa lanza AppError 400', () => {
  assert.throws(
    () => productos.crear({ ...VALIDO, cantidad: -1 }),
    (e) => e instanceof AppError && e.status === 400
  );
});

test('el SKU debe ser único: el duplicado lanza AppError 409', () => {
  productos.crear(VALIDO);
  assert.throws(
    () => productos.crear({ ...VALIDO, nombre: 'Otro' }),
    (e) => e instanceof AppError && e.status === 409 && e.message.includes('CAF-250')
  );
});

test('actualizar un producto inexistente lanza 404', () => {
  assert.throws(
    () => productos.actualizar(999, VALIDO),
    (e) => e instanceof AppError && e.status === 404
  );
});

test('borrar elimina el producto; borrar dos veces lanza 404', () => {
  const creado = productos.crear(VALIDO);
  assert.doesNotThrow(() => productos.borrar(creado.id));
  assert.throws(() => productos.borrar(creado.id), (e) => e.status === 404);
});

test('el filtro de agotados incluye solo productos en o bajo el mínimo', () => {
  productos.crear({ ...VALIDO, sku: 'A-1', cantidad: 0, stock_minimo: 2 });
  productos.crear({ ...VALIDO, sku: 'A-2', cantidad: 5, stock_minimo: 2 });

  const agotados = productos.listar({ agotados: true });
  assert.deepEqual(
    agotados.map((p) => p.sku),
    ['A-1']
  );
});

test('la búsqueda por nombre o SKU es insensible a mayúsculas', () => {
  productos.crear(VALIDO);
  assert.equal(productos.listar({ q: 'café' }).length, 1);
  assert.equal(productos.listar({ q: 'caf-2' }).length, 1);
  assert.equal(productos.listar({ q: 'no-existe' }).length, 0);
});
