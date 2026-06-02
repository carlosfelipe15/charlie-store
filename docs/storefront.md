# Storefront (`@dtc/storefront`)

Next.js 15 con App Router, multi-región por segmento `[countryCode]`.

## Configuración

- **SDK**: `src/lib/config.ts` — instancia `@medusajs/js-sdk` con publishable key
- **Env**: `apps/storefront/.env.local` (ver [development.md](./development.md))
- **Estilos**: Tailwind + `@medusajs/ui-preset`; globals en `src/styles/globals.css`

El SDK intercepta `fetch` para inyectar header `x-medusa-locale` según preferencia del usuario.

## Routing (App Router)

```
src/app/
├── layout.tsx
└── [countryCode]/
    ├── (main)/                    # Layout tienda estándar
    │   ├── page.tsx               # Home
    │   ├── store/                 # Catálogo
    │   ├── products/[handle]/     # PDP
    │   ├── collections/[handle]/
    │   ├── categories/[...category]/
    │   ├── cart/
    │   ├── account/               # Parallel routes @login / @dashboard
    │   └── order/                 # Confirmación y transferencia
    └── (checkout)/
        └── checkout/
```

La región se deriva del código de país en la URL; el default viene de `NEXT_PUBLIC_DEFAULT_REGION`.

## Capas de código

| Carpeta | Rol |
|---------|-----|
| `src/lib/data/` | Server-side data fetching (cart, products, customer, orders, …) |
| `src/lib/util/` | Helpers (precios, money, errores Medusa) |
| `src/lib/hooks/` | Hooks cliente (`use-toggle-state`, `use-in-view`) |
| `src/modules/` | Componentes UI por dominio (products, cart, checkout, layout, …) |
| `src/types/` | Tipos compartidos |

Convención: las **server actions** y funciones en `lib/data/*` hablan con Medusa; los componentes en `modules/*` reciben datos ya resueltos o usan acciones del servidor.

## Módulos UI principales

| Módulo | Contenido |
|--------|-----------|
| `layout` | Nav, footer, cart dropdown, country/language select |
| `home` | Hero, featured products |
| `products` | PDP, galería, variantes, precio |
| `store` | Listado paginado y filtros |
| `cart` | Carrito y líneas |
| `checkout` | Flujo multi-paso (shipping, payment) |
| `account` | Perfil, direcciones, pedidos |
| `order` | Detalle post-compra, transferencia entre cuentas |
| `skeletons` | Estados de carga |

## Integración con Medusa

- **Publishable key** obligatoria para store API
- **Backend URL** por defecto `http://localhost:9000`
- Pagos Stripe opcionales vía `NEXT_PUBLIC_STRIPE_KEY`

Para llamar **rutas custom del backend** (ej. futuras APIs de brands en store), seguir el skill `building-storefronts` y extender el SDK o usar `sdk.client.fetch` con tipos explícitos.

## Scripts

| Script | Acción |
|--------|--------|
| `pnpm dev` | `next dev --turbopack -p 8000` |
| `pnpm build` | Build producción |
| `pnpm start` | Servidor producción puerto 8000 |
| `pnpm lint` | ESLint (Next) |

## Design reference

`design-reference/` — mockups y canvas de diseño (“Rodi Mercado”, ecommerce-test). Referencia visual para futuras iteraciones de UI; **no** importar directamente en rutas de producción sin adaptar a `modules/` y tokens del proyecto.

## Estado respecto a Brands

El backend expone marcas en admin y links con productos, pero **el storefront no muestra marcas aún**. Implementación típica:

1. Ruta store `GET /store/brands` (o ampliar producto con `fields=+brand.*`)
2. Funciones en `lib/data/brands.ts`
3. Componentes en PDP/listados según diseño

## Añadir una página nueva

1. Crear ruta bajo `src/app/[countryCode]/(main)/...`
2. Fetch en server component vía `lib/data/*`
3. UI en `src/modules/<dominio>/`
4. Reutilizar layout `(main)/layout.tsx` para nav/footer
