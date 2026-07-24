# Plan: Zonas de entrega por Provincia/Municipio ("Entregar en")

> **Estado: decisiones de negocio cerradas — listo para ejecutar la Fase 0 + Fase A.** Generado el 2026-07-19 a pedido de Carlos, tras un análisis de factibilidad sobre adaptar el manejo multi-región de Medusa a un solo país acotado por Provincias/Municipios, de modo que al elegir la zona en "Entregar en" se muestren solo los productos disponibles en esa zona. No se ha empezado a implementar código. Responde al ítem `[FEATURE/ZONAS-ENTREGA]` de [`backlog.md`](./backlog.md).
>
> **Decisiones confirmadas por Carlos el 2026-07-19** (todas cerradas — ver "Decisiones — estado" al final):
> 1. **País objetivo: Cuba** (definitivo). Jerarquía Provincia → Municipio (15 provincias + Isla de la Juventud como pseudo-provincia). Ver "Cuba: especificidades".
> 2. **Región: se repunta a Cuba SIN migración de moneda.** CUP no se usa; los precios se quedan en EUR/USD, intactos (no destructivo). Es la Fase 0, liviana. Ver "Cuba: especificidades §2".
> 3. **Semántica de disponibilidad: permisiva.** Producto sin ninguna zona asignada = disponible en todas. Se implementa con la opción (a): flag/tag explícito de "disponible en todas", no por ausencia de link (ver "Nota de implementación clave").
> 4. **Fase C (entregabilidad en checkout): ENTRA** en el alcance.
> 5. **Naturaleza: demo pero production-close** — se construye la región Cuba real y las geo-zones cubanas de verdad.

## Análisis de factibilidad (por qué este enfoque)

**Veredicto: es posible y factible, pero NO reutilizando el módulo `Region` de Medusa para representar provincias/municipios.** El `Region` es la primitiva equivocada.

**Por qué NO usar `Region`:** en Medusa v2 un `Region` significa **moneda + impuestos + proveedores de pago**, no "área geográfica de entrega". Hoy hay una sola región (Europa/EUR en el seed real; el diseño asume Colombia/COP). Crear una región por provincia multiplicaría monedas/tax/checkout sin necesidad (todas las provincias comparten la misma moneda e IVA), rompería la semántica de precios (el carrito se ata a `region_id`), y no encaja con el routing: todo el storefront cuelga de `[countryCode]` y el `regionMap` se indexa por `iso_2` de país (`apps/storefront/src/middleware.ts:52-56`) — no hay un slot para "provincia" ahí. **La región debe seguir siendo una sola** (el país). La zona de entrega es una dimensión ortogonal.

**Las primitivas correctas de Medusa para "disponibilidad por zona"** (y lo que ya existe cableado a favor en este repo):

| Necesidad | Primitiva Medusa | Estado actual en el repo |
|-----------|------------------|--------------------------|
| Qué productos se ven/venden en una zona | Link producto↔zona (patrón `brand`) + filtro server-side | `GET /store/products-list` ya resuelve `brand_id` vía `query.index()` — el mismo mecanismo sirve para `zone_id` (`apps/backend/src/api/store/products-list/route.ts`) |
| ¿Podemos entregar aquí? (validación por provincia/municipio) | Fulfillment `geo_zone` con `type:"province"`/`type:"city"` | El modelo lo soporta; el seed solo usa `type:"country"` (`apps/backend/src/migration-scripts/initial-data-seed.ts:158-196`) |
| Filtrar el PLP por zona | query param en la ruta custom | El param `province` **ya se acepta** en `/store/products-list` pero se **descarta** (`middlewares.ts:83`, `clearFiltersByKey(["region_id","country_code","province","cart_id"])`) — hoy no afecta disponibilidad |
| UI "Entregar en" | selector en el header | **Ya diseñado, hoy 100% estático**: label "Entregar en" + dirección fija en `design-reference/ecommerce-test/shared.jsx:144-155` y `mobile.jsx:27-32`. En la implementación real (`rodi-header-client.tsx:73-88`) el único selector geográfico es `CountrySelect` (país), no zona |

**Conclusión:** el trabajo es medio (no chico, no un módulo trivial), pero se apoya en tres cosas que ya existen: el patrón `brand` (Module → Link → `query.index()` en `/store/products-list`), el bug de Index Engine ya resuelto (`reindex-search.ts`), y el UI "Entregar en" ya presente en el diseño. El enfoque elegido es un **módulo custom `zone`** (Provincia → Municipio) + link producto↔zona + selector real de zona en el storefront persistido en cookie, más (en una fase posterior) geo_zones sub-país para validar la entregabilidad. Se descartaron dos alternativas: (A) **zona = sales channel** — reutiliza más plomería pero los sales channels no modelan jerarquía provincia→municipio y son binarios; (C) **solo fulfillment geo_zones** — valida entregabilidad pero no filtra bien "qué productos se ven", así que complementa, no reemplaza.

## Prerrequisito de negocio (bloqueante, decidir antes de empezar)

