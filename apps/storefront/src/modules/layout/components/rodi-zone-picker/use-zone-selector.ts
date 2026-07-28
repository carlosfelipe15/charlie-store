"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  checkZoneEligibility,
  setActiveZone,
  type ActiveZone,
  type ZoneCartItem,
  type ZoneProvince,
} from "@lib/data/zones"
import { deleteLineItem } from "@lib/data/cart"

export type ZoneConflictState = {
  municipalityId: string
  items: { id: string; title: string; thumbnail: string | null }[]
}

/**
 * Provincia→Municipio selection + the zone↔cart soft-warning, shared by
 * every zone-picker surface (the header dropdown, the PDP's zone modal, and
 * any future entry point). Presentation (dropdown vs. modal, when to close)
 * stays with the caller — `onZoneApplied` is the hook's only hand-back for that.
 */
export function useZoneSelector({
  zones,
  activeZone,
  cartItems,
  onZoneApplied,
}: {
  zones: ZoneProvince[]
  activeZone: ActiveZone | null
  cartItems: ZoneCartItem[]
  /** Called after a zone change lands successfully (no conflict, or conflict confirmed). */
  onZoneApplied?: () => void
}) {
  const [provinceId, setProvinceId] = useState<string>(
    () => zones.find((p) => p.name === activeZone?.provinceName)?.id ?? ""
  )
  const [pending, startTransition] = useTransition()
  const [conflict, setConflict] = useState<ZoneConflictState | null>(null)
  const router = useRouter()

  // Re-seed the province from `activeZone` whenever the *authoritative* zone
  // changes — not just on mount. Every zone-picker surface (header dropdown,
  // PDP modal) mounts its own instance of this hook, and each one only sees
  // the zone confirmed through itself unless it also reacts to zone changes
  // made through a *different* instance (which land here as a fresh
  // `activeZone` prop after that instance's `router.refresh()`). Without
  // this, an instance that isn't the one that just changed the zone keeps
  // showing whatever province it last saw, even though `activeZone` itself
  // (used directly for the header label / PDP copy) is already correct.
  useEffect(() => {
    setProvinceId(zones.find((p) => p.name === activeZone?.provinceName)?.id ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZone?.id])

  const municipalities = useMemo(
    () => zones.find((p) => p.id === provinceId)?.municipalities ?? [],
    [zones, provinceId]
  )

  const municipalityValue =
    activeZone && municipalities.some((m) => m.id === activeZone.id)
      ? activeZone.id
      : ""

  const applyZoneChange = (municipalityId: string) => {
    startTransition(async () => {
      await setActiveZone(municipalityId)
      setConflict(null)
      onZoneApplied?.()
      router.refresh()
    })
  }

  const handleMunicipalityChange = (municipalityId: string) => {
    if (!municipalityId) {
      return
    }

    if (!cartItems.length) {
      applyZoneChange(municipalityId)
      return
    }

    startTransition(async () => {
      const ineligible = await checkZoneEligibility(
        municipalityId,
        cartItems.map((item) => item.product_id)
      )

      if (!ineligible.length) {
        applyZoneChange(municipalityId)
        return
      }

      const affected = cartItems.filter((item) =>
        ineligible.includes(item.product_id)
      )
      setConflict({ municipalityId, items: affected })
    })
  }

  const confirmZoneChange = () => {
    if (!conflict) {
      return
    }
    const { municipalityId, items } = conflict
    startTransition(async () => {
      await Promise.all(items.map((item) => deleteLineItem(item.id)))
      await setActiveZone(municipalityId)
      setConflict(null)
      onZoneApplied?.()
      router.refresh()
    })
  }

  const cancelConflict = () => setConflict(null)

  return {
    provinceId,
    setProvinceId,
    municipalities,
    municipalityValue,
    pending,
    conflict,
    handleMunicipalityChange,
    confirmZoneChange,
    cancelConflict,
  }
}
