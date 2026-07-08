# Rodi Mercado — Backend: qué falta para satisfacer al storefront

> **Archivado.** Snapshot puntual del 2026-07-05. No refleja el estado actual del código (p. ej. Brand ya tiene CRUD completo y Reviews ya existe) — para el estado actual ver `docs/`. Se conserva como insumo histórico de las fases en `.context/plans/`.

Consolida, desde el punto de vista exclusivo del backend (`apps/backend`, Medusa v2), los gaps detectados al contrastar el storefront real contra el diseño de referencia (`design-reference/ecommerce-test/`) y contra el reporte de QA end-to-end. Complementa [`design-review-2026-07-05.md`](./design-review-2026-07-05.md) y [`QA-REPORT-2026-07-05.md`](./QA-REPORT-2026-07-05.md).

| | |
|---|---|
| **Fecha** | 2026-07-05 |
| **Backend** | `apps/backend` (Medusa v2.15.2, puerto 9000) |
| **Método** | Lectura directa de `medusa-config.ts`, `src/modules/`, `src/links/`, `src/workflows/`, `src/api/`, `src/migration-scripts/initial-data-seed.ts`, más una llamada real a `/store/products` contra el backend corriendo |

## Resumen ejecutivo

**No hace falta casi ningún endpoint nuevo.** El storefront ya usa `/store/products`, `/store/regions`, `/store/product-categories`, `/store/carts`, `/store/customers`, `/store/orders` — todos estándar de Medusa v2, todos funcionando (confirmado en QA). El gap real tiene tres formas distintas, y conviene no tratarlas igual:

1. **Dato faltante, no endpoint faltante** — región y catálogo. Un re-seed resuelve la mayoría de los síntomas visibles (bandera/moneda inconsistente, categorías vacías).
2. **Ya construido, solo falta terminar de cablear** — el módulo `brand`.
3. **Genuinamente falta construir algo nuevo** — reseñas/rating.

Y un cuarto punto que vive en la config del backend aunque su síntoma se vea en el checkout: **pagos** — ver la sección dedicada y el documento [`payment-gateway-analysis-2026-07-05.md`](./payment-gateway-analysis-2026-07-05.md).

---

## 1. Región y catálogo — problema de datos, no de API

| Síntoma visible | Causa real | Qué hacer |
|---|---|---|
| Bandera 🇨🇴 + "Denmark"/"Spain" + moneda EUR en el header | El diseño (`data.jsx:4-10`) asume una única región `Colombia/COP`; el backend real tiene 7 regiones europeas compartiendo una sola región EUR | Sembrar una región `co` real en el admin (`co`, moneda `cop`) |
| Grid de categorías con 4-5 tiles en vez de 14 | El seed sigue siendo el demo de ropa de Medusa (Shirts/Sweatshirts/Pants/Merch), no las 14 categorías de supermercado de `data.jsx:13-28` (Frescos, Despensa, Lácteos, Carnes, Panadería, Bebidas, Snacks, Congelados, Aseo, Limpieza, Mascotas, Bebé, Electrodomésticos, Farmacia) | Re-seed con el catálogo real (32 productos según `data.jsx`) |
| Solo 6 productos, todos a €10.00 | Mismo seed de demo sin reemplazar | Mismo re-seed |

**No se necesita ningún endpoint nuevo.** `/store/regions` y `/store/products`/`/store/product-categories` ya devuelven exactamente esta forma de datos — solo apuntan a los datos equivocados.

## 2. Marca (`brand`) — más avanzado de lo que parecía a primera vista

Verifiqué el código directamente (no solo el reporte inicial) y el estado real es:

