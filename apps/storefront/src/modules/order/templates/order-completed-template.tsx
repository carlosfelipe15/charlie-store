import { cookies as nextCookies } from "next/headers"

import { convertToLocale } from "@lib/util/money"
import RodiCartTotals from "@modules/cart/components/rodi-cart-totals"
import { RodiBtnLink } from "@modules/common/components/rodi"
import { RodiIconCheck } from "@modules/common/icons/rodi"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const firstName = order.shipping_address?.first_name ?? "Cliente"

  return (
    <div className="py-8 min-h-[calc(100vh-64px)] bg-rm-cream">
      <div className="content-container max-w-[920px] mx-auto">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div
          className="bg-rm-paper border border-rm-line rounded-[18px] p-8 small:p-10 text-center relative overflow-hidden"
          data-testid="order-complete-container"
        >
          <div className="relative z-10">
            <div className="w-[72px] h-[72px] rounded-full bg-rm-green text-white grid place-items-center mx-auto shadow-[0_8px_24px_rgba(15,122,62,0.3)]">
              <RodiIconCheck size={36} />
            </div>
            <h1 className="font-display text-4xl small:text-5xl font-extrabold tracking-tight text-rm-ink mt-5 mb-2 leading-none">
              ¡Listo, {firstName}!
            </h1>
            <p className="text-base text-rm-ink-2">
              Tu pedido{" "}
              <strong className="text-rm-ink">#{order.display_id}</strong> fue
              confirmado
            </p>
            <div className="inline-flex items-center gap-3 mt-6 px-5 py-3.5 bg-rm-s-butter rounded-rm-lg">
              <span className="text-3xl" aria-hidden>
                🛵
              </span>
              <div className="text-left">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-rm-ink">
                  Próxima entrega
                </div>
                <div className="font-display text-xl font-extrabold text-rm-ink leading-tight">
                  Te avisamos por correo
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          <div className="bg-rm-paper border border-rm-line rounded-rm-lg p-6">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-rm-ink m-0 mb-4">
              Resumen del pedido
            </h2>
            <OrderDetails order={order} />
            <div className="mt-4 border-t border-rm-line-2 pt-4">
              <Items order={order} />
            </div>
            <div className="mt-4">
              <RodiCartTotals totals={order} itemCount={itemCount} />
            </div>
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
          </div>

          <div className="bg-rm-ink text-white rounded-rm-lg p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-rm-yellow mb-2">
                ¡Gracias por comprar!
              </p>
              <h2 className="font-display text-2xl font-extrabold tracking-tight leading-tight m-0">
                Tu próxima compra
                <br />
                <span className="text-rm-yellow">te espera</span>
              </h2>
              <p className="text-sm opacity-75 mt-3 leading-relaxed">
                Total pagado:{" "}
                <strong>
                  {convertToLocale({
                    amount: order.total,
                    currency_code: order.currency_code,
                  })}
                </strong>
              </p>
            </div>
            <RodiBtnLink href="/store" kind="yellow" size="lg" className="mt-6">
              Seguir comprando →
            </RodiBtnLink>
          </div>
        </div>

        <div className="mt-6">
          <Help />
        </div>
      </div>
    </div>
  )
}
