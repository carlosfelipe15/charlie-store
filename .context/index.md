# Índice de memoria — Charlie Store

Punto de entrada a `.context/`. Actualizar cada vez que cambie la fase activa o se shippee un feature.

**Última actualización:** 2026-07-09 (Fases 9-10: favoritos + filtro de marca)

## Fase actual

Ninguna fase formal en curso — las 10 fases planificadas están cerradas (8 en `plans/2026-07-07/`, 2 en `plans/2026-07-08/`). Trabajo actual: iteración sobre `backlog.md` y extensiones puntuales a features ya shippeadas (ver `features/`).

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

## Features con changelog propio

Cambios a una feature **posteriores** a su fase inicial se registran aquí en vez de reabrir el doc de la fase:

| Feature | Doc | Último cambio relevante |
|---------|-----|--------------------------|
| Brands | [`features/brands.md`](./features/brands.md) | CRUD completo (update/delete de marca, reasignación en producto existente, widget editable) — posterior a Fase 4. Filtrado de productos por marca agregado en Fase 10 (ver `docs/custom-features/brands.md#5.1`) |

Reviews (Fase 7) y Favoritos (Fase 9) no tienen entradas posteriores todavía; cuando las haya, van en `features/reviews.md` / `features/favorites.md`.

## Estado del backlog

Ver [`backlog.md`](./backlog.md) para el detalle completo. Resumen al 2026-07-09: 0 bugs activos (los 4 detectados en la auditoría del 2026-07-08 quedaron resueltos), 6 resueltos recientemente (warning de key, selector de región, bloque de dirección, newsletter, secciones de home, y el feature completo de favoritos), 6 implementaciones pendientes (filtros de PLP por precio/promociones/atributos/calificación — marca ya resuelta; combos de productos — plan guardado, sin ejecutar; tabs de PDP + feature de Preguntas; elementos menores de PDP; bottom tab bar mobile — requiere decisión de producto; mejoras de búsqueda), 5 ítems de deuda técnica menor (duplicados de reseñas sin constraint, componente sin uso, swatches de color, badges de pago, contenido hardcodeado del mega menú).

## Pendientes que cruzan sesiones

- **Combos (bundles de productos)**: plan de implementación completo guardado en [`plan-combos-productos.md`](./plan-combos-productos.md), a la espera de decisión de ejecución — no se ha empezado a construir. Responde al ítem `[FEATURE/COMBOS]` de `backlog.md`.

- **Reviews (Fase 7)**: datos de prueba en la BD de desarrollo — cliente `review-qa@example.com` y una reseña sobre `prod_01KRYAHH1D05WP9W1EXTE47HX6`. No se ha pedido limpiarlos. Sin admin UI de moderación ni edición/borrado de reseña propia.
- **Cuenta (Fase 8)**: cambio de contraseña y de email del cliente siguen sin implementar (restricciones reales de la API de Medusa v2, no bugs) — ver decisiones en `plans/2026-07-07/FASE-8-endurecimiento-deuda-tecnica.md`.
- `apps/storefront/next.config.js` sigue con `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds` en `true` — hallazgo documentado en Fase 8, no remediado.
- **Índice de búsqueda (Fase 10)**: `MEDUSA_FF_INDEX_ENGINE=true` está activo — antes de agregar cualquier ruta nueva que use `query.index()` o que toque `/store/products`, leer la sección "Índice de búsqueda cross-módulo" en `AGENTS.md` y `plans/2026-07-08/FASE-10-filtro-marca-index-module.md`: hay un bug real de Medusa 2.15.2 donde este flag rompe el filtrado por categoría en la ruta core, y no se puede overridear una ruta core solo con un `route.ts` de proyecto (los middlewares de core no se reemplazan). `apps/storefront/src/lib/data/products.ts` ya apunta a `/store/products-list` (no al `/store/products` core) por esta razón.
