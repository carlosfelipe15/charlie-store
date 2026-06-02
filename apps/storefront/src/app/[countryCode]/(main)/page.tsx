import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import RodiCategoryTiles from "@modules/home/components/rodi-category-tiles"
import RodiHomePromoCards from "@modules/home/components/rodi-promo-cards"
import RodiTrustStrip from "@modules/home/components/rodi-trust-strip"

export const metadata: Metadata = {
  title: "Rodi Mercado",
  description: "Tu supermercado en línea con entrega rápida.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <section className="content-container py-6 small:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <Hero />
          <RodiHomePromoCards />
        </div>
      </section>
      <RodiTrustStrip />
      <RodiCategoryTiles />
      <div className="py-8 content-container">
        <ul className="flex flex-col gap-y-10">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
