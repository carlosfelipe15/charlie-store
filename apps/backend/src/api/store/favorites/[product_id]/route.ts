import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { deleteFavoriteWorkflow } from "../../../../workflows/delete-favorite";

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const customerId = req.auth_context.actor_id;

    await deleteFavoriteWorkflow(req.scope).run({
        input: {
            product_id: req.params.product_id,
            customer_id: customerId,
        },
    })

    res.json({
        product_id: req.params.product_id,
        object: "favorite",
        deleted: true,
    });
}
