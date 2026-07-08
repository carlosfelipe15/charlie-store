import { HttpTypes } from "@medusajs/types"

/**
 * Converts an ISO 3166-1 alpha-2 country code (e.g. "co", "dk") into its
 * flag emoji using Unicode regional indicator symbols. Works for any valid
 * country code, so the badge follows whatever region is active instead of a
 * hardcoded flag.
 */
export function countryToFlag(iso2?: string | null): string {
  if (!iso2 || iso2.length !== 2) return "🏳️"
  const code = iso2.toUpperCase()
  const REGIONAL_INDICATOR_A = 0x1f1e6
  const A = "A".charCodeAt(0)
  const first = code.charCodeAt(0) - A
  const second = code.charCodeAt(1) - A
  if (first < 0 || first > 25 || second < 0 || second > 25) return "🏳️"
  return String.fromCodePoint(
    REGIONAL_INDICATOR_A + first,
    REGIONAL_INDICATOR_A + second
  )
}

export type RegionBadgeInfo = {
  flag: string
  /** e.g. "Colombia · COP" */
  label: string
}

/**
 * Derives the flag + "Country · CURRENCY" label for the active country from the
 * available regions. Used by the top bar and footer so both stay in sync with
 * the region the shopper is actually browsing.
 */
export function getRegionBadge(
  regions: HttpTypes.StoreRegion[] | null | undefined,
  countryCode: string | null | undefined
): RegionBadgeInfo {
  if (!regions || !countryCode) {
    return { flag: countryToFlag(countryCode), label: "—" }
  }

  for (const region of regions) {
    const country = region.countries?.find(
      (c) => c.iso_2?.toLowerCase() === countryCode.toLowerCase()
    )
    if (country) {
      const name =
        country.display_name ??
        country.iso_2?.toUpperCase() ??
        countryCode.toUpperCase()
      const currency = region.currency_code?.toUpperCase()
      return {
        flag: countryToFlag(country.iso_2 ?? countryCode),
        label: currency ? `${name} · ${currency}` : name,
      }
    }
  }

  return { flag: countryToFlag(countryCode), label: countryCode.toUpperCase() }
}
