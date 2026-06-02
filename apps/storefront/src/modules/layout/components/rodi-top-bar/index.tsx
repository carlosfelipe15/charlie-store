"use client"

import { RodiIconTruck } from "@modules/common/icons/rodi"
import { HttpTypes } from "@medusajs/types"
import { useParams } from "next/navigation"
import { useMemo } from "react"

type RodiTopBarProps = {
  regions: HttpTypes.StoreRegion[] | null
}

export default function RodiTopBar({ regions }: RodiTopBarProps) {
  const { countryCode } = useParams<{ countryCode: string }>()

  const countryLabel = useMemo(() => {
    if (!regions || !countryCode) return "Colombia · COP"
    for (const region of regions) {
      const country = region.countries?.find(
        (c) => c.iso_2?.toLowerCase() === countryCode.toLowerCase()
      )
      if (country) {
        return `${country.display_name ?? country.iso_2?.toUpperCase()} · ${region.currency_code?.toUpperCase()}`
      }
    }
    return `${countryCode.toUpperCase()}`
  }, [regions, countryCode])

  return (
    <div className="bg-rm-ink text-white text-xs px-6 py-1.5 flex flex-col gap-2 small:flex-row small:items-center small:justify-between">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 opacity-90">
        <span className="inline-flex items-center gap-1.5 text-rm-yellow">
          <RodiIconTruck size={14} />
          <strong className="text-white font-bold">Envío gratis</strong>
          <span className="text-white/70 font-normal hidden xsmall:inline">
            en pedidos seleccionados
          </span>
        </span>
        <span className="hidden md:inline text-white/70">·</span>
        <span className="hidden md:inline text-white/85">
          Entrega rápida en tu ciudad
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 text-white/85">
        <span className="hidden lg:inline cursor-default">Ayuda</span>
        <span className="font-bold text-rm-yellow">🇨🇴 {countryLabel}</span>
      </div>
    </div>
  )
}
