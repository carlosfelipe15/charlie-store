# Fase 11 — PLP: Atributos, Calificación, Promociones y chips de filtros activos

## Objetivos

Continuación de `[FEATURE/PLP-FILTROS]` (Fase 10 ya había resuelto Marca). El diseño de referencia (`design-reference/ecommerce-test/pages.jsx:41-172`) especifica 5 grupos de filtro además de Ordenar (Precio, Marca, Promociones, Atributos, Calificación) más una fila de chips de filtros activos con "Limpiar" por chip. Carlos pidió terminar el sidebar; tras una ronda de investigación exploratoria se acordó con él el siguiente alcance para esta pasada:

- **Sí**: Atributos (tags), Calificación (rating mínimo), Promociones — solo "En oferta" (no 2x1/Combos), fila de chips de filtros activos con "Limpiar" por chip.
- **No, explícitamente fuera de alcance**: Precio (slider de rango — Medusa v2 no persiste el precio calculado como campo filtrable, requiere infraestructura nueva), 2x1/Combos (bloqueado por `[FEATURE/COMBOS]`, que no existe), orden "Más vendidos" (ver hallazgo abajo — resultó tener un tamaño comparable a un módulo nuevo, no una extensión chica), toggle de vista grid/lista (cosmético, no priorizado).

El plan completo (con el detalle de la investigación previa que llevó a este alcance) quedó guardado durante la sesión en `C:\Users\Carlos\.claude\plans\necesito-terminar-los-filtros-warm-owl.md` antes de ejecutarse — reproducido en esencia en este documento.

## Resumen de lo construido

- **Backend**: `GET /store/products-list` (el endpoint de la Fase 10) extendido con 3 filtros nuevos — `tag_id`, `rating_gte`, `on_sale` — combinables entre sí y con `brand_id` existente por intersección de ids. Nuevo script idempotente `seed-product-attributes.ts` que crea 4 tags (Orgánico, Sin gluten, Sin azúcar, Marca propia) y los asigna al catálogo existente.
- **Storefront**: `rodi-plp-filters` extendido con las 3 secciones nuevas (Atributos como checkboxes, Calificación como radio group de selección única, Promociones como checkbox único "En oferta"). Nuevo componente `rodi-active-filter-chips` — una fila de chips removibles individualmente, integrada en `rodi-plp-toolbar`. Los 3 params nuevos (`tag_id`, `rating_gte`, `on_sale`) hilados end-to-end por las mismas capas que ya usaba `brand_id`.

## Hallazgos de la investigación previa (por qué el alcance quedó así)

Antes de planificar la implementación se investigó la dificultad real de cada grupo de filtro:

