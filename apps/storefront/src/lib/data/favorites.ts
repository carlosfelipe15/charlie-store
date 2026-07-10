"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"
import { revalidateTag } from "next/cache"

export type StoreFavorite = {
  id: string
  product_id: string
  customer_id: string
  created_at: string
}

export const listCustomerFavorites = async (): Promise<StoreFavorite[]> => {
  const headers = { ...(await getAuthHeaders()) }

  if (!("authorization" in headers)) {
    return []
  }

  const next = { ...(await getCacheOptions("favorites")) }

  return sdk.client
    .fetch<{ favorites: StoreFavorite[] }>("/store/favorites", {
      method: "GET",
      headers,
      query: { limit: 100 },
      next,
      cache: "force-cache",
    })
    .then(({ favorites }) => favorites ?? [])
    .catch(() => [])
}

/** Set of favorited product ids for the current customer — fetch once per
 * page and pass down to product grids/cards instead of one call per card. */
export const getFavoritedProductIds = async (): Promise<Set<string>> => {
  const favorites = await listCustomerFavorites()
  return new Set(favorites.map((f) => f.product_id))
}

export type FavoriteActionResult = { success: boolean; error: string | null }

export const addFavorite = async (
  productId: string
): Promise<FavoriteActionResult> => {
  const headers = { ...(await getAuthHeaders()) }

  if (!("authorization" in headers)) {
    return {
      success: false,
      error: "Inicia sesión para guardar tus favoritos.",
    }
  }

  try {
    await sdk.client.fetch("/store/favorites", {
      method: "POST",
      headers,
      body: { product_id: productId },
    })
    revalidateTag(await getCacheTag("favorites"))
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo agregar a favoritos.",
    }
  }
}

export const removeFavorite = async (
  productId: string
): Promise<FavoriteActionResult> => {
  const headers = { ...(await getAuthHeaders()) }

  if (!("authorization" in headers)) {
    return {
      success: false,
      error: "Inicia sesión para gestionar tus favoritos.",
    }
  }

  try {
    await sdk.client.fetch(`/store/favorites/${productId}`, {
      method: "DELETE",
      headers,
    })
    revalidateTag(await getCacheTag("favorites"))
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo quitar de favoritos.",
    }
  }
}
