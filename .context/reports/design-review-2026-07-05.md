# Rodi Mercado — Diseño vs. Implementación

> **Archivado.** Snapshot puntual del 2026-07-05. No refleja el estado actual del código — para eso ver `docs/`. Se conserva como insumo histórico de las fases en `.context/plans/`.

Contraste entre `apps/storefront/design-reference/ecommerce-test/` (tokens y mockups de página en JSX) y el código realmente en ejecución en `apps/storefront/src`, más un análisis de qué contenido necesitaría endpoints nuevos del backend.

| | |
|---|---|
| **Fecha** | 2026-07-05 |
| **App real** | `apps/storefront` (Next.js, puerto 8000) |
| **Referencia de diseño** | `apps/storefront/design-reference/ecommerce-test/` |
| **Variante diseñada usada** | HomeV1 "Classic supermarket" (de 3 variantes de home y 3 de PDP en el archivo) |

> **Corrección de ruta:** el reporte de QA anterior (`QA-REPORT-2026-07-05.md`) se probó contra la app correcta, pero quedó guardado por error en `dtc-starter/apps/storefront/docs/` — una copia de referencia sin tocar del starter de Medusa, no el árbol que sirve `:8000`. Este documento vive en el lugar correcto (`charlie-store/docs/`, junto a `architecture.md`, `storefront.md`, `backend.md`). Vale la pena mover el reporte de QA aquí también en algún momento.
>
> **Actualización 2026-07-05 (segunda pasada):** verifiqué dos puntos directamente contra el código y el backend corriendo, y corrijo lo que decía antes: **Brand está más avanzado de lo reportado** (el link Product↔Brand y el hook de asignación automática ya existen) y **el umbral de envío gratis no tiene ninguna regla real detrás** (confirmado, no solo "sin verificar"). Ver el detalle en cada sección y en el análisis de backend consolidado: [`backend-gap-analysis-2026-07-05.md`](./backend-gap-analysis-2026-07-05.md). El estado de pagos (Stripe vs. otra pasarela) se analiza aparte en [`payment-gateway-analysis-2026-07-05.md`](./payment-gateway-analysis-2026-07-05.md).

## Resumen

Los **tokens de diseño (color, tipografía) están portados fielmente** — no es una reinterpretación, son los mismos valores hex y las mismas tres fuentes de Google, con comentarios en el código que citan el archivo de diseño de origen. La página de inicio, en cambio, implementa solo **4 de las 11 secciones** que especifica el diseño (HomeV1): faltan por completo el banner de oferta relámpago, dos bloques promocionales, la franja de marcas y el signup de newsletter — no están ocultos ni a medio hacer, simplemente no existe código para ellos. El bug de la bandera/región del reporte de QA anterior resulta ser **intención de diseño no reconciliada con el backend real**, no un error de binding: el diseño entero asume una única región Colombia/COP que nunca se sembró.

---

## Tokens de diseño (color, tipografía) — Coincide

Port disciplinado, no una aproximación. Mismos valores, mismas fuentes, y hasta una página dev para verificarlo en vivo.

- **Paleta y tipografía 1:1.** Los tokens del diseño — rojo `#E63946`, amarillo `#FFC233`, verde `#0F7A3E`, neutros cálidos — y las tres fuentes (Bricolage Grotesque para display, Manrope para cuerpo, JetBrains Mono para datos) están reproducidos exactamente en el código real, con un comentario que cita el archivo de diseño como fuente.
  - *Evidencia:* `design-reference/ecommerce-test/tokens.jsx:4-37` → `src/lib/theme/rodi-tokens.ts:1-29` · fuentes en `src/app/layout.tsx:2,6-22`
- **Sistema de utilidades consistente + página de referencia viva.** Clases `bg-rm-red`, `text-rm-yellow`, `rounded-rm-lg` se usan de forma consistente en todos los componentes `rodi-*`. Existe además una ruta `/design-system` (enlazada desde el footer real) que renderiza las muestras de color en vivo.
  - *Evidencia:* `src/app/[countryCode]/(main)/design-system/page.tsx`

