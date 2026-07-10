# Feature: Reviews (Reseñas)

Segunda implementación del patrón **Module → Link → Workflow → API → Storefront**, calcada de `brand` pero sin admin UI (feature store-only, sin moderación todavía).

## Modelo de dominio

Entidad `review`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string (PK) | Generado por Medusa |
| `product_id` | text, indexado | `IDX_review_product_id` |
| `customer_id` | text | Autor (viene de `req.auth_context.actor_id`, no del body) |
| `rating` | number | 1–5 (validado en el schema Zod, no a nivel de columna) |
| `title` | text, nullable | Opcional |
| `body` | text | Requerido |

Archivo: `apps/backend/src/modules/review/models/review.ts`

Relación con productos: **un producto → muchas reseñas** (a diferencia de `brand`, donde es muchos productos → una marca — ver nota de cardinalidad abajo).

## Componentes

### 1. Módulo Review

| Archivo | Propósito |
|---------|-----------|
| `modules/review/index.ts` | Registro `REVIEW_MODULE = "review"` |
| `modules/review/service.ts` | `MedusaService({ Review })` — CRUD auto-generado |
| `modules/review/migrations/` | Schema DB, generado con `medusa db:generate` contra la BD real |

Registrado en `medusa-config.ts` junto a `brand`:

```typescript
modules: [
  { resolve: "./src/modules/brand" },
  { resolve: "./src/modules/review" },
]
```

### 2. Module link

`links/product-review.ts`:

- `ProductModule.linkable.product` (singular, **sin** `isList`)
- `ReviewModule.linkable.review` (`isList: true`)

**Cuidado con la cardinalidad**: en `brand` el `isList: true` va del lado producto (muchos productos comparten una marca); en `review` va al revés, del lado `review` (un producto tiene muchas reseñas). Copiar el link de `brand` sin invertir el `isList` produce en runtime `Entity 'Product' does not have property 'reviews'`.

### 3. Workflows

```
workflows/create-review.ts             → valida que el producto exista, crea la reseña y el link en el mismo workflow (createRemoteLinkStep de @medusajs/medusa/core-flows)
workflows/steps/create-review.ts       → createReviews + deleteReviews en compensación
workflows/steps/validate-product-exists.ts → step compartido con favorites; retrieveProduct(product_id) — lanza NOT_FOUND automático si no existe (ver docs/custom-features/favorites.md)
workflows/delete-review.ts             → findReviewStep (retrieve + chequeo de ownership) → dismiss del link → deleteReviewStep
workflows/steps/find-review.ts         → solo lectura; retrieveReview lanza NOT_FOUND si no existe; lanza NOT_ALLOWED si customer_id no coincide
workflows/steps/delete-review.ts       → deleteReviews + createReviews en compensación
```

Entrada de `create-review`: `{ product_id, customer_id, rating, title?, body }`. Un `product_id` que no corresponde a ningún producto real ahora se rechaza con 404 (`Product with id: X was not found`) antes de crear la reseña o el link — antes de esto no había ninguna validación y se podía crear una reseña + link huérfano apuntando a un producto inexistente.

No hay workflow de **update** todavía (ver Pendientes) — sí de **delete**, ver sección 4.

### 4. API Store

**`GET /store/reviews`**

- Query: `product_id` opcional + paginación estándar (`GetStoreReviewsParams`)
- Sin `product_id`: lista todas las reseñas (uso interno del summary sitewide, no pensado para UI paginada general)
- Implementación: `query.graph({ entity: "review", filters: { product_id }, ...req.queryConfig })`

**`POST /store/reviews`**

- Requiere cliente autenticado — middleware `authenticate("customer", ["session", "bearer"])`
- Body: `{ product_id, rating: 1-5, title?, body }` (Zod: `PostStoreCreateReview`)
- `customer_id` se toma de `req.auth_context.actor_id`, nunca del body
- Ejecuta `createReviewWorkflow`

**`GET /store/reviews/summary`**

- `product_id` **opcional**: con él agrega por producto (para el badge de rating en PDP); sin él agrega sitewide (para el stat "N reseñas" del panel de login) — misma ruta reutilizada en vez de duplicar la lógica de distribución
- Calculado en memoria sobre hasta 10.000 filas (`pagination: { take: 10000 }`), no es una agregación SQL
- Respuesta: `{ product_id, average, count, distribution: {1..5: n} }`

