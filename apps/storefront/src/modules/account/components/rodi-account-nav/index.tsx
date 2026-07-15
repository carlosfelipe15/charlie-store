"use client"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  RodiIconDashboard,
  RodiIconHeart,
  RodiIconLogOut,
  RodiIconPackage,
  RodiIconPin,
  RodiIconUser,
} from "@modules/common/icons/rodi"
import { useParams, usePathname } from "next/navigation"
import { clsx } from "clsx"

const NAV_ITEMS = [
  { href: "/account", label: "Resumen", Icon: RodiIconDashboard },
  { href: "/account/orders", label: "Mis pedidos", Icon: RodiIconPackage },
  { href: "/account/addresses", label: "Direcciones", Icon: RodiIconPin },
  { href: "/account/favorites", label: "Favoritos", Icon: RodiIconHeart },
  { href: "/account/profile", label: "Perfil", Icon: RodiIconUser },
] as const

export default function RodiAccountNav({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const isActive = (href: string) => {
    const path = route.split(countryCode)[1] ?? route
    return path === href || (href !== "/account" && path.startsWith(href))
  }

  return (
    <nav
      className="bg-rm-paper border border-rm-line rounded-rm-lg p-3 h-fit"
      data-testid="account-nav"
    >
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <LocalizedClientLink
              href={item.href}
              data-testid={`${item.href.replace(/\//g, "-")}-link`}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors",
                isActive(item.href)
                  ? "bg-rm-s-pink text-rm-red font-bold"
                  : "text-rm-ink-2 hover:bg-rm-line-2 hover:text-rm-ink"
              )}
            >
              <item.Icon size={18} aria-hidden />
              <span className="flex-1">{item.label}</span>
            </LocalizedClientLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => void handleLogout()}
            data-testid="logout-button"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-rm-ink-2 hover:bg-rm-line-2 hover:text-rm-ink"
          >
            <RodiIconLogOut size={18} aria-hidden />
            <span>Salir</span>
          </button>
        </li>
      </ul>
      {customer?.email && (
        <p className="text-[11px] text-rm-ink-3 px-3 pt-3 mt-2 border-t border-rm-line-2 truncate">
          {customer.email}
        </p>
      )}
    </nav>
  )
}
