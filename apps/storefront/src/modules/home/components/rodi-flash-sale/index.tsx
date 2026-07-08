import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { RodiBtnLink } from "@modules/common/components/rodi"
import { RodiIconBolt } from "@modules/common/icons/rodi"
import FlashSaleCountdown from "./countdown"

/**
 * Flash-sale banner (design-reference/ecommerce-test/home.jsx:99-124). Looks
 * for the first product with an active Medusa sale price (a "sale" price
 * list) and degrades to nothing if none exists yet — the current demo
 * catalog has no price lists configured, and products are being loaded
 * separately, so this section is expected to render empty for now.
 */
export default async function RodiFlashSale({
  countryCode,
}: {
  countryCode: string
}) {
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 20 },
  })

  const saleProduct = products
    .map((product) => ({ product, price: getProductPrice({ product }) }))
    .find(({ price }) => price.cheapestPrice?.price_type === "sale")

  if (!saleProduct) {
    return null
  }

  const { product, price } = saleProduct
  const percentageDiff = price.cheapestPrice?.percentage_diff

  return (
    <section className="content-container py-8">
      <div
        className="rounded-rm-xl bg-rm-ink text-white px-7 py-6 flex flex-col gap-4 small:flex-row small:items-center small:justify-between"
        style={{
          backgroundImage:
            "radial-gradient(circle at 92% 50%, var(--rm-red) 0, transparent 40%)",
        }}
      >
        <div className="flex items-center gap-[18px]">
          <div className="w-14 h-14 rounded-full bg-rm-yellow text-rm-ink grid place-items-center shrink-0">
            <RodiIconBolt size={28} />
          </div>
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-rm-yellow">
              OFERTA RELÁMPAGO
            </div>
            <div className="font-display text-2xl small:text-[30px] font-extrabold tracking-tight leading-tight">
              {product.title}
              {percentageDiff ? ` · ${percentageDiff}% OFF` : ""}
            </div>
            <div className="text-[13px] text-white/70 mt-0.5">
              Solo hoy o hasta agotar existencias
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[18px]">
          <FlashSaleCountdown />
          <RodiBtnLink
            href={`/products/${product.handle}`}
            kind="yellow"
            size="lg"
          >
            Comprar ahora
          </RodiBtnLink>
        </div>
      </div>
    </section>
  )
}
