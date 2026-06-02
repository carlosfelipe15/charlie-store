import React, { Suspense } from "react"

import RodiBreadcrumbs from "@modules/products/components/rodi-breadcrumbs"
import RodiImageGallery from "@modules/products/components/rodi-image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import RodiPdpDelivery from "@modules/products/components/rodi-pdp-delivery"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

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

        <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8 lg:gap-10 pb-10">
          <div className="flex flex-col gap-8 min-w-0">
            <RodiImageGallery images={images} />
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
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <RodiPdpDelivery />
          </aside>
        </main>

        <div className="lg:hidden pb-8">
          <ProductTabs product={product} />
        </div>
      </div>

      <div data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
