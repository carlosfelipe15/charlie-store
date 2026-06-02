"use client"

import { HttpTypes } from "@medusajs/types"
import { RodiBtnLink } from "@modules/common/components/rodi"
import { RodiIconShield } from "@modules/common/icons/rodi"
import RodiCartDiscount from "@modules/cart/components/rodi-cart-discount"
import RodiCartTotals from "@modules/cart/components/rodi-cart-totals"

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  }
  if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  }
  return "payment"
}

type RodiCartSummaryProps = {
  cart: HttpTypes.StoreCart
}

export default function RodiCartSummary({ cart }: RodiCartSummaryProps) {
  const step = getCheckoutStep(cart)
  const itemCount = cart.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <aside className="sticky top-36">
      <div className="bg-rm-paper border border-rm-line rounded-rm-lg p-5">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-rm-ink m-0 mb-4">
          Resumen
        </h2>
        <RodiCartDiscount cart={cart} />
        <RodiCartTotals totals={cart} itemCount={itemCount} />
        <RodiBtnLink
          href={`/checkout?step=${step}`}
          kind="primary"
          size="lg"
          fullWidth
          className="mt-4"
          data-testid="checkout-button"
        >
          Ir a pagar →
        </RodiBtnLink>
        <RodiBtnLink
          href="/store"
          kind="ghost"
          size="md"
          fullWidth
          className="mt-2"
        >
          Seguir comprando
        </RodiBtnLink>
      </div>
      <div className="mt-3.5 p-4 bg-rm-paper border border-rm-line rounded-rm-lg text-xs text-rm-ink-2 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-rm-ink text-sm mb-1.5">
          <RodiIconShield size={16} />
          Compra protegida
        </div>
        Devolución gratis en 30 días. Atención al cliente 24/7. Pago seguro.
      </div>
    </aside>
  )
}
