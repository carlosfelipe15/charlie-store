import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-2">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-xs font-bold text-rm-ink-3 uppercase tracking-widest hover:text-rm-red"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}
      <h1
        className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-rm-ink leading-tight m-0"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      {product.description && (
        <p
          className="text-sm text-rm-ink-2 leading-relaxed line-clamp-3 md:line-clamp-none"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}
      <p className="text-xs font-bold text-rm-green">● Disponible</p>
    </div>
  )
}

export default ProductInfo
