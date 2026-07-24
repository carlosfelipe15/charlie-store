# Geo-zones de fulfillment — estado, relación con el resto del proyecto y qué se ganaría al completarlas

> Documento de referencia técnica, no un plan de fase ni una auditoría puntual — a diferencia de `.context/reports/`, este archivo está pensado para consultarse cuando se decida retomar el tema, y debería actualizarse si el código cambia (no archivar sin más). Complementa a [`plan-zonas-entrega-provincia-municipio.md`](./plan-zonas-entrega-provincia-municipio.md) (el plan de fases del feature de zonas) y a [`reports/zonas-entrega-direcciones-incongruencias-2026-07-22.md`](./reports/zonas-entrega-direcciones-incongruencias-2026-07-22.md) (la auditoría que originó este documento). Escrito el 2026-07-22 por Claude, a pedido de Carlos.
>
> **Actualizado el 2026-07-23** tras ejecutar el plan de "dejar a punto zonas de entrega y facturación": se corrigió la deuda técnica descrita acá (código ISO real con una sola fuente de verdad, geo-zones de provincia inertes eliminadas). La diferenciación funcional por provincia (matriz de tarifas/tiempos) sigue **deliberadamente fuera de alcance** — ver "Estado actual" para el detalle de qué cambió y qué no.

## Qué es una geo-zone (concepto de Medusa, no específico de este proyecto)

En el módulo de Fulfillment de Medusa v2, la jerarquía es:

```
FulfillmentSet ("Cuba delivery", type: "shipping")
  └─ ServiceZone (ej. "Cuba")
       ├─ GeoZone[] — QUÉ direcciones caen en esta zona
       │    (type: "country" | "province" | "city" | "zip", con
       │     country_code / province_code / city / postal_expression
       │     según el type)
       └─ ShippingOption[] — QUÉ métodos de envío, precio y reglas
            aplican a las direcciones que caen en esta zona
```

Una `ServiceZone` "aplica" a una dirección si **cualquiera** de sus `GeoZone` matchea esa dirección (es un OR, no un AND). El propósito de tener varios `GeoZone` por tipo (país, provincia, ciudad, código postal) es poder crear **múltiples `ServiceZone` con reglas de envío distintas** para sub-áreas de un mismo país — ej. una `ServiceZone` "Ciudad de destino rápido" con `GeoZone` de tipo `city` y una `ServiceZone` "Resto del país" con un `GeoZone` de tipo `country` más amplio, cada una con sus propios métodos/precios/tiempos.

**Importante:** las geo-zones son un mecanismo de **Medusa core** (fulfillment), completamente independiente del módulo custom `zone` de este proyecto (`Province`/`Municipality`, ver más abajo). Ambos modelan "geografía de Cuba" pero para propósitos distintos — es fácil confundirlos porque comparten nombres de provincias, pero no comparten código, modelo de datos ni tablas.

## Estado actual en Charlie Store

### Qué existe (actualizado 2026-07-23)

Una única `FulfillmentSet` ("Cuba delivery") con una única `ServiceZone` ("Cuba"), creada en [`apps/backend/src/migration-scripts/initial-data-seed.ts`](../apps/backend/src/migration-scripts/initial-data-seed.ts) (el seed "fuente de verdad" del proyecto). Esa `ServiceZone` tiene **1 sola `GeoZone`**, de tipo `"country"` (`country_code: "cu"`) — el gate real, el único que alguna vez hizo algo.

Las 16 `GeoZone` de tipo `"province"` que existieron entre la Fase C y el 2026-07-23 fueron **eliminadas** (ver "Qué se corrigió" abajo) — nunca tuvieron efecto real, así que quitarlas no cambia el comportamiento de fulfillment observable, solo saca datos muertos/confusos de la base.

Sobre esa `ServiceZone` cuelgan **2 `ShippingOption`** (`createShippingOptionsWorkflow`, mismo archivo): "Standard Shipping" (2-3 días) y "Express Shipping" (24h), ambas `price_type: "flat"`, **mismo precio (10) en USD/EUR/la región** — tarifa plana idéntica en toda Cuba. Esto **no cambió** — seguir siendo así fue una decisión explícita (ver "Decisiones ya confirmadas" abajo).

### Qué se corrigió (2026-07-23) y por qué las 16 geo-zones de provincia nunca hicieron nada

Dos razones independientes, cada una suficiente por sí sola, documentadas acá porque explican tanto el estado histórico como por qué la corrección fue "quitarlas + arreglar la fuente de datos", no "hacerlas funcionar":

