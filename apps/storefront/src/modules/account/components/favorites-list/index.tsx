import { listCustomerFavorites } from "@lib/data/favorites"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { RodiBtnLink } from "@modules/common/components/rodi"
import ProductPreview from "@modules/products/components/product-preview"

export default async function FavoritesList({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const favorites = await listCustomerFavorites()

  if (!favorites.length) {
    return (
      <div className="flex flex-col items-center gap-y-4 py-16 text-center">
        <p className="text-base-regular text-ui-fg-subtle">
          Todavía no guardaste ningún producto en favoritos.
        </p>
        <RodiBtnLink href="/store" kind="primary">
          Explorar productos
        </RodiBtnLink>
      </div>
    )
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      id: favorites.map((f) => f.product_id),
      limit: favorites.length,
    },
  })

  return (
    <ul
      className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-3.5 gap-y-6"
      data-testid="favorites-list"
    >
      {products.map((p) => (
        <li key={p.id}>
          <ProductPreview product={p} region={region} isFavorited />
        </li>
      ))}
    </ul>
  )
}
