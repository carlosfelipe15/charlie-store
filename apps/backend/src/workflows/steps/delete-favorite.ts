import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { FAVORITE_MODULE } from "../../modules/favorite";
import FavoriteModuleService from "../../modules/favorite/service";

export type DeleteFavoriteStepInput = {
    id: string;
    product_id: string;
    customer_id: string;
}

export const deleteFavoriteStep = createStep(
    "delete-favorite-step",
    async (input: DeleteFavoriteStepInput, { container }) => {
        const favoriteModuleService: FavoriteModuleService = container.resolve(FAVORITE_MODULE);

        await favoriteModuleService.deleteFavorites([input.id]);

        return new StepResponse(input.id, input);
    },
    async (favorite, { container }) => {
        if (!favorite) {
            return;
        }

        const favoriteModuleService: FavoriteModuleService = container.resolve(FAVORITE_MODULE);

        await favoriteModuleService.createFavorites({
            id: favorite.id,
            product_id: favorite.product_id,
            customer_id: favorite.customer_id,
        });
    }
)
