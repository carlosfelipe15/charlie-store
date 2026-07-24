import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { ZONE_MODULE } from "../../modules/zone";

export type SetProductZonesStepInput = {
  product_id: string;
  municipality_ids: string[];
};

type LinkEntry = {
  [key: string]: { product_id: string } | { municipality_id: string };
};

// Link direction MUST match `src/links/product-municipality.ts`: product first,
// then the zone module's municipality.
function buildLinks(product_id: string, municipalityIds: string[]): LinkEntry[] {
  return municipalityIds.map((municipality_id) => ({
    [Modules.PRODUCT]: { product_id },
    [ZONE_MODULE]: { municipality_id },
  }));
}

/**
 * Reconciles the set of municipalities a product is available in: creates the
 * missing product↔municipality links and dismisses the ones no longer wanted.
 * An empty `municipality_ids` clears all links (product becomes available
 * everywhere again — permissive fallback). Used by the seed and, later, by the
 * admin product widget (Fase D).
 */
export const setProductZonesStep = createStep(
  "set-product-zones-step",
  async (input: SetProductZonesStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "municipalities.id"],
      filters: { id: input.product_id },
    });

    const current: string[] = ((data?.[0] as any)?.municipalities ?? []).map(
      (m: any) => m.id
    );
    const target = Array.from(new Set(input.municipality_ids));

    const toAdd = target.filter((id) => !current.includes(id));
    const toRemove = current.filter((id) => !target.includes(id));

    if (toAdd.length) {
      await link.create(buildLinks(input.product_id, toAdd));
    }
    if (toRemove.length) {
      await link.dismiss(buildLinks(input.product_id, toRemove));
    }

    return new StepResponse(
      { added: toAdd, removed: toRemove },
      { product_id: input.product_id, added: toAdd, removed: toRemove }
    );
  },
  async (undo, { container }) => {
    if (!undo) {
      return;
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    // Reverse: re-create what we removed, dismiss what we added.
    if (undo.removed.length) {
      await link.create(buildLinks(undo.product_id, undo.removed));
    }
    if (undo.added.length) {
      await link.dismiss(buildLinks(undo.product_id, undo.added));
    }
  }
);
