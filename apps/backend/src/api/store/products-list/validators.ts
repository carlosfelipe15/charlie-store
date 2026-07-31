import { z } from "zod";
import { StoreGetProductsParams as CoreStoreGetProductsParams } from "@medusajs/medusa/api/store/products/validators";

const BrandIdField = z.union([z.string(), z.array(z.string())]).optional();
const TagIdField = z.union([z.string(), z.array(z.string())]).optional();
// A single municipality id (the "Entregar en" zone). Availability is permissive:
// a product with no zone restriction is shown in every zone (resolved in route.ts).
const ZoneIdField = z.string().optional();
const RatingGteField = z.coerce.number().min(1).max(5).optional();
const OnSaleField = z
    .union([z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "true");
const IncludeFacetsField = z
    .union([z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "true");
// Deliberately not core's `order` param — that's validated against product's
// own real column whitelist, and `best_selling` isn't one (resolved in
// route.ts against the product-sales-count module instead).
const SortByField = z.enum(["best_selling"]).optional();

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
    const { brand_id, tag_id, zone_id, rating_gte, on_sale, include_facets, sort_by, ...rest } = input;

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

    const zoneResult = ZoneIdField.safeParse(zone_id);
    if (!zoneResult.success) {
        zoneResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
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

    const includeFacetsResult = IncludeFacetsField.safeParse(include_facets);
    if (!includeFacetsResult.success) {
        includeFacetsResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
        return z.NEVER;
    }

    const sortByResult = SortByField.safeParse(sort_by);
    if (!sortByResult.success) {
        sortByResult.error.issues.forEach((issue) => ctx.addIssue(issue as z.IssueData));
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
        zone_id: zoneResult.data,
        rating_gte: ratingResult.data,
        on_sale: onSaleResult.data,
        include_facets: includeFacetsResult.data,
        sort_by: sortByResult.data,
    };
});

export type StoreGetProductsListParamsType = z.infer<typeof StoreGetProductsListParams>;
