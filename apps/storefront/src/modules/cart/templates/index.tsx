import RodiBreadcrumbs from "@modules/products/components/rodi-breadcrumbs"
import RodiCartShippingBanner from "@modules/cart/components/rodi-cart-shipping-banner"
import RodiCartSummary from "@modules/cart/components/rodi-cart-summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import ZoneEmptiedNotice from "../components/zone-emptied-notice"
import ItemsTemplate from "./items"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const itemCount = cart?.items?.length ?? 0

  return (
    <div className="py-8 content-container" data-testid="cart-container">
      <ZoneEmptiedNotice />
      <RodiBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Carrito" },
        ]}
      />
      {cart?.items?.length ? (
        <>
          <h1 className="font-display text-3xl small:text-4xl font-extrabold tracking-tight text-rm-ink mt-2 mb-6">
            Tu carrito · {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </h1>
          <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-5 small:gap-6">
            <div className="flex flex-col gap-4 min-w-0">
              {!customer && <SignInPrompt />}
              <RodiCartShippingBanner />
              <ItemsTemplate cart={cart} />
            </div>
            {cart.region && <RodiCartSummary cart={cart} />}
          </div>
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}

export default CartTemplate
