import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "../../modules/brand";
import BrandModuleService from "../../modules/brand/service";

export type DeleteBrandStepInput = {
    id: string;
}

export const deleteBrandStep = createStep(
    "delete-brand-step",
    async (input: DeleteBrandStepInput, { container }) => {
        const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

        const brand = await brandModuleService.retrieveBrand(input.id);

        await brandModuleService.deleteBrands([input.id]);

        return new StepResponse(input.id, brand);
    },
    async (brand, { container }) => {
        if (!brand) {
            return;
        }

        const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

        await brandModuleService.createBrands({ id: brand.id, name: brand.name });
    }
)
