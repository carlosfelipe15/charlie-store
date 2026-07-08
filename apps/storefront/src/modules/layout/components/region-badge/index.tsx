"use client"

import { getRegionBadge } from "@lib/util/country"
import { HttpTypes } from "@medusajs/types"
import { useParams } from "next/navigation"
import { useMemo } from "react"

type RegionBadgeProps = {
  regions: HttpTypes.StoreRegion[] | null
  className?: string
}

/**
 * Flag + "Country · CURRENCY" badge that follows the active region. Shared by
 * the top bar and the footer so both stay consistent with the URL's country.
 */
export default function RegionBadge({ regions, className }: RegionBadgeProps) {
  const { countryCode } = useParams<{ countryCode: string }>()

  const { flag, label } = useMemo(
    () => getRegionBadge(regions, countryCode),
    [regions, countryCode]
  )

  return (
    <span className={className}>
      {flag} {label}
    </span>
  )
}
