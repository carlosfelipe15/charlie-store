# Plan: Combos (bundles de productos)

> **Estado: propuesto, sin decisión de ejecución.** Generado el 2026-07-09 a pedido de Carlos para responder a `[FEATURE/COMBOS]` en `backlog.md`. No se ha empezado a implementar — guardado aquí para revisión y decisión en una sesión futura. Dos decisiones de diseño ya fueron confirmadas con el usuario (ver más abajo); el resto del plan no se ha validado.

## Contexto

`.context/backlog.md` tiene un ítem `[FEATURE/COMBOS]` (agregado 2026-07-09): no existe ninguna lógica de combos en el proyecto — solo aparece como mockup visual en `design-reference/` (panel "Combo guacamole · 4 productos" en la PDP, filtro "Combos" en el sidebar de la PLP, banner cross-sell en el carrito mobile). El usuario pidió un plan de implementación apoyado en la [Bundled Products Recipe](https://docs.medusajs.com/resources/recipes/bundled-products) oficial de Medusa y en su [ejemplo de código](https://github.com/medusajs/examples/blob/main/bundled-products/README.md), teniendo en cuenta la limitación ya señalada: el "inventory kit" nativo de Medusa no permite precio propio del combo ni fulfillment separado de sus ítems — por eso tanto el recipe como este plan usan un módulo custom en vez de esa vía.

Este plan adapta la arquitectura del recipe a las convenciones ya establecidas en este repo (`brand`, `review`, y sobre todo `favorite` — el módulo más reciente e idiomático) siguiendo siempre `Module → Link → Workflow → API Route → Admin/Storefront`.

**Decisión de diseño central**: el combo **es un Product real del catálogo** (se crea vía el `createProductsWorkflow` del core, con su propio `handle`, título, imagen y una variante con el precio del combo). Esto reutiliza gratis toda la infraestructura ya existente — PDP, `ProductPreview`/`RodiProductCard`, pricing por región/moneda vía `calculated_price`, ruteo — y hace que "Ver combo →" del mockup simplemente navegue al PDP normal de ese producto. Solo el botón "Agregar al carrito" de esa PDP se comporta distinto: en vez de agregar la propia variante del combo, agrega una línea de carrito por cada producto componente, a sus variantes reales.

**Decisiones ya confirmadas con el usuario (no reabrir sin motivo):**
- **Precio del combo en el carrito**: reparto proporcional del precio del combo entre las líneas reales de cada componente (no vía Promotion Module). Simplificación consciente — ver sección de riesgos.
- **Edición de combos**: fuera de alcance del MVP. Los combos son inmutables tras crearse; para cambiar composición o precio, se borra y se vuelve a crear.

## Alcance (qué entra y qué se difiere)

**Entra en este plan:**
- Backend: módulo `bundle` completo (`Bundle`/`BundleItem`), los 2 links, workflows `create-bundle`, `delete-bundle`, `add-bundle-to-cart`, `remove-bundle-from-cart`, rutas admin y store.
- Admin: página de Combos con **crear** y **listar+borrar** (sin editar — ver justificación abajo).
- Storefront: PDP propia del combo con selección de variante por componente y agregado atómico al carrito; panel cross-sell "este producto forma parte de un combo" en la PDP de un producto normal; checkbox "Combos" en el filtro de la PLP; quitar el combo completo del carrito en una sola acción.

**Se difiere explícitamente (queda en el backlog, no se abandona en silencio):**
- **Editar un combo existente.** A diferencia de `brand` (donde desvincular un producto de una marca borrada no afecta al producto), el combo *es* su propio producto — "editar" implica reconciliar ítems agregados/quitados, re-precificar la variante y decidir qué pasa con líneas de carrito ya creadas con el precio viejo. Es trabajo real, no un copy-paste de `update-brand`. MVP: los combos son **inmutables tras crearse** — para cambiar composición o precio, se borra y se vuelve a crear. Mismo patrón que este repo ya usó con `review` (sin update/delete inicial) y `brand` (CRUD completo llegó en una pasada posterior, ver `.context/features/brands.md`).
- **Sección "Combos destacados" en el home.** Aditivo y de bajo riesgo de agregar después (mismo patrón que `rodi-curated-row`) — no vale la pena inflar este plan con una sección nueva de home.
- **Precio multi-moneda del combo.** El formulario admin toma un único `price` + `currency_code` (la tienda hoy es COP-only en la práctica, igual que el resto del storefront). Multi-región queda fuera.
- **Descuento vía Promotion Module.** La alternativa "correcta" al reparto proporcional de precio (ver más abajo) sería modelar el combo como una promoción condicional en vez de repartir `unit_price` manualmente. No se construye en este MVP — el reparto proporcional es más simple y no depende de configurar reglas de promoción por combo, pero es una simplificación consciente (afecta reportes de ventas por producto y devoluciones parciales, ver sección de riesgos).
- **Combos anidados** (un combo dentro de otro). No se soporta ni se valida contra esto.

## Backend

### Módulo `bundle`

`apps/backend/src/modules/bundle/`:
- `models/bundle.ts` — `Bundle`: solo `id` + `items: model.hasMany(() => BundleItem, { mappedBy: "bundle" })`. **Sin `title` ni `price` propios** — toda esa metadata vive en el Product enlazado (decisión central de arriba); duplicarla en `Bundle` crearía un problema de sincronización sin beneficio.
- `models/bundle-item.ts` — `BundleItem`: `id`, `product_id` (texto, indexado — es una referencia cross-módulo a `Product`, así que no puede ser una relación DML real, solo un link; ver sección de Links), `quantity` (número, default 1), `bundle: model.belongsTo(() => Bundle, { mappedBy: "items" })`.
- `service.ts` — `MedusaService({ Bundle, BundleItem })`, sin métodos custom.
- `index.ts` — exporta `BUNDLE_MODULE`.

**Nota de riesgo a verificar temprano**: este es el primer módulo custom del repo con una relación DML `hasMany`/`belongsTo` dentro del mismo módulo (`brand`/`review`/`favorite` solo se conectan a `Product` vía *links*, nunca entre sí). Verificar en cuanto se genere la migración: (a) si `bundleModuleService.createBundles({ items: [...] })` crea el `Bundle` y todos los `BundleItem` en una sola llamada anidada (como hace el módulo `product` del core con `variants`) — si no, hay que hacerlo en dos pasos (`createBundles({})` luego `createBundleItems(...)`); (b) si la migración generada le pone `ON DELETE CASCADE` a la FK `bundle_item.bundle_id` — el workflow de borrado (abajo) no debe asumirlo sin confirmarlo, así que borra `BundleItem` explícitamente antes que `Bundle`.

Migración: **generada**, nunca a mano — `pnpm medusa db:generate bundle` contra una DB de dev corriendo, luego `pnpm medusa db:migrate` (mismo patrón que `favorite`).

### Links

- `apps/backend/src/links/bundle-product.ts` — `defineLink(BundleModule.linkable.bundle, ProductModule.linkable.product)`, **uno a uno**, sin `isList` en ningún lado (cardinalidad nueva en este repo — el combo *es* su producto de catálogo).
- `apps/backend/src/links/bundle-item-product.ts` — `defineLink(ProductModule.linkable.product, { linkable: BundleModule.linkable.bundleItem, isList: true })` — mismo patrón que `product-favorite.ts`/`product-review.ts` (un producto, muchos `BundleItem` que lo referencian desde distintos combos).

Registrar `bundle` en `medusa-config.ts` → `modules[]`. Ambos cambios (módulo nuevo + links nuevos) requieren reinicio completo de `medusa develop`.

### Workflows

**`create-bundle`** (`apps/backend/src/workflows/create-bundle.ts`), disparado desde admin:
1. Busca o crea (idempotente, mismo patrón `find*Step` + `when().then()` que `create-favorite`) un product tag `"combo"` compartido — se usa para el filtro de PLP más abajo sin depender del Index Module.
2. `createBundleStep` (con compensación) crea `Bundle` + sus `BundleItem` a partir de `{ product_id, quantity }[]`.
3. Llama al `createProductsWorkflow` del core **como step anidado (`.runAsStep()`, no `.run()`)** — así su propia compensación queda encadenada al rollback del workflow padre — para crear el producto de catálogo del combo: título, status published, tag `"combo"`, una variante "Default" con el precio del combo en la moneda indicada.
4. `createRemoteLinkStep` para enlazar `Bundle` ↔ el producto recién creado (link `bundle-product`).
5. `createRemoteLinkStep` (con `.config({ name })` distinto del anterior, porque hay dos llamadas al mismo step en un workflow) para enlazar cada `BundleItem` con su producto real (link `bundle-item-product`).

**`delete-bundle`** (nuevo, no existe hoy un equivalente porque `delete-brand` no borra el producto vinculado — un combo sí debe hacerlo, si no queda un PDP fantasma comprable). Orden, calcado del "dismiss link primero, borrar fila después" de `delete-brand`:
1. Quitar el link `bundle-product`.
2. Quitar los links `bundle-item-product` de cada `BundleItem`.
3. `deleteProductsWorkflow` del core (`.runAsStep()`) para borrar el producto de catálogo del combo.
4. Borrar las filas `BundleItem` y luego `Bundle`.

**`add-bundle-to-cart`** (`apps/backend/src/workflows/add-bundle-to-cart.ts`) — la pieza de mayor riesgo del plan:
1. `useQueryGraphStep` trae el `cart` (para su `currency_code`), y el `bundle` con sus `items`, cada uno con su producto y variantes, y el `calculated_price` de la variante del producto-combo (con contexto de moneda del carrito).
2. Step de validación: cada componente del bundle debe tener una `variant_id` seleccionada en el input, y esa variante debe pertenecer realmente a ese producto componente (evita que un request manipulado sustituya la variante de otro producto para alterar el reparto de precio).
3. **Step de cálculo de reparto proporcional** (`calculateBundleLineItemsStep`, nuevo): toma el precio total del combo (de la variante del producto-combo) y el precio real de cada variante seleccionada × su cantidad, y reparte el precio del combo proporcionalmente entre los componentes, produciendo un `unit_price` por línea tal que la suma total coincida exactamente con el precio del combo (el resto de redondeo, si lo hay, se aplica al último ítem). Se calcula en vivo en cada agregado al carrito (no se cachea), así que sigue siendo correcto si el precio de un componente cambia después de crear el combo. Usar aritmética simple con redondeo entero (COP no tiene decimales); verificar durante la implementación si `@medusajs/framework/utils` expone un helper de `Money`/`BigNumber` conveniente para esto antes de escribirlo a mano.
4. `acquireLockStep` sobre el `cart_id`.
5. `addToCartWorkflow` del core, **`.runAsStep()`**, con un `items: [...]` por cada componente — la cantidad es `item.quantity * bundle_quantity`, el `unit_price` es el calculado en el paso anterior (marca la línea como precio custom, salteando el cálculo normal), y `metadata: { bundle_id, bundle_item_quantity }` para poder agrupar/quitar el combo completo después. Este workflow del core ya soporta múltiples ítems atómicamente con `unit_price` override — es justo la capacidad que no está expuesta hoy vía el SDK/ruta pública de un solo ítem.
6. Refetch del cart, `releaseLockStep`.

**`remove-bundle-from-cart`**: trae las líneas del carrito, filtra las que tengan `metadata.bundle_id === bundle_id`, y si hay alguna, `acquireLockStep` + `deleteLineItemsWorkflow` del core (`.runAsStep()`) sobre esos ids + `releaseLockStep`. Idempotente: si no hay líneas con ese `bundle_id`, no hace nada (no es un error).

**Nota de riesgo a verificar**: a diferencia de la ruta core `/store/products`, que aplica pricing context automáticamente vía middlewares internos (`setPricingContext`), un workflow custom con `useQueryGraphStep` no lo obtiene gratis — hay que pasar explícitamente el `context: { currency_code }` en cada consulta que toque `calculated_price`, y confirmarlo con datos reales antes de construir el storefront encima (ver Verificación).

### Rutas API

**Admin** (`apps/backend/src/api/admin/bundles/`):
- `POST /admin/bundles` — valida `{ title, price, currency_code, items: [{product_id, quantity}] (mínimo 2) }`, corre `createBundleWorkflow`.
- `GET /admin/bundles` — `query.graph({ entity: "bundle", ...req.queryConfig })`, paginado igual que brands/favorites.
- `DELETE /admin/bundles/:id` — corre `deleteBundleWorkflow`.

**Store** (`apps/backend/src/api/store/`):
- `GET /store/bundles?product_id=&currency_code=` — dado el id del producto-combo, devuelve el bundle con sus items/productos/precios. Filtra por el PK de `product` (permitido) y solo *expande* el link `bundle` (no filtra por un campo cross-módulo, evita el problema de `query.graph()` que ya bloqueó el filtro de marca en el plan anterior).
- `GET /store/bundles/used-in?product_id=&currency_code=` — lookup inverso: dado un producto componente, qué combos lo incluyen (filtra sobre `bundle_item.product_id`, columna propia de esa entidad, sin el problema anterior). Alimenta el panel cross-sell.
- `GET /store/product-tags?value=combo` — ruta mínima nueva (el core no expone listado de tags en el Store API) para que el storefront resuelva el id del tag `"combo"` sin hardcodearlo.
- `POST /store/carts/:id/line-item-bundles` — body `{ bundle_id, quantity, selections: [{product_id, variant_id}] }`, corre `addBundleToCartWorkflow`. Sin `authenticate` (igual que el resto de carrito — carritos de invitado son válidos).
- `DELETE /store/carts/:id/line-item-bundles/:bundle_id` — corre `removeBundleFromCartWorkflow`.

Registrar todas en `middlewares.ts` con sus validadores Zod (`validators.ts` co-ubicado por recurso, como ya se hace).

### Admin UI

`apps/backend/src/admin/routes/bundles/page.tsx` — mismo patrón que `admin/routes/brands/page.tsx` (`DataTable` + `FocusModal`), con el formulario de creación más grande: título, precio, moneda, y una lista repetible de "producto + cantidad" (mínimo 2 filas, búsqueda de producto vía `sdk.admin.product.list({ q })`, que ya es un método tipado del SDK). Tabla: id, título del producto vinculado, cantidad de ítems, precio configurado. Solo acción de borrar (con confirmación vía `usePrompt()`, aclarando en el mensaje que también se borra el producto de catálogo del combo) — sin acción de editar, según el alcance definido arriba. No hace falta un widget en el detalle de producto (a diferencia de `brand`) — la composición del combo se administra entera desde la página de Combos.

## Storefront

### Capa de datos

`apps/storefront/src/lib/data/bundles.ts` (nuevo) — mismo estilo que `lib/data/favorites.ts`/`lib/data/brands.ts` (`"use server"`, nunca lanza, corta a `null`/`[]`):
- `getBundleForDisplayProduct(productId, currencyCode)` — `GET /store/bundles`.
- `listBundlesUsingProduct(productId, currencyCode)` — `GET /store/bundles/used-in`.
- `addBundleToCart({cartId, bundleId, quantity, selections})` — `POST /store/carts/:id/line-item-bundles` vía `sdk.client.fetch` (no hay método tipado del SDK para esto, igual que ya pasa con las rutas de favoritos), revalida los mismos cache tags (`carts`, `fulfillment`) que `addToCart`.
- `removeBundleFromCart(cartId, bundleId)` — `DELETE /store/carts/:id/line-item-bundles/:bundle_id`.

### Badge de combo

`apps/storefront/src/modules/common/components/rodi/badge.tsx` (existente, modificado) — agregar `"combo"` al union `RodiBadgeKind` (hoy `"sale"|"new"|"fresco"|"org"|"bolt"`), reusando el estilo amarillo ya definido para `bolt` (`bg-rm-yellow text-rm-ink`) con label `"COMBO"`.

`apps/storefront/src/modules/products/components/rodi-product-card/index.tsx` (existente, modificado) — nuevo prop `isCombo?: boolean` (derivado de si el producto tiene el tag `"combo"`, ya viene en el `+tags` que `lib/data/products.ts` pide por defecto). El badge de oferta hoy ocupa el único slot superior-izquierdo (`RodiBadge kind="sale"`); pasar ese contenedor a `flex flex-col gap-1` para apilar sale + combo cuando ambos aplican, sin tocar el corazón de favoritos (que ya vive en la esquina opuesta).

### PDP propia del combo

Nuevo `apps/storefront/src/modules/products/components/bundle-actions/index.tsx` (`"use client"`, sibling de `product-actions/`): recibe el `bundle` (items con producto+variantes+precio) ya resuelto por un nuevo wrapper server component (mismo patrón que `product-actions-wrapper/index.tsx`, que hoy solo hace `listProducts({queryParams:{id:[id]}})` y pasa el producto a `ProductActions`). Renderiza una fila por componente (miniatura, título, cantidad) con selector de variante solo cuando ese componente tiene más de una variante (los de variante única se auto-seleccionan). El precio se muestra igual que cualquier PDP (reusa el mismo componente de precio, porque el combo **es** un producto con `calculated_price`), más el precio "suma de partes" tachado, calculado en el cliente a partir de los precios ya recibidos de cada componente. El CTA queda deshabilitado hasta que todos los componentes multi-variante tengan selección; al hacer click llama `addBundleToCart(...)` de `lib/data/bundles.ts` — **no** `addToCart` de `lib/data/cart.ts` — y hace `router.refresh()`.

`apps/storefront/src/modules/products/templates/product-actions-wrapper/index.tsx` (existente, modificado): decide entre `ProductActions` y `BundleActions` mirando si `product.tags` incluye el tag `"combo"` (dato ya traído, sin fetch extra). Este es el único punto donde se bifurca el comportamiento — el resto de la PDP (galería, tabs, breadcrumbs, reviews) no cambia.

### Panel cross-sell en un producto normal

Nuevo `apps/storefront/src/modules/products/components/rodi-combo-panel/index.tsx` (server component, sin estado — es una tarjeta promocional estática con un link, igual que el mockup): llama `listBundlesUsingProduct(product.id, region.currency_code)`; si no hay combos que incluyan ese producto, `return null` (mismo patrón de degradación silenciosa que `RodiFlashSale`/`RodiCuratedRow`). Si hay, muestra el primero (MVP: sin carrusel de N combos) con fondo `bg-rm-s-butter`/borde `border-rm-yellow` (el lenguaje visual de "promo" ya usado en `RodiFlashSale`/`RodiPromoCards`), título del combo, precio, y un `RodiBtnLink` "Ver combo →" que navega al `handle` del producto-combo (PDP normal, ya cubierta arriba).

Se inserta en `apps/storefront/src/modules/products/templates/index.tsx` (existente, modificado) como nuevo hijo del `<aside>`, entre el `Suspense` de `ProductActionsWrapper` y `RodiPdpDelivery` — exactamente donde lo ubica el mockup (`pdp.jsx:497-507`). No se muestra en la propia PDP del combo (ahí ya está `BundleActions` con el detalle completo).

### Filtro "Combos" en la PLP

`apps/storefront/src/modules/store/components/rodi-plp-filters/index.tsx` (existente, modificado) — reemplaza el párrafo placeholder ("Más filtros... en una próxima iteración") por un único checkbox "Combos" bajo un grupo "Promociones" (sin "En oferta"/"2x1", que no están implementados y quedan fuera de este plan), usando el mismo `setQueryParams(name, value)` que ya usa `SortProducts`. Parámetro de URL: `combo=true` (boolean simple, no expone el id interno del tag). `paginated-products.tsx` y los templates de Store/Category (existentes, modificados) resuelven ese parámetro a `tag_id=<id del tag "combo">` (obtenido una vez vía la nueva ruta `/store/product-tags`) antes de llamarlo `listProducts` — `lib/data/products.ts` no necesita cambios, ya hace passthrough de `queryParams`.

### Quitar el combo del carrito

En el componente que renderiza las líneas del carrito (`apps/storefront/src/modules/cart/components/rodi-cart-item/` o `item/`, existente, modificado) — agrupar líneas por `item.metadata?.bundle_id` y, para un grupo de combo, mostrar una acción "Quitar combo" que llama `removeBundleFromCart(cartId, bundleId)` en vez del `deleteLineItem` de a una línea. Alcance mínimo: la agrupación visual completa del carrito (como en el mockup mobile) es pulido de UI que puede diferirse; lo que sí entra aquí es que la *capacidad* de quitar el combo completo exista y esté conectada.

## Secuenciación recomendada

1. Módulo + migración (`bundle`) → generar → **inspeccionar la migración generada** (cascade, nested-create) → migrar.
2. Links (`bundle-product`, `bundle-item-product`) → reinicio de `medusa develop` → confirmar en logs que no hay errores de cardinalidad.
3. `create-bundle` + rutas admin, verificado con llamadas directas (curl/Thunder Client) antes de tocar la UI — confirma el supuesto de creación anidada.
4. `delete-bundle` + `DELETE /admin/bundles/:id`, verificado igual — confirma que el producto de catálogo realmente desaparece.
5. Página admin de Combos, probada contra las rutas ya verificadas.
6. `add-bundle-to-cart` + rutas store, verificado con llamadas directas contra un carrito real — el paso de mayor riesgo (pricing context + reparto proporcional), confirmar con números reales antes de construir cualquier UI encima.
7. `remove-bundle-from-cart` + ruta store, verificado igual.
8. `GET /store/bundles`, `/store/bundles/used-in`, `/store/product-tags`, verificados con llamadas directas.
9. Capa de datos del storefront (`lib/data/bundles.ts`).
10. UI del storefront, en este orden: badge → tarjeta de producto → `BundleActions` (PDP propia) → `RodiComboPanel` (cross-sell) → filtro "Combos" de PLP → "quitar combo" en el carrito.
11. Documentación, actualizada después de cada hito de backend, no todo al final.

## Documentación a actualizar

- Nuevo `docs/custom-features/combos.md` — misma estructura que `brands.md`/`reviews.md`, con una sección "Decisiones clave" que deje constancia de: por qué `Bundle` no tiene `title`/`price` propios, por qué el reparto de precio es proporcional y no vía Promotion Module, por qué los combos son inmutables tras crearse, por qué el filtro de PLP usa un tag y no el Index Module, y una tabla "Extender Combos" con lo diferido (edición, sección de home, multi-moneda, Promotion Module, combos anidados).
- Nuevo `.context/plans/2026-07-09/FASE-11-combos.md` (o el número de fase que corresponda), documentando la secuenciación seguida y cualquier sorpresa en los dos puntos de riesgo señalados arriba.
- `.context/backlog.md` — cerrar `[FEATURE/COMBOS]` cuando esté shippeado; agregar entradas nuevas para lo diferido explícitamente (para que no desaparezca en silencio).
- `.context/index.md` — actualizar fecha, fases completadas, resumen del backlog.
- `AGENTS.md` — nueva subsección "Combos" en "Funcionalidad custom actual", paralela a Brands/Reviews/Favoritos.
- `docs/development.md` — runbook corto para crear un combo de prueba localmente (`POST /admin/bundles`), mismo espíritu que el runbook de Price List ya agregado para el flash sale.

## Verificación

**Backend (sin infraestructura de integration tests, igual que Favoritos — verificación manual):**
1. `POST /admin/bundles` con 2+ productos reales → el producto de catálogo del combo existe en `GET /admin/products/:id`.
2. `GET /store/bundles?product_id=<id del producto-combo>&currency_code=<code>` → `calculated_price` viene poblado en cada componente (el punto de mayor riesgo de todo el plan).
3. `GET /store/bundles/used-in?product_id=<id de un componente>` → aparece el combo.
4. Con un carrito real: `POST /store/carts/:id/line-item-bundles` con selección de variante por componente → confirmar que se crean N líneas nuevas y que la suma de `unit_price * quantity` de esas líneas coincide exactamente con el precio del combo (chequeo de conservación de dinero). Repetir con `quantity: 2` y confirmar que escala linealmente.
5. `DELETE /store/carts/:id/line-item-bundles/:bundle_id` → las N líneas desaparecen; repetir la misma llamada → no-op sin error.
6. `DELETE /admin/bundles/:id` → el producto de catálogo del combo también desaparece (`GET /admin/products/:id` da 404).

**Storefront:**
1. `/es/store`: una tarjeta de producto-combo muestra el badge "COMBO" (apilado con el de oferta si aplica).
2. PDP del combo: lista de ingredientes, selector de variante solo en componentes con más de una, precio + tachado, el CTA agrega N líneas separadas al carrito (confirmar abriendo el drawer, no una sola línea "combo").
3. PDP de un producto normal componente de ese combo: aparece el panel cross-sell, "Ver combo →" navega al PDP del combo.
4. `/es/store?combo=true`: la grilla muestra solo productos-combo.
5. Carrito: "Quitar combo" borra las N líneas juntas.
6. Regresión: la PDP de cualquier producto no-combo sigue usando `ProductActions`/`addToCart` sin cambios.