## Página de inicio — 4 / 11 secciones

De las 11 secciones que especifica HomeV1, solo 4 existen en código — y esas 4 se ven "pobres" en la app real solo porque el catálogo no fue resembrado (ver análisis de backend).

- ✅ **Hero + trust strip — implementados casi palabra por palabra.** "Llenamos tu mercado en 90 min.", el pill "Hasta 40% OFF", las dos tarjetas laterales ("Marcas propias Rodi…", "Orgánicos…") y la franja de 4 iconos (Envío gratis / Entrega 90 min / Pago seguro / Frescos garantizados) coinciden con el copy del diseño.
  - *Evidencia:* `design-reference/.../home.jsx:7-87` → `RodiHomePromoCards` + `RodiTrustStrip`, `src/app/[countryCode]/(main)/page.tsx:32-48`
- 🟡 **Grid de categorías — estructura correcta, contenido equivocado.** El diseño pide una grilla de 14 categorías de supermercado (Frescos, Despensa, Lácteos, Carnes…) con emoji y color de superficie por categoría. `RodiCategoryTiles` replica la estructura, pero el backend real solo tiene las categorías de ropa del seed de demo de Medusa (Shirts/Sweatshirts/Pants/Merch) — por eso se ven 4-5 tiles en vez de 14.
  - *Evidencia:* `design-reference/.../data.jsx:13-28` (14 categorías) vs. `RodiCategoryTiles` con datos reales del backend
- ❌ **Banner de oferta relámpago (countdown).** "Air Fryer Philips 6L · 28% OFF" con temporizador de cuenta regresiva. No existe ningún componente de flash-sale en `src/modules/home`.
  - *Evidencia:* `design-reference/.../home.jsx:99-124`
- ❌ **Filas curadas por categoría ("Frescos", "Hogar y cuidado").** El diseño arma dos secciones de producto curadas filtrando por categoría específica. La implementación real solo tiene un `FeaturedProducts` genérico que recorre colecciones de Medusa, sin curaduría por categoría.
  - *Evidencia:* `design-reference/.../home.jsx:137-172`
- ❌ **Bloque promocional "Recetas de la semana" + "Suscripción Rodi+".** Distinto de las tarjetas del hero (esas sí existen). Este segundo bloque promocional no tiene ningún código correspondiente.
  - *Evidencia:* `design-reference/.../home.jsx:147-162`
- ❌ **Franja de marcas (16 logos).** No implementada en absoluto.
  - *Evidencia:* `design-reference/.../home.jsx:175-187`
- ❌ **Signup de newsletter.** No existe ningún formulario de captura de email en home ni en el resto del sitio.
  - *Evidencia:* `design-reference/.../home.jsx:190-206`

## Listado de categoría (PLP) — Parcial, gap auto-documentado

El sidebar de filtros existe pero solo tiene el control de orden — y el propio código lo admite en un comentario, no es un descubrimiento nuestro.

- 🟡 **Sidebar de filtros: solo "Ordenar" implementado.** El diseño pide un sidebar sticky de 260px con slider de rango de precio, checkboxes de marca y de promociones. `RodiPlpFilters` reproduce el contenedor pero el propio código dice: *"Más filtros (marca, precio, promociones) en una próxima iteración."*
  - *Evidencia:* `design-reference/.../pages.jsx:6-60` → `src/modules/store/components/rodi-plp-filters/index.tsx:31-48` (comentario en línea 43-45)
- ℹ️ **Chips de subcategoría — existen, sin verificar en profundidad.** `RodiCategoryChips` existe y coincide estructuralmente con el diseño, pero esta revisión no verificó su contenido/wiring en detalle ni recorrió páginas `/categories/[handle]` reales — queda pendiente de una pasada dedicada.
  - *Evidencia:* `src/modules/store/components/rodi-category-chips/`

