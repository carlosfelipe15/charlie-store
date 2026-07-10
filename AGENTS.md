# Guía para agentes de IA — Charlie Store

Este archivo es el punto de entrada para agentes (Cursor, Copilot, etc.) que trabajan en este repositorio. Léelo antes de planificar o implementar cambios.

## Qué es este proyecto

**Charlie Store** (`charlie-store`) es un monorepo de comercio directo al consumidor (DTC) basado en:

| App | Paquete | Stack | Puerto dev |
|-----|---------|-------|------------|
| Backend + Admin | `@dtc/backend` | Medusa v2.15.2 | `9000` (API + admin en `/app`) |
| Storefront | `@dtc/storefront` | Next.js 15 (App Router) | `8000` |

Gestor de paquetes: **pnpm 10** (workspace). Orquestación: **Turbo**.

## Documentación humana (referencia viva — debe reflejar el código actual)

| Documento | Contenido |
|-----------|-----------|
| [docs/README.md](docs/README.md) | Índice de documentación |
| [docs/development.md](docs/development.md) | Setup, comandos, variables de entorno |
| [docs/architecture.md](docs/architecture.md) | Arquitectura y flujo de capas Medusa |
| [docs/backend.md](docs/backend.md) | Estructura del backend y convenciones |
| [docs/storefront.md](docs/storefront.md) | Estructura del storefront Next.js |
| [docs/custom-features/brands.md](docs/custom-features/brands.md) | Módulo Brand (implementación de referencia) |
| [docs/custom-features/reviews.md](docs/custom-features/reviews.md) | Módulo Review |

Si `docs/` contradice el código, confía en el código y corrige el doc — no improvises sobre un doc desactualizado.

## Diseño de referencia (`apps/storefront/design-reference/`)

`apps/storefront/design-reference/ecommerce-test/` contiene el diseño de referencia del storefront ("Rodi Mercado"), como mockups en JSX (no Figma, no imágenes) — es la fuente de verdad visual/UX al implementar o auditar UI de storefront:

| Archivo | Contenido |
|---------|-----------|
| `data.jsx` | Datos mock de referencia (ej. categorías) |
| `home.jsx` | Secciones de la home (incluye "compra por categoría" y filas curadas) |
| `pages.jsx` | Páginas de listado/categoría y producto |
| `pdp.jsx` | Página de detalle de producto |
| `shared.jsx`, `tokens.jsx` | Componentes y design tokens compartidos |
| `mobile.jsx`, `browser-window.jsx`, `ios-frame.jsx`, `design-canvas.jsx` | Marcos/canvas para previsualizar el diseño en distintos dispositivos |
| `index.html`, `Rodi Mercado - Diseño.html` | Entrypoints para visualizar el mockup en el navegador |

Al auditar o implementar cualquier área del storefront, compara siempre contra estos archivos antes de asumir el diseño esperado. Ver también `.context/reports/design-review-2026-07-05.md` para gaps ya detectados entre este diseño y la implementación.

## Memoria de trabajo (`.context/`)

No es documentación de referencia, es el registro de trabajo del agente entre sesiones:

| Ruta | Contenido |
|------|-----------|
| `.context/index.md` | Punto de entrada: fase actual, último feature shippeado |
| `.context/backlog.md` | Bugs y deuda técnica activos (dinámico, actualizar al detectar/resolver) |
| `.context/plans/<fecha>/FASE-N-*.md` | Planes de fase ya ejecutados, histórico |
| `.context/features/<feature>.md` | Changelog + decisiones de cambios a una feature **posteriores** a su fase inicial (ver `features/brands.md`) |
| `.context/reports/` | Auditorías puntuales archivadas — no confiar en ellas para el estado actual |

## Skills obligatorios (`.agents/skills/`)

Antes de implementar, **carga y sigue** el skill correspondiente. No improvises patrones Medusa sin leerlos.

| Tarea | Skill |
|-------|--------|
| Backend (módulos, workflows, API, links) | `.agents/skills/building-with-medusa/SKILL.md` + referencias en `reference/` |
| Admin (páginas, widgets, tablas) | `.agents/skills/building-admin-dashboard-customizations/SKILL.md` |
| Storefront (SDK, rutas custom) | `.agents/skills/building-storefronts/SKILL.md` |
| Aprendizaje guiado Medusa | `.agents/skills/learning-medusa/SKILL.md` |

Para cada skill, carga **1–2 archivos de referencia** del subdirectorio `reference/` o `references/` según lo que vayas a tocar (p. ej. `api-routes.md`, `workflows.md`, `data-loading.md`).

