import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { findExistingProductSalesCountsStep } from "./steps/find-existing-product-sales-counts";
import { upsertProductSalesCountsStep } from "./steps/upsert-product-sales-counts";
import { PRODUCT_SALES_COUNT_MODULE } from "../modules/product-sales-count";

type UpsertProductSalesCountsWorkflowInput = {
    salesCounts: { product_id: string; units_sold: number }[];
}

/**
 * Full recompute of every product's units-sold count, run daily by
 * `jobs/recompute-product-sales-counts.ts`. Reconciles the persisted
 * `product_sales_count` table against a freshly aggregated `salesCounts`
 * snapshot (see `modules/product-sales-count/utils/compute-units-sold.ts`):
 * creates rows for products with no prior sales, resets rows that no
 * longer appear in the aggregation back to 0 (e.g. their only order was
 * canceled since the last run), and updates the rest.
 */
export const upsertProductSalesCountsWorkflow = createWorkflow(
    "upsert-product-sales-counts",
    function (input: UpsertProductSalesCountsWorkflowInput) {
        const existing = findExistingProductSalesCountsStep();

        const upsertInput = transform({ input, existing }, (data) => ({
            existing: data.existing,
            salesCounts: data.input.salesCounts,
        }));

        const result = upsertProductSalesCountsStep(upsertInput);

        // Link only the rows created in this run — updated rows already have
        // their link from a previous run.
        const linkData = transform({ result }, (data) =>
            data.result.created.map((row: { id: string; product_id: string }) => ({
                [Modules.PRODUCT]: { product_id: row.product_id },
                [PRODUCT_SALES_COUNT_MODULE]: { product_sales_count_id: row.id },
            }))
        );

        createRemoteLinkStep(linkData);

        return new WorkflowResponse(result);
    }
)
