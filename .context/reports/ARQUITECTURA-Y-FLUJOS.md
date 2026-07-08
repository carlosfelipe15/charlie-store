# Storefront DTC — Guía de Arquitectura y Flujos de Prueba

Guía para entender cómo está construido el storefront (Next.js 15 + Medusa v2), cómo
fluyen los datos, y una batería de flujos end-to-end para probarlo y detectar lo que
aún está pendiente.

> Ámbito: `apps/storefront`. El backend (`apps/backend`) es un Medusa v2 estándar; aquí
> se documenta solo el frontend y su acoplamiento con la API de Medusa.

---

## 1. Visión general

Es un **monorepo pnpm + Turbo** con dos apps:

| App | Paquete | Rol | Puerto |
|-----|---------|-----|--------|
| `apps/backend` | `@dtc/backend` | Medusa v2 (API de tienda + admin) | `9000` (admin en `/app`) |
| `apps/storefront` | `@dtc/storefront` | Frontend Next.js (App Router) | `8000` |

El storefront **no tiene base de datos ni API propia**: todo lo obtiene de la API
`/store/*` de Medusa a través del **Medusa JS SDK** y de **Server Actions** de Next.js.
No hay `route.ts` (API handlers) en el storefront.

**Stack clave**
- Next.js `15.5` (App Router, React 19, Turbopack en dev).
- `@medusajs/js-sdk` para hablar con la API de Medusa.
- TailwindCSS + `@medusajs/ui-preset` + Radix + Headless UI para UI.
- Stripe (`@stripe/react-stripe-js`) para pagos con tarjeta.
- Renderizado: SSR + SSG (`generateStaticParams`) + caché de `fetch` con tags e
  invalidación por `revalidateTag`.

---

## 2. Estructura del código

```
src/
├── app/                      # App Router (rutas)
│   └── [countryCode]/        # TODO cuelga de un código de país (multi-región)
│       ├── (main)/           # Grupo con nav + footer (tienda)
│       └── (checkout)/       # Grupo con chrome mínimo (checkout)
├── lib/
│   ├── config.ts             # Instancia del Medusa SDK (+ inyección de locale)
│   ├── constants.tsx         # Mapa de proveedores de pago, monedas, helpers
│   ├── data/                 # Server Actions: toda la comunicación con Medusa
│   ├── context/              # modal-context (único contexto cliente)
│   ├── hooks/                # use-in-view, use-toggle-state
│   └── util/                 # helpers (precios, errores, locale header…)
├── modules/                  # Features en formato components/ + templates/
├── styles/                   # globals.css (Tailwind)
└── types/                    # Tipos compartidos
```

**Convención de módulos** (`src/modules/*`): cada feature separa
`components/` (piezas de UI) de `templates/` (composición a nivel de página que la ruta
consume). Alias de import: `@modules/*` → `src/modules`, `@lib/*` → `src/lib`.

Módulos: `account`, `cart`, `categories`, `checkout`, `collections`, `common`
(primitivos compartidos + iconos), `home`, `layout` (nav/footer/side-menu),
`order`, `products`, `shipping` (nudge de envío gratis), `skeletons` (loaders), `store`.

---

## 3. Arquitectura del App Router

Todo lo visible cuelga del segmento dinámico **`[countryCode]`** (ej. `/dk`, `/us`).
Dentro hay dos **route groups**:

- **`(main)`** — layout con `Nav` + `Footer` + banners. Es la tienda.
- **`(checkout)`** — layout minimalista (solo "volver al carrito" + logo + CTA).

### Mapa de rutas

| Ruta | Página | Qué hace |
|------|--------|----------|
| `/[cc]` | `(main)/page.tsx` | **Home**: Hero + productos destacados por colección |
| `/[cc]/store` | `(main)/store/page.tsx` | Listado de todos los productos (con orden y paginación) |
| `/[cc]/products/[handle]` | `(main)/products/[handle]` | **Detalle de producto** (SSG + metadata). Selección de variante vía `?v_id` |
| `/[cc]/collections/[handle]` | `(main)/collections/[handle]` | Colección (SSG, límite 12) |
| `/[cc]/categories/[...category]` | `(main)/categories/[...category]` | Categoría (catch-all, SSG) |
| `/[cc]/cart` | `(main)/cart/page.tsx` | **Carrito** completo |
| `/[cc]/checkout` | `(checkout)/checkout/page.tsx` | **Checkout** (direcciones → envío → pago → review) |
| `/[cc]/order/[id]/confirmed` | `(main)/order/.../confirmed` | Confirmación post-compra |
| `/[cc]/order/[id]/transfer/[token]` | `(main)/order/.../transfer` | Solicitud de transferencia de pedido (+ `/accept`, `/decline`) |
| `/[cc]/account` | `(main)/account` | Cuenta (ver parallel routes abajo) |

