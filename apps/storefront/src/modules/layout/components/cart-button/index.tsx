import { retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartDropdown from "../cart-dropdown"

type CartButtonProps = {
  variant?: "default" | "rodi"
  cart?: HttpTypes.StoreCart | null
}

export default async function CartButton({
  variant = "default",
  cart: cartProp,
}: CartButtonProps) {
  const cart =
    cartProp !== undefined
      ? cartProp
      : await retrieveCart().catch(() => null)

  return <CartDropdown cart={cart} variant={variant} />
}
