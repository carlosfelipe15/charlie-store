import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getZoneEligibleProductIds } from "../../../../modules/zone/utils/product-eligibility";
import { PostStoreZoneEligibilityCheckType } from "../validators";

/**
 * Given a zone (municipality) and a set of product ids (the cart's line
 * items), returns which of those ids are NOT available in that zone —
 * powers the soft warning shown when switching the active "Entregar en"
 * zone or the checkout shipping address with items already in the cart.
 * Same permissive-fallback resolution as `/store/products-list`'s
 * `zone_id` filter, scoped to just the given ids (cheap for a cart).
 */
export const POST = async (
    req: MedusaRequest<PostStoreZoneEligibilityCheckType>,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { zone_id, product_ids } = req.validatedBody;

    const eligible = await getZoneEligibleProductIds(query, zone_id, product_ids);
    const ineligible_product_ids = product_ids.filter((id) => !eligible.has(id));

    res.json({ ineligible_product_ids });
};
