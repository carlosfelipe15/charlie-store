import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type RodiCheckoutPreviewItemsProps = {
  cart: HttpTypes.StoreCart
  maxItems?: number
}

export default function RodiCheckoutPreviewItems({
  cart,
  maxItems = 4,
}: RodiCheckoutPreviewItemsProps) {
  const items = [...(cart.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )
  const shown = items.slice(0, maxItems)
  const hidden = items.length - shown.length

  return (
    <div className="border-b border-rm-line-2 pb-3 mb-3 max-h-[240px] overflow-y-auto">
      {shown.map((item) => (
        <div key={item.id} className="flex gap-2.5 py-2 items-center">
          <div className="relative w-11 h-11 shrink-0">
            <Thumbnail
              thumbnail={item.thumbnail}
              size="square"
              variant="rodi"
              className="!w-11 !h-11 !aspect-square"
            />
            <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-rm-ink text-white text-[10px] font-extrabold grid place-items-center">
              {item.quantity}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-xs leading-snug">
            <div className="font-semibold text-rm-ink line-clamp-2">
              {item.product_title}
            </div>
          </div>
          <div className="font-display text-sm font-extrabold tabular-nums shrink-0">
            {convertToLocale({
              amount: (item.unit_price ?? 0) * item.quantity,
              currency_code: cart.currency_code,
            })}
          </div>
        </div>
      ))}
      {hidden > 0 && (
        <LocalizedClientLink
          href="/cart"
          className="text-xs font-bold text-rm-red pt-1 inline-block"
        >
          Ver los {items.length} productos →
        </LocalizedClientLink>
      )}
    </div>
  )
}
