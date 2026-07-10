import { createWorkflow, WorkflowResponse, when } from "@medusajs/framework/workflows-sdk";
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { findFavoriteStep } from "./steps/find-favorite";
import { deleteFavoriteStep } from "./steps/delete-favorite";
import { FAVORITE_MODULE } from "../modules/favorite";

type DeleteFavoriteWorkflowInput = {
    product_id: string;
    customer_id: string;
}

// Idempotent: no-ops if the customer never favorited this product (no
// matching row to delete), so repeated DELETE calls never error.
export const deleteFavoriteWorkflow = createWorkflow(
    "delete-favorite",
    function (input: DeleteFavoriteWorkflowInput) {
        const favorite = findFavoriteStep(input);

        when(favorite, (favorite) => !!favorite).then(() => {
            // Mirrors delete-brand: dismiss the link first, then delete the
            // row, so a mid-failure never leaves an orphaned link.
            dismissRemoteLinkStep([
                {
                    [Modules.PRODUCT]: { product_id: input.product_id },
                    [FAVORITE_MODULE]: { favorite_id: favorite.id },
                },
            ])

            deleteFavoriteStep(favorite)
        })

        return new WorkflowResponse({ success: true });
    }
)