## Reglas de arquitectura Medusa (CRÍTICO)

Siempre respeta este flujo; **nunca saltes capas**:

```
Módulo (modelo + servicio CRUD)
  → Workflow (mutaciones + rollback)
    → API Route (HTTP + validación)
      → Admin / Storefront (SDK)
```

- **Mutaciones**: solo vía **workflows**, nunca llamar servicios de módulo directamente desde rutas.
- **HTTP**: solo `GET`, `POST`, `DELETE` (no `PUT`/`PATCH`).
- **Consultas cross-módulo**: `query.graph()`; filtros entre módulos enlazados: `query.index()` cuando aplique.
- **Aislamiento**: enlazar entidades con **module links**, no importar servicios de otro módulo.
- **Lógica de negocio**: en pasos de workflow, no en rutas.

### Índice de búsqueda cross-módulo (`@medusajs/index`)

Desde Fase 10, el backend tiene el módulo `@medusajs/index` (Index Engine) registrado y `MEDUSA_FF_INDEX_ENGINE=true` en `.env` — necesario para que `query.index()` funcione (filtrar por un campo de un módulo *enlazado*, algo que `query.graph()` no soporta). Un link solo es filtrable por Index Engine si su lado enlazado declara `filterable: [...]` en `defineLink` (ver `links/product-brand.ts`).

**Advertencia importante si vas a usar `query.index()` en una ruta nueva**: en Medusa 2.15.2, activar este flag rompe el filtrado por `category_id`/`tag_id` en la ruta core `/store/products` (bug real de Medusa, no de este repo — el dispatch interno de core chequea los nombres de campo equivocados). Por eso `apps/backend/src/api/store/products-list/route.ts` es una ruta **nueva** (no un override de `/store/products`) que solo usa `query.index()` para resolver ids en un paso previo liviano, y siempre hace el fetch final vía `query.graph()` (conteos exactos, sin tocar el bug de core). Detalle completo, incluyendo por qué overridear una ruta core no funciona (los middlewares de core no se reemplazan, solo se concatenan), en [`.context/plans/2026-07-08/FASE-10-filtro-marca-index-module.md`](.context/plans/2026-07-08/FASE-10-filtro-marca-index-module.md).

## Funcionalidad custom actual

Tres dominios de negocio extendidos, todos siguiendo el patrón Module → Link → Workflow → API:

**Brands** (marcas) — CRUD completo:
- Módulo: `apps/backend/src/modules/brand/`
- Workflows: `create-brand.ts`, `update-brand.ts`, `delete-brand.ts` (delete limpia links huérfanos con `removeRemoteLinkStep`)
- API admin: `GET/POST /admin/brands`, `POST/DELETE /admin/brands/:id`
- API store: `GET /store/brands`
- Link producto↔marca: `apps/backend/src/links/product-brand.ts` (muchos productos → una marca)
- Hooks: `workflows/hooks/created-product.ts` y `updated-product.ts` (`brand_id` en `additional_data`, en creación y edición de producto)
- Admin: página `/app/brands` (CRUD), widget editable en detalle de producto
- Storefront: ya consumido (`lib/data/brands.ts`, franja de marcas en home, product card)

Detalle completo: [docs/custom-features/brands.md](docs/custom-features/brands.md).

**Reviews** (reseñas) — lectura/creación/borrado propio, sin admin UI todavía:
- Módulo: `apps/backend/src/modules/review/`
- Workflows: `create-review.ts` (valida que el producto exista, crea reseña + link en un paso), `delete-review.ts` (solo el autor puede borrar su reseña, ver-only ownership check en `find-review.ts`; **no** idempotente, a diferencia de favorites)
- API store: `GET/POST /store/reviews`, `DELETE /store/reviews/:id`, `GET /store/reviews/summary` (promedio/conteo/distribución, por producto o sitewide)
- Link producto↔reseña: `apps/backend/src/links/product-review.ts` (**cardinalidad invertida** respecto a brand: un producto → muchas reseñas, `isList: true` va en el lado `review`)
- Storefront: sección de reseñas en PDP, badge de rating, stat sitewide en login (`lib/data/reviews.ts`)

Detalle completo: [docs/custom-features/reviews.md](docs/custom-features/reviews.md).

