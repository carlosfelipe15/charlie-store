import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { FAVORITE_MODULE } from "../../modules/favorite";
import FavoriteModuleService from "../../modules/favorite/service";

export type FindFavoriteStepInput = {
    product_id: string;
    customer_id: string;
}

export const findFavoriteStep = createStep(
    "find-favorite-step",
    async (input: FindFavoriteStepInput, { container }) => {
        const favoriteModuleService: FavoriteModuleService = container.resolve(FAVORITE_MODULE);

        const [favorite] = await favoriteModuleService.listFavorites({
            product_id: input.product_id,
            customer_id: input.customer_id,
        });

        return new StepResponse(favorite ?? null);
    }
)
