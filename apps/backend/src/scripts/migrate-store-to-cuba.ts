import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";
import {
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
  updateStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * In-place migration of the store configuration from the stock "Europe" setup to
 * a single-country **Cuba** store, WITHOUT re-seeding.
 *
 * Why in-place instead of a fresh re-seed: a lot of state does not live in
 * `migration-scripts/initial-data-seed.ts` (e.g. the ~48 Rodi Mercado subcategories
 * created via the admin API — see `.context/backlog.md` [DATA/SUBCATEGORIAS]). A fresh
 * re-seed would lose it. This script only repoints region/tax/stock/fulfillment to
 * Cuba and leaves the catalog (products, prices, categories, reviews, brands) untouched.
 *
 * What it does NOT do (deliberately):
 *  - It does NOT touch prices. Currency stays EUR (region) with EUR/USD prices in the
 *    catalog. CUP is not used (product decision, 2026-07-19).
 *  - It does NOT create province/municipality-level geo zones — that is Fase C of the
 *    delivery-zone feature. Here we only ensure the service zone covers Cuba at the
 *    country level so checkout can offer shipping.
 *
 * Idempotent: safe to run repeatedly. Run with the backend able to reach the DB:
 *   pnpm medusa exec ./src/scripts/migrate-store-to-cuba.ts
 *
 * See `.context/plan-zonas-entrega-provincia-municipio.md` (Fase 0).
 */
export default async function migrateStoreToCuba({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  logger.info("Migrating store configuration to Cuba...");

  // 1. Region — repoint the single region's country to Cuba, keep its EUR currency.
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  });

  if (!regions.length) {
    throw new Error(
      "No region found. Run the initial data seed before this migration."
    );
  }

  for (const region of regions) {
    const isoCodes: string[] = (region.countries ?? [])
      .map((c) => c?.iso_2)
      .filter((code): code is string => Boolean(code));
    const alreadyCuba =
      region.name === "Cuba" &&
      isoCodes.length === 1 &&
      isoCodes[0] === "cu";

    if (alreadyCuba) {
      logger.info(`Region "${region.name}" already points to Cuba — skipping.`);
      continue;
    }

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { name: "Cuba", countries: ["cu"] },
      },
    });
    logger.info(
      `Region "${region.name}" -> "Cuba" (countries [${isoCodes.join(
        ", "
      )}] -> [cu], currency kept: ${region.currency_code}).`
    );
  }

  // 2. Tax region for Cuba (idempotent — createTaxRegions would duplicate otherwise).
  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });
  if (taxRegions.some((t: { country_code: string }) => t.country_code === "cu")) {
    logger.info("Tax region for 'cu' already exists — skipping.");
  } else {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "cu", provider_id: "tp_system" }],
    });
    logger.info("Created tax region for 'cu'.");
  }

  // 3. Stock location — relocate the (single) warehouse to Havana. Cosmetic: does not
  //    affect inventory levels, which stay on the same location.
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  for (const loc of locations) {
    if (loc.name === "Almacén Central (La Habana)") {
      logger.info("Stock location already relocated to La Habana — skipping.");
      continue;
    }
    await updateStockLocationsWorkflow(container).run({
      input: {
        selector: { id: loc.id },
        update: {
          name: "Almacén Central (La Habana)",
          address: {
            city: "La Habana",
            country_code: "CU",
            address_1: "",
          },
        },
      },
    });
    logger.info(`Stock location "${loc.name}" -> "Almacén Central (La Habana)".`);
  }

  // 4. Fulfillment — ensure the service zone covers Cuba at the country level so the
  //    checkout offers shipping options for a Cuban address. Province/municipality-level
  //    geo zones (type "province"/"city") are added later in Fase C.
  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: [
      "id",
      "name",
      "geo_zones.id",
      "geo_zones.country_code",
      "geo_zones.type",
    ],
  });
  for (const sz of serviceZones) {
    const coversCuba = (sz.geo_zones ?? []).some(
      (gz: { country_code: string }) => gz.country_code === "cu"
    );
    if (coversCuba) {
      logger.info(`Service zone "${sz.name}" already covers Cuba — skipping.`);
      continue;
    }
    await fulfillmentModuleService.createGeoZones([
      {
        service_zone_id: sz.id,
        country_code: "cu",
        type: "country",
      },
    ]);
    logger.info(
      `Added Cuba ('cu') country geo zone to service zone "${sz.name}".`
    );
  }

  logger.info(
    "Store migration to Cuba complete. Prices remain in EUR/USD (CUP not used)."
  );
  logger.info(
    "Left in place (harmless): old EU tax regions and EU country geo zones. " +
      "Fase C of the delivery-zone feature will refine fulfillment to province/municipality level."
  );
}
