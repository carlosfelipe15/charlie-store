import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getActiveZone, listZones } from "@lib/data/zones"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  // The active "Entregar en" zone pre-fills the shipping address (province +
  // municipality) so the checkout comes scoped to the chosen zone. Country is
  // already auto-set to "cu" by the single-country region, so shipping options
  // resolve regardless. Passed down to the address form as fallback defaults.
  const activeZone = await getActiveZone()
  // Populates the Provincia/Municipio selects in the shipping address form —
  // same source of truth as the "Entregar en" picker and product filtering.
  const zones = await listZones()

  return (
    <div className="content-container max-w-[1280px] mx-auto grid grid-cols-1 small:grid-cols-[1fr_380px] gap-5 py-6 small:py-8">
      <PaymentWrapper cart={cart}>
        <CheckoutForm
          cart={cart}
          customer={customer}
          activeZone={activeZone}
          zones={zones}
        />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
