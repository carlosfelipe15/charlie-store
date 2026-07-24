# Backend (`@dtc/backend`)

Medusa v2 con admin embebido. Código fuente en `apps/backend/src/`.

## Configuración

- **Entrada Medusa**: `medusa-config.ts`
- **Módulos registrados**: array `modules[]` — actualmente incluye `./src/modules/brand`, `./src/modules/review`, `./src/modules/favorite`, `./src/modules/zone` y `@medusajs/index` (Index Engine, ver `docs/architecture.md`)
- **Env**: `apps/backend/.env` (plantilla: `.env.template`)

## Árbol de directorios relevante

```
src/
├── admin/                 # UI del dashboard (Vite + React)
│   ├── lib/sdk.ts         # Medusa JS SDK (sesión admin)
│   ├── routes/            # Páginas custom (file-based routing)
│   └── widgets/           # Widgets en zonas del admin core
├── api/
│   ├── admin/             # Rutas /admin/*
│   ├── store/             # Rutas /store/*
│   └── middlewares.ts     # Validación query/body por ruta
├── links/                 # Module links entre entidades
├── modules/               # Módulos custom de dominio
├── workflows/             # Workflows y steps
│   └── hooks/             # Hooks en workflows del core
├── subscribers/           # Event subscribers (vacío / README)
├── jobs/                  # Scheduled jobs (vacío / README)
└── migration-scripts/     # Seeds y scripts de migración de datos
```

Cada carpeta con README propio describe convenciones Medusa por defecto (`src/api/README.md`, etc.).

## Patrones por tipo de archivo

### Módulo (`src/modules/<name>/`)

```
modules/brand/
├── index.ts           # Module(BRAND_MODULE, { service })
├── service.ts         # MedusaService({ Brand })
├── models/brand.ts    # model.define("brand", { ... })
└── migrations/        # Generadas con medusa db:generate
```

Constante de registro: `BRAND_MODULE = "brand"`. Resolver en runtime: `container.resolve(BRAND_MODULE)`.

### Workflow

- Definición: `workflows/create-brand.ts`
- Step con compensación: `workflows/steps/create-brand.ts`
- Ejecutar desde ruta: `createBrandWorkflow(req.scope).run({ input })`

### API route admin

Ruta: `api/admin/brands/route.ts` → expone `GET` y `POST` en `/admin/brands`.

Exportar handlers nombrados según método HTTP (`GET`, `POST`, `DELETE`).

### Middlewares

Centralizados en `api/middlewares.ts`:

- `validateAndTransformBody` para POST
- `validateAndTransformQuery` para GET listados (con `fields` por defecto)
- `additionalDataValidator` en rutas core (ej. `brand_id` en `POST /admin/products`)

### Admin UI

| Tipo | Ubicación | Config |
|------|-----------|--------|
| Página | `admin/routes/brands/page.tsx` | `defineRouteConfig({ label, icon })` |
| Widget | `admin/widgets/product-brand.tsx` | `defineWidgetConfig({ zone })` |
| Widget | `admin/widgets/product-zones.tsx` | Zona `product.details.after` — asignación producto↔municipios (ver [custom-features/zones.md](./custom-features/zones.md)) |

SDK admin: `admin/lib/sdk.ts` — `baseUrl` relativo `/` en dev (proxy Vite).

### Module link

