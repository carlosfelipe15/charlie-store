"use server"

import { retrieveCart } from "./cart"

export async function getCartLineForVariant(variantId: string) {
  const cart = await retrieveCart().catch(() => null)
  const item = cart?.items?.find((i) => i.variant_id === variantId)
  if (!item?.id) return null
  return {
    lineId: item.id,
    quantity: item.quantity ?? 0,
  }
}
