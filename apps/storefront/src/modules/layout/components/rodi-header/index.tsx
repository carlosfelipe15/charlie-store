import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { retrieveCart } from "@lib/data/cart"
import { StoreRegion } from "@medusajs/types"
import { Suspense } from "react"

import RodiTopBar from "@modules/layout/components/rodi-top-bar"
import CartDropdown from "@modules/layout/components/cart-dropdown"
import RodiAccountButton from "@modules/layout/components/rodi-account-button"

import RodiHeaderClient from "./rodi-header-client"

export default async function RodiHeader() {
  const [regions, locales, currentLocale, categories, cart] =
    await Promise.all([
      listRegions().then((r: StoreRegion[]) => r),
      listLocales(),
      getLocale(),
      listCategories(),
      retrieveCart().catch(() => null),
    ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <RodiTopBar regions={regions} />
      <RodiHeaderClient
        categories={categories ?? []}
        regions={regions}
        locales={locales}
        currentLocale={currentLocale}
        accountSlot={
          <Suspense fallback={null}>
            <RodiAccountButton />
          </Suspense>
        }
        cartSlot={<CartDropdown cart={cart} variant="rodi" />}
      />
    </div>
  )
}
