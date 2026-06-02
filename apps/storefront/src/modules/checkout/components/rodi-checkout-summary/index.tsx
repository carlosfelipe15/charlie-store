import RodiCartTotals from "@modules/cart/components/rodi-cart-totals"
import RodiCheckoutPreviewItems from "@modules/checkout/components/rodi-checkout-preview-items"
import { HttpTypes } from "@medusajs/types"

type RodiCheckoutSummaryProps = {
  cart: HttpTypes.StoreCart
}

export default function RodiCheckoutSummary({ cart }: RodiCheckoutSummaryProps) {
  const itemCount = cart.items?.length ?? 0
  const unitCount = cart.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <aside className="sticky top-6">
      <div className="bg-rm-paper border border-rm-line rounded-rm-lg p-5">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-rm-ink m-0 mb-3.5">
          Tu pedido · {itemCount} {itemCount === 1 ? "producto" : "productos"}
        </h2>
        <RodiCheckoutPreviewItems cart={cart} />
        <RodiCartTotals totals={cart} itemCount={unitCount} />
        <p className="text-[11px] text-rm-ink-3 text-center mt-3 leading-relaxed">
          Al pagar aceptas los términos y la política de privacidad. Pago seguro
          con encriptación SSL.
        </p>
      </div>
    </aside>
  )
}
