"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"

type RodiCategoryChipsProps = {
  category: HttpTypes.StoreProductCategory
  /** Subcategory handles to show as chips; first is "Todo" for current category */
  subcategories?: { name: string; handle: string }[]
}

export default function RodiCategoryChips({
  category,
  subcategories = [],
}: RodiCategoryChipsProps) {
  const pathname = usePathname()
  const categoryPath = `/categories/${category.handle}`

  const chips = [
    { name: "Todo", handle: category.handle, href: categoryPath },
    ...subcategories.map((s) => ({
      name: s.name,
      handle: s.handle,
      href: `/categories/${s.handle}`,
    })),
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map((chip, i) => {
        const active =
          pathname.endsWith(chip.href) ||
          (i === 0 && pathname.endsWith(categoryPath))
        return (
          <LocalizedClientLink
            key={chip.handle}
            href={chip.href}
            className={clsx(
              "px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors",
              active
                ? "bg-rm-ink text-white"
                : "bg-rm-paper text-rm-ink border border-rm-line hover:border-rm-ink"
            )}
          >
            {chip.name}
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
