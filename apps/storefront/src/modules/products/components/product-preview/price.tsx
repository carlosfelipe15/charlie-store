import { clsx } from "clsx"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      {price.price_type === "sale" && (
        <span
          className="text-xs text-rm-ink-4 line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={clsx(
          "font-display text-lg font-extrabold tracking-tight text-rm-ink",
          price.price_type === "sale" && "text-rm-red"
        )}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </div>
  )
}