### Cuenta con Parallel Routes

`account/layout.tsx` usa **rutas paralelas** `@login` y `@dashboard`:
- Si **no** hay cliente autenticado → renderiza el slot `@login` (login/registro).
- Si hay cliente → renderiza `@dashboard`: overview, `orders`, `orders/details/[id]`,
  `addresses`, `profile`.

### Archivos especiales
- **`not-found`**: global (`app/not-found.tsx`) + por grupo (`(main)`, `(checkout)`,
  `cart`).
- **`loading`**: `cart`, `order/.../confirmed`, `account`, `account/@dashboard`
  (usan el módulo `skeletons`).
- **No existen** `error.tsx` (error boundaries), `template.tsx`, `sitemap`/`robots`
  generados en `src` (hay config de `next-sitemap.js` pero depende de
  `NEXT_PUBLIC_VERCEL_URL`).

---

## 4. Middleware y multi-región

`src/middleware.ts` corre en **Edge** y es la puerta de entrada de toda petición.

1. **Mapa de regiones**: hace `fetch` directo a `${BACKEND_URL}/store/regions`
   (no usa el SDK porque Edge no es Node) y construye un `Map<countryCode, region>`
   con TTL de 1h. Cachea con tag `regions-${cacheId}`.
2. **Detección de país** (en orden de prioridad):
   1. Primer segmento de la URL (`/dk/...`)
   2. Cloudflare `request.cf.country`
   3. Vercel `x-vercel-ip-country`
   4. `NEXT_PUBLIC_DEFAULT_REGION` (por defecto `dk`)
   5. Primera región disponible
3. **Redirección**: si la URL ya trae el país correcto → `next()` (y setea la cookie
   `_medusa_cache_id` si falta). Si no → **redirect 307** a `/{country}{path}`.

Consecuencia práctica: entrar a `http://localhost:8000/` te redirige a
`http://localhost:8000/dk` (o el país detectado). **La región vive en la URL**, no en
una cookie.

---

## 5. Capa de datos (Server Actions + SDK)

### El cliente SDK — `src/lib/config.ts`
Instancia única `sdk = new Medusa({ baseUrl, publishableKey, debug })`. Además
**parchea `sdk.client.fetch`** para inyectar automáticamente la cabecera
`x-medusa-locale` (leída de la cookie `_medusa_locale`) en **cada** petición.

### `src/lib/data/*`
Casi todos son ficheros `"use server"`. Patrón general:
- **Lecturas**: `sdk.client.fetch<T>(path, { method: "GET", query, next: getCacheOptions(tag), cache: "force-cache" })`. Errores → `.catch(() => null)`.
- **Escrituras**: métodos tipados `sdk.store.*` / `sdk.auth.*` seguidos de
  `revalidateTag(getCacheTag(tag))`. Errores → `medusaError()`.
- Toda petición lleva auth (`getAuthHeaders`) y locale (auto).

| Fichero | Responsabilidad | Funciones destacadas |
|---------|-----------------|----------------------|
| `cart.ts` | Ciclo de vida del carrito y cierre | `getOrSetCart`, `addToCart`, `updateLineItem`, `deleteLineItem`, `setShippingMethod`, `initiatePaymentSession`, `setAddresses`, `applyPromotions`, `placeOrder` |
| `customer.ts` | Cliente + auth | `retrieveCustomer`, `login`, `signup`, `signout`, `transferCart`, `add/update/deleteCustomerAddress` |
| `products.ts` | Catálogo | `listProducts` (paginado, con region/precios), `listProductsWithSort` |
| `regions.ts` | Regiones | `listRegions`, `getRegion` (memoizado, fallback `us`) |
| `orders.ts` | Pedidos y transferencias | `retrieveOrder`, `listOrders`, `create/accept/declineTransferRequest` |
| `collections.ts` / `categories.ts` | Navegación de catálogo | `getCollectionByHandle`, `getCategoryByHandle`, `listCollections`, `listCategories` |
| `fulfillment.ts` | Envío | `listCartShippingMethods`, `calculatePriceForShippingOption` |
| `payment.ts` | Pago | `listCartPaymentMethods` |
| `variants.ts` | Variantes | `retrieveVariant` |
| `locales.ts` / `locale-actions.ts` | i18n | `listLocales`, `getLocale`, `updateLocale` |
| `onboarding.ts` | Onboarding admin | `resetOnboardingState` |

