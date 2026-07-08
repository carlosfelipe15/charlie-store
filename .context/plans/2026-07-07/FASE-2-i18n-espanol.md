# Fase 2 — i18n a español

## Objetivos
Traducir los componentes stock de Medusa que quedaron en inglés (no hay librería i18n, es hardcodeo por componente), corregir `<html lang="en">` y un typo de "succesfully".

## Cambios por archivo
- `apps/storefront/src/app/layout.tsx` — `lang="en"` → `lang="es"`.
- `apps/storefront/src/modules/account/components/account-info/index.tsx` — botones "Cancel"/"Edit"/"Save changes" → español; typo **"succesfully" → "correctamente"** (badge de éxito compartido por todos los editores de perfil).
- `apps/storefront/src/app/[countryCode]/(main)/account/@dashboard/profile/page.tsx` y `.../addresses/page.tsx` — metadata + copy visible traducidos.
- Traducción mecánica delegada a un sub-agente con glosario fijo (para evitar tocar lógica/`name=`/`data-testid=`), aplicada a:
  `account-nav`, `checkout/components/shipping-address`, `checkout/components/billing_address`, `account/components/profile-billing-address`, `account/components/address-card/add-address.tsx`, `account/components/address-card/edit-address-modal.tsx`, `account/components/profile-name`, `account/components/profile-email` *(reescrito de nuevo en Fase 8)*, `account/components/profile-phone` *(reescrito de nuevo en Fase 8)*, `order/components/order-details` (incluye fix de typo `sata-testid` → `data-testid`), `order/components/shipping-details`, `order/components/payment-details`.

## Decisiones clave
- Traducción delegada a un sub-agente con **reglas estrictas**: solo strings visibles (`label=`, `placeholder=`, texto JSX), nunca `name=`/`id=`/`data-testid=`/lógica. Glosario fijo compartido (First name→Nombre, Save→Guardar, etc.) para consistencia entre archivos.
- No se instaló ninguna librería de i18n — se mantiene el patrón existente del proyecto (hardcodeo por componente, componentes `rodi-*` en español vs. stock Medusa en inglés).

## Pendientes para la próxima sesión
- `profile-email` y `profile-phone` fueron traducidos en esta fase pero **reescritos de nuevo en Fase 8** (email pasó a texto de solo lectura; phone solo tuvo un rename de export) — su contenido en español actual data de Fase 8, no de esta fase.
- Las páginas `not-found.tsx` (`src/app/not-found.tsx`, `(main)/not-found.tsx`, `(checkout)/not-found.tsx`, `(main)/cart/not-found.tsx`) **siguen en inglés** — no estaban en el alcance de la auditoría original y no se tocaron.
- No se hizo una segunda pasada de grep exhaustivo por todo `src/` buscando inglés residual fuera de los archivos ya identificados en el QA report — podría haber strings sueltos no detectados.

## Consejos para el siguiente agente
- Antes de traducir un componente nuevo, revisa el glosario ya usado (ver tabla en el prompt del sub-agente de esta fase, replicable): First name→Nombre, Last name→Apellidos, Address→Dirección, Postal code→Código postal, State/Province→Departamento/Provincia, Save changes→Guardar cambios, etc. Mantener consistencia evita que la app se sienta traducida a medias.
- Si se traduce un componente con `useActionState`, verificar que el mensaje de error por defecto (`errorMessage = "..."`) también esté en español — es fácil dejarlo en inglés porque no aparece en el JSX visible a primera vista.
