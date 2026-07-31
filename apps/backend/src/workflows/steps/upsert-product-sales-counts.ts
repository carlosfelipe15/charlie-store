import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { PRODUCT_SALES_COUNT_MODULE } from "../../modules/product-sales-count";
import ProductSalesCountModuleService from "../../modules/product-sales-count/service";

export type ExistingProductSalesCount = {
    id: string;
    product_id: string;
    units_sold: number;
}

export type UpsertProductSalesCountsStepInput = {
    existing: ExistingProductSalesCount[];
    salesCounts: { product_id: string; units_sold: number }[];
}

/**
 * Full recompute upsert: every row in `existing` gets its `units_sold`
 * reset to whatever `salesCounts` says for its product_id — 0 if the
 * product has no entry there anymore (e.g. its only order was canceled
 * since the last run). Products with no existing row are created.
 *
 * MedusaService doesn't generate an `upsert` method, so this is built by
 * hand — one call per row rather than a single bulk statement, acceptable
 * given this catalog's size (see plan doc).
 */
export const upsertProductSalesCountsStep = createStep(
    "upsert-product-sales-counts-step",
    async (input: UpsertProductSalesCountsStepInput, { container }) => {
        const productSalesCountModuleService: ProductSalesCountModuleService =
            container.resolve(PRODUCT_SALES_COUNT_MODULE);

        const salesByProductId = new Map(
            input.salesCounts.map((entry) => [entry.product_id, entry.units_sold])
        );
        const existingProductIds = new Set(input.existing.map((row) => row.product_id));

        const toCreate = input.salesCounts.filter(
            (entry) => !existingProductIds.has(entry.product_id)
        );

        const now = new Date();

        const created = toCreate.length
            ? await productSalesCountModuleService.createProductSalesCounts(
                  toCreate.map((entry) => ({
                      product_id: entry.product_id,
                      units_sold: entry.units_sold,
                      last_calculated_at: now,
                  }))
              )
            : [];

        await Promise.all(
            input.existing.map((row) =>
                productSalesCountModuleService.updateProductSalesCounts({
                    id: row.id,
                    units_sold: salesByProductId.get(row.product_id) ?? 0,
                    last_calculated_at: now,
                })
            )
        );

        return new StepResponse(
            { created, updatedCount: input.existing.length },
            created.map((row) => row.id)
        );
    },
    async (createdIds, { container }) => {
        if (!createdIds || !createdIds.length) {
            return;
        }

        const productSalesCountModuleService: ProductSalesCountModuleService =
            container.resolve(PRODUCT_SALES_COUNT_MODULE);

        await productSalesCountModuleService.deleteProductSalesCounts(createdIds);
    }
)
