# Índice de memoria — Charlie Store

Punto de entrada a `.context/`. Actualizar cada vez que cambie la fase activa o se shippee un feature.

**Última actualización:** 2026-07-24 (dos fixes puntuales de UI, fuera del flujo de `backlog.md`: mega menú "Todas las categorías" ahora muestra todas las categorías — commit `98cb8b4` — y el modal de direcciones mantiene los botones de acción dentro del panel cuando el contenido desborda — commit `1476da3`)

Actualización anterior — 2026-07-23 (auditoría de "Mi cuenta"/Perfil vs. diseño de referencia — ver sección "🔍 Auditoría: Sección 'Mi cuenta' vs. diseño de referencia" en `backlog.md`: `[UI/PEDIDOS]` como hallazgo principal, `[UI/DIRECCIONES]`, `[CLEANUP]` de `account-nav`, y `[FEATURE/CUENTA-FIDELIZACION]` evaluado y diferido)

Actualización anterior — 2026-07-19 (análisis de factibilidad + plan propuesto de Zonas de entrega por Provincia/Municipio — ver "Pendientes que cruzan sesiones" y `plan-zonas-entrega-provincia-municipio.md`; sin decisión de ejecución)

## Fase actual

Ninguna fase formal en curso — las 11 fases planificadas están cerradas (8 en `plans/2026-07-07/`, 2 en `plans/2026-07-08/`, 1 en `plans/2026-07-18/`). Trabajo actual: iteración sobre `backlog.md` y extensiones puntuales a features ya shippeadas (ver `features/`).

## Fases completadas

| Fase | Carpeta | Resumen |
|------|---------|---------|
| 1 — Bugs y QA críticos | [`plans/2026-07-07/FASE-1-bugs-qa-criticos.md`](./plans/2026-07-07/FASE-1-bugs-qa-criticos.md) | Corrección de bugs bloqueantes detectados en QA |
| 2 — i18n español | [`plans/2026-07-07/FASE-2-i18n-espanol.md`](./plans/2026-07-07/FASE-2-i18n-espanol.md) | Traducción del storefront a español |
| 3 — Región dinámica | [`plans/2026-07-07/FASE-3-region-dinamica.md`](./plans/2026-07-07/FASE-3-region-dinamica.md) | Manejo dinámico de región/moneda |
| 4 — Marca (Brand) | [`plans/2026-07-07/FASE-4-marca-brand.md`](./plans/2026-07-07/FASE-4-marca-brand.md) | Versión inicial del módulo Brand (creación + asignación) |
| 5 — Categorías y diseño | [`plans/2026-07-07/FASE-5-categorias-diseno.md`](./plans/2026-07-07/FASE-5-categorias-diseno.md) | Ajustes de categorías y diseño visual |
| 6 — Secciones del home | [`plans/2026-07-07/FASE-6-secciones-home.md`](./plans/2026-07-07/FASE-6-secciones-home.md) | Secciones adicionales de la home |
| 7 — Módulo de reseñas | [`plans/2026-07-07/FASE-7-modulo-resenas.md`](./plans/2026-07-07/FASE-7-modulo-resenas.md) | Módulo `review` completo (backend + PDP), ver [`docs/custom-features/reviews.md`](../docs/custom-features/reviews.md) |
| 8 — Endurecimiento y deuda técnica | [`plans/2026-07-07/FASE-8-endurecimiento-deuda-tecnica.md`](./plans/2026-07-07/FASE-8-endurecimiento-deuda-tecnica.md) | Cuenta (password/email), cantidad de carrito real, error boundaries, limpieza de stubs |
| 9 — Favoritos | [`plans/2026-07-08/FASE-9-favoritos.md`](./plans/2026-07-08/FASE-9-favoritos.md) | Módulo `favorite` completo (backend + toggle en PLP/PDP/cuenta), ver [`docs/custom-features/favorites.md`](../docs/custom-features/favorites.md) |
| 10 — Filtro de marca en PLP | [`plans/2026-07-08/FASE-10-filtro-marca-index-module.md`](./plans/2026-07-08/FASE-10-filtro-marca-index-module.md) | Index Module (`@medusajs/index`), endpoint `/store/products-list`, checkboxes de marca en `rodi-plp-filters` — incluye un bug de Medusa 2.15.2 encontrado y evitado (ver doc) |
| 11 — Atributos/Calificación/Promociones en PLP | [`plans/2026-07-18/FASE-11-plp-atributos-calificacion-promociones.md`](./plans/2026-07-18/FASE-11-plp-atributos-calificacion-promociones.md) | Extiende `/store/products-list` (Fase 10) con `tag_id`/`rating_gte`/`on_sale` combinables por intersección de ids; nuevo script `seed-product-attributes.ts`; fila de chips de filtros activos (`rodi-active-filter-chips`); Precio, 2x1/Combos y "Más vendidos" quedan fuera, este último documentado como `[FEATURE/PLP-MAS-VENDIDOS]` |

