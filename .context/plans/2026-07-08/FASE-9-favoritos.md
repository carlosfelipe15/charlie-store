# Fase 9 — Favoritos (wishlist)

## Objetivos

Feature explícitamente priorizado por el usuario en la auditoría de diseño (`.context/backlog.md`, `[FEATURE/FAVORITOS]`): el diseño de referencia lo trata como feature transversal (header, product card, PDP, cuenta, footer) y no existía ni un stub en el proyecto. Construir el módulo completo calcando el patrón ya probado de `review`, con dos diferencias deliberadas: cardinalidad igual a `review` (no a `brand`) y un workflow de delete adicional (`review` todavía no tiene uno).

## Cambios por archivo

**Backend**
- `apps/backend/src/modules/favorite/{index.ts, service.ts, models/favorite.ts}` — módulo `favorite`, modelo `Favorite {id, product_id, customer_id}` con índice en `product_id` y **constraint único compuesto `(product_id, customer_id)`** vía `.indexes([{ on: [...], unique: true }])` en el modelo — a diferencia de `review`, que dejó este gap sin resolver (ver `[DATA/REVIEWS]` en el backlog).
- `apps/backend/src/modules/favorite/migrations/Migration20260709150726.ts` — generada con `medusa db:generate favorite` contra la BD de dev corriendo (no escrita a mano). Confirmado en el SQL generado: `CREATE UNIQUE INDEX ... ON "favorite" ("product_id", "customer_id") WHERE deleted_at IS NULL`.
- `apps/backend/src/links/product-favorite.ts` — link `Product ↔ Favorite`, `isList: true` del lado `favorite` (mismo patrón que `product-review.ts`, invertido respecto a `product-brand.ts`).
- `apps/backend/src/workflows/steps/find-favorite.ts` — step de solo lectura (sin compensación), busca un favorito por `(product_id, customer_id)`. Reutilizado tanto por el workflow de creación (para decidir si ya existe) como por el de borrado (para resolver el `id` interno a partir del `product_id` que manda el storefront).
- `apps/backend/src/workflows/{create-favorite.ts, steps/create-favorite.ts}` — `create-favorite` usa `findFavoriteStep` + `when(...).then(...)` para solo crear+linkear si no existía ya, devolviendo el existente si lo había (idempotente sin duplicar filas ni depender de que la constraint de DB reviente).
- `apps/backend/src/workflows/{delete-favorite.ts, steps/delete-favorite.ts}` — mismo orden que `delete-brand.ts` (dismiss del link primero, luego borrado de la fila, con compensación que la recrea). No-op silencioso si no existe el favorito (idempotente).
- `apps/backend/src/api/store/favorites/route.ts` (`GET`, `POST`) y `apps/backend/src/api/store/favorites/[product_id]/route.ts` (`DELETE`) — **las tres rutas requieren `authenticate("customer", ["session","bearer"])`**, a diferencia de `review` donde el `GET` es público (favoritos no tiene caso de uso anónimo).
- `apps/backend/src/api/store/favorites/validators.ts` — Zod schemas.
- `apps/backend/src/api/middlewares.ts` — registra las 3 rutas.
- `apps/backend/medusa-config.ts` — registrado `{ resolve: "./src/modules/favorite" }`.

**Frontend**
- `apps/storefront/src/lib/data/favorites.ts` — nuevo. `listCustomerFavorites`, `getFavoritedProductIds` (Set, para evitar N+1 en grillas), `addFavorite`, `removeFavorite`.
- `apps/storefront/src/modules/layout/components/rodi-favorites-button/index.tsx` — Server Component calco de `rodi-account-button`, badge reutilizando el prop `badge` ya existente de `RodiHeaderAction`.
- `apps/storefront/src/modules/layout/components/rodi-header/{index.tsx, rodi-header-client.tsx}` — nuevo `favoritesSlot` (mismo patrón `Suspense key="..."` que `accountSlot`/`cartSlot`, sin regresar el warning de key ya resuelto), renderizado entre cuenta y carrito; también un ícono mobile-only equivalente al de cuenta.
- `apps/storefront/src/modules/products/components/rodi-product-card/index.tsx` — toggle de corazón (esquina opuesta al badge de oferta), estado optimista + `addFavorite`/`removeFavorite` + `router.refresh()`, siguiendo el mismo patrón que ya usa el componente para qty de carrito.
- `apps/storefront/src/modules/products/components/rodi-image-gallery/index.tsx` — nuevas props `productId`/`isFavorited`, botón de corazón sobre la imagen principal.
- `apps/storefront/src/modules/products/templates/index.tsx` — convertido a función `async` (antes era `React.FC` síncrono) para poder hacer `await getFavoritedProductIds()` y pasar `isFavorited` a la galería.
- `apps/storefront/src/modules/store/templates/paginated-products.tsx` — `getFavoritedProductIds()` en paralelo con el fetch de productos (`Promise.all`), `isFavorited` hilado a través de `ProductPreview` → `RodiProductCard`.
- `apps/storefront/src/modules/account/components/favorites-list/index.tsx` + `apps/storefront/src/app/[countryCode]/(main)/account/@dashboard/favorites/page.tsx` — página de cuenta, resuelve los productos completos vía `listProducts({ queryParams: { id: [...] } })` (el filtro por `id` ya existía).
- `apps/storefront/src/modules/account/components/rodi-account-nav/index.tsx` y `apps/storefront/src/modules/layout/templates/footer/index.tsx` — entrada "Favoritos" agregada.
- `apps/storefront/src/modules/common/icons/rodi/index.tsx` — `RodiIconHeart` no soportaba la prop `filled` (a diferencia de `RodiIconStar`, que sí); se extendió para aceptarla, ya que el toggle de favoritos es exactamente el caso de uso que la necesitaba.

