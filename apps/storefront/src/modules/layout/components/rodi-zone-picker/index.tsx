"use client"

import { useState } from "react"
import { clsx } from "clsx"

import { RodiIconChevron, RodiIconPin } from "@modules/common/icons/rodi"
import type { ActiveZone, ZoneCartItem, ZoneProvince } from "@lib/data/zones"
import ZoneConflictDialog from "@modules/common/components/zone-conflict-dialog"
import ZoneSelect from "@modules/common/components/zone-select"
import { useZoneSelector } from "./use-zone-selector"

type RodiZonePickerProps = {
  zones: ZoneProvince[]
  activeZone: ActiveZone | null
  /** Cart line items — used to warn before switching to a zone where some
   * of them aren't available. Empty cart = no check, no friction. */
  cartItems: ZoneCartItem[]
  /** "header" (compact, light bg) or "menu" (mobile side-menu, dark bg). */
  variant?: "header" | "menu"
}

const RodiZonePicker = ({
  zones,
  activeZone,
  cartItems,
  variant = "header",
}: RodiZonePickerProps) => {
  const [open, setOpen] = useState(false)

  const {
    provinceId,
    setProvinceId,
    municipalities,
    municipalityValue,
    pending,
    conflict,
    handleMunicipalityChange,
    confirmZoneChange,
    cancelConflict,
  } = useZoneSelector({
    zones,
    activeZone,
    cartItems,
    onZoneApplied: () => setOpen(false),
  })

  const label = activeZone
    ? `${activeZone.name}, ${activeZone.provinceName}`
    : "Elige tu zona"

  const isMenu = variant === "menu"

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={clsx(
          "flex items-center gap-2 text-left",
          isMenu ? "text-ui-fg-on-color" : "text-rm-ink-2"
        )}
        data-testid="zone-picker-button"
      >
        <span className={isMenu ? "text-white" : "text-rm-red"}>
          <RodiIconPin size={16} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[11px] uppercase tracking-wide opacity-70">
            Entregar en
          </span>
          <span className="text-sm font-semibold">{label}</span>
        </span>
        <RodiIconChevron size={14} chevronDirection={open ? "up" : "down"} />
      </button>

      {open && (
        <>
          {/* click-away */}
          <div
            className="fixed inset-0 z-[899]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className={clsx(
              "absolute left-0 top-[calc(100%+8px)] z-[900] w-[300px] max-w-[90vw]",
              "rounded-rm-md border border-rm-line bg-white p-4 shadow-lg"
            )}
            data-testid="zone-picker-panel"
          >
            <p className="mb-3 text-sm font-bold text-rm-ink">
              ¿Dónde quieres recibir tu pedido?
            </p>

            <label className="mb-1 block text-xs font-semibold text-rm-ink-2">
              Provincia
            </label>
            <div className="mb-3">
              <ZoneSelect
                value={provinceId}
                onChange={setProvinceId}
                options={zones}
                placeholder="Selecciona una provincia"
                testId="zone-picker-province"
              />
            </div>

            <label className="mb-1 block text-xs font-semibold text-rm-ink-2">
              Municipio
            </label>
            <ZoneSelect
              value={municipalityValue}
              onChange={handleMunicipalityChange}
              options={municipalities}
              placeholder={
                provinceId
                  ? "Selecciona un municipio"
                  : "Elige una provincia primero"
              }
              disabled={!provinceId || pending}
              testId="zone-picker-municipality"
            />

            {pending && (
              <p className="mt-3 text-xs text-rm-ink-2">Actualizando…</p>
            )}
          </div>
        </>
      )}

      <ZoneConflictDialog
        open={!!conflict}
        items={conflict?.items ?? []}
        pending={pending}
        onConfirm={confirmZoneChange}
        onCancel={cancelConflict}
      />
    </div>
  )
}

export default RodiZonePicker
