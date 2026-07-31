"use client"

import { Plus } from "@medusajs/icons"
import { RodiBtn } from "@modules/common/components/rodi"
import {
  type FormEvent,
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react"

import { addCustomerAddress } from "@lib/data/customer"
import type { ZoneProvince } from "@lib/data/zones"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import RodiSelect from "@modules/common/components/rodi-select"

const AddAddress = ({
  zones,
  addresses,
  trigger,
}: {
  zones: ZoneProvince[]
  addresses: HttpTypes.StoreCustomerAddress[]
  /** Custom trigger UI — defaults to the dashed "Nueva dirección" box. */
  trigger?: (props: { onClick: () => void }) => ReactNode
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const [provinceName, setProvinceName] = useState("")
  const [municipalityName, setMunicipalityName] = useState("")
  // `required` on a hidden <input> (the form field RodiSelect submits
  // through) is silently ignored by browsers — hidden inputs are barred
  // from constraint validation — so the province/city requirement that the
  // old native <select required> enforced has to be checked by hand here.
  const [zoneError, setZoneError] = useState<string | null>(null)

  const municipalities = useMemo(
    () => zones.find((p) => p.name === provinceName)?.municipalities ?? [],
    [zones, provinceName]
  )

  const close = () => {
    setSuccessState(false)
    setProvinceName("")
    setMunicipalityName("")
    setZoneError(null)
    closeModal()
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!provinceName || !municipalityName) {
      e.preventDefault()
      setZoneError("Selecciona una provincia y un municipio.")
    }
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      {trigger ? (
        trigger({ onClick: open })
      ) : (
        <button
          className="self-start border border-dashed border-rm-line rounded-rm-lg px-4 py-3 w-full flex items-center gap-2.5 bg-rm-paper hover:border-rm-ink transition-colors"
          onClick={open}
          data-testid="add-address-button"
        >
          <Plus className="text-rm-ink-2 shrink-0" />
          <span className="text-sm font-bold text-rm-ink">Nueva dirección</span>
        </button>
      )}

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>Agregar dirección</Modal.Title>
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <Modal.Body>
            <div className="flex flex-col gap-y-2">
              <Input
                label="Apodo (opcional, ej. Casa, Oficina)"
                name="address_name"
                data-testid="address-name-input"
              />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="Nombre"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="Apellidos"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Dirección"
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <Input
                label="Nota para la entrega (opcional)"
                name="address_2"
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-2 gap-x-2">
                <RodiSelect
                  name="province"
                  placeholder="Provincia"
                  value={provinceName}
                  onChange={(value) => {
                    setProvinceName(value)
                    setMunicipalityName("")
                    setZoneError(null)
                  }}
                  options={zones.map((province) => ({
                    value: province.name,
                    label: province.name,
                  }))}
                  data-testid="province-select"
                />
                <RodiSelect
                  name="city"
                  placeholder={
                    provinceName
                      ? "Municipio"
                      : "Elige una provincia primero"
                  }
                  disabled={!provinceName}
                  value={municipalityName}
                  onChange={(value) => {
                    setMunicipalityName(value)
                    setZoneError(null)
                  }}
                  options={municipalities.map((municipality) => ({
                    value: municipality.name,
                    label: municipality.name,
                  }))}
                  data-testid="city-select"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="Código postal"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  data-testid="postal-code-input"
                />
                <Input
                  label="Teléfono"
                  name="phone"
                  autoComplete="phone"
                  data-testid="phone-input"
                />
              </div>
            </div>
            {(zoneError || formState.error) && (
              <div
                className="text-rm-red text-small-regular py-2"
                data-testid="address-error"
              >
                {zoneError || formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <RodiBtn
                type="reset"
                kind="ghost"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancelar
              </RodiBtn>
              <SubmitButton data-testid="save-button">Guardar</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
