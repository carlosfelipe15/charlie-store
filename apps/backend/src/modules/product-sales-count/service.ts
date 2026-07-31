import { MedusaService } from "@medusajs/framework/utils"
import { ProductSalesCount } from "./models/product-sales-count"

class ProductSalesCountModuleService extends MedusaService({
  ProductSalesCount,
}) {}

export default ProductSalesCountModuleService
