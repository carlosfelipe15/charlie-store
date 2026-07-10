import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { REVIEW_MODULE } from "../../modules/review";
import ReviewModuleService from "../../modules/review/service";

export type DeleteReviewStepInput = {
    id: string;
    product_id: string;
    customer_id: string;
    rating: number;
    title: string | null;
    body: string;
}

export const deleteReviewStep = createStep(
    "delete-review-step",
    async (input: DeleteReviewStepInput, { container }) => {
        const reviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE);

        await reviewModuleService.deleteReviews([input.id]);

        return new StepResponse(input.id, input);
    },
    async (review, { container }) => {
        if (!review) {
            return;
        }

        const reviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE);

        await reviewModuleService.createReviews({
            id: review.id,
            product_id: review.product_id,
            customer_id: review.customer_id,
            rating: review.rating,
            title: review.title,
            body: review.body,
        });
    }
)
