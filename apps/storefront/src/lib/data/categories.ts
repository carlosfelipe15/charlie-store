import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          // No `*products`: expanding every category's full product list here
          // shipped ~250KB of RSC payload on every navigation (this runs in the
          // header), and nothing consumes it. The grandparent
          // (`*parent_category.parent_category`) was likewise unused. Callers
          // that need product data fetch it via listProducts instead.
          //
          // Wildcard-only, no explicit root scalars (id/name/…): `parent_category`
          // is a self-referential module link, and mixing an explicit root field
          // list with a `*`-wildcard on a linked relation makes Medusa silently
          // return that relation as null. Root scalars come back by default.
          fields: "*category_children, *parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          // Note: *parent_category.category_children (re-expanding the
          // inverse relation we just traversed) silently comes back empty —
          // Medusa's query.graph doesn't support that cycle. When the chip
          // row needs a subcategory's siblings, fetch them separately via
          // listCategories({ parent_category_id }) instead.
          //
          // No `*products`: the only consumer was a skeleton-count fallback
          // that already defaults when absent. The category page's product
          // count comes from a separate listProducts call, not from here.
          // Wildcard-only (no explicit root scalars) so the self-referential
          // `*parent_category` link isn't silently nulled — see listCategories.
          fields: "*category_children, *parent_category",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
