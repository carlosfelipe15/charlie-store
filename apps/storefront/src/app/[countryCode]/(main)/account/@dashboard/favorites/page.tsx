import { Metadata } from "next"
import { notFound } from "next/navigation"

import FavoritesList from "@modules/account/components/favorites-list"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Tus productos favoritos",
}

export default async function Favorites(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="favorites-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-rm-ink">
          Tus favoritos
        </h1>
        <p className="text-sm text-rm-ink-2">
          Productos que guardaste para más tarde.
        </p>
      </div>
      <FavoritesList region={region} countryCode={countryCode} />
    </div>
  )
}
