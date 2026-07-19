import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
    brand_id?: string
    tag_id?: string
    rating_gte?: string
    on_sale?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, q, brand_id, tag_id, rating_gte, on_sale } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      query={q}
      brandId={brand_id ? brand_id.split(",").filter(Boolean) : undefined}
      tagId={tag_id ? tag_id.split(",").filter(Boolean) : undefined}
      ratingGte={rating_gte}
      onSale={on_sale === "true"}
      countryCode={params.countryCode}
    />
  )
}
