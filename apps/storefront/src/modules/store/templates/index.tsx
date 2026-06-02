import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RodiPlpFilters from "@modules/store/components/rodi-plp-filters"
import RodiPlpHero from "@modules/store/components/rodi-plp-hero"
import RodiSearchHero from "@modules/store/components/rodi-search-hero"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  query,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  query?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const searchQuery = query?.trim()
  const isSearch = Boolean(searchQuery)

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
          <RodiPlpFilters sortBy={sort} data-testid="sort-by-container" />
        )}
        <div className="w-full min-w-0 flex-1">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              query={searchQuery}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
