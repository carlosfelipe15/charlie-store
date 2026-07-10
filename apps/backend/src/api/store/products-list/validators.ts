import { z } from "zod";
import { StoreGetProductsParams as CoreStoreGetProductsParams } from "@medusajs/medusa/api/store/products/validators";

const BrandIdField = z.union([z.string(), z.array(z.string())]).optional();

/**
 * Core's StoreGetProductsParams ends in `.strict().transform(...)`, so it
 * can't be `.merge()`d or `.and()`ed with a new field (both reject unknown
 * keys before the intersection ever runs). Instead: strip `brand_id` out of
 * the raw input, validate it separately, validate the rest with the
 * untouched core schema, then recombine — core's own query params (q,
 * category_id, collection_id, variants.*, etc.) keep working exactly as
 * before, brand_id is additive.
 */
export const StoreGetProductsWithBrandParams = z.any().transform((raw, ctx) => {
    const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const { brand_id, ...rest } = input;

    const brandResult = BrandIdField.safeParse(brand_id);
    if (!brandResult.success) {
        brandResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    const coreResult = CoreStoreGetProductsParams.safeParse(rest);
    if (!coreResult.success) {
        coreResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    return { ...(coreResult.data as object), brand_id: brandResult.data };
});

export type StoreGetProductsWithBrandParamsType = z.infer<typeof StoreGetProductsWithBrandParams>;
