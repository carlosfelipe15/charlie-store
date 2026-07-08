# Índice de memoria — Charlie Store

Punto de entrada a `.context/`. Actualizar cada vez que cambie la fase activa o se shippee un feature.

**Última actualización:** 2026-07-08

## Fase actual

Ninguna fase formal en curso — las 8 fases planificadas (`plans/2026-07-07/`) están cerradas. Trabajo actual: iteración sobre `backlog.md` y extensiones puntuales a features ya shippeadas (ver `features/`).

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

## Features con changelog propio

Cambios a una feature **posteriores** a su fase inicial se registran aquí en vez de reabrir el doc de la fase:

| Feature | Doc | Último cambio relevante |
|---------|-----|--------------------------|
| Brands | [`features/brands.md`](./features/brands.md) | CRUD completo (update/delete de marca, reasignación en producto existente, widget editable) — posterior a Fase 4 |

Reviews (Fase 7) no tiene entradas posteriores todavía; cuando las haya, van en `features/reviews.md`.

## Estado del backlog

Ver [`backlog.md`](./backlog.md) para el detalle completo. Resumen al 2026-07-08: 1 bug bloqueante activo (selector de región no accesible en desktop), 0 implementaciones pendientes registradas, 0 deuda técnica registrada.

## Pendientes que cruzan sesiones

- **Reviews (Fase 7)**: datos de prueba en la BD de desarrollo — cliente `review-qa@example.com` y una reseña sobre `prod_01KRYAHH1D05WP9W1EXTE47HX6`. No se ha pedido limpiarlos. Sin admin UI de moderación ni edición/borrado de reseña propia.
- **Cuenta (Fase 8)**: cambio de contraseña y de email del cliente siguen sin implementar (restricciones reales de la API de Medusa v2, no bugs) — ver decisiones en `plans/2026-07-07/FASE-8-endurecimiento-deuda-tecnica.md`.
- `apps/storefront/next.config.js` sigue con `typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds` en `true` — hallazgo documentado en Fase 8, no remediado.
