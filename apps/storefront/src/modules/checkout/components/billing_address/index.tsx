import { HttpTypes } from "@medusajs/types"
import { ALL_COUNTRIES } from "@lib/util/countries"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import React, { useMemo, useState } from "react"

const BillingAddress = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  // Billing is independent of shipping (it's normal for them to differ) —
  // auto-load it from the customer's saved profile address instead, still
  // editable. Prefers a saved address explicitly marked as default billing,
  // then falls back to the customer's first saved address.
  const profileAddress = useMemo(
    () =>
      customer?.addresses.find((a) => a.is_default_billing) ??
      customer?.addresses[0] ??
      null,
    [customer]
  )

  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name":
      cart?.billing_address?.first_name ||
      profileAddress?.first_name ||
      customer?.first_name ||
      "",
    "billing_address.last_name":
      cart?.billing_address?.last_name ||
      profileAddress?.last_name ||
      customer?.last_name ||
      "",
    "billing_address.address_1":
      cart?.billing_address?.address_1 || profileAddress?.address_1 || "",
    "billing_address.postal_code":
      cart?.billing_address?.postal_code || profileAddress?.postal_code || "",
    "billing_address.city":
      cart?.billing_address?.city || profileAddress?.city || "",
    // Billing can be in any country (unlike shipping, always Cuba) — default
    // to the profile address' country, falling back to Cuba.
    "billing_address.country_code":
      cart?.billing_address?.country_code ||
      profileAddress?.country_code ||
      "cu",
    "billing_address.province":
      cart?.billing_address?.province || profileAddress?.province || "",
    "billing_address.phone":
      cart?.billing_address?.phone ||
      profileAddress?.phone ||
      customer?.phone ||
      "",
  })

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

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Apellidos"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="Dirección"
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
        <Input
          label="Código postal"
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        <Input
          label="Ciudad"
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
        />
        <NativeSelect
          name="billing_address.country_code"
          placeholder="País"
          autoComplete="country"
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        >
          {ALL_COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </NativeSelect>
        <Input
          label="Departamento / Provincia"
          name="billing_address.province"
          autoComplete="address-level1"
          value={formData["billing_address.province"]}
          onChange={handleChange}
          data-testid="billing-province-input"
        />
        <Input
          label="Teléfono"
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
    </>
  )
}

export default BillingAddress