**¿Cuál es el país objetivo real y su división administrativa?** Hoy hay una inconsistencia sin resolver: el **seed backend** es Europa (7 países UE, EUR, warehouse en Copenhague — `initial-data-seed.ts:37,98-139`), mientras el **diseño** asume Colombia (COP, IVA 19%, zonas urbanas Chapinero/Bogotá/Medellín/Cali — `design-reference/ecommerce-test/data.jsx:4-10`). **No existe ningún seed de provincias ni municipios de ningún país.** Antes de construir esto hay que decidir:
1. El país (Colombia según el diseño, u otro).
2. La granularidad de la zona de entrega: ¿el nivel operativo es **Municipio** (recomendado — es el nivel al que la gente entrega), con **Provincia/Departamento** como agrupador para el selector? ¿O basta un nivel?
3. **Semántica de disponibilidad** (decisión de producto, ver "Decisiones a confirmar" abajo): ¿un producto sin ninguna zona asignada se considera "disponible en todas" (fallback permisivo) o "disponible en ninguna" (fallback restrictivo)? Esto cambia el filtro y el seed.

Sin (1) y (2) resueltos no se puede seedear ni definir la cardinalidad final del link. El resto del plan asume: **país único, jerarquía Provincia → Municipio, disponibilidad por Municipio, fallback permisivo** (producto sin zonas = disponible en todas) — todo confirmable/ajustable.

## Cuba: especificidades (decidido 2026-07-19)

La elección de Cuba cierra el prerrequisito de negocio pero abre dos cosas que el plan original no contemplaba. **Ambas deben resolverse en la Fase A, no descubrirse a mitad de camino.**

### 1. Isla de la Juventud: un municipio SIN provincia (afecta el modelo de datos)

Cuba se divide en **15 provincias** (Pinar del Río, Artemisa, La Habana, Mayabeque, Matanzas, Cienfuegos, Villa Clara, Sancti Spíritus, Ciego de Ávila, Camagüey, Las Tunas, Holguín, Granma, Santiago de Cuba, Guantánamo) **más Isla de la Juventud, que es un "municipio especial" que no pertenece a ninguna provincia**. En total ~168 municipios (verificar el listado exacto contra una fuente oficial —ONEI— al escribir el seed; no inventarlo de memoria).

Esto rompe el supuesto del modelo propuesto arriba, donde `Municipality.province` es un `belongsTo` obligatorio. Opciones a decidir en la Fase A:
- **(a) `province` nullable** en `Municipality` — fiel a la realidad administrativa, pero obliga a manejar el caso nulo en el selector (¿dónde se muestra Isla de la Juventud si el primer dropdown es "Provincia"?) y en toda query que agrupe por provincia.
- **(b) Pseudo-provincia "Isla de la Juventud"** que contiene un único municipio homónimo — mantiene el modelo uniforme (`belongsTo` obligatorio, selector de dos pasos siempre válido) a costa de una pequeña mentira en los datos. **Recomendada para el MVP** por simplicidad: el usuario final ve "Isla de la Juventud → Isla de la Juventud", que es aceptable, y ningún código necesita ramas especiales.

### 2. Repuntar la región a Cuba, SIN migración de moneda (Fase 0 — liviana)

El seed actual crea una única región **"Europe"** con 7 países UE y `currency_code: "eur"` (`initial-data-seed.ts:37,98-110`), tax regions por país (`:113-119`), y un stock location "European Warehouse" en Copenhague (`:122-139`). El storefront tiene `DEFAULT_REGION="dk"` (`middleware.ts:6`, `.env.local:9`) y el catálogo tiene precios en **EUR y USD** (`seed-mercado-catalog.ts`).

**Decisión de Carlos (2026-07-19): CUP NO se usa; los precios se quedan en USD y EUR.** Esto convierte lo que el plan original temía (una migración de moneda con reescritura de precios) en un cambio **de configuración liviano y NO destructivo**: solo se repunta el *país* de la región a Cuba, sin tocar la moneda ni los precios del catálogo. Concretamente, la Fase 0 hace:
- **Región**: mantener `currency_code: "eur"` (activo) y las price lists EUR/USD del catálogo **intactas** — no hay conversión ni borrado de precios. Cambiar solo `countries` de los 7 países UE a `["cu"]`, y renombrar la región "Europe" → "Cuba" (cosmético). *(Sub-decisión menor y reversible: dejar EUR como moneda activa es lo de menor cambio; si en algún momento se prefiere USD como moneda activa de la región, es un one-liner en el seed — no bloquea nada. Se deja en EUR por defecto.)*
- **Tax region**: una para `country_code: "cu"` en vez de las 7 UE.
- **Stock location**: renombrar/reubicar "European Warehouse" (Copenhague) a un location cubano (ej. La Habana) — cosmético, no afecta inventario (sigue siendo un único location, disponibilidad lógica).
- **Storefront**: `DEFAULT_REGION` `"dk"` → `"cu"` (`middleware.ts:6`, `.env.local:9`). Efecto colateral: el prefijo de ruta pasa de `/es`/`/dk` a `/cu` (hoy el sitio se navega vía `/es` porque España es uno de los 7 países del seed; con Cuba como único país, será `/cu/...`). Verificar que nada hardcodee `/es` o `/dk`.

