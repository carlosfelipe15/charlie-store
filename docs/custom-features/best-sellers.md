# Feature: Best Sellers ("Más vendidos")

Deliberadamente diseñado en **3 capas independientes y reutilizables**, no como un cálculo ad-hoc dentro del endpoint del PLP: **módulo + link** (dato persistido, consultable por cualquiera), **helper de ranking puro** (lógica, no atada a una request HTTP) y **job de recomputo** (mantiene el dato fresco). El sort del PLP es solo un consumidor más de esas 3 capas — cualquier feature futura (sección de home, widget de admin, badge de PDP) reutiliza el mismo helper sin reimplementar nada.

## Modelo de dominio

Entidad `product_sales_count`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string (PK) | Generado por Medusa |
| `product_id` | text, único | `IDX_product_sales_count_product_id` — a lo sumo una fila por producto |
| `units_sold` | number, default 0 | `SUM(quantity)` de todas las órdenes no canceladas del producto |
| `last_calculated_at` | dateTime, nullable | Timestamp del último recompute — permite auditar staleness |

Archivo: `apps/backend/src/modules/product-sales-count/models/product-sales-count.ts`

Relación con productos: **1:1** — cada producto tiene como máximo una fila de conteo. A diferencia de `brand` (muchos productos → una marca) o `review`/`favorite`/`zone` (un producto → muchas filas), ningún lado del link lleva `isList: true`.

## Decisiones de negocio

- Productos sin ventas: se **incluyen al final** del ranking (no se excluyen del PLP) — cuentan como `units_sold: 0`.
- Métrica: **unidades vendidas** (`SUM(quantity)`), no cantidad de órdenes distintas.
- Qué cuenta como venta: **cualquier orden con `status != canceled`** (no exige `payment_status: captured`). En Medusa v2 una orden real de checkout queda en `status: "pending"` hasta que se cumple fulfillment — **nunca** `"completed"` — así que filtrar por `status === "completed"` contaría cero ventas reales.
- Sort por defecto del PLP: se **mantiene `created_at`** — "Más vendidos" es una opción nueva del selector, no reemplaza el default.
- Recompute **completo** cada corrida (no incremental): un producto cuya única orden se cancela después de haber sido contado se autocorrige solo en la próxima corrida (se resetea a `units_sold: 0`), en vez de quedar con un conteo stale para siempre.

## Componentes

### 1. Módulo ProductSalesCount

| Archivo | Propósito |
|---------|-----------|
| `modules/product-sales-count/index.ts` | Registro `PRODUCT_SALES_COUNT_MODULE = "productSalesCount"` |
| `modules/product-sales-count/service.ts` | `MedusaService({ ProductSalesCount })` — CRUD auto-generado, sin métodos custom |
| `modules/product-sales-count/migrations/` | Schema DB, generado con `medusa db:generate` |

Registrado en `medusa-config.ts` junto a `brand`/`review`/`favorite`/`zone`.

### 2. Module link

`links/product-sales-count.ts`:

- `ProductModule.linkable.product` (singular, sin `isList`)
- `ProductSalesCountModule.linkable.productSalesCount` (singular, sin `isList`, `filterable: ["units_sold"]`)

`filterable` habilita a futuro una lectura puntual vía Index Engine (`query.graph({entity:"product", fields:["id","sales_count.units_sold"]})` para un badge de PDP, por ejemplo), pero el ranking del catálogo completo **no** pasa por ahí — ver helper más abajo.

### 3. Helper de ranking reutilizable

`modules/product-sales-count/utils/get-product-sales-ranking.ts`:

- `getProductSalesRanking(scope, {productIds?})` → `Map<product_id, units_sold>`. Lee el módulo directo (`productSalesCountModuleService.listProductSalesCounts(...)`), misma firma `{resolve}` funciona desde `req.scope`, un job o un step de workflow.
- `rankProductIds(ids, salesRanking)` → función **pura** (sin container/DB, testeada en `__tests__/rank-product-ids.unit.spec.ts`), ordena ids desc por ventas, empate estable por id ascendente (paginación determinística); ids sin fila en el Map cuentan como 0 y quedan al final.

