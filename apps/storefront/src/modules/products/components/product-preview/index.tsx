import { getCartLineMap } from "@lib/data/cart-line"
import { getProductPrice } from "@lib/util/get-product-price"
import { getQuickAddVariantId } from "@lib/util/product-variant"
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

  // Memoized per render, so a grid of N cards costs one cart fetch. Passing the
  // line down as a prop is what keeps the card from asking the server for it
  // once it mounts.
  const cartLines = await getCartLineMap()
  const quickAddVariantId = getQuickAddVariantId(product)
  const cartLine = quickAddVariantId
    ? cartLines[quickAddVariantId] ?? null
    : null

  return (
    <RodiProductCard
      product={product}
      cheapestPrice={cheapestPrice}
      isFeatured={isFeatured}
      isFavorited={isFavorited}
      cartLine={cartLine}
      layout={layout}
    />
  )
}
