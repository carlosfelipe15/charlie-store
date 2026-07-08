# Fase 6 — Secciones de home faltantes (4/11 → 11/11 vs. diseño)

## Objetivos
Construir las 6 secciones de HomeV1 (`design-reference/ecommerce-test/home.jsx`) que no existían en código: banner de oferta relámpago con countdown, filas curadas por categoría, bloque promocional dual, franja de marcas y signup de newsletter.

## Cambios por archivo
- `apps/storefront/src/modules/home/components/rodi-flash-sale/index.tsx` (+ `countdown.tsx` cliente) — nuevo. Server component que busca el primer producto con `cheapestPrice.price_type === "sale"` (mecanismo nativo de listas de precios de Medusa) entre los primeros 20 productos; retorna `null` si no hay ninguno. El countdown cuenta regresivo hasta medianoche local, ticking cada segundo.
- `apps/storefront/src/modules/home/components/rodi-curated-row/index.tsx` — nuevo. Recibe `categoryHandles[]`, resuelve sus IDs vía `getCategoryByHandle`, lista hasta 6 productos vía `listProducts({queryParams:{category_id:[...]}})`. Retorna `null` si no hay productos.
- `apps/storefront/src/modules/home/components/rodi-promo-duo/index.tsx` — nuevo. Estático: "Recetas de la semana" + "Suscripción Rodi+", copy calcado del diseño.
- `apps/storefront/src/modules/home/components/rodi-brands-strip/index.tsx` — nuevo. Prefiere marcas reales (`listBrands()`); si no hay ninguna, usa los 16 nombres placeholder del diseño.
- `apps/storefront/src/modules/home/components/rodi-newsletter/index.tsx` — nuevo. Cliente, formulario con `useToast()` — **no persiste nada en backend**, es un stub de confirmación.
- `apps/storefront/src/lib/data/brands.ts` — nuevo. `listBrands()`, server action que consume `GET /store/brands` (Fase 4).
- `apps/storefront/src/app/[countryCode]/(main)/page.tsx` — cablea las 6 secciones nuevas en el orden del diseño (Hero → TrustStrip → CategoryTiles → FlashSale → FeaturedProducts → CuratedRow "Frescos" → PromoDuo → CuratedRow "Hogar y cuidado" → BrandsStrip → Newsletter).

## Decisiones clave
- Todas las secciones data-backed (`RodiFlashSale`, `RodiCuratedRow`) **degradan a `null`** (no renderizan nada) cuando no hay datos, en vez de mostrar un placeholder vacío — es el comportamiento correcto mientras el catálogo real no está cargado (decisión explícita del usuario: productos llegan después).
- El "flash sale" reutiliza el mecanismo de listas de precios ya existente en Medusa (`price_type === "sale"`) en vez de inventar un campo/flag nuevo de backend.
- El newsletter es honestamente un stub — se documentó en el código con un comentario explicando por qué no persiste, siguiendo el mismo principio de "no dejar no-ops silenciosos" aplicado en Fase 1/8.

## Pendientes para la próxima sesión
- Ninguna de las secciones data-backed mostrará contenido hasta que: (a) exista al menos un producto con precio de oferta (`price_list_type: "sale"`) para el flash-sale, y (b) existan productos en las categorías `frescos`/`lacteos-huevos`/`aseo-personal`/`limpieza`/`mascotas`/`electrodomesticos` para las filas curadas.
- El newsletter no tiene backend — si se requiere captura real de emails, hace falta un endpoint (`POST /store/newsletter` o similar) y conectar el formulario existente a él.
- No se implementó ninguna variante de HomeV2/HomeV3 del diseño — solo HomeV1, que era la variante ya usada de referencia en el resto del proyecto.

## Consejos para el siguiente agente
- Para probar visualmente `RodiFlashSale`, crear una lista de precios (`price list`) tipo "sale" en el admin sobre cualquier producto del seed demo — no requiere esperar al catálogo real.
- Para probar `RodiCuratedRow`, basta con asignar productos existentes (aunque sean de las categorías demo) a las nuevas categorías de Fase 5 vía admin.
