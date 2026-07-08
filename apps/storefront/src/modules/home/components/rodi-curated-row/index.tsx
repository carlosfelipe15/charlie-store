import { getCategoryByHandle } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { RodiSectionHead } from "@modules/common/components/rodi"
import ProductPreview from "@modules/products/components/product-preview"

/**
 * Curated product row for a specific category (design-reference/
 * ecommerce-test/home.jsx:137-172, "Frescos" / "Hogar y cuidado"). Renders
 * nothing if the category has no products yet — expected today, since the
 * real Rodi Mercado catalog hasn't been loaded.
 */
export default async function RodiCuratedRow({
  kicker,
  title,
  categoryHandles,
  region,
}: {
  kicker?: string
  title: string
  categoryHandles: string[]
  region: HttpTypes.StoreRegion
}) {
  const categories = await Promise.all(
    categoryHandles.map((handle) => getCategoryByHandle([handle]))
  )
  const categoryIds = categories.filter(Boolean).map((c) => c!.id)

  if (!categoryIds.length) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: { category_id: categoryIds, limit: 6 },
  })

  if (!products.length) {
    return null
  }

  return (
    <section className="content-container py-8">
      <RodiSectionHead kicker={kicker} title={title} />
      <ul className="grid grid-cols-2 small:grid-cols-3 lg:grid-cols-6 gap-x-3.5 gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}
