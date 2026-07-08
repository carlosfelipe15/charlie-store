# Rodi Mercado — Estado de pagos y cómo abordar una pasarela distinta a Stripe

> **Archivado.** Snapshot puntual del 2026-07-05. No refleja el estado actual del código — para eso ver `docs/`. Se conserva como insumo histórico de las fases en `.context/plans/`.

Analiza el estado real de la integración de pagos (el storefront trae Stripe en el código, pero eso no significa que esté activo) y qué implicaría, según la documentación oficial de Medusa v2, incorporar otra pasarela — relevante porque el propio storefront ya promete métodos que Stripe no cubre.

| | |
|---|---|
| **Fecha** | 2026-07-05 |
| **Medusa** | v2.15.2 |
| **Método** | Lectura de `medusa-config.ts`, `package.json` del backend, `.env`/`.env.local`, componentes de pago del storefront, más consulta a la documentación oficial de Medusa |

## 1. Estado actual: Stripe está en el frontend, pero apagado en el backend

Verifiqué las tres capas:

- **`apps/backend/medusa-config.ts`** — el array `modules` solo registra el módulo custom `brand`. **No hay ningún módulo de Payment configurado, ni Stripe ni ningún otro.**
- **`apps/backend/package.json`** — no existe `@medusajs/medusa/payment-stripe` (ni ningún paquete de Stripe) entre las dependencias.
- **`apps/backend/.env`** — sin variables `STRIPE_API_KEY`/`STRIPE_WEBHOOK_SECRET`. **`apps/storefront/.env.local`** — `NEXT_PUBLIC_STRIPE_KEY=` vacía.

Mientras tanto, el **storefront sí tiene la integración de Stripe completa y lista**: `stripe-wrapper.tsx`, `payment-button/index.tsx`, `payment-container/index.tsx` y el mapa `paymentInfoMap` en `src/lib/constants.tsx:12-19` ya reconocen `pp_stripe_stripe`, `pp_stripe-ideal_stripe`, `pp_stripe-bancontact_stripe` y hasta PayPal (`pp_paypal_paypal`). Es exactamente lo que trae el starter oficial de Medusa "de fábrica", sin tocar.

**Consecuencia observada en QA:** al llegar al paso de pago del checkout, el único método disponible es **"Manual Payment"** (`pp_system_default`, el provider "sistema" que trae Medusa por defecto) — porque es el único que existe, no porque Stripe esté fallando.

**Conclusión:** activar Stripe hoy sería trivial — instalar `@medusajs/medusa/payment-stripe`, registrarlo en `medusa-config.ts`, y cargar las llaves — sin tocar el storefront, que ya está preparado. Pero antes de hacerlo vale la pena revisar si Stripe es siquiera la pasarela correcta para esta tienda (ver §2).

## 2. Por qué Stripe probablemente no es la pasarela correcta aquí

El propio storefront, en la franja de confianza del home, promete:

> **Pago seguro** — Tarjetas, PSE y contraentrega

- **PSE** (Pagos Seguros en Línea) es el sistema de transferencia interbancaria en línea usado en Colombia. Según la documentación de Stripe consultada, **Stripe no soporta PSE** — sus métodos son tarjetas, Bancontact, BLIK, giropay, iDEAL, Przelewy24, PromptPay y OXXO (México). Ninguno es PSE.
- **Contraentrega** (pago contra entrega / efectivo al recibir) tampoco es algo que Stripe procese — es, por definición, un pago que no pasa por ninguna pasarela.
- Todo lo demás en el diseño y el copy (bandera colombiana, footer "COP", "Mercado online de Latinoamérica") apunta a Colombia como mercado objetivo, no a Europa — que es justo donde Stripe/iDEAL/Bancontact tienen sentido.

En otras palabras: **aunque se activara Stripe hoy, seguiría sin cumplir dos de las tres promesas que ya están en pantalla.** El gap no es "falta configurar Stripe", es "la pasarela configurada (o por configurar) tiene que ser otra, o coexistir con otra".

Dato a favor: el "contraentrega" **ya está resuelto**, aunque no se note — el provider "Manual Payment" que ya usamos en todo el QA *es*, funcionalmente, un mecanismo de "marcar como pagado fuera del sistema", que es exactamente cómo se modela un pago contra-entrega en cualquier plataforma de e-commerce. Antes de construir nada nuevo para eso, solo hace falta renombrarlo/etiquetarlo como "Pago contraentrega" en vez de dejar el texto de desarrollo "Manual Payment — Attention: For testing purposes only" que vimos en producción durante el QA.

## 3. Arquitectura de proveedores de pago en Medusa v2

