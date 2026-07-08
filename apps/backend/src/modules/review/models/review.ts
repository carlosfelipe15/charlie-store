import { model } from "@medusajs/framework/utils"

export const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text().index("IDX_review_product_id"),
  customer_id: model.text(),
  rating: model.number(),
  title: model.text().nullable(),
  body: model.text(),
})
