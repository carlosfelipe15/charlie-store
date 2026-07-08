# Fase 7 — Módulo de reseñas / rating

## Objetivos
Único gap que exigía backend nuevo: Medusa core no tiene entidad de reseñas. Construir el módulo completo (calcando el patrón ya probado de `brand`) y mostrar rating/conteo/distribución en PDP, más conectar el stat "12.4k reseñas" (inventado) del panel de login a un dato real.

## Cambios por archivo

**Backend**
- `apps/backend/src/modules/review/{index.ts, service.ts, models/review.ts}` — módulo `review`, modelo `Review {id, product_id, customer_id, rating, title?, body}` con índice en `product_id`.
- `apps/backend/src/modules/review/migrations/Migration20260706163941.ts` + `.snapshot-review.json` — generados con `medusa db:generate review` (CLI real contra la BD, no escritos a mano) y aplicados con `medusa db:migrate`.
- `apps/backend/src/links/product-review.ts` — link `Product ↔ Review`. **`isList: true` va en el lado `review`** (un producto tiene muchas reseñas), no en `product` — ver Decisiones clave.
- `apps/backend/src/workflows/create-review.ts` + `steps/create-review.ts` — workflow que crea la reseña y el link en el mismo paso vía `createRemoteLinkStep` de `@medusajs/medusa/core-flows`.
- `apps/backend/src/api/store/reviews/route.ts` — `POST` (requiere cliente autenticado, usa `req.auth_context.actor_id`) y `GET` (lista por `product_id`, paginado).
- `apps/backend/src/api/store/reviews/summary/route.ts` — agregado (promedio + conteo + distribución 1-5★), calculado en memoria sobre hasta 10.000 filas. `product_id` es **opcional**: sin él, agrega sitewide.
- `apps/backend/src/api/store/reviews/validators.ts` — zod schemas.
- `apps/backend/src/api/middlewares.ts` — registra `GET`/`POST /store/reviews` (POST con `authenticate("customer", ["session","bearer"])`).
- `apps/backend/medusa-config.ts` — registrado `{ resolve: "./src/modules/review" }`.

**Frontend**
- `apps/storefront/src/lib/data/reviews.ts` — nuevo. `listProductReviews`, `getProductReviewSummary`, `getSiteReviewSummary` (sin `product_id`), `createProductReview`.
- `apps/storefront/src/modules/products/components/rodi-product-reviews/{index.tsx, review-form.tsx}` — sección completa en PDP: resumen + distribución + lista + formulario (solo si hay sesión).
- `apps/storefront/src/modules/products/templates/product-info/index.tsx` — badge compacto de rating bajo el título (oculto si `count === 0`).
- `apps/storefront/src/modules/products/templates/index.tsx` — cablea `<RodiProductReviews>` antes de related products.
- `apps/storefront/src/app/[countryCode]/(main)/account/@login/page.tsx`, `.../login-template.tsx`, `.../rodi-auth-panel/index.tsx` — el stat "12.4k reseñas 5★" (hardcodeado) ahora lee `getSiteReviewSummary()`; si `count === 0` se oculta esa estadística en vez de mostrar un número falso.

## Decisiones clave
- **Migración generada con el CLI real** (`medusa db:generate review` + `medusa db:migrate`), no escrita a mano — garantiza formato Mikro-ORM exacto y fue posible porque la BD de desarrollo estaba accesible.
- **Bug de cardinalidad del link descubierto en vivo**: la primera versión ponía `isList: true` en `ProductModule.linkable.product` (copiando el patrón de `brand`, donde es correcto porque *muchos productos* comparten *una* marca). Para reviews la relación es inversa (*un* producto tiene *muchas* reseñas), así que `isList` debía ir en `ReviewModule.linkable.review`. El error real fue `Entity 'Product' does not have property 'reviews'` — se diagnosticó leyendo el log del backend, no por inferencia.
- **Los módulos/links nuevos no se recargan con hot-reload** — confirmado dos veces en esta sesión: registrar un módulo en `medusa-config.ts` o crear/editar un archivo de link requiere reiniciar `medusa develop` por completo para que el contenedor DI y el mapa de remote-query lo reconozcan.
- El endpoint de resumen soporta agregación sitewide (sin `product_id`) reutilizando el mismo código en vez de crear una ruta aparte — evita duplicar la lógica de distribución.
- Verificación end-to-end real contra el backend corriendo (no solo typecheck): se registró un cliente de prueba, se creó una reseña real vía `POST /store/reviews`, y se confirmó que aparece en `GET /store/reviews`, en `/store/reviews/summary`, y en la expansión `+reviews.*` de `/store/products`.

## Pendientes para la próxima sesión
- **Datos de prueba quedaron en la BD**: cliente `review-qa@example.com` (contraseña `Test1234!`) y una reseña (rating 5, "Excelente") sobre el producto `prod_01KRYAHH1D05WP9W1EXTE47HX6` ("Medusa Shorts"). El usuario fue informado y no pidió limpiarlos aún.
- No existe interfaz de administración para reseñas (sin ruta `/admin/reviews` ni widget) — si se necesita moderación, falta construirla (el patrón de `admin/brands` es directamente reutilizable).
- El cliente no puede editar ni borrar su propia reseña desde el storefront — solo crear.
- No hay protección contra reseñas duplicadas del mismo cliente sobre el mismo producto.

## Consejos para el siguiente agente
- **Al tocar `medusa-config.ts` (registrar módulo) o `src/links/*.ts`, reiniciar `medusa develop` siempre** — no asumir que el watcher lo recoge como sí hace con rutas/workflows.
- Al definir un `defineLink` nuevo, pensar primero la cardinalidad real ("¿quién tiene muchos de qué?") y poner `isList: true` en el lado que es la lista — no copiar ciegamente el `brand` como plantilla sin verificar que la relación sea del mismo tipo.
- Si algo falla con "Entity 'X' does not have property 'Y'" en MikroORM, es casi siempre un problema de definición del link (cardinalidad o archivo no cargado por falta de reinicio), no del modelo en sí.