**Precios descartables pero repoblables** (Carlos, 2026-07-19): los precios actuales son datos de muestra; si en algún momento se borran, `seed-mercado-catalog.ts` (idempotente) los repuebla con un catálogo realista. La Fase 0 **no los borra** — solo cambia el país de la región.

Como esto queda **production-close** (Carlos pidió que la demo se parezca lo más posible a producción, y Cuba es el país definitivo), la Fase 0 se hace de verdad (región Cuba real, geo-zones cubanas en la Fase C), no como un parche sobre Europa. Es prerrequisito para que el resultado sea coherente, pero es barato porque no toca precios.

## Alcance (qué entra y qué se difiere)

**Entra en este plan (Fases A–C):**
- Backend: módulo `zone` (`Province`/`Municipality`), link producto↔municipio (filtrable vía Index Engine), workflows de CRUD de zona y de asignación producto↔zona, rutas admin y store, seed de zonas.
- Storefront: convertir "Entregar en" de estático a selector real (Provincia → Municipio), persistir la zona elegida en cookie, y filtrar todo el listado de productos por la zona activa (`zone_id`).
- Fulfillment (Fase C): geo_zones `type:"city"`/`"province"` por municipio para que las shipping options sean conscientes de la zona y el checkout valide entregabilidad.

**Se difiere explícitamente (queda en el backlog, no se abandona en silencio):**
- **Inventario/stock real por zona.** Hoy hay un único `stock_location` ("European Warehouse", `initial-data-seed.ts:122-139`) ligado al único sales channel. Disponibilidad *lógica* por zona (link producto↔zona) es suficiente para el MVP y no requiere tocar inventario. Stock físico por zona (múltiples stock locations, niveles de inventario por location) es una fase aparte de mayor alcance.
- **Precios/promociones por zona.** El precio sigue siendo por región/moneda (una sola región). Sin variación de precio por municipio.
- **Admin: bulk-assign masivo producto→zonas.** El MVP admin permite asignar zonas a un producto desde el widget de detalle de producto (patrón `brand`) y CRUD de zonas; asignación masiva (ej. "todos los productos de esta categoría a estas zonas") se difiere.
- **ETA/tiempo de entrega por zona** ("Llega en 90 min", `shared.jsx:120-130`) — es contenido de UI que depende de reglas de logística que no existen; fuera de alcance.
- **Geolocalización automática de la zona** (detectar municipio por IP/GPS). El MVP pide al usuario elegir la zona; default a una zona configurable si no eligió.

## Backend

### Módulo `zone`

`apps/backend/src/modules/zone/`:
- `models/province.ts` — `Province`: `id`, `name`, `code` (texto, ej. ISO-3166-2 o código local), `municipalities: model.hasMany(() => Municipality, { mappedBy: "province" })`.
- `models/municipality.ts` — `Municipality`: `id`, `name`, `code`, `is_active` (bool, default `true` — para desactivar zonas sin borrarlas), `province: model.belongsTo(() => Province, { mappedBy: "municipalities" })`.
- `service.ts` — `MedusaService({ Province, Municipality })`, sin métodos custom.
- `index.ts` — exporta `ZONE_MODULE`.

**Nota de riesgo a verificar temprano** (idéntica a la señalada en `plan-combos-productos.md` para `bundle`): este sería el primer módulo custom del repo con una relación DML `hasMany`/`belongsTo` **dentro del mismo módulo** — `brand`/`review`/`favorite` solo se conectan a `Product` vía *links*, nunca entre sí. Al generar la migración verificar: (a) si `createProvinces({ municipalities: [...] })` crea provincia + municipios en una sola llamada anidada, o si hay que hacerlo en dos pasos; (b) qué `ON DELETE` genera la FK `municipality.province_id` (no asumir cascade en el workflow de borrado).

Migración: **generada**, nunca a mano — `pnpm medusa db:generate zone` contra una DB de dev corriendo, luego `pnpm medusa db:migrate`. Registrar `zone` en `medusa-config.ts` → `modules[]` (requiere reinicio completo de `medusa develop`).

### Link producto↔municipio (el corazón de la disponibilidad)

`apps/backend/src/links/product-municipality.ts`:
- **Cardinalidad: muchos-a-muchos** (un producto disponible en muchos municipios; un municipio con muchos productos). A diferencia de `product-brand` (muchos productos → una marca) y de `product-review`/`product-favorite` (un producto → muchos, `isList` en el lado hijo), esta es la primera relación N–M del repo. Confirmar la sintaxis exacta de `defineLink` para N–M en 2.15.2 al implementar (probablemente sin `isList` explícito y con ambos lados como `linkable`, pero **verificar contra la doc/código antes de asumir**).
- **`filterable`** en el lado `municipality` (`filterable: ["id"]`, mínimo) — imprescindible para poder filtrar por `zone_id` vía `query.index()`, exactamente como `product-brand.ts` declara `filterable: ["id","name"]` para el filtro de marca de la Fase 10. Sin esto, el Index Engine no puede resolver los productos de un municipio.