## Header / Footer / Badge de región — Refina el reporte de QA anterior

No es un bug de binding: el diseño completo asume una sola tienda en Colombia/COP y nunca contempló un selector multi-región.

- ℹ️ **Solo la bandera está hardcodeada en el header — no la moneda.** El nombre de país *sí* se calcula dinámicamente desde `regions`/`countryCode` reales (por eso "Denmark"→"Spain" cambió correctamente al probarlo). "EUR" no está fijo: Dinamarca, España, Francia, Alemania, Italia, Suecia y UK comparten de verdad una única región EUR en el seed de Medusa, así que ver "EUR" en ambas es dato real, no un bug. Lo único literal y sin condición es el emoji `🇨🇴`.
  - *Evidencia:* `src/modules/layout/components/rodi-top-bar/index.tsx:12-26,45`
- ❌ **El footer sí es 100% estático.** `🇨🇴 Colombia · COP` no lee ningún dato — no intenta enlazar con `region` en absoluto.
  - *Evidencia:* `src/modules/layout/templates/footer/index.tsx:115`
- ℹ️ **El diseño nunca incluyó un selector de región.** `data.jsx:4-10` define una sola `REGION = Colombia/COP`. No hay ningún equivalente a un selector de país en `pages.jsx`/`shared.jsx`/`home.jsx`. La bandera colombiana fija es literalmente lo que el diseño pedía, bajo el supuesto — nunca cumplido — de que el backend se sembraría con una región Colombia real. La funcionalidad multi-región EU es herencia sin tocar del starter de Medusa, montada debajo de una UI pensada para una sola región fija.

## Idioma — Gap de cobertura, no de sistema

El diseño es 100% español. Donde existe un componente `rodi-*` dedicado, está en español; donde quedó el componente original de Medusa sin reemplazar, quedó en inglés. No hay librería de i18n de por medio — es hardcodeo por componente.

- **Patrón consistente: rodi-\* = español, stock Medusa = inglés.** Formulario de dirección, Perfil, Direcciones y el bloque "Need help" de la confirmación de pedido son componentes originales del starter nunca re-vestidos con un wrapper `rodi-*` — de ahí el inglés detectado en el reporte de QA.
- **`<html lang="en">` contradice un diseño 100% en español.** Corrección de una línea, consistente con la intención del diseño.
  - *Evidencia:* `src/app/layout.tsx:31`

## Página de producto (PDP) — No comparado en profundidad

El diseño incluye rating, conteo y distribución de reseñas; la PDP real no muestra nada de eso — coherente con que no existe ninguna fuente de datos de reseñas (ver backend). No se hizo un diff línea por línea completo; queda como siguiente paso si se quiere profundizar.

---

## Análisis de endpoints de backend

Ya existe un módulo custom real en el backend (`apps/backend/src/modules/brand`, con CRUD en `/admin/brands`) que prueba que el patrón "módulo + ruta" funciona — solo falta extenderlo. `api/store/custom` y `api/admin/custom` son stubs de tutorial sin relación con Rodi Mercado.

