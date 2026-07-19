"use client"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
import { RodiStars } from "@modules/common/components/rodi"
import { StoreBrand } from "@lib/data/brands"
import { StoreTag } from "@lib/data/tags"
import { ProductFacets } from "@lib/data/products"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import RodiFilterGroup from "./filter-group"
import RodiFilterRow from "./filter-row"

type RodiPlpFiltersProps = {
  sortBy: SortOptions
  brands: StoreBrand[]
  tags: StoreTag[]
  facets?: ProductFacets
  "data-testid"?: string
}

const ratingTiers = [5, 4, 3] as const

export default function RodiPlpFilters({
  sortBy,
  brands,
  tags,
  facets,
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

  const toggleRatingParam = useCallback(
    (value: string) => {
      setOrDeleteParam("rating_gte", ratingGte === value ? "" : value)
    },
    [ratingGte, setOrDeleteParam]
  )

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
          <RodiFilterGroup title="Marca">
            <ul className="flex flex-col" data-testid="brand-filter-list">
              {brands.map((brand) => (
                <RodiFilterRow
                  key={brand.id}
                  id={`brand-${brand.id}`}
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={() =>
                    toggleMultiValueParam("brand_id", selectedBrandIds, brand.id)
                  }
                  count={facets ? facets.brand[brand.id] ?? 0 : undefined}
                  data-testid={`brand-filter-${brand.id}`}
                >
                  {brand.name}
                </RodiFilterRow>
              ))}
            </ul>
          </RodiFilterGroup>
        )}
        <RodiFilterGroup title="Promociones">
          <ul className="flex flex-col">
            <RodiFilterRow
              id="on-sale-filter"
              checked={onSale}
              onChange={() => toggleBooleanParam("on_sale")}
              count={facets?.on_sale}
              data-testid="on-sale-filter"
            >
              En oferta
            </RodiFilterRow>
          </ul>
        </RodiFilterGroup>
        {tags.length > 0 && (
          <RodiFilterGroup title="Atributos">
            <ul className="flex flex-col" data-testid="tag-filter-list">
              {tags.map((tag) => (
                <RodiFilterRow
                  key={tag.id}
                  id={`tag-${tag.id}`}
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => toggleMultiValueParam("tag_id", selectedTagIds, tag.id)}
                  count={facets ? facets.tag[tag.id] ?? 0 : undefined}
                  data-testid={`tag-filter-${tag.id}`}
                >
                  {tag.value}
                </RodiFilterRow>
              ))}
            </ul>
          </RodiFilterGroup>
        )}
        <RodiFilterGroup title="Calificación" last>
          <ul className="flex flex-col" data-testid="rating-filter">
            {ratingTiers.map((tier) => (
              <RodiFilterRow
                key={tier}
                id={`rating-${tier}`}
                checked={ratingGte === String(tier)}
                onChange={() => toggleRatingParam(String(tier))}
                count={facets?.rating[String(tier)]}
                data-testid={`rating-filter-${tier}`}
              >
                <RodiStars value={tier} size={12} />
                {tier < 5 && (
                  <span className="text-rm-ink-2 font-normal">y más</span>
                )}
              </RodiFilterRow>
            ))}
          </ul>
        </RodiFilterGroup>
        <p className="text-xs text-rm-ink-3 mt-4 leading-relaxed">
          Filtro de precio en una próxima iteración.
        </p>
      </div>
    </aside>
  )
}
