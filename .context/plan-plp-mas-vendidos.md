# Plan: "Más vendidos" (Best Sellers) — backend reutilizable + sort en PLP

> Guardado el 2026-07-30 por Claude, a pedido de Carlos — plan completo, **sin ejecutar todavía**. Responde al ítem `[FEATURE/PLP-MAS-VENDIDOS]` de `backlog.md`.

## Contexto

Resuelve `[FEATURE/PLP-MAS-VENDIDOS]` en `.context/backlog.md`. El diseño de referencia (`design-reference/ecommerce-test/pages.jsx:110`) muestra "Más vendidos" como opción del toolbar de orden del PLP, pero esta tienda nunca implementó nada que toque el módulo `Order` de Medusa (confirmado: `grep -r "Modules.ORDER" apps/backend/src` → 0 resultados) — no existe hoy ninguna agregación de ventas por producto en ningún lado.

Requisito explícito de Carlos: el backend que calcula "productos más vendidos" debe ser **reutilizable por futuras funcionalidades** (ej. sección de home, widget de admin, badge en PDP), no algo hardcodeado solo dentro del endpoint `/store/products-list`. Esto se resuelve separando el diseño en 3 capas independientes: **módulo + link** (dato persistido, consultable por cualquiera), **helper de ranking puro** (lógica reutilizable, no atada a una request HTTP), y **job de recomputo** (mantiene el dato fresco) — el sort del PLP es solo un consumidor más de esas 3 capas, igual que cualquier feature futura lo sería.

Decisiones de negocio ya confirmadas con Carlos:
- Productos sin ventas: se **incluyen al final** del ranking (no se excluyen del PLP).
- Métrica: **unidades vendidas** (`SUM(quantity)`), no cantidad de órdenes distintas.
- Qué cuenta como venta: **cualquier orden con `status != canceled`** (no exige `payment_status: captured`) — importante: en Medusa v2, una orden real de checkout queda en `status: "pending"`, **no** `"completed"`, hasta que se cumple fulfillment (verificado en `@medusajs/core-flows` `complete-cart.js`) — filtrar por `status === "completed"` contaría cero ventas reales.
- Sort por defecto del PLP: se **mantiene `created_at`** — "Más vendidos" se agrega como opción nueva, no reemplaza el default (revisar cuando haya volumen real de órdenes).

Hallazgos clave verificados en vivo (no asumidos):
- `order_line_item.product_id` es una columna de texto denormalizada, nullable, indexada (`@medusajs/order/dist/models/line-item.js`) — sin link formal a `product`, pero consultable directo vía `query.graph({entity:"order", fields:["items.product_id","items.quantity"]})`.
- `MedusaService(...)` **no genera** un método `upsert` — solo `create`/`update`/`delete`/`list`/etc. El upsert bulk (crear los `product_id` nuevos, actualizar los existentes, resetear a 0 los que dejaron de tener ventas) hay que armarlo a mano en el step del workflow.
- La suite de tests de este repo está rota hoy para los 3 `test:*` scripts (`apps/backend/integration-tests/` no existe, confirmado con `ls`) — no es un problema de esta feature, preexiste. Se agrega solo un test unitario puro (sin DB/container) para la función de ranking, que no depende de esa infra rota; el resto de cobertura queda fuera de alcance y se anota como ítem de backlog aparte.
- `SortOptions` ya threadea genérico storefront-side (`store/page.tsx` → `paginated-products.tsx` → `listProductsWithSort`) — solo 2 archivos de storefront necesitan cambios, no hace falta tocar `paginated-products.tsx`.

## Diseño

### 1. Módulo nuevo `product-sales-count`

Mirror exacto del módulo `favorite` (`apps/backend/src/modules/favorite/`), el más simple de los 4 existentes.

