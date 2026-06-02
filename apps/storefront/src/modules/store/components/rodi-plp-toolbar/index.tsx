"use client"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { RodiIconChevron, RodiIconSort } from "@modules/common/icons/rodi"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const sortLabels: Record<SortOptions, string> = {
  created_at: "Más recientes",
  price_asc: "Menor precio",
  price_desc: "Mayor precio",
}

type RodiPlpToolbarProps = {
  sortBy: SortOptions
  productCount?: number
  title?: string
}

export default function RodiPlpToolbar({
  sortBy,
  productCount,
  title,
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
      <div className="relative">
        <label className="sr-only" htmlFor="plp-sort">
          Ordenar
        </label>
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rm-line bg-rm-paper text-[13px] font-semibold text-rm-ink">
          <RodiIconSort size={14} />
          <select
            id="plp-sort"
            value={sortBy}
            onChange={(e) => setSort(e.target.value as SortOptions)}
            className="bg-transparent border-0 outline-none cursor-pointer pr-6 appearance-none"
          >
            {(Object.keys(sortLabels) as SortOptions[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
          <RodiIconChevron size={12} className="pointer-events-none -ml-4" />
        </div>
      </div>
    </div>
  )
}
