import { z } from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const PostStoreCreateReview = z.object({
    product_id: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().optional(),
    body: z.string(),
})

export type PostStoreCreateReviewType = z.infer<typeof PostStoreCreateReview>;

export const GetStoreReviewsParams = createFindParams().extend({
    product_id: z.string().optional(),
})

export type GetStoreReviewsParamsType = z.infer<typeof GetStoreReviewsParams>;
