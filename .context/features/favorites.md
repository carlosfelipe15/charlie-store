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