### Sesión y cookies — `src/lib/data/cookies.ts`
| Cookie | Contenido | Flags |
|--------|-----------|-------|
| `_medusa_jwt` | Token de auth del cliente | httpOnly, 7 días, sameSite strict |
| `_medusa_cart_id` | ID del carrito activo | httpOnly, 7 días |
| `_medusa_cache_id` | ID para namespacing de tags de caché | seteada por el middleware |
| `_medusa_locale` | Locale seleccionado | **no** httpOnly (legible por cliente), 1 año |

Flujo de carrito: `getOrSetCart` crea el carrito si no hay cookie y guarda el id.
Al hacer login/signup, `transferCart` reasigna el carrito de invitado al cliente.
`placeOrder` y `signout` borran `_medusa_cart_id`.

### Estado en cliente
Deliberadamente **mínimo**: no hay store global de carrito/cliente en React. El estado
de servidor fluye por cookies + tags de caché. En cliente solo hay:
`modal-context.tsx`, `use-in-view` (IntersectionObserver) y `use-toggle-state`.

---

## 6. Diagrama de flujo de una compra

```
[Middleware] detecta país → redirige a /{cc}
      │
[Home /dk] ──► [Producto /dk/products/handle]
      │              │ selecciona variante (?v_id) → addToCart (server action)
      │              ▼
      │        crea/recupera _medusa_cart_id  ──►  [Carrito /dk/cart]
      │                                                   │ (promos, cantidades)
      ▼                                                   ▼
                                              [Checkout /dk/checkout]
                                                   1. Direcciones (setAddresses)
                                                   2. Envío (setShippingMethod)
                                                   3. Pago (initiatePaymentSession → Stripe/Manual)
                                                   4. Review → placeOrder (cart.complete)
                                                            │
                                                            ▼
                                              [Order confirmado /dk/order/{id}/confirmed]
```

---

## 7. Flujos de prueba (QA manual)

Requisitos previos: backend corriendo en `:9000` con **regiones, productos, opciones de
envío y un proveedor de pago** configurados y con seed; storefront en `:8000` con
`.env.local` (publishable key válida). Ver §9 para arranque.

> Sugerencia: prueba con el idioma/DevTools de red abierto para ver las llamadas a
> `/store/*` y confirmar qué server action se dispara en cada paso.

### Flujo A — Navegación y multi-región (smoke test)
1. Abre `http://localhost:8000/` → debe **redirigir** a `/{país}` (307).
2. Cambia el país desde el selector del nav/footer → la URL cambia de `/dk` a otro país
   y **los precios/moneda cambian**.
3. Navega Home → Store → Colección → Categoría → Producto.
- **Verificar**: precios con la moneda de la región; imágenes cargan; paginación y
  orden en `/store` funcionan; no hay 404 inesperados.

### Flujo B — Producto → Carrito
1. Entra a un producto con variantes. Selecciona opciones → la URL añade `?v_id=...`.
2. Comprueba el estado de stock (agotado / backorder / disponible).
3. "Add to cart" → aparece en el cart dropdown / badge del nav.
4. Ve a `/[cc]/cart`: cambia cantidad y elimina línea.
- **Verificar**: el carrito persiste al recargar (cookie `_medusa_cart_id`); totales se
  recalculan; producto sin stock no deja añadir.

### Flujo C — Promociones
1. En el carrito o checkout, aplica un **código de promoción** válido.
2. Aplica uno inválido.
- **Verificar**: descuento se refleja en totales; error claro con código inválido.
- ⚠️ **Gift cards** están sin implementar (ver §8), no las incluyas como caso soportado.

### Flujo D — Checkout completo (invitado)
1. Con carrito no vacío, ve a `/[cc]/checkout`.
2. **Direcciones**: rellena envío (y facturación si difiere) → continúa.
3. **Envío**: elige método de envío disponible.
4. **Pago**: selecciona proveedor. Con Stripe usa tarjeta de test `4242 4242 4242 4242`;
   con proveedor manual/sistema, usa el botón de pago manual.
5. **Review** → "Place order".
- **Verificar**: redirige a `/[cc]/order/{id}/confirmed` con el resumen; el carrito se
  vacía (cookie borrada); el pedido aparece en el admin de Medusa.

### Flujo E — Cuenta / Autenticación
1. En `/[cc]/account` (no logueado) → aparece login/registro.
2. **Regístrate** → debería quedar logueado y **conservar el carrito** (transferCart).
3. Logout y vuelve a **login**.
4. Explora dashboard: overview, `orders`, detalle de pedido, `addresses` (crear/editar/
   borrar dirección), `profile`.
- **Verificar**: el carrito de invitado se conserva tras login; direcciones CRUD
  funciona; los pedidos previos se listan.
