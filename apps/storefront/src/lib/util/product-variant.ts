import { HttpTypes } from "@medusajs/types"

export function isVariantInStock(
  variant: HttpTypes.StoreProductVariant | undefined
): boolean {
  if (!variant) return false
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  if (variant.manage_inventory && (variant.inventory_quantity ?? 0) > 0) {
    return true
  }
  return false
}

/** True when the shopper can add from the card without visiting the PDP. */
export function canQuickAddFromCard(product: HttpTypes.StoreProduct): boolean {
  const variants = product.variants ?? []
  if (variants.length === 0) return false
  if (variants.length === 1) {
    return isVariantInStock(variants[0])
  }
  return false
}

export function getQuickAddVariantId(
  product: HttpTypes.StoreProduct
): string | null {
  const variants = product.variants ?? []
  if (variants.length !== 1) return null
  const variant = variants[0]
  return isVariantInStock(variant) ? variant.id ?? null : null
}
