"use client"

import { getCategoryVisual } from "@lib/util/category-emoji"
import { HttpTypes } from "@medusajs/types"
import { RodiBadge, RodiBtnLink } from "@modules/common/components/rodi"
import { RodiIconChevron } from "@modules/common/icons/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clsx } from "clsx"
import { useMemo, useState } from "react"

type RodiMegaMenuProps = {
  categories: HttpTypes.StoreProductCategory[]
  onClose?: () => void
}

export default function RodiMegaMenu({
  categories,
  onClose,
}: RodiMegaMenuProps) {
  const parents = useMemo(
    () => categories.filter((c) => !c.parent_category),
    [categories]
  )

  const [activeId, setActiveId] = useState<string | null>(
    parents[0]?.id ?? null
  )

  const active =
    parents.find((c) => c.id === activeId) ?? parents[0] ?? null

  const children = active?.category_children ?? []

  if (!parents.length) {
    return null
  }

  return (
    <div
      className="absolute left-6 right-6 -mt-1 bg-rm-paper border border-rm-line rounded-rm-lg shadow-[0_24px_60px_rgba(26,23,20,0.16)] z-40 hidden small:grid grid-cols-[240px_1fr_280px]"
      onMouseLeave={onClose}
    >
      <div className="p-3 border-r border-rm-line-2 max-h-[420px] overflow-y-auto">
        {parents.slice(0, 12).map((cat) => {
          const isActive = cat.id === active?.id
          return (
            <button
              key={cat.id}
              type="button"
              onMouseEnter={() => setActiveId(cat.id)}
              onFocus={() => setActiveId(cat.id)}
              className={clsx(
                "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors",
                isActive
                  ? "bg-rm-line-2 text-rm-red"
                  : "text-rm-ink hover:bg-rm-line-2/60"
              )}
            >
              <span className="inline-flex items-center gap-2.5 min-w-0">
                <span className="text-lg shrink-0" aria-hidden>
                  {getCategoryVisual(cat.handle, cat.name).emoji}
                </span>
                <span className="truncate">{cat.name}</span>
              </span>
              <RodiIconChevron size={12} chevronDirection="right" />
            </button>
          )
        })}
      </div>

      <div className="p-5 md:p-6 min-h-[280px]">
        {active && (
          <>
            <h3 className="font-display text-lg font-bold tracking-tight text-rm-ink mb-3.5">
              {active.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
              {children.length > 0 ? (
                children.map((child) => (
                  <LocalizedClientLink
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    className="text-[13px] text-rm-ink-2 py-1 hover:text-rm-ink font-medium"
                    onClick={onClose}
                  >
                    {child.name}
                  </LocalizedClientLink>
                ))
              ) : (
                <LocalizedClientLink
                  href={`/categories/${active.handle}`}
                  className="text-[13px] text-rm-ink-2 py-1 hover:text-rm-ink font-medium col-span-full"
                  onClick={onClose}
                >
                  Ver productos en {active.name}
                </LocalizedClientLink>
              )}
            </div>
            <LocalizedClientLink
              href={`/categories/${active.handle}`}
              className="inline-flex items-center gap-2 mt-4 text-[13px] font-bold text-rm-red hover:underline"
              onClick={onClose}
            >
              Ver toda la categoría
              <RodiIconChevron size={12} chevronDirection="right" />
            </LocalizedClientLink>
          </>
        )}
      </div>

      <div className="p-4">
        <div className="bg-rm-s-butter rounded-rm-lg p-4 h-full min-h-[240px] flex flex-col justify-between">
          <div>
            <RodiBadge kind="bolt">2x1</RodiBadge>
            <p className="font-display text-[22px] font-extrabold tracking-tight leading-tight mt-2.5 text-rm-ink">
              Ofertas
              <br />
              del día
            </p>
            <p className="text-xs text-rm-ink-2 mt-1.5">
              Descuentos en productos seleccionados de la tienda.
            </p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <RodiBtnLink href="/store" kind="dark" size="sm" onClick={onClose}>
              Ver ofertas
            </RodiBtnLink>
            <span className="text-5xl" aria-hidden>
              🛒
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
