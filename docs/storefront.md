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
    │   ├── order/                 # Confirmación y transferencia
    │   ├── contact/
    │   ├── content/[slug]/        # Páginas de contenido estático
    │   └── design-system/         # Vitrina interna de componentes/tokens
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

## Brands, Reviews, Favorites y Zones en el storefront

Las cuatro features custom del backend ya están conectadas al storefront:

| Feature | Datos | UI |
|---------|-------|-----|
| Brands | `lib/data/brands.ts`, `lib/util/product-brand.ts` | `modules/home/components/rodi-brands-strip/`, `modules/products/components/rodi-product-card/`, checkboxes de marca en `modules/store/components/rodi-plp-filters/` (filtra `GET /store/products-list?brand_id=...`) |
| Reviews | `lib/data/reviews.ts` | `modules/products/components/rodi-product-reviews/` (PDP), badge de rating en `modules/products/templates/product-info/`, stat sitewide en el panel de login (`account/@login`) |
| Favorites | `lib/data/favorites.ts` | Toggle en `rodi-product-card` y `rodi-image-gallery` (PDP), ícono con badge en el header (`rodi-favorites-button`), página `/account/favorites` |
| Zones ("Entregar en") | `lib/data/zones.ts` (cookie `_charlie_zone`) | `modules/layout/components/rodi-zone-picker/` (reemplaza al `CountrySelect` de país único), filtro `zone_id` en el catálogo, `modules/common/components/zone-conflict-dialog/` (aviso blando al cambiar de zona con carrito no vacío) |

Detalle de cada una: [custom-features/brands.md](./custom-features/brands.md), [custom-features/reviews.md](./custom-features/reviews.md), [custom-features/favorites.md](./custom-features/favorites.md), [custom-features/zones.md](./custom-features/zones.md).

## Galería de imágenes en PDP: compacta vs. hero

`modules/products/components/rodi-image-gallery/` acepta un prop `compact` — cuando es `true`, la imagen principal queda contenida (`max-w-[420px]`, `object-contain`, más padding) en vez del tratamiento grande a todo el ancho disponible (`object-cover`, sin tope). `modules/products/templates/index.tsx` decide el valor con `shouldUseCompactGallery(product)` (`lib/util/product.ts`): compacta solo si el producto pertenece a una de las categorías curadas de Rodi Mercado (`CURATED_CATEGORY_HANDLES` en `lib/util/category-emoji.ts`, excluyendo `electrodomesticos`) **y** no tiene opciones de variante tipo Talla/Size/Color. Responde a las dos variantes de PDP del diseño de referencia (`pdp.jsx`): PDPv1/v2 ("hero", apparel/electrodomésticos) vs. PDPv3 ("Grocery-density", productos de reposición rápida). Requiere que el fetch de producto pida `categories.handle` (ya lo hace `lib/data/products.ts` por defecto); si se agrega otro punto de fetch de producto para la PDP, hay que pedir ese campo también o `shouldUseCompactGallery` siempre devuelve `false`.

El grid de dos columnas del `<main>` en `templates/index.tsx` también depende de este flag: en modo hero usa `grid-cols-[minmax(0,1fr)_420px]` (imagen fluida, info fija); en modo compacto usa columnas de ancho fijo ajustado al contenido (`grid-cols-[minmax(0,504px)_minmax(0,480px)]` + `justify-center`) para centrar el bloque imagen+info en vez de dejar la imagen chica pegada al borde con un hueco vacío antes de la columna de info. Si se ajusta el padding/ancho interno de `rodi-image-gallery` en modo compacto, hay que revisar que `504px` siga cubriendo el ancho real de miniaturas + imagen (72px + gap-3 + 420px).

## Añadir una página nueva

1. Crear ruta bajo `src/app/[countryCode]/(main)/...`
2. Fetch en server component vía `lib/data/*`
3. UI en `src/modules/<dominio>/`
4. Reutilizar layout `(main)/layout.tsx` para nav/footer
