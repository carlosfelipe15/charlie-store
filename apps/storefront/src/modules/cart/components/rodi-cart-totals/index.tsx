"use client"

import { convertToLocale } from "@lib/util/money"

type RodiCartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
  itemCount?: number
}

export default function RodiCartTotals({
  totals,
  itemCount = 0,
}: RodiCartTotalsProps) {
  const {
    currency_code,
    total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  const shippingFree = !shipping_subtotal || shipping_subtotal === 0

  return (
    <div className="text-sm">
      <div className="flex justify-between py-1.5 text-rm-ink-2">
        <span>
          Subtotal ({itemCount} {itemCount === 1 ? "unidad" : "unidades"})
        </span>
        <span className="font-bold text-rm-ink" data-testid="cart-subtotal">
          {convertToLocale({
            amount: item_subtotal ?? 0,
            currency_code,
          })}
        </span>
      </div>
      {!!discount_subtotal && (
        <div className="flex justify-between py-1.5 text-rm-green">
          <span>Descuentos</span>
          <span className="font-bold" data-testid="cart-discount">
            −
            {convertToLocale({
              amount: discount_subtotal,
              currency_code,
            })}
          </span>
        </div>
      )}
      <div className="flex justify-between py-1.5 text-rm-ink-2">
        <span>Envío</span>
        <span
          className={`font-bold ${shippingFree ? "text-rm-green" : "text-rm-ink"}`}
          data-testid="cart-shipping"
        >
          {shippingFree
            ? "Gratis"
            : convertToLocale({
                amount: shipping_subtotal ?? 0,
                currency_code,
              })}
        </span>
      </div>
      <div className="flex justify-between py-1.5 text-rm-ink-2">
        <span>Impuestos</span>
        <span className="font-bold text-rm-ink" data-testid="cart-taxes">
          Incluidos
        </span>
      </div>
      <div className="border-t border-dashed border-rm-line mt-3 pt-4 flex justify-between items-baseline">
        <span className="text-[13px] font-bold text-rm-ink-2">TOTAL</span>
        <span
          className="font-display text-3xl font-extrabold tracking-tight text-rm-ink tabular-nums"
          data-testid="cart-total"
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}
