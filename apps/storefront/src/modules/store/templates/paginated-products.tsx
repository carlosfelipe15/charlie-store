import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { RodiPagination } from "@modules/store/components/rodi-pagination"
import RodiPlpToolbar from "@modules/store/components/rodi-plp-toolbar"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  q?: string
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  query,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  query?: string
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (query?.trim()) {
    queryParams["q"] = query.trim()
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <RodiPlpToolbar
        sortBy={sortBy ?? "created_at"}
        productCount={count}
        title={query?.trim() ? "Todos los resultados" : undefined}
      />
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 xl:grid-cols-5 gap-3.5 gap-y-6"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      <RodiPagination
        data-testid="product-pagination"
        page={page}
        totalPages={totalPages}
      />
    </>
  )
}
