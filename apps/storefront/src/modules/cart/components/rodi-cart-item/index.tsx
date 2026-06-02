"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LineItemOptions from "@modules/common/components/line-item-options"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RodiQtyStepper from "@modules/products/components/rodi-qty-stepper"
import Thumbnail from "@modules/products/components/thumbnail"
import { useRouter } from "next/navigation"
import { useState } from "react"

type RodiCartItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
  isLast?: boolean
}

export default function RodiCartItem({
  item,
  currencyCode,
  isLast,
}: RodiCartItemProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)

  const maxQuantity = item.variant?.manage_inventory
    ? Math.min(item.variant?.inventory_quantity ?? 10, 99)
    : 99

  const unitAmount = item.unit_price ?? 0
  const lineTotal = unitAmount * item.quantity

  const changeQuantity = async (quantity: number) => {
    setUpdating(true)
    await updateLineItem({ lineId: item.id, quantity }).finally(() => {
      setUpdating(false)
      router.refresh()
    })
  }

  const remove = async () => {
    setRemoving(true)
    await deleteLineItem(item.id).finally(() => {
      setRemoving(false)
      router.refresh()
    })
  }

  return (
    <div
      className={`grid grid-cols-[88px_1fr_auto] small:grid-cols-[88px_1fr_auto_auto] gap-3 small:gap-4 p-4 items-center ${
        isLast ? "" : "border-b border-rm-line-2"
      }`}
      data-testid="product-row"
    >
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="w-[88px] shrink-0"
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
          variant="rodi"
          className="!aspect-square"
        />
      </LocalizedClientLink>

      <div className="min-w-0">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="text-sm font-semibold text-rm-ink hover:text-rm-red line-clamp-2"
          data-testid="product-title"
        >
          {item.product_title}
        </LocalizedClientLink>
        <LineItemOptions
          variant={item.variant}
          data-testid="product-variant"
        />
        <button
          type="button"
          onClick={() => void remove()}
          disabled={removing}
          className="mt-2 text-xs font-bold text-rm-red hover:underline disabled:opacity-50"
          data-testid="product-delete-button"
        >
          {removing ? "Eliminando…" : "Eliminar"}
        </button>
      </div>

      <RodiQtyStepper
        quantity={item.quantity}
        onChange={(q) => void changeQuantity(q)}
        max={maxQuantity}
        disabled={updating || removing}
        size="md"
      />

      <div className="text-right min-w-[100px] col-span-3 small:col-span-1 small:col-start-4">
        <div
          className="font-display text-lg font-extrabold tracking-tight text-rm-ink tabular-nums"
          data-testid="product-price"
        >
          {convertToLocale({ amount: lineTotal, currency_code: currencyCode })}
        </div>
        {item.quantity > 1 && (
          <div className="text-xs text-rm-ink-3 mt-0.5">
            {convertToLocale({ amount: unitAmount, currency_code: currencyCode })}{" "}
            c/u
          </div>
        )}
      </div>
    </div>
  )
}
