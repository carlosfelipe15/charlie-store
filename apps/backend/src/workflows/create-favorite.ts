import { createWorkflow, WorkflowResponse, transform, when } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { findFavoriteStep } from "./steps/find-favorite";
import { createFavoriteStep } from "./steps/create-favorite";
import { validateProductExistsStep } from "./steps/validate-product-exists";
import { FAVORITE_MODULE } from "../modules/favorite";

type CreateFavoriteWorkflowInput = {
    product_id: string;
    customer_id: string;
}

// Idempotent: if the customer already favorited this product, returns the
// existing row instead of creating a duplicate (favorite has a unique
// constraint on product_id+customer_id — see models/favorite.ts).
export const createFavoriteWorkflow = createWorkflow(
    "create-favorite",
    function (input: CreateFavoriteWorkflowInput) {
        validateProductExistsStep(input);

        const existing = findFavoriteStep(input);

        const created = when(existing, (existing) => !existing).then(() => {
            const favorite = createFavoriteStep(input);

            createRemoteLinkStep([
                {
                    [Modules.PRODUCT]: { product_id: input.product_id },
                    [FAVORITE_MODULE]: { favorite_id: favorite.id },
                },
            ])

            return favorite;
        })

        const favorite = transform(
            { existing, created },
            (data) => data.existing ?? data.created
        )

        return new WorkflowResponse(favorite);
    }
)
