import {
    AuthenticatedMedusaRequest,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { PostStoreCreateReviewType } from "./validators";
import { createReviewWorkflow } from "../../../workflows/create-review";

export const POST = async (
    req: AuthenticatedMedusaRequest<PostStoreCreateReviewType>,
    res: MedusaResponse
) => {
    const customerId = req.auth_context.actor_id;

    const { result } = await createReviewWorkflow(req.scope).run({
        input: {
            ...req.validatedBody,
            customer_id: customerId,
        },
    })

    res.json({ review: result });
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")

    const productId = req.validatedQuery?.product_id as string | undefined;

    const {
        data: reviews,
        metadata: { count, take, skip } = {},
    } = await query.graph({
        entity: "review",
        ...(productId
            ? { filters: { product_id: productId } }
            : {}),
        ...req.queryConfig,
    })

    res.json({
        reviews,
        count,
        limit: take,
        offset: skip,
    });
}
