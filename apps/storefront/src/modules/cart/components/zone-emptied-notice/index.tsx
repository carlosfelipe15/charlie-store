"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@modules/common/components/ui"

/**
 * Shown after `setAddresses` empties the cart because every item became
 * unavailable in the delivery zone the customer just confirmed at checkout
 * (see the `cartEmptied` branch in `lib/data/cart.ts`). The redirect that
 * lands here can't carry a message any other way — it's a server-side
 * `redirect()`, not a value the checkout form's `useActionState` gets to see.
 */
const ZoneEmptiedNotice = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useToast()
  const shown = useRef(false)

  useEffect(() => {
    if (searchParams.get("zone_emptied") !== "true" || shown.current) {
      return
    }
    shown.current = true
    showToast(
      "Ninguno de los productos de tu carrito estaba disponible en la zona de entrega elegida, así que se quitaron. Por eso salimos del checkout.",
      "error"
    )
    router.replace(pathname)
  }, [searchParams, router, pathname, showToast])

  return null
}

export default ZoneEmptiedNotice
