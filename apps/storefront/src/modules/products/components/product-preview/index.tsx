import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import RodiProductCard from "@modules/products/components/rodi-product-card"

export default async function ProductPreview({
  product,
  isFeatured,
  isFavorited,
  region: _region,
  layout = "grid",
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  isFavorited?: boolean
  region: HttpTypes.StoreRegion
  layout?: "grid" | "compact"
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <RodiProductCard
      product={product}
      cheapestPrice={cheapestPrice}
      isFeatured={isFeatured}
      isFavorited={isFavorited}
      layout={layout}
    />
  )
}
