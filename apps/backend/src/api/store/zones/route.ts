import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { provinceRank } from "../../../modules/zone/constants";

/**
 * Public, read-only list of delivery zones for the "Entregar en" picker:
 * provinces each with their active municipalities. Sorted by name so the
 * storefront can render the two-step selector directly.
 *
 * No cross-module filtering here (just province → municipalities, same module),
 * so a plain `query.graph()` is enough.
 */

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: provinces } = await query.graph({
    entity: "province",
    fields: [
      "id",
      "name",
      "code",
      "municipalities.id",
      "municipalities.name",
      "municipalities.code",
      "municipalities.is_active",
    ],
    pagination: { take: 100, skip: 0 },
  });

  const result = (provinces as any[])
    .map((province) => ({
      id: province.id,
      name: province.name,
      code: province.code,
      municipalities: (province.municipalities ?? [])
        .filter((m: any) => m.is_active)
        .map((m: any) => ({ id: m.id, name: m.name, code: m.code }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name, "es")),
    }))
    // Provinces in geographic (west → east) order; municipalities stay alphabetical.
    .sort((a, b) => provinceRank(a.code) - provinceRank(b.code));

  res.json({ provinces: result });
};
