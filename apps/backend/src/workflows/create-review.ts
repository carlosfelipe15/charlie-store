import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { createReviewStep } from "./steps/create-review";
import { REVIEW_MODULE } from "../modules/review";

type CreateReviewWorkflowInput = {
    product_id: string;
    customer_id: string;
    rating: number;
    title?: string | null;
    body: string;
}

export const createReviewWorkflow = createWorkflow(
    "create-review",
    function (input: CreateReviewWorkflowInput) {
        const review = createReviewStep(input);

        createRemoteLinkStep([
            {
                [Modules.PRODUCT]: { product_id: input.product_id },
                [REVIEW_MODULE]: { review_id: review.id },
            },
        ])

        return new WorkflowResponse(review);
    }
)
