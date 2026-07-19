import { z } from "zod";
import { StoreGetProductsParams as CoreStoreGetProductsParams } from "@medusajs/medusa/api/store/products/validators";

const BrandIdField = z.union([z.string(), z.array(z.string())]).optional();
const TagIdField = z.union([z.string(), z.array(z.string())]).optional();
const RatingGteField = z.coerce.number().min(1).max(5).optional();
const OnSaleField = z
    .union([z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "true");

/**
 * Core's StoreGetProductsParams ends in `.strict().transform(...)`, so it
 * can't be `.merge()`d or `.and()`ed with new fields (both reject unknown
 * keys before the intersection ever runs). Instead: strip the custom fields
 * out of the raw input, validate them separately, validate the rest with the
 * untouched core schema, then recombine — core's own query params (q,
 * category_id, collection_id, variants.*, etc.) keep working exactly as
 * before, the custom fields are additive.
 */
export const StoreGetProductsListParams = z.any().transform((raw, ctx) => {
    const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const { brand_id, tag_id, rating_gte, on_sale, ...rest } = input;

    const brandResult = BrandIdField.safeParse(brand_id);
    if (!brandResult.success) {
        brandResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    const tagResult = TagIdField.safeParse(tag_id);
    if (!tagResult.success) {
        tagResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    const ratingResult = RatingGteField.safeParse(rating_gte);
    if (!ratingResult.success) {
        ratingResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    const onSaleResult = OnSaleField.safeParse(on_sale);
    if (!onSaleResult.success) {
        onSaleResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    const coreResult = CoreStoreGetProductsParams.safeParse(rest);
    if (!coreResult.success) {
        coreResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    return {
        ...(coreResult.data as object),
        brand_id: brandResult.data,
        tag_id: tagResult.data,
        rating_gte: ratingResult.data,
        on_sale: onSaleResult.data,
    };
});

export type StoreGetProductsListParamsType = z.infer<typeof StoreGetProductsListParams>;
