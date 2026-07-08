"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreBrand = { id: string; name: string }

/**
 * Public brand listing (`GET /store/brands`), used e.g. for the home brands
 * strip. Returns an empty array (instead of throwing) when the backend has no
 * brands assigned yet, so callers can degrade to a static fallback.
 */
export const listBrands = async (): Promise<StoreBrand[]> => {
  const next = {
    ...(await getCacheOptions("brands")),
  }

  return sdk.client
    .fetch<{ brands: StoreBrand[] }>("/store/brands", {
      method: "GET",
      query: { limit: 16 },
      next,
      cache: "force-cache",
    })
    .then(({ brands }) => brands ?? [])
    .catch(() => [])
}
