"use client"

import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import RodiCheckoutSection from "@modules/checkout/components/rodi-checkout-section"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

function formatAddressSummary(addr: HttpTypes.StoreCartAddress) {
  const parts = [
    addr.address_1,
    addr.address_2,
    [addr.postal_code, addr.city].filter(Boolean).join(" "),
  ].filter(Boolean)
  return parts.join(" · ")
}

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"
  const hasAddress = !!cart?.shipping_address?.address_1

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const subtitle =
    hasAddress && cart?.shipping_address
      ? `${formatAddressSummary(cart.shipping_address)} · ${cart.shipping_address.first_name} ${cart.shipping_address.last_name}`
      : undefined

  return (
    <RodiCheckoutSection
      title="Dirección de entrega"
      subtitle={!isOpen ? subtitle : undefined}
      done={hasAddress && !isOpen}
      active={isOpen}
      onEdit={hasAddress ? handleEdit : undefined}
    >
      {isOpen ? (
        <form action={formAction}>
          <ShippingAddress
            customer={customer}
            checked={sameAsBilling}
            onChange={toggleSameAsBilling}
            cart={cart}
          />
          {!sameAsBilling && (
            <div className="mt-6 pt-6 border-t border-rm-line-2">
              <h3 className="font-display text-base font-extrabold text-rm-ink mb-4">
                Dirección de facturación
              </h3>
              <BillingAddress cart={cart} />
            </div>
          )}
          <SubmitButton className="mt-6" data-testid="submit-address-button">
            Continuar al envío
          </SubmitButton>
          <ErrorMessage error={message} data-testid="address-error-message" />
        </form>
      ) : hasAddress && cart?.shipping_address ? (
        <div className="text-sm text-rm-ink-2 space-y-1">
          <p>
            {cart.shipping_address.first_name} {cart.shipping_address.last_name}
          </p>
          <p>{cart.shipping_address.phone}</p>
          <p>{cart.email}</p>
        </div>
      ) : (
        <div className="py-4">
          <Spinner />
        </div>
      )}
    </RodiCheckoutSection>
  )
}

export default Addresses