- ⚠️ En `profile`: **editar email y cambiar contraseña NO funcionan** (ver §8).

### Flujo F — Checkout autenticado
1. Logueado y con direcciones guardadas, entra al checkout.
2. Selecciona una dirección guardada en lugar de escribirla.
- **Verificar**: el selector de direcciones precarga los datos del cliente.

### Flujo G — Transferencia de pedido
1. Desde `account/orders`, usa el formulario "Transfer request" con un Order ID.
2. Abre el enlace `/order/{id}/transfer/{token}` y prueba **accept** / **decline**.
- **Verificar**: mensajes de éxito/error correctos.
- ⚠️ El formulario tiene TODO de notificaciones (toast) sin implementar.

### Flujo H — Casos límite
- Carrito inexistente → `/[cc]/cart` muestra `not-found`.
- Producto/colección inexistente → 404.
- Recargar en cada paso del checkout mantiene el estado.
- Cambiar de región con carrito activo → banner `CartMismatchBanner` / recálculo.

---

## 8. Pendientes detectados (checklist)

Encontrados por TODOs en el código y stubs vacíos. Úsalo como backlog de verificación:

**Cuenta / Perfil**
- [ ] **Cambio de contraseña sin implementar** — `profile-password/index.tsx`: la acción
      solo hace `console.info("Password update is not implemented")`.
- [ ] **Actualización de email sin implementar** — `profile-email/index.tsx`: la acción
      es un no-op (`// TODO: It seems we don't support updating emails now?`).
- [ ] Bloque de contraseña **comentado** en `account/@dashboard/profile/page.tsx`.

**Notificaciones (UX)**
- [ ] **Toaster eliminado** en todo el proyecto — múltiples TODOs "Re-add Toaster / toast
      notifications" (`account/layout.tsx`, `transfer-request-form`, `common/components/ui`,
      `profile-*`). Los errores/éxitos no se notifican al usuario de forma consistente.

**Carrito / Inventario**
- [ ] Cantidad máxima por línea **hardcodeada**, no lee inventario real de Medusa v2 —
      `cart/components/item/index.tsx` (`// TODO: Update this with the v2 way of managing inventory`).

**Promociones**
- [ ] **Gift cards no soportadas** — en `lib/data/cart.ts`, `applyGiftCard`,
      `removeGiftCard` y `removeDiscount` son stubs/no-ops.
- [ ] `placeOrder`/acciones de carrito reciben `FormData` en vez de POJO
      (`// TODO: Pass a POJO instead of a form entity here`).

**Configuración / Deuda técnica**
- [ ] `next.config.js` tiene `typescript.ignoreBuildErrors: true` y
      `eslint.ignoreDuringBuilds: true` → el build **no** falla ante errores de tipos/lint.
      Conviene sanear y desactivarlo.
- [ ] `images.unoptimized: true` → sin optimización de imágenes de Next.
- [ ] No hay `error.tsx` (error boundaries) en ninguna ruta → un fallo de servidor no
      tiene UI de recuperación dedicada.
- [ ] `sitemap`/`robots` dependen de `NEXT_PUBLIC_VERCEL_URL`; verificar en despliegue.

**Cosas a validar contra el backend (no son bugs del front, pero bloquean flujos)**
- [ ] Que exista al menos una **opción de envío** por región (si no, el checkout se corta
      en el paso de envío: `CheckoutForm` retorna `null`).
- [ ] Que haya un **proveedor de pago** habilitado por región (Stripe o manual/system).
- [ ] Endpoint `/store/locales` (i18n) es opcional: si devuelve 404, el selector de
      idioma simplemente no aparece.

---

## 9. Cómo levantar el proyecto

```bash
# En la raíz del monorepo
pnpm install

# Backend (terminal 1)
cp apps/backend/.env.template apps/backend/.env       # setear DATABASE_URL
cd apps/backend
pnpm medusa db:migrate
pnpm medusa user -e admin@test.com -p supersecret
pnpm dev                                              # admin en :9000/app

# Storefront (terminal 2)
cp apps/storefront/.env.template apps/storefront/.env.local
#  → setear NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY (Admin > Settings > Publishable API keys)
cd apps/storefront
pnpm dev                                              # storefront en :8000
```

O desde la raíz: `pnpm dev` (levanta ambos con Turbo).

**Variables del storefront** (`.env.local`):

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable key del backend | — (requerida) |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL del backend | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | País por defecto | `dk` |
| `NEXT_PUBLIC_BASE_URL` | URL base del storefront | `https://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_KEY` | Publishable key de Stripe (opcional) | — |

`check-env-variables.js` valida las variables requeridas al arrancar `next`.
