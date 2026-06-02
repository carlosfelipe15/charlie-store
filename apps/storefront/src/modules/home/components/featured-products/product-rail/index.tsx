import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { RodiSectionHead } from "@modules/common/components/rodi"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-16">
      <RodiSectionHead
        title={collection.title ?? "Destacados"}
        actionLabel="Ver todo"
        actionHref={`/collections/${collection.handle}`}
      />
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-3.5 gap-y-8 small:gap-x-3.5">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