- ✅ Módulo `Brand` completo — modelo + migración (`src/modules/brand/models/brand.ts`, `src/modules/brand/migrations/`).
- ✅ **Link `Product ↔ Brand` ya definido** — `src/links/product-brand.ts` (`defineLink(ProductModule.linkable.product, BrandModule.linkable.brand)`).
- ✅ **Hook de asignación automática** — `src/workflows/hooks/created-product.ts` engancha `createProductsWorkflow.hooks.productsCreated` y crea el link si el producto se creó con `additional_data.brand_id`.
- ✅ CRUD admin completo (`POST`/`GET /admin/brands`) + widget que muestra la marca en la página de producto del admin.
- ❌ **No existe `GET /store/brands`.**
- ❌ El storefront nunca pide el campo `brand` al consultar productos.
- ❌ Ningún producto tiene `brand_id` asignado todavía (catálogo de demo, sin marcas creadas).

**Prueba en vivo:** contra el backend corriendo, `GET /store/products?fields=id,title,+brand.*` respondió `200` sin error — la expansión del campo ya es válida en la API pública gracias al link existente.

**Conclusión:** mostrar la marca en PDP/tarjetas de PLP **no requiere ningún cambio de backend**, solo agregar `fields: "+brand.*"` a las queries del storefront y crear/asignar marcas reales. Un `GET /store/brands` (calcado del `GET /admin/brands` ya existente, sin los campos administrativos) solo hace falta si además quieren un filtro de marca en el listado de productos.

## 3. Reseñas / rating — el único endpoint que genuinamente falta

El diseño (`data.jsx:54`, `pdp.jsx:57-59,116,153-167`) espera `rating`, `reviews.count` y una distribución de estrellas por producto. **Medusa v2 core no tiene ninguna entidad de reseñas**, y no existe ningún módulo custom que lo cubra en este backend.

**Propuesta**, calcando el patrón ya probado con `brand`:
- Nuevo módulo `review`: modelo `Review { id, product_id, customer_id, rating, body, created_at }`.
- Link `Product ↔ Review` (igual que `product-brand.ts`).
- `GET /store/products/:id/reviews` (paginado).
- Un agregado — `GET /store/reviews/summary?product_id=` o un campo calculado expuesto vía `query.graph` — para el promedio y el conteo que se muestran en PDP y en el stat de la home ("12.4k reseñas 5★").

Solo vale la pena construirlo si esas cifras van a ser reales en producción. Mientras tanto, "12.4k reseñas" es una cifra inventada sin nada detrás — considerar quitarla del copy si el módulo no se va a construir pronto.

## 4. Contenido decorativo / marketing — decisión de producto, no gap técnico

| Contenido | Recomendación |
|---|---|
| Emoji/color de superficie por categoría (`data.jsx:14-27`) | Mapa estático `handle → {emoji, token}` en el frontend. Un campo de backend para ~14 valores decorativos es sobre-ingeniería salvo que alguien no-técnico deba editarlo sin deploy. |
| Banners de home (flash-sale, "Recetas de la semana", franja de marcas, newsletter — `home.jsx:99-206`, hoy sin implementar ni en frontend) | Mismo criterio que las tarjetas del hero que sí existen (hardcodeadas). Solo construir `GET /store/home-content` si hay un dueño de marketing real editando esto sin pasar por un deploy. |
| Umbral de envío gratis "$80.000" | **Confirmado: no existe ninguna regla real** (revisé `initial-data-seed.ts`, sin resultados). Es copy que el checkout no aplica. Crear una promoción/regla de shipping real con ese monto, o quitar la cifra del copy mientras tanto — no construir un endpoint para "leer" algo que no existe. |

---

## Lista de prioridades (backend)

1. **Re-seed con la marca real** — región Colombia/COP + catálogo de `data.jsx`. Arregla el mismatch de bandera/región/moneda y puebla categorías/productos de un solo golpe.
2. **Crear marcas y asignarlas a productos** (el link y el hook ya existen — solo falta el dato). En paralelo, agregar `fields: "+brand.*"` en el storefront.
3. **Decidir si el envío gratis "$80.000" es una promesa real** — si sí, crear la regla; si no, sacar la cifra del copy.
4. **Módulo `review`** — solo si las reseñas van a producción de verdad.
5. Ver documento de pagos aparte para la cuarta pieza pendiente del backend.

---

*Fuentes: `apps/backend/src/{modules,links,workflows,api,migration-scripts}`, más una verificación en vivo contra `localhost:9000`.*
