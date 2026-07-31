import { Module } from "@medusajs/framework/utils"
import ProductSalesCountModuleService from "./service"

export const PRODUCT_SALES_COUNT_MODULE = "productSalesCount"

export default Module(PRODUCT_SALES_COUNT_MODULE, {
  service: ProductSalesCountModuleService,
})
