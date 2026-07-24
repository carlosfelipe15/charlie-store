import { MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, isPresent, QueryContext } from "@medusajs/framework/utils";
import { wrapVariantsWithInventoryQuantityForSalesChannel } from "@medusajs/medusa/api/utils/middlewares/index";
import { wrapProductsWithTaxPrices } from "@medusajs/medusa/api/store/products/helpers";
import { StoreRequestWithContext } from "@medusajs/medusa/api/store/types";
import { getZoneEligibleProductIds } from "../../../modules/zone/utils/product-eligibility";

type ProductsRequest = StoreRequestWithContext<HttpTypes.StoreProductListParams>;

function intersectIdArrays(idArrays: string[][]): string[] {
    return idArrays.reduce((acc, ids) => acc.filter((id) => ids.includes(id)));
}

/**
 * `GET /store/products-list` — a parallel endpoint to core's `/store/products`,
 * NOT an override. An override was tried first and abandoned: Medusa's core
 * middleware for `/store/products` GET keeps running even when a project
 * route.ts exists at the same path (route *handlers* replace on matcher
 * collision per RoutesLoader, but middleware files are merely concatenated,
 * not deduped/replaced), so core's own strict Zod schema (which doesn't know
 * about `brand_id`) rejected every filtered request with "Unrecognized
 * fields: brand_id" regardless of what this file did. A new, uncolliding
 * path sidesteps that entirely — same pattern this repo already uses for
 * brands/reviews/favorites (new paths, never overriding a core one).
 *
 * Design: the final product fetch + count/pagination ALWAYS goes through
 * `query.graph()` — never `query.index()`. Only reason to touch the Index
 * Engine at all is that `query.graph()` can't filter by a linked module
 * (brand lives in its own module, see AGENTS.md); when `brand_id` is
 * present, `query.index()` is used ONLY to resolve the matching product ids
 * (a cheap `fields: ["id"]` lookup), which are then intersected into the
 * `id` filter of the real `query.graph()` call.
 *
 * This was NOT the first design tried. The original attempt dispatched
 * unfiltered/brand-only requests through `query.index()` directly (mirroring
 * core's own `getProductsWithIndexEngine`), matching how core behaves with
 * `MEDUSA_FF_INDEX_ENGINE` on. That surfaced two problems: (1) `query.index()`
 * returns `metadata.estimate_count` — a Postgres planner estimate, not an
 * exact count — which was confirmed live to be wildly wrong even right after
 * `ANALYZE` (showed "1" when 9 products actually matched); (2) core's own
 * index-engine dispatch has a real bug — it checks
 * `filterableFields.category_id`/`.tag_id` to decide whether to fall back to
 * query.graph(), but the Zod schema already renames those to
 * `categories`/`tags` before filterableFields is populated, so that check
 * never matches and every category-filtered request 500s once the flag is on
 * (`Could not find entity for path: product.categories. It might not be
 * indexed.`, confirmed live). Routing everything through query.graph() by
 * default sidesteps both: exact counts always, and category filtering never
 * touches the Index Engine's broken dispatch in the first place. See
 * FASE-10 for the full history.
 *
 * `tag_id` (Atributos filter) doesn't need any of this: `product_tag` is a
 * same-module relation on `product` (unlike `brand`, a separate linked
 * module), so it's just a `query.graph()` filter on `filters.tags`, added
 * directly below — no Index Engine resolution step needed.
 *
 * `rating_gte` (Calificación) and `on_sale` (Promociones) have no native
 * Medusa filter/aggregation at all — no avg-by-product query, no
 * belongs-to-active-price-list filter. Both are resolved the same way as
 * `brand_id`: a light query, reduced/filtered in JS, then intersected into
 * `filters.id`. This is the "last resort" JS-filter pattern, justified here
 * only because the catalog is small (order of tens of products, ~130
 * reviews) — see `.context/plans` FASE-10 doc and this feature's plan for
 * why it doesn't scale-generalize past this catalog size.
 */
