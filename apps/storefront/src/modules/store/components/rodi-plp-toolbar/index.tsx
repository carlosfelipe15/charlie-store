"use client"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RodiActiveFilterChips from "@modules/store/components/rodi-active-filter-chips"
import RodiSortSelect from "./rodi-sort-select"
import { StoreBrand } from "@lib/data/brands"
import { StoreTag } from "@lib/data/tags"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type RodiPlpToolbarProps = {
  sortBy: SortOptions
  productCount?: number
  title?: string
  brands?: StoreBrand[]
  tags?: StoreTag[]
}

export default function RodiPlpToolbar({
  sortBy,
  productCount,
  title,
  brands = [],
  tags = [],
}: RodiPlpToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setSort = useCallback(
    (value: SortOptions) => {
      const params = new URLSearchParams(searchParams)
      params.set("sortBy", value)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="text-sm text-rm-ink-2">
          {title ? (
            <span className="font-bold text-rm-ink">{title}</span>
          ) : productCount != null ? (
            <span>{productCount} productos</span>
          ) : (
            <span>Catálogo</span>
          )}
          {title && productCount != null && (
            <span className="text-rm-ink-3 font-normal"> · {productCount} productos</span>
          )}
        </div>
        <RodiActiveFilterChips brands={brands} tags={tags} />
      </div>
      <RodiSortSelect value={sortBy} onChange={setSort} />
    </div>
  )
}
