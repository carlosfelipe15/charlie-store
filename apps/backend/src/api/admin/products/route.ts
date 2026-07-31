import { MedusaRequest, MedusaResponse, refetchEntities } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, isPresent } from "@medusajs/framework/utils";
import { remapKeysForProduct, remapProductResponse } from "@medusajs/medusa/api/admin/products/helpers";

/**
 * Override of ONLY the core `GET /admin/products` handler — POST and every
 * other route under this file tree ([id], batch, export, import, imports)
 * are untouched. Medusa's RoutesLoader keys registered routes by
 * (matcher, method), and a route registered later (project dir, scanned
 * after core) replaces only the same (matcher, method) pair — see
 * `RoutesLoader.registerRoute` in `@medusajs/framework/http/routes-loader.js`.
 * Core's validation middleware for this matcher (which populates
 * `req.filterableFields`/`req.queryConfig`) is untouched too — middleware
 * files are concatenated, not replaced — so this handler can rely on the
 * same request shape core's own handler does.
 *
 * Fixes `[BUG/ADMIN-INDEX]` (.context/backlog.md): core's
 * `getProductsWithIndexEngine` (dist/api/admin/products/route.js) reports
 * `count: metadata.estimate_count` whenever any filter is present (status,
 * q, sales_channel_id, price_list_id) and the Index Engine flag is on
 * (`MEDUSA_FF_INDEX_ENGINE=true`, required in this repo for `query.index()`
 * — see "Índice de búsqueda cross-módulo" in AGENTS.md). `estimate_count` is
 * a Postgres planner estimate, not an exact row count, and was confirmed
 * live to be far off even right after `ANALYZE` (29 vs 54 real rows).
 * Product *data* was never wrong — a large enough `limit` always returned
 * every row — only the reported `count` was, which breaks admin pagination
 * math and can hide real products outside the (mis-sized) visible page
 * range. Unfiltered requests were never affected: core only dispatches to
 * the Index Engine when `req.filterableFields` is non-empty.
 *
 * Fix: always use `refetchEntities` (the same `query.graph()`-backed helper
 * core itself already uses for its "no filters" fallback), never
 * `query.index()`, so `count` is always exact. Mirrors the reasoning
 * already applied to the storefront's own `/store/products-list` override:
 * "routing everything through query.graph() by default... exact counts
 * always" — this catalog is small (tens of products), so skipping the
 * Index Engine's performance benefit here costs nothing.
 *
 * Exception: `price_list_id` (admin Price Lists page). `price_list_id` is
 * not a field of the ProductModule — it only exists in the PricingModule,
 * linked to product_variant — so `query.graph()` can't filter by it at all
 * (that's the "filtering across linked modules" limitation, same reason
 * brand_id needs the Index Engine in /store/products-list). Core handles it
 * only in `getProductsWithIndexEngine`, by rewriting the filter to
 * `variants.prices.price_list_id` before `query.index()`. That branch is
 * replicated in the handler below, but scoped the way /store/products-list
 * does it: `query.index()` resolves the matching product ids only, and the
 * final fetch stays on `query.graph()` so `count` remains exact.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const selectFields = remapKeysForProduct(req.queryConfig.fields ?? []);

    // `price_list_id` is NOT a filterable field of the ProductModule (prices
    // live in the PricingModule, linked to product_variant) — passing it
    // straight to `query.graph()` is what made the admin's Price Lists page
    // 500 with "An unknown error occurred." (MikroORM: property
    // `price_list_id` does not exist on `product`). Core only supports it
    // through the Index Engine, which rewrites the filter to
    // `variants.prices.price_list_id` before `query.index()`. Replicate that
    // here for this one filter, but follow the same pattern as
    // `/store/products-list`: `query.index()` is used ONLY to resolve the
    // matching product ids, and the final fetch/count/pagination always goes
    // through `query.graph()` (via `refetchEntities`) so `count` stays exact
    // — never `metadata.estimate_count` (see [BUG/ADMIN-INDEX] above).
    if (isPresent(req.filterableFields.price_list_id)) {
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
        const filters: Record<string, any> = { ...req.filterableFields };
        const priceListIds = filters.price_list_id;
        const salesChannelIds = filters.sales_channel_id;
        delete filters.price_list_id;
        delete filters.sales_channel_id;

        const { data: matches } = await query.index({
            entity: "product",
            fields: ["id"],
            filters: {
                ...(isPresent(salesChannelIds)
                    ? { sales_channels: { id: salesChannelIds } }
                    : {}),
                variants: {
                    prices: {
                        price_list_id: priceListIds,
                    },
                },
            },
            // Same documented truncation caveat as /store/products-list:
            // price lists above 1000 products would be silently capped.
            pagination: { take: 1000, skip: 0 },
        });

        if (matches.length === 0) {
            return res.json({
                products: [],
                count: 0,
                offset: req.queryConfig.pagination?.skip,
                limit: req.queryConfig.pagination?.take,
            });
        }

        filters.id = isPresent(filters.id)
            ? (Array.isArray(filters.id) ? filters.id : [filters.id]).filter(
                  (id: string) => matches.some((match: any) => match.id === id)
              )
            : matches.map((match: any) => match.id);

        const { data: products, metadata } = await refetchEntities({
            entity: "product",
            idOrFilter: filters,
            scope: req.scope,
            fields: selectFields,
            pagination: req.queryConfig.pagination,
            withDeleted: req.queryConfig.withDeleted,
        });

        return res.json({
            products: (products as any[]).map(remapProductResponse),
            count: metadata.count,
            offset: metadata.skip,
            limit: metadata.take,
        });
    }

    const { data: products, metadata } = await refetchEntities({
        entity: "product",
        idOrFilter: req.filterableFields,
        scope: req.scope,
        fields: selectFields,
        pagination: req.queryConfig.pagination,
        withDeleted: req.queryConfig.withDeleted,
    });

    res.json({
        products: (products as any[]).map(remapProductResponse),
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