Registrar el link (nuevo archivo en `src/links/` → reinicio completo de `medusa develop`).

### Workflows

Siguiendo `Module → Link → Workflow → API` (nunca llamar el servicio del módulo directo desde la ruta):
- **`create-province` / `create-municipality` / `update-*` / `delete-*`** — CRUD de zonas, calcado de `create-brand`/`update-brand`/`delete-brand`. El delete de provincia debe borrar/quitar primero los municipios y sus links (no asumir cascade — ver nota de riesgo del módulo). El delete de municipio limpia sus links producto↔municipio con `removeRemoteLinkStep` (mismo patrón que `delete-brand` limpia links huérfanos).
- **`set-product-zones`** (`apps/backend/src/workflows/set-product-zones.ts`) — dado `{ product_id, municipality_ids: string[] }`, reconcilia los links producto↔municipio: crea los que faltan, quita los que sobran (`createRemoteLinkStep` / `dismissRemoteLinkStep`). Es el equivalente al hook `brand_id` de `brand`, pero N–M en vez de 1–N. Reutilizable desde el widget admin y desde el seed.
- **Hook de producto (opcional, si se quiere paridad con `brand`):** `workflows/hooks/created-product.ts` y `updated-product.ts` ya inyectan `brand_id` desde `additional_data`. Se puede extender para aceptar `municipality_ids` en `additional_data` y llamar `set-product-zones` — evaluar si vale la pena o si basta el widget admin (que llama el workflow directo). Recomendación MVP: widget admin llama el workflow directo, sin tocar los hooks (menos superficie).

### Rutas API

**Store:**
- `GET /store/zones` — lista provincias con sus municipios activos (`query.graph({ entity: "province", fields: ["id","name","*municipalities"] })`, filtrando `is_active`). Alimenta el selector "Entregar en". Público.
- **Extender `GET /store/products-list`** (no una ruta nueva) — agregar `zone_id` (id de municipio) al validador y al `route.ts`, resolviéndolo vía `query.index()` **exactamente como `brand_id`**: cuando `zone_id` está presente, resolver los ids de producto que matchean ese municipio (`fields: ["id"]`, liviano) e intersectarlos con el filtro `id` del `query.graph()` final (conteo exacto). **Dejar de descartar la zona:** hoy `middlewares.ts:83` hace `clearFiltersByKey([... "province" ...])`; agregar `zone_id` como filtro real (no descartarlo) mientras `region_id`/`country_code`/`province` siguen yendo solo al contexto de pricing/tax. Fallback permisivo (ver Decisiones): si un producto no tiene ningún link de zona, debe seguir apareciendo — esto requiere que la intersección incluya "productos sin zona" ∪ "productos en esta zona", no solo la intersección estricta (ver nota de implementación abajo).

**Admin:**
- `GET/POST /admin/provinces`, `POST/DELETE /admin/provinces/:id` y equivalentes para municipios — CRUD, patrón `admin/brands`.
- `POST /admin/products/:id/zones` — corre `set-product-zones` para el widget de detalle de producto.

Registrar todo en `middlewares.ts` con validadores Zod co-ubicados por recurso.

**Nota de implementación clave (fallback permisivo):** con fallback permisivo, filtrar por `zone_id` NO es una intersección simple como `brand_id`. "Productos disponibles en el municipio X" = (productos linkeados a X) ∪ (productos sin ningún link de municipio). Resolver el segundo conjunto vía `query.index()`/`query.graph()` es menos directo (no hay un "where no existe link"). Opciones a evaluar en la fase de backend, **antes** de tocar el storefront: (a) marcar los productos "disponibles en todas" con un flag/tag explícito en vez de "ausencia de link" (más simple de filtrar, requiere que el seed lo setee); (b) resolver los dos conjuntos por separado y unir ids en el `route.ts`. La opción (a) es más limpia y se recomienda — convierte el fallback en un filtro positivo. Si se elige **fallback restrictivo** (producto sin zona = no disponible), el problema desaparece y es idéntico a `brand_id`. **Esta decisión condiciona el diseño del filtro y del seed — cerrarla primero.**

### Seed de zonas

`apps/backend/src/scripts/seed-zones.ts` (nuevo, idempotente — salta zonas ya existentes por `code`, mismo criterio que `seed-mercado-catalog.ts` salta handles): crea las provincias y municipios del país elegido (para Colombia: departamentos + municipios/ciudades principales del diseño — Bogotá, Medellín, Cali, etc.), y asigna un subconjunto de productos existentes a municipios vía `set-product-zones` para tener datos con los que probar el filtro (igual que `seed-mercado-catalog.ts` asignó marcas para probar el filtro de Brands de la Fase 10).

**Índice de búsqueda (crítico, ya documentado en `AGENTS.md`):** como este seed crea links producto↔municipio vía `medusa exec`, hay que correr `pnpm medusa exec ./src/scripts/reindex-search.ts` después (o el filtro por `zone_id` devolverá 0 resultados para municipios con productos, mismo síntoma que tuvo `brand_id` — ver `[DATA/INDEX-STALE]` en `backlog.md`). `seed-zones.ts` debe loguear ese recordatorio al final, como ya hace `seed-mercado-catalog.ts`.

