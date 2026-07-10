import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { PostStoreCreateFavoriteType } from "./validators";
import { createFavoriteWorkflow } from "../../../workflows/create-favorite";

export const POST = async (
    req: AuthenticatedMedusaRequest<PostStoreCreateFavoriteType>,
    res: MedusaResponse
) => {
    const customerId = req.auth_context.actor_id;

    const { result } = await createFavoriteWorkflow(req.scope).run({
        input: {
            product_id: req.validatedBody.product_id,
            customer_id: customerId,
        },
    })

    res.json({ favorite: result });
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")
    const customerId = req.auth_context.actor_id;

    const {
        data: favorites,
        metadata: { count, take, skip } = {},
    } = await query.graph({
        entity: "favorite",
        filters: { customer_id: customerId },
        ...req.queryConfig,
    })

    res.json({
        favorites,
        count,
        limit: take,
        offset: skip,
    });
}
