import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import ProductSalesCountModule from "../modules/product-sales-count";

export default defineLink(
    ProductModule.linkable.product,
    {
        linkable: ProductSalesCountModule.linkable.productSalesCount,
        filterable: ["units_sold"],
    }
)
