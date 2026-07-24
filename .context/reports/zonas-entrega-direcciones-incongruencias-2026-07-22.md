# Zonas de entrega ("Entregar en") vs. direcciones (envío y facturación) — auditoría

> Auditoría puntual — no confiar en esto para el estado actual del código más allá de la fecha indicada, solo para el diagnóstico y las decisiones tomadas ese día. Para el diseño y la secuenciación de fases del feature de zonas, ver [`../plan-zonas-entrega-provincia-municipio.md`](../plan-zonas-entrega-provincia-municipio.md) y el ítem `[FEATURE/ZONAS-ENTREGA]` de [`../backlog.md`](../backlog.md).

**Sesión:** 2026-07-22, a pedido de Carlos. Dos pasadas el mismo día: (1) auditoría inicial zona↔direcciones + mitigación de formularios (selects reales, país fijo Cuba en envío, país libre en facturación, retiro de Empresa/Apartamento), (2) esta actualización — revisión más profunda de backend+storefront tras esos cambios, diferencia catálogo/checkout, y qué son/qué falta de las geo-zones de fulfillment.

## Cómo funciona cada sistema hoy

**Zona de entrega ("Entregar en")** — módulo custom `zone` (`Province`/`Municipality`, 16 provincias/168 municipios de Cuba) + link N–M **plano** `product-municipality` (deliberadamente no `filterable`, no pasa por el Index Engine). `GET /store/zones` expone provincias con sus municipios activos, orden geográfico. La zona activa vive en la cookie `_charlie_zone` como **id de municipio** ([`lib/data/zones.ts`](../../apps/storefront/src/lib/data/zones.ts)). El picker `rodi-zone-picker` (header/side-menu) es Provincia→Municipio contra ese mismo endpoint. `setActiveZone()` solo hace `cookies.set(...)` + `revalidateTag("products")` — no toca el carrito ni ninguna dirección.

**Filtro de catálogo** (`/store/products-list?zone_id=`, `route.ts:239-257`): resuelto en JS, sin Index Engine — producto **sin** municipios asignados = visible en todas las zonas (fallback permisivo); producto **con** asignaciones = visible solo si `zone_id` está entre ellas.

**Dirección de envío** (checkout y "Direcciones" del perfil) — tras la mitigación de esta sesión, `province`/`city` son selects reales (Provincia→Municipio) contra el mismo `/store/zones`, país fijo Cuba (`country_code` hardcodeado a `"cu"` en el server action, no en el form). Viven en `cart.shipping_address` (checkout) y en `customer.addresses[]` (perfil).

**Dirección de facturación** — desde esta sesión, independiente del envío (ya no hay checkbox "misma que envío"). Dos superficies escriben al **mismo** `customer.addresses[]`, diferenciadas solo por el flag `is_default_billing`: el perfil (`profile-billing-address`, única que setea `is_default_billing: true`, país libre vía select completo) y el checkout (se auto-carga con `addresses.find(is_default_billing) ?? addresses[0]`, editable).

**Fulfillment**: un geo-zone de país (`cu`) que es el **gate real** de qué opciones de envío se ofrecen (hoy: Standard/Express, tarifa plana, igual en toda Cuba). Geo-zones de provincia (`cu-01`…`cu-16`, ISO 3166-2) fueron agregados a la **misma** service zone en la Fase C — ver sección dedicada abajo sobre por qué no hacen nada todavía.

**No hay admin de zonas** (Fase D pendiente) — el mapeo producto↔zona depende de scripts (`seed-zones.ts`, workflow `set-product-zones` invocado a mano). Confirmado también que **ningún workflow de carrito/línea de pedido referencia zona** — las únicas referencias en `src/workflows/` son de administración (crear/asignar zonas), no de validación en el flujo de compra.

## Relación entre zona y direcciones: ninguna estructural

Comparten vocabulario (mismos nombres de provincia/municipio, ambos leen `/store/zones`) pero ningún id se comparte, y no hay sincronización en ningún sentido:
- Cambiar la zona activa no toca la dirección ya guardada en el carrito.
- Guardar o elegir una dirección de envío en checkout no actualiza la cookie de zona.
- La dirección de **facturación** no tiene relación con la zona en absoluto (correcto conceptualmente — facturar ≠ entregar), pero confirma que son tres estados desacoplados: zona de catálogo, dirección de envío, dirección de facturación.
- La distinción "esta dirección es de envío / es de facturación" se infiere **solo por qué formulario llamó** a `addCustomerAddress`/`updateCustomerAddress` (si manda `country_code` es facturación, si no, se fuerza `"cu"`) — no hay un flag ni validación server-side que lo garantice. Un cambio futuro descuidado en el formulario de "Direcciones" podría colar un país no-Cuba en una dirección de envío sin que nada lo impida.

