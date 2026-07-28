"use client"

import { useState } from "react"

import { RodiBtn } from "@modules/common/components/rodi"
import { RodiIconTruck } from "@modules/common/icons/rodi"
import ZonePickerModal from "@modules/common/components/zone-picker-modal"
import type { ActiveZone, ZoneCartItem, ZoneProvince } from "@lib/data/zones"

type RodiPdpDeliveryProps = {
  zones: ZoneProvince[]
  activeZone: ActiveZone | null
  cartItems: ZoneCartItem[]
  /** Is *this* product available in the active zone? Ignored while there's
   * no active zone yet (nothing to compare against). */
  isAvailable: boolean
}

export default function RodiPdpDelivery({
  zones,
  activeZone,
  cartItems,
  isAvailable,
}: RodiPdpDeliveryProps) {
  const [open, setOpen] = useState(false)

  const blocked = !!activeZone && !isAvailable

  return (
    <div className="rounded-rm-lg border border-rm-line bg-rm-paper p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div
          className={
            "w-10 h-10 rounded-rm-md grid place-items-center shrink-0 " +
            (blocked ? "bg-rm-s-peach text-rm-red" : "bg-rm-s-mint text-rm-green")
          }
        >
          <RodiIconTruck size={20} />
        </div>
        <div className="flex-1 min-w-0">
          {blocked ? (
            <p className="text-[13px] font-bold text-rm-red">
              No disponible en tu zona
            </p>
          ) : (
            <p className="text-[13px] font-bold text-rm-ink">
              Envío <span className="text-rm-green">disponible</span>
              {activeZone ? ` en ${activeZone.name}` : ""}
            </p>
          )}
          <p className="text-xs text-rm-ink-3">
            {blocked
              ? "Elige otra zona para comprar este producto"
              : activeZone
                ? "Calculado en el checkout"
                : "Elige tu zona para ver disponibilidad"}
          </p>
        </div>
        <RodiBtn
          kind="ghost"
          size="sm"
          type="button"
          className="shrink-0"
          onClick={() => setOpen(true)}
          data-testid="pdp-delivery-change-zone"
        >
          Cambiar
        </RodiBtn>
      </div>

      <ZonePickerModal
        open={open}
        onClose={() => setOpen(false)}
        zones={zones}
        activeZone={activeZone}
        cartItems={cartItems}
      />
    </div>
  )
}
