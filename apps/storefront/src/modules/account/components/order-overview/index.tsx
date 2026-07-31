"use client"

import { RodiBtnLink } from "@modules/common/components/rodi"

import OrderCard from "../order-card"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b border-rm-line pb-6 last:pb-0 last:border-none"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4 py-8"
      data-testid="no-orders-container"
    >
      <h2 className="font-display text-xl font-extrabold text-rm-ink">
        Aún no tienes pedidos
      </h2>
      <p className="text-base-regular text-rm-ink-2">
        Cuando hagas tu primer pedido, aparecerá acá.
      </p>
      <div className="mt-2">
        <RodiBtnLink href="/" data-testid="continue-shopping-button">
          Ir a la tienda
        </RodiBtnLink>
      </div>
    </div>
  )
}

export default OrderOverview
