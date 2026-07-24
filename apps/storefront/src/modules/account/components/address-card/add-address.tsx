"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@modules/common/components/ui"
import { useActionState, useEffect, useMemo, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import type { ZoneProvince } from "@lib/data/zones"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import NativeSelect from "@modules/common/components/native-select"

const AddAddress = ({
  zones,
  addresses,
}: {
  zones: ZoneProvince[]
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const [provinceName, setProvinceName] = useState("")
  const [municipalityName, setMunicipalityName] = useState("")

  const municipalities = useMemo(
    () => zones.find((p) => p.name === provinceName)?.municipalities ?? [],
    [zones, provinceName]
  )

  const close = () => {
    setSuccessState(false)
    setProvinceName("")
    setMunicipalityName("")
    closeModal()
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
      <button
        className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">Nueva dirección</span>
        <Plus />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Agregar dirección</Heading>
        </Modal.Title>
        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <Modal.Body>
            <div className="flex flex-col gap-y-2">
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
                <NativeSelect
                  name="province"
                  placeholder="Provincia"
                  required
                  value={provinceName}
                  onChange={(e) => {
                    setProvinceName(e.target.value)
                    setMunicipalityName("")
                  }}
                  data-testid="province-select"
                >
                  {zones.map((province) => (
                    <option key={province.id} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </NativeSelect>
                <NativeSelect
                  name="city"
                  placeholder={
                    provinceName
                      ? "Municipio"
                      : "Elige una provincia primero"
                  }
                  required
                  disabled={!provinceName}
                  value={municipalityName}
                  onChange={(e) => setMunicipalityName(e.target.value)}
                  data-testid="city-select"
                >
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.name}>
                      {municipality.name}
                    </option>
                  ))}
                </NativeSelect>
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
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancelar
              </Button>
              <SubmitButton data-testid="save-button">Guardar</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
