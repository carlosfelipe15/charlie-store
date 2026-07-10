"use client"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
import { StoreBrand } from "@lib/data/brands"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type RodiPlpFiltersProps = {
  sortBy: SortOptions
  brands: StoreBrand[]
  "data-testid"?: string
}

export default function RodiPlpFilters({
  sortBy,
  brands,
  "data-testid": dataTestId,
}: RodiPlpFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const selectedBrandIds = (searchParams.get("brand_id") ?? "")
    .split(",")
    .filter(Boolean)

  const toggleBrand = useCallback(
    (brandId: string) => {
      const current = new Set(selectedBrandIds)
      if (current.has(brandId)) {
        current.delete(brandId)
      } else {
        current.add(brandId)
      }

      const params = new URLSearchParams(searchParams)
      if (current.size) {
        params.set("brand_id", Array.from(current).join(","))
      } else {
        params.delete("brand_id")
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, router, searchParams, selectedBrandIds.join(",")]
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("brand_id")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const hasActiveFilters = selectedBrandIds.length > 0

  return (
    <aside className="hidden small:block w-full small:w-[260px] shrink-0">
      <div
        className="sticky top-36 bg-rm-paper border border-rm-line rounded-rm-lg p-4"
        data-testid={dataTestId}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-rm-ink m-0">
            Filtrar
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-rm-red hover:underline"
              data-testid="clear-filters-button"
            >
              Limpiar
            </button>
          )}
        </div>
        <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} />
        {brands.length > 0 && (
          <div className="mt-5 pt-4 border-t border-rm-line-2">
            <p className="text-xs font-bold uppercase tracking-wide text-rm-ink-3 mb-2.5">
              Marca
            </p>
            <ul className="flex flex-col gap-2" data-testid="brand-filter-list">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <label className="flex items-center gap-2 text-sm text-rm-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrandIds.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="w-4 h-4 rounded border-rm-line accent-rm-red"
                      data-testid={`brand-filter-${brand.id}`}
                    />
                    {brand.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-rm-ink-3 mt-4 leading-relaxed">
          Más filtros (precio, promociones) en una próxima iteración.
        </p>
      </div>
    </aside>
  )
}
