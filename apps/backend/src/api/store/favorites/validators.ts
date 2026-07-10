import { z } from "zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const PostStoreCreateFavorite = z.object({
    product_id: z.string(),
})

export type PostStoreCreateFavoriteType = z.infer<typeof PostStoreCreateFavorite>;

export const GetStoreFavoritesParams = createFindParams()

export type GetStoreFavoritesParamsType = z.infer<typeof GetStoreFavoritesParams>;
