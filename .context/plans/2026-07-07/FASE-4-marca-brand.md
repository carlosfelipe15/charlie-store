# Fase 4 — Marca (`brand`) en el storefront

## Objetivos
Mostrar la marca de producto en PDP/PLP aprovechando que el backend ya tenía el módulo `brand`, el link `Product↔Brand` y el hook de auto-asignación completos (confirmado en la revisión de diseño previa a este plan) — sin requerir cambios de backend salvo un endpoint opcional de listado.

## Cambios por archivo
- `apps/storefront/src/lib/data/products.ts` — `fields` de `listProducts()` (usado también por `listProductsWithSort`) ahora incluye `+brand.*`.
- `apps/storefront/src/lib/util/product-brand.ts` — nuevo. `getProductBrandName(product)` lee `product.brand?.name` de forma defensiva (el campo no está en el tipo `StoreProduct` de `@medusajs/types` porque viene de un módulo custom vía link).
- `apps/storefront/src/modules/products/components/rodi-product-card/index.tsx` — muestra el nombre de marca sobre el título, si existe.
- `apps/storefront/src/modules/products/templates/product-info/index.tsx` — igual en el PDP (este archivo se volvió a tocar en Fase 7 para el badge de rating).
- `apps/backend/src/api/store/brands/route.ts` — nuevo. `GET` público, calcado de `GET /admin/brands` pero solo con `id,name` (sin campos administrativos).
- `apps/backend/src/api/middlewares.ts` — registrado el matcher `/store/brands` GET con `validateAndTransformQuery`.

## Decisiones clave
- El endpoint `/store/brands` se construyó como **opcional pero útil**: no era estrictamente necesario para mostrar la marca en tarjetas (eso solo necesitaba `+brand.*`), pero sí lo usa la franja de marcas de home (Fase 6) con fallback a nombres estáticos.
- `getProductBrandName` hace el cast defensivo (`as unknown as {brand?...}`) en un solo lugar reutilizable en vez de repetir el cast en cada componente que necesite la marca.

## Pendientes para la próxima sesión
- Ningún producto tiene `brand_id` asignado todavía (catálogo demo de ropa) — la UI degrada limpiamente (no muestra nada) hasta que se asignen marcas reales o lleguen productos nuevos ya vinculados.
- No se construyó ningún filtro de marca en el PLP (`RodiPlpFilters` sigue teniendo el comentario "Más filtros en una próxima iteración" sin tocar) — el endpoint `/store/brands` ya existe para esto si se decide construirlo.

## Consejos para el siguiente agente
- Para probar el flujo completo: crear una marca vía `POST /admin/brands {name}`, luego crear/editar un producto pasando `additional_data.brand_id` (el hook en `apps/backend/src/workflows/hooks/created-product.ts` ya crea el link automáticamente al crear el producto — no funciona en updates, solo en creación).
- Si se necesita mostrar la marca en más lugares (ej. breadcrumbs, related products), reusar `getProductBrandName()` — no reimplementar el cast.