- `apps/backend/src/modules/product-sales-count/models/product-sales-count.ts` — modelo `ProductSalesCount`: `id`, `product_id` (text, index, único), `units_sold` (number, default 0), `last_calculated_at` (dateTime, nullable).
- `apps/backend/src/modules/product-sales-count/service.ts` — `class ProductSalesCountModuleService extends MedusaService({ ProductSalesCount }) {}`, sin métodos custom (igual que `brand`/`favorite`/`review`/`zone`).
- `apps/backend/src/modules/product-sales-count/index.ts` — `export const PRODUCT_SALES_COUNT_MODULE = "productSalesCount"` (camelCase — dashes rompen la resolución del container, ver skill `custom-modules.md`).
- Migración hand-written (`migrations/Migration<timestamp>.ts`), mismo estilo SQL crudo que la migración de `favorite` — generar stub con `npx medusa db:generate productSalesCount` y reescribir a mano para que matchee el modelo.
- Registrar en `apps/backend/medusa-config.ts` → `modules: [...]`.

### 2. Link `apps/backend/src/links/product-sales-count.ts`

Relación 1:1 (cada producto tiene **como máximo una** fila de conteo) — ningún lado lleva `isList: true`, a diferencia de `product-brand.ts` (muchos productos → una marca) o `product-review.ts`/`product-favorite.ts` (un producto → muchas reseñas/favoritos):

```ts
export default defineLink(
    ProductModule.linkable.product,
    { linkable: ProductSalesCountModule.linkable.productSalesCount, filterable: ["units_sold"] }
)
```

No hace falta migración propia para la tabla de link — ninguno de los 4 links existentes del repo tiene una (`npx medusa db:migrate` la sincroniza solo).

**Nota de diseño importante**: el link habilita la lectura de un producto puntual vía `query.graph({entity:"product", fields:["id","sales_count.units_sold"]})` (útil a futuro para, por ejemplo, un badge en PDP), pero **no** se usa como camino principal para rankear todo el catálogo — filtrar/ordenar el catálogo completo por un campo de un módulo linkeado no lo soporta `query.graph()` (misma limitación ya documentada para `brand.name`), y este repo tiene historial de bugs reales con `query.index()` (`[BUG/ADMIN-INDEX]` en `AGENTS.md`) que justifica evitarlo. Para rankear, se lee el módulo `product-sales-count` directo por `product_id` (mismo patrón ya usado en esta misma ruta para `review`: `query.graph({entity:"review", fields:["product_id","rating"]})`, no `product.reviews.*`).

### 3. Helper reutilizable (la pieza concreta de "reutilizable a futuro")

`apps/backend/src/modules/product-sales-count/utils/get-product-sales-ranking.ts` — mirror del rol de `apps/backend/src/modules/zone/utils/product-eligibility.ts` (helper ya compartido entre rutas en este repo):

- `getProductSalesRanking(scope, {productIds?})` → `Map<product_id, units_sold>`, lee el módulo directo (misma firma `{resolve}` funciona desde `req.scope`, un job, o un step de workflow).
- `rankProductIds(ids, salesRanking)` → función **pura** (sin container/DB) que ordena ids desc por ventas, empate estable por id; productos sin fila en el Map cuentan como 0 y quedan al final (decisión ya confirmada).

Cualquier feature futura (sección de home, widget de admin, badge de PDP) importa este mismo helper en su propia ruta — no hay que reimplementar la lógica de ranking, solo escribir el `route.ts` nuevo que la consuma.

### 4. Agregación + Workflow de recomputo

- `apps/backend/src/modules/product-sales-count/utils/compute-units-sold.ts` — `computeUnitsSoldByProduct(query)`: pagina por `query.graph({entity:"order", fields:["items.product_id","items.quantity"], filters:{status:{$ne: OrderStatus.CANCELED}, is_draft_order:false}, pagination:{skip,take:200,order:{id:"ASC"}}})` hasta que una página venga corta; suma `quantity` por `product_id` en un `Map`. Solo lo usa el job — no se expone como helper "reutilizable" (features futuras deben leer la tabla ya persistida vía `getProductSalesRanking`, no re-agregar desde órdenes cada vez).
- Workflow `apps/backend/src/workflows/upsert-product-sales-counts.ts` + steps `find-existing-product-sales-counts.ts` / `upsert-product-sales-counts.ts` (mirror de `create-favorite.ts` + su step, con `createStep`/rollback/`createRemoteLinkStep`).
  - **Recompute completo cada corrida**, no incremental "desde la última vez" — justificación: si solo mirara "qué cambió", un producto cuya única orden se cancela después de haber sido contada nunca se volvería a revisar (ninguna orden nueva lo referencia) y quedaría con un conteo stale para siempre. El full recompute se autocorrige solo: toda fila existente que NO aparece en la agregación de esta corrida se resetea a `units_sold: 0` (no se deja intacta).
  - `createRemoteLinkStep` solo para las filas **creadas** en esta corrida (productos que nunca antes tuvieron ventas) — las actualizadas ya tienen su link de una corrida anterior.
  - Rollback: las filas creadas se borran en caso de error (rollback limpio); las actualizadas no se revierten a su valor previo — aceptable para un recompute periódico idempotente (la próxima corrida las corrige solas de todas formas), no es un descuido.