## Storefront

### Capa de datos

- `apps/storefront/src/lib/data/zones.ts` (nuevo, estilo `lib/data/brands.ts`: `"use server"`, nunca lanza, corta a `[]`/`null`):
  - `listZones()` — `GET /store/zones`, provincias con municipios (memoizable con `cache()` de React, como `listRegions`).
  - `getActiveZone()` — lee la cookie de zona y resuelve el municipio activo (o el default configurado).
  - `setActiveZone(municipalityId)` — server action que setea la cookie y revalida los cache tags de productos (mismo espíritu que `updateRegion` en `lib/data/cart.ts` setea el país). **Cookie, no ruta:** a diferencia del país (que vive en `[countryCode]` en la URL), la zona se guarda en cookie (ej. `_charlie_zone`) para no rediseñar todo el routing — más simple y suficiente.
- `apps/storefront/src/lib/data/products.ts` — `listProducts()`/`listProductsWithSort()` leen la zona activa (`getActiveZone()`) y agregan `zone_id` al query de `/store/products-list` (junto a `region_id`, que ya se pasa). Punto único: como todo el listado ya pasa por estas funciones (Fase 10 redirigió todo a `/store/products-list`), agregar `zone_id` acá lo aplica a store, categorías, búsqueda, relacionados y home a la vez.

### UI "Entregar en"

- Nuevo `apps/storefront/src/modules/layout/components/rodi-zone-picker/index.tsx` (`"use client"`) — reemplaza el bloque estático "Entregar en" del header (hoy el header desktop tiene `CountrySelect` con label "Región:" en `rodi-header-client.tsx:73-88`; el diseño quiere además/aparte un "Entregar en" con zona — `shared.jsx:144-155`). Dos pasos: dropdown de Provincia → dropdown de Municipio; al elegir municipio llama `setActiveZone(id)` y `router.refresh()`. Muestra el municipio activo como label ("Entregar en: Chapinero, Bogotá"), igual que el mockup. Reusa el patrón de `CountrySelect` (Headless UI `Listbox`, ya usado en `country-select/index.tsx`).
- Insertarlo en `rodi-header-client.tsx` (desktop) y en `side-menu/index.tsx` (mobile), donde hoy vive `CountrySelect`. Decisión de UX a confirmar: ¿el "Entregar en" (zona) **reemplaza** al selector de país actual, **convive** con él, o el país queda fijo (un solo país) y solo se muestra la zona? Dado que el modelo pasa a país único, lo más probable es **fijar el país y mostrar solo la zona** — pero eso toca el `CountrySelect` existente y hay que confirmarlo (ver `[UI/REGION]` ya resuelto en `backlog.md`, donde se decidió qué mostrar en ese slot del header).

### Enganche con el ítem `[UI/PDP-ENVIO]` del backlog

El botón "Cambiar" de la tarjeta de envío de la PDP (`rodi-pdp-delivery/index.tsx`, hoy placeholder sin `onClick` — ver `[UI/PDP-ENVIO]` en `backlog.md`) es exactamente el "Cambiar dirección/zona" que este feature habilita: una vez que exista `setActiveZone`, ese botón puede abrir el mismo `rodi-zone-picker`. Cerrar ese ítem del backlog es un subproducto natural de esta Fase B.

## Fulfillment / validación de entregabilidad (Fase C)

Para que "Entregar en X" no solo filtre catálogo sino que el **checkout** respete la zona:
- Extender el seed de fulfillment (`initial-data-seed.ts:158-196`, hoy un único service zone "Europe" con 7 geo_zones `type:"country"`) para crear geo_zones `type:"city"` (o `"province"`) por municipio/provincia, agrupadas en service zones, con sus shipping options. Esto hace que las shipping options disponibles en el checkout dependan de la dirección/zona del carrito — capacidad **nativa** de Medusa que hoy no se usa a nivel sub-país.
- Enganche: al setear la zona en el storefront, propagar la provincia/municipio a la dirección de envío del carrito (`cart.shipping_address.province`/`city`) para que el listado de shipping options del checkout (`/store/shipping-options`) ya filtre por la geo_zone correcta.
- **Esta fase es complementaria y puede diferirse:** el núcleo del pedido de Carlos ("mostrar productos disponibles en la zona") lo cubren las Fases A+B. La Fase C es "y además solo puedo hacer checkout si entregamos ahí". Evaluar si entra en el MVP o se difiere.

## Secuenciación en fases

