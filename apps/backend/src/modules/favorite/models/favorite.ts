import { model } from "@medusajs/framework/utils"

export const Favorite = model.define("favorite", {
  id: model.id().primaryKey(),
  product_id: model.text().index("IDX_favorite_product_id"),
  customer_id: model.text(),
}).indexes([
  {
    on: ["product_id", "customer_id"],
    unique: true,
  },
])
