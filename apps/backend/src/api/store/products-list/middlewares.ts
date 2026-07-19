import {
    MiddlewareRoute,
    MedusaRequest,
    MedusaResponse,
    MedusaNextFunction,
    authenticate,
    validateAndTransformQuery,
    applyDefaultFilters,
    clearFiltersByKey,
    maybeApplyLinkFilter,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys, isPresent, ProductStatus } from "@medusajs/framework/utils";
import {
    filterByValidSalesChannels,
    normalizeDataForContext,
    setPricingContext,
    setTaxContext,
} from "@medusajs/medusa/api/utils/middlewares/index";
import { listProductQueryConfig } from "@medusajs/medusa/api/store/products/query-config";
import { StoreGetProductsListParams } from "./validators";

/**
 * route.ts always fetches via query.graph() (see its header comment for
 * why), so — like core's own non-index-engine path — a `sales_channel_id`
 * filter can't be applied directly via query.graph() either (it's also a
 * cross-module link, same category of problem as `brand_id`). This mirrors
 * core's `applyMaybeLinkFilterIfNecessary`, minus the index-engine branch
 * (core skips this entirely when the flag is on and no category/tag filter
 * is present — not applicable here since this route never takes that path).
 */
async function applySalesChannelLinkFilter(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    const filterableFields = req.filterableFields as Record<string, unknown>;

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const salesChannelsQueryRes = await query.graph({
        entity: "sales_channels",
        fields: ["id"],
        pagination: { skip: 0, take: 1 },
    });
    const salesChannelCount = salesChannelsQueryRes.metadata?.count ?? 0;

    if (!(salesChannelCount > 1)) {
        delete filterableFields.sales_channel_id;
        return next();
    }

    return maybeApplyLinkFilter({
        entryPoint: "product_sales_channel",
        resourceId: "product_id",
        filterableField: "sales_channel_id",
    })(req, res, next);
}

export const storeProductsWithBrandMiddlewares: MiddlewareRoute[] = [
    {
        method: ["GET"],
        matcher: "/store/products-list",
        middlewares: [
            authenticate("customer", ["session", "bearer"], {
                allowUnauthenticated: true,
            }),
            validateAndTransformQuery(StoreGetProductsListParams, listProductQueryConfig),
            filterByValidSalesChannels(),
            applySalesChannelLinkFilter,
            applyDefaultFilters({
                status: ProductStatus.PUBLISHED,
                categories: (filters: Record<string, any>) => {
                    const categoryIds = filters.category_id;
                    delete filters.category_id;
                    if (!isPresent(categoryIds)) {
                        return;
                    }
                    return { id: categoryIds, is_internal: false, is_active: true };
                },
            }),
            normalizeDataForContext(),
            setPricingContext(),
            setTaxContext(),
            clearFiltersByKey(["region_id", "country_code", "province", "cart_id"]),
        ],
    },
];
