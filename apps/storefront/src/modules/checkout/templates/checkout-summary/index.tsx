import RodiCheckoutSummary from "@modules/checkout/components/rodi-checkout-summary"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return <RodiCheckoutSummary cart={cart} />
}

export default CheckoutSummary
