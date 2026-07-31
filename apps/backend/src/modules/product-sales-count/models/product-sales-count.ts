import { model } from "@medusajs/framework/utils"

export const ProductSalesCount = model.define("product_sales_count", {
  id: model.id().primaryKey(),
  product_id: model.text().unique("IDX_product_sales_count_product_id"),
  units_sold: model.number().default(0),
  last_calculated_at: model.dateTime().nullable(),
})