### 5. Job `apps/backend/src/jobs/recompute-product-sales-counts.ts`

Cron diario (`0 3 * * *`) — catálogo chico/demo, no necesita frescura casi-real-time; `last_calculated_at` queda persistido para poder auditar staleness a futuro si hace falta ajustar la cadencia. Sigue el patrón de `scheduled-jobs.md`: try/catch con log-and-continue (nunca throw a nivel top), resuelve `logger`/`query` del container, llama al workflow (nunca muta directo).

### 6. API — `/store/products-list`

- `validators.ts`: nuevo campo `sort_by` (`z.enum(["best_selling"]).optional()`), mismo patrón de "extraer del raw, validar aparte, recombinar" que ya usan `brand_id`/`tag_id`/`rating_gte`/`on_sale`/`zone_id`/`include_facets` — deliberadamente **no** reusa el `order` de core (ese está validado contra el whitelist de columnas reales de `product`, `best_selling` no es una).
- `route.ts`: nueva rama, insertada **después** del bloque existente de intersección de `matchedIdSets` (así "Más vendidos" respeta cualquier filtro ya activo — marca, tag, rating, on_sale, zona, categoría) y **antes** del fetch final incondicional:
  1. `query.graph()` liviano (`fields:["id"]`, mismo cap de `take:1000` ya usado para `brand`/facets) para resolver el universo elegible actual.
  2. `getProductSalesRanking` + `rankProductIds` sobre ese universo.
  3. Slice de la página pedida (`skip`/`take` de `req.queryConfig.pagination`) sobre el array de ids ya ordenado — paginación real y exacta (a diferencia del sort por precio en el storefront, que es aproximado por ventana, acá la tabla de conteos es chica y barata de traer completa).
  4. Fetch final `query.graph()` con `filters.id = pageIds` para traer los datos completos de producto, **re-ordenado en JS** según `pageIds` (Postgres no garantiza que el resultado respete el orden del array de ids del filtro).
  5. `count` = tamaño del universo elegible completo (no el de la página), mismo criterio que ya usa este archivo en su short-circuit de `matchedIds` vacío.
  - Extraer el post-procesamiento común (`wrapVariantsWithInventoryQuantityForSalesChannel` + `wrapProductsWithTaxPrices`) a un helper local compartido entre la rama nueva y la rama default, para que no diverjan con el tiempo.
- `middlewares.ts`: sin cambios — `sort_by` fluye a `req.filterableFields` igual que `on_sale` hoy (confirmado: `validateAndTransformQuery` vuelca todo el output de Zod ahí, no hay whitelist de core de por medio).

### 7. Storefront

- `apps/storefront/src/modules/store/components/refinement-list/sort-products/index.tsx`: `SortOptions` gana `"best_selling"`, nueva entrada `{value:"best_selling", label:"Más vendidos"}` primera en la lista (orden del mockup).
- `apps/storefront/src/lib/data/products.ts` (`listProductsWithSort`): nueva rama antes de la de precio — pasa `sort_by: "best_selling"` a `listProducts()`, **paginación real de backend** (no ventana en memoria como el sort de precio, porque la tabla de conteos es barata de traer completa).
- `paginated-products.tsx` / `PaginatedProductsParams` / `store/page.tsx` / `categories/[...category]/page.tsx`: **sin cambios** — `sortBy?: SortOptions` ya threadea genérico.