## Catálogo vs. checkout: diferencia e implicaciones

| | Catálogo (picker "Entregar en") | Checkout (dirección de envío) |
|---|---|---|
| Qué decide | Qué productos **se muestran** | A dónde **se entrega de verdad** (usado para fulfillment/orden) |
| Dónde vive | Cookie de sesión/dispositivo | `cart.shipping_address` (persistente, ligado al carrito) |
| Costo de cambiar | Instantáneo, sin fricción | Requiere reabrir el paso de dirección |
| Efecto en el carrito ya armado | Ninguno — no revisa ítems existentes | Ninguno — no valida ítems contra la zona final |

**Implicación no resuelta:** un producto restringido a "La Habana" puede quedar en el carrito mientras esa es la zona activa, y el cliente puede terminar el checkout con dirección en "Santiago de Cuba" sin ningún aviso ni bloqueo — el único gate real en ese punto es a nivel país, no zona/municipio.

## Las geo-zones de fulfillment: qué son, qué falta, qué cambiaría

**Qué son (en Medusa, en general):** un `ServiceZone` de fulfillment agrupa uno o más `GeoZone` (país / provincia / ciudad / código postal) y tiene sus propias `ShippingOption` (métodos, precio, tiempos). Sirven para **diferenciar el envío por geografía** — no para decidir qué productos se ven (eso lo hace el módulo `zone` de este repo), sino qué métodos de envío existen y cuánto cuestan según a dónde se entrega.

**Qué se implementó acá (Fase C):** se agregaron 16 geo-zones de tipo `"province"` (código ISO 3166-2, ej. `cu-03` para La Habana) **a la misma service zone** que ya tenía el geo-zone de país `cu`. En Medusa, si *cualquier* geo-zone de una service zone matchea la dirección, esa service zone aplica — como el geo-zone de país ya matchea cualquier dirección cubana, los de provincia son en la práctica **redundantes dentro de la misma zona**: no crean una service zone distinta con reglas propias, solo agregan más formas de "seguir siendo la misma zona".

**Por qué no hacen nada hoy, ni siquiera esa redundancia:** el matching de Medusa por `type: "province"` compara `province_code` contra el campo `province` de la dirección del carrito **como string exacto**. Los geo-zones guardan `"cu-03"`; la dirección (antes de esta sesión, texto libre; después, un select) guarda el **nombre** `"La Habana"`. Nunca hay match — ni antes ni ahora, porque el cambio de esta sesión fijó el *vocabulario* (nombres reales) pero no el *formato* que Medusa necesita para el matching de fulfillment (código ISO). Hoy son datos muertos: existen en la base, no le hacen nada a ninguna orden.

**Objetivo que deberían cumplir (si se completaran):** habilitar **envío diferenciado por provincia** — algo que en Cuba es logísticamente real (La Habana vs. una provincia de Oriente no es la misma distancia/costo/tiempo). En concreto, permitiría cosas como:
- Tarifas de envío distintas por provincia (hoy: tarifa plana idéntica en toda Cuba).
- Restringir Express a las provincias donde de verdad es viable, y dejar Standard (o un método específico, más lento) en el resto.
- Tiempos de entrega (ETA) realistas por zona en vez de un mensaje genérico.
- Base para reglas futuras como envío gratis sobre cierto monto *solo* en provincias con logística barata.

**Qué haría falta para completarlo de verdad:**
1. Que la dirección guarde (o se pueda derivar) el código ISO de provincia, no solo el nombre — extender el modelo/flujo de creación de dirección para persistir `province_code` junto al nombre visible, o mapear nombre→código en el momento de armar el pedido.
2. Dejar de meter los geo-zones de provincia en la **misma** service zone que el país — crear service zones separadas (o agrupadas por región: ej. "Área metropolitana La Habana" vs. "Resto de Cuba") cada una con sus propias `ShippingOption`.
3. Una decisión de negocio real sobre la matriz de tarifas/tiempos por zona (esto no es técnico — es lo que bloquea todo lo anterior: sin esa matriz no hay nada que configurar).