## Decisiones clave

- **`customer_id` como columna de texto plana, no link formal a `CustomerModule`** — decisión tomada explícitamente con el usuario antes de implementar. Mismo patrón que `review.customer_id`. Justificación: las dos consultas reales ("¿cuáles son mis favoritos?" / "¿está este producto en mis favoritos?") se resuelven perfecto con un filtro por columna; la relación inversa (customer → sus favoritos vía `query.graph`) no se necesita en la práctica, y hubiera sido la primera vez que se usa `CustomerModule.linkable` en este repo — más riesgo sin beneficio claro.
- **`DELETE /store/favorites/:product_id`** (no el id interno del favorito) — el storefront siempre tiene `product_id` a mano (es lo que sabe el botón de corazón), nunca el id interno del row.
- **Constraint único desde el día uno** — a diferencia de `review`, que dejó este gap como deuda pendiente (ver `[DATA/REVIEWS]` en el backlog). Un favorito duplicado es peor UX que una reseña duplicada (el toggle necesita un estado binario claro), y el costo de agregarlo ahora era mínimo.
- **Idempotencia en ambos sentidos** (crear sobre ya-favorito, borrar sobre ya-no-favorito) resuelta en el workflow con `findFavoriteStep` + `when(...).then(...)`, no dejada para que la constraint de DB reviente como error 500 genérico.
- **Reinicio de `medusa develop` requerido** dos veces (registro del módulo en `medusa-config.ts`, y de nuevo al crear el archivo de link) — mismo comportamiento ya documentado para `brand`/`review`.

## Verificación realizada

- **Backend, contra el servidor corriendo** (no solo typecheck): login real con el cliente de prueba `review-qa@example.com` (creado en Fase 7), `POST /store/favorites` → `GET` lo lista → `POST` duplicado devuelve 200 con el mismo `id` (no crea una segunda fila) → `DELETE` lo quita → `GET` sin auth devuelve 401 → `DELETE` repetido sobre un favorito ya borrado devuelve 200 sin error.
- **Storefront, con Playwright contra el navegador real**: deslogueado, el toggle muestra el toast "Inicia sesión para guardar tus favoritos." y no marca el corazón; logueado, el toggle en product card y en la galería de PDP actualiza el corazón, el badge del header ("N guardados") se actualiza tras `router.refresh()`, y la página `/account/favorites` refleja los cambios. Se limpiaron los favoritos de prueba creados durante la verificación (vía `DELETE` directo a la API) para no dejar datos residuales del cliente `review-qa@example.com`.
- `npx tsc --noEmit` limpio en `apps/backend` (solo 2 errores preexistentes no relacionados en `admin/lib/sdk.ts`) y en `apps/storefront` (0 errores).

## Pendientes para la próxima sesión

- No existe interfaz de administración para favoritos (ni se planeó — no hay caso de uso admin claro para esta feature).
- El botón de corazón no aparece en las secciones del home (`rodi-flash-sale`, `rodi-curated-row`) — `ProductPreview` ya soporta la prop `isFavorited`, así que es barato extenderlo ahí si se pide, pero quedó fuera de alcance de esta fase (solo PLP + PDP, por decisión explícita del plan).
- El link "Mover a favoritos" en el ítem de carrito (visible en el diseño de referencia, `pages.jsx:363`) no se implementó — quedó fuera de alcance.

## Consejos para el siguiente agente

- Si necesitas otro workflow que dependa de "¿existe ya este favorito?", reutiliza `findFavoriteStep` en vez de escribir otra consulta — ya lo usan tanto `create-favorite` como `delete-favorite`.
- Al agregar un nuevo slot al header (patrón `accountSlot`/`cartSlot`/`favoritesSlot`), no olvides el `key` explícito en el `Suspense` que lo envuelve — es la causa exacta del bug ya resuelto de "Each child in a list should have a unique key prop" (ver backlog, sección Resueltos Recientemente).
