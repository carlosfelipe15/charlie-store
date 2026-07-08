import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import { BRAND_MODULE } from "../../modules/brand";
import BrandModuleService from "../../modules/brand/service";
import { LinkDefinition } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

// Mirrors created-product.ts, but for updates: createProductsWorkflow's hook
// only fires on creation, so reassigning/clearing a brand on an existing
// product needs its own hook on updateProductsWorkflow.
type UpdatedProductBrandCompensation = {
  dismissed: LinkDefinition[];
  created: LinkDefinition[];
};

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    if (additional_data?.brand_id === undefined) {
      return new StepResponse(undefined, undefined);
    }

    const link = container.resolve("link");
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: currentProducts } = await query.graph({
      entity: "product",
      fields: ["id", "brand.id"],
      filters: { id: products.map((p) => p.id) },
    });

    const dismissed: LinkDefinition[] = currentProducts
      .filter((p: any) => p.brand?.id)
      .map((p: any) => ({
        [Modules.PRODUCT]: { product_id: p.id },
        [BRAND_MODULE]: { brand_id: p.brand.id },
      }));

    if (dismissed.length) {
      await link.dismiss(dismissed);
    }

    const created: LinkDefinition[] = [];
    if (additional_data.brand_id) {
      const brandModuleService: BrandModuleService =
        container.resolve(BRAND_MODULE);
      await brandModuleService.retrieveBrand(
        additional_data.brand_id as string
      );

      for (const product of products) {
        created.push({
          [Modules.PRODUCT]: { product_id: product.id },
          [BRAND_MODULE]: { brand_id: additional_data.brand_id },
        });
      }
      await link.create(created);
    }

    return new StepResponse<
      LinkDefinition[],
      UpdatedProductBrandCompensation
    >(created, { dismissed, created });
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return;
    }
    const link = container.resolve("link");
    if (compensation.created.length) {
      await link.dismiss(compensation.created);
    }
    if (compensation.dismissed.length) {
      await link.create(compensation.dismissed);
    }
  }
);