| Contenido del diseño | Fuente actual | Recomendación |
|---|---|---|
| Catálogo real (14 categorías, 32 productos, precios en COP) | Falta — sigue el seed demo de ropa de Medusa | No es un endpoint nuevo, es un **re-seed**. `/store/products` y `/store/product-categories` ya soportan esta forma de datos. |
| Región Colombia/COP | Falta — regiones actuales son EU (Denmark, Spain…) | Sembrar una región `co` real en el admin de Medusa. `/store/regions` ya funciona, solo devuelve el set equivocado. |
| Rating + conteo/distribución de reseñas por producto | No existe ninguna entidad de reseñas en Medusa core | **Nuevo módulo** `review` (mismo patrón que `brand`) + `GET /store/products/:id/reviews` y un agregado `GET /store/reviews/summary?product_id=`. |
| Emoji/icono y color de superficie por categoría | No existe campo para esto en `product_category` | No vale la pena un campo de backend para ~14 valores decorativos: un mapa estático `handle → {emoji, token}` en el frontend es más barato. Solo justifica backend si alguien no-técnico necesita editarlo sin deploy. |
| Banners de home (oferta relámpago, "Recetas de la semana", franja de marcas, newsletter) | No implementado ni en frontend | Mismo criterio que las tarjetas del hero que sí existen hoy (hardcodeadas): mantenerlo estático en frontend. Solo construir `GET /store/home-content` si de verdad hay alguien de marketing editando esto sin pasar por un deploy. |
| Stats de marketing ("12.4k reseñas 5★", "90 min entrega", "$80k envío gratis") | Copy hardcodeado en frontend hoy | Dejarlo estático — "12.4k reseñas" ya es ficticio mientras no exista el módulo de reseñas. Si ese módulo se construye, ese número específico debería pasar a ser un agregado real en vez de seguir siendo una cifra inventada. |
| Umbral de envío gratis ("$80.000") | **Confirmado: no existe.** Revisé `initial-data-seed.ts` — no hay ninguna promoción ni regla de shipping con ese monto. Es copy sin respaldo real. | Crear una promoción real de envío gratis con ese umbral en el admin, o quitar la cifra del copy si no se va a implementar pronto. |
| Marca por producto ("Alquería", "Philips"…) | **Más avanzado de lo reportado inicialmente.** Ya existe: módulo `brand` completo, el **link Product↔Brand** (`src/links/product-brand.ts`), un **hook que asigna `brand_id` automáticamente** al crear un producto (`src/workflows/hooks/created-product.ts`), y CRUD admin + widget. Probé en vivo `GET /store/products?fields=id,title,+brand.*` contra el backend real y respondió sin error — la expansión ya es válida en la API pública, solo que ningún producto tiene marca asignada todavía. | Mostrar la marca en PDP/PLP **no necesita ningún cambio de backend**, solo pedir el campo en las queries del storefront. Un `GET /store/brands` solo hace falta si quieren un filtro/listado de marcas en el PLP. |

---

## Lista de prioridades

1. **Resembrar el backend con la marca real** (región Colombia/COP, categorías/productos de `data.jsx`). Una sola acción arregla el mismatch de bandera/región/moneda, puebla el grid de categorías correctamente, y desbloquea casi todo lo demás — el resto de la lista es cosmético en comparación.
2. **Asignar marcas a productos y pedir el campo `brand` en las queries del storefront.** El link y el hook de asignación ya existen — es el gap más barato de toda la lista, no requiere tocar el backend salvo que además quieran un endpoint de listado/filtro (`GET /store/brands`).
3. **Decidir el destino de las 4 secciones de home faltantes** (flash-sale, promo-duo, franja de marcas, newsletter). Hoy están simplemente ausentes sin ningún tracking — o se implementan o se recortan formalmente del alcance.
4. **Portar las pantallas de Medusa stock que quedaron en inglés** a componentes `rodi-*` en español (formulario de dirección, perfil, direcciones, bloque "Need help"). Mismo patrón ya probado en el resto del código, solo falta terminarlo.
5. **Módulo de reseñas/rating.** Solo vale la pena si el stat "12.4k reseñas" y las estrellas de la PDP van a salir a producción de verdad; si no, quitar esa cifra del copy para no citar un número falso.
6. **Corregir `<html lang="en">` → `lang="es"`** en `src/app/layout.tsx:31`. Una línea, coherente con la intención 100% en español del diseño.

---

*Fuentes: `design-reference/ecommerce-test/*.jsx` vs. `apps/storefront/src` y `apps/backend/src`. Complementa el reporte de QA end-to-end del 2026-07-05.*
