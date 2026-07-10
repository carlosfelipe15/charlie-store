# Fase 10 — Filtro de marca en PLP (Index Module)

## Objetivos

Segundo ítem priorizado por el usuario en la auditoría de diseño: el sidebar de filtros del listado de productos (`rodi-plp-filters`) solo tenía sort, con un placeholder literal admitiendo que faltaba filtro de marca/precio/promociones. Implementar el filtro de marca (precio/promociones quedan fuera de alcance, requieren investigación aparte sobre el modelo de pricing de Medusa — ver `.context/backlog.md`).

## Resumen de lo construido

- Backend: nuevo módulo `@medusajs/index` (Index Engine) habilitado vía `MEDUSA_FF_INDEX_ENGINE=true`, link `product-brand` marcado `filterable`, y un endpoint nuevo `GET /store/products-list` que agrega soporte de `brand_id`.
- Storefront: grupo de checkboxes "Marca" en `rodi-plp-filters`, parámetro URL `brand_id` (multi-valor, coma-separado), botón "Limpiar", hilado a través de las páginas de Store y Categorías.

## El plan original vs. lo que realmente se construyó (importante leer antes de tocar esto)

El plan original proponía **overridear** la ruta core `/store/products` (mismo path que usa Medusa internamente), con un diseño de "dos pasos" (query.index() para resolver ids de marca + query.graph() para el fetch final cuando hay category_id/tag_id presente). Ese plan **no funcionó** y se abandonó en pleno desarrollo, por una razón arquitectónica real, no un error de código:

**Hallazgo 1 — no se puede overridear un middleware core, solo el handler**: `RoutesLoader` de Medusa (`@medusajs/framework/dist/http/routes-loader.js`) sí reemplaza el *handler* de una ruta cuando un archivo `route.ts` del proyecto coincide con el path de una ruta core ("routes registered afterwards override the one registered first" — confirmado leyendo el código fuente). Pero los **middlewares** se cargan con un mecanismo distinto (`MiddlewareFileLoader`) que simplemente **concatena** los middlewares de todos los `sourceDirs` escaneados (el paquete `@medusajs/medusa` y `src/api` del proyecto), sin deduplicar ni reemplazar por matcher. Resultado: el validador Zod estricto de core para `/store/products` (que no conoce `brand_id`) seguía corriendo en cada request, y rechazaba con `"Unrecognized fields: 'brand_id'"` sin importar qué hiciera el `route.ts` del proyecto. Confirmado en vivo con logs del backend, no por inferencia.

**Solución**: usar un path nuevo, sin colisión — `/store/products-list` — exactamente el mismo patrón que ya usa este repo para `brand`/`review`/`favorite` (rutas nuevas, nunca overrides de una ruta core). El storefront (`lib/data/products.ts`) llama a este endpoint en vez de `/store/products` para **todo** el listado de productos (store, categorías, búsqueda, PDP-por-handle, related products) — no solo cuando hay `brand_id` — por el Hallazgo 2.

**Hallazgo 2 — activar el Index Engine rompe el filtrado por categoría en el core, ahora mismo**: habilitar `MEDUSA_FF_INDEX_ENGINE=true` (requerido para poder filtrar por marca vía `query.index()`) hace que **cualquier** request a `/store/products?category_id=X` en el core de Medusa 2.15.2 devuelva 500 (`Could not find entity for path: product.categories. It might not be indexed.`). Causa: el dispatch de core (`route.js` en `@medusajs/medusa`) decide si usar `query.index()` o caer a `query.graph()` chequeando `filterableFields.category_id`/`.tag_id` — pero el schema Zod de core ya renombra esos campos a `categories`/`tags` **antes** de que `filterableFields` se popule (dentro del propio `.transform()` del schema), así que ese chequeo nunca matchea y el fallback a `query.graph()` jamás se dispara. Confirmado en vivo, con logs del backend, antes de escribir ningún código propio de este feature — es un bug real de Medusa 2.15.2, no algo introducido por esta implementación (más allá de haber sido el trigger al activar el feature flag).