**Fase 0 — Repunte de región a Cuba (config, liviana, no destructiva) — ✅ APLICADA 2026-07-20:**
0.1. En `initial-data-seed.ts` (fuente de verdad, instalaciones nuevas): región `countries: ["cu"]` + nombre "Cuba" (mantener `currency_code: "eur"` y las price lists EUR/USD intactas), tax region `country_code: "cu"`, stock location "Almacén Central (La Habana)", service zone "Cuba" con geo_zones derivadas de `countries`. **Sin tocar precios ni `supported_currencies` (EUR/USD).** ✅ hecho.
0.2. Script in-place idempotente `apps/backend/src/scripts/migrate-store-to-cuba.ts` (porque la DB de dev ya estaba sembrada con Europa y re-sembrar perdería las 48 subcategorías creadas vía admin, fuera del seed). Repunta región/tax/stock/fulfillment sin tocar el catálogo. ✅ corrido vía `pnpm medusa exec` — log: región Europe→Cuba (7 países UE → cu, EUR intacto), tax cu creada, stock → La Habana, geo zone cu agregada. Idempotencia verificada (segunda corrida: los 4 pasos "skipping").
0.3. Storefront: `NEXT_PUBLIC_DEFAULT_REGION` `"dk"` → `"cu"` (`.env.local`) + fallback en `middleware.ts:6`. ✅ hecho. Grep de `/es`/`/dk` hardcodeados: solo el fallback de `middleware.ts` (ya actualizado).
0.4. **Verificado en navegador (Playwright) el 2026-07-20** ✅: `/store/regions` devuelve una sola región "Cuba" (currency `eur`, country `cu`); la home redirige a `/cu`, `/cu/store` renderiza los 48 productos con precios en EUR (€9.19…€82.79), header muestra "Región: 🇨🇺 Cuba" y "cu Cuba · EUR", 0 errores de consola. `/store/products-list?region_id=<cuba>` confirma `count: 48` con `calculated_price.currency_code: "eur"`. (Pendiente aún: probar el flujo de checkout completo a una dirección cubana — no bloqueante para la Fase A.)
- **Notas de ejecución:** (a) el fulfillment sub-país (geo-zones cubanas por municipio) NO se hace acá — es la Fase C; la Fase 0 solo deja la región con país Cuba a nivel country. (b) **Gap cosmético conocido:** en la DB de dev el service zone quedó nombrado "Europe" (el script in-place solo le agregó la geo zone `cu`, no lo renombró; el seed sí lo nombra "Cuba" para instalaciones nuevas). Es admin-interno; la Fase C reescribe el fulfillment y lo resuelve. (c) Se dejaron en pie (inofensivas) las tax regions y geo zones UE viejas.

**Fase A — Backend de disponibilidad por zona (núcleo) — ✅ IMPLEMENTADA y verificada 2026-07-21:**
1. (Prerrequisitos de negocio ya cerrados — Cuba, permisivo, pseudo-provincia para Isla de la Juventud.)
2. ✅ Módulo `zone` (`Province`/`Municipality`, relación intra-módulo `hasMany`/`belongsTo`) → migración generada e **inspeccionada** (`municipality.province_id` NOT NULL, FK `on update cascade`, **sin** `on delete cascade` → borrar provincia exige borrar municipios antes, que es lo que hace la compensación de `createZonesStep`) → migrada.
3. ✅ Link `product-municipality` **N–M plano** (`isList: true` en ambos lados, **sin `filterable`**) → `db:migrate` sincronizó la tabla `product_product_zone_municipality`.
4. ✅ Workflows `create-zones` + `set-product-zones` (+ steps con compensación). Rutas admin de zonas → **diferidas a Fase D** (el seed usa los workflows directo vía `medusa exec`).
5. ✅ Extendido `/store/products-list` con `zone_id`. **Mejora clave sobre el plan original:** NO se usó Index Engine ni link `filterable`. El filtro resuelve "productos del municipio X" con un `query.graph()` liviano (product → `municipalities.id`) y aplica el **fallback permisivo en JS** (`municipalities.length === 0 || incluye X`), empujando el set a `matchedIdSets` — el mismo patrón que `rating_gte`/`on_sale`. Esto elimina la "Nota de implementación clave" (no hizo falta flag/tag de "disponible en todas") y **elimina el gotcha del reindex para zonas**.
6. ✅ `seed-zones.ts` (16 provincias — 15 + Isla de la Juventud — y 168 municipios; restringe 2 productos a La Habana para probar). **NO se corre `reindex-search.ts`** (el filtro de zona no toca el Index Engine).
7. ✅ Verificado (curl + Playwright desde el navegador): `/store/zones` → 16 provincias / 168 municipios; `zone_id` de La Habana → 48 (incluye los restringidos), `zone_id` de otra provincia → 46 (oculta los 2 restringidos); `/cu/store` renderiza 48 productos sin regresión.
- **Nota:** las rutas admin de zonas y el widget de asignación producto→zonas quedan para la **Fase D**.

