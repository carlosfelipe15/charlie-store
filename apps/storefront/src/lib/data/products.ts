"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { getActiveZoneId } from "./zones"

export type ProductFacets = {
  brand: Record<string, number>
  tag: Record<string, number>
  rating: Record<string, number>
  on_sale: number
}

const EMPTY_FACETS: ProductFacets = { brand: {}, tag: {}, rating: {}, on_sale: 0 }

/**
 * Facet counts for the PLP sidebar ("N productos" next to each brand/tag/
 * rating/on-sale option). Scoped to `categoryId` and the active delivery zone
 * only — deliberately ignores any brand/tag/rating/on_sale already selected,
 * so picking one brand doesn't zero out every other brand's count (see the
 * backend route's `scopeFilters` comment). Zone scoping keeps a brand with no
 * eligible products in the current zone from showing a stale catalog-wide
 * count that would then filter down to zero results. Returns `EMPTY_FACETS`
 * (not thrown) on failure so the sidebar degrades to unlabeled filters
 * instead of erroring the page.
 */
export const listProductFacets = async ({
  categoryId,
  countryCode,
}: {
  categoryId?: string
  countryCode: string
}): Promise<ProductFacets> => {
  const region = await getRegion(countryCode)

  if (!region) {
    return EMPTY_FACETS
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  const zoneId = await getActiveZoneId()

  return sdk.client
    .fetch<{ facets?: ProductFacets }>(`/store/products-list`, {
      method: "GET",
      query: {
        limit: 1,
        offset: 0,
        region_id: region.id,
        fields: "id",
        include_facets: true,
        ...(categoryId ? { category_id: [categoryId] } : {}),
        ...(zoneId ? { zone_id: zoneId } : {}),
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ facets }) => facets ?? EMPTY_FACETS)
    .catch(() => EMPTY_FACETS)
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  // Delivery zone ("Entregar en"): scope listings to what's available in the
  // active zone. Skipped when fetching a specific product (`id`/`handle`) so a
  // directly-navigated PDP never disappears just because that product isn't
  // sold in the currently-selected zone. Permissive fallback (products with no
  // zone restriction show everywhere) is handled backend-side.
  const zoneId = await getActiveZoneId()
  const applyZone =
    !!zoneId &&
    !(queryParams as Record<string, unknown> | undefined)?.id &&
    !(queryParams as Record<string, unknown> | undefined)?.handle

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      // Custom endpoint, not core's /store/products — adds brand_id
      // filtering and fixes a core bug where enabling the Index Engine
      // feature flag (MEDUSA_FF_INDEX_ENGINE) breaks category_id filtering
      // site-wide. See apps/backend/src/api/store/products-list/route.ts.
      `/store/products-list`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+brand.*,+categories.id,+categories.handle,",
          ...(applyZone ? { zone_id: zoneId } : {}),
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * Returns one page of products for the given sort order.
 *
 * `created_at` is a real column the backend can order and paginate, so that
 * path fetches exactly one page (limit + offset) — no over-fetch. Price sorting
 * is the only case that can't be pushed down: `calculated_price` is computed
 * per-region by the pricing module, not a sortable column, so it still has to
 * fetch a bounded window and sort in memory.
 */
const PRICE_SORT_WINDOW = 100

export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const pageNumber = Math.max(page, 1)

  if (sortBy !== "price_asc" && sortBy !== "price_desc") {
    // created_at (default): true backend pagination, newest first.
    return listProducts({
      pageParam: pageNumber,
      queryParams: {
        ...queryParams,
        limit,
        order: "-created_at",
      },
      countryCode,
    })
  }

  // Price sort: fetch a bounded window, sort in memory, slice the page. Beyond
  // PRICE_SORT_WINDOW products in a single list the ordering is approximate —
  // acceptable for this catalog's size; revisit if the backend gains price
  // sorting or catalogs grow past it.
  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: PRICE_SORT_WINDOW,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const offset = (pageNumber - 1) * limit
  const nextPage = count > offset + limit ? pageNumber + 1 : null
  const paginatedProducts = sortedProducts.slice(offset, offset + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
