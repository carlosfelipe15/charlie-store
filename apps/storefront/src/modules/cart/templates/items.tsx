import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import RodiCartItem from "@modules/cart/components/rodi-cart-item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items?.sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <div className="bg-rm-paper border border-rm-line rounded-rm-lg overflow-hidden">
      {items?.length ? (
        items.map((item, i) => (
          <RodiCartItem
            key={item.id}
            item={item}
            currencyCode={cart?.currency_code ?? "usd"}
            isLast={i === items.length - 1}
          />
        ))
      ) : (
        repeat(3).map((i) => <SkeletonLineItem key={i} />)
      )}
    </div>
  )
}

export default ItemsTemplate
