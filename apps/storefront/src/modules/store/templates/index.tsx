import { Suspense } from "react"

import { listBrands } from "@lib/data/brands"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RodiPlpFilters from "@modules/store/components/rodi-plp-filters"
import RodiPlpHero from "@modules/store/components/rodi-plp-hero"
import RodiSearchHero from "@modules/store/components/rodi-search-hero"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  query,
  brandId,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  query?: string
  brandId?: string[]
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const searchQuery = query?.trim()
  const isSearch = Boolean(searchQuery)

  const brands = isSearch ? [] : await listBrands()

  return (
    <div className="py-6 content-container" data-testid="category-container">
      {isSearch ? (
        <RodiSearchHero query={searchQuery!} />
      ) : (
        <RodiPlpHero
          title="Todos los productos"
          subtitle="Explora el catálogo completo de Rodi Mercado"
          emoji="🛒"
        />
      )}
      <div className="flex flex-col small:flex-row small:items-start gap-6 small:gap-8">
        {!isSearch && (
          <RodiPlpFilters
            sortBy={sort}
            brands={brands}
            data-testid="sort-by-container"
          />
        )}
        <div className="w-full min-w-0 flex-1">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              query={searchQuery}
              brandId={brandId}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
