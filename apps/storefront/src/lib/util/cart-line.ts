import { HttpTypes } from "@medusajs/types"

export type CartLine = {
  lineId: string
  quantity: number
}

/** Quantity controls on a product card are keyed by variant, not by line. */
export type CartLineMap = Record<string, CartLine>

export function buildCartLineMap(
  cart: HttpTypes.StoreCart | null
): CartLineMap {
  const map: CartLineMap = {}

  for (const item of cart?.items ?? []) {
    if (item.variant_id && item.id) {
      map[item.variant_id] = {
        lineId: item.id,
        quantity: item.quantity ?? 0,
      }
    }
  }

  return map
}

export function getCartLineForVariant(
  cart: HttpTypes.StoreCart | null,
  variantId: string
): CartLine | null {
  const item = cart?.items?.find((i) => i.variant_id === variantId)

  if (!item?.id) {
    return null
  }

  return { lineId: item.id, quantity: item.quantity ?? 0 }
}
