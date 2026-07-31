# Índice de memoria — Charlie Store

Punto de entrada a `.context/`. Actualizar cada vez que cambie la fase activa o se shippee un feature.

**Última actualización:** 2026-07-31 (feature "Más vendidos" implementado — módulo nuevo `product-sales-count` + link 1:1 + helper de ranking reutilizable + job diario de recomputo + `sort_by=best_selling` en `/store/products-list` + selector en el PLP; `[FEATURE/PLP-MAS-VENDIDOS]` cerrado en `backlog.md`, detalle en [docs/custom-features/best-sellers.md](../docs/custom-features/best-sellers.md))

Actualización anterior — 2026-07-24 (dos fixes puntuales de UI, fuera del flujo de `backlog.md`: mega menú "Todas las categorías" ahora muestra todas las categorías — commit `98cb8b4` — y el modal de direcciones mantiene los botones de acción dentro del panel cuando el contenido desborda — commit `1476da3`)

Actualización anterior — 2026-07-23 (auditoría de "Mi cuenta"/Perfil vs. diseño de referencia — ver sección "🔍 Auditoría: Sección 'Mi cuenta' vs. diseño de referencia" en `backlog.md`: `[UI/PEDIDOS]` como hallazgo principal, `[UI/DIRECCIONES]`, `[CLEANUP]` de `account-nav`, y `[FEATURE/CUENTA-FIDELIZACION]` evaluado y diferido)

Actualización anterior — 2026-07-19 (análisis de factibilidad + plan propuesto de Zonas de entrega por Provincia/Municipio; sin decisión de ejecución en ese momento — feature completado desde entonces, ver fila "Zones" en "Features con changelog propio" y el plan archivado en `plans/2026-07-19/plan-zonas-entrega-provincia-municipio.md`)

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
| Zones | [`docs/custom-features/zones.md`](../docs/custom-features/zones.md) | **Completo** — módulo `zone` (Provincia→Municipio), filtro de catálogo, aviso blando zona↔carrito/checkout, widget admin, picker "Entregar en" enganchado en la PDP y sync de zona al login. Plan de fases original (0–D), completado, archivado en [`plans/2026-07-19/plan-zonas-entrega-provincia-municipio.md`](./plans/2026-07-19/plan-zonas-entrega-provincia-municipio.md); historial de cierre completo en `backlog.md`, ítem `[FEATURE/ZONAS-ENTREGA]` |

## Estado del backlog

Ver [`backlog.md`](./backlog.md) para el detalle completo. Estado al 2026-07-29: **0 bugs activos** (`[BUG/ADMIN-INDEX]` — `count` incorrecto en `/admin/products` bajo filtros, bug de core de Medusa 2.15.2 — resuelto ese día con un override del handler `GET` en `apps/backend/src/api/admin/products/route.ts`), varios ítems resueltos recientemente (rendimiento del storefront, galería compacta de PDP, feature completo de Zonas de entrega con su plan de cierre del 07-23/24, entre otros), features pendientes (combos de productos — plan guardado sin ejecutar; filtro de precio y 2x1/combos en PLP; tabs de PDP + Preguntas; bottom tab bar mobile; mejoras de búsqueda; `[UI/PEDIDOS]` sin migrar al diseño Rodi Mercado, hallazgo principal de la auditoría de "Mi cuenta"), y varios ítems de deuda técnica menor (duplicados de reseñas sin constraint, swatches de color, contenido hardcodeado del mega menú, mensajes de error poco descriptivos en Favoritos).

**Actualización 2026-07-18 (Fase 11):** dentro de `[FEATURE/PLP-FILTROS]`, Atributos/Calificación/Promociones("En oferta")/chips de filtros activos quedan resueltos — solo Precio y 2x1/Combos (bloqueado por `[FEATURE/COMBOS]`) siguen pendientes de ese ítem. Se agregó un ítem nuevo, `[FEATURE/PLP-MAS-VENDIDOS]`, para el orden por ventas que se evaluó y se decidió no construir en esta pasada. Ver `backlog.md` y `plans/2026-07-18/FASE-11-plp-atributos-calificacion-promociones.md` para el detalle.

## Pendientes que cruzan sesiones

- **Combos (bundles de productos)**: plan de implementación completo guardado en [`plan-combos-productos.md`](./plan-combos-productos.md), a la espera de decisión de ejecución — no se ha empezado a construir. Responde al ítem `[FEATURE/COMBOS]` de `backlog.md`.

- **Reviews (Fase 7)**: datos de prueba en la BD de desarrollo — cliente `review-qa@example.com` y una reseña sobre `prod_01KRYAHH1D05WP9W1EXTE47HX6`. No se ha pedido limpiarlos. Sin admin UI de moderación ni edición/borrado de reseña propia.
- **Cuenta (Fase 8)**: cambio de contraseña y de email del cliente siguen sin implementar (restricciones reales de la API de Medusa v2, no bugs) — ver decisiones en `plans/2026-07-07/FASE-8-endurecimiento-deuda-tecnica.md`.
- `apps/storefront/next.config.js` sigue con `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds` en `true` — hallazgo documentado en Fase 8, no remediado.
- **Índice de búsqueda (Fase 10)**: `MEDUSA_FF_INDEX_ENGINE=true` está activo — antes de agregar cualquier ruta nueva que use `query.index()` o que toque `/store/products`, leer la sección "Índice de búsqueda cross-módulo" en `AGENTS.md` y `plans/2026-07-08/FASE-10-filtro-marca-index-module.md`: hay un bug real de Medusa 2.15.2 donde este flag rompe el filtrado por categoría en la ruta core, y no se puede overridear una ruta core solo con un `route.ts` de proyecto (los middlewares de core no se reemplazan). `apps/storefront/src/lib/data/products.ts` ya apunta a `/store/products-list` (no al `/store/products` core) por esta razón.
