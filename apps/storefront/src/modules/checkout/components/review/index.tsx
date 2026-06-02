"use client"

import { RodiIconShield } from "@modules/common/icons/rodi"
import RodiCheckoutSection from "@modules/checkout/components/rodi-checkout-section"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <RodiCheckoutSection
      title="Revisar y confirmar pedido"
      active={isOpen}
    >
      {isOpen && previousStepsCompleted && (
        <>
          <p className="text-sm text-rm-ink-2 leading-relaxed mb-4">
            Al confirmar el pedido aceptas nuestros términos de uso, venta y
            devoluciones, y la política de privacidad de Rodi Mercado.
          </p>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
          <p className="text-[11px] text-rm-ink-3 text-center mt-3 flex items-center justify-center gap-1.5">
            <RodiIconShield size={14} />
            Pago seguro con encriptación SSL
          </p>
        </>
      )}
    </RodiCheckoutSection>
  )
}

export default Review