export const GET = async (req: ProductsRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const context: Record<string, any> = {};

    const withInventoryQuantity = req.queryConfig.fields.some((field: string) =>
        field.includes("variants.inventory_quantity")
    );
    if (withInventoryQuantity) {
        req.queryConfig.fields = req.queryConfig.fields.filter(
            (field: string) => !field.includes("variants.inventory_quantity")
        );
    }

    const pricingContext = req.pricingContext;
    if (isPresent(pricingContext)) {
        context.variants ??= {};
        context.variants.calculated_price ??= QueryContext(pricingContext as Record<string, unknown>);
    }

    const filters: Record<string, any> = { ...req.filterableFields };
    const brandIds = filters.brand_id;
    delete filters.brand_id;
    const tagIds = filters.tag_id;
    delete filters.tag_id;
    const ratingGte = filters.rating_gte;
    delete filters.rating_gte;
    const onSale = filters.on_sale;
    delete filters.on_sale;
    const zoneId = filters.zone_id;
    delete filters.zone_id;
    const includeFacets = filters.include_facets === true;
    delete filters.include_facets;
    // Snapshot of the "scope" filters (category, status, sales channel, q) —
    // everything except the sidebar's own dimensions (brand/tag/rating/on_sale)
    // — used below to compute facet counts that don't collapse to 0 just
    // because a filter in the same dimension is already selected.
    const scopeFilters: Record<string, any> = { ...filters };

    // Resolved once (zone doesn't depend on includeFacets or brand_id/etc.)
    // and reused both for facet counts below and for the main id-intersection
    // pass further down — avoids resolving eligibility twice per request.
    const eligibleProductIds: Set<string> | undefined = isPresent(zoneId)
        ? await getZoneEligibleProductIds(query, zoneId)
        : undefined;

    // Facet counts for the sidebar (`?include_facets=true`) — computed once
    // from `scopeFilters` only (category/status/q), so selecting a brand
    // doesn't zero out every other brand's count. Also scoped to the active
    // delivery zone so a brand with no eligible products in the current zone
    // shows a 0/hidden count instead of a stale catalog-wide one. Same
    // "small catalog, JS last-resort" justification as the rating_gte/on_sale
    // filters above: one extra query.graph() call, in-memory tally, no new
    // aggregation machinery. Costs nothing when the flag isn't set.
    let facets: Record<string, unknown> | undefined;
    if (includeFacets) {
        const [{ data: scopedProductsRaw }, { data: allReviews }] = await Promise.all([
            query.graph({
                entity: "product",
                fields: ["id", "brand.id", "tags.id", "variants.calculated_price.*"],
                filters: scopeFilters,
                pagination: { take: 1000, skip: 0 },
                context,
            }),
            query.graph({
                entity: "review",
                fields: ["product_id", "rating"],
                pagination: { take: 10000, skip: 0 },
            }),
        ]);

        const scopedProducts = eligibleProductIds
            ? (scopedProductsRaw as any[]).filter((product) => eligibleProductIds.has(product.id))
            : (scopedProductsRaw as any[]);

        const scopedIds = new Set((scopedProducts as any[]).map((product) => product.id));

        const ratingTotalsByProduct = new Map<string, { sum: number; count: number }>();
        for (const review of allReviews as any[]) {
            if (!scopedIds.has(review.product_id)) {
                continue;
            }
            const current = ratingTotalsByProduct.get(review.product_id) ?? { sum: 0, count: 0 };
            current.sum += review.rating;
            current.count += 1;
            ratingTotalsByProduct.set(review.product_id, current);
        }

        const brandCounts: Record<string, number> = {};
        const tagCounts: Record<string, number> = {};
        let onSaleCount = 0;

        for (const product of scopedProducts as any[]) {
            if (product.brand?.id) {
                brandCounts[product.brand.id] = (brandCounts[product.brand.id] ?? 0) + 1;
            }
            for (const tag of product.tags ?? []) {
                tagCounts[tag.id] = (tagCounts[tag.id] ?? 0) + 1;
            }
            const isOnSale = (product.variants ?? []).some(
                (variant: any) =>
                    variant.calculated_price?.calculated_price?.price_list_type === "sale"
            );
            if (isOnSale) {
                onSaleCount += 1;
            }
        }

        const ratingCounts = { 5: 0, 4: 0, 3: 0 };
        for (const { sum, count } of ratingTotalsByProduct.values()) {
            const avg = sum / count;
            if (avg >= 5) ratingCounts[5] += 1;
            if (avg >= 4) ratingCounts[4] += 1;
            if (avg >= 3) ratingCounts[3] += 1;
        }

        facets = { brand: brandCounts, tag: tagCounts, rating: ratingCounts, on_sale: onSaleCount };
    }

    if (isPresent(tagIds)) {
        filters.tags = { id: Array.isArray(tagIds) ? tagIds : [tagIds] };
    }

    const matchedIdSets: string[][] = [];

    if (isPresent(brandIds)) {
        const { data: brandMatches } = await query.index({
            entity: "product",
            fields: ["id"],
            filters: { brand: { id: brandIds } },
            // Known limitation: brands assigned to more than 1000 products
            // will be silently truncated here — acceptable for this
            // catalog's size today, documented in FASE-10.
            pagination: { take: 1000, skip: 0 },
        });

        matchedIdSets.push(brandMatches.map((product: any) => product.id));
    }

    if (isPresent(ratingGte)) {
        const { data: reviews } = await query.graph({
            entity: "review",
            fields: ["product_id", "rating"],
            pagination: { take: 10000, skip: 0 },
        });

        const totalsByProduct = new Map<string, { sum: number; count: number }>();
        for (const review of reviews as any[]) {
            const current = totalsByProduct.get(review.product_id) ?? { sum: 0, count: 0 };
            current.sum += review.rating;
            current.count += 1;
            totalsByProduct.set(review.product_id, current);
        }

        const matchedIds = Array.from(totalsByProduct.entries())
            .filter(([, { sum, count }]) => sum / count >= ratingGte)
            .map(([productId]) => productId);

        matchedIdSets.push(matchedIds);
    }

    if (onSale === true) {
        const { data: allProducts } = await query.graph({
            entity: "product",
            fields: ["id", "variants.calculated_price.*"],
            pagination: { take: 1000, skip: 0 },
            context,
        });

        const matchedIds = (allProducts as any[])
            .filter((product) =>
                (product.variants ?? []).some(
                    (variant: any) =>
                        variant.calculated_price?.calculated_price?.price_list_type === "sale"
                )
            )
            .map((product) => product.id);

        matchedIdSets.push(matchedIds);
    }

    // Zone ("Entregar en") filter. Permissive fallback — see
    // `modules/zone/utils/product-eligibility.ts` (shared with the cart
    // eligibility-check endpoint used by the zone-conflict warning).
    // `eligibleProductIds` was already resolved above (also used for facets).
    if (eligibleProductIds) {
        matchedIdSets.push(Array.from(eligibleProductIds));
    }

    if (matchedIdSets.length > 0) {
        const matchedIds = intersectIdArrays(matchedIdSets);

        if (matchedIds.length === 0) {
            return res.json({
                products: [],
                count: 0,
                offset: req.queryConfig.pagination?.skip,
                limit: req.queryConfig.pagination?.take,
                facets,
            } as any);
        }

        filters.id = isPresent(filters.id)
            ? (Array.isArray(filters.id) ? filters.id : [filters.id]).filter((id: string) =>
                  matchedIds.includes(id)
              )
            : matchedIds;
    }

    const { data: products = [], metadata } = await query.graph(
        {
            entity: "product",
            fields: req.queryConfig.fields,
            filters,
            pagination: req.queryConfig.pagination,
            context,
        },
        {
            cache: { enable: true },
            locale: req.locale,
        }
    );

    if (withInventoryQuantity) {
        await wrapVariantsWithInventoryQuantityForSalesChannel(
            req,
            products.map((product: any) => product.variants).flat(1)
        );
    }

    await wrapProductsWithTaxPrices(req, products as unknown as HttpTypes.StoreProduct[]);

    res.json({
        products,
        count: metadata?.count,
        offset: metadata?.skip,
        limit: metadata?.take,
        facets,
    } as any);
};
