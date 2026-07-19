import { listProductsWithSort } from "@lib/data/products"
import { getFavoritedProductIds } from "@lib/data/favorites"
import { getRegion } from "@lib/data/regions"
import { StoreBrand } from "@lib/data/brands"
import { StoreTag } from "@lib/data/tags"
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
  brand_id?: string[]
  tag_id?: string[]
  rating_gte?: number
  on_sale?: boolean
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  brandId,
  tagId,
  ratingGte,
  onSale,
  productsIds,
  query,
  countryCode,
  brands = [],
  tags = [],
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  brandId?: string[]
  tagId?: string[]
  ratingGte?: string
  onSale?: boolean
  productsIds?: string[]
  query?: string
  countryCode: string
  brands?: StoreBrand[]
  tags?: StoreTag[]
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

  if (brandId?.length) {
    queryParams["brand_id"] = brandId
  }

  if (tagId?.length) {
    queryParams["tag_id"] = tagId
  }

  if (ratingGte) {
    queryParams["rating_gte"] = parseInt(ratingGte)
  }

  if (onSale) {
    queryParams["on_sale"] = true
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  // Ordering is owned by listProductsWithSort (it decides backend `order` vs
  // in-memory price sort), so no `order` is set here.

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [
    {
      response: { products, count },
    },
    favoritedProductIds,
  ] = await Promise.all([
    listProductsWithSort({
      page,
      queryParams,
      sortBy,
      countryCode,
    }),
    getFavoritedProductIds(),
  ])

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <RodiPlpToolbar
        sortBy={sortBy ?? "created_at"}
        productCount={count}
        title={query?.trim() ? "Todos los resultados" : undefined}
        brands={brands}
        tags={tags}
      />
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 xl:grid-cols-5 gap-3.5 gap-y-6"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview
              product={p}
              region={region}
              isFavorited={favoritedProductIds.has(p.id)}
            />
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
