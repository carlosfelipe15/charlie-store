"use client"

import { setAddresses, type SetAddressesState } from "@lib/data/cart"
import type { ActiveZone, ZoneProvince } from "@lib/data/zones"
import { HttpTypes } from "@medusajs/types"
import RodiCheckoutSection from "@modules/checkout/components/rodi-checkout-section"
import ZoneConflictDialog from "@modules/common/components/zone-conflict-dialog"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"
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

const INITIAL_STATE: SetAddressesState = { status: "idle" }

const Addresses = ({
  cart,
  customer,
  activeZone,
  zones,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  activeZone?: ActiveZone | null
  zones: ZoneProvince[]
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"
  const hasAddress = !!cart?.shipping_address?.address_1

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [state, formAction, isPending] = useActionState(
    setAddresses,
    INITIAL_STATE
  )

  const formRef = useRef<HTMLFormElement>(null)
  // Two-step confirm: the zone-conflict dialog can't block a Server Action
  // mid-submit, so a confirmed "continue anyway" resubmits the same form
  // with a hidden flag set — see setAddresses' `confirm_zone_change` branch.
  const [confirmZoneChange, setConfirmZoneChange] = useState(false)
  const [conflictDismissed, setConflictDismissed] = useState(false)

  useEffect(() => {
    if (state.status === "zone-conflict") {
      setConflictDismissed(false)
    } else {
      setConfirmZoneChange(false)
    }
  }, [state])

  useEffect(() => {
    if (confirmZoneChange) {
      formRef.current?.requestSubmit()
    }
  }, [confirmZoneChange])

  const conflictOpen = state.status === "zone-conflict" && !conflictDismissed
  const errorMessage = state.status === "error" ? state.message : null

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
        <form ref={formRef} action={formAction}>
          <input
            type="hidden"
            name="confirm_zone_change"
            value={confirmZoneChange ? "true" : "false"}
          />
          <ShippingAddress
            customer={customer}
            cart={cart}
            activeZone={activeZone}
            zones={zones}
          />
          <div className="mt-6 pt-6 border-t border-rm-line-2">
            <h3 className="font-display text-base font-extrabold text-rm-ink mb-4">
              Dirección de facturación
            </h3>
            <BillingAddress cart={cart} customer={customer} />
          </div>
          <SubmitButton className="mt-6" data-testid="submit-address-button">
            Continuar al envío
          </SubmitButton>
          <ErrorMessage error={errorMessage} data-testid="address-error-message" />
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

      <ZoneConflictDialog
        open={conflictOpen}
        items={state.status === "zone-conflict" ? state.items : []}
        pending={isPending}
        onConfirm={() => setConfirmZoneChange(true)}
        onCancel={() => setConflictDismissed(true)}
      />
    </RodiCheckoutSection>
  )
}

export default Addresses