**Fase B — Storefront (selector "Entregar en" + filtrado) — ✅ IMPLEMENTADA y verificada 2026-07-21:**
7. ✅ `lib/data/zones.ts` — `listZones()` (GET /store/zones), `getActiveZoneId()`/`getActiveZone()` (cookie `_charlie_zone`), `setActiveZone()` (server action: set cookie + `revalidateTag(products)`).
8. ✅ `zone_id` en `lib/data/products.ts::listProducts` — lee la zona activa y la agrega al query, **salvo** cuando el fetch es por `id`/`handle` (para no romper una PDP navegada directo). Aplica a todas las superficies de listado (store, categorías, búsqueda, home, relacionados).
9. ✅ `rodi-zone-picker` (Provincia → Municipio, selects nativos + server action + `router.refresh()`). **Decisión de header tomada:** con país único Cuba, se **reemplazó** `CountrySelect` ("Región: Cuba") por el picker "Entregar en" en header (desktop) y side-menu (mobile); el país/moneda sigue visible en la top bar ("cu Cuba · EUR"). `CountrySelect` del header queda en el código, sin uso, por si se revierte.
10. ✅ Verificado (Playwright, 0 errores de consola): estado inicial "Elegí tu zona" / 48; zona = Consolación del Sur (Pinar del Río) → 46 (2 restringidos ocultos) + label + cookie; **reload persiste** (46); zona = Playa (La Habana) → 48 (restringidos reaparecen).
11. **Pendiente (oportunista, no hecho en Fase B):** enganchar el botón "Cambiar" de `rodi-pdp-delivery` al picker para cerrar `[UI/PDP-ENVIO]`. Queda como follow-up chico.
- **Ajuste 2026-07-21 (a pedido de Carlos):** textos del picker en español estándar (tú), no voseo ("¿Dónde quieres…?", "Selecciona…", "Elige tu zona"). Provincias ordenadas **geográficamente oeste→este** (Pinar del Río → … → Guantánamo, Isla de la Juventud al final) vía un `PROVINCE_ORDER` por código en `api/store/zones/route.ts` (los municipios siguen alfabéticos dentro de cada provincia).
- **Ajuste 2026-07-21 (2ª tanda, a pedido de Carlos):** los `<select>` nativos de Provincia/Municipio se reemplazaron por un dropdown custom (Headless UI `Listbox`, `ZoneSelect` interno en `rodi-zone-picker`) para: (a) chevron inset del borde derecho y (b) que rote hacia arriba al abrir (`RodiIconChevron chevronDirection`), (c) popup de opciones del **mismo ancho** que el trigger, y (d) que el listado mantenga la **estética del sitio** (tokens `rm-line`/`rm-md`/`rm-ink`/`rm-paper`/sombra) en vez del popup nativo del navegador. Verificado en navegador: estilo correcto, orden geográfico, y el filtro sigue disparando (Pinar del Río → 46).
- **Nota — caché de `/store/zones`:** el storefront lo pide con `cache: "force-cache"` + tag `zones`, sin trigger de revalidación (las zonas se administran desde el backend, aún no hay mutación desde el store). Consecuencia: cambios en las zonas (orden, alta/baja, activar/desactivar) **no se reflejan** hasta purgar el fetch-cache de Next (en dev: borrar `.next/cache/fetch-cache`; en prod: un deploy). **Fase D:** las mutaciones admin de zonas deben `revalidateTag` el tag `zones` (igual que productos), o cambiar `listZones` a un `revalidate` temporal.
- **Nota:** `listProductFacets` (conteos del sidebar) NO se scopea por zona todavía — discrepancia menor de conteos por marca/atributo cuando hay zona activa; documentado como refinamiento.

**Fase C — Entregabilidad en checkout — ✅ IMPLEMENTADA y verificada 2026-07-21:**
Decisiones de Carlos: **cobertura por provincia (todas las 16), envío plano**.
12. ✅ Backend fulfillment province-aware: se agregaron **16 geo-zones de provincia** (`type:"province"`, `province_code` ISO 3166-2:CU) al service zone de Cuba, **manteniendo la geo-zone país `cu`** de Fase 0 como red de robustez. Seed (fuente de verdad) + script idempotente `migrate-fulfillment-to-provinces.ts`. Opciones flat Standard/Express sin cambios. **Hallazgo clave:** el `province` del checkout es **texto libre** (no un select con códigos), así que forzar matching estricto por provincia rompería el checkout de quien no la escribe exacta — por eso `cu` país queda como gate robusto (verificado por curl: province como nombre, como ISO, o vacío → las 2 opciones resuelven).
13. ✅ Puente zona→checkout **en el cliente** (no mutación de carrito): el checkout page pasa `getActiveZone()` como `activeZone` por `CheckoutForm → Addresses → ShippingAddress`, que lo usa como **fallback de los defaults** del form (municipio→`city`, provincia→`province`; `country_code` ya lo auto-setea Medusa a `cu` por región de un solo país). Al enviar, `setAddresses` guarda esos valores en el carrito.
    - **Por qué cliente y no mutación server-side:** el primer intento (server action `syncCartDeliveryZone` que seteaba la dirección del carrito) chocó con dos cosas de Medusa/Next: (a) Medusa **auto-rellena `country_code`** desde la región de un solo país, invalidando el guard "dirección vacía"; (b) `revalidateTag` no purga dentro del mismo request, así que el `retrieveCart` (force-cache) del checkout leía la dirección **stale** tras el update. El pre-llenado en cliente evita ambos y es más simple; además las shipping options **ya resuelven sin sincronización** porque el `country_code` auto-seteado matchea la geo-zone `cu`.