(Fuentes: [Payment Module Provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider), [How to Create a Payment Module Provider](https://docs.medusajs.com/resources/references/payment/provider), [Stripe Payment Provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe))

- Un proveedor de pago es un módulo cuyo servicio principal **extiende `AbstractPaymentProvider`** (de `@medusajs/framework/utils`). Un mismo módulo puede exponer varios providers.
- **Métodos obligatorios:** `initiatePayment`, `authorizePayment`, `capturePayment`, `getPaymentStatus`.
- **Métodos opcionales relevantes:** `cancelPayment`, `refundPayment`, `deletePayment`, `retrievePayment`, `updatePayment`, `getWebhookActionAndData` (así es como Medusa se entera de que un pago asíncrono —como una transferencia PSE— se confirmó, sin depender de que el usuario vuelva al navegador), `validateOptions`; y desde v2.5+, métodos para guardar métodos de pago (`createAccountHolder`, `savePaymentMethod`, `listPaymentMethods`, etc.), útiles para "guardar tarjeta" pero no imprescindibles para un lanzamiento inicial.
- **Registro:** se hace en `medusa-config.ts`, dentro del módulo `@medusajs/medusa/payment`, con un array `providers`. El id final del provider sigue el formato `pp_{identifier}_{id}` (por eso `pp_stripe_stripe`, `pp_system_default`, etc. — coincide con lo que ya está mapeado en `src/lib/constants.tsx` del storefront).
- **Multi-proveedor:** varios providers pueden coexistir y habilitarse/deshabilitarse **por región** desde el admin. Esto es clave: se puede tener Tarjetas (Stripe) + PSE (otra pasarela) + Contraentrega (Manual) activos **al mismo tiempo** en la región Colombia, exactamente como promete el badge de confianza.
- Referencia de implementación oficial: el propio [módulo de Stripe de Medusa](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe) sirve como plantilla de cómo se ve un provider completo.

## 4. Opciones concretas para PSE / mercado colombiano

Busqué en la documentación y el ecosistema de plugins de Medusa v2 qué tan resuelto está esto para Colombia/Latinoamérica:

| Pasarela | Estado en el ecosistema Medusa v2 | Nota |
|---|---|---|
| **Stripe** (oficial) | Paquete oficial `@medusajs/medusa/payment-stripe`, listo para instalar | No cubre PSE ni contraentrega — solo tarjetas y métodos europeos/OXXO |
| **Mercado Pago** | Existen plugins comunitarios v2: [`minskylab/medusa-payment-mercadopago`](https://github.com/minskylab/medusa-payment-mercadopago) y [`NicolasGorga/medusa-payment-mercadopago`](https://github.com/NicolasGorga/medusa-payment-mercadopago) | Cubre varios países de LatAm con moneda local; hay que auditar cuál de los dos está mejor mantenido antes de usarlo en producción |
| **PayU Latam** | Plugin comunitario v2 compatible desde v2.4.0: [`tax1driver/medusa-payu`](https://github.com/tax1driver/medusa-payu) | PayU es de los más usados en Colombia/Brasil/Chile/Argentina; el plugin existe pero es de un solo mantenedor — revisar antes de depender de él |
| **Wompi** (Bancolombia) | **No encontré ningún plugin Medusa v2 existente.** | Es la pasarela colombiana más popular para e-commerce y sí soporta PSE nativamente — pero requeriría **construir el provider desde cero** siguiendo `AbstractPaymentProvider` |
| **ePayco** | **No encontré ningún plugin Medusa v2 existente.** | 100% colombiana (respaldada por Davivienda/PayPal), también soporta PSE — mismo caso que Wompi: habría que construirlo |

## 5. Cómo abordarlo — recomendación por fases

1. **Corto plazo, costo cero de desarrollo:** re-etiquetar el provider "Manual Payment" ya existente como "Pago contraentrega" en `src/lib/constants.tsx` y en el copy del checkout. Esto cierra una de las tres promesas del badge sin escribir código de integración nuevo.
2. **Decidir la pasarela de tarjeta/PSE antes de invertir en integrarla.** No conviene activar Stripe "porque ya está en el código" si el mercado real es Colombia — vale más evaluar Wompi (más nativo al mercado, PSE de fábrica) frente a los plugins comunitarios de PayU/Mercado Pago (ya existen, pero de mantenimiento no oficial). Esta decisión depende de negociación comercial/tarifas con cada pasarela, algo fuera del alcance de este análisis técnico.
3. **Si se elige un plugin comunitario existente (PayU o Mercado Pago):** auditar su código (especialmente el manejo de webhooks y el mapeo de estados) antes de producción, dado que no son mantenidos por Medusa. Se instalan igual que Stripe: paquete + entrada en `providers` de `medusa-config.ts` + variables de entorno propias de cada pasarela.
4. **Si se elige Wompi/ePayco (sin plugin listo):** construir un módulo nuevo siguiendo exactamente el mismo patrón que el módulo `brand` ya usa en este backend (un módulo custom con su propio `service.ts`), pero cuyo service extienda `AbstractPaymentProvider` en vez de un modelo de datos simple. El trabajo concreto:
   - Implementar `initiatePayment`/`authorizePayment`/`capturePayment`/`getPaymentStatus` contra la API de la pasarela.
   - Implementar `getWebhookActionAndData` — **imprescindible para PSE**, porque el pago se confirma de forma asíncrona (el cliente sale a la página del banco y vuelve, o ni siquiera vuelve) y Medusa necesita enterarse por webhook, no por la respuesta síncrona del checkout.
   - Registrar el módulo + exponer una ruta de webhook pública para que la pasarela pueda notificar.
   - Añadir el nuevo `provider_id` (ej. `pp_wompi_wompi`) al `paymentInfoMap` del storefront (una entrada más en `src/lib/constants.tsx`, mismo lugar donde ya están Stripe/PayPal/Manual) — el storefront no necesita ningún otro cambio, ya está preparado para reconocer providers adicionales por id.
5. **Una vez resuelto lo anterior, activar los tres métodos en paralelo** para la región Colombia desde el admin: tarjeta (Stripe o la pasarela elegida) + PSE (Wompi/ePayco/PayU) + contraentrega (Manual re-etiquetado) — así el badge de confianza deja de ser una promesa vacía y pasa a ser literal.

---

*Fuentes: [Payment Module Provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider) · [How to Create a Payment Module Provider](https://docs.medusajs.com/resources/references/payment/provider) · [Stripe Payment Provider (Medusa docs)](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe) · [medusa-payment-mercadopago (minskylab)](https://github.com/minskylab/medusa-payment-mercadopago) · [medusa-payment-mercadopago (NicolasGorga)](https://github.com/NicolasGorga/medusa-payment-mercadopago) · [medusa-payu](https://github.com/tax1driver/medusa-payu)*
