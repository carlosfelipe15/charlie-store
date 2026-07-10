import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

export type ValidateProductExistsStepInput = {
    product_id: string;
}

// Shared by create-favorite and create-review: both link to a product_id
// that only gets checked against the DB at link-creation time otherwise
// (module links have no FK constraint), so a typo'd/deleted product_id
// would silently create a dangling favorite/review + orphaned link.
// retrieveProduct throws NOT_FOUND automatically when the id doesn't exist.
export const validateProductExistsStep = createStep(
    "validate-product-exists-step",
    async (input: ValidateProductExistsStepInput, { container }) => {
        const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT);

        await productModuleService.retrieveProduct(input.product_id, {
            select: ["id"],
        });

        return new StepResponse(true);
    }
)