**Ventaja concreta de resolverlo:** hoy el "Envío disponible / Calculado en el checkout" que se muestra en el PDP (`rodi-pdp-delivery`, ver `[UI/PDP-ENVIO]` en el backlog) y las opciones de envío del checkout son genéricas e iguales para todo el país — lo cual es honesto dado que hoy *no hay* diferenciación real, pero no refleja cómo funciona la logística real ni cómo lo resuelven otros marketplaces de entrega (Rappi, Amazon, MercadoLibre) que sí muestran costo/tiempo específico por ubicación. Es una feature de negocio (pricing/logística), no un bug — vale la pena marcarla como tal y no como algo "roto".

## Mitigación aplicada en esta sesión (formularios de dirección)

- `province`/`city` pasaron de texto libre a **selects reales contra `/store/zones`** en los formularios de perfil ("Direcciones") y checkout (envío), con cascada Provincia→Municipio.
- Selector de país retirado de ambos (siempre Cuba, hardcodeado server-side).
- Campos "Empresa" y "Apartamento, suite, etc." retirados; agregado un único campo **"Nota para la entrega (opcional)"** (reutiliza la columna `address_2` existente).
- La dirección de **facturación** se independizó del envío (se quitó el checkbox "misma que envío"), se auto-carga desde el perfil (`is_default_billing` o primera dirección guardada) y tiene su propio select de país (`ALL_COUNTRIES`, cualquier país — a diferencia del envío).
- `compare-addresses.ts` dejó de comparar `company` (campo retirado de la UI).

**Archivos tocados:** `apps/storefront/src/modules/account/components/address-card/{add-address,edit-address-modal}.tsx`, `.../address-book/index.tsx`, `.../profile-billing-address/index.tsx`, `apps/storefront/src/app/[countryCode]/(main)/account/@dashboard/{addresses,profile}/page.tsx`, `apps/storefront/src/modules/checkout/components/{shipping-address,billing_address,addresses}/index.tsx`, `.../checkout-form/index.tsx`, `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx`, `apps/storefront/src/lib/data/{customer,cart}.ts`, `apps/storefront/src/lib/util/{compare-addresses,countries}.ts`, `apps/storefront/src/modules/common/components/native-select/index.tsx` (soporte de `label`/`topLabel`).

**Qué resuelve y qué no:**
- ✅ Nombres libres vs. catálogo cerrado: una dirección nueva/editada ya no puede tener `province`/`city` que no exista en el catálogo real de zonas.
- ✅ Facturación ya no se confunde con envío ni se sobreescribe silenciosamente.
- ⚠️ Direcciones legado con `province`/`city` que no matcheen un nombre real (datos viejos) muestran los selects sin selección — obliga a re-elegir, no falla en silencio. No se migraron datos existentes.
- ❌ Sigue sin existir ninguna relación **estructural** (id compartido) entre `StoreCustomerAddress` y el módulo `zone` — se guarda el nombre en texto, no una FK.
- ❌ El carrito sigue sin revalidarse ni al cambiar de zona ni al cambiar la dirección de envío en checkout.
- ❌ Las geo-zones de provincia siguen sin funcionar (ver sección dedicada arriba).
- ❌ Fase D (admin de zonas) sigue pendiente.

## Recomendaciones

Referencia de mercado: marketplaces de entrega por zona (Rappi, Instacart, Uber Eats, Cornershop, Amazon Fresh) atan el carrito a una sola zona/tienda — cambiar de zona con ítems en el carrito dispara un aviso explícito de qué se va a quitar, en vez de dejar el carrito silenciosamente desincronizado.

1. **(Alta) Revalidar el carrito al cambiar de zona.** Al llamar `setActiveZone`, chequear el carrito activo y avisar/quitar los ítems no entregables en la nueva zona.
2. **(Alta) Cerrar el loop en checkout.** Al cambiar Provincia/Municipio en la dirección de envío: revalidar el carrito contra esa zona (bloquear con aviso si hay ítems no disponibles) y/o sincronizar la cookie de zona con la dirección final usada.
3. **(Media) Unificar a una sola fuente de verdad de "dónde entrego".** El checkout debería partir siempre de la zona activa (no solo como default editable); si se cambia ahí, propagar el cambio hacia atrás (cookie).
4. **(Media) Decidir el destino de las geo-zones de provincia**: o se completa la implementación (código ISO persistido + service zones separadas + matriz de tarifas — requiere decisión de negocio), o se documenta explícitamente que hoy son decorativas para que nadie asuma un enforcement que no existe.
5. **(Baja) Formalizar envío vs. facturación en el modelo**, no solo por inferencia de qué formulario llamó a la acción compartida.
6. **(Baja) Cerrar la Fase D** (admin CRUD de zonas) para que el mapeo producto↔zona no dependa de scripts.
