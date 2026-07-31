import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";

/**
 * HISTORICAL / SUPERSEDED — do NOT re-run this script.
 *
 * It added province-level geo zones (ISO 3166-2:CU) to the existing Cuba
 * service zone, alongside the country-level `cu` geo zone. That turned out to
 * do nothing: they lived in the SAME service zone as the country geo zone
 * (redundant — Medusa's geo-zone match is OR), and their `province_code` is
 * matched as an exact string against `cart.shipping_address.province`, which
 * the storefront always fills with the human-readable province name (e.g.
 * "La Habana"), never the ISO code (e.g. "cu-03") — so they could never have
 * matched anything either. `apps/backend/src/scripts/remove-inert-province-geo-zones.ts`
 * removes what this script added; `initial-data-seed.ts` no longer creates
 * them for fresh installs. Re-running THIS script would silently reintroduce
 * them. See `.context/geo-zones-fulfillment.md` for the full account and
 * what a real per-province fulfillment model would need.
 *
 * Original docblock, kept for the record:
 *
 * Adds province-level geo zones (ISO 3166-2:CU) to the existing Cuba service
 * zone, alongside the country-level `cu` geo zone created in Fase 0.
 *
 * Why both: delivery is flat and covers all of Cuba (decided 2026-07-21), and
 * the checkout's province field is FREE TEXT (see the storefront address form) —
 * so the country-level `cu` geo zone stays as the robust gate (any Cuban address
 * gets shipping options), while the province geo zones make the fulfillment model
 * province-aware ("por provincia") and ready for future per-province coverage or
 * pricing. See `.context/plans/2026-07-19/plan-zonas-entrega-provincia-municipio.md` (Fase C).
 *
 * Idempotent: provinces already present on the service zone are skipped.
 *
 * Run:  pnpm medusa exec ./src/scripts/migrate-fulfillment-to-provinces.ts
 */

// name → ISO 3166-2:CU subdivision code
const CUBA_PROVINCE_ISO: Record<string, string> = {
  "Pinar del Río": "cu-01",
  "La Habana": "cu-03",
  "Matanzas": "cu-04",
  "Villa Clara": "cu-05",
  "Cienfuegos": "cu-06",
  "Sancti Spíritus": "cu-07",
  "Ciego de Ávila": "cu-08",
  "Camagüey": "cu-09",
  "Las Tunas": "cu-10",
  "Holguín": "cu-11",
  "Granma": "cu-12",
  "Santiago de Cuba": "cu-13",
  "Guantánamo": "cu-14",
  "Artemisa": "cu-15",
  "Mayabeque": "cu-16",
  "Isla de la Juventud": "cu-99",
};

export default async function migrateFulfillmentToProvinces({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  logger.info("Adding province-level geo zones to the Cuba service zone...");

  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: [
      "id",
      "name",
      "geo_zones.id",
      "geo_zones.type",
      "geo_zones.country_code",
      "geo_zones.province_code",
    ],
  });

  if (!serviceZones.length) {
    throw new Error(
      "No service zone found. Run the initial data seed before this migration."
    );
  }

  const isoCodes = Object.values(CUBA_PROVINCE_ISO);

  for (const sz of serviceZones as any[]) {
    const existingProvinceCodes = new Set(
      (sz.geo_zones ?? [])
        .filter((gz: any) => gz.type === "province")
        .map((gz: any) => gz.province_code)
    );

    const toAdd = isoCodes.filter((code) => !existingProvinceCodes.has(code));

    if (!toAdd.length) {
      logger.info(
        `Service zone "${sz.name}" already has all province geo zones — skipping.`
      );
      continue;
    }

    await fulfillmentModuleService.createGeoZones(
      toAdd.map((province_code) => ({
        service_zone_id: sz.id,
        country_code: "cu",
        province_code,
        type: "province" as const,
      }))
    );
    logger.info(
      `Added ${toAdd.length} province geo zones to service zone "${sz.name}".`
    );
  }

  logger.info(
    "Fulfillment is now province-aware. Country-level 'cu' geo zone kept as the robust gate (flat shipping, all Cuba)."
  );
}