## Features con changelog propio

Cambios a una feature **posteriores** a su fase inicial se registran aquí en vez de reabrir el doc de la fase:

| Feature | Doc | Último cambio relevante |
|---------|-----|--------------------------|
| Brands | [`features/brands.md`](./features/brands.md) | CRUD completo (update/delete de marca, reasignación en producto existente, widget editable) — posterior a Fase 4. Filtrado de productos por marca (Index Module, `filterable` en `product-brand.ts`) agregado en Fase 10 |
| Reviews | [`features/reviews.md`](./features/reviews.md) | Validación de `product_id` existente (step compartido con `favorite`) + workflow/ruta de delete propio (`DELETE /store/reviews/:id`) — posterior a Fase 7 |
| Favorites | [`features/favorites.md`](./features/favorites.md) | Misma validación de `product_id` existente aplicada a `create-favorite` (retrofit del step compartido con `review`) — posterior a Fase 9 |
| Zones | [`docs/custom-features/zones.md`](../docs/custom-features/zones.md) | Módulo `zone` (Provincia→Municipio), filtro de catálogo, aviso blando zona↔carrito/checkout, widget admin — ver detalle de fases en "Pendientes que cruzan sesiones" abajo |

## Estado del backlog

Ver [`backlog.md`](./backlog.md) para el detalle completo. Estado al 2026-07-24: **1 bug activo** (`[BUG/ADMIN-INDEX]`, detectado 2026-07-12 — `count` incorrecto en `/admin/products` bajo filtros, bug de core de Medusa 2.15.2), varios ítems resueltos recientemente (rendimiento del storefront, galería compacta de PDP, feature completo de Zonas de entrega con su plan de cierre del 07-23/24, entre otros), features pendientes (combos de productos — plan guardado sin ejecutar; filtro de precio y 2x1/combos en PLP; tabs de PDP + Preguntas; bottom tab bar mobile; mejoras de búsqueda; `[UI/PEDIDOS]` sin migrar al diseño Rodi Mercado, hallazgo principal de la auditoría de "Mi cuenta"), y varios ítems de deuda técnica menor (duplicados de reseñas sin constraint, swatches de color, contenido hardcodeado del mega menú, mensajes de error poco descriptivos en Favoritos).

**Actualización 2026-07-18 (Fase 11):** dentro de `[FEATURE/PLP-FILTROS]`, Atributos/Calificación/Promociones("En oferta")/chips de filtros activos quedan resueltos — solo Precio y 2x1/Combos (bloqueado por `[FEATURE/COMBOS]`) siguen pendientes de ese ítem. Se agregó un ítem nuevo, `[FEATURE/PLP-MAS-VENDIDOS]`, para el orden por ventas que se evaluó y se decidió no construir en esta pasada. Ver `backlog.md` y `plans/2026-07-18/FASE-11-plp-atributos-calificacion-promociones.md` para el detalle.

## Pendientes que cruzan sesiones

- **Combos (bundles de productos)**: plan de implementación completo guardado en [`plan-combos-productos.md`](./plan-combos-productos.md), a la espera de decisión de ejecución — no se ha empezado a construir. Responde al ítem `[FEATURE/COMBOS]` de `backlog.md`.

