import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createZonesWorkflow } from "../workflows/create-zones";
import { setProductZonesWorkflow } from "../workflows/set-product-zones";
import { CUBA_PROVINCE_ISO_CODE } from "../modules/zone/constants";
import { ZONE_MODULE } from "../modules/zone";
import ZoneModuleService from "../modules/zone/service";

/**
 * Seeds Cuba's delivery zones: the 15 provinces + "Isla de la Juventud" (a
 * special municipality with no province, modeled here as a pseudo-province of a
 * single municipality so the Province → Municipality selector stays uniform —
 * see `.context/plan-zonas-entrega-provincia-municipio.md`).
 *
 * Municipality list follows the standard ONEI political division (168 municipios
 * incl. Isla de la Juventud). If exact precision matters, re-validate against an
 * ONEI source before production.
 *
 * Idempotent: provinces already present (matched by `code`) are skipped.
 *
 * NO reindex needed after this (unlike brand seeding): the zone filter on
 * `/store/products-list` uses `query.graph()`, not the Index Engine.
 *
 * Run:  pnpm medusa exec ./src/scripts/seed-zones.ts
 */

type ProvinceSeed = { name: string; code: string; municipalities: string[] };

const PROVINCES: ProvinceSeed[] = [
  {
    name: "Pinar del Río",
    code: "PRI",
    municipalities: [
      "Consolación del Sur", "Guane", "La Palma", "Los Palacios", "Mantua",
      "Minas de Matahambre", "Pinar del Río", "San Juan y Martínez", "San Luis",
      "Sandino", "Viñales",
    ],
  },
  {
    name: "Artemisa",
    code: "ART",
    municipalities: [
      "Alquízar", "Artemisa", "Bahía Honda", "Bauta", "Caimito", "Candelaria",
      "Guanajay", "Güira de Melena", "Mariel", "San Antonio de los Baños",
      "San Cristóbal",
    ],
  },
  {
    name: "La Habana",
    code: "LHA",
    municipalities: [
      "Arroyo Naranjo", "Boyeros", "Centro Habana", "Cerro", "Cotorro",
      "Diez de Octubre", "Guanabacoa", "Habana del Este", "Habana Vieja",
      "La Lisa", "Marianao", "Playa", "Plaza de la Revolución", "Regla",
      "San Miguel del Padrón",
    ],
  },
  {
    name: "Mayabeque",
    code: "MAY",
    municipalities: [
      "Batabanó", "Bejucal", "Güines", "Jaruco", "Madruga", "Melena del Sur",
      "Nueva Paz", "Quivicán", "San José de las Lajas", "San Nicolás",
      "Santa Cruz del Norte",
    ],
  },
  {
    name: "Matanzas",
    code: "MTZ",
    municipalities: [
      "Calimete", "Cárdenas", "Ciénaga de Zapata", "Colón", "Jagüey Grande",
      "Jovellanos", "Limonar", "Los Arabos", "Martí", "Matanzas",
      "Pedro Betancourt", "Perico", "Unión de Reyes",
    ],
  },
  {
    name: "Cienfuegos",
    code: "CFG",
    municipalities: [
      "Abreus", "Aguada de Pasajeros", "Cienfuegos", "Cruces", "Cumanayagua",
      "Palmira", "Rodas", "Santa Isabel de las Lajas",
    ],
  },
  {
    name: "Villa Clara",
    code: "VCL",
    municipalities: [
      "Caibarién", "Camajuaní", "Cifuentes", "Corralillo", "Encrucijada",
      "Manicaragua", "Placetas", "Quemado de Güines", "Ranchuelo", "Remedios",
      "Sagua la Grande", "Santa Clara", "Santo Domingo",
    ],
  },
  {
    name: "Sancti Spíritus",
    code: "SSP",
    municipalities: [
      "Cabaiguán", "Fomento", "Jatibonico", "La Sierpe", "Sancti Spíritus",
      "Taguasco", "Trinidad", "Yaguajay",
    ],
  },
  {
    name: "Ciego de Ávila",
    code: "CAV",
    municipalities: [
      "Baraguá", "Bolivia", "Chambas", "Ciego de Ávila", "Ciro Redondo",
      "Florencia", "Majagua", "Morón", "Primero de Enero", "Venezuela",
    ],
  },
  {
    name: "Camagüey",
    code: "CMG",
    municipalities: [
      "Camagüey", "Carlos Manuel de Céspedes", "Esmeralda", "Florida",
      "Guáimaro", "Jimaguayú", "Minas", "Najasa", "Nuevitas",
      "Santa Cruz del Sur", "Sibanicú", "Sierra de Cubitas", "Vertientes",
    ],
  },
  {
    name: "Las Tunas",
    code: "LTU",
    municipalities: [
      "Amancio", "Colombia", "Jesús Menéndez", "Jobabo", "Las Tunas",
      "Majibacoa", "Manatí", "Puerto Padre",
    ],
  },
  {
    name: "Holguín",
    code: "HOL",
    municipalities: [
      "Antilla", "Báguanos", "Banes", "Cacocum", "Calixto García", "Cueto",
      "Frank País", "Gibara", "Holguín", "Mayarí", "Moa", "Rafael Freyre",
      "Sagua de Tánamo", "Urbano Noris",
    ],
  },
  {
    name: "Granma",
    code: "GRM",
    municipalities: [
      "Bartolomé Masó", "Bayamo", "Buey Arriba", "Campechuela", "Cauto Cristo",
      "Guisa", "Jiguaní", "Manzanillo", "Media Luna", "Niquero", "Pilón",
      "Río Cauto", "Yara",
    ],
  },
  {
    name: "Santiago de Cuba",
    code: "SCU",
    municipalities: [
      "Contramaestre", "Guamá", "Mella", "Palma Soriano", "San Luis",
      "Santiago de Cuba", "Segundo Frente", "Songo-La Maya", "Tercer Frente",
    ],
  },
  {
    name: "Guantánamo",
    code: "GTM",
    municipalities: [
      "Baracoa", "Caimanera", "El Salvador", "Guantánamo", "Imías", "Maisí",
      "Manuel Tames", "Niceto Pérez", "San Antonio del Sur", "Yateras",
    ],
  },
  {
    // Special municipality with no province — modeled as a pseudo-province.
    name: "Isla de la Juventud",
    code: "IJV",
    municipalities: ["Isla de la Juventud"],
  },
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function seedZones({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding Cuba delivery zones (provinces + municipalities)...");

  // 1. Create provinces not already present (idempotent by province code).
  const { data: existingProvinces } = await query.graph({
    entity: "province",
    fields: ["id", "code"],
    pagination: { take: 1000, skip: 0 },
  });
  const existingCodes = new Set(
    (existingProvinces as any[]).map((p) => p.code)
  );

  const toCreate = PROVINCES.filter((p) => !existingCodes.has(p.code)).map(
    (p) => ({
      name: p.name,
      code: p.code,
      iso_code: CUBA_PROVINCE_ISO_CODE[p.code],
      municipalities: p.municipalities.map((name) => ({
        name,
        code: `${p.code}-${slugify(name)}`,
      })),
    })
  );

  if (toCreate.length) {
    await createZonesWorkflow(container).run({ input: { provinces: toCreate } });
    const muniCount = toCreate.reduce(
      (sum, p) => sum + p.municipalities.length,
      0
    );
    logger.info(
      `Created ${toCreate.length} provinces and ${muniCount} municipalities.`
    );
  } else {
    logger.info("All provinces already present — skipping zone creation.");
  }

  // 1b. Backfill `iso_code` on provinces that already existed before this
  // field was introduced (the create path above only sets it on new rows).
  const zoneService: ZoneModuleService = container.resolve(ZONE_MODULE);
  const { data: provincesNeedingIsoCode } = await query.graph({
    entity: "province",
    fields: ["id", "code", "iso_code"],
    pagination: { take: 1000, skip: 0 },
  });
  const staleProvinces = (provincesNeedingIsoCode as any[]).filter(
    (p) => !p.iso_code && CUBA_PROVINCE_ISO_CODE[p.code]
  );
  if (staleProvinces.length) {
    await Promise.all(
      staleProvinces.map((p) =>
        zoneService.updateProvinces({
          id: p.id,
          iso_code: CUBA_PROVINCE_ISO_CODE[p.code],
        })
      )
    );
    logger.info(`Backfilled iso_code on ${staleProvinces.length} province(s).`);
  }

  // 2. Assign a couple of products to specific zones so the permissive filter is
  //    testable: these become "available only in La Habana"; every other product
  //    (no links) stays available everywhere.
  const { data: habanaRows } = await query.graph({
    entity: "province",
    fields: ["id", "name", "municipalities.id", "municipalities.name"],
    filters: { code: "LHA" },
  });
  const habanaMunicipalities: { id: string; name: string }[] =
    (habanaRows?.[0] as any)?.municipalities ?? [];
  const habanaIds = habanaMunicipalities.map((m) => m.id);

  const { data: sampleProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
    pagination: { take: 2, skip: 0 },
    filters: { status: "published" },
  });

  if (habanaIds.length && (sampleProducts as any[]).length) {
    for (const product of sampleProducts as any[]) {
      await setProductZonesWorkflow(container).run({
        input: { product_id: product.id, municipality_ids: habanaIds },
      });
      logger.info(
        `Restricted "${product.title}" to La Habana (${habanaIds.length} municipalities).`
      );
    }
  }

  logger.info(
    "Zone seeding complete. NOTE: no reindex needed — the zone filter uses query.graph(), not the Index Engine."
  );
  if (habanaMunicipalities.length) {
    const sample = habanaMunicipalities[0];
    logger.info(
      `Test hint: GET /store/products-list?zone_id=${sample.id} (${sample.name}, La Habana) shows all products incl. the restricted ones; a municipality from another province shows all EXCEPT the restricted ones.`
    );
  }
}
