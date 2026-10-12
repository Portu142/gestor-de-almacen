# Gestor de almacén de tienda

![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933?logo=nodedotjs&logoColor=white)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)
![Base de datos](https://img.shields.io/badge/base%20de%20datos-SQLite-003B57?logo=sqlite&logoColor=white)
![Tests](https://img.shields.io/badge/tests-16%20passing-brightgreen)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

Aplicación web para controlar el inventario de una tienda: qué productos hay, cuánto stock queda,
qué entra y sale, y avisar cuando toca reponer. Sustituye la hoja de cálculo de siempre.

## Capturas

| Resumen | Inventario | Movimientos |
|---|---|---|
| Valor del inventario, unidades y reposiciones pendientes | CRUD con buscador, filtros y estados de stock | Registro de entradas/salidas con historial |

> Las capturas se añaden al desplegar (ver «Despliegue»).

## Cómo ejecutarlo

Requisitos: [Node.js](https://nodejs.org) **22.5 o superior** (el backend usa el módulo nativo `node:sqlite`).

**Terminal 1 — backend** (puerto 3001):

```bash
cd backend
npm install
npm run seed     # solo la primera vez: crea datos de ejemplo
npm run dev
```

**Terminal 2 — frontend** (puerto 5173):

```bash
cd frontend
npm install
npm run dev
```

Abre <http://localhost:5173>.

> **Windows / PowerShell**: si `npm` da un error de «ejecución de scripts deshabilitada», usa `npm.cmd`
> en su lugar (es la política de ejecución de PowerShell).

## Funcionalidades (MVP)

- **CRUD de productos**: nombre, SKU (único), categoría, cantidad, stock mínimo y precio de coste.
- **Movimientos de stock**: entrada (recepción) y salida (venta/rotura), con fecha y motivo.
  El stock se ajusta en la misma transacción y nunca queda en negativo.
- **Buscador y filtros**: por nombre/SKU, por categoría y «bajo mínimo / agotados» (enlazables por URL).
- **Dashboard**: valor del inventario, unidades, reposiciones pendientes y valor por categoría.

## Arquitectura

Cada capa tiene una única responsabilidad y solo habla con la de al lado, lo que hace
sencillo crecer o migrar el proyecto.

```
.
├── backend/                  API REST (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── server.js         Abre el puerto (lado de despliegue)
│   │   ├── app.js            Construye Express (testable sin puerto)
│   │   ├── db/
│   │   │   ├── connection.js Único punto de acceso a la BD → migrar = cambiar este módulo
│   │   │   └── schema.sql    Esquema en SQL plano e idempotente (sin DROP)
│   │   ├── repositories/     SQL puro: leer/escribir tablas, sin reglas de negocio
│   │   ├── services/         Reglas de negocio (stock no negativo, validaciones, transacciones)
│   │   ├── routes/           HTTP fino: parsea la petición y llama al servicio
│   │   └── lib/errors.js     AppError con código HTTP + asyncHandler
│   ├── tests/                Tests de servicios con el runner nativo (npm test)
│   └── data/almacen.db       Base de datos (se crea sola; ignorada por git)
└── frontend/                 Interfaz (React + Vite, proxy /api → backend)
    └── src/
        ├── api/              Un archivo por recurso; client.js centraliza fetch/auth
        ├── hooks/useApi.js   Estados de carga y error reutilizables
        ├── components/       Piezas compartidas (raíl, campos, estados, formato)
        ├── features/         Una carpeta por pantalla: dashboard, productos, movimientos
        └── styles/           tokens.css (paleta y ritmo) + base/layout/components
```

**Flujo de una petición (backend):**
`routes` → `services` (valida y aplica reglas) → `repositories` (SQL) → SQLite.
Las rutas no tocan la base de datos y los servicios no saben Express: se pueden testear aislados.

### Tests

```bash
cd backend
npm test     # 16 tests: validaciones, SKU único, stock nunca negativo, filtros, 404/409
```

Corren contra una base de datos en memoria (`ALMACEN_DB=:memory:`), sin tocar la real.

## Migrar SQLite → PostgreSQL

1. Instala `pg` y crea un módulo de conexión equivalente a `backend/src/db/connection.js`.
2. Traduce `backend/src/db/schema.sql` (los tipos casi no cambian: `datetime('now')` → `NOW()`).
3. Los repositorios usan SQL crudo; si eliges un ORM (Prisma, Drizzle, Knex), solo cambian
   los archivos de `repositories/`. Services, rutas y frontend no se enteran.

## Añadir una funcionalidad nueva (ejemplo: proveedores)

1. **Backend**: tabla nueva en `schema.sql` → `repositories/proveedores.repo.js` →
   `services/proveedores.service.js` → ruta en `routes/index.js`.
2. **Frontend**: `api/proveedores.js` → pantalla en `features/proveedores/` → enlace en `components/Rail.jsx`.
3. **Tests**: `tests/proveedores.service.test.js`.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard` | Totales, bajo mínimo, últimos movimientos, valor por categoría |
| GET | `/api/productos?q=&categoria=&agotados=` | Listado con filtros |
| GET | `/api/productos/categorias` | Categorías distintas |
| GET | `/api/productos/:id` | Detalle |
| POST | `/api/productos` | Alta (SKU único) |
| PUT | `/api/productos/:id` | Edición |
| DELETE | `/api/productos/:id` | Baja (borra en cascada sus movimientos) |
| GET | `/api/movimientos?producto_id=&tipo=` | Historial |
| POST | `/api/movimientos` | `{ producto_id, tipo, cantidad, motivo }` |

Errores: `400` validación · `404` no existe · `409` conflicto (SKU duplicado, stock insuficiente) ·
`413` cuerpo demasiado grande. Todos en formato `{ "error": "mensaje" }`.

## Seguridad

- CORS restringido a orígenes configurados (`CORS_ORIGINS`).
- Consultas parametrizadas (sin inyección SQL) y salida escapada por React (sin XSS).
- Cabeceras: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store`.
- Límite de cuerpo de 200 kB y sin volcado de stack traces al cliente.

## Despliegue

- **Variables de entorno**: `PORT` (puerto del backend, por defecto 3001), `ALMACEN_DB` (ruta del SQLite),
  `CORS_ORIGINS` (orígenes permitidos separados por coma).
- **Frontend en producción**: `npm run build` genera `frontend/dist`; sirve esa carpeta con cualquier
  servidor estático y apunta `VITE_API_URL` a la URL de la API si no está en el mismo dominio.
- Los meta tags SEO y Open Graph están en `frontend/index.html` (ajusta `og:url` al dominio final).

## Roadmap (fase 2)

- Proveedores y pedidos de reposición.
- Varios almacenes o ubicaciones (pasillo/estante).
- Lectura de códigos de barras con la cámara del móvil.
- Usuarios con roles (admin / empleado) e histórico de «quién movió qué» + JWT.
- Informes exportables a CSV/Excel con **Python** (pandas).
- Migración a PostgreSQL.

## Licencia

MIT © 2026
