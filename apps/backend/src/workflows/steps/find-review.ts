import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { REVIEW_MODULE } from "../../modules/review";
import ReviewModuleService from "../../modules/review/service";

export type FindReviewStepInput = {
    id: string;
    customer_id: string;
}

// Read-only: retrieveReview throws NOT_FOUND automatically if the id
// doesn't exist. Ownership is checked here too so delete-review-step can
// stay a plain delete (no business logic) once this step has confirmed
// the caller is allowed to remove it.
export const findReviewStep = createStep(
    "find-review-step",
    async (input: FindReviewStepInput, { container }) => {
        const reviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE);

        const review = await reviewModuleService.retrieveReview(input.id);

        if (review.customer_id !== input.customer_id) {
            throw new MedusaError(
                MedusaError.Types.NOT_ALLOWED,
                "You can only delete your own reviews"
            );
        }

        return new StepResponse(review);
    }
)