### 8. Verificación / seed de prueba

No existe ningún seed de órdenes en el repo hoy — sin esto, "Más vendidos" no tiene datos reales para demostrar. Nuevo script idempotente `apps/backend/src/scripts/seed-fake-orders.ts` (mirror de `seed-promotions.ts`): crea unas pocas órdenes reales (`createOrderWorkflow`, `status: "pending"` — el default real de checkout, no `"completed"`) con cantidades distintas sobre un puñado de productos existentes, tagueadas con un email fijo reconocible para poder chequear "ya sembrado" en corridas repetidas; al final invoca directo `computeUnitsSoldByProduct` + `upsertProductSalesCountsWorkflow` (los mismos bloques que usa el job) para no tener que esperar al cron.

Test automatizado nuevo (el único que puede correr, ya que el resto de la infra de tests está rota hoy en todo el repo — no es un problema de esta feature): `apps/backend/src/modules/product-sales-count/utils/__tests__/rank-product-ids.unit.spec.ts` sobre la función pura `rankProductIds` (sin DB/container, matchea el glob `**/__tests__/**/*.unit.spec.ts` de todas formas aunque `test:unit` esté roto por el `setupFiles` faltante — vale la pena escribirlo igual, correrlo una vez fijado el infra).

### 9. Documentación

Nuevo `docs/custom-features/best-sellers.md`, mismo formato que `brands.md`/`favorites.md`/`reviews.md`/`zones.md` (Modelo → Módulo → Link → Workflows → Job → API → Decisiones clave → Archivos). Actualizar `AGENTS.md` (tabla de "Funcionalidad custom actual") y marcar `[FEATURE/PLP-MAS-VENDIDOS]` como resuelto en `.context/backlog.md` al terminar.

## Archivos críticos

- `apps/backend/src/modules/product-sales-count/` (nuevo módulo completo)
- `apps/backend/src/links/product-sales-count.ts` (nuevo)
- `apps/backend/src/workflows/upsert-product-sales-counts.ts` + `apps/backend/src/workflows/steps/{find-existing-product-sales-counts,upsert-product-sales-counts}.ts` (nuevos)
- `apps/backend/src/jobs/recompute-product-sales-counts.ts` (nuevo — primer job real del repo)
- `apps/backend/src/api/store/products-list/{route.ts,validators.ts}` (editar)
- `apps/backend/medusa-config.ts` (registrar módulo)
- `apps/backend/src/scripts/seed-fake-orders.ts` (nuevo, para poder verificar)
- `apps/storefront/src/modules/store/components/refinement-list/sort-products/index.tsx` (editar)
- `apps/storefront/src/lib/data/products.ts` (editar)

## Verificación end-to-end

1. `pnpm medusa db:migrate` tras crear la migración del módulo nuevo; reiniciar `medusa develop` completo (módulo/link nuevos no hacen hot-reload).
2. `pnpm medusa exec ./src/scripts/seed-fake-orders.ts` — confirmar que crea las órdenes y puebla `product_sales_count` sin esperar al cron.
3. `curl` directo: `GET /store/products-list?sort_by=best_selling&limit=12&offset=0&region_id=<...>` — orden coincide con lo sembrado, `count` = tamaño del catálogo elegible completo (no solo los que tienen ventas).
4. Combinar con un filtro existente (`&brand_id=...&sort_by=best_selling`) — confirmar que el ranking y el `count` respetan el filtro.
5. Re-correr el seed script — confirmar idempotencia (no duplica órdenes, conteos correctos).
6. Storefront: en el PLP, elegir "Más vendidos" en el selector de orden — confirmar reordenamiento visual y que la paginación (página 2) no repite ni salta productos.
7. `npx tsc --noEmit` en `apps/backend` y `apps/storefront` — sin errores de tipos.
8. `TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand src/modules/product-sales-count/utils/__tests__/rank-product-ids.unit.spec.ts` — probablemente falla hoy por el `setupFiles` roto preexistente; documentar el resultado tal cual (no es responsabilidad de esta feature arreglarlo, pero sí dejarlo anotado).