**1. Redundancia estructural.** Las 16 geo-zones de provincia vivían en la **misma** `ServiceZone` que el geo-zone de país. Como el matching es OR, el geo-zone de país (que matchea *cualquier* dirección cubana) ya alcanzaba para que esa `ServiceZone` — y por lo tanto sus 2 `ShippingOption` idénticas — aplicara siempre. Agregar geo-zones de provincia a la misma zona no creaba una zona distinta con reglas propias, solo agregaba más caminos para llegar al mismo resultado. Para que las provincias importaran de verdad, tendrían que vivir en `ServiceZone` **separadas**, cada una con sus propias `ShippingOption` — eso sigue sin existir, ver "Qué haría falta" abajo.

**2. Aunque no fueran redundantes, nunca hubieran matcheado.** El matching de un `GeoZone` de tipo `"province"` compara su `province_code` (ej. `"cu-03"`) contra el campo `province` de la dirección del carrito, **como string exacto**. Ese campo, en este proyecto, guarda el **nombre** de la provincia (`"La Habana"`), no el código ISO. `"La Habana" !== "cu-03"` — ninguna combinación de datos reales del sistema podía producir un match de tipo `"province"`. Esto **sigue siendo así hoy** (el campo `province` de la dirección sigue guardando el nombre, deliberadamente — ver la nota sobre por qué no se cambió, más abajo) — lo que cambió es que ya no hay geo-zones de provincia esperando (en vano) ese formato.

**Qué se hizo en esta sesión (Workstream D del plan de cierre):**
- `Province` (módulo `zone`) ganó un campo `iso_code` (migración nueva, nullable) — el código ISO 3166-2:CU real, poblado por `scripts/seed-zones.ts`.
- Una sola fuente de verdad para el mapeo código-de-provincia→ISO: [`apps/backend/src/modules/zone/constants.ts`](../apps/backend/src/modules/zone/constants.ts) (`CUBA_PROVINCE_ISO_CODE`, keyed por `Province.code`) — antes vivía solo dentro del script de la Fase C, keyed por nombre (más frágil).
- Las 16 geo-zones de provincia se sacaron de `initial-data-seed.ts` (instalaciones nuevas ya no las crean) y se agregó [`scripts/remove-inert-province-geo-zones.ts`](../apps/backend/src/scripts/remove-inert-province-geo-zones.ts) (idempotente) para limpiarlas de ambientes ya migrados.
- `migrate-fulfillment-to-provinces.ts` quedó marcado como histórico/superado en su propio docblock — **no volver a correrlo**, reintroduciría exactamente lo que se acaba de limpiar.

**Por qué NO se persiguió que el matching por provincia funcionara de punta a punta** (decisión consciente, no un límite técnico no explorado): hacerlo requeriría que el campo `province` de la dirección guardara el código ISO en vez del nombre — pero ese mismo campo se usa para mostrarle al cliente/operador logístico dónde se entrega, y para que el picker "Entregar en" y el select de Provincia del checkout compartan vocabulario con el resto del sistema. Guardar el código ahí rompería esas dos cosas (o exigiría traducir código↔nombre en cada punto de la UI que hoy lee `province` para mostrarlo). Con `Province.iso_code` ahora disponible como dato, ese trabajo de traducción queda más barato el día que se decida hacerlo — pero sigue siendo trabajo pendiente, no algo que esta sesión resolvió.

## Relación con el resto del proyecto

### Con el módulo custom `zone` (Province/Municipality)

Son dos capas paralelas que **no se tocan entre sí en código**, aunque modelan la misma geografía:

| | Módulo `zone` (custom, este proyecto) | Geo-zones (Medusa core, fulfillment) |
|---|---|---|
| Qué decide | Qué **productos se muestran** en el catálogo | Qué **opciones de envío** existen y a qué precio |
| Modelo de datos | `Province`/`Municipality` (modelos propios) + link N–M `product-municipality` | `GeoZone` dentro de `ServiceZone`, nativo de Medusa |
| Granularidad | Provincia **y** municipio (168 municipios) | Solo hasta provincia hoy (Medusa soporta hasta código postal/ciudad, pero acá no se usa) |
| Fuente de verdad de nombres/códigos | Tablas `province`/`municipality` de este módulo, expuestas en `GET /store/zones`; `Province.iso_code` ahora vive ahí también (desde 2026-07-23), poblado desde `modules/zone/constants.ts` | Solo el geo-zone de país (`cu`) — ya no hay geo-zones de provincia que mantener sincronizadas |
| Estado | Completo y funcionando (filtro `zone_id` en `/store/products-list`, picker "Entregar en", widget de admin producto↔zona desde 2026-07-23) | Deliberadamente mínimo — solo el gate de país; diferenciación por provincia sigue sin implementar (decisión de negocio pendiente) |
| Dónde vive el valor elegido | Cookie `_charlie_zone` (id de municipio) | Campo `province` de `cart.shipping_address` (nombre de provincia) |

