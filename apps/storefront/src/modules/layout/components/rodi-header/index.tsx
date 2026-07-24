import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listZones, getActiveZone } from "@lib/data/zones"
import { retrieveCart } from "@lib/data/cart"
import { StoreRegion } from "@medusajs/types"
import { Suspense } from "react"

import RodiTopBar from "@modules/layout/components/rodi-top-bar"
import CartDropdown from "@modules/layout/components/cart-dropdown"
import RodiAccountButton from "@modules/layout/components/rodi-account-button"
import RodiFavoritesButton from "@modules/layout/components/rodi-favorites-button"

import RodiHeaderClient from "./rodi-header-client"

export default async function RodiHeader() {
  const [regions, locales, currentLocale, categories, cart, zones, activeZone] =
    await Promise.all([
      listRegions().then((r: StoreRegion[]) => r),
      listLocales(),
      getLocale(),
      listCategories(),
      retrieveCart().catch(() => null),
      listZones(),
      getActiveZone(),
    ])

  // Threaded down to the "Entregar en" picker so it can warn before
  // switching zones with items in the cart that wouldn't be available there.
  const cartItems =
    cart?.items
      ?.filter((item) => !!item.product_id)
      .map((item) => ({
        id: item.id,
        product_id: item.product_id as string,
        title: item.product_title ?? item.title,
        thumbnail: item.thumbnail ?? null,
      })) ?? []

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <RodiTopBar regions={regions} />
      <RodiHeaderClient
        categories={categories ?? []}
        regions={regions}
        zones={zones}
        activeZone={activeZone}
        cartItems={cartItems}
        locales={locales}
        currentLocale={currentLocale}
        accountSlot={
          <Suspense key="account-slot" fallback={null}>
            <RodiAccountButton />
          </Suspense>
        }
        favoritesSlot={
          <Suspense key="favorites-slot" fallback={null}>
            <RodiFavoritesButton />
          </Suspense>
        }
        cartSlot={<CartDropdown key="cart-slot" cart={cart} variant="rodi" />}
      />
    </div>
  )
}