- **Atributos** (tags) y **Calificación**/**Promociones** (agregación en JS sobre un catálogo chico — en ese momento 54 productos, ~130 reviews) resultaron viables reusando la arquitectura de la Fase 10 sin cambios estructurales.
- **Precio** requiere infraestructura nueva: el precio calculado (`variants.calculated_price`) es un valor de runtime por región/moneda vía el Pricing module, no una columna persistida filtrable — no aplica el patrón de intersección de ids usado para el resto.
- **"Más vendidos"** (orden, no filtro) resultó ser una pieza de tamaño comparable a un módulo nuevo: no hay agregación `SUM`/`GROUP BY` disponible vía `query.graph()`/`query.index()` en Medusa v2, y `order_line_item` no tiene link a `product` (solo campos de texto denormalizados en la línea). Requeriría un job programado + un campo `sales_count` denormalizado + lógica de orden por ranking externo — un mecanismo distinto al de filtro-por-intersección que sí sirvió para todo lo demás. Carlos decidió, tras esta segunda vuelta de investigación, dejarlo explícitamente fuera y documentarlo como ítem propio (`[FEATURE/PLP-MAS-VENDIDOS]` en `backlog.md`).

## Cambios por archivo

**Backend**
- `apps/backend/src/api/store/products-list/validators.ts` — 3 campos nuevos (`tag_id`, `rating_gte`, `on_sale`) agregados al mismo patrón strip-validate-recombine que ya usaba `brand_id` (el schema core `StoreGetProductsParams` termina en `.strict()`, no es fusionable). Export renombrado de `StoreGetProductsWithBrandParams` a `StoreGetProductsListParams` (ya no es solo sobre marca).
- `apps/backend/src/api/store/products-list/middlewares.ts` — import actualizado al nuevo nombre del export.
- `apps/backend/src/api/store/products-list/route.ts` — generalizado el bloque que antes solo manejaba `brandIds`: ahora acumula un array `matchedIdSets` (uno por filtro especial activo) e intersecta todos antes de aplicar a `filters.id`. `tag_id` es la excepción — va directo como `filters.tags = { id: [...] }` en la llamada final a `query.graph()`, sin paso de resolución por `query.index()`, porque `product_tag` es una relación del **mismo módulo** que `product` (a diferencia de `brand`, que vive en un módulo separado). `rating_gte` reduce en JS un fetch de `review` (`product_id`, `rating`) a un promedio por producto. `on_sale` fetchea `variants.calculated_price.*` de todo el catálogo (con el `pricingContext` que la ruta ya resolvía) y filtra en JS por `calculated_price.calculated_price.price_list_type === "sale"`.
- `apps/backend/src/scripts/seed-product-attributes.ts` (nuevo) — crea los 4 tags si no existen (`createProductTagsWorkflow`), intenta asignarlos por keyword match sobre título/descripción, y cae a una lista determinística de handles por tag si el keyword match no encuentra nada (ver "Aspectos a tener en cuenta"). Actualiza productos vía `updateProductsWorkflow` con `tag_ids` = unión de los tags actuales del producto + los nuevos (nunca un reemplazo ciego). Idempotente: si un producto ya tiene todos los tags que le corresponden, no se reescribe.

**Storefront**
- `apps/storefront/src/lib/data/tags.ts` (nuevo) — `listTags()`, mismo patrón que `listBrands()` (`GET /store/product-tags`, core de Medusa, sin necesidad de ruta custom).
- `apps/storefront/src/modules/store/components/rodi-plp-filters/index.tsx` — 3 secciones nuevas (Atributos, Calificación, Promociones), generalizado `hasActiveFilters`/`clearFilters` para cubrir los 4 params, quitado el placeholder de "Más filtros" (reemplazado por uno más chico que solo menciona Precio como pendiente).
- `apps/storefront/src/modules/store/components/rodi-active-filter-chips/index.tsx` (nuevo) — un chip por valor activo (marca, tag, rating, on_sale), cada uno con su propio botón de quitar que solo afecta ese valor del param correspondiente.
- `apps/storefront/src/modules/store/components/rodi-plp-toolbar/index.tsx` — nuevas props `brands`/`tags`, renderiza `RodiActiveFilterChips` agrupado junto al conteo de resultados (mismo layout que el diseño: conteo · chips, con el selector de orden a la derecha).
- `apps/storefront/src/modules/store/templates/paginated-products.tsx` — `PaginatedProductsParams` extendido (`tag_id`, `rating_gte`, `on_sale`), nuevas props de entrada (`tagId`, `ratingGte`, `onSale`, `brands`, `tags`), pasadas al toolbar.
- `apps/storefront/src/modules/categories/templates/index.tsx` y `apps/storefront/src/modules/store/templates/index.tsx` — `listTags()` en paralelo con `listBrands()`, nuevas props hiladas hacia `RodiPlpFilters` y `PaginatedProducts`, nuevos filtros incluidos en el `countQueryParams` del conteo del hero.
- `apps/storefront/src/app/[countryCode]/(main)/store/page.tsx` y `.../categories/[...category]/page.tsx` — `searchParams` extendido con `tag_id`/`rating_gte`/`on_sale`, parseados igual que `brand_id` (`split(",")` para `tag_id`; `on_sale === "true"` para el booleano).

**Documentación**
- `.context/backlog.md` — `[FEATURE/PLP-FILTROS]` actualizado (Atributos/Calificación/Promociones-En-oferta/chips marcados resueltos; Precio y 2x1/Combos siguen pendientes con su razón). Nuevo ítem `[FEATURE/PLP-MAS-VENDIDOS]` documentando el hallazgo de arriba.

## Decisiones clave

- **`tag_id` no usa `query.index()`** — a diferencia de `brand_id`, porque `product_tag` es una relación del mismo módulo que `product`. Filtra directo con `query.graph({ filters: { tags: { id: [...] } } })`, sin pasar por el Index Engine ni requerir reindex tras el seed script.
- **`rating_gte`/`on_sale` usan el mismo "último recurso" de filtrado en JS** que documenta el skill de Medusa (`querying-data.md` § "Solution 3: Filter After Query") — justificado explícitamente solo porque el catálogo es chico (decenas de productos, ~130 reviews). Si el catálogo creciera un orden de magnitud, este patrón dejaría de ser aceptable y habría que revisar (ver nota de límite de 1000 en Fase 10, mismo tipo de limitación conocida aplica acá).
- **Intersección generalizada, no un solo `if` aislado** — el bloque que en la Fase 10 solo manejaba `brandIds` ahora acumula `matchedIdSets: string[][]` y reduce por intersección, para que combinar `brand_id` + `rating_gte` + `on_sale` a la vez dé el resultado correcto (verificado, ver abajo) en vez de que el último filtro pise a los anteriores.
- **Calificación es de selección única, no multi-checkbox como el mockup estático** — semánticamente "3★ y más" ya incluye "4★ y más", así que tiene sentido como un valor único (`rating_gte`) reusando `FilterRadioGroup` (mismo componente que ya usa "Ordenar"), no una lista de checkboxes independientes como sugiere la imagen estática del diseño.
- **Heurística de tags con fallback determinístico** — el catálogo (sembrado desde dummyjson.com) no tiene ningún texto que matchee "organic"/"gluten-free"/"sugar-free" literalmente. El script primero intenta keyword match (por si el dato de origen cambia) y, si da 0 resultados, cae a una lista fija de handles por tag (ver script para el detalle) — así el filtro nunca queda vacío en la demo, pero queda documentado como heurística aproximada, no una clasificación nutricional real.

## Verificación realizada

Contra el backend y storefront corriendo (ambos ya en marcha durante la sesión, no se relanzaron):

1. `pnpm medusa exec ./src/scripts/seed-product-attributes.ts` — corrida real, sin errores. Resultado: 4 tags creados, 31 productos actualizados (19 con "Marca propia" por tener `brand_id` ya asignado, 4+4+4 por el fallback determinístico de Orgánico/Sin gluten/Sin azúcar).
2. `GET /store/product-tags` — devuelve los 4 tags recién creados.
3. `GET /store/products-list` vía `curl`, contra el backend real:
   - Sin filtros: `count 48` (baseline).
   - `tag_id=<Orgánico>`: `count 4` — coincide exacto con el fallback sembrado.
   - `rating_gte=5`: `count 3`; `rating_gte=3`: `count 39` — monotonía correcta (umbral más bajo → más resultados).
   - `on_sale=true` sin `region_id`: reprodujo un error real de Medusa (`calculatePrices requires currency_code in the pricing context`) — **no es un bug de esta implementación**, es el comportamiento esperado del Pricing module sin contexto de moneda; el storefront siempre manda región, así que en uso real nunca ocurre. Con `region_id` válido: `200`, `count 0` (no hay ninguna price list activa de tipo "sale" sembrada en este catálogo todavía — comportamiento correcto, no hay datos de oferta reales aún).
   - `brand_id=<Coca Cola> + tag_id=<Orgánico>` (combinación deliberadamente disjunta): `count 0`, respuesta bien formada (`{products: [], count: 0, ...}`) — confirma que el camino de intersección vacía no rompe.
   - `tag_id=<Orgánico> + rating_gte=5`: `count 1` (`lemon`) — confirma que la intersección de dos filtros JS-agregados a la vez funciona.
4. `npx tsc --noEmit` limpio en `apps/backend` y en `apps/storefront` (0 errores nuevos; los 3 preexistentes de `apps/backend` — `import.meta` en `admin/lib/sdk.ts` y un error de tipos en `seed-mercado-catalog.ts` — no relacionados con este trabajo, no tocados).
5. Playwright contra `http://localhost:8000/es/categories/frescos` (10 productos en Frutas y verduras):
   - Click en "Orgánico" → URL pasa a `?tag_id=...`, grilla baja a 4 productos (apple, cucumber, kiwi, lemon — exactamente el fallback sembrado), aparece el chip "Orgánico" en el toolbar y el botón "Limpiar" en el sidebar.
   - Click en el chip "Orgánico" → vuelve a 10 productos, URL limpia, chip y "Limpiar" desaparecen.
   - Click en "3 estrellas y más" (radio de Calificación) → `?rating_gte=3`, grilla baja a 8 productos, chip "3★ y más" aparece.
   - Click en "En oferta" (con `rating_gte=3` ya activo) → `?rating_gte=3&on_sale=true`, grilla baja a 0 productos (esperado, sin ofertas activas en el catálogo), ambos chips visibles simultáneamente.
   - Click en "Limpiar" → vuelve a la URL base sin ningún param.
   - **Nota de QA para quien reproduzca esto a mano**: el checkbox/radio subyacente de `FilterRadioGroup`/checkboxes está visualmente oculto (`className="hidden peer"`, patrón ya preexistente, no introducido en esta fase) — un click de automatización debe apuntar al `<label htmlFor>` asociado (o a un punto que realmente lo contenga), no al `<div>` contenedor completo de la fila, o el click no dispara el `onChange`. No afectó el flujo real de usuario (un click de mouse humano sobre el texto label funciona igual), solo fue una fricción al escribir el test de Playwright.

## Pendientes para la próxima sesión

- **Filtro de precio** — sigue en `[FEATURE/PLP-FILTROS]`, requiere investigación aparte sobre cómo exponer `variants.calculated_price` como filtro server-side (rango, no id-match — el patrón de intersección de esta fase no aplica directo).
- **Promociones "2x1"/"Combos"** — bloqueado por `[FEATURE/COMBOS]`, que no existe todavía (hay un plan guardado sin ejecutar, ver `.context/index.md` § "Pendientes que cruzan sesiones").
- **"Más vendidos"** — nuevo ítem propio `[FEATURE/PLP-MAS-VENDIDOS]` en el backlog, sin ejecutar. Necesita job programado + campo denormalizado + lógica de orden nueva, evaluar como pieza separada cuando haya prioridad.
- **Toggle de vista grid/lista** — presente en el diseño (`pages.jsx:111-118`), no evaluado en esta pasada.
- **Conteo por opción en el sidebar** (ej. "Orgánico (4)", como ya se dejó pendiente en la Fase 10 para marca) — el diseño lo muestra para todos los grupos de filtro, sigue sin implementar en ninguno.
- **Datos de "En oferta" reales** — el filtro funciona correctamente pero no hay ninguna price list de tipo "sale" activa en el catálogo de desarrollo, así que hoy siempre devuelve 0 resultados. No es un bug, pero vale la pena sembrar al menos un producto en oferta si se quiere hacer una demo visual del filtro funcionando con resultados no vacíos.
