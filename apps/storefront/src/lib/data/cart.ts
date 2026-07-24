"use server"

import { sdk } from "@lib/config"
import { getCartLineForVariant } from "@lib/util/cart-line"
import medusaError, { getMedusaErrorMessage } from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { getLocale } from "./locale-actions"
import { checkZoneEligibility, getActiveZoneId, listZones, setActiveZone } from "./zones"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *items.product, *items.variant, +items.variant.inventory_quantity, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, "id,region_id")

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const { cart: updatedCart } = await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async (response) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return response
    })
    .catch(medusaError)

  // Returned so a caller that renders per-variant quantity controls (the
  // product card) can show them immediately, instead of issuing another
  // round-trip just to learn the new line's id.
  return getCartLineForVariant(updatedCart, variantId)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

export type ApplyPromotionsResult = { success: boolean; error: string | null }

export async function applyPromotions(
  codes: string[]
): Promise<ApplyPromotionsResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { success: false, error: "No se encontró un carrito activo." }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Return a serializable error instead of throwing: thrown server-action errors
  // are masked by Next.js in production, which left invalid promo codes silent.
  try {
    await sdk.store.cart.update(cartId, { promo_codes: codes }, {}, headers)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: getMedusaErrorMessage(error) }
  }
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  const result = await applyPromotions([code])
  if (!result.success) {
    return result.error
  }
}

type IneligibleLineItem = { id: string; title: string; thumbnail: string | null }

export type SetAddressesState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "zone-conflict"
      municipalityId: string
      items: IneligibleLineItem[]
    }

async function findIneligibleLineItems(
  cartId: string,
  municipalityId: string
): Promise<IneligibleLineItem[]> {
  const cart = await retrieveCart(cartId)
  const productIds = (cart?.items ?? [])
    .map((item) => item.product_id)
    .filter((id): id is string => !!id)

  if (!productIds.length) {
    return []
  }

  const ineligible = await checkZoneEligibility(municipalityId, productIds)
  if (!ineligible.length) {
    return []
  }

  return (cart?.items ?? [])
    .filter((item) => item.product_id && ineligible.includes(item.product_id))
    .map((item) => ({
      id: item.id,
      title: item.product_title ?? item.title,
      thumbnail: item.thumbnail ?? null,
    }))
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(
  currentState: SetAddressesState,
  formData: FormData
): Promise<SetAddressesState> {
  let cartEmptied = false

  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const provinceName = formData.get("shipping_address.province") as string
    const municipalityName = formData.get("shipping_address.city") as string
    const confirmed = formData.get("confirm_zone_change") === "true"

    // Resolve the chosen municipality (name → id) against the same zone data
    // the picker and the shipping-address selects use. Legacy/unresolvable
    // names fall through permissively — no check, no cookie sync.
    const zones = await listZones()
    const municipalityId = zones
      .find((province) => province.name === provinceName)
      ?.municipalities.find((m) => m.name === municipalityName)?.id

    const activeZoneId = await getActiveZoneId()
    const zoneChanged = !!municipalityId && municipalityId !== activeZoneId

    if (zoneChanged && !confirmed) {
      const items = await findIneligibleLineItems(cartId, municipalityId!)
      if (items.length) {
        return { status: "zone-conflict", municipalityId: municipalityId!, items }
      }
    }

    if (zoneChanged && confirmed) {
      // Recompute server-side rather than trusting whatever the client sent
      // back on the confirm resubmit.
      const items = await findIneligibleLineItems(cartId, municipalityId!)
      if (items.length) {
        await Promise.all(items.map((item) => deleteLineItem(item.id)))
        // If every item in the cart was restricted to the old zone, the cart
        // is now empty — saving an address and continuing to the delivery
        // step would land the customer on a checkout with nothing to check
        // out. Bail out of the flow entirely instead (see the redirect below).
        const updatedCart = await retrieveCart(cartId)
        cartEmptied = !updatedCart?.items?.length
      }
    }

    if (cartEmptied) {
      // Still worth syncing: the customer explicitly confirmed this zone,
      // so the catalog they land back on should already reflect it.
      if (municipalityId) {
        await setActiveZone(municipalityId)
      }
    } else {
      const data = {
        shipping_address: {
          first_name: formData.get("shipping_address.first_name"),
          last_name: formData.get("shipping_address.last_name"),
          address_1: formData.get("shipping_address.address_1"),
          // "Nota para la entrega" reuses the address_2 field — no separate
          // "company"/apartment fields for a single-country grocery storefront.
          address_2: formData.get("shipping_address.address_2") || "",
          company: "",
          postal_code: formData.get("shipping_address.postal_code"),
          city: formData.get("shipping_address.city"),
          // Single-country region (Cuba) — no country picker in the form.
          country_code: "cu",
          province: formData.get("shipping_address.province"),
          phone: formData.get("shipping_address.phone"),
        },
        email: formData.get("email"),
      } as any

      // Billing is independent of shipping — it's normal for them to differ,
      // so it's always its own form, never mirrored from shipping.
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
      await updateCart(data)

      // Keep the "Entregar en" cookie in sync with wherever the order is
      // actually shipping to, so the catalog stays consistent afterward.
      if (municipalityId) {
        await setActiveZone(municipalityId)
      }
    }
  } catch (e: any) {
    return { status: "error", message: e.message }
  }

  if (cartEmptied) {
    // Nothing left to check out — send the customer back to their (empty)
    // cart instead of the delivery step, with a flag the cart page turns
    // into a toast (see `modules/cart/components/zone-emptied-notice`).
    redirect(`/cu/cart?zone_emptied=true`)
  }

  redirect(`/cu/checkout?step=delivery`)
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
