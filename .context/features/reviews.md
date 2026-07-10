# Reviews — cambios posteriores a la Fase 7

Fase original: `.context/plans/2026-07-07/FASE-7-modulo-resenas.md` (módulo, link, `create-review`, rutas `GET`/`POST /store/reviews`, `GET /store/reviews/summary`). Esta entrada cubre únicamente lo agregado **después** de esa fase, durante la implementación de Favoritos (`.context/plans/2026-07-08/FASE-9-favoritos.md`).

## Objetivo de esta ronda de cambios

Dos gaps quedaron abiertos tras la Fase 7 y se cerraron de paso al construir `favorite` (mismo patrón, mismo tipo de validación que hacía falta en ambos módulos):

1. `create-review` no validaba que `product_id` correspondiera a un producto real — se podía crear una reseña + link huérfano apuntando a un producto inexistente.
2. No existía ningún workflow ni ruta para borrar una reseña propia (`review` solo tenía `GET`/`POST`).

## Cambios por archivo

- `apps/backend/src/workflows/steps/validate-product-exists.ts` — nuevo step, **compartido con `favorite`** (no es exclusivo de `review`, ver `.context/features/favorites.md`). Usa `IProductModuleService.retrieveProduct(product_id, { select: ["id"] })`, que lanza `MedusaError` `NOT_FOUND` automáticamente si no existe — no hace falta chequeo manual ni mapeo de error.
- `apps/backend/src/workflows/create-review.ts` — agregada la línea `validateProductExistsStep(input);` como primer paso del workflow, antes de `createReviewStep`. Un `product_id` inexistente ahora se rechaza con 404 antes de tocar la tabla `review` o crear el link.
- `apps/backend/src/workflows/steps/find-review.ts` — nuevo. Step de solo lectura: `retrieveReview(id)` (404 automático si no existe) + chequeo de ownership (`review.customer_id !== input.customer_id` → `MedusaError.Types.NOT_ALLOWED`). Deja `delete-review-step` como un delete puro, sin lógica de negocio.
- `apps/backend/src/workflows/steps/delete-review.ts` — nuevo. `deleteReviews` + compensación `createReviews` (mismo patrón que el resto de los steps de delete en este repo).
- `apps/backend/src/workflows/delete-review.ts` — nuevo workflow `deleteReviewWorkflow`: `findReviewStep` (retrieve + ownership) → `dismissRemoteLinkStep` (limpia el link `product↔review`) → `deleteReviewStep`. Mismo orden que `delete-brand.ts`/`delete-favorite.ts` (dismiss del link antes de borrar la fila, para no dejar links huérfanos si algo falla a mitad de camino).
- `apps/backend/src/api/store/reviews/[id]/route.ts` — nuevo, `DELETE`. Toma `customer_id` de `req.auth_context.actor_id` (nunca del body/params) y lo pasa al workflow junto con `req.params.id`.
- `apps/backend/src/api/middlewares.ts` — nuevo matcher `/store/reviews/:id` `DELETE`, con `authenticate("customer", ["session", "bearer"])`.

## Decisiones clave

- **`validate-product-exists` se diseñó como step compartido desde el inicio**, no duplicado entre `review` y `favorite` — ambos módulos tienen exactamente la misma necesidad (rechazar un `product_id` que no existe antes de crear el registro + link). Vive en `workflows/steps/` a nivel de proyecto, no dentro de `modules/review/` ni `modules/favorite/`, precisamente porque no pertenece a ninguno de los dos en particular.
- **`DELETE /store/reviews/:id` usa el `id` interno de la reseña, no `product_id`** — a diferencia de `favorite`, que sí puede usar `product_id` en el path porque tiene un constraint único `(product_id, customer_id)`. `review` no tiene ese constraint (ver `[DATA/REVIEWS]` en `.context/backlog.md`, sigue pendiente), así que `product_id` solo no identifica una fila única — un cliente podría tener varias reseñas del mismo producto si esa deuda no se resuelve antes.
- **Delete de review NO es idempotente**, a diferencia de `delete-favorite`: 404 si la reseña no existe, 400/`NOT_ALLOWED` si existe pero es de otro cliente. Se decidió así porque, a diferencia de un favorito (donde "ya no está" es un estado válido y esperado del toggle), borrar una reseña es una acción explícita del usuario sobre un recurso que debería existir — un 404/400 silencioso ahí escondería un bug real del cliente en vez de una carrera de estado benigna.

## Verificación realizada

Vía `curl` contra el backend corriendo, con dos clientes de prueba (`review-qa@example.com` y un segundo customer):
- `POST /store/reviews` con `product_id` inexistente → 404, sin fila creada.
- `POST /store/reviews` con `product_id` real → sigue funcionando igual que antes del cambio.
- `DELETE /store/reviews/:id` de una reseña propia → 200, desaparece de `GET /store/reviews`.
- `DELETE /store/reviews/:id` de una reseña de otro cliente → 400 (`NOT_ALLOWED`).
- `DELETE /store/reviews/:id` de un id inexistente → 404.
- `npx tsc --noEmit` limpio en `apps/backend` (solo los 2 errores preexistentes no relacionados en `admin/lib/sdk.ts`).

## Pendientes

- No hay workflow de **update** de reseña propia todavía (ver tabla "Extender Reviews" en `docs/custom-features/reviews.md`).
- Sigue sin constraint que evite reseñas duplicadas del mismo cliente sobre el mismo producto — trackeado en `.context/backlog.md` bajo `[DATA/REVIEWS]`.

## Consejos para el siguiente agente

- Si necesitás otro step de "el caller solo puede actuar sobre lo suyo", replicá el patrón de `find-review-step`: retrieve (que ya lanza `NOT_FOUND`) + comparación manual de `customer_id` que lanza `NOT_ALLOWED` — no hace falta un step de validación separado.
- Antes de agregar una nueva validación de "¿existe este producto?" en cualquier workflow nuevo, revisá si `validate-product-exists-step` ya cubre el caso en vez de escribir una nueva.
