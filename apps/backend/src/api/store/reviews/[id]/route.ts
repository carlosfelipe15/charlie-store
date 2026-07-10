import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { deleteReviewWorkflow } from "../../../../workflows/delete-review";

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const customerId = req.auth_context.actor_id;

    await deleteReviewWorkflow(req.scope).run({
        input: {
            id: req.params.id,
            customer_id: customerId,
        },
    })

    res.json({
        id: req.params.id,
        object: "review",
        deleted: true,
    });
}
