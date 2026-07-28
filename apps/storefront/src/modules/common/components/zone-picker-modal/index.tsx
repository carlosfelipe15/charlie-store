"use client"

import Modal from "@modules/common/components/modal"
import { Heading, Text } from "@modules/common/components/ui"
import ZoneSelect from "@modules/common/components/zone-select"
import ZoneConflictDialog from "@modules/common/components/zone-conflict-dialog"
import { useZoneSelector } from "@modules/layout/components/rodi-zone-picker/use-zone-selector"
import type { ActiveZone, ZoneCartItem, ZoneProvince } from "@lib/data/zones"

type ZonePickerModalProps = {
  open: boolean
  onClose: () => void
  zones: ZoneProvince[]
  activeZone: ActiveZone | null
  /** Cart line items — same soft-warning as the header picker if the change
   * would leave something in the cart unavailable. */
  cartItems: ZoneCartItem[]
}

/**
 * Zone selector as a standalone modal, for entry points that aren't anchored
 * to the header (e.g. the PDP's "Cambiar" button — the header dropdown can't
 * anchor sensibly that far down the page). Same selection/conflict logic as
 * `RodiZonePicker`, via the shared `useZoneSelector` hook.
 */
const ZonePickerModal = ({
  open,
  onClose,
  zones,
  activeZone,
  cartItems,
}: ZonePickerModalProps) => {
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
    onZoneApplied: onClose,
  })

  return (
    <>
      <Modal isOpen={open} close={onClose} size="small" data-testid="zone-picker-modal">
        <Modal.Title>
          <Heading className="mb-2">¿Dónde quieres recibir tu pedido?</Heading>
        </Modal.Title>
        <Modal.Body>
          <label className="mb-1 block text-xs font-semibold text-rm-ink-2">
            Provincia
          </label>
          <div className="mb-3">
            <ZoneSelect
              value={provinceId}
              onChange={setProvinceId}
              options={zones}
              placeholder="Selecciona una provincia"
              testId="zone-modal-province"
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
              provinceId ? "Selecciona un municipio" : "Elige una provincia primero"
            }
            disabled={!provinceId || pending}
            testId="zone-modal-municipality"
          />

          {pending && (
            <Text className="mt-3 text-xs text-rm-ink-2">Actualizando…</Text>
          )}
        </Modal.Body>
      </Modal>

      <ZoneConflictDialog
        open={!!conflict}
        items={conflict?.items ?? []}
        pending={pending}
        onConfirm={confirmZoneChange}
        onCancel={cancelConflict}
      />
    </>
  )
}

export default ZonePickerModal
