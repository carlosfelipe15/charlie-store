import { HttpTypes } from "@medusajs/types"
import type { ActiveZone, ZoneProvince } from "@lib/data/zones"
import { Container } from "@modules/common/components/ui"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

const ShippingAddress = ({
  customer,
  cart,
  activeZone,
  zones,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  activeZone?: ActiveZone | null
  zones: ZoneProvince[]
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    // "Nota para la entrega" — reuses address_2, no company/apartment fields
    // for a single-country grocery storefront.
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    // Fall back to the active "Entregar en" zone: municipality → city,
    // province name → province. Country is always Cuba (no picker).
    "shipping_address.city":
      cart?.shipping_address?.city || activeZone?.name || "",
    "shipping_address.province":
      cart?.shipping_address?.province || activeZone?.provinceName || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const municipalities = useMemo(
    () =>
      zones.find((p) => p.name === formData["shipping_address.province"])
        ?.municipalities ?? [],
    [zones, formData]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    // Only hydrate from the cart once it holds a real (started) address —
    // otherwise keep the active-zone fallback defaults for province/city.
    if (cart && cart.shipping_address?.address_1) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProvinceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      "shipping_address.province": e.target.value,
      "shipping_address.city": "",
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hola ${customer.first_name}, ¿quieres usar una de tus direcciones guardadas?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Apellidos"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Dirección"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Nota para la entrega (opcional)"
          name="shipping_address.address_2"
          value={formData["shipping_address.address_2"]}
          onChange={handleChange}
          data-testid="shipping-address-2-input"
        />
        <Input
          label="Código postal"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <NativeSelect
          name="shipping_address.province"
          placeholder="Provincia"
          value={formData["shipping_address.province"]}
          onChange={handleProvinceChange}
          required
          data-testid="shipping-province-select"
        >
          {zones.map((province) => (
            <option key={province.id} value={province.name}>
              {province.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="shipping_address.city"
          placeholder={
            formData["shipping_address.province"]
              ? "Municipio"
              : "Elige una provincia primero"
          }
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          disabled={!formData["shipping_address.province"]}
          data-testid="shipping-city-select"
        >
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.name}>
              {municipality.name}
            </option>
          ))}
        </NativeSelect>
        <Input
          label="Teléfono"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          title="Introduce un correo electrónico válido."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
      </div>
    </>
  )
}

export default ShippingAddress
