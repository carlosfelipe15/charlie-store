import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { PRODUCT_SALES_COUNT_MODULE } from "../../modules/product-sales-count";
import ProductSalesCountModuleService from "../../modules/product-sales-count/service";

export const findExistingProductSalesCountsStep = createStep(
    "find-existing-product-sales-counts-step",
    async (_input: {}, { container }) => {
        const productSalesCountModuleService: ProductSalesCountModuleService =
            container.resolve(PRODUCT_SALES_COUNT_MODULE);

        const existing = await productSalesCountModuleService.listProductSalesCounts(
            {},
            { select: ["id", "product_id", "units_sold"] }
        );

        return new StepResponse(existing);
    }
)