Como esto rompe la navegación por categorías de **todo el sitio**, no solo el filtro de marca nuevo, la única forma de arreglarlo sin poder tocar `node_modules` fue mover **todo** el tráfico de listado a `/store/products-list`, que sí implementa el fix.

**Hallazgo 3 (descubierto en el segundo intento) — `query.index()` no da conteos exactos**: la primera versión de `/store/products-list` replicaba el dispatch de core (index-engine para el caso sin categoría, query.graph con intersección de ids para el caso combinado). Confirmado en vivo: en el caso sin categoría, `metadata.estimate_count` de `query.index()` devolvía `1` cuando en realidad había 9 productos — ni siquiera `ANALYZE;` sobre la base corrigió la estimación. El storefront mostraba "2 productos" con 9 tarjetas renderizadas.

**Diseño final** (el que quedó en `apps/backend/src/api/store/products-list/route.ts`): **una sola ruta de código**, siempre vía `query.graph()` para el fetch final (conteo exacto siempre). `query.index()` se usa **únicamente** como paso previo, opcional, solo cuando `brand_id` está presente: resuelve los `id` de producto que matchean esa marca (`fields: ["id"]`, liviano), y esos ids se intersectan con el filtro `id` de la llamada real a `query.graph()`. Esto es más simple que el diseño original de "dos caminos" y evita los tres hallazgos de arriba a la vez.

## Cambios por archivo

**Backend**
- `apps/backend/package.json` — `@medusajs/index@2.15.2` (misma versión pinneada que el resto de paquetes `@medusajs/*`).
- `apps/backend/medusa-config.ts` — `{ resolve: "@medusajs/index" }` agregado a `modules[]`.
- `apps/backend/.env` / `.env.template` — `MEDUSA_FF_INDEX_ENGINE=true`.
- `apps/backend/src/links/product-brand.ts` — lado `brand` marcado `filterable: ["id", "name"]`.
- `apps/backend/src/api/store/products-list/{route.ts, validators.ts, middlewares.ts}` — el endpoint nuevo. `validators.ts` no puede `.merge()`/`.and()` el schema de core (`StoreGetProductsParams` termina en `.strict().transform(...)`, ya no es un `ZodObject` fusionable) — en su lugar, separa `brand_id` del resto del input crudo, valida cada parte por separado, y recombina el resultado.
- `apps/backend/src/api/middlewares.ts` — registra `storeProductsWithBrandMiddlewares` para `/store/products-list`.

**Storefront**
- `apps/storefront/src/lib/data/products.ts` — `listProducts()` ahora llama a `/store/products-list` en vez de `/store/products` (afecta a **todos** los call sites: store, categorías, búsqueda, PDP, related products).
- `apps/storefront/src/modules/store/components/rodi-plp-filters/index.tsx` — checkboxes de marca, manejo de parámetro URL `brand_id` (coma-separado, multi-select), botón "Limpiar".
- `apps/storefront/src/modules/store/templates/index.tsx` (`StoreTemplate`) — convertido a `async`, hace `await listBrands()`, prop `brandId` nueva.
- `apps/storefront/src/modules/categories/templates/index.tsx` (`CategoryTemplate`) — mismo cambio.
- `apps/storefront/src/modules/store/templates/paginated-products.tsx` — nuevo campo `brand_id` en `PaginatedProductsParams`, prop `brandId` nueva.
- `apps/storefront/src/app/[countryCode]/(main)/store/page.tsx` y `.../categories/[...category]/page.tsx` — leen `searchParams.brand_id`, lo parsean (`split(",")`) y lo pasan al template.

## Decisiones clave

