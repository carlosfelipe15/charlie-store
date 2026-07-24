"use server"

import { cookies as nextCookies } from "next/headers"
import { revalidateTag } from "next/cache"

import { sdk } from "@lib/config"
import { getCacheOptions, getCacheTag } from "./cookies"

export type ZoneMunicipality = { id: string; name: string; code: string }
export type ZoneProvince = {
  id: string
  name: string
  code: string
  municipalities: ZoneMunicipality[]
}
export type ActiveZone = { id: string; name: string; provinceName: string }
/** Minimal cart line-item shape needed for the zone-conflict warning. */
export type ZoneCartItem = {
  id: string
  product_id: string
  title: string
  thumbnail: string | null
}

// Persisted delivery zone ("Entregar en"). Lives in a cookie, not the route —
// the country is in the `[countryCode]` path, the zone is orthogonal to it.
const ZONE_COOKIE = "_charlie_zone"

export const listZones = async (): Promise<ZoneProvince[]> => {
  const next = {
    ...(await getCacheOptions("zones")),
  }

  return sdk.client
    .fetch<{ provinces: ZoneProvince[] }>(`/store/zones`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ provinces }) => provinces ?? [])
    .catch(() => [])
}

export const getActiveZoneId = async (): Promise<string | undefined> => {
  try {
    const cookies = await nextCookies()
    return cookies.get(ZONE_COOKIE)?.value || undefined
  } catch {
    return undefined
  }
}

/** Resolves the active municipality (with its province name) for display. */
export const getActiveZone = async (): Promise<ActiveZone | null> => {
  const id = await getActiveZoneId()
  if (!id) {
    return null
  }

  const provinces = await listZones()
  for (const province of provinces) {
    const municipality = province.municipalities.find((m) => m.id === id)
    if (municipality) {
      return {
        id: municipality.id,
        name: municipality.name,
        provinceName: province.name,
      }
    }
  }

  // Stale cookie (zone no longer exists / inactive) — treat as no zone.
  return null
}

/**
 * Server action: set the active delivery zone and bust product listings so they
 * refetch scoped to it. Called from the "Entregar en" picker (client), followed
 * by `router.refresh()`.
 */
export const setActiveZone = async (municipalityId: string): Promise<void> => {
  const cookies = await nextCookies()
  cookies.set(ZONE_COOKIE, municipalityId, {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  const productsTag = await getCacheTag("products")
  if (productsTag) {
    revalidateTag(productsTag)
  }
}

/**
 * Which of the given product ids are NOT available in `zoneId` — powers the
 * soft warning shown when switching zones or the checkout shipping address
 * with items already in the cart. Fail-open: a network error never blocks
 * the zone change, it just skips the warning.
 */
export const checkZoneEligibility = async (
  zoneId: string,
  productIds: string[]
): Promise<string[]> => {
  if (!productIds.length) {
    return []
  }

  return sdk.client
    .fetch<{ ineligible_product_ids: string[] }>(`/store/zones/eligibility-check`, {
      method: "POST",
      body: { zone_id: zoneId, product_ids: productIds },
    })
    .then((r) => r.ineligible_product_ids ?? [])
    .catch(() => [])
}
