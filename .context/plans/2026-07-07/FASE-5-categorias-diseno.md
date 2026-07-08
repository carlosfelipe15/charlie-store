# Fase 5 — Catálogo: 14 categorías del diseño

## Objetivos
Añadir las 14 categorías de supermercado del diseño de referencia (`design-reference/ecommerce-test/data.jsx`) al seed del backend, **sin eliminar** las categorías demo de ropa (Shirts/Sweatshirts/Pants/Merch) — corrección explícita del usuario a mitad de sesión, ya que son las únicas categorías con productos reales para pruebas hasta que llegue el catálogo definitivo.

## Cambios por archivo
- `apps/backend/src/migration-scripts/initial-data-seed.ts` — el array `product_categories` pasó de 4 a 18 entradas: las 4 demo se mantienen intactas, se añadieron 14 nuevas (Frutas y verduras/`frescos`, Despensa/`despensa`, Lácteos y huevos/`lacteos-huevos`, Carnes y pescados/`carnes`, Panadería/`panaderia`, Bebidas/`bebidas`, Snacks y dulces/`snacks-dulces`, Congelados/`congelados`, Aseo personal/`aseo-personal`, Limpieza del hogar/`limpieza`, Mascotas/`mascotas`, Bebé/`bebe`, Electrodomésticos/`electrodomesticos`, Farmacia/`farmacia`) con `handle` explícito calcado del diseño. **No se sembraron productos.**
- `apps/storefront/src/lib/util/category-emoji.ts` — reescrito. Se agregó `CATEGORY_VISUAL_BY_HANDLE` (mapa `handle → {emoji, token}`, token = clase Tailwind `bg-rm-s-*`) ported 1:1 de `data.jsx:14-27`. Se mantiene `getCategoryEmoji(name)` (keyword-matching) como fallback para categorías fuera del set de diseño (ej. las demo). Nueva función `getCategoryVisual(handle, name)` hace lookup por handle primero, cae a `getCategoryEmoji` si no hay match.
- `apps/storefront/src/modules/home/components/rodi-category-tiles/index.tsx` — usa `getCategoryVisual`, pinta un círculo de color por categoría (antes solo emoji sin fondo).
- `apps/storefront/src/modules/categories/templates/index.tsx` y `apps/storefront/src/modules/layout/components/rodi-mega-menu/index.tsx` — actualizados al mismo helper por consistencia (antes usaban `getCategoryEmoji(name)` directo).

## Decisiones clave
- **Seed aditivo, no destructivo** — decisión del usuario, no mía originalmente. El plan inicial contemplaba reemplazar las categorías demo; se corrigió antes de ejecutar.
- El color/emoji decorativo se mantiene **100% en frontend** (no se agregó ningún campo a `product_category` en el backend) — consistente con el análisis de `backend-gap-analysis-2026-07-05.md`: son ~14 valores estáticos, agregar un campo de backend sería sobre-ingeniería salvo que alguien no-técnico necesite editarlos sin deploy.

## Pendientes para la próxima sesión
- **El seed no se volvió a ejecutar en la base de datos en esta sesión** — solo se modificó el archivo. Falta correr `medusa exec ./src/migration-scripts/initial-data-seed.ts` (o el mecanismo que use el proyecto) para que las 14 categorías nuevas existan realmente en la BD.
- **No se verificó la idempotencia del seed.** `createProductCategoriesWorkflow` podría crear duplicados si el script se ejecuta una segunda vez sobre una BD que ya tiene las 4 categorías demo cargadas — revisar esto antes de re-ejecutar en el entorno actual (que ya tiene el seed viejo aplicado).
- No hay productos en ninguna de las 14 categorías nuevas — llegan en otra sesión según indicó el usuario.

## Consejos para el siguiente agente
- Antes de re-ejecutar el seed sobre la BD actual (que ya corrió la versión de 4 categorías), verificar si `createProductCategoriesWorkflow` falla o duplica ante nombres repetidos — si duplica, puede requerirse un `db:migrate`/reset limpio o filtrar las categorías ya existentes antes de invocar el workflow.
- Para agregar más categorías decorativas en el futuro, extender `CATEGORY_VISUAL_BY_HANDLE` en `category-emoji.ts` — es el único lugar que necesita tocarse, ya está conectado a los 3 lugares que muestran categorías (home tiles, PLP hero, mega-menú).