14. ✅ Verificado (Playwright, 0 errores): con zona activa (Cerro, La Habana), `/cu/checkout` pre-llena País=Cuba / Provincia=La Habana / Municipio(Ciudad)=Cerro; tras completar y enviar la dirección, el paso `delivery` muestra **Standard + Express**.

**Fase D — Admin de asignación por producto (puede solaparse con A):**
14. Widget en detalle de producto (patrón `brand`) para asignar municipios a un producto vía `POST /admin/products/:id/zones`. Página admin de zonas (CRUD) para gestionar provincias/municipios.

## Decisiones — estado

**Cerradas por Carlos el 2026-07-19:**
- ✅ **País y división administrativa**: **Cuba**, jerarquía Provincia → Municipio (15 provincias + Isla de la Juventud, ~168 municipios). Ver "Cuba: especificidades".
- ✅ **Granularidad**: Municipio como nivel operativo, Provincia como agrupador del selector.
- ✅ **Semántica de disponibilidad**: **permisiva** (producto sin zona = disponible en todas).
- ✅ **Fase C (entregabilidad en checkout)**: **entra** en el alcance.

**Cerradas por Carlos el 2026-07-19 (segunda tanda):**
- ✅ **Región**: se repunta a Cuba como **Fase 0**, pero **sin migración de moneda** — CUP no se usa, los precios se quedan en EUR/USD, sin conversión ni borrado. Ver "Cuba: especificidades §2". Es un cambio liviano (país + tax region + nombre de stock location + `DEFAULT_REGION`), no una reescritura de precios.
- ✅ **Precios**: se quedan en **USD y EUR**, intactos. Descartables pero repoblables vía `seed-mercado-catalog.ts` si alguna vez se borran. Moneda activa de la región: EUR (reversible a USD con un one-liner, no bloquea).
- ✅ **Naturaleza del trabajo**: es una **demo, pero production-close** — Cuba es el país definitivo. Se construye la región Cuba real y las geo-zones cubanas de verdad, no como parche.
- ✅ **Isla de la Juventud**: **pseudo-provincia (b)** de un único municipio homónimo, para mantener `Municipality.province` obligatorio y el selector de dos pasos sin ramas especiales.

**Abiertas (no bloquean el arranque de la Fase A; se cierran al llegar a la Fase B):**
- ❓ **Header**: con país único Cuba, `CountrySelect` (que hoy conmuta entre 7 países) queda sin sentido — lo natural es **fijar el país a Cuba y dejar solo el `rodi-zone-picker` ("Entregar en")** en el slot del header. Confirmar al implementar la Fase B si `CountrySelect` se elimina del todo o se conserva oculto.

**Difieridas (no bloquean):**
- **Stock físico por zona** (múltiples stock locations): fuera de alcance, disponibilidad lógica es suficiente por ahora.

## Riesgos y notas para el agente que implemente

- **Link N–M es nuevo en el repo.** Verificar la sintaxis exacta de `defineLink` many-to-many en 2.15.2 y cómo se declara `filterable` de ese lado antes de asumir que se comporta como `product-brand`. Es el punto de mayor incertidumbre técnica.
- **Index Engine, otra vez.** Todo lo aprendido en la Fase 10 aplica: `query.index()` solo para resolver ids, `query.graph()` para el fetch final (conteo exacto); correr `reindex-search.ts` tras cualquier `medusa exec` que cree links de zona; `estimate_count` no es confiable. Releer la sección "Índice de búsqueda cross-módulo" de `AGENTS.md` y `plans/2026-07-08/FASE-10-filtro-marca-index-module.md`.
- **No overridear `/store/products`.** Extender `/store/products-list` (ruta ya existente del repo), nunca la ruta core — ver Hallazgo 1 de la Fase 10.
- **Fallback permisivo ≠ intersección simple.** Es el detalle de diseño más fácil de subestimar (ver "Nota de implementación clave"). Resolverlo en backend con datos reales antes de construir cualquier UI.
- **La región sigue siendo una sola.** No tocar el `Region`/`regionMap`/`[countryCode]` para meter zonas — la zona es cookie + link, ortogonal a la región.

## Documentación a actualizar (cuando se ejecute)

- Nuevo `docs/custom-features/zones.md` — estructura de `brands.md`/`reviews.md`/`favorites.md`, con "Decisiones clave" (por qué no se usó `Region`, semántica de disponibilidad elegida, por qué cookie y no ruta, por qué link N–M) y tabla "Extender Zonas" con lo diferido (stock por zona, precios por zona, bulk-assign, ETA, geolocalización).
- Nuevo `.context/plans/<fecha>/FASE-N-zonas-entrega.md` documentando la secuenciación real y las sorpresas en los puntos de riesgo.
- `.context/backlog.md` — cerrar `[FEATURE/ZONAS-ENTREGA]` al shippear; cerrar `[UI/PDP-ENVIO]` si se enganchó el botón "Cambiar"; agregar entradas para lo diferido explícitamente.
- `.context/index.md` — fecha, fase completada, resumen del backlog.
- `AGENTS.md` — nueva subsección "Zones" en "Funcionalidad custom actual", paralela a Brands/Reviews/Favoritos.
</content>
</invoke>
