import { MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, isPresent, QueryContext } from "@medusajs/framework/utils";
import { wrapVariantsWithInventoryQuantityForSalesChannel } from "@medusajs/medusa/api/utils/middlewares/index";
import { wrapProductsWithTaxPrices } from "@medusajs/medusa/api/store/products/helpers";
import { StoreRequestWithContext } from "@medusajs/medusa/api/store/types";

type ProductsRequest = StoreRequestWithContext<HttpTypes.StoreProductListParams>;

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

        const matchedIds: string[] = brandMatches.map((product: any) => product.id);

        if (matchedIds.length === 0) {
            return res.json({
                products: [],
                count: 0,
                offset: req.queryConfig.pagination?.skip,
                limit: req.queryConfig.pagination?.take,
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
    } as any);
};
