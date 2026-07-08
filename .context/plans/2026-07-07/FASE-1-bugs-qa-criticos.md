# Fase 1 — Bugs de QA (críticos y mayores)

## Objetivos
Corregir los hallazgos críticos/mayores del `QA-REPORT-2026-07-05.md`: código de promoción inválido con 500 silencioso, ausencia total de sistema de toast, transferencia de pedido sin feedback, radiogroup de método de envío con doble marcado, y enlaces legales/soporte que devolvían 404.

## Cambios por archivo

**Toast (nuevo, habilitador del resto de la fase)**
- `apps/storefront/src/modules/common/components/ui/toast.tsx` — nuevo. `ToastProvider` (context + portal + auto-dismiss a 5s) y hook `useToast()`. Sin dependencias nuevas.
- `apps/storefront/src/modules/common/components/ui/index.tsx` — reexporta `ToastProvider`/`useToast`, reemplaza el TODO.
- `apps/storefront/src/app/[countryCode]/(main)/layout.tsx` — monta `ToastProvider` envolviendo Nav/Footer/children.
- `apps/storefront/src/app/[countryCode]/(main)/account/layout.tsx` — limpia comentarios TODO de "re-add Toaster".

**Promoción inválida → 500 silencioso**
- `apps/storefront/src/lib/util/medusa-error.ts` — añade `getMedusaErrorMessage()` (no-throw), complementa a `medusaError()` (throw) que ya existía.
- `apps/storefront/src/lib/data/cart.ts` — `applyPromotions()` reescrita para **retornar** `{success, error}` en vez de lanzar (los server actions de Next.js enmascaran errores lanzados como 500 genérico en producción). `submitPromotionForm()` actualizado al nuevo contrato.
- `apps/storefront/src/modules/cart/components/rodi-cart-discount/index.tsx` — consume el nuevo resultado, muestra toast de éxito/error.
- `apps/storefront/src/modules/checkout/components/discount-code/index.tsx` — igual.

**Transferencia de pedido sin feedback**
- `apps/storefront/src/modules/account/components/transfer-request-form/index.tsx` — toast de éxito/error añadido; traducido a español de paso (formulario nunca se traduce aparte).

**Radiogroup de envío doble-marcado**
- `apps/storefront/src/modules/common/components/radio/index.tsx` — causa raíz: `aria-checked="true"` estaba **hardcodeado** ignorando el prop `checked`. Cambiado a `aria-checked={checked}` + `tabIndex={-1}`.
- `apps/storefront/src/modules/checkout/components/shipping/index.tsx` — traducidos 3 strings en inglés ("Pick up your order", "Store", "Choose a store near you") encontrados de paso.

**Enlaces legales/soporte en 404**
- `apps/storefront/src/app/[countryCode]/(main)/content/[slug]/page.tsx` — nuevo, SSG con `generateStaticParams` para `privacy-policy` y `terms-of-use`. **Copy es placeholder**, no texto legal real.
- `apps/storefront/src/app/[countryCode]/(main)/contact/page.tsx` — nuevo, incluye ancla `#devoluciones`.
- `apps/storefront/src/modules/order/components/help/index.tsx` — traducido; separa el href de "Devoluciones y cambios" (antes duplicaba `/contact`) hacia `/contact#devoluciones`.
- `apps/storefront/src/modules/account/components/register/index.tsx` — ya apuntaba a `/content/privacy-policy` y `/content/terms-of-use` (no se tocó, solo se creó el destino).

## Decisiones clave
- **Retornar en vez de lanzar** en server actions que alimentan un `try/catch` en el cliente: los errores lanzados por un server action se enmascaran como 500 genérico en producción por Next.js, incluso si el cliente los captura.
- **Toast propio en vez de `@medusajs/ui`**: el paquete no está instalado (confirmado en `package.json`); instalarlo solo para el Toaster habría sido una dependencia nueva innecesaria para un componente de ~140 líneas.
- El bug del radiogroup **no era de estado** (el estado `shippingMethodId`/`showPickupOptions` ya era correcto) sino de accesibilidad: el indicador visual dependía de `checked` pero `aria-checked` no, por eso herramientas basadas en accesibilidad (Playwright) veían "ambos marcados".

## Pendientes para la próxima sesión
- El copy de `/content/privacy-policy` y `/content/terms-of-use` es **placeholder inventado**, no texto legal real — debe reemplazarse antes de producción.
- `/contact` tiene datos de contacto ficticios (`ayuda@rodimercado.com`) — reemplazar con canal real.
- "Devoluciones y cambios" enlaza a una sección de la misma página de contacto, no a un flujo de devoluciones dedicado.

## Consejos para el siguiente agente
- Para cualquier nueva acción async que necesite feedback visual, usa `useToast()` desde `@modules/common/components/ui` — el provider ya está montado globalmente en `(main)/layout.tsx`. El grupo `(checkout)` **no** tiene el provider montado; si se necesita toast ahí, hay que montarlo aparte.
- Si un botón/radio "se ve bien pero Playwright reporta el estado incorrecto", revisa primero `aria-*` hardcodeado antes de asumir que es un bug de estado de React.
