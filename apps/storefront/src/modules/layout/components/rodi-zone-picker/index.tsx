"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { clsx } from "clsx"
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"

import { RodiIconChevron, RodiIconPin } from "@modules/common/icons/rodi"
import {
  checkZoneEligibility,
  setActiveZone,
  type ActiveZone,
  type ZoneCartItem,
  type ZoneProvince,
} from "@lib/data/zones"
import { deleteLineItem } from "@lib/data/cart"
import ZoneConflictDialog from "@modules/common/components/zone-conflict-dialog"

type ZoneOption = { id: string; name: string }

/**
 * Custom dropdown (Headless UI Listbox) used for both Provincia and Municipio.
 * Native <select> can't do what's needed here: a chevron inset from the right
 * edge, rotating up on open, and an options popup that matches the trigger width.
 */
const ZoneSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  testId,
}: {
  value: string
  onChange: (id: string) => void
  options: ZoneOption[]
  placeholder: string
  disabled?: boolean
  testId?: string
}) => {
  const selected = options.find((o) => o.id === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className="relative">
          <ListboxButton
            className={clsx(
              "flex w-full items-center justify-between rounded-rm-md border border-rm-line bg-white",
              // extra right padding so the chevron sits inset from the edge
              "py-2 pl-3 pr-3 text-sm text-left",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-rm-red",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            data-testid={testId}
          >
            <span className={clsx("truncate", selected ? "text-rm-ink" : "text-rm-ink-2")}>
              {selected ? selected.name : placeholder}
            </span>
            <span className="ml-2 shrink-0 text-rm-ink-2">
              <RodiIconChevron size={14} chevronDirection={open ? "up" : "down"} />
            </span>
          </ListboxButton>

          <ListboxOptions
            className={clsx(
              // w-full => options popup matches the trigger width (both selects
              // share the same panel width, so Provincia and Municipio match)
              "absolute left-0 z-[901] mt-1 max-h-60 w-full overflow-auto",
              "rounded-rm-md border border-rm-line bg-white py-1 shadow-lg focus:outline-none"
            )}
          >
            {options.map((option) => (
              <ListboxOption
                key={option.id}
                value={option.id}
                className={({ focus, selected: isSelected }) =>
                  clsx(
                    "cursor-pointer px-3 py-2 text-sm text-rm-ink",
                    focus && "bg-rm-paper",
                    isSelected && "font-semibold"
                  )
                }
              >
                {option.name}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      )}
    </Listbox>
  )
}

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
  const [provinceId, setProvinceId] = useState<string>(
    () => zones.find((p) => p.name === activeZone?.provinceName)?.id ?? ""
  )
  const [pending, startTransition] = useTransition()
  const [conflict, setConflict] = useState<{
    municipalityId: string
    items: { id: string; title: string; thumbnail: string | null }[]
  } | null>(null)
  const router = useRouter()

  const municipalities = useMemo(
    () => zones.find((p) => p.id === provinceId)?.municipalities ?? [],
    [zones, provinceId]
  )

  const label = activeZone
    ? `${activeZone.name}, ${activeZone.provinceName}`
    : "Elige tu zona"

  const municipalityValue =
    activeZone && municipalities.some((m) => m.id === activeZone.id)
      ? activeZone.id
      : ""

  const applyZoneChange = (municipalityId: string) => {
    startTransition(async () => {
      await setActiveZone(municipalityId)
      setOpen(false)
      setConflict(null)
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
      setOpen(false)
      setConflict(null)
      router.refresh()
    })
  }

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
        onCancel={() => setConflict(null)}
      />
    </div>
  )
}

export default RodiZonePicker
