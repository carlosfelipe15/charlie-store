import { notFound } from "next/navigation"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getCategoryVisual } from "@lib/util/category-emoji"
import { listBrands } from "@lib/data/brands"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RodiCategoryChips from "@modules/store/components/rodi-category-chips"
import RodiPlpFilters from "@modules/store/components/rodi-plp-filters"
import RodiPlpHero from "@modules/store/components/rodi-plp-hero"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  brandId,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  brandId?: string[]
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const brands = await listBrands()

  const subcategories =
    category.category_children?.map((c) => ({
      name: c.name ?? "",
      handle: c.handle ?? "",
    })) ?? []

  return (
    <div className="py-6 content-container" data-testid="category-container">
      <RodiPlpHero
        title={category.name ?? "Categoría"}
        subtitle={category.description ?? undefined}
        emoji={getCategoryVisual(category.handle, category.name).emoji}
      />
      {(subcategories.length > 0 || category.parent_category) && (
        <RodiCategoryChips
          category={category}
          subcategories={subcategories}
        />
      )}
      <div className="flex flex-col small:flex-row small:items-start gap-6 small:gap-8">
        <RodiPlpFilters
          sortBy={sort}
          brands={brands}
          data-testid="sort-by-container"
        />
        <div className="w-full min-w-0 flex-1">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              brandId={brandId}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
