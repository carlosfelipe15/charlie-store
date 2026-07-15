import "server-only"

import { buildCartLineMap, CartLineMap } from "@lib/util/cart-line"
import { cache } from "react"
import { retrieveCart } from "./cart"

/**
 * Cart lines keyed by variant id, for the quantity controls on product cards.
 *
 * Deliberately NOT a server action: this used to be a `"use server"` export
 * that every card called from a `useEffect` on mount, meaning one full
 * `GET /store/carts/:id` per card. Next runs server actions strictly one at a
 * time, so a 10-product grid spent ~2.2s serially re-fetching the same cart
 * after the HTML had already painted. Cards now receive their line as a prop.
 *
 * `cache()` memoizes this for a single render, so a grid of N cards costs one
 * cart fetch, not N.
 */
export const getCartLineMap = cache(async (): Promise<CartLineMap> => {
  const cart = await retrieveCart(undefined, "id,*items").catch(() => null)

  return buildCartLineMap(cart)
})
