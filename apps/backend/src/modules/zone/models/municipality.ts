import { model } from "@medusajs/framework/utils";
import Province from "./province";

/**
 * A Cuban municipality — the operative delivery zone. Products are linked to the
 * municipalities where they are available (see `src/links/product-municipality.ts`).
 * A product with NO municipality links is available everywhere (permissive
 * fallback, decided 2026-07-19).
 *
 * `is_active` lets a zone be switched off (e.g. no delivery there yet) without
 * deleting it or its product links.
 */
export const Municipality = model.define("municipality", {
  id: model.id().primaryKey(),
  name: model.text(),
  code: model.text(),
  is_active: model.boolean().default(true),
  province: model.belongsTo(() => Province, { mappedBy: "municipalities" }),
});

export default Municipality;
