import { RodiBtnLink } from "@modules/common/components/rodi"
import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div className="bg-rm-paper border border-rm-line rounded-rm-lg p-5 flex flex-col" data-testid="order-card">
      <div className="font-display text-lg font-extrabold text-rm-ink mb-1">
        Pedido #<span data-testid="order-display-id">{order.display_id}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-rm-ink-2">
        <span className="pr-2" data-testid="order-created-at">
          {new Date(order.created_at).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span className="px-2" data-testid="order-amount">
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <span>{`${numberOfLines} ${
          numberOfLines > 1 ? "unidades" : "unidad"
        }`}</span>
      </div>
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2 max-w-[50%]"
              data-testid="order-item"
            >
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-small-regular text-rm-ink">
                <span
                  className="text-rm-ink font-semibold"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="ml-2">x</span>
                <span data-testid="item-quantity">{i.quantity}</span>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-small-regular text-rm-ink">
              + {numberOfLines - 4}
            </span>
            <span className="text-small-regular text-rm-ink">más</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <RodiBtnLink
          href={`/account/orders/details/${order.id}`}
          kind="ghost"
          size="sm"
          data-testid="order-details-link"
        >
          Ver detalles
        </RodiBtnLink>
      </div>
    </div>
  )
}

export default OrderCard
