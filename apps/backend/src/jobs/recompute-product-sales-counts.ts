import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { computeUnitsSoldByProduct } from "../modules/product-sales-count/utils/compute-units-sold";
import { upsertProductSalesCountsWorkflow } from "../workflows/upsert-product-sales-counts";

export default async function recomputeProductSalesCountsJob(
    container: MedusaContainer
) {
    const logger = container.resolve("logger");
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    logger.info("Recomputing product sales counts...");

    try {
        const unitsSoldByProduct = await computeUnitsSoldByProduct(query);

        const salesCounts = Array.from(unitsSoldByProduct.entries()).map(
            ([product_id, units_sold]) => ({ product_id, units_sold })
        );

        await upsertProductSalesCountsWorkflow(container).run({
            input: { salesCounts },
        });

        logger.info(
            `Product sales counts recomputed: ${salesCounts.length} products with sales`
        );
    } catch (error) {
        logger.error(`Product sales counts recompute failed: ${error.message}`);
    }
}

export const config = {
    name: "recompute-product-sales-counts",
    schedule: "0 3 * * *",
};
