import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PostAdminUpdateBrandType } from "../validators";
import { updateBrandWorkflow } from "../../../../workflows/update-brand";
import { deleteBrandWorkflow } from "../../../../workflows/delete-brand";

export const POST = async (
    req: MedusaRequest<PostAdminUpdateBrandType>,
    res: MedusaResponse
) => {
    const { result } = await updateBrandWorkflow(req.scope).run({
        input: { id: req.params.id, ...req.validatedBody },
    })

    res.json({ brand: result });
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    await deleteBrandWorkflow(req.scope).run({
        input: { id: req.params.id },
    })

    res.json({
        id: req.params.id,
        object: "brand",
        deleted: true,
    });
}