**Favorites** (favoritos/wishlist) — toggle store-only, sin admin UI:
- Módulo: `apps/backend/src/modules/favorite/`, con **constraint único** `(product_id, customer_id)` en el modelo (a diferencia de `review`, que no tiene uno)
- Workflows: `create-favorite.ts`/`delete-favorite.ts`, ambos **idempotentes** (crear sobre uno existente devuelve el mismo registro; borrar uno inexistente no falla) usando un `find-favorite.ts` step compartido + `when(...).then(...)`; `create-favorite.ts` valida primero que el `product_id` exista con `validate-product-exists.ts` (step compartido con `review`, 404 si no existe)
- API store: `GET/POST /store/favorites`, `DELETE /store/favorites/:product_id` — **las tres rutas requieren cliente autenticado** (a diferencia de reviews, donde el GET es público)
- Link producto↔favorito: `apps/backend/src/links/product-favorite.ts` (misma cardinalidad que `review`: un producto → muchos favoritos, `isList: true` en el lado `favorite`)
- `customer_id` es una columna de texto plana (mismo patrón que `review.customer_id`), no un link formal a `CustomerModule` — decisión deliberada, ver `docs/custom-features/favorites.md`
- Storefront: toggle en product card y galería de PDP, ícono con badge en el header, página `/account/favorites` (`lib/data/favorites.ts`)

Detalle completo: [docs/custom-features/favorites.md](docs/custom-features/favorites.md).

**Nota**: al registrar un módulo nuevo en `medusa-config.ts` o crear/editar un archivo en `src/links/`, reiniciar `medusa develop` completo — no recarga en caliente.

## Dónde colocar código nuevo

| Qué | Ruta |
|-----|------|
| Modelo / servicio de dominio | `apps/backend/src/modules/<nombre>/` |
| Enlace entre módulos | `apps/backend/src/links/` |
| Workflow + steps | `apps/backend/src/workflows/` |
| API admin | `apps/backend/src/api/admin/<recurso>/route.ts` |
| API store | `apps/backend/src/api/store/<recurso>/route.ts` |
| Validación / middlewares | `apps/backend/src/api/middlewares.ts` |
| Página admin | `apps/backend/src/admin/routes/<ruta>/page.tsx` |
| Widget admin | `apps/backend/src/admin/widgets/` |
| Registrar módulo | `apps/backend/medusa-config.ts` → `modules[]` |
| Datos en storefront | `apps/storefront/src/lib/data/` |
| UI storefront | `apps/storefront/src/modules/` |
| Rutas Next.js | `apps/storefront/src/app/[countryCode]/` |

## Comandos frecuentes

Desde la raíz del monorepo:

```bash
pnpm install
pnpm dev                    # backend + storefront
pnpm backend:dev            # solo @dtc/backend
pnpm storefront:dev         # solo @dtc/storefront
```

Backend (desde `apps/backend`):

```bash
pnpm medusa db:migrate
pnpm medusa db:generate          # tras editar un modelo en src/modules/<name>/models/
pnpm medusa user -e admin@test.com -p <password>
pnpm dev

# Tests (cada uno es un TEST_TYPE distinto, ver jest.config.js)
pnpm test:unit                     # **/src/**/__tests__/**/*.unit.spec.ts
pnpm test:integration:modules      # **/src/modules/*/__tests__/**/*.ts
pnpm test:integration:http         # **/integration-tests/http/*.spec.ts

# Un solo archivo de test (cualquier suite):
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand path/to/file.unit.spec.ts
```

## Restricciones para agentes

- **No** hagas commit salvo que el usuario lo pida explícitamente.
- **No** edites `node_modules/`, `apps/backend/.medusa/`, `apps/storefront/.next/`.
- **No** copies secretos de `.env` o `.env.local` a la documentación ni a commits.
- **No** modifiques `dtc-starter/` salvo petición explícita (copia de referencia del starter upstream).
- Mantén el **alcance mínimo**: no refactorices código no relacionado con la tarea.
- Tras cambios en modelos de módulo custom, recuerda migraciones (`pnpm medusa db:generate` en `apps/backend`).

## Convenciones para Git & Commits 

- **Idioma:** Todos los mensajes de commit, nombres de ramas y títulos de Pull Requests deben escribirse obligatoriamente en **inglés**.
- **Especificación:** Sigue de forma estricta el estándar **Conventional Commits 1.0.0**.

## Verificación rápida

1. Backend: `http://localhost:9000/health` y admin `http://localhost:9000/app`
2. Storefront: `http://localhost:8000`
3. Brands: admin → menú **Brands**; crear producto con `brand_id` en additional data (vía API/admin flows documentados)

## Referencias externas

- [Medusa Docs](https://docs.medusajs.com)
- [Medusa JS SDK](https://docs.medusajs.com/resources/js-sdk)
