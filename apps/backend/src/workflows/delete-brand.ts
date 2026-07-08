import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { removeRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { BRAND_MODULE } from "../modules/brand";
import { deleteBrandStep } from "./steps/delete-brand";

type DeleteBrandWorkflowInput = {
    id: string;
}

// Mirrors Medusa core's deleteCollectionsWorkflow: product<->brand is a
// module link (not a foreign key), so deleting the brand row alone would
// leave orphaned link rows for any product still pointing at it.
// removeRemoteLinkStep clears those first.
export const deleteBrandWorkflow = createWorkflow(
    "delete-brand",
    function (input: DeleteBrandWorkflowInput) {
        removeRemoteLinkStep({
            [BRAND_MODULE]: { brand_id: input.id },
        });

        const deleted = deleteBrandStep(input);
        return new WorkflowResponse(deleted);
    }
)
