# Favorites — cambios posteriores a la Fase 9

Fase original: `.context/plans/2026-07-08/FASE-9-favoritos.md` (módulo completo, link, workflows idempotentes de create/delete, rutas store, UI de header/product card/PDP/cuenta). Esta entrada cubre lo agregado **después** de que esa fase se dio por cerrada.

## Objetivo de esta ronda de cambios

El plan original de Favoritos no incluía validación de que `product_id` correspondiera a un producto real — `create-favorite` aceptaba cualquier string y creaba un favorito + link huérfano apuntando a un producto inexistente. Se cerró este gap reutilizando el mismo step nuevo que se creó para `review` (ver `.context/features/reviews.md`), ya que ambos módulos tenían exactamente el mismo problema.

## Cambios por archivo

- `apps/backend/src/workflows/steps/validate-product-exists.ts` — step compartido entre `favorite` y `review` (no vive dentro de `modules/favorite/` porque no es exclusivo de este módulo). `retrieveProduct(product_id, { select: ["id"] })`, 404 automático si no existe.
- `apps/backend/src/workflows/create-favorite.ts` — agregada la línea `validateProductExistsStep(input);` como primer paso, antes de `findFavoriteStep`/`createFavoriteStep`. Un `product_id` inexistente ahora se rechaza con 404 antes de la lógica de idempotencia (que antes de este cambio ni siquiera llegaba a ejecutarse con datos inválidos, pero silenciosamente creaba el registro igual).

## Decisiones clave

- **No se tocó `delete-favorite`** — no lo necesita: borrar un favorito de un `product_id` que no existe (o nunca existió) sigue siendo un no-op idempotente correcto, no un error. Solo `create` necesita rechazar productos inexistentes.
- **Reutilizar el step de `review` en vez de escribir uno propio para `favorite`** — ambos módulos resuelven el mismo problema de la misma forma; duplicarlo no aportaba nada y hubiera sido la primera inconsistencia entre dos módulos que hasta ahora comparten todo el resto del patrón (cardinalidad del link, forma de las rutas, etc.).

## Verificación realizada

- `POST /store/favorites` con `product_id` inexistente → 404, sin fila creada ni link huérfano (antes del fix: 200, favorito creado igual).
- `POST /store/favorites` con `product_id` real → comportamiento idempotente sin cambios respecto a la Fase 9 (duplicado devuelve el mismo registro).
- `npx tsc --noEmit` limpio en `apps/backend` tras el cambio.

## Consejos para el siguiente agente

- Si agregás un tercer módulo con el mismo patrón Module → Link → Workflow → API que reciba un `product_id` externo en su create, empezá por revisar si `validate-product-exists-step` te sirve tal cual antes de escribir una validación nueva.

## Cambio posterior: excluir productos no publicados de `GET /store/favorites` (2026-07-12)

`GET /store/favorites` contaba y listaba favoritos aunque el producto detrás ya no estuviera `published` (despublicado o borrado desde el admin) — el conteo "N favoritos" que ve el cliente podía incluir productos que ya no existen en la tienda.

- `apps/backend/src/api/store/favorites/route.ts` — el handler `GET` ahora hace una segunda `query.graph({ entity: "product", fields: ["id", "status"], filters: { id: [...] } })` sobre los `product_id` de los favoritos encontrados, y filtra en memoria a los que siguen `published` antes de responder `favorites`/`count`. No se puede resolver en una sola `query.graph` porque `favorite` no puede filtrarse por un campo del módulo `product` linkeado (`product.status`).
- La fila de `favorite` **no se borra** — si el producto se vuelve a publicar, reaparece solo.
- No se tocó `POST`/`DELETE` — ambos siguen operando por `product_id` sin necesidad de que el producto esté publicado (deshacer un favorito de un producto despublicado debe seguir funcionando).
- Reflejado también en [`docs/custom-features/favorites.md`](../../docs/custom-features/favorites.md).