- **Ruta nueva, no override** — ver Hallazgo 1 arriba. Precedente ya establecido en este repo (brand/review/favorite son todas rutas nuevas).
- **`query.graph()` siempre para el fetch final; `query.index()` solo para resolver ids de marca** — ver Hallazgos 2 y 3. Evita el bug de categoría de core y el problema de `estimate_count` a la vez.
- **`lib/data/products.ts` redirige TODO el tráfico de listado**, no solo las requests con `brand_id` — necesario porque el bug de categoría (Hallazgo 2) afecta a cualquier request con `category_id` contra el core, independientemente de si hay filtro de marca.
- **Límite de 1000 ids en la resolución de marca** (`pagination: { take: 1000, skip: 0 }` en la llamada a `query.index()`) — limitación conocida: una marca asignada a más de 1000 productos truncaría silenciosamente el resultado. Aceptable para el catálogo actual, documentado aquí para que quede explícito si el catálogo crece mucho.
- **Filtro de precio quedó explícitamente fuera de alcance** (decisión tomada con el usuario antes de empezar) — el precio en Medusa v2 no es un campo filtrable directo (se calcula en runtime por región/moneda vía Pricing module), requiere investigación aparte.

## Verificación realizada

Contra el backend corriendo, en este orden (siguiendo la recomendación del plan original de verificar antes de tocar la UI):
1. Tras activar el Index Engine, confirmado en los logs del backend que sincronizó `Product`, `Brand`, y el link `LinkProductProductBrandBrand` sin errores.
2. `GET /store/products-list?category_id=X` (solo categoría) — antes del fix final, 500 (`Could not find entity for path: product.categories`); después, 200 con conteo exacto.
3. `GET /store/products-list?brand_id=X&region_id=Y` — comparado `variants.calculated_price` con y sin `brand_id`, mismo shape y valores correctos.
4. `GET /store/products-list?category_id=X&brand_id=Y` (combinado) — intersecta correctamente (ej. "Pants" + "Nike" → solo "Medusa Sweatpants").
5. `GET /store/products-list?handle=X` (regresión PDP) — sigue funcionando igual que antes.
6. Sin filtro — conteo exacto (9, no el `estimate_count` erróneo de la primera versión).
7. En navegador (Playwright): checkbox de marca actualiza la URL y la grilla, "Limpiar" resetea, combinación categoría+marca funciona, PDP y home sin errores de consola, búsqueda (`?q=`) sin errores.
8. `npx tsc --noEmit` limpio en `apps/backend` (solo 2 errores preexistentes no relacionados) y `apps/storefront` (0 errores).

## Pendientes para la próxima sesión

- **Filtro de precio, promociones, atributos, calificación** — explícitamente fuera de alcance de esta fase, siguen en `.context/backlog.md` bajo `[FEATURE/PLP-FILTROS]`.
- **Conteo por marca en el sidebar** (ej. "Nike (2)") — el diseño de referencia lo muestra, no se implementó (requeriría una consulta de agregación adicional no justificada en esta pasada).
- **Toggle de vista grid/lista** — presente en el diseño, fuera de alcance.
- El límite de 1000 productos por marca en la resolución de ids (ver Decisiones clave) no tiene alarma ni log si se supera — si el catálogo crece mucho, vale la pena agregar un log de advertencia.

## Consejos para el siguiente agente

- **No intentes overridear una ruta core de Medusa asumiendo que el `route.ts` del proyecto reemplaza todo** — el handler sí se reemplaza, los middlewares NO (se concatenan). Si necesitás agregar un query param a una ruta core existente, usá un path nuevo (patrón `/store/<algo>-list` o similar), nunca el mismo path que una ruta core.
- **Si activás `MEDUSA_FF_INDEX_ENGINE`, no asumas que el core sigue funcionando igual** — al menos en 2.15.2, filtrar por `category_id`/`tag_id` vía el core con el flag activo está roto. Si tu feature necesita el Index Engine, probablemente necesitás tu propia ruta que evite ese camino para todo lo que no sea estrictamente cross-módulo (ver el diseño final de `products-list/route.ts` como referencia: `query.index()` solo para resolver ids, `query.graph()` para todo lo demás).
- `metadata.estimate_count` de `query.index()` no es confiable para mostrar un conteo exacto al usuario, ni siquiera después de `ANALYZE` — si necesitás un número exacto, no lo uses.
