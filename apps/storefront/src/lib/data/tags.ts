"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreTag = { id: string; value: string }

/**
 * Public product tag listing (`GET /store/product-tags`), used for the PLP
 * "Atributos" filter. Returns an empty array (instead of throwing) when the
 * backend has no tags assigned yet, so callers can degrade gracefully.
 */
export const listTags = async (): Promise<StoreTag[]> => {
  const next = {
    ...(await getCacheOptions("tags")),
  }

  return sdk.client
    .fetch<{ product_tags: StoreTag[] }>("/store/product-tags", {
      method: "GET",
      query: { limit: 50 },
      next,
      cache: "force-cache",
    })
    .then(({ product_tags }) => product_tags ?? [])
    .catch(() => [])
}
