import { getProductReviewSummary } from "@lib/data/reviews"
import { getProductBrandName } from "@lib/util/product-brand"
import { HttpTypes } from "@medusajs/types"
import { RodiStars } from "@modules/common/components/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const brandName = getProductBrandName(product)
  const reviewSummary = product.id
    ? await getProductReviewSummary(product.id)
    : null

  return (
    <div id="product-info" className="flex flex-col gap-2">
      {brandName && (
        <span
          className="text-xs font-bold text-rm-ink-4 uppercase tracking-widest"
          data-testid="product-brand"
        >
          {brandName}
        </span>
      )}
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
      {reviewSummary && reviewSummary.count > 0 && (
        <a
          href="#reviews"
          className="inline-flex items-center gap-1.5 w-fit"
          data-testid="product-rating"
        >
          <RodiStars value={reviewSummary.average} size={13} />
          <span className="text-xs font-semibold text-rm-ink-3">
            {reviewSummary.average} · {reviewSummary.count}{" "}
            {reviewSummary.count === 1 ? "reseña" : "reseñas"}
          </span>
        </a>
      )}
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
