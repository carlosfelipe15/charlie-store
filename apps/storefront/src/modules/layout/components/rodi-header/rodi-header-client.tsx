"use client"

import { HttpTypes } from "@medusajs/types"
import { RodiLogo } from "@modules/common/components/rodi"
import {
  RodiIconBolt,
  RodiIconChevron,
  RodiIconHeart,
  RodiIconMenu,
  RodiIconPin,
  RodiIconUser,
} from "@modules/common/icons/rodi"
import { Locale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RodiHeaderSearch from "@modules/layout/components/rodi-header-search"
import RodiMegaMenu from "@modules/layout/components/rodi-mega-menu"
import SideMenu from "@modules/layout/components/side-menu"
import CountrySelect from "@modules/layout/components/country-select"
import useToggleState from "@lib/hooks/use-toggle-state"
import { clsx } from "clsx"
import { ReactNode, useCallback, useState } from "react"

const QUICK_LINKS = [
  { label: "Ofertas del día", href: "/store", highlight: true, bolt: true },
  { label: "Todos los productos", href: "/store" },
]

type RodiHeaderClientProps = {
  categories: HttpTypes.StoreProductCategory[]
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  cartSlot: ReactNode
  accountSlot: ReactNode
  favoritesSlot: ReactNode
}

export default function RodiHeaderClient({
  categories,
  regions,
  locales,
  currentLocale,
  cartSlot,
  accountSlot,
  favoritesSlot,
}: RodiHeaderClientProps) {
  const [megaOpen, setMegaOpen] = useState(false)
  const regionToggleState = useToggleState()

  const parents = categories.filter((c) => !c.parent_category)
  const navCategories = parents.slice(0, 6)

  const closeMega = useCallback(() => setMegaOpen(false), [])

  return (
    <header className="bg-rm-paper border-b border-rm-line">
      <div className="relative">
        {/* Main bar */}
        <div className="content-container flex items-center gap-3 small:gap-6 py-3 small:py-4">
          <div className="small:hidden shrink-0">
            <SideMenu
              regions={regions}
              locales={locales}
              currentLocale={currentLocale}
            />
          </div>

          <LocalizedClientLink href="/" className="shrink-0" data-testid="nav-store-link">
            <RodiLogo size={20} className="small:hidden" />
            <RodiLogo size={22} className="hidden small:flex" />
          </LocalizedClientLink>

          {regions && (
            <div
              className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l border-rm-line text-rm-ink-2 shrink-0"
              onMouseEnter={regionToggleState.open}
              onMouseLeave={regionToggleState.close}
            >
              <span className="text-rm-red">
                <RodiIconPin size={16} />
              </span>
              <CountrySelect toggleState={regionToggleState} regions={regions} />
              <RodiIconChevron
                size={14}
                chevronDirection={regionToggleState.state ? "up" : "down"}
              />
            </div>
          )}

          <div className="hidden small:flex flex-1 min-w-0">
            <RodiHeaderSearch />
          </div>

          <div className="flex items-center gap-0.5 small:gap-1 ml-auto shrink-0">
            {accountSlot}
            <LocalizedClientLink
              href="/account"
              className="small:hidden p-2 text-rm-ink"
              data-testid="nav-account-link-mobile"
            >
              <RodiIconUser size={22} />
              <span className="sr-only">Cuenta</span>
            </LocalizedClientLink>
            {favoritesSlot}
            <LocalizedClientLink
              href="/account/favorites"
              className="small:hidden p-2 text-rm-ink"
              data-testid="nav-favorites-link-mobile"
            >
              <RodiIconHeart size={22} />
              <span className="sr-only">Favoritos</span>
            </LocalizedClientLink>
            {cartSlot}
          </div>
        </div>

        {/* Mobile search */}
        <div className="small:hidden content-container pb-3 -mt-1">
          <RodiHeaderSearch />
        </div>

        {/* Nav strip */}
        <div className="content-container flex items-center gap-4 pb-3 overflow-x-auto no-scrollbar">
          <div
            className="relative shrink-0"
            onMouseEnter={() => setMegaOpen(true)}
          >
            <button
              type="button"
              onClick={() => setMegaOpen((o) => !o)}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-rm-md text-sm font-bold text-white bg-rm-red",
                "hover:bg-rm-red-deep transition-colors"
              )}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              <RodiIconMenu size={18} />
              <span className="hidden xsmall:inline">Todas las categorías</span>
              <span className="xsmall:hidden">Categorías</span>
              <RodiIconChevron size={14} />
            </button>
          </div>

          {QUICK_LINKS.map((link) => (
            <LocalizedClientLink
              key={link.href + link.label}
              href={link.href}
              className={clsx(
                "inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap shrink-0",
                link.highlight ? "text-rm-red" : "text-rm-ink-2 hover:text-rm-ink"
              )}
            >
              {link.bolt && <RodiIconBolt size={14} />}
              {link.label}
            </LocalizedClientLink>
          ))}

          {navCategories.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="text-sm font-semibold text-rm-ink-2 hover:text-rm-ink whitespace-nowrap shrink-0"
            >
              {cat.name}
            </LocalizedClientLink>
          ))}
        </div>

        {megaOpen && (
          <div
            className="hidden small:block"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={closeMega}
          >
            <RodiMegaMenu categories={categories} onClose={closeMega} />
          </div>
        )}
      </div>
    </header>
  )
}
