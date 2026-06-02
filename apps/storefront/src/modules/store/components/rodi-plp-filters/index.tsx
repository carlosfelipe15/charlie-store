"use client"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type RodiPlpFiltersProps = {
  sortBy: SortOptions
  "data-testid"?: string
}

export default function RodiPlpFilters({
  sortBy,
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
        </div>
        <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} />
        <p className="text-xs text-rm-ink-3 mt-4 leading-relaxed">
          Más filtros (marca, precio, promociones) en una próxima iteración.
        </p>
      </div>
    </aside>
  )
}
