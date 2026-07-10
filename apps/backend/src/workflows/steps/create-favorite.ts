import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { FAVORITE_MODULE } from "../../modules/favorite";
import FavoriteModuleService from "../../modules/favorite/service";

export type CreateFavoriteStepInput = {
    product_id: string;
    customer_id: string;
}

export const createFavoriteStep = createStep(
    "create-favorite-step",
     async (input: CreateFavoriteStepInput, { container }) => {
        const favoriteModuleService: FavoriteModuleService = container.resolve(FAVORITE_MODULE);

        const favorite = await favoriteModuleService.createFavorites(input);

        return new StepResponse(favorite, favorite.id);
     },
     async (favoriteId, { container }) => {
        if (!favoriteId) {
            return;
        }

        const favoriteModuleService: FavoriteModuleService = container.resolve(FAVORITE_MODULE);

        await favoriteModuleService.deleteFavorites(favoriteId);
     }
)
