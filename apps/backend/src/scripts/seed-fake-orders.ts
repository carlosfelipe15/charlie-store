import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createOrderWorkflow } from "@medusajs/medusa/core-flows";
import { computeUnitsSoldByProduct } from "../modules/product-sales-count/utils/compute-units-sold";
import { upsertProductSalesCountsWorkflow } from "../workflows/upsert-product-sales-counts";

/**
 * Idempotent seed of a handful of real orders (`createOrderWorkflow`, left in
 * status "pending" — the real default a checkout leaves behind, NOT
 * "completed") with deliberately uneven quantities across a few existing
 * products, so "Más vendidos" has real data to demonstrate without waiting
 * for the daily recompute job/cron. Safe to re-run: every order is tagged
 * with a fixed, recognizable email; if an order with that email already
 * exists, order seeding is skipped (the recompute below still runs).
 *
 * Run: pnpm medusa exec ./src/scripts/seed-fake-orders.ts
 */

const SEED_EMAIL = "seed-fake-orders@charliestore.test";

// Deliberately uneven so the resulting ranking is visibly different from a
// created_at sort.
const QUANTITIES = [12, 8, 5, 3, 1];

export default async function seedFakeOrders({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existingOrders } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { email: SEED_EMAIL },
  });

  if (existingOrders.length > 0) {
    logger.info(
      `${existingOrders.length} orden(es) ya sembradas con "${SEED_EMAIL}" — no se crean de nuevo.`
    );
  } else {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code", "countries.iso_2"],
    });
    const region = regions[0] as any;
    if (!region) {
      throw new Error("No hay region en la BD. Correr primero el seed inicial.");
    }
    const countryCode = (region.countries ?? [])[0]?.iso_2 ?? "cu";

    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    });
    const salesChannel =
      (salesChannels as any[]).find((sc) => sc.name === "Default Sales Channel") ??
      salesChannels[0];
    if (!salesChannel) {
      throw new Error("No hay sales channel en la BD. Correr primero el seed inicial.");
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "variants.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      pagination: { take: 20, skip: 0, order: { handle: "ASC" } },
    });

    const eligible = (products as any[])
      .map((product) => {
        const price = (product.variants ?? [])
          .flatMap((v: any) => v.prices ?? [])
          .find((p: any) => p.currency_code === region.currency_code);
        return price ? { product, unitPrice: price.amount } : null;
      })
      .filter((entry): entry is { product: any; unitPrice: number } => entry !== null)
      .slice(0, QUANTITIES.length);

    if (eligible.length === 0) {
      logger.warn("No hay productos con precio para sembrar órdenes de prueba. Saltando.");
    }

    for (let i = 0; i < eligible.length; i++) {
      const { product, unitPrice } = eligible[i];
      const quantity = QUANTITIES[i];

      await createOrderWorkflow(container).run({
        input: {
          region_id: region.id,
          sales_channel_id: salesChannel.id,
          currency_code: region.currency_code,
          email: SEED_EMAIL,
          items: [
            {
              title: product.title,
              product_id: product.id,
              quantity,
              unit_price: unitPrice,
            },
          ],
          shipping_address: {
            first_name: "Seed",
            last_name: "Fake Orders",
            address_1: "Calle 1 #100",
            city: "La Habana",
            country_code: countryCode,
          },
        } as any,
      });

      logger.info(`Orden creada: ${product.title} x${quantity}`);
    }
  }

  // Populate product_sales_count immediately, without waiting for the cron —
  // same aggregation + upsert the daily job runs.
  const unitsSoldByProduct = await computeUnitsSoldByProduct(query);
  const salesCounts = Array.from(unitsSoldByProduct.entries()).map(
    ([product_id, units_sold]) => ({ product_id, units_sold })
  );

  await upsertProductSalesCountsWorkflow(container).run({
    input: { salesCounts },
  });

  logger.info(
    `product_sales_count recalculado: ${salesCounts.length} producto(s) con ventas.`
  );
}
