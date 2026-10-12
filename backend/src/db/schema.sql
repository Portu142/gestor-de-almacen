-- schema.sql — esquema de la base de datos.
-- Es idempotente: se ejecuta en cada arranque y NO borra datos (sin DROP).
-- Para un esquema nuevo en blanco, bórrate el archivo data/almacen.db.
-- Diseñado para SQLite; al migrar a PostgreSQL solo hay que cambiar los tipos
-- (INTEGER → INTEGER, TEXT → TEXT/VARCHAR, datetime('now') → NOW()) en este archivo.

CREATE TABLE IF NOT EXISTS productos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       TEXT    NOT NULL,
  sku          TEXT    NOT NULL UNIQUE,
  categoria    TEXT    NOT NULL DEFAULT 'Sin categoría',
  cantidad     INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  precio_coste REAL    NOT NULL DEFAULT 0 CHECK (precio_coste >= 0),
  creado_en    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS movimientos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo        TEXT    NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  motivo      TEXT    NOT NULL DEFAULT '',
  fecha       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos(producto_id);
