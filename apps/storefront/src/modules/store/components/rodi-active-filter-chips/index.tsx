"use client"

import { StoreBrand } from "@lib/data/brands"
import { StoreTag } from "@lib/data/tags"
import { RodiIconX } from "@modules/common/icons/rodi"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type RodiActiveFilterChipsProps = {
  brands: StoreBrand[]
  tags: StoreTag[]
}

type Chip = {
  key: string
  label: string
  onRemove: () => void
}

export default function RodiActiveFilterChips({ brands, tags }: RodiActiveFilterChipsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const removeFromMultiValueParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      const remaining = (params.get(name) ?? "")
        .split(",")
        .filter(Boolean)
        .filter((v) => v !== value)

      if (remaining.length) {
        params.set(name, remaining.join(","))
      } else {
        params.delete(name)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const removeParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams)
      params.delete(name)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const selectedBrandIds = (searchParams.get("brand_id") ?? "").split(",").filter(Boolean)
  const selectedTagIds = (searchParams.get("tag_id") ?? "").split(",").filter(Boolean)
  const ratingGte = searchParams.get("rating_gte") ?? ""
  const onSale = searchParams.get("on_sale") === "true"

  const brandById = new Map(brands.map((b) => [b.id, b]))
  const tagById = new Map(tags.map((t) => [t.id, t]))

  const chips: Chip[] = [
    ...selectedBrandIds
      .map((id) => brandById.get(id))
      .filter((brand): brand is StoreBrand => !!brand)
      .map((brand) => ({
        key: `brand-${brand.id}`,
        label: brand.name,
        onRemove: () => removeFromMultiValueParam("brand_id", brand.id),
      })),
    ...selectedTagIds
      .map((id) => tagById.get(id))
      .filter((tag): tag is StoreTag => !!tag)
      .map((tag) => ({
        key: `tag-${tag.id}`,
        label: tag.value,
        onRemove: () => removeFromMultiValueParam("tag_id", tag.id),
      })),
    ...(ratingGte
      ? [
          {
            key: "rating",
            label: ratingGte === "5" ? "5★" : `${ratingGte}★ y más`,
            onRemove: () => removeParam("rating_gte"),
          },
        ]
      : []),
    ...(onSale
      ? [
          {
            key: "on-sale",
            label: "En oferta",
            onRemove: () => removeParam("on_sale"),
          },
        ]
      : []),
  ]

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5" data-testid="active-filter-chips">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rm-line-2 text-xs font-semibold text-rm-ink hover:opacity-80"
          data-testid={`filter-chip-${chip.key}`}
        >
          {chip.label}
          <RodiIconX size={11} />
        </button>
      ))}
    </div>
  )
}
