"use client"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { StoreBrand } from "@lib/data/brands"
import { StoreTag } from "@lib/data/tags"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type RodiPlpFiltersProps = {
  sortBy: SortOptions
  brands: StoreBrand[]
  tags: StoreTag[]
  "data-testid"?: string
}

// "all" is a DOM-only sentinel — FilterRadioGroup uses each option's value as
// the hidden radio's `id`/label `htmlFor`, and an empty id is invalid HTML
// (label[for=""] can't associate with anything, so clicking "Todas" silently
// no-ops). Translated back to "" when read from/written to the URL below.
const ratingOptions = [
  { value: "all", label: "Todas" },
  { value: "5", label: "5 estrellas" },
  { value: "4", label: "4 estrellas y más" },
  { value: "3", label: "3 estrellas y más" },
]

export default function RodiPlpFilters({
  sortBy,
  brands,
  tags,
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

  const toggleMultiValueParam = useCallback(
    (name: string, currentValues: string[], value: string) => {
      const current = new Set(currentValues)
      if (current.has(value)) {
        current.delete(value)
      } else {
        current.add(value)
      }

      const params = new URLSearchParams(searchParams)
      if (current.size) {
        params.set(name, Array.from(current).join(","))
      } else {
        params.delete(name)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setOrDeleteParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const toggleBooleanParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams)
      if (params.get(name) === "true") {
        params.delete(name)
      } else {
        params.set(name, "true")
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const selectedBrandIds = (searchParams.get("brand_id") ?? "")
    .split(",")
    .filter(Boolean)
  const selectedTagIds = (searchParams.get("tag_id") ?? "").split(",").filter(Boolean)
  const ratingGte = searchParams.get("rating_gte") ?? ""
  const onSale = searchParams.get("on_sale") === "true"

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("brand_id")
    params.delete("tag_id")
    params.delete("rating_gte")
    params.delete("on_sale")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const hasActiveFilters =
    selectedBrandIds.length > 0 ||
    selectedTagIds.length > 0 ||
    ratingGte.length > 0 ||
    onSale

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
                      onChange={() =>
                        toggleMultiValueParam("brand_id", selectedBrandIds, brand.id)
                      }
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
        {tags.length > 0 && (
          <div className="mt-5 pt-4 border-t border-rm-line-2">
            <p className="text-xs font-bold uppercase tracking-wide text-rm-ink-3 mb-2.5">
              Atributos
            </p>
            <ul className="flex flex-col gap-2" data-testid="tag-filter-list">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <label className="flex items-center gap-2 text-sm text-rm-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleMultiValueParam("tag_id", selectedTagIds, tag.id)}
                      className="w-4 h-4 rounded border-rm-line accent-rm-red"
                      data-testid={`tag-filter-${tag.id}`}
                    />
                    {tag.value}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-rm-line-2">
          <FilterRadioGroup
            title="Calificación"
            items={ratingOptions}
            value={ratingGte || "all"}
            handleChange={(value) =>
              setOrDeleteParam("rating_gte", value === "all" ? "" : value)
            }
            data-testid="rating-filter"
          />
        </div>
        <div className="mt-5 pt-4 border-t border-rm-line-2">
          <p className="text-xs font-bold uppercase tracking-wide text-rm-ink-3 mb-2.5">
            Promociones
          </p>
          <label className="flex items-center gap-2 text-sm text-rm-ink-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onSale}
              onChange={() => toggleBooleanParam("on_sale")}
              className="w-4 h-4 rounded border-rm-line accent-rm-red"
              data-testid="on-sale-filter"
            />
            En oferta
          </label>
        </div>
        <p className="text-xs text-rm-ink-3 mt-4 leading-relaxed">
          Filtro de precio en una próxima iteración.
        </p>
      </div>
    </aside>
  )
}