- **Zonas de entrega por Provincia/Municipio ("Entregar en")**: análisis de factibilidad + plan de implementación en fases en [`plan-zonas-entrega-provincia-municipio.md`](./plan-zonas-entrega-provincia-municipio.md). **Decisiones de negocio cerradas (2026-07-19): país = Cuba** (definitivo), **región se repunta a Cuba sin migración de moneda** (CUP no se usa, precios EUR/USD intactos — Fase 0), **disponibilidad permisiva**, **Fase C (checkout) entra**, **demo pero production-close**. Enfoque: módulo custom `zone` (Provincia→Municipio) + link N–M producto↔municipio + filtro `zone_id` en `/store/products-list` (patrón `brand_id` de Fase 10) + selector "Entregar en" en cookie; NO se reutiliza el módulo `Region` (queda una sola región, ahora Cuba). Estado: **Fases 0–D completas** (0: región→Cuba; A: backend de disponibilidad — módulo `zone`, link N–M plano, filtro `zone_id` con fallback permisivo vía `query.graph()` sin Index Engine, seed 16 provincias / 168 municipios; B: storefront — selector "Entregar en" Provincia→Municipio en cookie que reemplaza al selector de región; C: entregabilidad en checkout — geo-zones por provincia + país `cu` robusto, envío plano; D: admin — widget de asignación producto↔zona en el detalle de producto, sin CRUD de Provincia/Municipio por ser datos fijos). **2026-07-23**: plan de cierre ejecutado (`.claude/plans/arma-un-plan-para-abundant-shell.md`) — aviso blando + limpieza automática del carrito al cambiar de zona (catálogo y checkout) con productos no disponibles, sync bidireccional cookie↔dirección de envío en checkout, Fase D completada, y corrección de la deuda técnica de las geo-zones de fulfillment (código ISO real con una sola fuente de verdad, geo-zones de provincia inertes eliminadas — diferenciación de tarifas por provincia sigue fuera de alcance, ver `geo-zones-fulfillment.md`). **2026-07-25**: botón "Cambiar" de la PDP conectado (tarjeta dinámica + `ZonePickerModal`, selección extraída a un hook compartido con `RodiZonePicker`) y zona activa sincronizada con la dirección default del cliente al iniciar sesión sin cookie. Detalle completo en `backlog.md`, ítem `[FEATURE/ZONAS-ENTREGA]`, y doc de referencia [`docs/custom-features/zones.md`](../docs/custom-features/zones.md).

- **Reviews (Fase 7)**: datos de prueba en la BD de desarrollo — cliente `review-qa@example.com` y una reseña sobre `prod_01KRYAHH1D05WP9W1EXTE47HX6`. No se ha pedido limpiarlos. Sin admin UI de moderación ni edición/borrado de reseña propia.
- **Cuenta (Fase 8)**: cambio de contraseña y de email del cliente siguen sin implementar (restricciones reales de la API de Medusa v2, no bugs) — ver decisiones en `plans/2026-07-07/FASE-8-endurecimiento-deuda-tecnica.md`.
- `apps/storefront/next.config.js` sigue con `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds` en `true` — hallazgo documentado en Fase 8, no remediado.
- **Índice de búsqueda (Fase 10)**: `MEDUSA_FF_INDEX_ENGINE=true` está activo — antes de agregar cualquier ruta nueva que use `query.index()` o que toque `/store/products`, leer la sección "Índice de búsqueda cross-módulo" en `AGENTS.md` y `plans/2026-07-08/FASE-10-filtro-marca-index-module.md`: hay un bug real de Medusa 2.15.2 donde este flag rompe el filtrado por categoría en la ruta core, y no se puede overridear una ruta core solo con un `route.ts` de proyecto (los middlewares de core no se reemplazan). `apps/storefront/src/lib/data/products.ts` ya apunta a `/store/products-list` (no al `/store/products` core) por esta razón.
