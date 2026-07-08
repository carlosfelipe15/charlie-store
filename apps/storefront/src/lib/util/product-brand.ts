import { HttpTypes } from "@medusajs/types"

export type ProductBrand = { id: string; name: string }

/**
 * `brand` comes from a custom Medusa module and is expanded on the Store API via
 * `fields=+brand.*`. It is not part of the core `StoreProduct` type, so we read
 * it defensively. Returns null when no brand is linked (e.g. current demo
 * catalog, or before products are assigned a brand).
 */
export function getProductBrandName(
  product: HttpTypes.StoreProduct
): string | null {
  const brand = (product as unknown as { brand?: ProductBrand | null }).brand
  const name = brand?.name?.trim()
  return name ? name : null
}
