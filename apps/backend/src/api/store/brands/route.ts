import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// Public, read-only listing of brands for the storefront (e.g. brand filter on
// the PLP or the home brands strip). Mirrors the admin GET but exposes only
// store-safe fields via the middleware query config.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")

    const {
        data: brands,
        metadata: { count, take, skip } = {},
    } = await query.graph({
        entity: "brand",
        ...req.queryConfig,
    })

    res.json({
        brands,
        count,
        limit: take,
        offset: skip,
    });
}
