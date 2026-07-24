import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { setProductZonesWorkflow } from "../../../../../workflows/set-product-zones";
import { PostAdminSetProductZonesType } from "./validators";

/**
 * Product↔municipality assignment for the admin product-detail widget
 * (Fase D) — the reconciliation workflow (`setProductZonesWorkflow`) already
 * existed, only invoked from `scripts/seed-zones.ts` until now.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data } = await query.graph({
        entity: "product",
        fields: ["id", "municipalities.id"],
        filters: { id: req.params.id },
    });

    const municipality_ids = ((data[0] as any)?.municipalities ?? []).map(
        (m: any) => m.id
    );

    res.json({ municipality_ids });
};

export const POST = async (
    req: MedusaRequest<PostAdminSetProductZonesType>,
    res: MedusaResponse
) => {
    const { result } = await setProductZonesWorkflow(req.scope).run({
        input: {
            product_id: req.params.id,
            municipality_ids: req.validatedBody.municipality_ids,
        },
    });

    res.json({ result });
};
