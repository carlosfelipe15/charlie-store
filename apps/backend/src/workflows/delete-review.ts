import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { findReviewStep } from "./steps/find-review";
import { deleteReviewStep } from "./steps/delete-review";
import { REVIEW_MODULE } from "../modules/review";

type DeleteReviewWorkflowInput = {
    id: string;
    customer_id: string;
}

// Only the review's author can delete it — ownership check happens in
// find-review-step (throws NOT_ALLOWED on mismatch, NOT_FOUND if the review
// doesn't exist at all). Mirrors delete-favorite/delete-brand: dismiss the
// link first, then delete the row, so a mid-failure never leaves an
// orphaned link.
export const deleteReviewWorkflow = createWorkflow(
    "delete-review",
    function (input: DeleteReviewWorkflowInput) {
        const review = findReviewStep(input);

        dismissRemoteLinkStep([
            {
                [Modules.PRODUCT]: { product_id: review.product_id },
                [REVIEW_MODULE]: { review_id: review.id },
            },
        ])

        deleteReviewStep(review)

        return new WorkflowResponse({ success: true });
    }
)
