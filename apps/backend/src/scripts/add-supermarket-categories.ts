import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

// One-off script for Fase 5: adds the 14 Rodi Mercado categories to a DB that
// already ran the old (4-category) initial-data-seed.ts. Safe to re-run: it
// skips any handle that already exists instead of duplicating.
const NEW_CATEGORIES = [
  { name: "Frutas y verduras", handle: "frescos" },
  { name: "Despensa", handle: "despensa" },
  { name: "Lácteos y huevos", handle: "lacteos-huevos" },
  { name: "Carnes y pescados", handle: "carnes" },
  { name: "Panadería", handle: "panaderia" },
  { name: "Bebidas", handle: "bebidas" },
  { name: "Snacks y dulces", handle: "snacks-dulces" },
  { name: "Congelados", handle: "congelados" },
  { name: "Aseo personal", handle: "aseo-personal" },
  { name: "Limpieza del hogar", handle: "limpieza" },
  { name: "Mascotas", handle: "mascotas" },
  { name: "Bebé", handle: "bebe" },
  { name: "Electrodomésticos", handle: "electrodomesticos" },
  { name: "Farmacia", handle: "farmacia" },
];

export default async function addSupermarketCategories({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["handle"],
    filters: { handle: NEW_CATEGORIES.map((c) => c.handle) },
  });
  const existingHandles = new Set(existing.map((c: any) => c.handle));

  const toCreate = NEW_CATEGORIES.filter(
    (c) => !existingHandles.has(c.handle)
  ).map((c) => ({ ...c, is_active: true }));

  if (!toCreate.length) {
    logger.info(
      "Las 14 categorías de supermercado ya existen. Nada que crear."
    );
    return;
  }

  await createProductCategoriesWorkflow(container).run({
    input: { product_categories: toCreate },
  });

  logger.info(
    `Creadas ${toCreate.length} categorías: ${toCreate
      .map((c) => c.handle)
      .join(", ")}`
  );
  if (existingHandles.size) {
    logger.info(
      `Ya existían (omitidas): ${[...existingHandles].join(", ")}`
    );
  }
}
