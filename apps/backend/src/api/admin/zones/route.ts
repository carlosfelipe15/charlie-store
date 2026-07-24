import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { provinceRank } from "../../../modules/zone/constants";

/**
 * Admin mirror of `/store/zones` (same province→municipality shape, same
 * geographic sort) — used by the product-zones widget to render the
 * assignment checkboxes. Kept as a separate file rather than reusing the
 * store route: the admin SDK client authenticates by session cookie and
 * doesn't send the publishable-key header `/store/*` routes expect, so
 * crossing that boundary would be the wrong move even if it worked by
 * accident (same pattern this repo already uses for `/admin/brands` vs.
 * `/store/brands`).
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
    .sort((a, b) => provinceRank(a.code) - provinceRank(b.code));

  res.json({ provinces: result });
};
