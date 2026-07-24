# Feature: Favorites (Favoritos)

Tercera implementación del patrón **Module → Link → Workflow → API → Storefront**, calcada de `review` (no de `brand`) por cardinalidad, con dos diferencias: constraint único desde el inicio y workflow de delete (idempotente en ambos sentidos).

## Modelo de dominio

Entidad `favorite`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string (PK) | Generado por Medusa |
| `product_id` | text, indexado | `IDX_favorite_product_id` |
| `customer_id` | text | Dueño del favorito (viene de `req.auth_context.actor_id`, nunca del body) |

Constraint único compuesto `(product_id, customer_id)` — evita favoritos duplicados del mismo cliente sobre el mismo producto (a diferencia de `review`, que dejó este gap como deuda pendiente).

Archivo: `apps/backend/src/modules/favorite/models/favorite.ts`

Relación con productos: **un producto → muchos favoritos** (misma cardinalidad que `review`; a diferencia de `brand`, donde es muchos productos → una marca).

## Componentes

### 1. Módulo Favorite

| Archivo | Propósito |
|---------|-----------|
| `modules/favorite/index.ts` | Registro `FAVORITE_MODULE = "favorite"` |
| `modules/favorite/service.ts` | `MedusaService({ Favorite })` — CRUD auto-generado |
| `modules/favorite/migrations/` | Schema DB, generado con `medusa db:generate` contra la BD real |

Registrado en `medusa-config.ts` junto a `brand`/`review`:

```typescript
modules: [
  { resolve: "./src/modules/brand" },
  { resolve: "./src/modules/review" },
  { resolve: "./src/modules/favorite" },
]
```

### 2. Module link

`links/product-favorite.ts`:

- `ProductModule.linkable.product` (singular, **sin** `isList`)
- `FavoriteModule.linkable.favorite` (`isList: true`)

Misma cardinalidad que `product-review.ts` — **no** la de `product-brand.ts` (ver la nota de cardinalidad en `docs/custom-features/reviews.md`).

### 3. Workflows

```
workflows/steps/validate-product-exists.ts → step compartido con review; retrieveProduct(product_id) — lanza NOT_FOUND automático si no existe
workflows/steps/find-favorite.ts     → busca un favorito por (product_id, customer_id); sin compensación (solo lectura)
workflows/create-favorite.ts         → validateProductExistsStep + findFavoriteStep + when(...).then(...): solo crea+linkea si no existía ya
workflows/steps/create-favorite.ts   → createFavorites + deleteFavorites en compensación
workflows/delete-favorite.ts         → findFavoriteStep + when(...).then(...): dismiss del link primero, luego borra la fila; no-op si no existía
workflows/steps/delete-favorite.ts   → deleteFavorites + createFavorites en compensación
```

`create-favorite` valida el `product_id` **antes** de buscar/crear: un `product_id` que no corresponde a ningún producto real se rechaza con 404 (`Product with id: X was not found`), en vez de crear un favorito + link huérfano apuntando a un producto inexistente (comportamiento original, sin validar).

Ambos workflows siguen siendo **idempotentes** una vez pasada la validación de producto: crear sobre un favorito ya existente devuelve el mismo registro sin duplicar; borrar uno inexistente no falla (a diferencia de `review`, donde delete sí es estricto — ver `docs/custom-features/reviews.md`).

### 4. API Store

Todas las rutas requieren cliente autenticado — `authenticate("customer", ["session", "bearer"])`. A diferencia de `review` (donde el `GET` es público), favoritos no tiene caso de uso anónimo.

**`GET /store/favorites`**

- Lista los favoritos del cliente autenticado (`customer_id` siempre de `req.auth_context`, nunca de query params)
- `query.graph({ entity: "favorite", filters: { customer_id }, ...req.queryConfig })`
- Excluye del resultado (y del `count`) los favoritos cuyo producto ya no está `published` (despublicado o borrado) — la fila de favorito se conserva (reaparece si el producto se republica), pero no cuenta como "N favoritos" ni aparece en la lista. Como `query.graph()` no puede filtrar `favorite` por un campo del módulo linkeado (`product.status`), esto es una **segunda query** (`query.graph` sobre `product`, `fields: ["id", "status"]`) + filtro en memoria — ver `api/store/favorites/route.ts`

