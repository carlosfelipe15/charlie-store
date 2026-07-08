# 📋 Backlog Dinámico de Desarrollo

## 🚨 Errores y Bugs Activos (Bloqueantes)
*   [ ] **[UI/REGION]** El selector de región/país (`CountrySelect`) no es accesible en desktop.
    - *Detectado el:* 2026-07-08 por Carlos
    - *Impacto:* En viewport desktop (`small:` breakpoint y superior), el usuario no tiene forma de cambiar la región/moneda de la tienda desde el header. El único punto de acceso a `CountrySelect` es el componente `SideMenu`, que se renderiza con la clase `small:hidden` en [rodi-header-client.tsx:54-60](apps/storefront/src/modules/layout/components/rodi-header/rodi-header-client.tsx#L54-L60), por lo que solo aparece en mobile. El botón "Todas las categorías" del header desktop abre el mega menú de categorías (`RodiMegaMenu`), sin relación con la región. El bloque "Entregar en / Tu dirección" ([rodi-header-client.tsx:67-80](apps/storefront/src/modules/layout/components/rodi-header/rodi-header-client.tsx#L67-L80)) es texto estático sin funcionalidad. Como workaround temporal, la región puede cambiarse editando manualmente el segmento `countryCode` en la URL (ej. `/gb/store` → `/es/store`).
    - *Posible solución:* Integrar `CountrySelect` ([modules/layout/components/country-select/index.tsx](apps/storefront/src/modules/layout/components/country-select/index.tsx)) también en la vista desktop de `RodiHeaderClient`, por ejemplo sustituyendo o complementando el bloque estático "Entregar en / Tu dirección" para que funcione como selector real de región en todos los tamaños de viewport.

## 🛠️ Implementaciones Pendientes & Mejoras

## 🩹 Deuda Técnica y Refactorizaciones Minoritarias
