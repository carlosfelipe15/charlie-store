import { notFound } from "next/navigation"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getCategoryVisual } from "@lib/util/category-emoji"
import { listBrands } from "@lib/data/brands"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
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

  const countQueryParams: Record<string, unknown> = {
    category_id: [category.id],
    limit: 1,
  }

  if (brandId?.length) {
    countQueryParams.brand_id = brandId
  }

  // A subcategory has no children of its own, so basing the chip row on
  // `category.category_children` makes every sibling disappear as soon as
  // you land on one — fetch the parent's children (siblings) separately
  // instead. (Asking for `*parent_category.category_children` in the same
  // request doesn't work: query.graph won't re-expand the inverse relation
  // we just traversed, so it silently comes back empty.)
  const parentCategory = category.parent_category

  const [brands, productCountResult, siblingCategories] = await Promise.all([
    listBrands(),
    listProducts({ queryParams: countQueryParams, countryCode }),
    parentCategory
      ? listCategories({
          parent_category_id: parentCategory.id,
          fields: "id,name,handle",
        })
      : Promise.resolve(null),
  ])

  const productCount = productCountResult.response.count

  // "Todo" should point at the parent (not at the subcategory itself) when
  // one is active.
  const chipsRootCategory = parentCategory ?? category

  const subcategories = siblingCategories
    ? siblingCategories.map((c) => ({ name: c.name ?? "", handle: c.handle ?? "" }))
    : category.category_children?.map((c) => ({
        name: c.name ?? "",
        handle: c.handle ?? "",
      })) ?? []

  // Same reasoning for the hero emoji/photo: the curated visual map only has
  // entries for the top-level categories, so a subcategory would otherwise
  // fall back to the generic default instead of its parent's emoji/photo.
  const visualSource = parentCategory ?? category
  const visual = getCategoryVisual(visualSource.handle, visualSource.name)

  return (
    <div className="py-6 content-container" data-testid="category-container">
      <RodiPlpHero
        title={category.name ?? "Categoría"}
        subtitle={category.description ?? undefined}
        productCount={productCount}
        emoji={visual.emoji}
        image={visual.image}
      />
      {subcategories.length > 0 && (
        <RodiCategoryChips
          category={chipsRootCategory}
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
              <SkeletonProductGrid numberOfProducts={8} />
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