Cualquier feature futura importa este mismo helper — no hay que reimplementar la lógica de ranking, solo escribir la ruta que la consuma.

Deliberadamente **no** se usa `query.index()` para rankear todo el catálogo: filtrar/ordenar por un campo de un módulo linkeado no lo soporta `query.graph()`, y este repo tiene historial de bugs reales con `query.index()` (`[BUG/ADMIN-INDEX]` en `AGENTS.md`). Para rankear, se lee el módulo `product-sales-count` directo por `product_id` — mismo patrón ya usado para `review` (`query.graph({entity:"review", fields:["product_id","rating"]})`, no `product.reviews.*`).

### 4. Agregación + Workflow de recomputo

- `modules/product-sales-count/utils/compute-units-sold.ts` — `computeUnitsSoldByProduct(query)`: pagina por `query.graph({entity:"order", fields:["items.product_id","items.quantity"], filters:{status:{$ne:"canceled"}, is_draft_order:false}})` hasta que una página venga corta; suma `quantity` por `product_id`. Solo lo usa el job — features futuras deben leer la tabla ya persistida vía `getProductSalesRanking`, no re-agregar desde órdenes en cada request.
- `workflows/upsert-product-sales-counts.ts` + `workflows/steps/{find-existing-product-sales-counts,upsert-product-sales-counts}.ts`:
  - `find-existing-product-sales-counts-step` lista todas las filas actuales.
  - `upsert-product-sales-counts-step` crea las filas nuevas (productos que nunca antes tuvieron ventas) y actualiza **todas** las existentes a `salesMap.get(product_id) ?? 0` — así el reset a 0 de productos que dejaron de tener ventas ocurre solo, sin lógica especial. MedusaService no genera un método `upsert`, así que esto está armado a mano (un `update` por fila — aceptable para el tamaño de este catálogo).
  - `createRemoteLinkStep` solo para las filas **creadas** en esta corrida — las actualizadas ya tienen su link de una corrida anterior.
  - Rollback: las filas creadas se borran ante error; las actualizadas no se revierten — aceptable para un recompute periódico idempotente (la próxima corrida las corrige solas).

### 5. Job de recompute

`jobs/recompute-product-sales-counts.ts` — cron diario (`0 3 * * *`). Resuelve `logger`/`query` del container, llama `computeUnitsSoldByProduct` (lectura directa, no workflow) y pasa el resultado a `upsertProductSalesCountsWorkflow` (mutación, sí workflow). Try/catch de nivel superior, log-and-continue.

### 6. API Store — `/store/products-list`

- `sort_by=best_selling` (`validators.ts`, `z.enum(["best_selling"]).optional()`) — mismo patrón de "extraer del raw, validar aparte, recombinar" que `brand_id`/`tag_id`/`rating_gte`/`on_sale`/`zone_id`. Deliberadamente **no** reusa el `order` de core (ese valida contra el whitelist de columnas reales de `product`; `best_selling` no lo es).
- `route.ts`: rama nueva, insertada **después** de la intersección de `matchedIdSets` (respeta cualquier filtro ya activo — marca, tag, rating, on_sale, zona, categoría) y **antes** del fetch final incondicional:
  1. `query.graph()` liviano (`fields:["id"]`, cap `take:1000`) resuelve el universo elegible actual (ya filtrado).
  2. `getProductSalesRanking` + `rankProductIds` sobre ese universo.
  3. Slice de la página pedida sobre el array de ids ya ordenado — paginación real y exacta (la tabla de conteos es chica y barata de traer completa, a diferencia del sort de precio del storefront que es aproximado por ventana).
  4. Fetch final `query.graph()` con `filters.id = pageIds`, re-ordenado en JS según `pageIds` (Postgres no garantiza que el resultado respete el orden del array del filtro).
  5. `count` = tamaño del universo elegible completo (no el de la página).
  - El post-procesamiento común (`wrapVariantsWithInventoryQuantityForSalesChannel` + `wrapProductsWithTaxPrices`) está extraído a un closure local (`applyProductPostProcessing`) compartido entre esta rama y la rama default, para que no diverjan con el tiempo.