**`POST /store/favorites`**

- Body: `{ product_id }` (Zod: `PostStoreCreateFavorite`)
- Ejecuta `createFavoriteWorkflow`; idempotente (ver arriba)

**`DELETE /store/favorites/:product_id`**

- Path param es el `product_id`, no el `id` interno del favorito — el storefront siempre tiene el primero a mano
- Ejecuta `deleteFavoriteWorkflow`; idempotente (no-op si no existía)

Archivos: `api/store/favorites/route.ts`, `api/store/favorites/[product_id]/route.ts`, `api/store/favorites/validators.ts`, reglas en `api/middlewares.ts`.

No existe API admin — sin caso de uso de moderación claro para esta feature.

### 5. Storefront

| Archivo | Rol |
|---------|-----|
| `lib/data/favorites.ts` | `listCustomerFavorites`, `getFavoritedProductIds` (Set de product_id, evita N+1 en grillas), `addFavorite`, `removeFavorite` |
| `modules/layout/components/rodi-favorites-button/index.tsx` | Ícono + badge en el header (Server Component, calco de `rodi-account-button`) |
| `modules/products/components/rodi-product-card/index.tsx` | Toggle de corazón en la card (esquina opuesta al badge de oferta) |
| `modules/products/components/rodi-image-gallery/index.tsx` | Toggle de corazón sobre la imagen principal de la PDP |
| `modules/account/components/favorites-list/index.tsx` + `app/.../account/@dashboard/favorites/page.tsx` | Página `/account/favorites` |
| `modules/account/components/rodi-account-nav/index.tsx`, `modules/layout/templates/footer/index.tsx` | Entradas de navegación |

Estado no autenticado: el toggle intenta la mutación igual; `addFavorite`/`removeFavorite` devuelven `{success: false, error: "Inicia sesión..."}` sin necesidad de un prop `isLoggedIn` separado, y el componente muestra ese error en un toast.

## Extender Favoritos

| Necesidad | Dónde actuar |
|-----------|--------------|
| Toggle en las secciones del home (`rodi-flash-sale`, `rodi-curated-row`) | `ProductPreview` ya acepta `isFavorited` — solo falta pasar `getFavoritedProductIds()` en esos call sites |
| "Mover a favoritos" desde el carrito | Nuevo call site de `addFavorite`/`removeFavorite` en `modules/cart/components/` |
| Admin UI | No hay patrón previsto — evaluar si hace falta antes de construir |

## Notas operativas

- **Los módulos y links nuevos no recargan en caliente** — mismo comportamiento ya documentado para `brand`/`review`: registrar un módulo en `medusa-config.ts` o crear/editar un archivo en `links/` exige reiniciar `medusa develop` por completo.
- `RodiIconHeart` (`modules/common/icons/rodi/index.tsx`) no soportaba la prop `filled` antes de este feature — se extendió siguiendo el mismo patrón que `RodiIconStar`.

## Archivos (mapa rápido)

```
apps/backend/src/
├── modules/favorite/
├── links/product-favorite.ts
├── workflows/
│   ├── create-favorite.ts
│   ├── delete-favorite.ts
│   └── steps/
│       ├── find-favorite.ts
│       ├── create-favorite.ts
│       ├── delete-favorite.ts
│       └── validate-product-exists.ts   # compartido con review
├── api/store/favorites/
│   ├── route.ts               # GET, POST
│   ├── [product_id]/route.ts  # DELETE
│   └── validators.ts
└── api/middlewares.ts          # /store/favorites GET/POST/DELETE (auth customer)

apps/storefront/src/
├── lib/data/favorites.ts
├── modules/layout/components/rodi-favorites-button/
├── modules/account/components/favorites-list/
└── app/[countryCode]/(main)/account/@dashboard/favorites/page.tsx
```

## Historial de implementación

Fase original: `.context/plans/2026-07-08/FASE-9-favoritos.md` (incluye las decisiones de cardinalidad, forma REST del DELETE, y verificación end-to-end realizada). Cambios posteriores a la fase inicial, si los hay, se registran en `.context/features/favorites.md`.