No hay ningún punto del código que traduzca entre ambos — ni el módulo `zone` conoce los códigos ISO de las geo-zones, ni las geo-zones leen la tabla `province` del módulo `zone`. Son dos fuentes de verdad de "las provincias de Cuba" que hoy coinciden por coincidencia (mismos 16+1 nombres), no por diseño acoplado.

### Con las direcciones (envío)

El campo que **sí** llega hasta las geo-zones es `cart.shipping_address.country_code` (siempre `"cu"`, hardcodeado en `setAddresses`) — ese es el que efectivamente hace match contra el geo-zone de país y habilita las 2 `ShippingOption`. El campo `province` de esa misma dirección **también** se envía a Medusa (ahora como un nombre real, gracias a los selects agregados en la sesión del 2026-07-22), pero como se explicó arriba, Medusa lo compara contra un código ISO que nunca va a coincidir con un nombre — así que ese campo viaja "de adorno" en lo que a fulfillment respecta, aunque sí es el valor real y correcto que se muestra en la orden/factura para el cliente y el operador logístico humano.

### Con las direcciones (facturación)

Ninguna relación. La dirección de facturación no participa en absoluto del cálculo de opciones de envío en Medusa (es un dato fiscal/de cobro, no logístico) — esto es correcto y no debería cambiar.

## Qué se ganaría si se completa

El objetivo de fondo es **envío diferenciado por geografía**, algo logísticamente real en Cuba (La Habana no es lo mismo que una provincia de Oriente en tiempo/costo de entrega) y estándar en marketplaces de entrega comparables:

- **Tarifas de envío distintas por provincia** en vez de la tarifa plana actual (hoy: 10 EUR/USD Standard o Express, igual en toda Cuba). Ejemplo del patrón que usan Rappi/Uber Eats/Cornershop: costo de envío calculado por distancia/zona, no fijo.
- **Restringir métodos por viabilidad real** — ej. que "Express Shipping (24h)" solo aparezca como opción en las provincias donde de verdad se puede cumplir esa promesa, y el resto del país solo vea "Standard".
- **ETA (tiempo de entrega) realista por zona** en el checkout y en el PDP, en vez del mensaje genérico "Envío disponible / Calculado en el checkout" que hoy muestra `rodi-pdp-delivery` (ver `[UI/PDP-ENVIO]` en `backlog.md`) — el botón "Cambiar" de esa tarjeta, hoy un placeholder, sería el punto natural para conectar esto.
- **Base para reglas de negocio futuras condicionadas por zona** — ej. envío gratis sobre cierto monto solo donde la logística es barata, o recargos para municipios remotos (Isla de la Juventud es el caso obvio en este catálogo).
- Referencias de mercado que ya operan así: MercadoLibre y Amazon muestran costo/ETA de envío específico por dirección antes de confirmar; Rappi/Cornershop directamente no permiten pedir fuera de su radio de cobertura activo. Ahora mismo Charlie Store está en el extremo "todo o nada" (toda Cuba, mismo precio) — funcional y honesto para una demo, pero no refleja cómo compite el resto del mercado.

## Qué haría falta para completarlo de verdad

Tres piezas, ninguna trivial, ordenadas de la que más bloquea a la que menos:

1. **Decisión de negocio (bloqueante real, no técnico): la matriz de tarifas/tiempos por zona.** Sin esto no hay nada que configurar — hay que definir, por ejemplo, 2-3 niveles de servicio (ej. "La Habana + área metropolitana" / "resto de provincias" / "Isla de la Juventud u otras remotas") con su propio precio y tiempo estimado. Esto es lo que Carlos (o quien decida el modelo logístico) tiene que resolver antes de tocar código. **Sigue sin definirse** — nada de lo hecho el 2026-07-23 avanza esto, fue explícitamente dejado fuera.
2. ~~Persistir el código ISO de provincia junto a la dirección~~ — **el dato ya existe** (`Province.iso_code`, desde 2026-07-23), pero **no está conectado** a `cart.shipping_address.province` (que sigue guardando el nombre, a propósito — ver arriba). Falta decidir *dónde* traducir nombre→código si se retoma esto: en el momento de armar la dirección del carrito (afecta lo que ve el cliente), o en un paso previo a la resolución de shipping options (más aislado, no toca la UI).
3. **Separar las `ServiceZone`** — dejar de meter todo en una sola "Cuba" y crear una por nivel de servicio definido en el punto 1, cada una con su propio subconjunto de `GeoZone` de tipo `province` (usando los códigos correctos) y sus propias `ShippingOption` con precios/tiempos diferenciados. Esto probablemente conviene modelarlo como workflow nuevo (`apps/backend/src/workflows/`, siguiendo el patrón Module→Workflow→API de `AGENTS.md`) en vez de un script `medusa exec` de un solo uso, si se espera que la matriz cambie con cierta frecuencia. **Sigue sin implementarse.**