- `links/product-brand.ts`: producto (lista) ↔ marca (uno). Permite campos `products.*` y `brand.*` en `query.graph`; único link `filterable` (Index Engine).
- `links/product-review.ts`: producto (uno) ↔ reseña (lista) — cardinalidad invertida respecto a brand, ver [custom-features/reviews.md](./custom-features/reviews.md#2-module-link).
- `links/product-favorite.ts`: producto (uno) ↔ favorito (lista) — misma cardinalidad que `product-review.ts`, ver [custom-features/favorites.md](./custom-features/favorites.md).
- `links/product-municipality.ts`: producto (lista) ↔ municipio (lista) — primer link N–M del repo (`isList: true` en ambos lados), deliberadamente **no** `filterable`, ver [custom-features/zones.md](./custom-features/zones.md).

## API custom actual

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/admin/brands` | Lista paginada (`limit`, `offset`); fields default incluyen `products.*` |
| `POST` | `/admin/brands` | Body `{ name: string }` → workflow create-brand |
| `POST` | `/admin/brands/:id` | Body `{ name: string }` → workflow update-brand |
| `DELETE` | `/admin/brands/:id` | Workflow delete-brand (limpia links product↔brand antes de borrar) |
| `GET` | `/store/brands` | Listado público de solo lectura |
| `GET` | `/store/reviews` | Lista por `product_id` (opcional), paginado |
| `POST` | `/store/reviews` | Requiere cliente autenticado; crea reseña + link vía workflow create-review |
| `DELETE` | `/store/reviews/:id` | Solo el autor puede borrar su propia reseña |
| `GET` | `/store/reviews/summary` | Agregado (promedio, conteo, distribución 1-5★); `product_id` opcional (sitewide si se omite) |
| `GET` | `/store/favorites` | Requiere cliente autenticado; favoritos del cliente, excluye productos no publicados |
| `POST` | `/store/favorites` | Requiere cliente autenticado; body `{ product_id }`, idempotente |
| `DELETE` | `/store/favorites/:product_id` | Requiere cliente autenticado; idempotente |
| `GET` | `/store/zones` | Listado público de provincias/municipios activos |
| `POST` | `/store/zones/eligibility-check` | Público; body `{ zone_id, product_ids }` → `{ ineligible_product_ids }` |
| `GET` | `/admin/zones` | Espejo admin de `/store/zones` |
| `GET` | `/admin/products/:id/zones` | `{ municipality_ids }` asignados al producto |
| `POST` | `/admin/products/:id/zones` | Reconciliación completa de links producto↔municipio |
| — | `zone_id`, `brand_id`, `tag_id`, `rating_gte`, `on_sale` | Filtros combinables en `GET /store/products-list` (no rutas propias) |

Detalle completo de cada feature: [custom-features/brands.md](./custom-features/brands.md), [custom-features/reviews.md](./custom-features/reviews.md), [custom-features/favorites.md](./custom-features/favorites.md), [custom-features/zones.md](./custom-features/zones.md).

## Hooks en workflows core

- `workflows/hooks/created-product.ts` — suscrito a `createProductsWorkflow.hooks.productsCreated`: lee `additional_data.brand_id`, valida que la marca exista, crea links producto–marca; compensación `link.dismiss` en rollback.
- `workflows/hooks/updated-product.ts` — suscrito a `updateProductsWorkflow.hooks.productsUpdated`: reasigna o desvincula `brand_id` en productos ya existentes (`undefined` no toca nada, id reasigna, `null` desvincula).

## Scripts npm

| Script | Comando |
|--------|---------|
| `dev` | `medusa develop` |
| `build` | `medusa build` |
| `start` | `medusa start` |
| `test:*` | Jest (unit / integration) |

## CLI Medusa útil

Ejecutar desde `apps/backend`:

```bash
pnpm medusa db:migrate
pnpm medusa db:generate
pnpm medusa user -e email -p password
pnpm medusa exec ./src/scripts/<script>.ts
```

## Añadir un nuevo recurso (checklist)

1. Crear módulo en `src/modules/<recurso>/` + registrar en `medusa-config.ts`
2. Generar y aplicar migraciones
3. Crear workflow + steps para mutaciones
4. Crear `src/api/admin/<recurso>/route.ts` + validators
5. Registrar middlewares en `middlewares.ts`
6. (Opcional) links, hooks, página/widget admin
7. (Opcional) rutas store + integración storefront

Ver [custom-features/brands.md](./custom-features/brands.md) como implementación completa de referencia.