No hay ruta admin — sin caso de uso de moderación/CRUD para esta feature (los conteos se recalculan solos).

### 7. Storefront

| Archivo | Rol |
|---------|-----|
| `modules/store/components/refinement-list/sort-products/index.tsx` | `SortOptions` gana `"best_selling"`, entrada `{value:"best_selling", label:"Más vendidos"}` |
| `modules/store/components/rodi-plp-toolbar/rodi-sort-select.tsx` | Selector real del toolbar del PLP — `sortLabels` gana la misma entrada, primera en la lista (orden del mockup) |
| `lib/data/products.ts` (`listProductsWithSort`) | Rama nueva antes de la de precio — pasa `sort_by: "best_selling"` a `listProducts()`; paginación real de backend (no ventana en memoria como el sort de precio) |

`paginated-products.tsx` / `PaginatedProductsParams` / `store/page.tsx` / `categories/[...category]/page.tsx`: sin cambios — `sortBy?: SortOptions` ya threadea genérico.

### 8. Seed de verificación

`scripts/seed-fake-orders.ts` — idempotente (tag: email fijo `seed-fake-orders@charliestore.test`, skip si ya existen órdenes con ese email). Crea unas pocas órdenes reales (`createOrderWorkflow`, `status: "pending"` — el default real de checkout) con cantidades distintas sobre productos existentes del catálogo, y al final invoca directo `computeUnitsSoldByProduct` + `upsertProductSalesCountsWorkflow` (los mismos bloques que usa el job) para no depender del cron:

```bash
pnpm medusa exec ./src/scripts/seed-fake-orders.ts
```

## Extender Best Sellers

| Necesidad | Dónde actuar |
|-----------|--------------|
| Sección "Más vendidos" en el home | Nueva ruta/componente que llame `getProductSalesRanking` + `rankProductIds` directo — no reimplementar el ranking |
| Badge en PDP ("#1 más vendido") | Leer `product.sales_count.units_sold` vía `query.graph` (el link ya es `filterable`) o el mismo helper |
| Widget de admin (top N productos) | Mismo helper, sin necesidad de Index Engine |
| Recompute casi-real-time | Bajar la cadencia del cron (`jobs/recompute-product-sales-counts.ts`) — `last_calculated_at` ya persiste para auditar staleness |

## Notas operativas

- **Los módulos y links nuevos no recargan en caliente** — registrar `product-sales-count` en `medusa-config.ts` o el archivo en `links/` exige reiniciar `medusa develop` por completo.
- El test unitario de `rankProductIds` (`__tests__/rank-product-ids.unit.spec.ts`) es el único test automatizado de esta feature — el resto de la suite (`test:unit`/`test:integration:*`) está rota hoy en todo el repo (`integration-tests/` no existe, `setupFiles` roto), preexistente, no introducido por este feature.

## Archivos (mapa rápido)

```
apps/backend/src/
├── modules/product-sales-count/
│   ├── models/product-sales-count.ts
│   ├── service.ts
│   ├── index.ts
│   ├── migrations/
│   └── utils/
│       ├── get-product-sales-ranking.ts
│       ├── compute-units-sold.ts
│       └── __tests__/rank-product-ids.unit.spec.ts
├── links/product-sales-count.ts
├── workflows/
│   ├── upsert-product-sales-counts.ts
│   └── steps/
│       ├── find-existing-product-sales-counts.ts
│       └── upsert-product-sales-counts.ts
├── jobs/recompute-product-sales-counts.ts
├── scripts/seed-fake-orders.ts
└── api/store/products-list/
    ├── route.ts        # rama sort_by=best_selling
    └── validators.ts   # campo sort_by

apps/storefront/src/
├── lib/data/products.ts                                            # listProductsWithSort
├── modules/store/components/refinement-list/sort-products/         # SortOptions
└── modules/store/components/rodi-plp-toolbar/rodi-sort-select.tsx  # selector real del toolbar
```

## Historial de implementación

Plan original: `.context/plan-plp-mas-vendidos.md`.
