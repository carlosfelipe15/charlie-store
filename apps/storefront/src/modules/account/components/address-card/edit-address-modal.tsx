"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import type { ZoneProvince } from "@lib/data/zones"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import NativeSelect from "@modules/common/components/native-select"
import { RodiBtn } from "@modules/common/components/rodi"
import { clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useMemo, useState } from "react"

type EditAddressProps = {
  zones: ZoneProvince[]
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  zones,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  // Legacy free-text `province`/`city` may not match any real zone name
  // (see .context/reports for the zones↔addresses audit) — in that case the
  // selects simply show unselected, prompting the user to pick a real one.
  const [provinceName, setProvinceName] = useState(address.province || "")
  const [municipalityName, setMunicipalityName] = useState(address.city || "")

  const municipalities = useMemo(
    () => zones.find((p) => p.name === provinceName)?.municipalities ?? [],
    [zones, provinceName]
  )

  const close = () => {
    setSuccessState(false)
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border border-rm-line rounded-rm-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors bg-rm-paper",
          {
            "border-rm-ink": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          {address.address_name && (
            <span
              className="text-small-regular text-rm-ink-3 uppercase tracking-wide mb-1"
              data-testid="address-nickname"
            >
              {address.address_name}
            </span>
          )}
          <h3
            className="text-left font-bold text-rm-ink"
            data-testid="address-name"
          >
            {address.first_name} {address.last_name}
          </h3>
          <p className="flex flex-col text-left text-base-regular text-rm-ink-2 mt-2">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-rm-ink-2 hover:text-rm-ink flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            Editar
          </button>
          <button
            className="text-small-regular text-rm-ink-2 hover:text-rm-red flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            Eliminar
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>Editar dirección</Modal.Title>
        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <Input
                label="Apodo (opcional, ej. Casa, Oficina)"
                name="address_name"
                defaultValue={address.address_name || undefined}
                data-testid="address-name-input"
              />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="Nombre"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Apellidos"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Dirección"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Nota para la entrega (opcional)"
                name="address_2"
                defaultValue={address.address_2 || undefined}
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
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="Teléfono"
                  name="phone"
                  autoComplete="phone"
                  defaultValue={address.phone || undefined}
                  data-testid="phone-input"
                />
              </div>
            </div>
            {formState.error && (
              <div className="text-rm-red text-small-regular py-2">
                {formState.error}
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

export default EditAddress