**`DELETE /store/reviews/:id`**

- Requiere cliente autenticado — middleware `authenticate("customer", ["session", "bearer"])`
- Path param es el `id` interno de la reseña (a diferencia de favorites, que usa `product_id` — una reseña no tiene constraint único por producto+cliente, así que `product_id` solo no identifica una fila)
- Ejecuta `deleteReviewWorkflow`; **no** es idempotente: 404 si la reseña no existe, 400 (`NOT_ALLOWED`) si existe pero pertenece a otro cliente — a diferencia de `deleteFavoriteWorkflow`, que no falla en ninguno de los dos casos
- El ownership check compara `review.customer_id` (de la fila) contra `req.auth_context.actor_id` (del token), nunca contra el body

Archivos: `api/store/reviews/route.ts`, `api/store/reviews/[id]/route.ts`, `api/store/reviews/summary/route.ts`, `api/store/reviews/validators.ts`, reglas en `api/middlewares.ts`.

No existe API admin (`/admin/reviews`) — sin ruta ni widget de moderación hoy.

### 5. Storefront

| Archivo | Rol |
|---------|-----|
| `lib/data/reviews.ts` | `listProductReviews`, `getProductReviewSummary`, `getSiteReviewSummary` (sin `product_id`), `createProductReview` |
| `modules/products/components/rodi-product-reviews/{index.tsx, review-form.tsx}` | Sección completa en PDP: resumen + distribución + lista + formulario (formulario solo visible con sesión) |
| `modules/products/templates/product-info/index.tsx` | Badge compacto de rating bajo el título del producto (oculto si `count === 0`) |
| `modules/products/templates/index.tsx` | Cablea `<RodiProductReviews>` antes de related products |
| `account/@login` (`login-template.tsx`, `rodi-auth-panel/index.tsx`) | Stat "N reseñas" del panel de login lee `getSiteReviewSummary()` en vez de un número hardcodeado; se oculta si `count === 0` |

## Extender Reviews

| Necesidad | Dónde actuar |
|-----------|--------------|
| Admin UI de moderación | Calcar `admin/routes/brands/` + `api/admin/reviews/` (patrón directamente reutilizable) |
| Editar reseña propia | Workflow update + ruta `POST /store/reviews/:id` con check de `customer_id` (delete ya existe, ver sección 4) |
| Evitar reseñas duplicadas por cliente/producto | Constraint o validación en `createReviewStep` antes de `createReviews` |
| Agregación por SQL en vez de en memoria | Reemplazar el loop de `summary/route.ts` si el volumen de reseñas crece mucho más allá de 10.000 por producto |

## Notas operativas

- **Los módulos y links nuevos no recargan en caliente**: registrar un módulo en `medusa-config.ts` o crear/editar un archivo en `links/` exige reiniciar `medusa develop` por completo (confirmado dos veces durante la implementación).
- Si aparece `Entity 'X' does not have property 'Y'` en logs de MikroORM, sospechar primero de la cardinalidad del link o de que el archivo no se recargó — no del modelo.

## Archivos (mapa rápido)

```
apps/backend/src/
├── modules/review/
├── links/product-review.ts
├── workflows/
│   ├── create-review.ts
│   ├── delete-review.ts
│   └── steps/
│       ├── create-review.ts
│       ├── find-review.ts
│       ├── delete-review.ts
│       └── validate-product-exists.ts   # compartido con favorites
├── api/store/reviews/
│   ├── route.ts             # GET, POST
│   ├── [id]/route.ts        # DELETE
│   ├── validators.ts
│   └── summary/route.ts     # GET agregado (por producto o sitewide)
└── api/middlewares.ts        # /store/reviews GET + POST + DELETE/:id (auth customer)

apps/storefront/src/
├── lib/data/reviews.ts
└── modules/products/components/rodi-product-reviews/
```

## Historial de implementación

Fase original: `.context/plans/2026-07-07/FASE-7-modulo-resenas.md` (incluye datos de prueba dejados en la BD y el bug de cardinalidad del link descubierto en vivo). Cambios posteriores a la fase inicial, si los hay, se registran en `.context/features/reviews.md`.
