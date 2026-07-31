import { model } from "@medusajs/framework/utils";
import Municipality from "./municipality";

/**
 * A Cuban province (or the special municipality "Isla de la Juventud", modeled
 * as a pseudo-province with a single municipality so the two-level selector
 * stays uniform — see `.context/plans/2026-07-19/plan-zonas-entrega-provincia-municipio.md`).
 *
 * Provinces are the *grouping* level of the "Entregar en" picker; the operative
 * delivery zone is the Municipality. Product availability is linked at the
 * municipality level, not here.
 */
export const Province = model.define("province", {
  id: model.id().primaryKey(),
  name: model.text(),
  code: model.text(),
  // ISO 3166-2:CU subdivision code (e.g. "cu-03" for La Habana) — used by
  // Medusa's fulfillment geo-zones, which match on this exact format, unlike
  // the human-readable `name` stored on addresses. Nullable and backfilled
  // by `scripts/seed-zones.ts`; nothing depends on it being present yet, see
  // `.context/geo-zones-fulfillment.md`.
  iso_code: model.text().nullable(),
  municipalities: model.hasMany(() => Municipality, { mappedBy: "province" }),
});

export default Province;
