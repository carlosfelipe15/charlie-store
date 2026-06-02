# Backend (`@dtc/backend`)

Medusa v2 con admin embebido. Código fuente en `apps/backend/src/`.

## Configuración

- **Entrada Medusa**: `medusa-config.ts`
- **Módulos registrados**: array `modules[]` — actualmente incluye `./src/modules/brand`
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

SDK admin: `admin/lib/sdk.ts` — `baseUrl` relativo `/` en dev (proxy Vite).

### Module link

`links/product-brand.ts`: producto (lista) ↔ marca (uno). Permite campos `products.*` y `brand.*` en `query.graph`.

## API custom actual

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/admin/brands` | Lista paginada (`limit`, `offset`); fields default incluyen `products.*` |
| `POST` | `/admin/brands` | Body `{ name: string }` → workflow create-brand |
| — | `/admin/custom`, `/store/custom` | Rutas placeholder del starter |

## Hooks en workflows core

`workflows/hooks/created-product.ts` — suscrito a `createProductsWorkflow.hooks.productsCreated`:

- Lee `additional_data.brand_id`
- Valida que la marca exista
- Crea links producto–marca
- Compensación: `link.dismiss` en rollback

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
