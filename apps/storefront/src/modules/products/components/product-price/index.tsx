import { getProductPrice } from "@lib/util/get-product-price"
import { RodiBadge } from "@modules/common/components/rodi"
import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-full h-12 bg-rm-line-2 animate-pulse rounded-rm-md" />
  }

  const onSale = selectedPrice.price_type === "sale"

  return (
    <div className="rounded-rm-lg border border-rm-line bg-rm-paper p-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="font-display text-4xl font-extrabold tracking-tight text-rm-ink"
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {!variant && (product.variants?.length ?? 0) > 1 ? "Desde " : ""}
          {selectedPrice.calculated_price}
        </span>
        {onSale && (
          <>
            <span
              className="text-lg text-rm-ink-4 line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
            <RodiBadge kind="sale">−{selectedPrice.percentage_diff}%</RodiBadge>
          </>
        )}
      </div>
      {onSale && (
        <p className={clsx("text-[13px] text-rm-ink-3 mt-2")}>
          Ahorras en esta oferta
        </p>
      )}
    </div>
  )
}
