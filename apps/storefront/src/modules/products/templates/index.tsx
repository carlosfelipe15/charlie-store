import { Suspense } from "react"

import { getFavoritedProductIds } from "@lib/data/favorites"
import { retrieveCart } from "@lib/data/cart"
import { checkZoneEligibility, getActiveZone, listZones } from "@lib/data/zones"
import RodiBreadcrumbs from "@modules/products/components/rodi-breadcrumbs"
import RodiImageGallery from "@modules/products/components/rodi-image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import RodiPdpDelivery from "@modules/products/components/rodi-pdp-delivery"
import RodiProductReviews from "@modules/products/components/rodi-product-reviews"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import { shouldUseCompactGallery } from "@lib/util/product"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

async function ProductTemplate({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) {
  if (!product || !product.id) {
    return notFound()
  }

  const favoritedProductIds = await getFavoritedProductIds()
  const isFavorited = favoritedProductIds.has(product.id)
  const compactGallery = shouldUseCompactGallery(product)

  const [zones, activeZone, cart] = await Promise.all([
    listZones(),
    getActiveZone(),
    retrieveCart().catch(() => null),
  ])

  // Same shape RodiHeader derives for the "Entregar en" picker — reused here
  // so the PDP's zone modal shares the exact same zone↔cart soft-warning.
  const cartItems =
    cart?.items
      ?.filter((item) => !!item.product_id)
      .map((item) => ({
        id: item.id,
        product_id: item.product_id as string,
        title: item.product_title ?? item.title,
        thumbnail: item.thumbnail ?? null,
      })) ?? []

  // Only this product's availability in the active zone — not the whole
  // catalog, and not needed at all when no zone is set yet.
  const isAvailableInActiveZone = activeZone
    ? (await checkZoneEligibility(activeZone.id, [product.id])).length === 0
    : true

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/store" },
    ...(product.collection
      ? [
          {
            label: product.collection.title ?? "Colección",
            href: `/collections/${product.collection.handle}`,
          },
        ]
      : []),
    { label: product.title ?? "Producto" },
  ]

  return (
    <>
      <div className="content-container" data-testid="product-container">
        <RodiBreadcrumbs items={breadcrumbItems} />

        <main
          className={clsx(
            "grid grid-cols-1 gap-8 lg:gap-10 pb-10",
            compactGallery
              ? "lg:grid-cols-[minmax(0,504px)_minmax(0,480px)] lg:justify-center"
              : "lg:grid-cols-[minmax(0,1fr)_420px]"
          )}
        >
          <div className="flex flex-col gap-8 min-w-0">
            <RodiImageGallery
              images={images}
              productId={product.id}
              isFavorited={isFavorited}
              compact={compactGallery}
            />
            <div className="hidden lg:block">
              <ProductTabs product={product} />
            </div>
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-36 lg:self-start">
            <ProductInfo product={product} />
            <Suspense
              fallback={
                <ProductActions
                  disabled
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper
                id={product.id}
                region={region}
                unavailableInZone={!!activeZone && !isAvailableInActiveZone}
              />
            </Suspense>
            <RodiPdpDelivery
              zones={zones}
              activeZone={activeZone}
              cartItems={cartItems}
              isAvailable={isAvailableInActiveZone}
            />
          </aside>
        </main>

        <div className="lg:hidden pb-8">
          <ProductTabs product={product} />
        </div>
      </div>

      <RodiProductReviews productId={product.id!} />

      <div data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
