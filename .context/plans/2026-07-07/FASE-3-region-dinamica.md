# Fase 3 — Región dinámica (badge superior + footer)

## Objetivos
Que la bandera/etiqueta/moneda del header y del footer sigan la región activa en toda la página (sin crear una región Colombia — decisión explícita del usuario: las regiones se gestionan aparte).

## Cambios por archivo
- `apps/storefront/src/lib/util/country.ts` — nuevo. `countryToFlag(iso2)` deriva el emoji de bandera de un código ISO 3166-1 alpha-2 vía símbolos regionales Unicode (sin mapa hardcodeado por país). `getRegionBadge(regions, countryCode)` retorna `{flag, label}` buscando el país dentro de las regiones disponibles.
- `apps/storefront/src/modules/layout/components/region-badge/index.tsx` — nuevo. Componente cliente `<RegionBadge regions={...} className={...} />` compartido, usa `useParams()` para leer `countryCode` de la URL.
- `apps/storefront/src/modules/layout/components/rodi-top-bar/index.tsx` — refactorizado para usar `RegionBadge` (antes: etiqueta dinámica pero bandera `🇨🇴` hardcodeada).
- `apps/storefront/src/modules/layout/templates/footer/index.tsx` — antes 100% estático (`🇨🇴 Colombia · COP`). Ahora hace `listRegions()` (server component) y renderiza `<RegionBadge>`.

## Decisiones clave
- La bandera se calcula **programáticamente** desde el ISO code en vez de mantener un mapa `{país: emoji}` — así cualquier región nueva que el usuario agregue (Colombia u otra) se refleja automáticamente sin tocar código.
- Lógica centralizada en un único helper (`country.ts`) y un único componente (`region-badge`) para que top-bar y footer nunca puedan volver a desincronizarse — ese fue exactamente el bug original del QA report.

## Pendientes para la próxima sesión
- No existe todavía ninguna región Colombia/COP en el seed — el badge hoy refleja las regiones EU existentes (Denmark, Spain, etc.). Esto es intencional: el usuario gestiona las regiones por su cuenta.
- No se verificó visualmente el footer en las 7 regiones EU distintas (solo se confirmó que compila y usa el mismo helper que el top-bar, ya probado en vivo en Fase 7/8 con `curl`).

## Consejos para el siguiente agente
- Cuando se agregue la región real (Colombia u otra), **no se requiere ningún cambio de código** — `RegionBadge` lee `listRegions()` en tiempo real. Basta con sembrar la región en el backend.
- Si se necesita el mismo patrón "bandera+etiqueta" en otro lugar (ej. selector de región en el menú hamburguesa), reusar `getRegionBadge()`/`countryToFlag()` de `@lib/util/country` en vez de reimplementar.
