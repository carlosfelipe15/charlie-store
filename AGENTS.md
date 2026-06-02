# Guía para agentes de IA — Charlie Store

Este archivo es el punto de entrada para agentes (Cursor, Copilot, etc.) que trabajan en este repositorio. Léelo antes de planificar o implementar cambios.

## Qué es este proyecto

**Charlie Store** (`charlie-store`) es un monorepo de comercio directo al consumidor (DTC) basado en:

| App | Paquete | Stack | Puerto dev |
|-----|---------|-------|------------|
| Backend + Admin | `@dtc/backend` | Medusa v2.15.2 | `9000` (API + admin en `/app`) |
| Storefront | `@dtc/storefront` | Next.js 15 (App Router) | `8000` |

Gestor de paquetes: **pnpm 10** (workspace). Orquestación: **Turbo**.

## Documentación humana

| Documento | Contenido |
|-----------|-----------|
| [docs/README.md](docs/README.md) | Índice de documentación |
| [docs/development.md](docs/development.md) | Setup, comandos, variables de entorno |
| [docs/architecture.md](docs/architecture.md) | Arquitectura y flujo de capas Medusa |
| [docs/backend.md](docs/backend.md) | Estructura del backend y convenciones |
| [docs/storefront.md](docs/storefront.md) | Estructura del storefront Next.js |
| [docs/custom-features/brands.md](docs/custom-features/brands.md) | Módulo Brand (implementación de referencia) |

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

## Funcionalidad custom actual

El único dominio de negocio extendido implementado es **Brands** (marcas):

- Módulo: `apps/backend/src/modules/brand/`
- Workflow: `apps/backend/src/workflows/create-brand.ts`
- API admin: `GET/POST /admin/brands`
- Link producto↔marca: `apps/backend/src/links/product-brand.ts`
- Hook al crear producto: `apps/backend/src/workflows/hooks/created-product.ts` (`brand_id` en `additional_data`)
- Admin: página `/app/brands`, widget en detalle de producto

Detalle completo: [docs/custom-features/brands.md](docs/custom-features/brands.md).

El storefront **aún no** expone marcas; cualquier trabajo ahí requiere el skill de storefront y posiblemente rutas store nuevas.

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
pnpm medusa user -e admin@test.com -p <password>
pnpm dev
```

## Restricciones para agentes

- **No** hagas commit salvo que el usuario lo pida explícitamente.
- **No** edites `node_modules/`, `apps/backend/.medusa/`, `apps/storefront/.next/`.
- **No** copies secretos de `.env` o `.env.local` a la documentación ni a commits.
- **No** modifiques `dtc-starter/` salvo petición explícita (copia de referencia del starter upstream).
- Mantén el **alcance mínimo**: no refactorices código no relacionado con la tarea.
- Tras cambios en modelos de módulo custom, recuerda migraciones (`pnpm medusa db:generate` en `apps/backend`).

## Verificación rápida

1. Backend: `http://localhost:9000/health` y admin `http://localhost:9000/app`
2. Storefront: `http://localhost:8000`
3. Brands: admin → menú **Brands**; crear producto con `brand_id` en additional data (vía API/admin flows documentados)

## Referencias externas

- [Medusa Docs](https://docs.medusajs.com)
- [Medusa JS SDK](https://docs.medusajs.com/resources/js-sdk)
