import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";

/**
 * Removes the province-level geo zones added by the now-historical
 * `migrate-fulfillment-to-provinces.ts` — inverse of that script. They never
 * did anything: they lived in the SAME service zone as the country-level
 * `cu` geo zone (redundant — Medusa's geo-zone match is OR, so the country
 * zone alone already made the service zone apply everywhere), and their
 * `province_code` (ISO 3166-2:CU, e.g. "cu-03") is matched as an exact
 * string against `cart.shipping_address.province`, which this storefront
 * always fills with the human-readable province name (e.g. "La Habana") —
 * so they could never have matched anything either way. See
 * `.context/geo-zones-fulfillment.md`.
 *
 * Idempotent: safe to re-run — a second pass finds no province geo zones
 * left (Medusa's normal reads exclude soft-deleted rows) and no-ops.
 *
 * Run:  pnpm medusa exec ./src/scripts/remove-inert-province-geo-zones.ts
 */
export default async function removeInertProvinceGeoZones({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: ["id", "name", "geo_zones.id", "geo_zones.type"],
  });

  const provinceGeoZoneIds = (serviceZones as any[]).flatMap((sz) =>
    (sz.geo_zones ?? [])
      .filter((gz: any) => gz.type === "province")
      .map((gz: any) => gz.id)
  );

  if (!provinceGeoZoneIds.length) {
    logger.info("No province geo zones found — nothing to remove.");
    return;
  }

  await fulfillmentModuleService.deleteGeoZones(provinceGeoZoneIds);
  logger.info(
    `Removed ${provinceGeoZoneIds.length} inert province geo zone(s). ` +
      "The country-level 'cu' geo zone (flat shipping, all Cuba) is untouched."
  );
}