No es necesario, para nada de esto, tocar el módulo `zone` custom ni el filtro de catálogo — esa parte ya funciona independientemente y seguiría funcionando igual.

## Consideraciones y riesgos a tener en cuenta

- **No confundir esto con disponibilidad de producto.** Aunque se complete todo lo anterior, seguiría sin haber ninguna relación entre "este producto solo se vende en Zona X" (módulo `zone`) y "esta orden tiene envío Express porque su dirección cayó en tal `ServiceZone`" (geo-zones) — son ejes ortogonales. Si en el futuro se quisiera, por ejemplo, que un producto restringido a una zona *fuerce* un método de envío específico, eso requeriría un tercer punto de integración que hoy no existe en ningún lado (ni está planteado en este documento).
- **Migración de datos legado.** Si se elige la opción de guardar `province_code` en direcciones ya existentes, las direcciones creadas antes de este cambio no lo van a tener — hace falta decidir si se backfilla (mapeando por nombre, con el mismo riesgo de desincronización mencionado arriba) o si simplemente las direcciones viejas siguen cayendo en el gate de país hasta que el cliente las vuelva a guardar.
- **El gate de país debe seguir existiendo como fallback.** Cualquier implementación debería mantener el geo-zone de país como red de seguridad (igual que hoy) para que una dirección con un código de provincia no reconocido/corrupto no se quede sin ninguna opción de envío — el "fallback permisivo" que ya se usa en el filtro de catálogo (`zone_id`) es un buen precedente de diseño a replicar acá.
- **No hay admin de zonas de fulfillment hoy** (distinto de la Fase D del módulo `zone` custom, ya resuelta el 2026-07-23 con el widget producto↔municipios) — cualquier matriz de tarifas de fulfillment que se implemente seguiría siendo vía script/workflow hasta que se decida si vale la pena una UI de admin para esto también.

## Referencias de código

| Qué | Dónde |
|---|---|
| Seed de la `ServiceZone` "Cuba" + su único `GeoZone` de país + las 2 `ShippingOption` | [`apps/backend/src/migration-scripts/initial-data-seed.ts`](../apps/backend/src/migration-scripts/initial-data-seed.ts) (buscar `createFulfillmentSets`) |
| Script idempotente que elimina las geo-zones de provincia de ambientes ya migrados (2026-07-23) | [`apps/backend/src/scripts/remove-inert-province-geo-zones.ts`](../apps/backend/src/scripts/remove-inert-province-geo-zones.ts) |
| Script histórico/superado que las había agregado (Fase C) — **no volver a correr** | [`apps/backend/src/scripts/migrate-fulfillment-to-provinces.ts`](../apps/backend/src/scripts/migrate-fulfillment-to-provinces.ts) |
| Fuente de verdad única del mapeo código-de-provincia→ISO 3166-2:CU (2026-07-23) | [`apps/backend/src/modules/zone/constants.ts`](../apps/backend/src/modules/zone/constants.ts) (`CUBA_PROVINCE_ISO_CODE`) |
| Campo `Province.iso_code` (dato existe, no conectado a fulfillment todavía) | [`apps/backend/src/modules/zone/models/province.ts`](../apps/backend/src/modules/zone/models/province.ts), poblado por [`scripts/seed-zones.ts`](../apps/backend/src/scripts/seed-zones.ts) |
| Dónde se arma `cart.shipping_address.country_code`/`.province` que llega al matching de Medusa | [`apps/storefront/src/lib/data/cart.ts::setAddresses`](../apps/storefront/src/lib/data/cart.ts) |
| Formulario que alimenta ese campo `province` (nombre real, no código) | [`apps/storefront/src/modules/checkout/components/shipping-address/index.tsx`](../apps/storefront/src/modules/checkout/components/shipping-address/index.tsx) |
| Módulo custom `zone` (Province/Municipality) — capa paralela, no relacionada en código con las geo-zones | [`apps/backend/src/modules/zone/`](../apps/backend/src/modules/zone/) |
| Endpoint que expone las provincias/municipios del módulo `zone` (nombres, no códigos ISO) | [`apps/backend/src/api/store/zones/route.ts`](../apps/backend/src/api/store/zones/route.ts) |
| Widget de admin para asignar un producto a municipios (Fase D, 2026-07-23) | `apps/backend/src/admin/widgets/product-zones.tsx` + `apps/backend/src/api/admin/products/[id]/zones/route.ts` |
| Tarjeta de envío del PDP con el botón "Cambiar" (placeholder, punto natural para mostrar ETA/precio por zona el día que esto se complete) | `apps/storefront/src/modules/products/components/rodi-pdp-delivery/index.tsx`, ítem `[UI/PDP-ENVIO]` en `backlog.md` |
